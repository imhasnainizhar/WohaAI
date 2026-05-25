import { Request, Response, NextFunction } from "express";
import { ServiceException } from "../helpers/response";
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
        // Service exceptions are thrown by services, controller are just to make calls to services
        if (
          err instanceof ServiceError ||
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
          new InternalServerError(err)
        )
      }
    };
