const notificationService = require("../services/notification.service");

class NotificationController {
  add = async (req, res, next) => {
    console.log(`[P]::Notification_add::`, req.body);
    const result = await notificationService.addNotification(req.body);

    console.log(`[P]::Notification_add::Result::`, result);

    return res.status(201).json(result);
  };

  
}

module.exports = new NotificationController();
