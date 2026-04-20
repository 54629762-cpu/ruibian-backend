const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// 生成唯一ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// 注册
router.post('/register', async (req, res) => {
  try {
    const { nickname, password, avatar, height, targetWeight, currentWeight } = req.body;
    
    // 验证必填字段
    if (!nickname || !password || !targetWeight || !currentWeight) {
      return res.status(400).json({ 
        success: false, 
        message: '请填写所有必填字段' 
      });
    }
    
    // 检查昵称是否已存在（不区分大小写）
    const existingUser = await User.findOne({ 
      nickname: { $regex: new RegExp(`^${nickname}$`, 'i') } 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: '该昵称已被使用，请更换其他昵称' 
      });
    }
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 创建用户
    const user = new User({
      id: generateId(),
      nickname: nickname.trim(),
      avatar: avatar || '🦋',
      password: hashedPassword,
      height: height || 170,
      targetWeight,
      currentWeight,
      initialWeight: currentWeight,
      streakDays: 0,
      totalWorkouts: 0,
      badges: []
    });
    
    await user.save();
    
    // 生成 JWT
    const token = jwt.sign(
      { userId: user.id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
        height: user.height,
        targetWeight: user.targetWeight,
        currentWeight: user.currentWeight,
        initialWeight: user.initialWeight,
        streakDays: user.streakDays,
        totalWorkouts: user.totalWorkouts,
        badges: user.badges
      }
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ success: false, message: '服务器错误，请稍后重试' });
  }
});

// 登录
router.post('/login', async (req, res) => {
  try {
    const { nickname, password } = req.body;
    
    if (!nickname || !password) {
      return res.status(400).json({ 
        success: false, 
        message: '请输入昵称和密码' 
      });
    }
    
    // 查找用户（不区分大小写）
    const user = await User.findOne({ 
      nickname: { $regex: new RegExp(`^${nickname}$`, 'i') } 
    });
    
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: '用户不存在' 
      });
    }
    
    // 验证密码
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: '密码错误' 
      });
    }
    
    // 生成 JWT
    const token = jwt.sign(
      { userId: user.id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
        height: user.height,
        targetWeight: user.targetWeight,
        currentWeight: user.currentWeight,
        initialWeight: user.initialWeight,
        streakDays: user.streakDays,
        totalWorkouts: user.totalWorkouts,
        badges: user.badges
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ success: false, message: '服务器错误，请稍后重试' });
  }
});

// 验证令牌
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: '未提供认证令牌' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findOne({ id: decoded.userId }, { password: 0 });
    
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    
    res.json({
      success: true,
      user: {
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
        height: user.height,
        targetWeight: user.targetWeight,
        currentWeight: user.currentWeight,
        initialWeight: user.initialWeight,
        streakDays: user.streakDays,
        totalWorkouts: user.totalWorkouts,
        badges: user.badges
      }
    });
  } catch (error) {
    res.status(401).json({ success: false, message: '令牌无效或已过期' });
  }
});

module.exports = router;
