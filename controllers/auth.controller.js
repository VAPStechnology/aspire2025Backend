import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import sendMail from '../config/nodemailer.js';
import BlacklistedToken from '../models/blacklistedToken.model.js';

// Helper function for email validation
const isValidEmail = (email) => {
  const emailRegex = /^\S+@\S+\.\S+$/;
  return emailRegex.test(email);
};

// Helper function for phone number validation (basic)
const isValidPhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/; // Indian mobile numbers
  return phoneRegex.test(phone);
};

// Generate JWT token (Access Token)
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1d' }); // Access token expires in 1 day
};

// Generate Refresh Token
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' }); // Refresh token expires in 7 days
};


// Verify Token
const verifyToken = asyncHandler(async(req,res)=>{
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(400, 'Authorization token not provided');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the token is blacklisted
    const blacklistedToken = await BlacklistedToken.findOne({ token });
    if (blacklistedToken) {
      throw new ApiError(400, 'Token is blacklisted');
    }

    // Return a response with token validity information
    res.json(new ApiResponse(200, { isValid: true, decoded }, 'Token is valid'));
  } catch (error) {
    console.error('Token verification error:', error.message);
    throw new ApiError(400, 'Invalid or expired token');
  }
});

// Register new user
const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password, aadhaar, isAdmin } = req.body;
  if (!name || !email || !phone || !password || !aadhaar) {
    throw new ApiError(400, 'All fields are required');
  }

  // Validate the inputs
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    throw new ApiError(400, 'Valid name is required');
  }
  if (!email || !isValidEmail(email)) {
    throw new ApiError(400, 'Valid email is required');
  }
  if (!phone || !isValidPhone(phone)) {
    throw new ApiError(400, 'Valid phone number is required');
  }
  if (!password || password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters');
  }
  if (!aadhaar || typeof aadhaar !== 'string' || aadhaar.length !== 12) {
    throw new ApiError(400, 'Valid Aadhaar number is required (12 digits)');
  }

  // Check if the user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new ApiError(400, 'User already exists with this email');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user
  const user = await User.create({ name, email, phone, password: hashedPassword, aadhaar, isAdmin });

  const accessToken = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  res.status(201).json(new ApiResponse(200, { accessToken, refreshToken, user }, 'User registered successfully'));

  if (user) {
    try {
      await sendMail({
        to: email,
        subject: 'Your Account Credentials',
        text: `Hello ${name}, your login email is ${email} and password is ${password}.`, // fallback plain text 
        html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2>Welcome to Our Platform, ${name}!</h2>
            <p>Thank you for registering with us. We are excited to have you on board!</p>
            <p>To get started, please use the following credentials to log in</p>
            <p>Here are your login credentials:</p>
            <table style="border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; font-weight: bold;">Email:</td>
                <td style="padding: 8px;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold;">Password:</td>
                <td style="padding: 8px;">${password}</td>
              </tr>
            </table>
            <br/>
            <a href="${process.env.FRONTEND_URL}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">Login Now</a>
            <br/><br/>
            <p>Thank you,<br/>Team aspirecarrerconsultency</p>
          </div>
        `,
      });
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  }
});

// Login user
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate the inputs
  if (!email || !isValidEmail(email)) {
    throw new ApiError(400, 'Valid email is required');
  }
  if (!password || password.length < 6) {
    throw new ApiError(400, 'Valid password is required');
  }

  // Find the user by email
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Check if the user is blocked
  if (user.isBlocked) {
    throw new ApiError(403, 'User account is blocked');
  }

  // Log the login time
  user.loginLogs.push(new Date());
  await user.save();

  const accessToken = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  res.json(new ApiResponse(200, { accessToken, refreshToken, id: user._id, isAdmin: user.isAdmin }, 'Login successful'));
});

// Refresh Access Token using Refresh Token
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: refreshTokenFromClient } = req.body;

  if (!refreshTokenFromClient) {
    throw new ApiError(400, 'Refresh token is required');
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshTokenFromClient, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const newAccessToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    res.json(new ApiResponse(200, { accessToken: newAccessToken, refreshToken: newRefreshToken }, 'Token refreshed successfully'));
  } catch (error) {
    throw new ApiError(400, 'Invalid or expired refresh token');
  }
});

// Logout user (add to blacklist)
const logout = asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(400, 'Authorization token not provided');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      ignoreExpiration: true, // Allows blacklisting even if token has expired
    });

    if (!decoded?.id || !decoded?.exp) {
      throw new ApiError(400, 'Invalid token structure');
    }

    const expiresAt = new Date(decoded.exp * 1000);

    if (isNaN(expiresAt.getTime())) {
      throw new ApiError(400, 'Invalid expiration time in token');
    }

    // Add token to blacklist for invalidation
    await BlacklistedToken.create({ token, expiresAt });

    await User.findByIdAndUpdate(decoded.id, {
      $unset: { refreshToken: 1 },
    });

    return res
      .status(200)
      .clearCookie('accessToken')
      .clearCookie('refreshToken')
      .json(new ApiResponse(200, null, 'Logged out successfully'));
  } catch (error) {
    console.error('Logout error:', error.message);
    throw new ApiError(400, 'Invalid or expired token');
  }
});

// Update user profile (for admin)
const updateUserProfile = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { name, email, phone, aadhaar, isAdmin } = req.body;

  // Validate the inputs
  if (!userId) {
    throw new ApiError(400, 'User ID is required');
  }
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    throw new ApiError(400, 'Valid name is required');
  }
  if (!email || !isValidEmail(email)) {
    throw new ApiError(400, 'Valid email is required');
  }
  if (!phone || !isValidPhone(phone)) {
    throw new ApiError(400, 'Valid phone number is required');
  }
  if (!aadhaar || typeof aadhaar !== 'string' || aadhaar.length !== 12) {
    throw new ApiError(400, 'Valid Aadhaar number is required (12 digits)');
  }

  // Find the user by ID and update
  const user = await User.findByIdAndUpdate(
    userId,
    { name, email, phone, aadhaar, isAdmin },
    { new: true }
  );
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.json(new ApiResponse(200, user, 'User profile updated successfully'));
});

// Delete user (for admin)
const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, 'User ID is required');
  }

  // Find the user by ID and delete
  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.json(new ApiResponse(200, null, 'User deleted successfully'));
});

export {
  register,
  login,
  refreshToken,
  logout,
  updateUserProfile,
  deleteUser,
  verifyToken,
  generateToken,
};
