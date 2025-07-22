import cron from "node-cron";
import { SendMail } from "../controller/Controller.js";
import { dbchecker } from "../controller/jobchecker.js";
import { internshala_scraper } from "../puppeteer/internshalla_job.js";

cron.schedule("*/10 * * * *", async () => {
//   SendMail()
    // console.log("Checking the db to send emails");
    try {
        console.log("Cron job is running every 2 minutes");
        await dbchecker();
        //  await internshala_scraper()
        
    } catch (error) {
        console.error("Error during cron job execution:", error);
    }
});
