import app from "./app.js";
import "./cron/jobCron.js"
app.listen(process.env.PORT ,()=>{
    console.log(`Server is running on port ${process.env.PORT}`);
})