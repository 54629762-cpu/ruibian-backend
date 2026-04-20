const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  id: { type: String, required: true },
  userId: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const workoutPostSchema = new mongoose.Schema({
  id: { type: String, required: true },
  userId: { type: String, required: true, index: true },
  workoutType: { type: String, required: true },
  duration: { type: Number, required: true },
  content: { type: String, required: true },
  image: { type: String, default: '' },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: String }],
  comments: [commentSchema],
  createdAt: { type: Date, default: Date.now }
});

workoutPostSchema.index({ createdAt: -1 });

module.exports = mongoose.model('WorkoutPost', workoutPostSchema);
