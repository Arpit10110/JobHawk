import puppeteer from "puppeteer";

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

const start_internshala_jobs = async () => {
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

        await page.goto("https://internshala.com/jobs/full-stack-development-jobs/", {
            waitUntil: "networkidle2",
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
                            jobTitle: jobTitle,
                            applyLink: applyLink,
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
            console.log('Sample job data:', jobData);
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

export const internshala_scraper = async () => {
  console.log("🚀 Starting internshala job scraping...");
  
  try {
    const result = await start_internshala_jobs();
    console.log(`✅ Scraping completed successfully. Found ${result.length} jobs.`);
    return result;
  } catch (error) {
    console.error('❌ Error in internshala_scraper:', error);
    return [];
  }
};
