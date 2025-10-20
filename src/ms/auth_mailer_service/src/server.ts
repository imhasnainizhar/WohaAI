import app from "./app";
import { env } from "@config/env.config";

const PORT = env.AUTH_MAILER_SERVICE_PORT;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
