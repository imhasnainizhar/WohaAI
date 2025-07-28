import express from "express";
import bodyParser from "body-parser";
import verifyRouter from "app";

const app = express();
const port = process.env.CODE_MAILER_PORT;

app.use(bodyParser.json());
app.use(verifyRouter);

app.listen(port, () => {
  console.log(`Code Mailer API Server is Listining on port ${port}`);
});