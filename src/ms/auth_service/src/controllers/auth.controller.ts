// src/controllers/auth.controller.ts
import { Request, Response } from "express";
import { signupService } from "@services/index";

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
