# Course Registration System

A complete web application for course registration with payment processing, admin panel, and email notifications.

## Features

- **User-facing features:**
  - Course selection from available options
  - Registration form with validation
  - Payment details submission
  - Receipt image upload
  - Registration confirmation with unique registration number

- **Admin Panel:**
  - Secure login
  - Dashboard with statistics
  - Order management (view, approve, reject)
  - Detailed order information with payment receipts

- **Email Notifications:**
  - Automatic confirmation emails after order approval
  - Custom email template with registration details

## Technology Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB (with Mongoose ODM)
- **Frontend:** EJS templates, CSS, JavaScript
- **Authentication:** Express-session
- **Email:** Nodemailer
- **File Uploads:** Multer

## Installation

1. Clone this repository
2. Install dependencies
   ```
   npm install
   ```
3. Create a `.env` file with required environment variables (see `.env.example`)
4. Ensure MongoDB is running
5. Start the application
   ```
   npm start
   ```

## Configuration

Create a `.env` file with the following variables:

```
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/course-registration

# Email Configuration
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-email-password

# Application Settings
PORT=3000
SESSION_SECRET=your-secret-key

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

## Usage

### User Registration

1. Access the application at `http://localhost:3000`
2. Select a course from the available options
3. Fill in personal details and payment information
4. Upload payment receipt
5. Submit the form to receive registration number

### Admin Panel

1. Access the admin panel at `http://localhost:3000/admin/login`
2. Login with credentials from `.env` file
3. View and manage registrations
4. Approve or reject orders
5. View full order details including receipts

## Sample Data

To populate the database with sample courses, visit:
```
http://localhost:3000/setup/sample-courses
```

## Directory Structure

- `server.js` - Main application entry point
- `config/` - Configuration files
- `models/` - MongoDB schemas
- `views/` - EJS templates
- `public/` - Static assets
- `uploads/` - Uploaded files

## License

ISC

## Acknowledgments

- Express.js
- MongoDB
- EJS templates 