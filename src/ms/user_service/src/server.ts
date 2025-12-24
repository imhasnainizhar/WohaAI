import app from "@app"
import { env } from "@config/env";

const PORT = env.USER_SERVICE_PORT

app.listen(PORT, () => {
    console.log(`✅ User Service is running on ${PORT}`)
})