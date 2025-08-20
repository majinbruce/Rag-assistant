# 🚀 Deployment Guide

## Railway + Vercel Deployment Strategy

### Why This Stack?

**Railway (Backend + Databases)**
- ✅ Automatic Node.js containerization (no Dockerfile needed)
- ✅ Managed PostgreSQL service
- ✅ Easy Qdrant deployment via Docker
- ✅ Environment variable management
- ✅ Automatic SSL certificates
- ✅ Simple scaling

**Vercel (Frontend)**  
- ✅ Optimized for React applications
- ✅ CDN and edge optimization
- ✅ Automatic deployments from Git
- ✅ Environment variable management

## Step-by-Step Deployment

### 1. Prepare Your Code

```bash
# Ensure dependencies are installed
cd server && npm ci
cd ../client && npm ci

# Test locally
cd server && npm run dev
cd ../client && npm start
```

### 2. Deploy Backend to Railway

#### 2.1 Install Railway CLI
```bash
npm install -g @railway/cli
railway login
```

#### 2.2 Create Railway Project
```bash
cd server
railway init
railway up
```

#### 2.3 Add PostgreSQL Service
1. Go to Railway dashboard → Your Project
2. Click "New Service" → "Database" → "PostgreSQL"
3. Railway will automatically create `DATABASE_URL` environment variable

#### 2.4 Deploy Qdrant Vector Database
1. In Railway dashboard → "New Service" → "Deploy from GitHub"
2. Use Qdrant official Docker image: `qdrant/qdrant:latest`
3. Set port to `6333`
4. Note the internal URL: `https://your-qdrant-service.railway.app`

#### 2.5 Configure Environment Variables in Railway
Set these in Railway dashboard → Your Server Service → Variables:

```env
NODE_ENV=production
PORT=8000
FRONTEND_URL=https://your-app.vercel.app

# Database (Railway auto-provides DATABASE_URL)
# But you still need individual vars for your app:
DB_HOST=containers-us-west-xxx.railway.app
DB_PORT=5432
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD=xxx-from-railway-dashboard

# Qdrant
QDRANT_URL=https://your-qdrant-service.railway.app
QDRANT_COLLECTION_NAME=rag_documents

# Generate these secrets:
# openssl rand -hex 64
JWT_SECRET=your-64-character-hex-string
JWT_REFRESH_SECRET=different-64-character-hex-string
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

BCRYPT_SALT_ROUNDS=12
SESSION_SECRET=another-64-character-hex-string

# Your OpenAI API key
OPENAI_API_KEY=your-actual-openai-key
```

### 3. Deploy Frontend to Vercel

#### 3.1 Install Vercel CLI
```bash
npm install -g vercel
```

#### 3.2 Deploy
```bash
cd client
vercel --prod
```

#### 3.3 Configure Environment Variables in Vercel
Set in Vercel dashboard → Your Project → Settings → Environment Variables:

```env
REACT_APP_API_URL=https://your-backend.railway.app/api
```

### 4. Database Setup

#### 4.1 Initialize Database Schema
```bash
# Connect to your Railway PostgreSQL
railway connect postgres

# Or use the provided URL in your local environment
# Copy DATABASE_URL from Railway dashboard
export DATABASE_URL=postgresql://postgres:password@host:port/railway

# Run schema
cd server
npm run init-db
```

## Production Checklist

### ✅ Security
- [ ] All API keys are set as environment variables
- [ ] JWT secrets are cryptographically secure (64+ characters)
- [ ] Database passwords are strong
- [ ] CORS is configured for production domain
- [ ] Rate limiting is enabled
- [ ] HTTPS is enabled (Railway/Vercel do this automatically)

### ✅ Performance
- [ ] Database connection pooling configured
- [ ] File upload size limits set
- [ ] API rate limits configured
- [ ] Frontend build optimization enabled

### ✅ Monitoring
- [ ] Error logging configured
- [ ] Database monitoring enabled
- [ ] API endpoint health checks
- [ ] Frontend error boundaries

## Cost Optimization

### Railway Pricing
- **Starter Plan**: $5/month per service
- **PostgreSQL**: ~$5/month for small DB
- **Qdrant**: ~$5-10/month depending on usage
- **Total Backend**: ~$15-20/month

### Vercel Pricing
- **Hobby Plan**: Free for personal projects
- **Pro Plan**: $20/month for commercial use

### Alternative: Self-Hosted Database
If cost is a concern, you can use:
- **Supabase**: Free PostgreSQL tier (500MB)
- **Railway**: Keep Qdrant on Railway, use Supabase for PostgreSQL
- **Docker**: Self-host both on a VPS

## Troubleshooting

### Common Issues

**Database Connection Errors**
```bash
# Check if DATABASE_URL is correctly formatted
echo $DATABASE_URL
# Should be: postgresql://user:password@host:port/database
```

**CORS Errors**
- Ensure FRONTEND_URL in backend matches your Vercel domain exactly
- Include protocol: `https://your-app.vercel.app`

**Environment Variables Not Loading**
- Railway: Check Variables tab in dashboard
- Vercel: Check Settings → Environment Variables
- Both services require redeploy after env changes

**Qdrant Connection Issues**
- Verify QDRANT_URL points to Railway service
- Check Qdrant service is running in Railway dashboard
- Ensure port 6333 is correctly configured

### Useful Commands

```bash
# Railway
railway status                    # Check deployment status
railway logs                     # View application logs
railway shell                    # SSH into container
railway connect postgres         # Connect to database

# Vercel  
vercel --prod                    # Deploy to production
vercel logs                      # View deployment logs
vercel env ls                    # List environment variables
```

## Scaling Considerations

### Database Scaling
- Monitor connection pool usage
- Consider read replicas for heavy read workloads
- Implement database query optimization

### API Scaling  
- Railway auto-scales within limits
- Monitor memory and CPU usage
- Consider implementing caching (Redis)

### Vector Database Scaling
- Monitor Qdrant memory usage
- Consider Qdrant Cloud for larger scale
- Implement vector search optimization

## Security Best Practices

1. **Never commit `.env` files**
2. **Rotate secrets regularly** (especially JWT secrets)
3. **Monitor API usage** for unusual activity
4. **Keep dependencies updated**
5. **Use HTTPS everywhere** (automatic on Railway/Vercel)
6. **Implement request logging** for security monitoring

## Backup Strategy

1. **Database Backups**: Railway provides automatic PostgreSQL backups
2. **Vector Database**: Implement Qdrant backup scripts
3. **Code**: Git repository serves as code backup
4. **Environment Variables**: Securely document and store separately