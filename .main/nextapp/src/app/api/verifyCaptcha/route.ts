import { NextResponse, NextRequest } from 'next/server';

export async function POST(req : NextRequest) {
  const { captchaToken } = await req.json();
  const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY!;


  const verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${captchaToken}`;

  const captchaRes = await fetch(verifyURL, { 
    method: "POST", 
    headers: {"Content-Type": "application/x-www-form-urlencoded"}
  });
  const captchaResData = await captchaRes.json();

  if (captchaResData.success) {
    return NextResponse.json({ success: true }, { status: 200 })
  } else {
    return NextResponse.json({ success: false, });
  }
}