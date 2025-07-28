import express from "express";
import dotenv from "dotenv";
import userRouter from "app";

dotenv.config();

const app = express();
const port = process.env.ME_SERVICE_PORT;

app.use(userRouter);

app.listen(port, () => {
  console.log(`Me API Server is Listining on port ${port}`);
});
