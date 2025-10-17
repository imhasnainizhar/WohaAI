import express from "express";
import bodyParser from "body-parser";
import verifyRouter from "./handler";
import cors from "cors";

const app = express();
const port = process.env.CODE_MAILER_PORT;

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

app.use(bodyParser.json());
app.use(verifyRouter);

app.listen(port, () => {
  console.log(`✅ Code Mailer API Server is Listining on port ${port}`);
});