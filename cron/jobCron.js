import cron from "node-cron";
import { SendMail } from "../controller/Controller.js";
import { dbchecker } from "../controller/jobchecker.js";

cron.schedule("*/10 * * * *", async () => {
//   SendMail()
    // console.log("Checking the db to send emails");
   await dbchecker();
    console.log("Cron job is running every 2 minutes");
});
