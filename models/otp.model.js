import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  otp: { type: String, required: true },
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, expires: 300 }, // auto deletes after 5 mins
});


const OTP = mongoose.model('OTP', otpSchema);

export default OTP;
