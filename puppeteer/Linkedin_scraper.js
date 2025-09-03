import axios from "axios";
import * as cheerio from "cheerio"

// 1) Your simple options (as provided)
// const opts = {
//   keyword: "Frontend Developer",
//   location: "India",
//   dateSincePosted: "24hr",
//   jobType: "full time",
//   remoteFilter: "remote",
//   salary: "100000", // kept as string per your message (works; we coerce)
//   experienceLevel: "entry level",
//   limit: "10", // string is okay; we coerce below
//   sortBy: "recent",
//   page: "0",
// };

// 2) Helpers to map human inputs to LinkedIn codes
function normalizePlus(str) {
  return (str || "").trim().replace(/\s+/g, "+");
}
function mapDateSincePosted(v = "") {
  const m = { "past month": "r2592000", "past week": "r604800", "24hr": "r86400" };
  return m[v.toLowerCase()] || "";
}
function mapExperienceLevel(v = "") {
  const m = { internship: "1", "entry level": "2", associate: "3", senior: "4", director: "5", executive: "6" };
  return m[v.toLowerCase()] || "";
}
function mapJobType(v = "") {
  const m = { "full time": "F", "full-time": "F", "part time": "P", "part-time": "P", contract: "C", temporary: "T", volunteer: "V", internship: "I" };
  return m[v.toLowerCase()] || "";
}
function mapRemoteFilter(v = "") {
  const m = { "on-site": "1", "on site": "1", remote: "2", hybrid: "3" };
  return m[v.toLowerCase()] || "";
}
function mapSalary(val) {
  const n = Number(val);
  const m = { 40000: "1", 60000: "2", 80000: "3", 100000: "4", 120000: "5" };
  return m[n] || "";
}

// 3) Build the LinkedIn URL
function buildUrl(o) {
  const host = "www.linkedin.com";
  const params = new URLSearchParams();

  const keyword = normalizePlus(o.keyword);
  const location = normalizePlus(o.location);
  if (keyword) params.append("keywords", keyword);
  if (location) params.append("location", location);

  const f_TPR = mapDateSincePosted(o.dateSincePosted);
  if (f_TPR) params.append("f_TPR", f_TPR);

  const f_SB2 = mapSalary(o.salary);
  if (f_SB2) params.append("f_SB2", f_SB2);

  const f_E = mapExperienceLevel(o.experienceLevel);
  if (f_E) params.append("f_E", f_E);

  const f_WT = mapRemoteFilter(o.remoteFilter);
  if (f_WT) params.append("f_WT", f_WT);

  const f_JT = mapJobType(o.jobType);
  if (f_JT) params.append("f_JT", f_JT);

  // these flags can be included even if false
  params.append("f_VJ", "false");
  params.append("f_EA", "false");

  const page = Number(o.page) || 0;
  params.append("start", page * 25);

  if (o.sortBy === "recent") params.append("sortBy", "DD");
  else if (o.sortBy === "relevant") params.append("sortBy", "R");

  return `https://${host}/jobs-guest/jobs/api/seeMoreJobPostings/search?${params.toString()}`;
}

// 4) Parse the HTML for jobs
function parseJobs(html) {
  const $ = cheerio.load(html);
  return $("li")
    .map((i, el) => {
      const job = $(el);
      const position = job.find(".base-search-card__title").text().trim();
      const company = job.find(".base-search-card__subtitle").text().trim();
      if (!position || !company) return null;

      const location = job.find(".job-search-card__location").text().trim();
      const date = job.find("time").attr("datetime");
      const salary = job.find(".job-search-card__salary-info").text().trim().replace(/\s+/g, " ") || "Not specified";
      const jobUrl = job.find(".base-card__full-link").attr("href") || "";
      const companyLogo = job.find(".artdeco-entity-image").attr("data-delayed-url") || "";
      const agoTime = job.find(".job-search-card__listdate").text().trim() || "";

      return { position, company, location, date, salary, jobUrl, companyLogo, agoTime };
    })
    .get()
    .filter(Boolean);
}

// 5) Run once: build URL, log it, fetch, parse, print up to limit
export const linkedin_scraper = async (opts) => {
  const url = buildUrl(opts);
  console.log("Request URL:");
  console.log(url); // <- exact URL before making the GET request

  const headers = {
    "User-Agent": "Mozilla/5.0",
    "X-Requested-With": "XMLHttpRequest",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,/;q=0.8",
    "Referer": "https://www.linkedin.com/jobs",
  };

  try {
    const res = await axios.get(url, { headers, timeout: 10000, validateStatus: (s) => s === 200 });
    let jobs = parseJobs(res.data);
    const limit = Number(opts.limit) || 0;
    if (limit && jobs.length > limit) jobs = jobs.slice(0, limit);
    console.log("Jobs:", jobs);
    return {data:jobs,sucess:true}
  } catch (err) {
    console.error("Error fetching jobs:", err.message);
    return {sucess:false}
  }
}