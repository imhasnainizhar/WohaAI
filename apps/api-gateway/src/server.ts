import Fastify, { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import httpProxy from '@fastify/http-proxy';
import cookie from '@fastify/cookie';
import "@fastify/cookie";
import cors from '@fastify/cors';
import gatewayConfig from '../../../packages/config/gateway.json';
import tokenNames from '../../../packages/config/token-names.json';
import { env } from '@wohaai/env-ts';
import { mcpGatewayLogger as logger } from '@wohaai/telemetry';
import { verifyJwtToken } from '@wohaai/security/jwt';

const fastify: FastifyInstance = Fastify({
    logger: {
        level: env.LOG_LEVEL || 'info',
    },
    bodyLimit: 10 * 1024 * 1024, // 10MB
});

// Register plugins
fastify.register(cookie);

// Register CORS with credentials support
fastify.register(cors as any, {
    origin: env.NODE_ENV === 'production' ? env.CLIENT_ORIGIN : true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
});

interface GatewayRoute {
    path: string;
    service: string;
    target: string;
    requiresAuth: boolean;
    methods: string[];
}

interface GatewayConfig {
    routes: GatewayRoute[];
    security: {
        jwtSecret: string;
        tokenHeader: string;
        tokenPrefix: string;
    };
}

const config = gatewayConfig as GatewayConfig;

// Token verification middleware
async function verifyAccessToken(request: FastifyRequest, reply: FastifyReply) {
    const accessTokenCookieName = tokenNames.ACCESS_TOKEN;
    const token = request.cookies[accessTokenCookieName];

    if (!token) {
        logger.error('Access token not found in cookies');
        return reply.code(401).send({ error: 'Unauthorized' });
    }

    const secret = env[config.security.jwtSecret as keyof typeof env] as string;
    if (!secret) {
        logger.error(`JWT secret not configured: ${config.security.jwtSecret}`);
        return reply.code(500).send({ error: 'Server configuration error' });
    }

    try {
        const payload = verifyJwtToken({ token, secret });
        // BUG FIX 3: Was `'...' + { userId: payload.sub }` → produces "[object Object]".
        // Use a structured log call instead.
        logger.debug(`Token verified successfully for user: ${payload.sub}`);
    } catch (error) {
        logger.error(`Token verification failed: ${error}`);
        return reply.code(401).send({ error: 'Invalid token' });
    }
}

// onRequest hooks run in registration order. The cookie plugin populates
// request.cookies from request.headers.cookie. After that, this hook ensures
// the cookie header is cleanly rebuilt and set so it's ready for auth checks
// and upstream forwarding — regardless of any cookie plugin internals.
fastify.addHook('onRequest', async (request) => {
    if (request.cookies && Object.keys(request.cookies).length > 0) {
        const cookieHeader = Object.entries(request.cookies)
            .map(([name, value]) => `${name}=${value}`)
            .join('; ');
        request.headers['cookie'] = cookieHeader;
        logger.debug(`Forwarding cookie header for ${request.url}: ${cookieHeader}`);
    }
});

// Setup routes from config
for (const route of config.routes) {
    const targetUrl = env[route.target as keyof typeof env] as string;

    logger.info(`Route configuration: ${route.path}`);
    logger.info(`Target env var: ${route.target}`);
    logger.info(`Target URL: ${targetUrl}`);
    logger.info(`Requires auth: ${route.requiresAuth}`);

    if (!targetUrl) {
        logger.error(`Target URL not configured for route ${route.path}: ${route.target}`);
        continue;
    }

    logger.info(`Setting up route: ${route.path} -> ${targetUrl} (auth: ${route.requiresAuth})`);

    // Apply auth hook BEFORE registering the proxy for this route
    if (route.requiresAuth) {
        fastify.addHook('onRequest', async (request, reply) => {
            if (request.url.startsWith(route.path)) {
                logger.info(`Auth check for: ${request.url}`);
                await verifyAccessToken(request, reply);
            }
        });
    }

    fastify.register(httpProxy as any, {
        upstream: targetUrl,
        prefix: route.path,
        replyOptions: {
            // @fastify/reply-from (used internally by httpProxy) forwards most
            // headers by default, but the cookie header can be dropped or
            // overwritten depending on the version and config. Being explicit
            // here makes the forwarding reliable regardless of library internals.
            rewriteRequestHeaders: (_req: FastifyRequest, headers: Record<string, string>) => {
                const cookieHeader = _req.headers['cookie'];
                if (cookieHeader) {
                    headers['cookie'] = cookieHeader;
                }
                // Ensure the upstream knows the real client origin
                const forwarded = _req.headers['x-forwarded-for'];
                if (forwarded) {
                    headers['x-forwarded-for'] = Array.isArray(forwarded)
                        ? forwarded.join(', ')
                        : forwarded;
                }
                return headers;
            },
            // This runs on RESPONSE headers coming back from upstream.
            // We only strip 'host' — Set-Cookie and all other headers
            // pass through unchanged so the browser receives them correctly.
            rewriteHeaders: (headers: Record<string, string | string[] | undefined>) => {
                delete headers['host'];
                return headers;
            },
        },
    });
}

// Health check endpoint
fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
});

// Start the server
(async () => {
    try {
        const port = env.API_GATEWAY_PORT;
        await fastify.listen({ port, host: '0.0.0.0' });
        logger.info(`🚀 API Gateway running on port ${port}`);
    } catch (err) {
        logger.error(`Failed to start API Gateway: ${err}`);
        process.exit(1);
    }
})();