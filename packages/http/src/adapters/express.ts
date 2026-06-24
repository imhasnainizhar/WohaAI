import { Response } from "express";
import { HttpResponse } from "../response";
import { CookieOptions, Cookie, serializeCookie } from "../cookie";

export class ExpressAdapter implements HttpResponse {
    constructor(private readonly response: Response) { }

    status(code: number): this {
        this.response.status(code);
        return this;
    }
    json(payload: unknown): this {
        this.response.json(payload);
        return this;
    }
    setCookie?(cookie: Cookie): this {
        const serialized =
            serializeCookie(cookie);

        const current =
            this.response.getHeader("Set-Cookie");

        if (!current) {
            this.response.setHeader(
                "Set-Cookie",
                [serialized]
            );
        } else {
            this.response.setHeader(
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