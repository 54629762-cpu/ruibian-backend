const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  id: { type: String, required: true },
  userId: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const confessionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  userId: { type: String, required: true, index: true },
  content: { type: String, required: true },
  emoji: { type: String, default: '😋' },
  image: { type: String, default: '' },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: String }],
  comments: [commentSchema],
  createdAt: { type: Date, default: Date.now }
});

confessionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Confession', confessionSchema);
