import puppeteer from "puppeteer";
import { SendMail } from "../controller/Controller.js";
import axios from "axios"
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
        await page.goto("https://www.foundit.in/", {
            waitUntil: "domcontentloaded",
            timeout: 60000
        });

        // get the jobtitle input
        let jobtitle_inputbox  = await page.waitForSelector("input[id='heroSectionDesktop-skillsAutoComplete--input']");
        await jobtitle_inputbox.type("frontend,backend,fullstack",{delay:100})
        //get the exp dropdown
        await page.click('input[placeholder="Experience"]');
        let years="5 Years"
    
        // Wait for options to load
        await page.waitForSelector('ul li', { timeout: 5000 });
        
        // Get all dropdown options
        const options = await page.$$('ul li');
        
        for (let option of options) {
            const text = await page.evaluate(el => el.textContent, option);
            if (text.includes(years)) {
                await option.click();
                break;
            }
        }
        await page.waitForTimeout(3000);
         // get the location input
         let loc_inputbox = await page.waitForSelector("input[id='heroSectionDesktop-locationAutoComplete--input']")
         await loc_inputbox.type("Delhi,banglore",{delay:100})
        await page.keyboard.press('Enter', { delay: 100 });
       // Wait until the page and its document are fully loaded
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        await page.waitForTimeout(3000);

    }catch(error){
        console.log(error)
    }
}

const getthejob_using_api = async()=>{
  try {
      const res = await axios.get("https://www.foundit.in/home/api/searchResultsPage?start=0&limit=5&query=frontend+internship&query=backend&query=fullstack+developer&jobCities=bengaluru+%2F+&jobCities=delhi&experienceRanges=3~3&experience=3")
      console.log(res.data)
  } catch (error) {
    console.log(error)
  }
}

// start_internshala_jobs()
getthejob_using_api()