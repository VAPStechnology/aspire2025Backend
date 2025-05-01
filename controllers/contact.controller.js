import ContactMessage from '../models/contact.model.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import sendMail from '../config/nodemailer.js';

const submitContactForm = asyncHandler(async (req, res) => {
  const { name, email, phone, message } = req.body;

  // === Validate ===
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    throw new ApiError(400, 'Name, email, and message are required.');
  }

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!isValidEmail) {
    throw new ApiError(400, 'Invalid email format.');
  }

  if (phone && !/^\d{10}$/.test(phone)) {
    throw new ApiError(400, 'Phone must be 10 digits.');
  }

  // === Update if same email exists, else create new ===
  const contact = await ContactMessage.findOneAndUpdate(
    { email },
    { name, phone, message },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  // === Notify via Email ===
  try {
    await sendMail({
      to: process.env.ADMIN_EMAIL,
      from: `"Aspire Career Consultancy" <no-reply@yourdomain.com>`, // Must be a verified domain
      subject: 'New Contact Us Submission',
      text: `
New Contact Us Submission:

Name: ${name}
Email: ${email}
Phone: ${phone || 'N/A'}
Message: ${message}
      `,
      html: `
<div style="font-family: Arial, sans-serif; line-height: 1.6;">
  <h2 style="color: #333;">New Contact Us Submission</h2>
  <p><strong>Name:</strong> ${name}</p>
  <p><strong>Email:</strong> ${email}</p>
  <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
  <p><strong>Message:</strong><br/>${message}</p>
  <br/>
  <p style="font-size: 12px; color: #777;">
    This email was sent from the contact form on aspirecareerconsultancy.com
  </p>
</div>
      `,
    });
  } catch (error) {
    console.error('Failed to send contact notification:', error);
  }

  res.json(new ApiResponse(200, contact, 'Message submitted successfully'));
});

export { submitContactForm };
