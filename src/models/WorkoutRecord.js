const mongoose = require('mongoose');

const workoutRecordSchema = new mongoose.Schema({
  id: { type: String, required: true },
  userId: { type: String, required: true, index: true },
  type: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  note: { type: String, default: '' }
});

workoutRecordSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('WorkoutRecord', workoutRecordSchema);
