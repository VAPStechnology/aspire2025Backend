import mongoose from 'mongoose';

const userDocumentSchema = new mongoose.Schema(
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
      required: [true, 'Aadhaar is required'],
    },
    isRegistered: {
      type: Boolean,
      default: false,
    },
    photo: String,
    signature: String,
  },
  {
    timestamps: true, // ✅ this goes here
  }
);

const UserDocument = mongoose.model('UserDocuments', userDocumentSchema);
export default UserDocument;
