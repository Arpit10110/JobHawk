import { naukar_scraper } from "../puppeteer/Naukari_Jobs.js";
import {SavedAlertModel} from "../model/SavedAlertModel.js"
import { PlanModel } from "../model/PlanModel.js";
//Scrapers
import { get_foundit_jobs } from "../puppeteer/foundit_job.js";
import { get_instahyre_jobs } from "../puppeteer/instahyre_job.js";
import { internshala_scraper } from "../puppeteer/internshalla_job.js";
import { internshala_scraper_cherrio } from "../puppeteer/internshalla_cherrio.js";
import { get_naukarijob } from "../puppeteer/Naukarijob_Api.js";

export const dbchecker = async () => {
  try {
    // Fetch job forms that are active
    const jobForms = await SavedAlertModel.find({
      status: "active",
    });

    const now = new Date();
    const freshJobForms = [];

    for (const jobform of jobForms) {
      if (jobform.planexpiryDate.getTime() < now.getTime()) {
        jobform.status = "expired";
        await jobform.save();
        await PlanModel.updateOne(
          { plan_user_id: jobform.user_id },
          { $set: { plan_status: "expired" } }
        );
      } else {
        freshJobForms.push(jobform); // still active
      }
    }


    const todays_date = now;
    console.log(`Today's date: ${todays_date}`);


    for (const i of freshJobForms) {
      // Check if lastSentAt is null or not from today
      if (i.lastSentAt==null || i.lastSentAt.getDate() !== todays_date.getDate()) {
        console.log(`#### Processing job form: ${i._id} #####`);
        const currentHour = new Date().getHours();
        const currentMinute = new Date().getMinutes();
        const formHour = parseInt(i.hrtime);
        const formAmPm = i.ampm.toLowerCase();
        const form24hr = formAmPm === "pm"
        ? (formHour === 12 ? 12 : formHour + 12)
        : (formHour === 12 ? 0 : formHour);

        // Check if the form's scheduled time is earlier or equal to the current time
        if (form24hr <= currentHour) {
          console.log(`Scraping job form: for jobId-${i._id} at ${currentHour}:${currentMinute} ${i.ampm}`);
          if(i.jobportal=="Foundit.in"){
            const result =await get_foundit_jobs(i)
            if(result.success){
              await SavedAlertModel.updateOne({_id:i._id},{$set:{lastSentAt:new Date()}})
            }
          }
          if(i.jobportal=="Instahyre.com"){
            const result =await get_instahyre_jobs(i);
            if(result.success){
              await SavedAlertModel.updateOne({_id:i._id},{$set:{lastSentAt:new Date()}})
            }
          }
          if(i.jobportal=="Internshala.com"){
            const result =await internshala_scraper_cherrio(i);
            if(result.success){
              await SavedAlertModel.updateOne({_id:i._id},{$set:{lastSentAt:new Date()}})
            }
          }
          if(i.jobportal=="Naukari.com"){
            const result =await get_naukarijob(i)
            if(result.success){
              await SavedAlertModel.updateOne({_id:i._id},{$set:{lastSentAt:new Date()}})
            }
          }
          // if(i.jobportal=="LinkedIn.com"){
          //   await linkedin_scraper(i)
          //   const result =await Foundit_scraper(i)
          //   if(result.success){
          //     await SavedAlertModel.updateOne({_id:i._id},{$set:{lastSentAt:new Date()}})
          //   }
          // }
        
        }else{
          console.log(`Skipping job form: ${i._id} as it is scheduled for a later time.`);
        }
      }else{
        console.log(`Skipping job id ${i._id}.`);
      }
    }

  } catch (error) {
    console.error("❌ Error checking the database:", error.message);
  }
};



// https://www.instahyre.com/api/v1/job_search?company_size=0&isLandingPage=true&jobLocations=Work+From+Home&jobLocations=Delhi&jobLocations=Bangalore&job_type=1&skills=backend+developer&skills=frontend+developer&skills=full+stack+developer&years=1

// https://www.instahyre.com/api/v1/job_search?company_size=0&isLandingPage=true&jobLocations=Work+From+Home&jobLocations=Delhi&jobLocations=Bangalore&job_type=2&skills=frontend+developer&skills=backend+developer&skills=full+stack+developer&years=1