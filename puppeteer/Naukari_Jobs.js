import puppeteer from "puppeteer";
import { SendMail } from "../controller/Controller.js";

// for production 
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

// Function to verify if user is still logged in
async function verifyLogin(page) {
  try {
    // Check for login indicators
    const loginIndicators = [
      '.nI-gNb-menuItems', // Logged in navigation menu
      '.nI-gNb-user', // User profile section
      '[data-automation="user-profile"]', // User profile element
      '.nI-gNb-drawer__icon' // Navigation drawer
    ];
    
    for (const indicator of loginIndicators) {
      const element = await page.$(indicator);
      if (element) {
        console.log(`✅ Login verified with indicator: ${indicator}`);
        return true;
      }
    }
    
    // Check if we're redirected to login page
    const currentUrl = page.url();
    if (currentUrl.includes('nlogin') || currentUrl.includes('login')) {
      console.log('❌ Redirected to login page - session expired');
      console.log(`Current URL: ${currentUrl}`);
      // show the full page content for debugging
      const content = await page.content();
      // showing the full page content in console
      console.log('Full page content:', content);
      return false;
    }
    
    // Check for login form (means we're logged out)
    const loginForm = await page.$('#usernameField');
    if (loginForm) {
      console.log('❌ Login form detected - user is logged out');
      console.log(`Current URL: ${currentUrl}`);
      // show the full page content for debugging
      const content = await page.content();
      // showing the full page content in console
      console.log('Full page content:', content);
      return false;
    }
    
    console.log('✅ Login status appears to be valid');
    return true;
    
  } catch (error) {
    console.log('❌ Error verifying login:', error.message);
    console.log(`Current URL: ${currentUrl}`);
    // show the full page content for debugging
    const content = await page.content();
    // showing the full page content in console
    console.log('Full page content:', content);
    return false;
  }
}

