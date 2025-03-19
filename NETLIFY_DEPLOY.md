# Deploying to Netlify

This document provides instructions for deploying the Course Registration System to Netlify.

## Prerequisites

- A Netlify account (you can sign up for free at [netlify.com](https://www.netlify.com/))
- A MongoDB Atlas account (for the database)
- Git installed on your local machine

## Setup MongoDB Atlas

1. Create a MongoDB Atlas cluster if you don't have one already
2. Create a database user with read/write permissions
3. Add your IP address to the IP whitelist or allow access from anywhere (for development)
4. Get your MongoDB connection string from Atlas

## Deploy to Netlify

You can deploy this project to Netlify using one of the following methods:

### Option 1: Deploy via Netlify Dashboard

1. Log in to your Netlify account
2. Click on "New site from Git"
3. Connect to your Git provider (GitHub, GitLab, or Bitbucket)
4. Select your repository
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `public`
6. Set up environment variables:
   - MONGODB_URI: Your MongoDB connection string
   - SESSION_SECRET: A random string for session encryption
   - EMAIL_USER: Your email for sending confirmations
   - EMAIL_PASS: Your email password
   - ADMIN_EMAIL: Default admin email
   - ADMIN_PASSWORD: Default admin password
7. Click "Deploy site"

### Option 2: Deploy with Netlify CLI

1. Install the Netlify CLI:
   ```
   npm install -g netlify-cli
   ```

2. Log in to your Netlify account:
   ```
   netlify login
   ```

3. Initialize your site:
   ```
   netlify init
   ```

4. Configure your site with the CLI prompts, using the same build settings as above
   
5. Set up environment variables:
   ```
   netlify env:set MONGODB_URI "your-mongodb-connection-string"
   netlify env:set SESSION_SECRET "your-session-secret"
   netlify env:set EMAIL_USER "your-email"
   netlify env:set EMAIL_PASS "your-email-password"
   netlify env:set ADMIN_EMAIL "admin@example.com"
   netlify env:set ADMIN_PASSWORD "your-admin-password"
   ```

6. Deploy your site:
   ```
   netlify deploy --prod
   ```

## Important Notes

1. **File Upload Handling**: In the serverless environment, the file upload functionality has been modified. For a complete solution, you would need to:
   - Use Netlify's Large Media feature, or
   - Set up an external storage service like AWS S3, Cloudinary, or Firebase Storage
   
2. **Database Access**: Make sure your MongoDB Atlas cluster allows connections from Netlify's IPs, or set it to allow connections from anywhere for easier development.

3. **Limitations**: Be aware of Netlify's free tier limitations:
   - 125K serverless function invocations per month
   - 100 hours of function runtime per month
   - Function timeout of 10 seconds
   
4. **Testing**: Before deploying to production, test your functions using:
   ```
   netlify dev
   ```

## Continuous Deployment

Once set up, any changes pushed to your Git repository will automatically trigger a new deployment on Netlify.

## Troubleshooting

If you encounter any issues during deployment:

1. Check the Netlify deployment logs
2. Verify your environment variables are set correctly
3. Check your function logs in the Netlify dashboard
4. For local development issues, run `netlify dev --debug`

For additional help, refer to the [Netlify documentation](https://docs.netlify.com/). 