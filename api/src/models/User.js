const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    birthday: { type: Date, required: true },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }
    },    
    hobbies: [{ type: String }],
    avatar: { type: String },
    profileImgs: [{ type: String }],
    description: { type: String },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    preference: {
        gender: { type: String, enum: ['male', 'female', 'any'], default: 'any' },
        maxDistance: { type: Number, default: 50 }, // km
        minAge: { type: Number, default: 18 },
        maxAge: { type: Number, default: 100 }
    },
    skippedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;
