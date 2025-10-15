import express from "express";
import userRouter from "./handler";


const app = express();
const port = process.env.ME_SERVICE_PORT;

app.use(userRouter);

app.listen(port, () => {
  console.log(`✅ User API Server is Listining on port ${port}`);
});
