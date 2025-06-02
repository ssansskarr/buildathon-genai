# AIlign Deployment Guide

This guide provides instructions for deploying the AIlign application on Vercel (frontend) and Railway (backend).

## Repository Setup

For optimal deployment, you should set up your code in one of these two ways:

### Option 1: Monorepo Approach
Keep both frontend and backend in the same repository, but deploy them separately:

```
ailign/
├── src/                # Next.js frontend
├── public/             # Frontend static assets
├── flask_backend/      # Flask backend
└── ...
```

With this structure:
- Deploy the root directory to Vercel for the frontend
- Deploy the `flask_backend` directory to Railway for the backend

### Option 2: Separate Repositories
Split your code into two repositories:

1. Frontend repository (ailign-frontend)
2. Backend repository (ailign-backend)

This approach makes deployment simpler but requires managing two repositories.

## Frontend Deployment (Vercel)

1. Push your code to a GitHub repository.

2. Sign up for an account on [Vercel](https://vercel.com/).

3. Create a new project by importing your GitHub repository.

4. In the project settings, configure the following:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next` (or `dist` if using a custom output directory)
   - Root Directory: `/` (or the directory containing your frontend code)

5. Add the following environment variables in Vercel:
   ```
   NEXT_PUBLIC_API_URL=https://ailign-backend.up.railway.app
   ```

6. Deploy the application.

## Backend Deployment (Railway)

1. Sign up for an account on [Railway](https://railway.app/).

2. Create a new project and select "Deploy from GitHub repo".

3. Connect your GitHub repository and select the Flask backend directory as the root of your project.

4. Configure the environment variables in Railway:
   ```
   LYZR_API_KEY=sk-default-Nlyl5TvJQfPqT6inYtuWx8kaiBa9VCeH
   LYZR_AGENT_ID=683cc9869bef0c4bbc19754b
   LYZR_USER_ID=pavankalvakota@gmail.com
   LYZR_SESSION_ID=683cc9869bef0c4bbc19754b-zi98tnx8gy
   GEMINI_API_KEY=AIzaSyARVFZ6ub0Q6vfJATOLg1ew4TrNlJiL9vE
   PORT=5000
   ```

5. Deploy the backend service.

6. After deployment, Railway will provide you with a URL for your backend service. Update the `destination` in your frontend's `vercel.json` file with this URL.

## API Configuration

Before deployment, ensure your application is configured to use the right API endpoints:

1. In production, your frontend should make API calls to your Railway backend URL:
   ```javascript
   // Example Next.js API route
   const apiEndpoint = process.env.NODE_ENV === 'production'
     ? process.env.NEXT_PUBLIC_API_URL || 'https://ailign-backend.up.railway.app'
     : 'http://localhost:5000';
   ```

2. Make sure your Flask backend API credentials are updated to use the new Lyzr AI account:
   ```python
   ENV_VARS = {
     "LYZR_API_KEY": "sk-default-Nlyl5TvJQfPqT6inYtuWx8kaiBa9VCeH",
     "LYZR_AGENT_ID": "683cc9869bef0c4bbc19754b",
     "LYZR_USER_ID": "pavankalvakota@gmail.com",
     "LYZR_SESSION_ID": "683cc9869bef0c4bbc19754b-zi98tnx8gy",
     "GEMINI_API_KEY": "AIzaSyARVFZ6ub0Q6vfJATOLg1ew4TrNlJiL9vE"
   }
   ```

## Manual Backend Deployment Steps

If you prefer to deploy the backend manually, follow these steps:

1. Navigate to your Flask backend directory:
   ```bash
   cd flask_backend
   ```

2. Create a requirements.txt file if not already present:
   ```
   flask==2.2.3
   flask-cors==3.0.10
   python-dotenv==1.0.0
   requests==2.28.2
   gunicorn==20.1.0
   ```

3. Create a Procfile for the web server:
   ```
   web: gunicorn app:app
   ```

4. Create a railway.json file for configuration:
   ```json
   {
     "$schema": "https://railway.app/railway.schema.json",
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "gunicorn app:app",
       "restartPolicyType": "ON_FAILURE",
       "restartPolicyMaxRetries": 10
     }
   }
   ```

5. Initialize a Git repository if not already done:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for deployment"
   ```

6. Push to Railway using their CLI:
   ```bash
   railway login
   railway init
   railway up
   ```

## Checking Your Deployment

1. Frontend: Visit your Vercel deployment URL to check if the frontend is working.
2. Backend: Visit your Railway deployment URL followed by `/health` to check if the backend is working.

## Troubleshooting

If you encounter issues with CORS:

1. Ensure your Flask backend has CORS properly configured:
   ```python
   CORS(app, origins=["*"], supports_credentials=True)
   ```

2. Verify that API requests from the frontend are being properly proxied through Vercel or directly accessing the Railway backend.

3. Check Railway logs for any backend errors.

If your PDF generation is not working, ensure all required packages are installed and included in the requirements.txt file.

## Renaming Your Application

Since the application has been rebranded from "AI Cost Optimizer" to "AIlign":

1. Update package.json:
   ```json
   {
     "name": "ailign",
     "version": "0.1.0",
     "private": true,
     ...
   }
   ```

2. Ensure all UI elements consistently use the AIlign branding.

3. Update metadata in the HTML head (title, description, etc.) to reflect the new branding. 