const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    content: { type: String, required: true },
    id_conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', default: null },
    id_post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null },
    is_read: { type: Boolean, default: false },
    id_user: { type: String, required: true }
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
