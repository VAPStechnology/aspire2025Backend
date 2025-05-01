import UserDocument from '../models/userDocument.model.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { broadcast } from '../config/websocket.js';
import sendMail from '../config/nodemailer.js';
import OTP from '../models/otp.model.js';





const sendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Validate Email
  if (!email || typeof email !== 'string' || !email.trim()) {
    throw new ApiError(400, 'Valid email is required');
  }

  const trimmedEmail = email.trim();
  
  // Log the email being used to send OTP
  // console.log("Sending OTP to:", trimmedEmail);

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Update OTP in database or create new record
  await OTP.findOneAndUpdate(
    { email: trimmedEmail },
    { otp, verified: false, createdAt: new Date() },
    { upsert: true }
  );
  // Send email with OTP
  try {
    await sendMail({
      to: trimmedEmail,
      subject: 'Email Verification Code',
      html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2 style="color: #333;">Email Verification</h2>
      <p>Hello,</p>
      <p>Your One-Time Password (OTP) for email verification is:</p>
      <h3 style="color: #007BFF;">${otp}</h3>
      <p>This code is valid for <strong>10 minutes</strong>. Please do not share this code with anyone.</p>
      <p>If you did not request this, please ignore this email.</p>
      <br/>
      <p>Regards,<br/>Team aspirecareerconsultancy</p>
    </div>
  `
    });
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new ApiError(500, 'Failed to send OTP email');
  }

  res.json(new ApiResponse(200, null, 'OTP sent to email'));
});


////////////////////////////////////////////////////////////////////////////////////////////////
const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  console.log("Received email:", email);
  console.log("Received otp:", otp);

  const record = await OTP.findOne({ email });

  if (!record) {
    console.error('No OTP record found for email:', email);
    throw new ApiError(400, 'Invalid or expired OTP');
  }

  console.log("Stored OTP in DB:", record.otp);
  console.log("Stored createdAt:", record.createdAt);

  // Optional: Expiry logic (10 minutes)
  const now = new Date();
  const createdAt = new Date(record.createdAt);
  const diffMinutes = (now - createdAt) / 1000 / 60;

  if (diffMinutes > 10) {
    console.error("OTP expired:", diffMinutes, "minutes ago");
    throw new ApiError(400, 'OTP expired, please request a new one');
  }

  // Compare with type-safe, trimmed values
  if (record.otp.toString().trim() !== otp.toString().trim()) {
    console.error("OTP mismatch. Received:", otp, " | Stored:", record.otp);
    throw new ApiError(400, 'Invalid or expired OTP');
  }

  // Mark as verified
  record.verified = true;
  await record.save();

  console.log("OTP verified successfully for:", email);
  res.json(new ApiResponse(200, null, 'OTP verified successfully'));
});


/////////////////////////////////////////////////////////////////////////////////////

const uploadDocuments = asyncHandler(async (req, res) => {
  const { name, email, phone,avatar, aadhaar, signature } = req.body;

  // === Validate Fields ===
  if (!name?.trim() || !email?.trim() || !phone?.trim()) {
    throw new ApiError(400, 'Fields name, email, and phone are required.');
  }

  // Validate Email Format
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!isValidEmail) {
    throw new ApiError(400, 'Invalid email format.');
  }

  // Validate Phone Format
  const isValidPhone = /^\d{10}$/.test(phone);
  if (!isValidPhone) {
    throw new ApiError(400, 'Invalid phone format. Must be 10 digits.');
  }

  // === Extract File Paths ===
  // const photoPath = req.files?.photo?.[0]?.path || null;
  // const aadhaarPath = req.files?.aadhaar?.[0]?.path || null;
  // const signaturePath = req.files?.signature?.[0]?.path || null;

  if (!avatar || !aadhaar || !signature) {
    throw new ApiError(400, 'All files (avatar, aadhaar, signature) are required.');
  }

  // === Find or Create ===
  let userDoc = await UserDocument.findOne({ email });

  if (userDoc) {
    userDoc.set({
      name,
      phone,
      aadhaar: aadhaar || userDoc.aadhaar,
      photo: avatar || userDoc.photo,
      signature: signature || userDoc.signature,
    });
  } else {
    userDoc = await UserDocument.create({
      name,
      email,
      phone,
      aadhaar: aadhaar,
      photo: avatar,
      signature: signature,
    });
  }

  await userDoc.save();

  // === WebSocket Broadcast ===
  broadcast(
    JSON.stringify({
      event: 'DOCUMENT_UPLOADED',
      email: userDoc.email,
      userId: userDoc._id,
      message: 'User uploaded documents successfully',
    })
  );

  res.json(new ApiResponse(200, userDoc, 'Documents uploaded successfully'));
});

///////////////////////////////////////////////////////////////////////




export { uploadDocuments, verifyOtp, sendOtp };
