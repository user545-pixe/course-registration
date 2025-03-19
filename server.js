const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { sendConfirmationEmail } = require('./config/email');
const session = require('express-session');
const cors = require('cors');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Import models
const Order = require('./models/Order');
const Course = require('./models/Course');
const Admin = require('./models/Admin');

// Set up EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Set up middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cors());

// Session middleware for admin authentication
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 } // 1 hour
}));

// Set up storage for file uploads
// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads/course-receipts');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'receipt-' + uniqueSuffix + ext);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit to 5MB
    fileFilter: function(req, file, cb) {
        // Accept images only
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

// Middleware to check admin authentication
const isAdmin = (req, res, next) => {
    if (req.session.isAdmin) {
        return next();
    }
    res.redirect('/admin/login');
};

// Middleware to check if user is super-admin
const isSuperAdmin = async (req, res, next) => {
    if (!req.session.isAdmin) {
        return res.redirect('/admin/login');
    }
    
    // If using .env admin credentials
    if (req.session.adminId === 'env-admin') {
        return next(); // Default admin from env has all privileges
    }
    
    try {
        const admin = await Admin.findById(req.session.adminId);
        if (!admin || admin.role !== 'super-admin') {
            return res.status(403).render('admin/dashboard', {
                orders: [],
                stats: { totalOrders: 0, pendingOrders: 0, approvedOrders: 0, rejectedOrders: 0 },
                message: 'Access denied. Super-admin privileges required.',
                messageType: 'error'
            });
        }
        next();
    } catch (error) {
        console.error('Error checking admin role:', error);
        res.status(500).render('admin/dashboard', {
            orders: [],
            stats: { totalOrders: 0, pendingOrders: 0, approvedOrders: 0, rejectedOrders: 0 },
            message: 'Server error while checking permissions',
            messageType: 'error'
        });
    }
};

// API endpoint to replace Netlify function
app.get('/api/courses', async (req, res) => {
    try {
        const courses = await Course.find({ isActive: true });
        res.json({ courses });
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ error: 'Failed to load courses' });
    }
});

// Compatibility endpoint for existing Netlify function URL
app.get('/.netlify/functions/courses', async (req, res) => {
    try {
        const courses = await Course.find({ isActive: true });
        res.json({ courses });
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ error: 'Failed to load courses' });
    }
});

// Routes
// Home page - Course registration form
app.get('/', async (req, res) => {
    try {
        // Get active courses from database
        const courses = await Course.find({ isActive: true });
        res.render('course-form', { courses, message: null, messageType: null });
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.render('course-form', { courses: [], message: 'Failed to load courses', messageType: 'error' });
    }
});

// Submit registration
app.post('/submit-registration', upload.single('receiptImage'), async (req, res) => {
    try {
        const { fullName, email, phone, courseName, transactionId, additionalNotes } = req.body;
        
        // Validate input
        if (!fullName || !email || !phone || !courseName || !transactionId) {
            return res.render('course-form', { 
                courses: await Course.find({ isActive: true }),
                message: 'Please fill in all required fields', 
                messageType: 'error' 
            });
        }
        
        if (!req.file) {
            return res.render('course-form', { 
                courses: await Course.find({ isActive: true }),
                message: 'Payment receipt screenshot is required', 
                messageType: 'error' 
            });
        }
        
        // Create new order in database
        const order = new Order({
            fullName,
            email,
            phone,
            courseName,
            transactionId,
            receiptImage: `uploads/course-receipts/${req.file.filename}`,
            additionalNotes
        });
        
        await order.save();
        
        // Render success page
        res.render('registration-success', { order });
        
    } catch (error) {
        console.error('Error processing registration:', error);
        res.render('course-form', { 
            courses: await Course.find({ isActive: true }),
            message: 'An error occurred while processing your registration. Please try again.', 
            messageType: 'error' 
        });
    }
});

// Admin routes
// Login page
app.get('/admin/login', (req, res) => {
    res.render('admin/login', { message: null, messageType: null });
});

// Login process
app.post('/admin/login', async (req, res) => {
    const { username, password } = req.body;
    
    // First check against environment variables
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        req.session.isAdmin = true;
        req.session.adminId = 'env-admin'; // Special ID for env-based admin
        req.session.adminUsername = username;
        return res.redirect('/admin/dashboard');
    }
    
    // Check against database admins
    try {
        const admin = await Admin.findOne({ username: username });
        
        if (!admin || !admin.verifyPassword(password)) {
            return res.render('admin/login', { 
                message: 'Invalid username or password', 
                messageType: 'error' 
            });
        }
        
        if (!admin.isActive) {
            return res.render('admin/login', { 
                message: 'Account is inactive. Please contact a super-admin.', 
                messageType: 'error' 
            });
        }
        
        // Update last login
        admin.lastLogin = new Date();
        await admin.save();
        
        // Set session data
        req.session.isAdmin = true;
        req.session.adminId = admin._id;
        req.session.adminUsername = admin.username;
        req.session.adminRole = admin.role;
        
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error('Login error:', error);
        res.render('admin/login', { 
            message: 'Login failed. Please try again.', 
            messageType: 'error' 
        });
    }
});

