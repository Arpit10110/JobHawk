import nodemailer from "nodemailer";

// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: "omagrahari55@gmail.com",
    pass: process.env.Email_password, // Your App Password
  },
});

const data = [
  {
    title: "Software Engineer",
    company: "Google",
    location: "Mountain View, CA",
    link: "https://careers.google.com/jobs/results/123456789-software-engineer/",
  },
  {
    title: "Senior Product Manager",
    company: "Microsoft",
    location: "Redmond, WA",
    link: "https://careers.microsoft.com/jobs/results/987654321-product-manager/",
  },
  {
    title: "Data Scientist",
    company: "Amazon",
    location: "Seattle, WA",
    link: "https://www.amazon.jobs/en/jobs/data-scientist-123/",
  },
  {
    title: "UX Designer",
    company: "Apple",
    location: "Cupertino, CA",
    link: "https://jobs.apple.com/en-us/details/UX-Designer-456/",
  },
  {
    title: "DevOps Engineer",
    company: "Meta",
    location: "Menlo Park, CA",
    link: "https://www.metacareers.com/jobs/devops-engineer-789/",
  },
];

// Function to generate the HTML content for the email
const generateEmailHtml = (jobData) => {
  let jobListingsHtml = '';
  jobData.forEach((job) => {
    jobListingsHtml += `
      <tr>
        <td style="padding: 15px; border-bottom: 1px solid #eee;">
          <h3 style="margin: 0 0 5px 0; font-size: 18px; color: #333333;">${job.title}</h3>
          <p style="margin: 0 0 5px 0; font-size: 14px; color: #666666;"><strong>Company:</strong> ${job.company}</p>
          <p style="margin: 0 0 10px 0; font-size: 14px; color: #666666;"><strong>Location:</strong> ${job.location}</p>
          <a href="${job.link}" style="display: inline-block; padding: 8px 15px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px; font-size: 14px;">Apply Now</a>
        </td>
      </tr>
    `;
  });

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Latest Job Opportunities</title>
        <style>
            body {
                font-family: 'Inter', sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
                -webkit-text-size-adjust: 100%;
                -ms-text-size-adjust: 100%;
            }
            table {
                border-collapse: collapse;
                width: 100%;
            }
            td, th {
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
            .header {
                background-color: #4CAF50;
                padding: 30px 20px;
                color: #ffffff;
                text-align: center;
                border-top-left-radius: 8px;
                border-top-right-radius: 8px;
            }
            .content {
                padding: 20px 30px;
            }
            .job-listing {
                background-color: #f9f9f9;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                margin-bottom: 15px;
                padding: 15px;
            }
            .job-listing h3 {
                color: #333333;
                margin-top: 0;
                margin-bottom: 10px;
            }
            .job-listing p {
                color: #666666;
                font-size: 14px;
                line-height: 1.5;
                margin-bottom: 5px;
            }
            .job-listing a {
                display: inline-block;
                background-color: #007bff;
                color: #ffffff;
                padding: 10px 20px;
                text-decoration: none;
                border-radius: 5px;
                font-size: 14px;
                margin-top: 10px;
            }
            .footer {
                background-color: #f0f0f0;
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #888888;
                border-bottom-left-radius: 8px;
                border-bottom-right-radius: 8px;
            }
            @media only screen and (max-width: 600px) {
                .container {
                    width: 100% !important;
                    margin: 0 !important;
                    border-radius: 0 !important;
                    box-shadow: none !important;
                }
                .content {
                    padding: 15px !important;
                }
                .header {
                    border-radius: 0 !important;
                }
                .footer {
                    border-radius: 0 !important;
                }
            }
        </style>
    </head>
    <body>
        <div style="background-color: #f4f4f4; padding: 20px 0;">
            <table role="presentation" class="container" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                <tr>
                    <td>
                        <table role="presentation" class="header" style="background-color: #4CAF50; padding: 30px 20px; color: #ffffff; text-align: center; border-top-left-radius: 8px; border-top-right-radius: 8px; width: 100%;">
                            <tr>
                                <td>
                                    <h1 style="margin: 0; font-size: 28px;">Your Latest Job Opportunities</h1>
                                    <p style="margin: 10px 0 0 0; font-size: 16px;">Exciting roles waiting for you!</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td class="content" style="padding: 20px 30px;">
                        <p style="font-size: 16px; color: #333333; line-height: 1.6;">Hello there,</p>
                        <p style="font-size: 16px; color: #333333; line-height: 1.6;">Here are some of the latest job openings that might interest you. Click on the "Apply Now" button to learn more and apply directly.</p>

                        <table role="presentation" style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                            ${jobListingsHtml}
                        </table>

                        <p style="font-size: 16px; color: #333333; line-height: 1.6; margin-top: 30px;">
                            We hope these opportunities help you in your career journey.
                        </p>
                        <p style="font-size: 16px; color: #333333; line-height: 1.6;">
                            Best regards,<br>
                            The Job Finder Team
                        </p>
                    </td>
                </tr>
                <tr>
                    <td>
                        <table role="presentation" class="footer" style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 12px; color: #888888; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; width: 100%;">
                            <tr>
                                <td>
                                    <p style="margin: 0;">&copy; 2024 Job Finder. All rights reserved.</p>
                                    <p style="margin: 5px 0 0 0;">You received this email because you subscribed to our job alerts.</p>
                                    <p style="margin: 5px 0 0 0;"><a href="#" style="color: #888888; text-decoration: underline;">Unsubscribe</a></p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </div>
    </body>
    </html>
  `;
};

export const SendMail = async (req, res) => {
  try {
    const emailHtml = generateEmailHtml(data); // Generate HTML with your job data

    const info = await transporter.sendMail({
      from: 'omagrahari55@gmail.com',
      to: "arpitkumaragrahari21@gmail.com", // Replace with recipient email
      subject: "Your Latest Job Opportunities! 🚀",
      html: emailHtml, // Use the generated HTML content
    });

    console.log("Message sent:", info.messageId);
    return res.json({
      success: true,
      message: "Email sent successfully",
    });

  } catch (error) {
    console.error("Error sending email:", error);
    return res.json({
      success: false,
      message: "Internal Server Error",
      error: error.message, // Send only the message for security
    });
  }
};
