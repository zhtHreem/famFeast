import mongoose from 'mongoose';

const replySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  text: { type: String, required: true, trim: true, maxlength: 1000 },
  createdAt: { type: Date, default: Date.now },
});

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  text: { type: String, required: true, trim: true, maxlength: 1000 },
  replies: [replySchema],
  createdAt: { type: Date, default: Date.now },
  isDemo: { type: Boolean, default: false },
  recipeId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Recipe', index: true },
});

export default mongoose.models.Comment || mongoose.model('Comment', commentSchema);
