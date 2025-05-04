import mongoose from 'mongoose';

const agreementSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        form: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Form',
            required: false, // Optional if agreement is standalone
        },
        agreementText: {
            type: String,
            required: true,
        },
        signature: {
            type: String, // Base64 string or URL (e.g., from Cloudinary)
            required: true,
        },
        signedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

const Agreement = mongoose.model('Agreement', agreementSchema);
export default Agreement;
