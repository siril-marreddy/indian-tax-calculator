# Deployment Guide for Indian Tax Calculator

## Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right and select "New repository"
3. Name your repository: `indian-tax-calculator`
4. Make it public or private as desired
5. Don't initialize with README (we already have one)
6. Create the repository

## Step 2: Push Code to GitHub

After creating the repository, run these commands in your terminal:

```bash
# Add your GitHub repository as origin
git remote add origin https://github.com/YOUR_USERNAME/indian-tax-calculator.git

# Push your code
git push -u origin main
```

## Step 3: Deploy Frontend to Vercel

1. Go to [Vercel](https://vercel.com)
2. Sign up/Login with your GitHub account
3. Click "New Project"
4. Import your GitHub repository
5. Configure build settings:
   - Framework Preset: Create React App
   - Build Command: `npm run build`
   - Output Directory: `build`
6. Add environment variable:
   - `REACT_APP_API_URL` = Your backend URL (will be updated after backend deployment)
7. Click "Deploy"

## Step 4: Deploy Backend to Render

1. Go to [Render](https://render.com)
2. Sign up/Login
3. Click "New +" and select "Web Service"
4. Connect your GitHub repository
5. Configure:
   - Name: `indian-tax-calculator-api`
   - Environment: Node
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && node server.js`
   - Add environment variables:
     - `PORT` = 5001
     - `NODE_ENV` = production
6. Click "Create Web Service"

## Step 5: Update Frontend with Backend URL

1. After backend is deployed, copy the Render URL (e.g., https://your-app.onrender.com)
2. Go to Vercel dashboard
3. Go to Settings > Environment Variables
4. Add: `REACT_APP_API_URL` = `https://your-app.onrender.com`
5. Redeploy the frontend

## Step 6: Update Frontend Code

Update `src/App.tsx` to use the environment variable:

```typescript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

// In handleCalculate function:
const response = await fetch(`${API_URL}/api/tax/calculate`, {
  // ... rest of the code
});
```

## Alternative Deployment Options

### Frontend
- **Netlify**: Similar to Vercel, drag and drop the `build` folder
- **GitHub Pages**: Free for static sites
- **AWS S3 + CloudFront**: For production scale

### Backend
- **Railway**: Similar to Render, very easy deployment
- **Heroku**: Popular choice (paid plans only now)
- **AWS EC2/ECS**: For production scale
- **Google Cloud Run**: Serverless option

## Free Deployment Stack

For a completely free deployment:
1. Frontend: Vercel or Netlify (generous free tier)
2. Backend: Render.com (free tier with limitations)
3. Database: SQLite (included with backend)

## Production Considerations

1. **Database**: Consider PostgreSQL or MySQL for production
2. **CORS**: Update CORS settings to only allow your frontend domain
3. **Environment Variables**: Use proper secrets management
4. **SSL**: Ensure HTTPS is enabled (automatic with Vercel/Render)
5. **Monitoring**: Add error tracking (Sentry) and analytics
6. **Backup**: Regular database backups

## Quick Deploy Commands

```bash
# Build frontend for production
npm run build

# Test production build locally
npx serve -s build

# Backend production start
NODE_ENV=production node backend/server.js
```

## Troubleshooting

1. **CORS Issues**: Make sure backend allows your frontend URL
2. **Database Path**: SQLite file path might need adjustment in production
3. **Port Issues**: Some hosts assign ports dynamically (use process.env.PORT)
4. **Build Failures**: Check Node version compatibility

## Live Demo URLs

After deployment, your app will be available at:
- Frontend: `https://your-app.vercel.app`
- Backend API: `https://your-app.onrender.com/api`
- Health Check: `https://your-app.onrender.com/api/health`