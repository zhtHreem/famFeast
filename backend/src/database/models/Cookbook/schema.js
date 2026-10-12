import mongoose from 'mongoose';
import crypto from 'crypto';

export const newInviteCode = () => crypto.randomBytes(4).toString('hex').toUpperCase(); // e.g. 9F3A12BC

const cookbookSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, default: '', trim: true, maxlength: 500 },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [
      {
        _id: false,
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        role: { type: String, enum: ['owner', 'member'], default: 'member' },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    inviteCode: { type: String, unique: true, default: newInviteCode },
  },
  { timestamps: true }
);

cookbookSchema.index({ 'members.user': 1 });

export default mongoose.models.Cookbook || mongoose.model('Cookbook', cookbookSchema);
