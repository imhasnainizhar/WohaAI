import { userLogger } from "@wohaai/telemetry";
import app from "./app"
import { env } from "@wohaai/env-ts";



const PORT = env.USER_SERVICE_PORT

app.listen(PORT, () => {
    userLogger.info(`✅ User Service is running on ${PORT}`)
})