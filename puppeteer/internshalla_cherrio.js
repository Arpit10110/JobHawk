 import axios from "axios";
 import * as cheerio from 'cheerio';
import { SendMail } from "../controller/Controller.js";

 
 const usingcherrio = async (url) => {
    try {
        const result = await axios.get(url);
        const $ = cheerio.load(result.data);

        // Select all job containers
        const jobContainers = $('.individual_internship');
        const jobs = [];

        // Helper: turn posted time into comparable minutes
        const postedTimeToMinutes = (postedStr) => {
            if (!postedStr) return Infinity;
            postedStr = postedStr.toLowerCase();

            if (postedStr.includes('just now') || postedStr.includes('few hour') || postedStr.includes('few min')) return 0;
            if (postedStr.includes('hour')) {
                const h = parseInt(postedStr.match(/(\d+)/)?.[1]);
                return h ? h * 60 : 0;
            }
            if (postedStr.includes('day')) {
                const d = parseInt(postedStr.match(/(\d+)/)?.[1]);
                return d ? d * 24 * 60 : 0;
            }
            if (postedStr.includes('minute') || postedStr.includes('min')) {
                const m = parseInt(postedStr.match(/(\d+)/)?.[1]);
                return m ? m : 0;
            }
            return Infinity;
        };

        jobContainers.each((index, elem) => {
            // Helper function to clean text
            const cleanText = (text) => !text ? 'N/A' : text.replace(/\s+/g, ' ').trim();

            // Company name
            let companyName = cleanText($(elem).find('.company_name').text()) ||
                cleanText($(elem).find('.company-name').text());
            if (companyName === 'N/A') {
                companyName = cleanText($(elem).find('.company').text()) ||
                    cleanText($(elem).find('h3').text()) ||
                    cleanText($(elem).find('h4').text());
            }

            // Job title and job link from anchor tag
            const jobAnchor = $(elem).find('a.job-title-href#job_title');
            const jobTitle = cleanText(jobAnchor.text());
            const jobHref = jobAnchor.attr('href');
            const applyLink = jobHref ? (jobHref.startsWith('http') ? jobHref : `https://internshala.com${jobHref}`) : 'N/A';

            // Location (all spans, map and join)
            let locations = [];
            $(elem).find('.locations span, .location span').each((i, locElem) => {
                const loc = cleanText($(locElem).text());
                if (loc && loc !== 'N/A' && loc !== ',') locations.push(loc);
            });
            let locationString = locations.length ? [...new Set(locations)].join(', ') : 'N/A';

            // Posted time (inside: div.color-labels > span, or .status-success > span)
            let postedTime = cleanText($(elem).find('.color-labels span').first().text());
            if (postedTime === 'N/A') {
                postedTime = cleanText($(elem).find('.status-success span').first().text());
            }

            // Add job if company name or title is present
            if (companyName !== 'N/A' || jobTitle !== 'N/A') {
                jobs.push({
                    companyName,
                    title: jobTitle,
                    link: applyLink,
                    location: locationString,
                    postedTime
                });
            }
        });

        // Sort jobs: most recent first
        jobs.sort((a, b) => postedTimeToMinutes(a.postedTime) - postedTimeToMinutes(b.postedTime));

        return { success: true, jobs };
    } catch (error) {
        return { success: false }
    }
};

 const get_internshalla_job = async (data) => {
    try {
         let jobtitle = [];

         for (let i = 0; i < data.jobtitle.length; i++) {
             if (data.jobtitle[i] == "Frontend Developer") {
                 jobtitle.push("frontend-development");
             } else if (data.jobtitle[i] == "Backend Developer") {
                 jobtitle.push("backend-development");
             } else if (data.jobtitle[i] == "Full Stack Developer") {
                 jobtitle.push("full-stack-development");
             } else if (data.jobtitle[i] == "React Developer") {
                 jobtitle.push("javascript-development");
             } else if (data.jobtitle[i] == "Node.js Developer") {
                 jobtitle.push("node-js-development");
             } else if (data.jobtitle[i] == "Software Engineer") {
                 jobtitle.push("software-development");
             } else if (data.jobtitle[i] == "Web Developer") {
                 jobtitle.push("web-development");
             } else if (data.jobtitle[i] == "UI/UX Designer") {
                 jobtitle.push("ui-ux-design");
             } else if (data.jobtitle[i] == "Data Analyst") {
                 jobtitle.push("analytics");
             } else if (data.jobtitle[i] == "Data Scientist") {
                 jobtitle.push("data-science");
             } else if (data.jobtitle[i] == "Machine Learning Engineer") {
                 jobtitle.push("machine-learning");
             } else if (data.jobtitle[i] == "Android Developer") {
                 jobtitle.push("android-app-development");
             } else if (data.jobtitle[i] == "iOS Developer") {
                 jobtitle.push("ios-app-development");
             } else if (data.jobtitle[i] == "DevOps Engineer") {
                 jobtitle.push("mlops-engineering");
             } else if (data.jobtitle[i] == "QA Engineer") {
                 jobtitle.push("quality-analyst");
             } else if (data.jobtitle[i] == "Manual Tester") {
                 jobtitle.push("software-testing");
             } else if (data.jobtitle[i] == "Automation Tester") {
                 jobtitle.push("software-testing");
             } else if (data.jobtitle[i] == "Python Developer") {
                 jobtitle.push("python-django-development");
             } else if (data.jobtitle[i] == "Java Developer") {
                 jobtitle.push("java-development");
             } else if (data.jobtitle[i] == "C++ Developer") {
                 jobtitle.push("programming");
             } else if (data.jobtitle[i] == "Flutter Developer") {
                 jobtitle.push("flutter-development");
             } else if (data.jobtitle[i] == "Cloud Engineer") {
                 jobtitle.push("cloud-computing");
             } else if (data.jobtitle[i] == "Cybersecurity Analyst") {
                 jobtitle.push("cyber-security");
             } else if (data.jobtitle[i] == "Database Administrator") {
                 jobtitle.push("database-building");
             } else if (data.jobtitle[i] == "Game Developer") {
                 jobtitle.push("game-development");
             } else if (data.jobtitle[i] == "Blockchain Developer") {
                 jobtitle.push("blockchain-development");
             } else if (data.jobtitle[i] == "Technical Support Engineer") {
                 jobtitle.push("customer-service");
             } else if (data.jobtitle[i] == "Business Analyst") {
                 jobtitle.push("market-business-research");
             } else if (data.jobtitle[i] == "Product Manager") {
                 jobtitle.push("product-management");
             } else if (data.jobtitle[i] == "Digital Marketing Executive") {
                 jobtitle.push("digital-marketing");
             } else if (data.jobtitle[i] == "Content Writer") {
                 jobtitle.push("content-writing");
             } else if (data.jobtitle[i] == "Graphic Designer") {
                 jobtitle.push("graphic-design");
             }
         }
         // Construct the URL based on job titles
         let jobtitle_url = ""
         if(data.jobtype=="Internship"){
             jobtitle_url=jobtitle.slice(0, 3).join(",") + "-internship";
         }else{
             jobtitle_url=jobtitle.slice(0, 3).join(",") + "-jobs";
         }
         console.log(`Job title URL: ${jobtitle_url}`);
         // getting the location and then converting to lowercase also in the form of url
 
         let location = [];
 
         for (let i = 0; i < data.joblocation.length; i++) {
             //converting to lowercase
             if(data.joblocation[i] != "Remote" ){
                 let low_loc = data.joblocation[i].toLowerCase();
                 location.push(low_loc);
             }
         }
 
         // Construct the URL based on locations
         let location_url = location.join(",");
 
     
         let exp_url = ""
 
         if(data.exp == "Fresher"){
             exp_url = "fresher"
         }else{
             exp_url = `experience-${data.exp[0]}`
         }
 
         let url =""
         if(data.jobtype == "Internship"){
             
             if(data.joblocation.includes("Remote") && data.joblocation.length>1  ){
                 url =  `https://internshala.com/internships/${jobtitle_url}-in-${location_url}/`
             }
             else if(data.joblocation.includes("Remote") && data.joblocation.length==1 && data.exp=="Fresher" ){
                 url =  `https://internshala.com/internships/${jobtitle_url}/work-from-home/`
             }
             else if(!data.joblocation.includes("Remote") && data.joblocation.length>=1 && data.exp=="Fresher" ){
                 url =  `https://internshala.com/internships/${jobtitle_url}-in-${location_url}/`
             }
             else if(data.joblocation.includes("Remote") && data.joblocation.length>1){
                 url =  `https://internshala.com/internships/${jobtitle_url}-in-${location_url}/work-from-home/`
             }
             else if(data.joblocation.includes("Remote") && data.joblocation.length==1){
                 url =  `https://internshala.com/internships/${jobtitle_url}/work-from-home/`
             }
             else if(!data.joblocation.includes("Remote") && data.joblocation.length>=1){
                 url =  `https://internshala.com/internships/${jobtitle_url}-in-${location_url}/`
             }
         }
         else{
                     if(data.joblocation.includes("Remote") && data.joblocation.length>1 && data.exp=="Fresher" ){
                         url =  `https://internshala.com/fresher-jobs/${jobtitle_url}-in-${location_url}/work-from-home/`
                     }
                     else if(data.joblocation.includes("Remote") && data.joblocation.length==1 && data.exp=="Fresher" ){
                         url =  `https://internshala.com/fresher-jobs/${jobtitle_url}/work-from-home/`
                     }
                     else if(!data.joblocation.includes("Remote") && data.joblocation.length>=1 && data.exp=="Fresher" ){
                         url =  `https://internshala.com/fresher-jobs/${jobtitle_url}-in-${location_url}/`
                     }
                     else if(data.joblocation.includes("Remote") && data.joblocation.length>1){
                         url =  `https://internshala.com/jobs/${jobtitle_url}-in-${location_url}/work-from-home/${exp_url}`
                     }
                     else if(data.joblocation.includes("Remote") && data.joblocation.length==1){
                         url =  `https://internshala.com/jobs/${jobtitle_url}/work-from-home/${exp_url}`
                     }
                     else if(!data.joblocation.includes("Remote") && data.joblocation.length>=1){
                         url =  `https://internshala.com/jobs/${jobtitle_url}-in-${location_url}/${exp_url}`
                     }
         }
         console.log(url)
        const result = await usingcherrio(url);
        if(result.success){
            const jobData =  result.jobs;
            if (jobData.length > 0) {
                // selevting only first 5 jobs for detailed logging and saving new variable
                let job_number = parseInt(data.jobnumber)
                const sampleJobs = jobData.slice(0, job_number);
                SendMail(sampleJobs,data);
                return {success:true}
            } else {
                console.log('No jobs were extracted. Check debug info above.');
                 return {success:false}
            }
        }else{
            return {success:false}
        }

    } catch (error) {
        return {success:false}
    }
}

export const internshala_scraper_cherrio = async (data) => {
  console.log("🚀 Starting internshala job scraping...");
  try {
    const result = await get_internshalla_job(data);
    return result;
  } catch (error) {
    console.error('❌ Error in internshala_scraper:', error);
    return {success:false}
  }
};
