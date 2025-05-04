import mongoose from 'mongoose';

const formSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    data: {
      type: Object, // You can replace this with a more detailed schema if desired
      required: true,
    },
    submitted: {
      type: Boolean,
      default: false,
    },
    submittedAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

const Form = mongoose.model('Form', formSchema);
export default Form;
