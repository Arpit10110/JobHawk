import express from "express"
import { config } from "dotenv"
import router from "./router/router.js"
import cors from "cors"
config()
const app = express()
app.use(cors({
    origin:"*",
    methods:["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(router)
export default app