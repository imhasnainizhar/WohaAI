import express, { Request, Response, NextFunction } from "express";
import { createProxyMiddleware, Options } from "http-proxy-middleware";
import cors from "cors";
import fs from "fs";
import path from "path";
import process from "process";

const app = express();
const PORT = process.env.API_GATEWAY_PORT;

// Load routes from routes.json if available
const routesPath = path.resolve(process.cwd(), "routes.json");
let routes: { path: string; target: string }[] = [];

if (fs.existsSync(routesPath)) {
  try {
    const fileContent = fs.readFileSync(routesPath, "utf-8");
    const parsed = JSON.parse(fileContent);
    if (Array.isArray(parsed)) {
      routes = parsed;
      console.log(`✅ Loaded ${routes.length} routes from routes.json`);
    } else {
      console.error("❌ Invalid routes.json format. Expected an array.");
      process.exit(1);
    }
  } catch (err) {
    console.error("❌ Error reading routes.json:", err);
    process.exit(1);
  }
}

// Validate required env
if (!process.env.API_GATEWAY_PORT) {
  console.error("❌ Missing required env: API_GATEWAY_PORT");
  process.exit(1);
}

// CORS setup
const allowedOrigins = [
  "http://localhost:3000"  // add this
];

app.use(cors({
  origin: function(origin, callback){
    // Allow requests with no origin (like mobile apps, curl)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = `The CORS policy for this site does not allow access from the specified origin.`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  credentials: true
}));

// Error logger
const logErrorHandler = (route: string) => (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(`❌ [${route}] Proxy error:`, err.message);
  if (!res.headersSent) {
    res.status(500).json({ error: `Proxy error at ${route}: ${err.message}` });
  }
};

// Proxy setup function
const proxy = (routePath: string, target: string) => {
  const cleanPath = routePath.trim();
  const normalizedPath = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;

  console.log(`🔗 Proxy route: ${normalizedPath} → ${target}`);

  app.use(
    normalizedPath,
    createProxyMiddleware({
      target,
      changeOrigin: true,
      logLevel: "warn",
      pathRewrite: (reqPath) => reqPath.replace(normalizedPath, ""),
      onError: logErrorHandler(normalizedPath),
    } as Options)
  );
};

// Register routes
if (routes.length === 0) {
  console.warn("‼️ No routes found.");
  console.log(routes);
} else {
  for (const { path: routePath, target } of routes) {
    try {
      if (!routePath || !target) {
        console.error(`❌ Skipping invalid route entry:`, { routePath, target });
        continue;
      }
      if (routePath.startsWith("http")) {
        console.error(
          `❌ Skipping invalid route: path looks like URL (${routePath}). You might've flipped path and target.`
        );
        continue;
      }
      proxy(routePath, target);
    } catch (err) {
      console.error(`❌ Error setting up proxy for ${routePath}:`, err);
      process.exit(1);
    }
  }
}

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: `The URL ${req.originalUrl} doesn't exist` });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ API Gateway running at http://localhost:${PORT}`);
});
