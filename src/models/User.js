const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  nickname: { type: String, required: true },
  avatar: { type: String, default: '🦋' },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  height: { type: Number, default: 170 },
  targetWeight: { type: Number, required: true },
  currentWeight: { type: Number, required: true },
  initialWeight: { type: Number, required: true },
  streakDays: { type: Number, default: 0 },
  totalWorkouts: { type: Number, default: 0 },
  badges: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

// 创建索引
userSchema.index({ nickname: 1 });
userSchema.index({ id: 1 });

module.exports = mongoose.model('User', userSchema);
