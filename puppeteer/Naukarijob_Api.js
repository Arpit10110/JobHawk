import axios from 'axios';
import { SendMail } from '../controller/Controller.js';

const get_jobs = async (data) => {
  try {
    // IMPORTANT: Update this cookie string regularly from a valid logged-in session
    const cookieString = "test=naukri.com; _t_us=...; ak_bmsc=...; bm_sv=...; jd=...; ...";
    const headers = {
        accept: "application/json, text/plain, */*",
        "accept-language": "en-US,en;q=0.9",
        appid: "109",
        systemid: "Naukri",
        clientid: "d3skt0p",
        "content-type": "application/json",
        referer: "https://www.naukri.com/fullstack-developer-frontend-development-jobs?k=fullstack%20developer%2C%20frontend%20development&experience=2&nignbevent_src=jobsearchDeskGNB",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
        authorization: "Bearer eyJraWQiOiIzIiwidHlwIjoiSldUIiwiYWxnIjoiUlM1MTIifQ.eyJkZXZpY2VUeXBlIjoiZDNza3QwcCIsInVkX3Jlc0lkIjozMDQ5OTgzODgsInN1YiI6IjMxNjA1MTIyMiIsInVkX3VzZXJuYW1lIjoieGFiaXZvODUxNEBmdWFzaGEuY29tIiwidWRfaXNFbWFpbCI6dHJ1ZSwiaXNzIjoiSW5mb0VkZ2UgSW5kaWEgUHZ0LiBMdGQuIiwidXNlckFnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzEzOS4wLjAuMCBTYWZhcmkvNTM3LjM2IiwiaXBBZHJlc3MiOiIxNTcuNDkuNy4wIiwidWRfaXNUZWNoT3BzTG9naW4iOmZhbHNlLCJ1c2VySWQiOjMxNjA1MTIyMiwic3ViVXNlclR5cGUiOiJqb2JzZWVrZXIiLCJ1c2VyU3RhdGUiOiJBVVRIRU5USUNBVEVEIiwidWRfaXNQYWlkQ2xpZW50IjpmYWxzZSwidWRfZW1haWxWZXJpZmllZCI6ZmFsc2UsInVzZXJUeXBlIjoiam9ic2Vla2VyIiwic2Vzc2lvblN0YXRUaW1lIjoiMjAyNS0wOS0wM1QxNzo0NDo0NiIsInVkX2VtYWlsIjoieGFiaXZvODUxNEBmdWFzaGEuY29tIiwidXNlclJvbGUiOiJ1c2VyIiwiZXhwIjoxNzU2OTA1Mjg2LCJ0b2tlblR5cGUiOiJhY2Nlc3NUb2tlbiIsImlhdCI6MTc1NjkwMTY4NiwianRpIjoiOGE5YjgwZjA5NzkzNDM2ZGE2YzIwOWMyOTMyYzMxZGUiLCJwb2RJZCI6InByb2QtNTRiOGM2ZDk4LTRicDhuIn0.VMZCnfX0ZBL7C58xd8m7XjjMh88N_Qa_UwgUHutNQlvr8vUUW55UJ4WtNRqGNnFJztXVTCC9oSb7hpBMWAivR21J-SO71Llos7DuyjnjPqLSoXvTebOMw-MC3DFfbdr6vuUkqt-sZMSOLb6hQHvviWDmgkCaunyETjAF2xTeK3AAWpqbGiRQM4goHcbjLdCk1oOv_Dz1OlplVDVVgpPXmafy_v3b7do4ZSZpTGZXMTmsyX5LL-ExycgEHojSBzkDhJ4yK7kpBGL3WEEI9cDQwhvlzt2hRBwOKZqQsqwNGBXRrFyKTYhIhosOq2bkQOAc2bd6daDK3x4YuBltpnJJlg",
        cookie: cookieString,
        "sec-ch-ua": `"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"`,
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": `"Windows"`,
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
      };
      

    const url = await generate_url(data);

    // Log the url and headers for debugging on production to verify correctness
    console.log("Request URL:", url);
    console.log("Request Headers:", headers);

    const res = await axios.get(url, {
      headers,
      timeout: 10000,
      validateStatus: (status) => status === 200,
      // Disallow automatic redirects to catch any 3xx responses causing issues
      maxRedirects: 0,
    });

    const job_data = res.data.jobDetails || [];
    const job_length = parseInt(data.jobnumber);
    const filter_jobdata = [];

    if (job_data.length > 0 && job_data.length >= job_length) {
      job_data.forEach((e) => {
        const link = `https://www.naukri.com${e.jdURL}`;
        const title = e.title;
        const companyName = e.companyName;
        let location = "N/A";
        e.placeholders.forEach((ph) => {
          if (ph.type === "location" && ph.label) {
            location = ph.label;
          }
        });
        filter_jobdata.push({ link, title, companyName, location });
      });

      const sampleJobs =
        job_length > filter_jobdata.length
          ? filter_jobdata
          : filter_jobdata.slice(0, job_length);

      await SendMail(sampleJobs, data);
      return { success: true };
    } else {
      console.log("No jobs found");
      return { success: false };
    }
  } catch (error) {
    console.log("Error fetching jobs:", error.message || error);
    return { success: false };
  }
};

const generate_url = (data) => {
  let jobs_title = "";
  data.jobtitle.forEach((title) => {
    const formattedTitle =
      data.jobtype === "Full-time"
        ? title.toLowerCase().replace(/\s+/g, "%20")
        : `${title} intern`.toLowerCase().replace(/\s+/g, "%20");
    jobs_title += `${formattedTitle},`;
  });

  let job_cities = "";
  data.joblocation.forEach((loc) => {
    if (loc !== "Remote") {
      job_cities += `${loc.toLowerCase().replace(/\s+/g, "%20")},`;
    }
  });

  let job_exp = "0";
  if (data.exp !== "Fresher" && data.jobtype !== "Internship") {
    job_exp = data.exp[0] || "0";
  }

  let url = "";

  if (data.joblocation.length > 1 && data.joblocation.includes("Remote")) {
    url = `https://www.naukri.com/jobapi/v3/search?noOfResults=20&urlType=search_by_key_loc&searchType=adv&location=${job_cities}&keyword=${jobs_title}&sort=f&pageNo=1&experience=${job_exp}`;
  } else if (data.joblocation.length > 1 && !data.joblocation.includes("Remote")) {
    url = `https://www.naukri.com/jobapi/v3/search?noOfResults=20&urlType=search_by_key_loc&searchType=adv&location=${job_cities}&keyword=${jobs_title}&sort=f&pageNo=1&experience=${job_exp}&wfhType=0`;
  } else if (data.joblocation.length === 1 && data.joblocation.includes("Remote")) {
    url = `https://www.naukri.com/jobapi/v3/search?noOfResults=20&urlType=search_by_key_loc&searchType=adv&location=Remote&keyword=${jobs_title}&sort=f&pageNo=1&experience=${job_exp}&wfhType=2`;
  }

  // Remove redundant spaces if any
  url = url.trim();

  return url;
};

export const get_naukarijob = async (data) => {
  try {
    const result = await get_jobs(data);
    return result;
  } catch (error) {
    console.log("Error in get_naukarijob:", error.message || error);
    return { success: false };
  }
};