// Logout
app.get('/admin/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login');
});

// Admin dashboard
app.get('/admin/dashboard', isAdmin, async (req, res) => {
    try {
        // Get orders and stats
        const orders = await Order.find().sort({ createdAt: -1 });
        
        const stats = {
            totalOrders: orders.length,
            pendingOrders: orders.filter(order => order.status === 'pending').length,
            approvedOrders: orders.filter(order => order.status === 'approved').length,
            rejectedOrders: orders.filter(order => order.status === 'rejected').length
        };
        
        res.render('admin/dashboard', { 
            orders, 
            stats,
            message: req.query.message || null, 
            messageType: req.query.type || null 
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.render('admin/dashboard', { 
            orders: [], 
            stats: { totalOrders: 0, pendingOrders: 0, approvedOrders: 0, rejectedOrders: 0 },
            message: 'Failed to load dashboard data', 
            messageType: 'error' 
        });
    }
});

// View order details (returns partial HTML for modal)
app.get('/admin/orders/:id', isAdmin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).send('Order not found');
        }
        
        res.render('admin/order-detail', { order });
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).send('Error loading order details');
    }
});

// Approve order
app.post('/admin/orders/:id/approve', isAdmin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        
        // Update order status
        order.status = 'approved';
        await order.save();
        
        // Send confirmation email
        const emailSent = await sendConfirmationEmail(
            order.email,
            order.registrationNumber,
            order.eventDate,
            order.eventVenue
        );
        
        const message = emailSent 
            ? 'Order approved and confirmation email sent' 
            : 'Order approved but email could not be sent';
        
        res.json({ 
            success: true, 
            message: message
        });
    } catch (error) {
        console.error('Error approving order:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error approving order' 
        });
    }
});

// Reject order
app.post('/admin/orders/:id/reject', isAdmin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        
        // Update order status
        order.status = 'rejected';
        await order.save();
        
        res.json({ 
            success: true, 
            message: 'Order rejected successfully' 
        });
    } catch (error) {
        console.error('Error rejecting order:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error rejecting order' 
        });
    }
});

// Admin Management Routes
app.get('/admin/admins', isSuperAdmin, async (req, res) => {
    try {
        const admins = await Admin.find().sort({ createdAt: -1 });
        
        res.render('admin/admin-management', {
            admins,
            message: req.query.message || null,
            messageType: req.query.type || null
        });
    } catch (error) {
        console.error('Error fetching admins:', error);
        res.render('admin/admin-management', {
            admins: [],
            message: 'Failed to load admin users',
            messageType: 'error'
        });
    }
});

// Create a new admin
app.post('/admin/admins/create', isSuperAdmin, async (req, res) => {
    try {
        const { username, email, password, confirmPassword, role } = req.body;
        
        // Check if passwords match
        if (password !== confirmPassword) {
            return res.redirect('/admin/admins?message=Passwords do not match&type=error');
        }
        
        // Check if username or email already exists
        const existingAdmin = await Admin.findOne({
            $or: [{ username }, { email }]
        });
        
        if (existingAdmin) {
            return res.redirect('/admin/admins?message=Username or email already exists&type=error');
        }
        
        // Create new admin
        const admin = new Admin({
            username,
            email,
            password,
            role: role || 'admin'
        });
        
        await admin.save();
        
        res.redirect('/admin/admins?message=Admin created successfully&type=success');
    } catch (error) {
        console.error('Error creating admin:', error);
        res.redirect(`/admin/admins?message=Error creating admin: ${error.message}&type=error`);
    }
});

