import cron from "node-cron";
import { dbchecker } from "../controller/jobchecker.js";

cron.schedule("*/1 * * * *", async () => {
    try {
        console.log("Cron job is running every 10 minutes");
        await dbchecker();
    } catch (error) {
        console.error("Error during cron job execution:", error);
    }
});
