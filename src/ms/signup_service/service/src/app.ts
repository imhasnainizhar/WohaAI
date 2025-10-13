import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { signUpSchema } from '@utils/signup_validation_schema';
import { prisma } from '@utils/prisma_client';

const router = express.Router();

interface SignUpRequest {
  FirstName: string;
  LastName: string;
  Username: string;
  Password: string;
  ConfirmPassword: string;
}

router.post('/', async (req: Request, res: Response) => {
  console.log('🟢 [SIGNUP] Incoming request:', {
    headers: req.headers['content-type'],
    bodyKeys: Object.keys(req.body || {}),
  });

  try {
    const body: SignUpRequest = req.body;

    // 1️⃣ Validate input
    const parsed = signUpSchema.safeParse(body);
    if (!parsed.success) {
      console.warn('⚠️ [SIGNUP] Validation failed:', parsed.error.format());
      return res.status(400).json({
        ok: false,
        invalidInput: true,
        errors: parsed.error.format(),
      });
    }

    const { email, password, firstName, lastName, rememberMe } = parsed.data;

    console.log('✅ [SIGNUP] Input validated successfully for:', email);

    // 2️⃣ Check for existing user
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.warn('⚠️ [SIGNUP] Email already exists:', email);
      return res.status(409).json({
        ok: false,
        error: 'email_exists',
        message: 'An account with this email already exists.',
      });
    }

    // 3️⃣ Normalize names
    const userFirstName =
      firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
    const userLastName =
      lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase();

    // 4️⃣ Hash password
    console.log('🔐 [SIGNUP] Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5️⃣ Create user
    console.log('🧩 [SIGNUP] Creating user in database...');
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHashed: hashedPassword,
        userFirstName,
        userLastName,
      },
    });

    console.log('✅ [SIGNUP] User created with ID:', newUser.userID);

    // 6️⃣ Token setup
    const JWT_SECRET_KEY = process.env.JWT_SECRET;
    if (!JWT_SECRET_KEY) {
      console.error('❌ [SIGNUP] Missing JWT_SECRET in environment');
      throw new Error('Token Unavailable');
    }

    const sessionExpirationTime = rememberMe ? '30d' : '1d';
    const cookieMaxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24;

    // 7️⃣ Sign JWT
    console.log('🔑 [SIGNUP] Generating JWT session token...');
    const sessionToken = jwt.sign(
      {
        sub: newUser.userID,
        email: newUser.email,
        name: `${newUser.userFirstName} ${newUser.userLastName}`,
      },
      JWT_SECRET_KEY,
      { expiresIn: sessionExpirationTime }
    );

    // 8️⃣ Set cookie
    console.log('🍪 [SIGNUP] Setting session cookie...');
    res.cookie('woah_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: cookieMaxAge * 1000,
    });

    console.log('🚀 [SIGNUP] Completed successfully for:', email);

    return res.status(201).json({ ok: true });
  } catch (err: any) {
    console.error('❌ [SIGNUP] Error:', {
      message: err.message,
      stack: err.stack?.split('\n')[0],
      name: err.name,
    });

    return res.status(500).json({
      ok: false,
      error: 'internal_server_error',
      message: err.message || 'Something went wrong',
    });
  }
});

export default router;
