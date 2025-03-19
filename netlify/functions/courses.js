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

// Import Course model - using dynamic import since we're in a serverless function
let Course;
try {
  Course = require('../../models/Course');
} catch (error) {
  // Define Course model here if import fails
  const courseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: String, required: true },
    price: { type: Number, required: true },
    venue: { type: String, required: true },
    startDate: { type: Date, required: true },
    active: { type: Boolean, default: true }
  });
  
  Course = mongoose.model('Course', courseSchema);
}

exports.handler = async (event, context) => {
  // Make sure to close DB connection after function completes
  context.callbackWaitsForEmptyEventLoop = false;
  
  try {
    await connectDB();
    
    // Get all active courses
    const courses = await Course.find({ active: true }).sort({ startDate: 1 });
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ courses })
    };
  } catch (error) {
    console.error('Error fetching courses:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error' })
    };
  }
}; 