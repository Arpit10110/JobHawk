import puppeteer from "puppeteer";

export const start_scraping_naukari_jobs = async () => {
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
    await jobSearchInput.type("Software Engineer", { delay: 100 });
    await newTab.keyboard.press('Enter', { delay: 100 });
    
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
    await browser.close();
  }
};

start_scraping_naukari_jobs();