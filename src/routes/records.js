const express = require('express');
const WeightRecord = require('../models/WeightRecord');
const WorkoutRecord = require('../models/WorkoutRecord');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

const generateId = () => Math.random().toString(36).substring(2, 15);

// ========== 体重记录 ==========

// 添加体重记录
router.post('/weight', auth, async (req, res) => {
  try {
    const { weight, date, note } = req.body;
    const userId = req.userId;
    
    if (!weight || weight <= 0) {
      return res.status(400).json({ success: false, message: '请输入有效的体重' });
    }
    
    const record = new WeightRecord({
      id: generateId(),
      userId,
      weight,
      date: date ? new Date(date) : new Date(),
      note: note || ''
    });
    
    await record.save();
    
    // 更新用户当前体重
    await User.findOneAndUpdate(
      { id: userId },
      { currentWeight: weight }
    );
    
    res.json({ success: true, record });
  } catch (error) {
    console.error('添加体重记录错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 获取用户的体重记录
router.get('/weight/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const records = await WeightRecord.find({ userId }).sort({ date: -1 });
    res.json({ success: true, records });
  } catch (error) {
    console.error('获取体重记录错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 获取当前用户的体重记录
router.get('/weight', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const records = await WeightRecord.find({ userId }).sort({ date: -1 });
    res.json({ success: true, records });
  } catch (error) {
    console.error('获取体重记录错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 删除体重记录
router.delete('/weight/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    const record = await WeightRecord.findOneAndDelete({ id, userId });
    
    if (!record) {
      return res.status(404).json({ success: false, message: '记录不存在' });
    }
    
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('删除体重记录错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// ========== 运动记录 ==========

// 添加运动记录
router.post('/workout', auth, async (req, res) => {
  try {
    const { type, duration, date, note } = req.body;
    const userId = req.userId;
    
    if (!type) {
      return res.status(400).json({ success: false, message: '请选择运动类型' });
    }
    
    if (!duration || duration <= 0) {
      return res.status(400).json({ success: false, message: '请输入有效的运动时长' });
    }
    
    const record = new WorkoutRecord({
      id: generateId(),
      userId,
      type,
      duration,
      date: date ? new Date(date) : new Date(),
      note: note || ''
    });
    
    await record.save();
    
    // 增加用户运动次数
    await User.findOneAndUpdate(
      { id: userId },
      { $inc: { totalWorkouts: 1 } }
    );
    
    res.json({ success: true, record });
  } catch (error) {
    console.error('添加运动记录错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 获取用户的运动记录
router.get('/workout/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const records = await WorkoutRecord.find({ userId }).sort({ date: -1 });
    res.json({ success: true, records });
  } catch (error) {
    console.error('获取运动记录错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 获取当前用户的运动记录
router.get('/workout', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const records = await WorkoutRecord.find({ userId }).sort({ date: -1 });
    res.json({ success: true, records });
  } catch (error) {
    console.error('获取运动记录错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 删除运动记录
router.delete('/workout/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    const record = await WorkoutRecord.findOneAndDelete({ id, userId });
    
    if (!record) {
      return res.status(404).json({ success: false, message: '记录不存在' });
    }
    
    // 减少用户运动次数
    await User.findOneAndUpdate(
      { id: userId },
      { $inc: { totalWorkouts: -1 } }
    );
    
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('删除运动记录错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

module.exports = router;
