# DeadlineDASH Deployment Guide

This guide provides step-by-step instructions for deploying the DeadlineDASH application to Render, a cloud platform that offers free hosting for Node.js applications.

## Prerequisites

1. A GitHub account with your DeadlineDASH repository
2. A MongoDB Atlas account for database hosting
3. A Twilio account (if you want to use SMS features)

## Step 1: Set Up MongoDB Atlas

1. Create a free account on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a new cluster (the free tier is sufficient for starting)
3. Set up a database user with a secure password
4. Configure network access (IP whitelist) to allow connections from anywhere (0.0.0.0/0)
5. Get your MongoDB connection string from the Atlas dashboard

## Step 2: Deploy to Render

### Sign Up for Render

1. Go to [Render](https://render.com/) and sign up using your GitHub account

### Create a New Web Service

1. Click on "New" and select "Web Service"
2. Connect your GitHub repository
3. Configure the service with the following settings:
   - **Name**: DeadlineDASH (or your preferred name)
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### Set Environment Variables

1. In the Render dashboard, go to your web service
2. Click on "Environment" tab
3. Add the following environment variables (based on your `.env.example` file):

```
MONGODB_URI=your_mongodb_atlas_connection_string
PORT=3000
NODE_ENV=production
JWT_SECRET=your_secure_random_string
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

4. Click "Save Changes"

### Deploy Your Application

1. Render will automatically deploy your application when you save the changes
2. You can monitor the deployment in the "Events" tab
3. Once deployed, you can access your application at the URL provided by Render

## Alternative Deployment Options

### Railway

Railway is another excellent platform for deploying Node.js applications with MongoDB support.

1. Sign up at [Railway](https://railway.app/) using your GitHub account
2. Create a new project and select "Deploy from GitHub"
3. Select your repository and deploy
4. Add environment variables similar to the ones for Render
5. Generate a domain in the Settings tab

### Fly.io

Fly.io offers a generous free tier and global deployment options.

1. Sign up at [Fly.io](https://fly.io/)
2. Install the Fly CLI
3. Run `flyctl auth login` to log in
4. Navigate to your project directory and run `flyctl launch`
5. Set up environment variables using `flyctl secrets set KEY=VALUE`

## Post-Deployment Steps

1. Test your application thoroughly after deployment
2. Set up monitoring and alerts (Render provides basic monitoring)
3. Consider setting up a CI/CD pipeline for automated deployments

## Troubleshooting

### Common Issues

1. **Application crashes on startup**: Check your environment variables and MongoDB connection
2. **MongoDB connection errors**: Verify your MongoDB Atlas network settings
3. **Missing dependencies**: Ensure all dependencies are listed in package.json

### Logs

Check the logs in your deployment platform for error messages:

- In Render: Go to the "Logs" tab in your web service dashboard
- In Railway: Click on your deployment and view the logs section
- In Fly.io: Run `flyctl logs`

## Security Considerations

1. Never commit sensitive credentials to your repository
2. Use environment variables for all sensitive information
3. Set a strong JWT_SECRET value
4. Consider enabling additional security features in your deployment platform

## Performance Optimization

1. Enable caching where appropriate
2. Consider using a CDN for static assets
3. Optimize database queries and indexes

For more detailed information, refer to the documentation of your chosen deployment platform.