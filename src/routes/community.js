const express = require('express');
const Confession = require('../models/Confession');
const WorkoutPost = require('../models/WorkoutPost');
const auth = require('../middleware/auth');

const router = express.Router();

const generateId = () => Math.random().toString(36).substring(2, 15);

// ========== 坦白局 ==========

// 获取所有坦白
router.get('/confessions', auth, async (req, res) => {
  try {
    const confessions = await Confession.find().sort({ createdAt: -1 });
    res.json({ success: true, confessions });
  } catch (error) {
    console.error('获取坦白列表错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 发布坦白
router.post('/confessions', auth, async (req, res) => {
  try {
    const { content, emoji, image } = req.body;
    const userId = req.userId;
    
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: '请输入内容' });
    }
    
    const confession = new Confession({
      id: generateId(),
      userId,
      content: content.trim(),
      emoji: emoji || '😋',
      image: image || '',
      likes: 0,
      likedBy: [],
      comments: []
    });
    
    await confession.save();
    res.json({ success: true, confession });
  } catch (error) {
    console.error('发布坦白错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 删除坦白
router.delete('/confessions/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    const confession = await Confession.findOneAndDelete({ id, userId });
    
    if (!confession) {
      return res.status(404).json({ success: false, message: '坦白不存在或无权限删除' });
    }
    
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('删除坦白错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 点赞/取消点赞坦白
router.post('/confessions/:id/like', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    const confession = await Confession.findOne({ id });
    
    if (!confession) {
      return res.status(404).json({ success: false, message: '坦白不存在' });
    }
    
    const isLiked = confession.likedBy.includes(userId);
    
    if (isLiked) {
      // 取消点赞
      confession.likedBy = confession.likedBy.filter(uid => uid !== userId);
      confession.likes = Math.max(0, confession.likes - 1);
    } else {
      // 点赞
      confession.likedBy.push(userId);
      confession.likes += 1;
    }
    
    await confession.save();
    res.json({ success: true, confession, isLiked: !isLiked });
  } catch (error) {
    console.error('点赞坦白错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 评论坦白
router.post('/confessions/:id/comment', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.userId;
    
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: '请输入评论内容' });
    }
    
    const confession = await Confession.findOne({ id });
    
    if (!confession) {
      return res.status(404).json({ success: false, message: '坦白不存在' });
    }
    
    confession.comments.push({
      id: generateId(),
      userId,
      content: content.trim(),
      createdAt: new Date()
    });
    
    await confession.save();
    res.json({ success: true, confession });
  } catch (error) {
    console.error('评论坦白错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// ========== 运动社区 ==========

// 获取所有运动动态
router.get('/workout-posts', auth, async (req, res) => {
  try {
    const posts = await WorkoutPost.find().sort({ createdAt: -1 });
    res.json({ success: true, posts });
  } catch (error) {
    console.error('获取运动动态错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 发布运动动态
router.post('/workout-posts', auth, async (req, res) => {
  try {
    const { workoutType, duration, content, image } = req.body;
    const userId = req.userId;
    
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: '请输入内容' });
    }
    
    if (!workoutType) {
      return res.status(400).json({ success: false, message: '请选择运动类型' });
    }
    
    const post = new WorkoutPost({
      id: generateId(),
      userId,
      workoutType,
      duration: duration || 30,
      content: content.trim(),
      image: image || '',
      likes: 0,
      likedBy: [],
      comments: []
    });
    
    await post.save();
    res.json({ success: true, post });
  } catch (error) {
    console.error('发布运动动态错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 删除运动动态
router.delete('/workout-posts/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    const post = await WorkoutPost.findOneAndDelete({ id, userId });
    
    if (!post) {
      return res.status(404).json({ success: false, message: '动态不存在或无权限删除' });
    }
    
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('删除运动动态错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 点赞/取消点赞运动动态
router.post('/workout-posts/:id/like', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    const post = await WorkoutPost.findOne({ id });
    
    if (!post) {
      return res.status(404).json({ success: false, message: '动态不存在' });
    }
    
    const isLiked = post.likedBy.includes(userId);
    
    if (isLiked) {
      // 取消点赞
      post.likedBy = post.likedBy.filter(uid => uid !== userId);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      // 点赞
      post.likedBy.push(userId);
      post.likes += 1;
    }
    
    await post.save();
    res.json({ success: true, post, isLiked: !isLiked });
  } catch (error) {
    console.error('点赞运动动态错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 评论运动动态
router.post('/workout-posts/:id/comment', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.userId;
    
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: '请输入评论内容' });
    }
    
    const post = await WorkoutPost.findOne({ id });
    
    if (!post) {
      return res.status(404).json({ success: false, message: '动态不存在' });
    }
    
    post.comments.push({
      id: generateId(),
      userId,
      content: content.trim(),
      createdAt: new Date()
    });
    
    await post.save();
    res.json({ success: true, post });
  } catch (error) {
    console.error('评论运动动态错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

module.exports = router;
