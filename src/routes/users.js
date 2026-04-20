const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// 获取所有用户（裁判员用）
router.get('/all', auth, async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 获取单个用户信息
router.get('/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ id: userId }, { password: 0 });
    
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 更新用户信息
router.put('/update', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const { currentWeight, totalWorkouts, badges, streakDays, avatar, phone } = req.body;
    
    const updateData = {};
    if (currentWeight !== undefined) updateData.currentWeight = currentWeight;
    if (totalWorkouts !== undefined) updateData.totalWorkouts = totalWorkouts;
    if (badges !== undefined) updateData.badges = badges;
    if (streakDays !== undefined) updateData.streakDays = streakDays;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (phone !== undefined) updateData.phone = phone;
    
    const user = await User.findOneAndUpdate(
      { id: userId },
      updateData,
      { new: true, select: '-password' }
    );
    
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    console.error('更新用户信息错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 修改密码
router.put('/change-password', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: '请提供原密码和新密码' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: '新密码至少6位' });
    }
    
    const user = await User.findOne({ id: userId });
    
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    
    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ success: false, message: '原密码错误' });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    
    res.json({ success: true, message: '密码修改成功' });
  } catch (error) {
    console.error('修改密码错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 修改昵称
router.put('/change-nickname', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const { nickname } = req.body;
    
    if (!nickname || nickname.trim().length < 2) {
      return res.status(400).json({ success: false, message: '昵称至少2个字符' });
    }
    
    // 检查昵称是否已被其他用户使用
    const existingUser = await User.findOne({ 
      id: { $ne: userId },
      nickname: { $regex: new RegExp(`^${nickname}$`, 'i') }
    });
    
    if (existingUser) {
      return res.status(400).json({ success: false, message: '该昵称已被使用' });
    }
    
    const user = await User.findOneAndUpdate(
      { id: userId },
      { nickname: nickname.trim() },
      { new: true, select: '-password' }
    );
    
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    console.error('修改昵称错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

module.exports = router;
