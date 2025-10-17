import express from "express";
import bodyParser from "body-parser";
import signUpValidator from "./handler";
import cors from "cors";

const app = express();
const port = process.env.SIGNUP_VALIDATOR_PORT;

app.use(bodyParser.json());
app.use(signUpValidator);

// CORS setup
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

app.listen(port, () => {
  console.log(`✅ Signup Validator is running on port ${port}`);
});
