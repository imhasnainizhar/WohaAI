 
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { signUpSchema } from '@lib/validators/signup-validation-schema';
import { prisma } from '@utils/prisma_client';

type SignUpInput = z.infer<typeof signUpSchema>;

export async function POST(request: NextRequest) {
  try {
    const signUpRequest = await request.json();
    const parsed: SignUpInput = signUpSchema.parse(signUpRequest);
    const { email } = parsed;
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (existingUser) {
      return NextResponse.json({ emailExist : true });
    }
    return NextResponse.json({ ok: true });

  } catch {
    return NextResponse.json(
      { error: true },
    );
  }
}
