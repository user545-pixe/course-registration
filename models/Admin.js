const mongoose = require('mongoose');
const crypto = require('crypto');

const AdminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please provide a username'],
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please provide a password']
    },
    salt: String,
    role: {
        type: String,
        enum: ['admin', 'super-admin'],
        default: 'admin'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: Date
});

// Hash password before saving
AdminSchema.pre('save', function(next) {
    // Only hash the password if it's modified or new
    if (!this.isModified('password')) return next();
    
    // Generate a random salt
    this.salt = crypto.randomBytes(16).toString('hex');
    
    // Hash the password with the salt
    this.password = crypto
        .pbkdf2Sync(this.password, this.salt, 1000, 64, 'sha512')
        .toString('hex');
    
    next();
});

// Method to compare passwords
AdminSchema.methods.verifyPassword = function(password) {
    const hash = crypto
        .pbkdf2Sync(password, this.salt, 1000, 64, 'sha512')
        .toString('hex');
    return this.password === hash;
};

module.exports = mongoose.model('Admin', AdminSchema); 