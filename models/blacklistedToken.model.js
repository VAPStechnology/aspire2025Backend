// models/blacklistedToken.model.js
import mongoose from 'mongoose';

const blacklistedTokenSchema = new mongoose.Schema({
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
});

blacklistedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete after expiry

export default mongoose.model('BlacklistedToken', blacklistedTokenSchema);
