import { ServiceResponse } from "@utils/service_response";

/**
 * A throwable wrapper around ServiceResponse, for use when you want
 * to short-circuit execution with a structured error response.
 */
export class ServiceException<T = unknown> extends Error {
  public readonly response: ServiceResponse<T>;

  constructor(response: ServiceResponse<T>) {
    super(response.message);
    this.name = "ServiceException";
    this.response = response;
    Object.setPrototypeOf(this, new.target.prototype);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
