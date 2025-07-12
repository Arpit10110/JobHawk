import puppeteer from "puppeteer";


const get_internshala_jobs = async () => {
    try {
        
        const browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: ['--start-maximized']
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1440, height: 900 });

        // await page.goto("https://internshala.com/jobs/", {
        //     waitUntil: "networkidle2"
        //   });
        await page.goto("https://unstop.com/jobs", {
            waitUntil: "networkidle2"
          });

        //   const close_ad = await page.waitForSelector('i[id="close_popup"]');
        //   await close_ad.click();




    } catch (error) {
        console.error('Error during scraping:', error);
    }
}

get_internshala_jobs();

//internshall
//foundit
//shine
//unnstop
//naukari