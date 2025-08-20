const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String, 
        required: true, 
        unique: true 
    },
    email:   { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    refreshToken: {
        type: String,
        default: null
    },
    bio:      { 
        type: String, 
        default: '' },
    avatar:   { 
        type: String, 
        default: '' 
    }, // URL
    followers: [{ 
        type: mongoose.Schema.Types.ObjectId, ref: 'User' 
    }],
    following: [{ 
        type: mongoose.Schema.Types.ObjectId, ref: 'User' 
    }],
    role: { 
        type: String, enum: ['user', 'moderator', 'admin'], default: 'user' 
    },
    isSuspended: { 
        type: Boolean, default: false 
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
