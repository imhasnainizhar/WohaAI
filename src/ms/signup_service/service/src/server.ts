import express, { Response, Request, NextFunction } from 'express';
import signupRoute from './handler';
import cookieParser from 'cookie-parser';

const app = express();
const port = process.env.SIGNUP_SERVICE_PORT || 3000;

app.use(express.json());
app.use(cookieParser());

app.use(signupRoute);

app.listen(port, () => console.log(`✅ Signup API Server is Listining on ${port}`));
