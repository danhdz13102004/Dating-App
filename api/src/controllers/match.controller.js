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

    // Lấy danh sách người dùng để match
    static getPotentialMatches = async (req, res, next) => {
        try {
            console.log(`[G]::GetPotentialMatches::Request`)

            const userId = req.params.id
            const page = parseInt(req.query.page) || 1
            const limit = parseInt(req.query.limit) || 20
            const showSkipped = req.query.showSkipped || false

            console.log(`[G]::GetPotentialMatches::Request::`, { userId, page, limit, showSkipped })

            if (!userId) {
                return res.status(400).json({
                    status: "error",
                    message: "User ID is required."
                })
            }

            if (page < 1 || limit < 1) {
                return res.status(400).json({
                    status: "error",
                    message: "Page and limit must be positive integers."
                });
            }

            const result = await MatchService.getPotentialMatches(userId, page, limit, showSkipped)

            console.log(`[G]::GetPotentialMatches::Result:: Found ${result.data.length} potential matches`)

            return res.status(200).json(result)
        } catch (error) {
            console.error(`[G]::GetPotentialMatches::Error::`, error.message || error)
            next(error)
        }
    }

    // Controller cập nhật preferences 
    static updatePreferences = async (req, res, next) => {
        try {
            console.log(`[P]::UpdatePreferences::Request::`, { body: req.body })

            const userId = req.params.id
            const preferences = {
                gender: req.body.gender || 'any',
                maxDistance: req.body.maxDistance || 30,
                minAge: req.body.minAge || 18,
                maxAge: req.body.maxAge || 100
            }

            if (!userId) {
                return res.status(400).json({
                    status: "error",
                    message: "User ID is required."
                })
            }

            // Gọi service để cập nhật
            const result = await MatchService.updatePreferences(userId, preferences)

            console.log(`[P]::UpdatePreferences::Result::`, result)

            return res.status(200).json(result)
        } catch (error) {
            console.error(`[P]::UpdatePreferences::Error::`, error.message || error)
            next(error)
        }
    }

    static getPreferences = async (req, res, next) => {
        try {
            console.log(`[G]::GetPreferences::Request::`, { params: req.params })

            const userId = req.params.id

            if (!userId) {
                return res.status(400).json({
                    status: "error",
                    message: "User ID is required."
                })
            }

            // Gọi service để lấy preferences
            const result = await MatchService.getPreferences(userId)

            console.log(`[G]::GetPreferences::Result::`, result)

            return res.status(200).json(result)
        } catch (error) {
            console.error(`[G]::GetPreferences::Error::`, error.message || error)
            next(error)
        }
    }

    // Xử lý logic thông báo Match request của người dùng
    static requestMatchNotify = async (req, res, next) => {
        try {
            console.log(`[P]::RequestMatchNotify::Request::`, { params: req.params, body: req.body });


            const currentUserId = req.params.id; // ID người dùng hiện tại từ URL param
            const targetUserId = req.body.id; // ID người dùng mục tiêu từ body

            // Kiểm tra nếu thiếu currentUserId hoặc targetUserId
            if (!currentUserId || !targetUserId) {
                return res.status(400).json({
                    status: "error",
                    message: "Both currentUserId and targetUserId are required.",
                });
            }

            // Không thể tự match với chính mình
            if (currentUserId === targetUserId) {
                return res.status(400).json({
                    status: "error",
                    message: "You cannot match with yourself.",
                });
            }

            // Gọi service để xử lý logic thông báo match request
            const result = await MatchService.notifyMatchUser({ currentUserId, targetUserId });

            console.log(`[P]::RequestMatchNotify::Result::`, result);

            return res.status(200).json({
                status: "success",
                message: "Notif match request successfully.",
                data: result,
            });
        } catch (error) {
            console.error(`[P]::RequestMatchNotify::Error::`, error.message || error);
            next(error);
        }
    };
}

module.exports = MatchController;