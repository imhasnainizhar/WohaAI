import express from "express";
import userRouter from "./app";


const app = express();
const port = process.env.ME_SERVICE_PORT;

app.use(userRouter);

app.listen(port, () => {
  console.log(`Me API Server is Listining on port ${port}`);
});
