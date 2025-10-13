import express, { Response, Request, NextFunction } from 'express';
import signupRoute from './app';
import cookieParser from 'cookie-parser';

const app = express();
const port = process.env.SIGNUP_SERVICE_PORT || 3000;

app.use(express.json());
app.use(cookieParser());

app.use(signupRoute);
app.get("/", (req : Request, res : Response, Next : NextFunction) => {
    res.status(200).send("Hello Signer!")
});

app.listen(port, () => console.log(`✅ Signup API Server is Listining on ${port}`));
