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
      required: [true, 'Aadhaar number is required'],
      length: [12, 'Aadhaar number should be 12 digits'],
    },
    avatar: {
      type: String,
    },
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
    loginLogs: [
      {
        type: Date,
      },
    ],
    token: {  // Add token field for storing JWT
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

const User = mongoose.model('User', userSchema);
export default User;
