const mongoose = require('mongoose');

const weightRecordSchema = new mongoose.Schema({
  id: { type: String, required: true },
  userId: { type: String, required: true, index: true },
  weight: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  note: { type: String, default: '' }
});

weightRecordSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('WeightRecord', weightRecordSchema);
