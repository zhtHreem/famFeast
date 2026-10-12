import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 30 },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    bio: { type: String, default: '', maxlength: 300 },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    savedRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
    pantry: [{ type: String }],
    isDemo: { type: Boolean, default: false }, // sample community accounts (see scripts/seed-community.js)
  },
  { timestamps: true }
);

// Hash the password before saving the user
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (err) {
    next(err);
  }
});

UserSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Never leak the hash or email in JSON output by accident.
UserSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
