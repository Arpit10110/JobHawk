import express from "express"
import { config } from "dotenv"
import router from "./router/router.js"
config()
const app = express()
app.use(router)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
export default app