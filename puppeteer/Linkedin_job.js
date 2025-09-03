import { linkedin_scraper } from "./Linkedin_scraper.js";
import { SendMail } from "../controller/Controller.js";
    const get_jobs = async(data)=>{
        try {

            let jobtitle = "";
            for(let i=0;i<data.jobtitle.length;i++){
                if(i==data.jobtitle.length-1){
                    jobtitle += data.jobtitle[i];
                }else{
                    jobtitle += data.jobtitle[i]+" , ";
                }
            }

             let joblocation = "";
             if(data.joblocation.length==1 && data.joblocation.includes("Remote")){
                joblocation="India";
             }
             else if(data.joblocation.includes("Remote")){
                 joblocation="India";
             }
             else{
                 for(let i=0;i<data.joblocation.length;i++){
                     if(i==data.joblocation.length-1){
                         joblocation += " "+data.joblocation[i];
                     }else{
                         joblocation += data.joblocation[i]+" ,";
                     }
                 }
             }

             let data_exp = parseInt(data.exp[0]);
             let exp = "";
             if(data_exp=="Fresher"){
                exp = "intership";
             }
             if(data_exp==1 && data.exp != "Fresher"){
                 exp = "entry level";
             }else if(data_exp<=3 && data_exp>=2){
                exp="associate"
             }else if(data_exp<=5 && data_exp>=4){
                exp="senior"
             }else if(data_exp<=7 && data_exp>=6){
                exp="director"
             }else if(data_exp<=9 && data_exp>=8){
                exp="executive"
             }

             let jobtype = "";
             if(data.jobtype=="Full-time"){
                 jobtype = "full time";
             }else if(data.jobtype=="Internship"){
                 jobtype = "internship";
             }




            const queryOptions = {
                keyword: jobtitle,
                location: joblocation,
                dateSincePosted: "past week",
                jobType: jobtype,
                remoteFilter: "site",
                experienceLevel: exp,
                limit: "15",
                sortBy: "recent",
                page: "0",
                has_verification: false,
                under_10_applicants: false,
              };
              const result = await linkedin_scraper(queryOptions);
              console.log("thi is result--> ",result); 

              const jobdata = [];
              result.data.forEach((jobs)=>{
                let location = jobs.location;
                let companyName = jobs.company;
                let title = jobs.position;
                let link = jobs.jobUrl;
                jobdata.push({companyName,title,link,location});
              })
              const data_job_number = parseInt(data.jobnumber);
              if(data_job_number>jobdata.length){
                SendMail(jobdata,data);
              }else{
               const sampleJobs = jobdata.slice(0, data_job_number);
                SendMail(sampleJobs,data);
              }
              return {success:true}
        } catch (error) {
            return {success: false}
        }
    }



export const getlinkedin_jobs = async (data) => {
  try {
    const result = await get_jobs(data);
    if(result.success){
        return {success:true}
    }else{
        return {success:false}
    }
  } catch (error) {
    console.log(error);
    return { success: false };
  }
};

