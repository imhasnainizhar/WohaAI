interface Cookie {
    name: string,
    value: string,
    options: {
        httpOnly: boolean,
        secure: boolean,
        sameSite: "lax" | "strict" | "none",
        path: string,
        maxAge: number
    }
}

// ServiceResponse Interface also exixts in /types directory so you can
// use that for specifying return type also...
// But this is a response class also used by service exception to throw service response,
// Throw and Return both hve same structure but a little bit different way of implementation.
// See docs for more information and contribute in Docs to help us :)
export class ServiceResponse<T> {

    readonly success: boolean;
    readonly statusCode: number;
    readonly message: string;
    readonly data?: T;
    readonly cookies?: Cookie[];
    readonly errorType?: string;
    readonly errors?: Record<string, string[]>;


    private constructor({
        success,
        statusCode,
        message,
        data,
        cookies,
        errorType,
        errors,

    }: {
        success: boolean,
        statusCode: number,
        message: string;
        data?: T,
        cookies?: Cookie[],
        errorType?: string;
        errors?: Record<string, string[]>;
    }) {
        this.success = success;
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.cookies = cookies;
        this.errorType = errorType;
        this.errors = errors;
    }

    // ✅ Factory method for success responses
    static success<T>(params: {
        success: true,
        statusCode: number;
        message: string;
        data?: T;
        cookies?: Cookie[];
    }): ServiceResponse<T> {
        return new ServiceResponse<T>({
            ...params,
        });
    };

    // ❌ Factory method for error responses
    static error<T>(params: {
        success: false,
        statusCode: number;
        message: string;
        errorType?: string;
        errors?: Record<string, string[]>;
    }): ServiceResponse<T> {
        return new ServiceResponse<T>({
            ...params,
        });

    };
}