import express from 'express';
import logoutRoute from './app';

const app = express();
const port = process.env.SIGNOUT_SERVICE_PORT || 3000;

app.use(logoutRoute);

app.listen(port, () => {
  console.log(`Signout API Server is Listining on ${port}` );
});
