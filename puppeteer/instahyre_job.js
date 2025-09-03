import axios from "axios";
import { SendMail } from "../controller/Controller.js";

const get_job = async (data)=>{
    try {
        console.log("----Starting Instahyre job Scraping----")
        // set the skills
        let skills ="";
        for(let i=0;i<data.jobtitle.length;i++){
            const formattedJobTitle = data.jobtitle[i].toLowerCase().replace(/\s+/g, "+");
            skills += `&skills=${formattedJobTitle}`
        }
        let job_cities = "";
        for(let i=0;i<data.joblocation.length;i++){
            if(data.joblocation[i]=="Remote"){
                job_cities +="&jobLocations=Work+From+Home"
            }else{
                const formattedJobLoc = data.joblocation[i].replace(/\s+/g, "%2F");
                job_cities += `&jobLocations=${formattedJobLoc}`
            }
        }
        let job_exp = "";
        if(data.exp == "Fresher" || data.jobtype == "Internship" ){
            job_exp+=`&years=0`
        }else{
            job_exp+=`&years=${data.exp[0]}`
        }
        let job_type = "";
        if(data.jobtype == "Full-time"){
            job_type+=`&job_type=1`
        }else{
            job_type+=`&job_type=0`
        }
          //url= https://www.instahyre.com/api/v1/job_search?company_size=0&isLandingPage=true&jobLocations=Work+From+Home&jobLocations=Delhi&job_type=1&skills=Frontend+developer&skills=backend+developer&skills=react.js&years=0
        let url = `https://www.instahyre.com/api/v1/job_search?company_size=0&isLandingPage=true${job_cities}${job_type}${skills}${job_exp}`

        console.log(url)
        const res = await axios.get(url)
        let job_data = await res.data.objects;
        let job_number = parseInt(data.jobnumber)
        if(job_data.length<=0  || job_data.length < job_number){
            console.log("no jobs found");
            return {success:false}
        }
        const filter_jobdata = [];
        job_data.forEach((e,index)=>{
            let link = e.public_url;
            let title = e.title;
            let companyName = e.employer.company_name;
            let location = e.locations || "N/A";
            filter_jobdata.push({
            link:link,
            title:title,
            companyName:companyName,
            location:location
            })
        })
        if(job_number>filter_jobdata.length){
            SendMail(filter_jobdata,data);
            }else{
            const sampleJobs = filter_jobdata.slice(0, job_number);
            await SendMail(sampleJobs,data)
            }
        console.log("----Ending FoundIT job Scraping----")
        return {success:true}
    } catch (error) {
        console.log(error)
        return {success:false}
    }
}

export const get_instahyre_jobs = async ( data)=>{
    console.log(data)
    const result = await get_job(data);
    return result;
}