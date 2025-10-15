import express from 'express';
import verifyRoute from './handler';
import bodyParser from 'body-parser';

const app = express();
const port = process.env.VERIFY_USER_PORT || 3000;

app.use(bodyParser.json()); 

app.use(verifyRoute);

app.listen(port, () => {
  console.log(`✅ Verify User API Server is Listining on ${port}`);
});
