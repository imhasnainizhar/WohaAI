import express from "express";
import bodyParser from "body-parser";
import signUpValidator from "./handler";

const app = express();
const port = process.env.SIGNUP_VALIDATOR_PORT;

app.use(bodyParser.json());
app.use(signUpValidator);

app.listen(port, () => {
  console.log(`✅ Signup Validator is running on port ${port}`);
});
