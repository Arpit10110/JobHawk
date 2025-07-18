import puppeteer from "puppeteer";
import { SendMail } from "../controller/Controller.js";


// for production 
let browser = null;
const isProd = process.env.NODE_ENV == 'production';
async function initializeBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({
      executablePath: isProd ? process.env.PUPPETEER_EXECUTABLE_PATH : undefined,
      headless: isProd ? "new" : false, 
      args: isProd? [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]:['--start-maximized']
    });
  }
  return browser;
}

export const start_scraping_naukari_jobs = async (data) => {
  // this is for locally using this browser

  // let browser = await puppeteer.launch({ 
  //   headless: false, 
  //   defaultViewport: null, 
  //   args: ['--start-maximized'] 
  // });
  
  
  //using this browser for production
  // to avoid launching multiple instances of browser
  const browser = await initializeBrowser(); // Use shared browser instance 
  // from here the code will be same for both local and production
  const page = await browser.newPage();
  
  try {
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1440, height: 900 });
    
    // Add more robust navigation with retries
    await page.goto("https://www.naukri.com/nlogin/login?URL=https://www.naukri.com/mnjuser/homepage", {
      waitUntil: ["networkidle2", "domcontentloaded"],
      timeout: 60000 // Increase timeout to 60 seconds
    });

    // Debug: Check what page actually loaded
    const currentUrl = page.url();
    const pageTitle = await page.title();
    
    console.log('=== PAGE DEBUG INFO ===');
    console.log('Current URL:', currentUrl);
    console.log('Page Title:', pageTitle);
    
    // Check if we're being redirected or blocked
    const pageContent = await page.content();
    console.log('Page content (first 500 chars):', pageContent.substring(0, 500));
    
    // Wait for page to stabilize
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Try multiple selectors and increase timeout
    const username = await page.waitForSelector('#usernameField', { 
      timeout: 45000,
      visible: true 
    });
    const password = await page.waitForSelector('#passwordField',{
      timeout: 45000,
      visible: true 
    });

    await username.type("xabivo8514@fuasha.com", {delay: 100});
    await password.type("Arpit@761", {delay: 100});
    // Press enter
    await page.keyboard.press('Enter', { delay: 100 });
    
    // Wait for login to complete
    await page.waitForNavigation({ waitUntil: "networkidle2" });
    
    // Open new tab for job search
    const newTab = await browser.newPage();
    await newTab.goto("https://www.naukri.com/mnjuser/homepage", {
      waitUntil: "networkidle2"
    });
  
    // Wait for the page to load in the new tab
    await newTab.waitForSelector('body'); 
    
    // Perform job search in the new tab
    const click_on_search = await newTab.waitForSelector('div[class="nI-gNb-sb__main"]');
    await click_on_search.click();
    
    const jobSearchInput = await newTab.waitForSelector('input[placeholder="Enter keyword / designation / companies"]');
    // typing the job titles the data.jobtitle = ["","",""...]
    for (let i = 0; i < data.jobtitle.length; i++) {
      const title = data.jobtitle[i];
      if (i === 0) {
        await jobSearchInput.type(title, { delay: 100 });
      } else {
        await jobSearchInput.type(`, ${title}`, { delay: 100 });
      }
    }

    await newTab.click('input[id="experienceDD"]'); 
    let targetExpTitle;

    if (data.exp.toLowerCase() === 'fresher') {
        targetExpTitle = 'Fresher';
    } else {
        targetExpTitle = data.exp.toLowerCase();
    }

    const desiredExperienceOptionSelector = `li[title="${targetExpTitle}"]`;
    try {
        await newTab.waitForSelector(desiredExperienceOptionSelector, { visible: true, timeout: 5000 });
        await newTab.click(desiredExperienceOptionSelector);
        console.log(`Successfully selected experience: "${data.exp}"`);
    } catch (error) {
        console.log(`Experience option "${data.exp}" not found or not clickable:`, error.message);
    }

    // adding the location

    let jobLocationInput = await newTab.waitForSelector('input[placeholder="Enter location"]');

    for(let i=0;i<data.joblocation.length;i++){
      const location = data.joblocation[i];
      if (location != "Remote"){
        if (i === 0) {
          await jobLocationInput.type(location, { delay: 100 });
        } else {
          await jobLocationInput.type(`, ${location}`, { delay: 100 });
        }
      }
    }

    await newTab.keyboard.press('Enter', { delay: 100 });

    // wait unitil network is idle
    await newTab.waitForNavigation({ waitUntil: "networkidle2" });
    
    // apply the filters

    //1. if Only Remote is thier in job location
    if (data.joblocation.length === 1 && data.joblocation[0] === "Remote") {
      const remote_checkbox = await newTab.waitForSelector('label[for="chk-Remote-wfhType-"]', { visible: true, timeout: 10000 });
      await remote_checkbox.click();
      console.log("Remote checkbox clicked for single remote location.");
    }

    //2. if remote and other locations are there
    // by default all the checkbox rempote, work from office and hybrid are checked

    //2. if other locations are there but not remote
    if (data.joblocation.length > 1 && !data.joblocation.includes("Remote")) {
      const work_from_office_checkbox = await newTab.waitForSelector('label[for="chk-Work from office-wfhType-"]', { visible: true, timeout: 10000 });
      await work_from_office_checkbox.click();
      await new Promise((resolve) => setTimeout(resolve, 3000)); 
      const hybrid_checkbox = await newTab.waitForSelector('label[for="chk-Hybrid-wfhType-"]',{ visible: true, timeout: 10000 });
      await hybrid_checkbox.click();
      await new Promise((resolve) => setTimeout(resolve, 3000)); 
      console.log("Work from Office and Hybrid checkboxes clicked for multiple locations excluding remote.");
    }
    await new Promise((resolve) => setTimeout(resolve, 3000)); 

    // sort by date

    const sort_dropdown = await newTab.waitForSelector('button[id="filter-sort"]')
    await sort_dropdown.click();
    const sort_by_date = await newTab.waitForSelector('li[title="Date"]');
    await sort_by_date.click();
    await new Promise((resolve) => setTimeout(resolve, 3000)); 


    // Wait for search results to load
    await newTab.waitForSelector('#listContainer', { timeout: 10000 });
    await new Promise((resolve) => setTimeout(resolve, 3000)); 

    // Extract job details from the CORRECT page (newTab, not page)
    const jobs = await newTab.evaluate(() => {
      const jobList = [];
      const listContainer = document.querySelector('#listContainer');
      
      if (!listContainer) {
        console.log('listContainer not found');
        return [];
      }
      
      // Find all job wrapper divs
      const jobWrappers = listContainer.querySelectorAll('div[class*="srp-jobtuple-wrapper"]');
      
      jobWrappers.forEach((jobWrapper, index) => {
        try {
          // Extract job title and link
          const titleElement = jobWrapper.querySelector('a[class*="title"]');
          const title = titleElement ? titleElement.textContent.trim() : '';
          const link = titleElement ? titleElement.href : '';
          
          // Extract company name
          const companyElement = jobWrapper.querySelector('a[class*="comp-name"]');
          const companyName = companyElement ? companyElement.textContent.trim() : '';

          // extract job loaction class can be locWdth or locWdth2
          const locationElement = jobWrapper.querySelector('span[class*="locWdth"]') || jobWrapper.querySelector('span[class*="locWdth2"]');
          
          
          // Only add jobs with valid title, company name, and link
          if (title && companyName && link) {
            jobList.push({
              title,
              link,
              companyName,
              location: locationElement ? locationElement.textContent.trim() : 'Not specified'
            });
          }
        } catch (error) {
          console.log(`Error extracting job ${index}:`, error);
        }
      });
      
      return jobList;
    });

    console.log(`Found ${jobs.length} jobs for "Software Engineer"`);
    
    // Display jobs in the requested format
    if (jobs.length > 0) {
      console.log('\nJobs founded');
      // extracting number of jobnumber their from the jobs array and it should be unique
      
      let number_of_jobs_needed = parseInt(data.jobnumber);

      const uniqueJobs = [];
      for(let i=0;i<jobs.length;i++){
        if(uniqueJobs.length >= number_of_jobs_needed) break;
        const job = jobs[i];
        if(!uniqueJobs.some(j => j.link === job.link)) {
          uniqueJobs.push(job);
        }
      }
      SendMail(data, uniqueJobs);
    } else {
      console.log('No jobs found. Check if the page loaded correctly.');
    }

    console.log("Scraping completed successfully.");
    
    return jobs;
    
  } catch (error) {
    console.error('Error during scraping:', error);
    return [];
  } finally {
    try {
      const pages = await browser.pages();
      await Promise.all(pages.map(page => page.close()));
      await browser.close();
    } catch (closeError) {
      console.error('Error closing browser:', closeError);
      if (browser.process()) {
        browser.process().kill('SIGINT');
      }
    }
  }
};


export const naukar_scraper = async (data)=>{
  console.log("Starting Naukari job scraping...");
  console.log(data);

  start_scraping_naukari_jobs(data);
}