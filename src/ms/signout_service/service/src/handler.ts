import express from 'express';

const router = express.Router();

router.post('/', (req, res) => {
  try{
      res.cookie('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });

  console.log("🟢 Signed out Successfully")
  return res.status(200).json({ ok: true });
  } catch (err) {
    console.warn("🔴 Error:", err)
    console.warn("🔴 Signout failed")
  }

});

export default router;