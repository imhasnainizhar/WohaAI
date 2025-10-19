import dotenv from "dotenv";
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  USER_SERVICE_PORT: process.env.USER_SERVICE_PORT,
  DATABASE_URL: process.env.PRISMA_DATABASE_URL!,
  JWT_SECRET: process.env.JWT_SECRET!,
};
