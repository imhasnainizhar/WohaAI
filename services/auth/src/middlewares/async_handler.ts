import { Request, Response, NextFunction } from "express";
import { ServiceException } from "../internals/utils/response";

export const asyncHandler =
  (
    handler: (req: Request, res: Response, next: NextFunction) => Promise<any>
  ) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await handler(req, res, next);
      } catch (err: any) {

        // If the service already wrapped it — pass through
        // Service exceptions are thrown by services, controller are just to make calls to services
        if (
          err instanceof ServiceException ||
          (
            err.errors &&
            typeof err.response.statusCode === "number" &&
            err.statusCode !== 500
          )
        ) {
          return next(err);
        }

        // Otherwise, wrap unknown errors into a ServiceException
        return next(
          new ServiceException({
            success: false,
            statusCode: 500,
            message: "Internal server error",
            errorType: "internal_server_error",
          })
        );
      }
    };
