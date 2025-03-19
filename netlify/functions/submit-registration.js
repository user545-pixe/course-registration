const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

// Import models - using dynamic import
let Order;
let Course;
try {
  Order = require('../../models/Order');
  Course = require('../../models/Course');
} catch (error) {
  // Define models here if import fails
  const orderSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    courseId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Course',
      required: true 
    },
    courseName: { type: String, required: true },
    transactionId: { type: String, required: true },
    receiptImage: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    additionalNotes: { type: String },
    createdAt: { type: Date, default: Date.now }
  });
  
  Order = mongoose.model('Order', orderSchema);
}

exports.handler = async (event, context) => {
  // Make sure to close DB connection after function completes
  context.callbackWaitsForEmptyEventLoop = false;
  
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }
  
  try {
    await connectDB();
    
    // Parse the request body
    const formData = JSON.parse(event.body);
    
    // Create a new order
    const newOrder = new Order({
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      courseId: formData.courseId,
      courseName: formData.courseName,
      transactionId: formData.transactionId,
      receiptImage: formData.receiptImage || 'placeholder.jpg', // In serverless, we'd handle file uploads separately
      additionalNotes: formData.additionalNotes
    });
    
    // Save the order
    await newOrder.save();
    
    // In a real serverless setup, we would use a service like SendGrid or AWS SES here
    // const emailSent = sendConfirmationEmail(formData.email, formData.fullName, formData.courseName);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        success: true,
        message: 'Registration submitted successfully! We will contact you once your payment is verified.'
      })
    };
  } catch (error) {
    console.error('Error processing registration:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false,
        error: 'Error processing registration. Please try again.'
      })
    };
  }
}; 