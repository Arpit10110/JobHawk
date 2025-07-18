import cron from "node-cron";
import { SendMail } from "../controller/Controller.js";
import { dbchecker } from "../controller/jobchecker.js";

cron.schedule("*/2 * * * *", async () => {
//   SendMail()
    // console.log("Checking the db to send emails");
    try {
        console.log("Cron job is running every 2 minutes");
        await dbchecker();
    } catch (error) {
        console.error("Error during cron job execution:", error);
    }
});
