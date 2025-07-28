import express from 'express';
import z from 'zod';
import { VerificationRequestSchema } from '@utils/verification_code_schema';
import redisClient from '@utils/redis_client';

const router = express.Router();

type VerificationRequest = z.infer<typeof VerificationRequestSchema>;

router.post('/api/verify', async (req, res) => {
  try {
    const reqBody = req.body;
    const parsedReq: VerificationRequest = VerificationRequestSchema.parse(reqBody);
    console.log(parsedReq);

    const { email, verificationCode } = parsedReq;

    const storedCode = await redisClient.get(`verify:${email}`);

    if (!storedCode) {
      return res.status(401).json({ EXPIRED_CODE: true });
    }

    if (storedCode !== verificationCode) {
      return res.status(400).json({ INVALID_CODE: true });
    }

    await redisClient.del(`verify:${email}`);

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Verification failed:', error);
    return res.status(400).json({ error: true });
  }
});

export default router;