// Function to handle login with verification
async function performLogin(page) {
  try {
    console.log('🔐 Starting login process...');
    
    // Navigate to login page
    await page.goto("https://www.naukri.com/nlogin/login?URL=https://www.naukri.com/mnjuser/homepage", {
      waitUntil: "domcontentloaded",
      timeout: 60000
    });
    
    // Wait for login form
    const loginSelectors = [
      '#usernameField',
      'input[name="username"]',
      'input[placeholder*="Email"]',
      'input[type="email"]'
    ].join(',');
    
    const username = await page.waitForSelector(loginSelectors, { 
      timeout: 50000,
      visible: true 
    });
    
    const password = await page.waitForSelector('#passwordField', {
      timeout: 30000,
      visible: true 
    });

    // Clear fields first
    await username.click({ clickCount: 3 });
    await username.type("xabivo8514@fuasha.com", {delay: 100});
    
    await password.click({ clickCount: 3 });
    await password.type("Arpit@761", {delay: 100});
    
    // Submit form
    await page.keyboard.press('Enter', { delay: 100 });
    
    // Wait for login to complete with multiple checks
    console.log('⏳ Waiting for login to complete...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Verify login was successful
    const loginSuccess = await verifyLogin(page);
    
    if (!loginSuccess) {
      // Check for error messages
      const errorSelectors = [
        '.err-msg',
        '.error-message',
        '.login-error',
        '[class*="error"]'
      ];
      
      for (const selector of errorSelectors) {
        const errorElement = await page.$(selector);
        if (errorElement) {
          const errorText = await errorElement.textContent();
          console.log(`❌ Login error detected: ${errorText}`);
          throw new Error(`Login failed: ${errorText}`);
        }
      }
      
      throw new Error('Login failed - unable to verify successful login');
    }
    
    console.log('✅ Login successful!');
    return true;
    
  } catch (error) {
    console.error('❌ Login failed:', error.message);
    throw error;
  }
}

// Function to check if session is still valid during scraping
async function checkSessionDuringProcess(page) {
  try {
    const currentUrl = page.url();
    
    // If we're redirected to login, session expired
    if (currentUrl.includes('nlogin') || currentUrl.includes('login')) {
      console.log('❌ Session expired - redirected to login');
      return false;
    }
    
    // Check for session expiry messages
    const sessionExpiredSelectors = [
      'text="Session expired"',
      'text="Please login again"',
      'text="Your session has expired"',
      '[class*="session-expired"]'
    ];
    
    for (const selector of sessionExpiredSelectors) {
      const element = await page.$(selector);
      if (element) {
        console.log('❌ Session expired message detected');
        return false;
      }
    }
    
    return true;
    
  } catch (error) {
    console.log('Error checking session:', error.message);
    return false;
  }
}

export const start_scraping_naukari_jobs = async (data) => {
  let browser = null;
  let page = null;
  
  try {
    browser = await initializeBrowser();
    page = await browser.newPage();
    
    // Set user agent and viewport
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
    
    console.log('=== STARTING NAUKRI JOB SCRAPING ===');
    
    // Perform login with verification
    await performLogin(page);
    
    // Navigate to job search
    console.log('🔍 Navigating to job search...');
    await page.goto("https://www.naukri.com/", {
      waitUntil: "domcontentloaded",
      timeout: 60000
    });
    
    // Verify session is still valid
    const sessionValid = await checkSessionDuringProcess(page);
    if (!sessionValid) {
      throw new Error('Session expired during navigation');
    }
    
    // Wait for page to load
    await page.waitForSelector('body', { timeout: 30000 });
    
    // Find and click search
    const searchSelectors = [
      'div[class="nI-gNb-sb__main"]',
      'input[placeholder*="keyword"]',
      'input[placeholder*="designation"]',
      '.nI-gNb-sb__main'
    ];
    
    let searchElement = null;
    for (const selector of searchSelectors) {
      try {
        searchElement = await page.waitForSelector(selector, { timeout: 10000 });
        if (searchElement) {
          console.log(`Found search element: ${selector}`);
          break;
        }
      } catch (err) {
        continue;
      }
    }
    
    if (!searchElement) {
      throw new Error('Could not find search input - possible session issue');
    }
    
    await searchElement.click();
    
    // Continue with job search
    const jobSearchInput = await page.waitForSelector('input[placeholder="Enter keyword / designation / companies"]', { timeout: 30000 });
    
    // Type job titles
    for (let i = 0; i < data.jobtitle.length; i++) {
      const title = data.jobtitle[i];
      if (i === 0) {
        await jobSearchInput.type(title, { delay: 100 });
      } else {
        await jobSearchInput.type(`, ${title}`, { delay: 100 });
      }
    }

    // Experience selection
    await page.click('input[id="experienceDD"]');
    let targetExpTitle = data.exp.toLowerCase() === 'fresher' ? 'Fresher' : data.exp.toLowerCase();

    try {
      const experienceSelector = `li[title="${targetExpTitle}"]`;
      await page.waitForSelector(experienceSelector, { visible: true, timeout: 10000 });
      await page.click(experienceSelector);
      console.log(`✅ Selected experience: "${data.exp}"`);
    } catch (error) {
      console.log(`❌ Experience option "${data.exp}" not found`);
    }

    // Location selection
    const jobLocationInput = await page.waitForSelector('input[placeholder="Enter location"]', { timeout: 30000 });

    for(let i = 0; i < data.joblocation.length; i++){
      const location = data.joblocation[i];
      if (location !== "Remote"){
        if (i === 0) {
          await jobLocationInput.type(location, { delay: 100 });
        } else {
          await jobLocationInput.type(`, ${location}`, { delay: 100 });
        }
      }
    }

    // Submit search
    await page.keyboard.press('Enter', { delay: 100 });
    await page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 60000 });
    
    // Check session after navigation
    const sessionAfterSearch = await checkSessionDuringProcess(page);
    if (!sessionAfterSearch) {
      throw new Error('Session expired during job search');
    }
    
    // Apply filters and extract jobs (rest of your existing code)
    console.log('🔧 Applying filters...');
    
    // Remote filter
    if (data.joblocation.length === 1 && data.joblocation[0] === "Remote") {
      try {
        const remoteCheckbox = await page.waitForSelector('label[for="chk-Remote-wfhType-"]', { visible: true, timeout: 10000 });
        await remoteCheckbox.click();
        console.log("✅ Remote filter applied");
      } catch (error) {
        console.log("❌ Remote filter not found");
      }
    }

    // Sort by date
    try {
      const sortDropdown = await page.waitForSelector('button[id="filter-sort"]', { timeout: 15000 });
      await sortDropdown.click();
      const sortByDate = await page.waitForSelector('li[title="Date"]', { timeout: 10000 });
      await sortByDate.click();
      console.log("✅ Sorted by date");
    } catch (error) {
      console.log("❌ Sort option not found");
    }

    // Extract jobs
    console.log('📋 Extracting job details...');
    await page.waitForSelector('#listContainer', { timeout: 15000 });
    await new Promise(resolve => setTimeout(resolve, 3000));

    const jobs = await page.evaluate(() => {
      const jobList = [];
      const listContainer = document.querySelector('#listContainer');
      
      if (!listContainer) return [];
      
      const jobWrappers = listContainer.querySelectorAll('div[class*="srp-jobtuple-wrapper"]');
      
      jobWrappers.forEach((jobWrapper) => {
        try {
          const titleElement = jobWrapper.querySelector('a[class*="title"]');
          const title = titleElement ? titleElement.textContent.trim() : '';
          const link = titleElement ? titleElement.href : '';
          
          const companyElement = jobWrapper.querySelector('a[class*="comp-name"]');
          const companyName = companyElement ? companyElement.textContent.trim() : '';

          const locationElement = jobWrapper.querySelector('span[class*="locWdth"]') || jobWrapper.querySelector('span[class*="locWdth2"]');
          
          if (title && companyName && link) {
            jobList.push({
              title,
              link,
              companyName,
              location: locationElement ? locationElement.textContent.trim() : 'Not specified'
            });
          }
        } catch (error) {
          console.log('Error extracting job:', error);
        }
      });
      
      return jobList;
    });

    console.log(`✅ Found ${jobs.length} jobs`);
    
    if (jobs.length > 0) {
      const numberOfJobsNeeded = parseInt(data.jobnumber);
      const uniqueJobs = [];
      
      for(let i = 0; i < jobs.length && uniqueJobs.length < numberOfJobsNeeded; i++){
        const job = jobs[i];
        if(!uniqueJobs.some(j => j.link === job.link)) {
          uniqueJobs.push(job);
        }
      }
      
      await SendMail(data, uniqueJobs);
      console.log("✅ Email sent successfully!");
    } else {
      console.log('❌ No jobs found');
    }

    console.log("🎉 Scraping completed successfully!");
    return jobs;
    
  } catch (error) {
    console.error('❌ Error during scraping:', error.message);
    
    // Check if it's a session/login related error
    if (error.message.includes('login') || error.message.includes('session')) {
      console.log('🔄 This appears to be a login/session issue');
    }
    
    return [];
  } finally {
    try {
      if (browser) {
        const pages = await browser.pages();
        await Promise.all(pages.map(p => p.close()));
        await browser.close();
        browserInstance = null;
      }
    } catch (closeError) {
      console.error('Error closing browser:', closeError);
      browserInstance = null;
    }
  }
};

export const naukar_scraper = async (data) => {
  console.log("🚀 Starting Naukri job scraping...");
  console.log(data);

  return await start_scraping_naukari_jobs(data);
};
