const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Please provide your full name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    phone: {
        type: String,
        required: [true, 'Please provide your phone number'],
        trim: true
    },
    courseName: {
        type: String,
        required: [true, 'Please select a course'],
        trim: true
    },
    transactionId: {
        type: String,
        required: [true, 'Please provide the transaction ID'],
        trim: true
    },
    receiptImage: {
        type: String,
        required: [true, 'Please upload payment receipt']
    },
    registrationNumber: {
        type: String,
        unique: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    additionalNotes: {
        type: String,
        trim: true
    },
    eventDate: {
        type: String,
        default: 'June 15, 2025'
    },
    eventVenue: {
        type: String,
        default: 'XYZ Conference Center, Room 201'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Generate a unique registration number before saving
OrderSchema.pre('save', async function(next) {
    // Only generate a registration number if it doesn't already exist
    if (!this.registrationNumber) {
        // Find the highest registration number and increment it
        const lastOrder = await this.constructor.findOne({}, {}, { sort: { 'registrationNumber': -1 } });
        
        let nextNumber = 10000; // Start with 10000 if no orders exist
        if (lastOrder && lastOrder.registrationNumber) {
            // Extract the numeric part and increment
            const lastNumber = parseInt(lastOrder.registrationNumber);
            if (!isNaN(lastNumber)) {
                nextNumber = lastNumber + 1;
            }
        }
        
        this.registrationNumber = nextNumber.toString();
    }
    
    next();
});

module.exports = mongoose.model('Order', OrderSchema); 