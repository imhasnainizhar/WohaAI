import express from 'express';

const router = express.Router();

router.post('/', (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });

  return res.status(200).json({ ok: true });
});

export default router;