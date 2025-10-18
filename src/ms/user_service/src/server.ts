import app from "@app"
import { env } from "@config/env.config";

const PORT = env.USER_SERVICE_PORT

app.listen(PORT, () => {
    console.log(`✅ User Service is running on ${PORT}`)
})