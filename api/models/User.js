const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    lng: { type: Number },
    lat: { type: Number },
    hobbies: [{ type: String }],
    avatar: { type: String },
    profileImgs: [{ type: String }],
    description: { type: String },
    gender: { type: String, enum: ['male', 'female', 'other'] }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;
