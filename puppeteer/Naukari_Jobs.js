import puppeteer from "puppeteer";

export const start_scraping_naukari_jobs = async (data) => {
  let browser = await puppeteer.launch({ 
    headless: false, 
    defaultViewport: null, 
    args: ['--start-maximized'] 
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  
  try {
    await page.goto("https://www.naukri.com/mnjuser/homepage", {
      waitUntil: "networkidle2"
    });
    
    const username = await page.waitForSelector('#usernameField');
    const password = await page.waitForSelector('#passwordField');

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
          
          // Only add jobs with valid title, company name, and link
          if (title && companyName && link) {
            jobList.push({
              title,
              link,
              companyName
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
      console.log('\nJobs found:');
      jobs.forEach((job, index) => {
        console.log(`${index + 1}. title: ${job.title} | link: ${job.link} | company name: ${job.companyName}`);
      });
    } else {
      console.log('No jobs found. Check if the page loaded correctly.');
    }
    
    return jobs;
    
  } catch (error) {
    console.error('Error during scraping:', error);
    return [];
  } finally {
    // await browser.close();
  }
};


export const naukar_scraper = async (data)=>{
  console.log("Starting Naukari job scraping...");
  console.log(data);

  start_scraping_naukari_jobs(data);
}