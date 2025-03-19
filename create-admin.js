require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

// Connect to MongoDB and create admin
async function createAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/course-registration');
        console.log('MongoDB Connected successfully');
        
        // Check if any admin exists
        const count = await Admin.countDocuments();
        if (count > 0) {
            console.log('Admin users already exist. Checking for superadmin...');
            
            // Check if superadmin exists
            const superAdmin = await Admin.findOne({ username: 'superadmin' });
            if (superAdmin) {
                console.log('Superadmin already exists!');
                mongoose.disconnect();
                return;
            }
        }
        
        // Create a new super admin
        const admin = new Admin({
            username: 'superadmin',
            email: 'admin@example.com',
            password: 'superadmin123',
            role: 'super-admin',
            isActive: true
        });
        
        await admin.save();
        
        console.log('==========================================================');
        console.log('Super Admin created successfully!');
        console.log('==========================================================');
        console.log('Username: superadmin');
        console.log('Password: superadmin123');
        console.log('Role: super-admin');
        console.log('==========================================================');
        console.log('Login URL: http://localhost:3000/admin/login');
        console.log('==========================================================');
        
        mongoose.disconnect();
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
}

createAdmin(); 