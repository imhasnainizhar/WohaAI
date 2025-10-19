import nodemailer from "nodemailer";

export const mailTransporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT) || 587,
  secure: process.env.MAIL_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Optional: verify connection
mailTransporter.verify((error: any) => {
  if (error) {
    console.error("🛑 Mailer verification failed", error);
  } else {
    console.log("✅ Mailer is ready to send messages");
  }
});
