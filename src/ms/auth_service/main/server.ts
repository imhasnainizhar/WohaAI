import app from "@app";
import { env } from "@config/env";

const PORT = env.AUTH_SERVICE_PORT;

app.listen(PORT, () => {
  console.log(`✅ Auth Service running on port ${PORT}`);
});