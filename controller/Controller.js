import nodemailer from "nodemailer";

// Create a test account or replace with real credentials.


// const data = [
//   {
//     title: "Software Engineer",
//     company: "Google",
//     location: "Mountain View, CA",
//     link: "https://careers.google.com/jobs/results/123456789-software-engineer/",
//   },
//   {
//     title: "Senior Product Manager",
//     company: "Microsoft",
//     location: "Redmond, WA",
//     link: "https://careers.microsoft.com/jobs/results/987654321-product-manager/",
//   },
//   {
//     title: "Data Scientist",
//     company: "Amazon",
//     location: "Seattle, WA",
//     link: "https://www.amazon.jobs/en/jobs/data-scientist-123/",
//   },
//   {
//     title: "UX Designer",
//     company: "Apple",
//     location: "Cupertino, CA",
//     link: "https://jobs.apple.com/en-us/details/UX-Designer-456/",
//   },
//   {
//     title: "DevOps Engineer",
//     company: "Meta",
//     location: "Menlo Park, CA",
//     link: "https://www.metacareers.com/jobs/devops-engineer-789/",
//   },
// ];

// Function to generate the HTML content for the email
const generateEmailHtml = (jobData,jobportal) => {
  const jobListingsHtml = jobData
    .map(
      (job) => `
      <tr>
        <td style="padding: 20px; border: 1px solid #eee; border-radius: 8px; margin-bottom: 15px; display: block; background-color: #fafafa;">
          <h3 style="margin: 0 0 8px 0; font-size: 18px; color: #2c3e50;">${job.title}</h3>
          <p style="margin: 0 0 4px 0; font-size: 14px; color: #555;"><strong>🏢 Company:</strong> ${job.companyName}</p>
          <p style="margin: 0 0 10px 0; font-size: 14px; color: #555;"><strong>📍 Location:</strong> ${job.location}</p>
          <a href="${job.link}" target="_blank" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: #fff; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 14px;">Apply Now</a>
        </td>
      </tr>
    `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Your Job Alerts</title>
      <style>
        body {
          font-family: 'Segoe UI', sans-serif;
          background-color: #f4f4f4;
          padding: 0;
          margin: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background: #ffffff;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          overflow: hidden;
        }
        .header {
          background-color: #4CAF50;
          color: white;
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 26px;
        }
        .header p {
          margin: 5px 0 0;
          font-size: 15px;
        }
        .content {
          padding: 25px 30px;
        }
        .content p {
          font-size: 16px;
          color: #333333;
          line-height: 1.5;
        }
        .footer {
          background-color: #f0f0f0;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #888;
        }
        @media only screen and (max-width: 600px) {
          .container {
            width: 100% !important;
            border-radius: 0;
            box-shadow: none;
          }
          .content {
            padding: 20px;
          }
          .header, .footer {
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h3>Your Latest Job Alerts from ${jobportal} 🚀</h3>
          <p>${jobData.length} new ${jobData.length === 1 ? 'job' : 'jobs'} picked for you</p>
        </div>

        <div class="content">
          <p>Hello there 👋,</p>
          <p>We’ve handpicked some job opportunities that match your preferences. Explore them below and click “Apply Now” to get started:</p>

          <table role="presentation" style="width: 100%; border-spacing: 0;">
            ${jobListingsHtml}
          </table>

          <p style="margin-top: 30px;">
            🔔 You'll receive job updates based on your plan preferences. Stay tuned!
          </p>
          <p>
            Best,<br>
            <strong>JobHawk Team</strong>
          </p>
        </div>

        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} JobHawk. All rights reserved.</p>
          <p>You’re receiving this email because you subscribed to job alerts.</p>
          <p><a href="#" style="color: #888888; text-decoration: underline;">Unsubscribe</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
};


export const SendMail = async (jobdata,data) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: "omagrahari55@gmail.com",
        pass: process.env.Email_password, // Your App Password
      },
    });
    const emailHtml = generateEmailHtml(jobdata,data.jobportal); // Generate HTML with your job data

    const info = await transporter.sendMail({
      from: 'omagrahari55@gmail.com',
      to: data.email, // Replace with recipient email
      subject: `Your Latest ${data.jobtype} Opportunities! 🚀`,
      html: emailHtml, // Use the generated HTML content
    });

    console.log("Message sent:", info.messageId);

  } catch (error) {
    console.error("Error sending email:", error);
  
  }
};
