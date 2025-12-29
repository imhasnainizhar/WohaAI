import type { NextApiRequest, NextApiResponse } from "next";

type ResponseData = {
  usernameExists: boolean;
  emailExists: boolean;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ usernameExists: false, emailExists: false });
  }

  // Get data from request body
  const { username, email } = req.body;

  console.log("Received signup check:", { username, email });

  // MOCK LOGIC: always say username and email do NOT exist
  const response: ResponseData = {
    usernameExists: false,
    emailExists: false,
  };

  res.status(200).json(response);
}
