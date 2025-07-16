import JobForm from "../model/jobform_model.js";
import { naukar_scraper } from "../puppeteer/Naukari_Jobs.js";

export const dbchecker = async () => {
  try {
    console.log("Checking the database for job forms...");

    // Fetch job forms that are active
    const jobForms = await JobForm.find({
      status: "active",
    });

    const todays_date = new Date();
    console.log(`Today's date: ${todays_date}`);

    for (const i of jobForms) {
      // Check if lastSentAt is null or not from today
      if (i.lastSentAt==null || i.lastSentAt.getDate() !== todays_date.getDate()) {
        const currentHour = new Date().getHours();
        const currentMinute = new Date().getMinutes();
        const formHour = parseInt(i.hrtime);
        const formAmPm = i.ampm.toLowerCase();
        const form24hr = formAmPm === "pm"
        ? (formHour === 12 ? 12 : formHour + 12)
        : (formHour === 12 ? 0 : formHour);

        // Check if the form's scheduled time is earlier or equal to the current time
        if (form24hr <= currentHour) {
          console.log(`Scraping job form: ${i.jobtitle} at ${formHour}:${currentMinute} ${i.ampm}`);
        //   await naukar_scraper(i);
          i.lastSentAt = new Date();
          await i.save();
        }
      }else{
        console.log(`Skipping job id ${i._id}.`);
      }
    }

  } catch (error) {
    console.error("❌ Error checking the database:", error.message);
  }
};