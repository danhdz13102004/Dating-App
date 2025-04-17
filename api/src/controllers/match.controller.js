const MatchService = require('../services/match.service');

class MatchController {
    // Xử lý logic "like" người dùng
    static likeUser = async (req, res, next) => {
        try {
            console.log(`[P]::LikeUser::Request::`, { params: req.params, body: req.body });

            // Lấy currentUserId từ body
            const currentUserId = req.body.id; // ID người dùng hiện tại từ client (body)
            const targetUserId = req.params.id; // ID người dùng mục tiêu từ URL param

            // Kiểm tra nếu thiếu currentUserId hoặc targetUserId
            if (!currentUserId || !targetUserId) {
                return res.status(400).json({
                    status: "error",
                    message: "Both currentUserId and targetUserId are required.",
                });
            }

            // Gọi service để xử lý logic "like"
            const result = await MatchService.likeUser({ currentUserId, targetUserId });

            console.log(`[P]::LikeUser::Result::`, result);

            return res.status(200).json({
                status: "success",
                message: "User liked successfully.",
                data: result,
            });
        } catch (error) {
            console.error(`[P]::LikeUser::Error::`, error.message || error);
            next(error);
        }
    };

    // Xử lý logic bỏ qua người dùng
    static skipUser = async (req, res, next) => {
        try {
            console.log(`[P]::SkipUser::Request::`, { params: req.params, body: req.body });

            const currentUserId = req.body.id; // ID người dùng hiện tại
            const targetUserId = req.params.id; // ID người dùng mục tiêu

            // Kiểm tra nếu thiếu currentUserId hoặc targetUserId
            if (!currentUserId || !targetUserId) {
                return res.status(400).json({
                    status: "error",
                    message: "Both currentUserId and targetUserId are required.",
                });
            }

            // Gọi service để xử lý logic skip
            const result = await MatchService.skipUser({ currentUserId, targetUserId });

            console.log(`[P]::SkipUser::Result::`, result);

            return res.status(200).json(result);
        } catch (error) {
            console.error(`[P]::SkipUser::Error::`, error.message || error);
            next(error);
        }
    };
}

module.exports = MatchController;