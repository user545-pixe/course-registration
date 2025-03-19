require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./models/Course');

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/course-registration');
        console.log('MongoDB Connected successfully');
        
        // Check courses
        const courses = await Course.find();
        console.log('\n===== COURSES =====');
        console.log(`Found ${courses.length} courses:`);
        
        courses.forEach((course, index) => {
            console.log(`\n${index + 1}. ${course.name}`);
            console.log(`   Description: ${course.description.substring(0, 50)}...`);
            console.log(`   Price: $${course.price}`);
            console.log(`   Duration: ${course.duration}`);
            console.log(`   Venue: ${course.venue}`);
            console.log(`   Start Date: ${new Date(course.startDate).toLocaleDateString()}`);
        });
        
        // Display admin credentials
        console.log('\n===== ADMIN CREDENTIALS =====');
        console.log(`Username: ${process.env.ADMIN_USERNAME || 'admin'}`);
        console.log(`Password: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
        console.log('\nAdmin Login URL: http://localhost:3000/admin/login');
        
        console.log('\n===== SETUP COMPLETE =====');
        console.log('You can now use the application:');
        console.log('- User registration form: http://localhost:3000');
        console.log('- Admin dashboard: http://localhost:3000/admin/login');
        
        mongoose.disconnect();
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

connectDB(); 