import app from "./app.js";
import "./cron/jobCron.js"
import { connectdb } from "./db/db.js";
connectdb();
app.listen(process.env.PORT ,()=>{
    console.log(`Server is running on port ${process.env.PORT}`);
})