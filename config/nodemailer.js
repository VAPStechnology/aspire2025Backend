import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const sendMail = async ({ to, subject, text = '', html = '', attachments = [] }) => {
  // Validate recipient email
  if (!to || typeof to !== 'string' || !to.trim()) {
    // console.error('Recipient email address is required');
    throw new Error('Recipient email address is required');
  }

  // Log the email sending attempt
  // console.log(`Preparing to send email to: ${to}`);

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to.trim(),
      subject,
      text,
      ...(html && { html }),
      ...(attachments.length > 0 && { attachments }),
    };

    // Log mail options before sending
    // console.log("Mail options:", mailOptions);

    // Send the email
    await transporter.sendMail(mailOptions);
  } catch (error) {
    // console.error("Error sending email:", error);
    throw new Error("Error sending email: " + error.message);
  }
};

export default sendMail;
