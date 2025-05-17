const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
    isDeleted: {type: Boolean, default: false},
    isEdited: {type: Boolean, default: false},
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
