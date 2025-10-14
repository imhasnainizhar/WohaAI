import express from "express";
import bodyParser from "body-parser";
import verifyCaptchaRoute from "./app";

const app = express();
const port = process.env.VERIFY_CAPTCHA_PORT || 3000;

app.use(bodyParser.json());
app.use(verifyCaptchaRoute);

app.listen(port, () => {
  console.log(`Captch Verification API Server is Listining on ${port}`);
});
