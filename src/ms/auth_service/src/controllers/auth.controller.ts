import { Request, Response } from "express";
import { signupService } from "@services/index";
import { signinService } from "@services/index";
import signoutService from "@services/signout.service";
import { refreshTokenService } from "@services/index";
import { sendResponse } from "@utils/api_response";

export async function signupController(req: Request, res: Response) {
  try {
    await signupService(req, res);
  } catch (err) {
    return sendResponse({
      res,
      success: false,
      message: "Unexpected server error during signup",
      statusCode: 500,
      errorType: "internal_server_error",
      path: req.path,
    });
  }
}

export async function signinController(req: Request, res: Response) {
  try {
    await signinService(req, res);
  } catch (err) {
    return sendResponse({
      res,
      success: false,
      message: "Unexpected server error during signin",
      statusCode: 500,
      errorType: "internal_server_error",
      path: req.path,
    });
  }
}

export async function signoutController(req: Request, res: Response) {
  try {
    // Call your service function and await its result
    await signoutService(req, res);
    // The service already sends the response via sendResponse,
    // so you don't need to do res.json here
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function refreshTokenController(req: Request, res: Response) {
  try {
    await refreshTokenService(req, res);
  } catch (err) {
    return sendResponse({
      res,
      success: false,
      message: "Unexpected server error during token refresh",
      statusCode: 500,
      errorType: "internal_server_error",
      path: req.path,
    });
  }
}
