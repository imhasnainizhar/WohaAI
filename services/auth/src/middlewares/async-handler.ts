import { Request, Response, NextFunction } from "express";
import { InternalServerError, ServiceError } from "@packages/errors";

export const asyncHandler =
  (
    handler: (req: Request, res: Response, next: NextFunction) => Promise<any>
  ) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await handler(req, res, next);
      } catch (err: any) {

        // If the service already wrapped it — pass through
        // Service errors are thrown by services
        if (
          err instanceof ServiceError ||
          (
            err.errors &&
            err.statusCode !== 500
          )
        ) {
          return next(err);
        }

        // Otherwise
        return next(
          new InternalServerError(err)
        )
      }
    };
