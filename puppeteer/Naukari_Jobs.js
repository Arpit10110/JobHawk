import puppeteer from "puppeteer";
import { SendMail } from "../controller/Controller.js";

// for production 
let browser = null;
const isProd = process.env.NODE_ENV == 'production';

async function initializeBrowser() {
  if (!browser) {
    const launchOptions = {
      headless: isProd ? "new" : false,
      defaultViewport: { width: 1440, height: 900 },
      args: isProd ? [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--window-size=1440,900'
      ] : ['--start-maximized']
    };

    // Only set executablePath for production
    if (isProd) {
      launchOptions.executablePath = '/usr/bin/google-chrome-stable';
    }
    
    browser = await puppeteer.launch(launchOptions);
  }
  return browser;
}

export const start_scraping_naukari_jobs = async (data) => {
  const browser = await initializeBrowser();
  const page = await browser.newPage();
  
  try {
    // Set user agent for production
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1440, height: 900 });
    
    // Block heavy third-party resources to speed up page load
    await page.setRequestInterception(true);
    const blocked = ['googletagmanager', 'doubleclick', 'googleads', 'facebook', 'analytics'];
    page.on('request', req => {
      const url = req.url();
      if (blocked.some(p => url.includes(p))) {
        return req.abort();
      }
      req.continue();
    });
    
    console.log('=== PAGE DEBUG INFO ===');
    console.log('Navigating to Naukri login page...');
    
    // Navigate directly to login page with no timeout
    await page.goto("https://www.naukri.com/nlogin/login?URL=https://www.naukri.com/mnjuser/homepage", {
      waitUntil: "domcontentloaded",
      timeout: 0 // No navigation timeout
    });
    
    // Debug: Check what page actually loaded
    const currentUrl = page.url();
    const pageTitle = await page.title();
    
    console.log('Current URL:', currentUrl);
    console.log('Page Title:', pageTitle);
    
    // Check page content
    const pageContent = await page.content();
    console.log('Page content (first 500 chars):', pageContent.substring(0, 500));
    
    // Take debug screenshot in production
    if (isProd) {
      await page.screenshot({ path: `debug-${Date.now()}.png`, fullPage: true });
    }
    
    // Wait for login form with multiple possible selectors and extended timeout
    const loginSelectors = [
      '#usernameField',
      'input[name="username"]',
      'input[placeholder*="Email"]',
      'input[type="email"]'
    ].join(',');
    
    console.log('Waiting for login form...');
    const username = await page.waitForSelector(loginSelectors, { 
      timeout: 90000, // 90 seconds
      visible: true 
    });
    
    console.log('✅ Login form found!');
    
    // Get password field
    const password = await page.waitForSelector('#passwordField', {
      timeout: 45000,
      visible: true 
    });

    await username.type("xabivo8514@fuasha.com", {delay: 100});
    await password.type("Arpit@761", {delay: 100});
    
    // Submit form
    await page.keyboard.press('Enter', { delay: 100 });
    
    // Wait for login to complete - check for successful login indicators
    console.log('Waiting for login to complete...');
    try {
      await page.waitForSelector('.nI-gNb-menuItems', { timeout: 30000 });
      console.log('✅ Login successful!');
    } catch (loginError) {
      console.log('Login might have failed or page structure changed');
      // Continue anyway, sometimes login works but selector changes
    }
    
    // Open new tab for job search
    console.log('Opening new tab for job search...');
    const newTab = await browser.newPage();
    
    // Set same user agent for new tab
    await newTab.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
    
    // Set same request interception for new tab
    await newTab.setRequestInterception(true);
    newTab.on('request', req => {
      const url = req.url();
      if (blocked.some(p => url.includes(p))) {
        return req.abort();
      }
      req.continue();
    });
    
    await newTab.goto("https://www.naukri.com/mnjuser/homepage", {
      waitUntil: "domcontentloaded",
      timeout: 60000
    });
  
    // Wait for the page to load in the new tab
    await newTab.waitForSelector('body', { timeout: 30000 }); 
    
    // Perform job search in the new tab
    console.log('Starting job search...');
    const click_on_search = await newTab.waitForSelector('div[class="nI-gNb-sb__main"]', { timeout: 30000 });
    await click_on_search.click();
    
    const jobSearchInput = await newTab.waitForSelector('input[placeholder="Enter keyword / designation / companies"]', { timeout: 30000 });
    
    // typing the job titles
    for (let i = 0; i < data.jobtitle.length; i++) {
      const title = data.jobtitle[i];
      if (i === 0) {
        await jobSearchInput.type(title, { delay: 100 });
      } else {
        await jobSearchInput.type(`, ${title}`, { delay: 100 });
      }
    }

    // Experience selection
    await newTab.click('input[id="experienceDD"]'); 
    let targetExpTitle;

    if (data.exp.toLowerCase() === 'fresher') {
        targetExpTitle = 'Fresher';
    } else {
        targetExpTitle = data.exp.toLowerCase();
    }

    const desiredExperienceOptionSelector = `li[title="${targetExpTitle}"]`;
    try {
        await newTab.waitForSelector(desiredExperienceOptionSelector, { visible: true, timeout: 10000 });
        await newTab.click(desiredExperienceOptionSelector);
        console.log(`Successfully selected experience: "${data.exp}"`);
    } catch (error) {
        console.log(`Experience option "${data.exp}" not found or not clickable:`, error.message);
    }

    // Location selection
    let jobLocationInput = await newTab.waitForSelector('input[placeholder="Enter location"]', { timeout: 30000 });

    for(let i=0; i<data.joblocation.length; i++){
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

    // Wait for search results
    await newTab.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 45000 });
    
    // Apply filters
    console.log('Applying filters...');
    
    // Remote work filter
    if (data.joblocation.length === 1 && data.joblocation[0] === "Remote") {
      try {
        const remote_checkbox = await newTab.waitForSelector('label[for="chk-Remote-wfhType-"]', { visible: true, timeout: 10000 });
        await remote_checkbox.click();
        console.log("Remote checkbox clicked for single remote location.");
      } catch (error) {
        console.log("Remote checkbox not found:", error.message);
      }
    }

    // Other location filters
    if (data.joblocation.length > 1 && !data.joblocation.includes("Remote")) {
      try {
        const work_from_office_checkbox = await newTab.waitForSelector('label[for="chk-Work from office-wfhType-"]', { visible: true, timeout: 10000 });
        await work_from_office_checkbox.click();
        await new Promise((resolve) => setTimeout(resolve, 2000)); 
        
        const hybrid_checkbox = await newTab.waitForSelector('label[for="chk-Hybrid-wfhType-"]', { visible: true, timeout: 10000 });
        await hybrid_checkbox.click();
        await new Promise((resolve) => setTimeout(resolve, 2000)); 
        console.log("Work from Office and Hybrid checkboxes clicked for multiple locations excluding remote.");
      } catch (error) {
        console.log("Work location checkboxes not found:", error.message);
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 3000)); 

    // Sort by date
    try {
      const sort_dropdown = await newTab.waitForSelector('button[id="filter-sort"]', { timeout: 15000 });
      await sort_dropdown.click();
      const sort_by_date = await newTab.waitForSelector('li[title="Date"]', { timeout: 10000 });
      await sort_by_date.click();
      await new Promise((resolve) => setTimeout(resolve, 3000)); 
    } catch (error) {
      console.log("Sort dropdown not found:", error.message);
    }

    // Extract job details
    console.log('Extracting job details...');
    await newTab.waitForSelector('#listContainer', { timeout: 15000 });
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

          // extract job location class can be locWdth or locWdth2
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

    console.log(`Found ${jobs.length} jobs`);
    
    // Display jobs in the requested format
    if (jobs.length > 0) {
      console.log('Jobs found, sending emails...');
      
      let number_of_jobs_needed = parseInt(data.jobnumber);
      const uniqueJobs = [];
      
      for(let i=0; i<jobs.length; i++){
        if(uniqueJobs.length >= number_of_jobs_needed) break;
        const job = jobs[i];
        if(!uniqueJobs.some(j => j.link === job.link)) {
          uniqueJobs.push(job);
        }
      }
      
      await SendMail(data, uniqueJobs);
      console.log("✅ Email sent successfully!");
    } else {
      console.log('No jobs found. Check if the page loaded correctly.');
    }

    console.log("✅ Scraping completed successfully.");
    return jobs;
    
  } catch (error) {
    console.error('❌ Error during scraping:', error);
    
    // Additional debugging on error
    try {
      const finalUrl = page.url();
      const finalTitle = await page.title();
      console.log('Error occurred at URL:', finalUrl);
      console.log('Error occurred at page title:', finalTitle);
      
      // Take error screenshot
      if (isProd) {
        await page.screenshot({ path: `error-${Date.now()}.png`, fullPage: true });
      }
    } catch (debugError) {
      console.log('Could not get debug info:', debugError.message);
    }
    
    return [];
  } finally {
    try {
      const pages = await browser.pages();
      await Promise.all(pages.map(page => page.close()));
      await browser.close();
      browser = null; // Reset browser instance
    } catch (closeError) {
      console.error('Error closing browser:', closeError);
      if (browser && browser.process()) {
        browser.process().kill('SIGINT');
      }
      browser = null;
    }
  }
};

export const naukar_scraper = async (data) => {
  console.log("Starting Naukari job scraping...");
  console.log(data);

  return await start_scraping_naukari_jobs(data);
};
