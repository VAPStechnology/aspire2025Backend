import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import OTP from "../models/otp.model.js";
const checkEmailVerified = asyncHandler(async (req, res, next) => {
    const { email } = req.body;
    const record = await OTP.findOne({ email });
  
    if (!record?.verified) {
      throw new ApiError(403, 'Email not verified via OTP');
    }
  
    next();
  });
  
  export default checkEmailVerified;