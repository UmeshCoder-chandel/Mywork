import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import Follow from "../models/Follow.js";
import Notification from "../models/Notification.js";
import { buildFileUrl } from "../services/uploadService.js";
import cloudinaryService from "../services/cloudinaryService.js";

export const createPost = async (req, res) => {
  try {
    const { title, description, desc, category, location } = req.body;
    const caption = description || desc || title || "";
    const files = req.files || (req.file ? [req.file] : []);

    if ((!files || files.length === 0) && !caption.trim()) {
      return res.status(400).json({ message: "Caption or media is required" });
    }

    // Upload incoming file buffers to Cloudinary (image/video). We use memoryStorage so files have a .buffer
    const media = [];
    if (files && files.length > 0) {
      for (const f of files) {
        try {
          const isVideo = f.mimetype && f.mimetype.startsWith("video");
          const resourceType = isVideo ? "video" : "image";
          const opts = {
            folder: process.env.CLOUDINARY_FOLDER || 'worksocial/posts',
            resource_type: resourceType,
            public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
          };
          if (isVideo) {
            // generate a thumbnail via eager transformation
            opts.eager = [{ width: 600, height: 400, crop: 'fill', format: 'jpg' }];
            opts.eager_async = false;
          }

          const result = await cloudinaryService.uploadBuffer(f.buffer, opts);
          const url = result.secure_url || result.url;
          const thumbnail = (result.eager && result.eager[0] && result.eager[0].secure_url) || url;
          media.push({ url, type: resourceType, thumbnail, width: result.width, height: result.height, public_id: result.public_id });
        } catch (err) {
          console.error('Cloudinary upload failed:', err);
          return res.status(500).json({ message: 'Failed to upload media' });
        }
      }
    } else {
      // keep backward compatibility if files were previously referenced by filename
      // (rare if using memoryStorage)
      // no files but maybe legacy image/video fields
    }

    let parsedLocation = undefined;
    if (location) {
      try {
        parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;
      } catch (e) {
        parsedLocation = { city: location };
      }
    }

    const post = await Post.create({
      user: req.user._id,
      title,
      description: caption,
      media,
      category,
      location: parsedLocation,
    });

    await post.populate("user", "-password");
    res.status(201).json({ post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const searchPosts = async (req, res) => {
  try {
    const q = req.query.q || "";
    const page = Number(req.query.page) || 1;
    const limit = 10;
    const filter = q ? { $text: { $search: q } } : {};
    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("user", "-password");
    res.json({ posts, nextPage: posts.length === limit ? page + 1 : null });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const filterPosts = async (req, res) => {
  try {
    const { category, location } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = 10;
    const filter = {};
    if (category) filter.category = new RegExp(`^${category}$`, "i");
    if (location) filter["location.city"] = new RegExp(location, "i");
    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("user", "-password");
    res.json({ posts, nextPage: posts.length === limit ? page + 1 : null });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("user", "-password")
      .populate({ path: "likes", select: "-password" });
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json({ post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (String(post.user) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not allowed" });
    }
    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCaption = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (String(post.user) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not allowed" });
    }
    post.description = req.body.description ?? req.body.desc ?? post.description;
    await post.save();
    res.json({ post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    
    const isLiked = post.likes.some(
      (id) => String(id) === String(req.user._id)
    );
    
    if (isLiked) {
      // Unlike: remove like
      post.likes = post.likes.filter(
        (id) => String(id) !== String(req.user._id)
      );
    } else {
      // Like: add like
      post.likes.push(req.user._id);
      if (String(post.user) !== String(req.user._id)) {
        await Notification.create({
          user: post.user,
          sender: req.user._id,
          type: "like",
          post: post._id,
        });
      }
      req.io?.emit("post:like", { postId: post._id, userId: req.user._id });
    }
    
    await post.save();
    res.json({ post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const unlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    post.likes = post.likes.filter(
      (id) => String(id) !== String(req.user._id)
    );
    await post.save();
    res.json({ post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    const comment = await Comment.create({
      post: post._id,
      user: req.user._id,
      text: req.body.text,
    });
    post.comments = (post.comments || 0) + 1;
    await post.save();
    if (String(post.user) !== String(req.user._id)) {
      await Notification.create({
        user: post.user,
        sender: req.user._id,
        type: "comment",
        post: post._id,
        comment: comment._id,
      });
    }
    req.io?.emit("comment:new", { postId: post._id, comment });
    res.status(201).json({ comment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    const post = await Post.findById(comment.post);
    if (
      String(comment.user) !== String(req.user._id) &&
      String(post?.user) !== String(req.user._id)
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }
    await comment.deleteOne();
    await Post.findByIdAndUpdate(req.params.id, {
      $inc: { comments: -1 },
    });
    res.json({ message: "Comment removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .populate("user", "-password")
      .sort({ createdAt: -1 });
    res.json({ comments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const feed = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = 10;
    const following = await Follow.find({ follower: req.user._id }).select(
      "following"
    );
    const followingIds = following.map((f) => f.following);
    const ids = [...followingIds, req.user._id];
    const posts = await Post.find({ user: { $in: ids } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("user", "-password");
    res.json({ posts, nextPage: posts.length === limit ? page + 1 : null });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const postsByUser = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId })
      .sort({ createdAt: -1 })
      .populate("user", "-password");
    res.json({ posts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getReels = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = 10;
    // Find posts that have at least one video in the media array
    const posts = await Post.find({
      "media.type": "video"
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("user", "-password");
    res.json({ posts, nextPage: posts.length === limit ? page + 1 : null });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

