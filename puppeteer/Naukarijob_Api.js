import axios from 'axios';
import { SendMail } from '../controller/Controller.js';

const get_jobs = async (data)=>{
    try {
    const headers = {
                    "accept": "application/json",
                    "accept-language": "en-US,en;q=0.9",
                    "appid": "109",
                    "systemid": "Naukri",
                    "clientid": "d3skt0p",
                    "content-type": "application/json",
                    "referer": "https://www.naukri.com/front-end-backend-development-jobs?k=front%20end%2C%20backend%20development",
                    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
                    // IMPORTANT: paste the exact cookie string from your current browser session
                    "cookie": "test=naukri.com; _t_us=...; ak_bmsc=...; bm_sv=...; jd=...; ...",
                    // optional browser-like headers
                    "sec-ch-ua": '"Not;A=Brand";v="99", "Brave";v="139", "Chromium";v="139"',
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": '"Windows"',
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
     };  
    const url = await generate_url(data);
    const res = await axios.get(url, { headers, timeout: 10000, validateStatus: (s) => s === 200 });
    console.log(res.data.jobDetails);
    const job_data = await res.data.jobDetails;
    const job_length = parseInt(data.jobnumber)
    const filter_jobdata = [];
     if(job_data.length>0 && job_data.length >= job_length){
        job_data.forEach((e,index)=>{
            let link = `https://www.naukri.com${e.jdURL}`  
            let title = e.title;
            let companyName = e.companyName
            let location =""
            e.placeholders.forEach((e)=>{
                if(e.type=="location"){
                    location = e.label
                }
            })
            if(location==""){
                location = "N/A"
            }
            filter_jobdata.push({
            link:link,
            title:title,
            companyName:companyName,
            location:location
            })
        })
         if(job_length>filter_jobdata.length){
            SendMail(filter_jobdata,data);
            }else{
                const sampleJobs = filter_jobdata.slice(0, job_length);
                await SendMail(sampleJobs,data)
            }
        return {success:true}
     }else{
        console.log("no jobs found");
        return {success:false}
     }
    return {success:false}
    } catch (error) {
        console.log(error)
        return {success:false}
    }
}


const generate_url = async (data)=>{
    // const url = https://www.naukri.com/jobapi/v3/search?noOfResults=20&urlType=search_by_key_loc&searchType=adv&location=delhi%2C%20banglore&keyword=frontend%20developer%20intern%2C%20backend%20developer%20intern&sort=f&pageNo=1
    //get jobstitle
    let jobs_title ="";
    if(data.jobtype=="Full-time"){
        for(let i=0;i<data.jobtitle.length;i++){
            const formattedJobTitle = data.jobtitle[i].toLowerCase().replace(/\s+/g, "%20");
            jobs_title+=`${formattedJobTitle}%2C`;
        }
    }else{
        for(let i=0;i<data.jobtitle.length;i++){
            const intern_title = `${data.jobtitle[i]} intern`
            const formattedJobTitle = intern_title.toLowerCase().replace(/\s+/g, "%20");
            jobs_title+=`${formattedJobTitle}%2C`;
        }
    }

    let job_cities = "";
    for(let i=0;i<data.joblocation.length;i++){
        if(data.joblocation[i] !="Remote"){
            const formattedJobLoc = data.joblocation[i].toLowerCase().replace(/\s+/g, "%20");
            job_cities += `${formattedJobLoc}%2C`;
        }
    }

    let job_exp="";
    if(data.exp == "Fresher" || data.jobtype == "Internship" ){
        job_exp="0"
    }else{
        job_exp=data.exp[0]
    }

    let url =``

    if(data.joblocation.length>1 && data.joblocation.includes("Remote")){
        url = ` https://www.naukri.com/jobapi/v3/search?noOfResults=20&urlType=search_by_key_loc&searchType=adv&location=${job_cities}&keyword=${jobs_title}&sort=f&pageNo=1&experience=${job_exp}`
    }
    else if(data.joblocation.length>1 && !data.joblocation.includes("Remote")){
        url = ` https://www.naukri.com/jobapi/v3/search?noOfResults=20&urlType=search_by_key_loc&searchType=adv&location=${job_cities}&keyword=${jobs_title}&sort=f&pageNo=1&experience=${job_exp}&wfhType=0`
    }
    else if(data.joblocation.length==1 && data.joblocation.includes("Remote")){
        url = ` https://www.naukri.com/jobapi/v3/search?noOfResults=20&urlType=search_by_key_loc&searchType=adv&location=Remote&keyword=${jobs_title}&sort=f&pageNo=1&experience=${job_exp}&wfhType=2`
    }
    console.log(url)
    return url;
}


export const get_naukarijob = async (data)=>{
    try {
        const result = await get_jobs(data);
        return result;
    } catch (error) {
        console.log(error)
        return {success:false}
    }

}
