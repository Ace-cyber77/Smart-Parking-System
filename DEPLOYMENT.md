# Deployment Guide

## Production Deployment Checklist

### Pre-deployment Setup

1. **MongoDB Atlas Production Setup**
   - Create a production cluster (if not using existing)
   - Configure network access (IP whitelist: 0.0.0.0/0 for cloud deployment)
   - Create production database user with appropriate permissions
   - Note down the connection string

2. **Environment Configuration**
   - Generate strong JWT secret (32+ characters)
   - Set NODE_ENV to 'production'
   - Configure production URLs

### Backend Deployment (Railway)

1. **Connect Repository**
   \`\`\`bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login and deploy
   railway login
   railway init
   railway up
   \`\`\`

2. **Environment Variables**
   \`\`\`env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/parking_prod
   JWT_SECRET=your-super-secure-production-jwt-secret-key
   NODE_ENV=production
   CLIENT_URL=https://your-frontend-domain.vercel.app
   PORT=5000
   \`\`\`

### Frontend Deployment (Vercel)

1. **Deploy with Vercel CLI**
   \`\`\`bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Deploy from client directory
   cd client
   vercel --prod
   \`\`\`

2. **Environment Variables**
   \`\`\`env
   VITE_API_URL=https://your-backend-domain.railway.app/api
   VITE_SOCKET_URL=https://your-backend-domain.railway.app
   \`\`\`

### Post-deployment Steps

1. **Database Seeding**
   \`\`\`bash
   # Run seed script on production (one-time)
   railway run npm run seed
   \`\`\`

2. **Testing**
   - Test user registration and login
   - Verify real-time features work
   - Check admin functionality
   - Test booking creation and cancellation

### Monitoring

- Set up error tracking (Sentry)
- Monitor database performance
- Track API response times
- Monitor real-time connection stability
