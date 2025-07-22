import puppeteer from "puppeteer";
import { SendMail } from "../controller/Controller.js";

let browserInstance = null;
const isProd = process.env.NODE_ENV == 'production';

async function initializeBrowser() {
  if (!browserInstance) {
    const launchOptions = {
      headless: isProd ? "new" : false,
      defaultViewport: { width: 1440, height: 900 },
      protocolTimeout: 240000, // 4 minutes timeout
      args: isProd ? [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--window-size=1440,900',
        '--disable-http2',
        '--disable-features=VizDisplayCompositor',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ] : ['--start-maximized']
    };

    if (isProd) {
      launchOptions.executablePath = '/usr/bin/google-chrome-stable';
    }
    
    browserInstance = await puppeteer.launch(launchOptions);
  }
  return browserInstance;
}

const start_internshala_jobs = async (data) => {
    let browser = null;
    let page = null;
    try {
        browser = await initializeBrowser();
        page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1440, height: 900 });

        // Block heavy resources
        await page.setRequestInterception(true);
        const blocked = ['googletagmanager', 'doubleclick', 'googleads', 'facebook', 'analytics'];
        page.on('request', req => {
        try {
            const url = req.url();
            if (blocked.some(p => url.includes(p))) {
            return req.abort();
            }
            req.continue();
        } catch (err) {
            console.log('Request interception error:', err.message);
        }
        });
    
        console.log('=== STARTING Internshala JOB SCRAPING ===');

        // getting the job title and then converting to lowercase also in the form of url

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

        await page.goto(url, {
            waitUntil: "domcontentloaded",
            timeout: 60000
        });

        // Handle ad popup
        try {
            const close_ad = await page.waitForSelector('i[id="close_popup"]', { timeout: 5000 });
            if(close_ad) {
                console.log('Ad close button found, clicking to close ad popup...');
                await close_ad.click();
                await page.waitForTimeout(2000);
            }
        } catch (error) {
            console.log('No ad popup found, proceeding with job scraping.');
        }

        // Wait for page to load completely
        await page.waitForTimeout(3000);

        // Debug: Check what selectors are actually available
        const debugInfo = await page.evaluate(() => {
            const containers = document.querySelectorAll('.individual_internship');
            console.log(`Found ${containers.length} job containers`);
            
            if (containers.length > 0) {
                const firstContainer = containers[0];
                console.log('First container HTML:', firstContainer.innerHTML.substring(0, 500));
                
                // Check all possible selectors
                const selectors = [
                    '.company_name',
                    '.job_title_href',
                    '.locations',
                    '.company-name',
                    '.job-title',
                    '.location',
                    'h3',
                    'h4',
                    'h5',
                    'a[href*="job"]',
                    'a[href*="internship"]',
                    '.profile',
                    '.company',
                    '.title'
                ];
                
                const found = {};
                selectors.forEach(selector => {
                    const elements = firstContainer.querySelectorAll(selector);
                    if (elements.length > 0) {
                        found[selector] = {
                            count: elements.length,
                            text: elements[0].textContent.trim().substring(0, 100)
                        };
                    }
                });
                
                return {
                    containerCount: containers.length,
                    foundSelectors: found,
                    firstContainerClasses: firstContainer.className
                };
            }
            
            return { containerCount: 0 };
        });

        console.log('Debug info:', debugInfo);

        // Try more flexible scraping approach
        const jobData = await page.evaluate(() => {
            const jobs = [];
            
            // Helper function to clean text
            const cleanText = (text) => {
                if (!text) return 'N/A';
                return text.replace(/\s+/g, ' ').trim();
            };
            
            // Helper function to clean company name
            const cleanCompanyName = (text) => {
                if (!text) return 'N/A';
                return text.replace(/Actively hiring/gi, '').replace(/\s+/g, ' ').trim();
            };
            
            // Helper function to remove duplicate locations
            const cleanLocations = (locations) => {
                if (!locations || locations.length === 0) return 'N/A';
                const uniqueLocations = [...new Set(locations.filter(loc => loc && loc.trim() !== '' && loc.trim() !== ','))];
                return uniqueLocations.length > 0 ? uniqueLocations.join(', ') : 'N/A';
            };
            
            const jobContainers = document.querySelectorAll('.individual_internship');
            console.log(`Processing ${jobContainers.length} job containers`);
            
            jobContainers.forEach((container, index) => {
                try {
                    // Try multiple approaches to find company name
                    let companyName = 'N/A';
                    const companySelectors = [
                        '.company_name',
                        '.company-name', 
                        '.company',
                        'h3',
                        'h4',
                        'h5',
                        '[class*="company"]',
                        '.heading_4_5'
                    ];
                    
                    for (const selector of companySelectors) {
                        const element = container.querySelector(selector);
                        if (element && element.textContent.trim()) {
                            companyName = cleanCompanyName(element.textContent);
                            break;
                        }
                    }
                    
                    // Try multiple approaches to find job title
                    let jobTitle = 'N/A';
                    let jobHref = 'N/A';
                    const titleSelectors = [
                        '.job_title_href',
                        '.profile',
                        '.job-title',
                        'h2 a',
                        'h3 a',
                        'a[href*="job"]',
                        'a[href*="internship"]',
                        '.heading_4_5 a'
                    ];
                    
                    for (const selector of titleSelectors) {
                        const element = container.querySelector(selector);
                        if (element && element.textContent.trim()) {
                            jobTitle = cleanText(element.textContent);
                            jobHref = element.getAttribute('href') || 'N/A';
                            break;
                        }
                    }
                    
                    // If no title with link found, try to find title and link separately
                    if (jobTitle === 'N/A') {
                        const titleOnlySelectors = ['.profile', '.job-title', 'h2', 'h3'];
                        for (const selector of titleOnlySelectors) {
                            const element = container.querySelector(selector);
                            if (element && element.textContent.trim()) {
                                jobTitle = cleanText(element.textContent);
                                break;
                            }
                        }
                    }
                    
                    if (jobHref === 'N/A') {
                        const linkElement = container.querySelector('a[href*="job"], a[href*="internship"]');
                        if (linkElement) {
                            jobHref = linkElement.getAttribute('href');
                        }
                    }
                    
                    // Make sure href is absolute URL
                    const applyLink = jobHref && jobHref !== 'N/A' ? 
                        (jobHref.startsWith('http') ? jobHref : `https://internshala.com${jobHref}`) : 'N/A';
                    
                    // Try multiple approaches to find location
                    let locationString = 'N/A';
                    const locationSelectors = [
                        '.locations span',
                        '.location span',
                        '.location',
                        '[class*="location"]',
                        '.individual_internship_details span'
                    ];
                    
                    for (const selector of locationSelectors) {
                        const locationElements = container.querySelectorAll(selector);
                        if (locationElements.length > 0) {
                            const locations = [];
                            locationElements.forEach(locElement => {
                                const location = cleanText(locElement.textContent);
                                if (location && location !== 'N/A' && location !== ',') {
                                    locations.push(location);
                                }
                            });
                            if (locations.length > 0) {
                                locationString = cleanLocations(locations);
                                break;
                            }
                        }
                    }
                    
                    // Debug log for first few jobs
                    if (index < 3) {
                        console.log(`Job ${index + 1}:`, {
                            companyName,
                            jobTitle,
                            applyLink,
                            locationString
                        });
                    }
                    
                    // Add job if we have at least company name OR job title
                    if (companyName !== 'N/A' || jobTitle !== 'N/A') {
                        jobs.push({
                            companyName: companyName,
                            title: jobTitle,
                            link: applyLink,
                            location: locationString
                        });
                    }
                } catch (error) {
                    console.log('Error extracting job data:', error);
                }
            });
            
            return jobs;
        });

        console.log(`=== SCRAPING COMPLETE ===`);
        console.log(`Total jobs found: ${jobData.length}`);
        
        if (jobData.length > 0) {
            // selevting only first 5 jobs for detailed logging and saving new variable
            let job_number = parseInt(data.jobnumber)
            const sampleJobs = jobData.slice(0, job_number);
            SendMail(sampleJobs,data);
        } else {
            console.log('No jobs were extracted. Check debug info above.');
        }
        
        return jobData;

    } catch (error) {
        console.error('Error during scraping:', error);
        return [];
    } finally {
        // Always close the page properly
        if (page) {
            try {
                await page.close();
                await browser.close();
                console.log('Page closed successfully');
            } catch (closeError) {
                console.log('Error closing page:', closeError);
            }
        }
    }
}

export const internshala_scraper = async (data) => {
  console.log("🚀 Starting internshala job scraping...");
  try {
    const result = await start_internshala_jobs(data);
    console.log(`✅ Scraping completed successfully. Found ${result.length} jobs.`);
    return result;
  } catch (error) {
    console.error('❌ Error in internshala_scraper:', error);
    return [];
  }
};


//internshall
//foundit
//shine
//unnstop
//naukari