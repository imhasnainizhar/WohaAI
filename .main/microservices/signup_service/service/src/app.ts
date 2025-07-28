import { Request, Response} from 'express';
import express from 'express';
import { signUpSchema } from '@lib/signup_validation_schema';
import { prisma } from '@lib/prisma_client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/api/signup', async (req : Request, res : Response) => {
  try {
    const body = req.body;

    const parsed = signUpSchema.safeParse(body);
    if (!parsed.success) {
      return res.status(400).json({ invalidInput: true });
    }

    const { email, password, FirstName, LastName, rememberMe } = parsed.data;

    const first_name = FirstName.charAt(0).toUpperCase() + FirstName.slice(1).toLowerCase();
    const last_name = LastName.charAt(0).toUpperCase() + LastName.slice(1).toLowerCase();

    const hashedPassword = await bcrypt.hash(password, 10);

    const SignUpUser = await prisma.user.create({
      data: {
        email,
        passwordHashed: hashedPassword,
        first_name,
        last_name,
      },
    });

    const JWT_SECRET_KEY = process.env.JWT_SECRET;
    if (!JWT_SECRET_KEY) throw new Error('Token Unavailable');

    const sessionExpirationTime = rememberMe ? '30d' : '1d';
    const cookieMaxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24;

    const SessionToken = jwt.sign(
      {
        sub: SignUpUser.userID,
        email: SignUpUser.email,
        name: 'Woah',
      },
      JWT_SECRET_KEY,
      { expiresIn: sessionExpirationTime }
    );

    res.cookie('woah_session', SessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: cookieMaxAge * 1000,
    });

    return res.status(201).json({ ok: true });
  } catch (err: any) {
    console.error('Signup Error:', err.message);
    return res.status(500).json({
      error: 'internal_server_error',
      message: err?.message || 'Something went wrong',
      ok: false,
    });
  }
});

export default router;
