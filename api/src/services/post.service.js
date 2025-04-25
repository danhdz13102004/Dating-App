const Post = require("../models/Post");

class PostService {
    // Create a new post
    async create(postData) {
        try {
            const newPost = new Post({
                user_id: postData.user_id,
                title: postData.title,
                images: postData.images
            });
            await newPost.save();
            return newPost;
        } catch (error) {
            throw error;
        }
    }

    // Get all posts
    async getAllPosts() {
        try {
            const posts = await Post.find()
                .sort({ createdAt: -1 }) // Sort by newest first
                .populate('user_id', 'name avatar')
                .exec();
            return posts;
        } catch (error) {
            throw error;
        }
    }

    // Get posts by user ID
    async getPostsByUserId(userId) {
        try {
            const posts = await Post.find({ user_id: userId })
                .sort({ createdAt: -1 })
                .populate('user_id', 'name avatar')
                .exec();
            return posts;
        } catch (error) {
            throw error;
        }
    }

    // Get newest post with image by user ID (only from last 24 hours)
    async getNewestImagePostByUserId(userId) {
        try {
            // Calculate the date 24 hours ago
            const twentyFourHoursAgo = new Date();
            twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
            
            const post = await Post.findOne({ 
                user_id: userId,
                images: { $exists: true, $ne: null, $ne: "" },
                createdAt: { $gte: twentyFourHoursAgo } // Only posts from last 24 hours
            })
            .sort({ createdAt: -1 })
            .select('images createdAt')
            .exec();
            
            return post;
        } catch (error) {
            throw error;
        }
    }

    // Get post by ID
    async getPostById(postId) {
        try {
            const post = await Post.findById(postId)
                .populate('user_id', 'name avatar')
                .exec();
            return post;
        } catch (error) {
            throw error;
        }
    }

    // Update post
    async update(postData) {
        try {
            const { postId, content, imageURL } = postData;
            const updatedPost = await Post.findByIdAndUpdate(
                postId,
                { title: content, images: imageURL },
                { new: true }
            );
            return updatedPost;
        } catch (error) {
            throw error;
        }
    }

    // Delete post
    async delete(postId) {
        try {
            const result = await Post.findByIdAndDelete(postId);
            return result;
        } catch (error) {
            throw error;
        }
    }

    // Like a post
    async likePost(postId, userId) {
        try {
            const post = await Post.findById(postId);
            
            if (!post) {
                throw new Error("Post not found");
            }
            
            // Check if user already liked the post
            const alreadyLiked = post.likes.includes(userId);
            
            if (alreadyLiked) {
                // Unlike the post
                post.likes = post.likes.filter(id => id.toString() !== userId.toString());
            } else {
                // Like the post
                post.likes.push(userId);
            }
            
            await post.save();
            return post;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new PostService();