// Get admin details (for edit modal)
app.get('/admin/admins/:id', isSuperAdmin, async (req, res) => {
    try {
        const admin = await Admin.findById(req.params.id);
        
        if (!admin) {
            return res.status(404).json({ error: 'Admin not found' });
        }
        
        // Send admin data without sensitive info
        res.json({
            _id: admin._id,
            username: admin.username,
            email: admin.email,
            role: admin.role,
            isActive: admin.isActive
        });
    } catch (error) {
        console.error('Error fetching admin:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update admin
app.post('/admin/admins/update', isSuperAdmin, async (req, res) => {
    try {
        const { adminId, username, email, password, role } = req.body;
        
        const admin = await Admin.findById(adminId);
        
        if (!admin) {
            return res.redirect('/admin/admins?message=Admin not found&type=error');
        }
        
        // Check if username or email already exists with another admin
        const existingAdmin = await Admin.findOne({
            _id: { $ne: adminId },
            $or: [{ username }, { email }]
        });
        
        if (existingAdmin) {
            return res.redirect('/admin/admins?message=Username or email already exists&type=error');
        }
        
        // Update admin data
        admin.username = username;
        admin.email = email;
        admin.role = role;
        
        // Only update password if provided
        if (password && password.trim() !== '') {
            admin.password = password;
        }
        
        await admin.save();
        
        res.redirect('/admin/admins?message=Admin updated successfully&type=success');
    } catch (error) {
        console.error('Error updating admin:', error);
        res.redirect(`/admin/admins?message=Error updating admin: ${error.message}&type=error`);
    }
});

// Activate admin
app.post('/admin/admins/:id/activate', isSuperAdmin, async (req, res) => {
    try {
        const admin = await Admin.findById(req.params.id);
        
        if (!admin) {
            return res.status(404).json({ success: false, message: 'Admin not found' });
        }
        
        admin.isActive = true;
        await admin.save();
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error activating admin:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Deactivate admin
app.post('/admin/admins/:id/deactivate', isSuperAdmin, async (req, res) => {
    try {
        const admin = await Admin.findById(req.params.id);
        
        if (!admin) {
            return res.status(404).json({ success: false, message: 'Admin not found' });
        }
        
        admin.isActive = false;
        await admin.save();
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error deactivating admin:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Create initial super admin (for setup)
app.get('/setup/initial-admin', async (req, res) => {
    try {
        // Check if there are existing admins
        const count = await Admin.countDocuments();
        
        if (count > 0) {
            return res.send('Admin users already exist. No action taken.');
        }
        
        // Create initial super admin
        const admin = new Admin({
            username: 'superadmin',
            email: 'admin@example.com',
            password: 'superadmin123',
            role: 'super-admin'
        });
        
        await admin.save();
        
        res.send(`Initial super admin created successfully!<br>
            Username: superadmin<br>
            Password: superadmin123<br>
            <a href="/admin/login">Go to login page</a>`);
    } catch (error) {
        console.error('Error creating initial admin:', error);
        res.status(500).send(`Error creating initial admin: ${error.message}`);
    }
});

// Create sample courses for testing
app.get('/setup/sample-courses', async (req, res) => {
    try {
        // Check if there are existing courses
        const count = await Course.countDocuments();
        
        if (count > 0) {
            return res.send('Courses already exist. No action taken.');
        }
        
        // Sample courses data
        const sampleCourses = [
            {
                name: 'Web Development Bootcamp',
                description: 'A comprehensive course covering HTML, CSS, JavaScript, Node.js, and MongoDB',
                price: 999,
                duration: '12 weeks',
                startDate: new Date('2025-06-15'),
                endDate: new Date('2025-09-07'),
                venue: 'XYZ Conference Center, Room 201',
                isActive: true
            },
            {
                name: 'Mobile App Development',
                description: 'Learn to build mobile apps for iOS and Android using React Native',
                price: 1299,
                duration: '10 weeks',
                startDate: new Date('2025-07-01'),
                endDate: new Date('2025-09-09'),
                venue: 'XYZ Conference Center, Room 305',
                isActive: true
            },
            {
                name: 'Data Science Fundamentals',
                description: 'Introduction to data analysis, visualization, and machine learning with Python',
                price: 1499,
                duration: '8 weeks',
                startDate: new Date('2025-06-20'),
                endDate: new Date('2025-08-15'),
                venue: 'Tech Hub, Building A, Floor 3',
                isActive: true
            }
        ];
        
        // Insert courses
        await Course.insertMany(sampleCourses);
        
        res.send('Sample courses created successfully!');
    } catch (error) {
        console.error('Error creating sample courses:', error);
        res.status(500).send(`Error creating sample courses: ${error.message}`);
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    
    // Handle multer errors
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.render('course-form', { 
                courses: [],
                message: 'File is too large. Maximum size is 5MB.', 
                messageType: 'error' 
            });
        }
    }
    
    res.status(500).render('course-form', { 
        courses: [],
        message: err.message || 'Something went wrong!', 
        messageType: 'error' 
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log(`Admin panel: http://localhost:${port}/admin/login`);
}); 