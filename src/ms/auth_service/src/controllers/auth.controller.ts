// src/controllers/auth.controller.ts
import { Request, Response } from "express";
import { signupService } from "@services/index";
import { signinService } from "@services/index"
import signoutService from "@services/signout.service";

export async function signupController(req: Request, res: Response) {
  try {
    // Call your service function and await its result
    await signupService(req, res);
    // The service already sends the response via sendResponse,
    // so you don't need to do res.json here
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function signinController(req: Request, res: Response) {
  try {
    // Call your service function and await its result
    await signinService(req, res);
    // The service already sends the response via sendResponse,
    // so you don't need to do res.json here
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
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