import app from "@app";
import { env } from "@config/env";

const AUTH_SERVICE_PORT = env.AUTH_SERVICE_PORT;

app.listen(AUTH_SERVICE_PORT, () => {
  console.log(`🚀 Auth Service running on port ${AUTH_SERVICE_PORT}`);
});
