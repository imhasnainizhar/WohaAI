// server.ts or app.ts
import express from 'express';
import signupRoute from 'app';
import cookieParser from 'cookie-parser';

const app = express();
const port = process.env.SIGNUP_SERVICE_PORT;

app.use(express.json());
app.use(cookieParser());

app.use(signupRoute);

app.listen(port, () => console.log(`Signup API Server is Listining on ${port}`));
