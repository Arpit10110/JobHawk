import cron from "node-cron";
import { SendMail } from "../controller/Controller.js";
import { dbchecker } from "../controller/jobchecker.js";

cron.schedule("* * * * *", async () => {
//   SendMail()
    console.log("Checking the db to send emails");
    dbchecker();
});
