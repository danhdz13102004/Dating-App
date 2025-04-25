const PostService = require("../services/post.service");
const Post = require("../models/Post");

class PostController {
    // Create a new post
    create = async (req, res, next) => {
        try {
            console.log(`[P]::Post_Create::`, req.body);
            const { userId, content, imageURL } = req.body;
            
            const result = await PostService.create({
                user_id:
                userId,
                title: content,
                images: imageURL
            });

            console.log(`[P]::Post_Create::Result::`, result);

            return res.status(201).json({
                status: "success",
                message: "Post created successfully",
                data: result
            });
        } catch (error) {
            console.error(`[P]::Post_Create::Error::`, error);
            return res.status(500).json({
                status: "error",
                message: error.message
            });
        }
    };

    // Get all posts
    getAllPosts = async (req, res, next) => {
        try {
            console.log(`[P]::Get_All_Posts::Request`);
            
            const posts = await PostService.getAllPosts();
            
            console.log(`[P]::Get_All_Posts::Result:: Count:`, posts.length);
            
            return res.status(200).json({
                status: "success",
                data: posts
            });
        } catch (error) {
            console.error(`[P]::Get_All_Posts::Error::`, error);
            return res.status(500).json({
                status: "error",
                message: error.message
            });
        }
    };

    // Get posts by user ID
    getPostsByUserId = async (req, res, next) => {
        try {
            console.log(`[P]::Get_Posts_By_UserId::Request::`, req.params);
            const { userId } = req.params;
            
            console.log(`[P]::Get_Posts_By_UserId::UserId::`, userId);
            
            const posts = await PostService.getPostsByUserId(userId);
            
            console.log(`[P]::Get_Posts_By_UserId::Result:: Count:`, posts.length);
            
            return res.status(200).json({
                status: "success",
                data: posts
            });
        } catch (error) {
            console.error(`[P]::Get_Posts_By_UserId::Error::`, error);
            return res.status(500).json({
                status: "error",
                message: error.message
            });
        }
    };

    // Get post by ID
    getPostById = async (req, res, next) => {
        try {
            console.log(`[P]::Get_Post_By_Id::Request::`, req.params);
            const { postId } = req.params;
            
            console.log(`[P]::Get_Post_By_Id::PostId::`, postId);
            
            const post = await PostService.getPostById(postId);
            
            if (!post) {
                return res.status(404).json({
                    status: "error",
                    message: "Post not found"
                });
            }
            
            console.log(`[P]::Get_Post_By_Id::Result::`, post);
            
            return res.status(200).json({
                status: "success",
                data: post
            });
        } catch (error) {
            console.error(`[P]::Get_Post_By_Id::Error::`, error);
            return res.status(500).json({
                status: "error",
                message: error.message
            });
        }
    };

    // Update post
    update = async (req, res, next) => {
        try {
            console.log(`[P]::Post_Update::`, req.body);
            const { postId, content, imageURL } = req.body;
            
            const result = await PostService.update({
                postId,
                content,
                imageURL
            });
            
            if (!result) {
                return res.status(404).json({
                    status: "error",
                    message: "Post not found"
                });
            }

            console.log(`[P]::Post_Update::Result::`, result);

            return res.status(200).json({
                status: "success",
                message: "Post updated successfully",
                data: result
            });
        } catch (error) {
            console.error(`[P]::Post_Update::Error::`, error);
            return res.status(500).json({
                status: "error",
                message: error.message
            });
        }
    };

    // Delete post
    delete = async (req, res, next) => {
        try {
            console.log(`[P]::Post_Delete::Request::`, req.params);
            const { postId } = req.params;
            
            console.log(`[P]::Post_Delete::PostId::`, postId);
            
            const result = await PostService.delete(postId);
            
            if (!result) {
                return res.status(404).json({
                    status: "error",
                    message: "Post not found"
                });
            }
            
            console.log(`[P]::Post_Delete::Result::`, result);
            
            return res.status(200).json({
                status: "success",
                message: "Post deleted successfully"
            });
        } catch (error) {
            console.error(`[P]::Post_Delete::Error::`, error);
            return res.status(500).json({
                status: "error",
                message: error.message
            });
        }
    };

    // Like a post
    likePost = async (req, res, next) => {
        try {
            console.log(`[P]::Like_Post::Request::`, req.body);
            const { postId, userId } = req.body;
            
            console.log(`[P]::Like_Post::Params::`, { postId, userId });
            
            const result = await PostService.likePost(postId, userId);
            
            console.log(`[P]::Like_Post::Result::`, result);
            
            return res.status(200).json({
                status: "success",
                message: "Post liked successfully",
                data: result
            });
        } catch (error) {
            console.error(`[P]::Like_Post::Error::`, error);
            return res.status(500).json({
                status: "error",
                message: error.message
            });
        }
    };

    // Get newest post with image by user ID (within 24 hours)
    getNewestImagePost = async (req, res, next) => {
        try {
            console.log(`[P]::Get_Newest_Image_Post::Request::`, req.params);
            const { userId } = req.params;
            
            console.log(`[P]::Get_Newest_Image_Post::UserId::`, userId);
            
            const post = await PostService.getNewestImagePostByUserId(userId);
            
            console.log(`[P]::Get_Newest_Image_Post::Result::`, post);
            
            if (!post) {
                return res.status(200).json({
                    status: "success",
                    message: "No recent image posts found",
                    data: null,
                    hasRecentImage: false
                });
            }
            
            return res.status(200).json({
                status: "success",
                data: post,
                hasRecentImage: true
            });
        } catch (error) {
            console.error(`[P]::Get_Newest_Image_Post::Error::`, error);
            return res.status(500).json({
                status: "error",
                message: error.message
            });
        }
    };

    // Remove newest post for a user
    removeNewestPost = async (req, res, next) => {
        try {
            console.log(`[P]::Remove_Newest_Post::Request::`, req.params);
            const { userId } = req.params;
            
            console.log(`[P]::Remove_Newest_Post::UserId::`, userId);
            
            const newestPost = await Post.findOne({ user_id: userId }).sort({ createdAt: -1 });
            
            if (!newestPost) {
                return res.status(404).json({
                    status: "error",
                    message: "No posts found for this user"
                });
            }
            
            await Post.findByIdAndDelete(newestPost._id);
            
            console.log(`[P]::Remove_Newest_Post::Result:: PostId:`, newestPost._id);
            
            return res.status(200).json({
                status: "success",
                message: "Post removed successfully"
            });
        } catch (error) {
            console.error(`[P]::Remove_Newest_Post::Error::`, error);
            return res.status(500).json({
                status: "error",
                message: "Failed to remove post",
                error: error.message
            });
        }
    };
}

module.exports = new PostController();