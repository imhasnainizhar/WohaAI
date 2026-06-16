import { userLogger } from "@packages/observability";
import app from "./app"
import { env } from "@packages/env-ts";



const PORT = env.USER_SERVICE_PORT

app.listen(PORT, () => {
    userLogger.info(`✅ User Service is running on ${PORT}`)
})