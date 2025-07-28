import express from "express";
import bodyParser from "body-parser";
import signupCheckRoute from "app"; // path to the file above

const app = express();
const port = process.env.SIGNUP_VALIDATOR_PORT;

app.use(bodyParser.json());
app.use(signupCheckRoute);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
