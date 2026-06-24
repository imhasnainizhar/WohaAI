import { FastifyReply } from 'fastify';
import { HttpResponse } from '../response';
import { CookieOptions, Cookie, serializeCookie } from '../cookie';

export class FastifyAdapter implements HttpResponse {
    constructor(private readonly reply: FastifyReply) { }
    status(code: number): this {
        this.reply.status(code);
        return this;
    }
    json(payload: unknown): this {
        this.reply.send(payload);
        return this;
    }
    setCookie?(cookie: Cookie) {
        const serialized =
            serializeCookie(cookie);

        const current =
            this.reply.getHeader(
                "Set-Cookie"
            );

        if (!current) {
            this.reply.header(
                "Set-Cookie",
                [serialized]
            );
        } else {
            this.reply.header(
                "Set-Cookie",
                [
                    ...(Array.isArray(current)
                        ? current
                        : [String(current)]),
                    serialized,
                ]
            );
        }
        return this;
    }
}
