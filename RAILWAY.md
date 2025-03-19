# Deploying to Railway

This document provides instructions for deploying this Node.js application to Railway.

## Prerequisites

1. A [Railway](https://railway.app/) account
2. Railway CLI (optional, but recommended)

## Deployment Steps

### 1. Create a new Railway project

- Log in to your Railway account
- Create a new project

### 2. Add a MongoDB database

- In your Railway project, click "New"
- Select "Database" and choose "MongoDB"
- Railway will provision a MongoDB instance for your project

### 3. Deploy your application

#### Option 1: Using Railway CLI

```bash
# Install Railway CLI if you haven't already
npm i -g @railway/cli

# Login to Railway
railway login

# Link to your Railway project
railway link

# Deploy your application
railway up
```

#### Option 2: Using GitHub Integration

- Push your code to a GitHub repository
- In Railway, select "New" > "GitHub Repo"
- Select your repository
- Railway will automatically deploy your application

### 4. Configure Environment Variables

In the Railway dashboard:

1. Go to your project
2. Click on the "Variables" tab
3. Add the following environment variables:
   - `MONGO_URI`: This will be automatically provided by Railway when connecting to MongoDB
   - `SESSION_SECRET`: A secure random string for session management
   - `EMAIL_HOST`: SMTP server host
   - `EMAIL_PORT`: SMTP server port
   - `EMAIL_SECURE`: Whether to use TLS (true/false)
   - `EMAIL_USER`: Your email username
   - `EMAIL_PASSWORD`: Your email password
   - `ADMIN_USERNAME`: Admin panel username
   - `ADMIN_PASSWORD`: Admin panel password

### 5. Access Your Application

Once deployment is complete, Railway will provide you with a URL to access your application.

## Troubleshooting

- Check the logs in the Railway dashboard for any errors
- Ensure all required environment variables are set
- Verify that your MongoDB connection is working properly 