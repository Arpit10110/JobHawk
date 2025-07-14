import JobForm from "../model/jobform_model.js";
import { naukar_scraper } from "../puppeteer/Naukari_Jobs.js";

export const dbchecker = async () => {
    try {
        console.log("Checking the database for job forms...");

        // Fetch job forms that are active 
        const jobForms = await JobForm.find({
            status: "active",
        })
        
        const todays_date = new Date();
       
        jobForms.forEach(i => {
            if(i.lastSentAt == null || i.lastSentAt.getDate() !== todays_date.getDate()){
                // scraping the jobs from naukari 
                console.log(`Job form with ID ${i._id} is active and needs to be processed.`);
                naukar_scraper(i);
            }   
        });

        console.log(jobForms)
      
    } catch (error) {
        console.error("❌ Error checking the database:", error.message);
    }
} 