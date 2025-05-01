// middleware/checkBlacklist.js
import BlacklistedToken from '../models/blacklistedToken.model.js';

const checkBlacklist = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (token) {
    const blacklisted = await BlacklistedToken.findOne({ token });
    if (blacklisted) {
      return res.status(401).json({ success: false, message: 'Token is blacklisted. Please login again.' });
    }
  }

  next();
};

export default checkBlacklist;
