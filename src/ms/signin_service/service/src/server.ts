import express from 'express';
import cookieParser from 'cookie-parser';
import signInRoute from './handler';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
const port = process.env.SIGNIN_SERVICE_PORT;

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());

// CORS Setup
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:8000"
];


app.use(cors({
  origin: function(origin, callback){
    // Allow requests with no origin (like mobile apps, curl)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = `The CORS policy for this site does not allow access from the specified origin.`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  credentials: true
}));

app.use(signInRoute);

app.listen(port, () => {
  console.log(`✅ Signin API Server is listening on port: ${port}`);
});
