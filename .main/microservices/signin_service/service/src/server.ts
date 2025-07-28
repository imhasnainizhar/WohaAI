import express from 'express';
import cookieParser from 'cookie-parser';
import signInRoute from 'app';

const app = express();
const port = process.env.SIGNIN_SERVICE_PORT;

app.use(express.json());
app.use(cookieParser());

app.use(signInRoute);

app.listen(port, () => {
  console.log(`Signin API Server is Listining on :${port}`);
});
