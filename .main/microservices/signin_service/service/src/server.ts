import express from 'express';
import cookieParser from 'cookie-parser';
import signInRoute from './app';
import bodyParser from 'body-parser';

const app = express();
const port = process.env.SIGNIN_SERVICE_PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());

app.use(signInRoute);

app.listen(port, () => {
  console.log(`Signin API Server is listening on port: ${port}`);
});
