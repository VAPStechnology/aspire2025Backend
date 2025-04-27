import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
    },
    aadhaar: {
      type: String,
    },
    avatar: String,
    agreementSigned: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    loginLogs: [Date],
  },
  {
    timestamps: true, // adds createdAt and updatedAt fields
  }
);

const User = mongoose.model('User', userSchema);
export default User; // Use ES6 export for consistency
