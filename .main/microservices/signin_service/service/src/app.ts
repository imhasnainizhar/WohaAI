import express from 'express';
import { signInSchema } from '@utils/signin_validation_schema';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import cookieParser from 'cookie-parser';
import { prisma } from '@utils/prisma_client';

const router = express.Router();

type SignInInput = z.infer<typeof signInSchema>;

router.post('/api/signin', async (req, res) => {
  try {
    const rawData = req.body;
    const signInReq = rawData.SignInData || rawData;

    const parsed: SignInInput = signInSchema.parse(signInReq);
    const { email, password, rememberMe = false } = parsed;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        error: 'email_not_exist',
        message: 'No user found with this email.',
        ok: false,
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHashed);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        error: 'wrong_password',
        message: 'Incorrect password.',
        ok: false,
      });
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) throw new Error('JWT_SECRET is not defined');

    const sessionExpirationTime = rememberMe ? '30d' : '1d';
    const cookieMaxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24; // in seconds

    const SessionToken = jwt.sign(
      {
        sub: user.userID,
        email: user.email,
        name: user.first_name,
      },
      JWT_SECRET,
      { expiresIn: sessionExpirationTime }
    );

    res.cookie('odeysent_session', SessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: cookieMaxAge * 1000, // in milliseconds
    });

    return res.status(200).json({
      message: 'Login successful',
      ok: true,
      user: {
        id: user.userID,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
      },
    });
  } catch (err: any) {
    console.error('Signin Error:', err.message);
    return res.status(500).json({
      error: 'internal_server_error',
      message: err?.message || 'Something went wrong',
      ok: false,
    });
  }
});

export default router;
