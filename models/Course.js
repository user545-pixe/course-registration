const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide course name'],
        trim: true,
        unique: true
    },
    description: {
        type: String,
        required: [true, 'Please provide course description'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Please provide course price'],
        min: [0, 'Price cannot be negative']
    },
    duration: {
        type: String,
        required: [true, 'Please provide course duration'],
        trim: true
    },
    startDate: {
        type: Date,
        required: [true, 'Please provide start date']
    },
    endDate: {
        type: Date,
        required: [true, 'Please provide end date']
    },
    venue: {
        type: String,
        required: [true, 'Please provide venue'],
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Course', CourseSchema); 