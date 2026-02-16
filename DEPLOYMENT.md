# 🚀 Deployment Guide

Complete guide to deploy the NBA Predictor Web App to production.

## Table of Contents

1. [Vercel (Recommended)](#vercel-recommended)
2. [Netlify](#netlify)
3. [Heroku](#heroku)
4. [Docker](#docker)
5. [Traditional VPS](#traditional-vps)
6. [Environment Variables](#environment-variables)

---

## Vercel (Recommended)

Vercel is the easiest and fastest deployment option, especially for Vite apps.

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Prepare Your Project
```bash
# Make sure everything is committed to git
git add .
git commit -m "Ready for deployment"
```

### Step 3: Deploy
```bash
vercel
```

You'll be asked a few questions:
- Set up new project? → Yes
- Which scope? → Your account
- Link to existing project? → No
- Project name → nba-predictor-webapp
- Directory → ./

### Step 4: Configure Environment Variables
After deployment, add your env vars:
```bash
vercel env add BALLDONTLIE_API_KEY
vercel env add ODDS_API_KEY
```

Or in Vercel dashboard:
1. Go to your project settings
2. Environment Variables
3. Add your API keys

### Vercel + Serverless Backend

For the backend, you can use Vercel Functions:

1. Create `api/games.js`:
```javascript
export default async (req, res) => {
  const { date } = req.query
  // Your game fetching logic
  res.status(200).json({ /* data */ })
}
```

2. Create `api/odds.js`:
```javascript
export default async (req, res) => {
  const { homeTeam, awayTeam } = req.query
  // Your odds fetching logic
  res.status(200).json({ /* data */ })
}
```

3. Update `src/lib/api.js` to use Vercel Functions:
```javascript
this.backendUrl = process.env.VITE_API_URL || window.location.origin
```

---

## Netlify

Great alternative with similar ease of use.

### Step 1: Build Your Frontend
```bash
npm run build
```

### Step 2: Connect to Netlify
Option A - CLI:
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

Option B - Drag & Drop:
1. Go to https://app.netlify.com/drop
2. Drag the `dist` folder
3. Done!

### Step 3: Set Up Functions for Backend

Create `netlify/functions/games.js`:
```javascript
exports.handler = async (event) => {
  const { date } = event.queryStringParameters
  // Your logic here
  return {
    statusCode: 200,
    body: JSON.stringify(/* data */)
  }
}
```

Update `netlify.toml`:
```toml
[build]
  command = "npm run build"
  functions = "netlify/functions"
  publish = "dist"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

---

## Heroku

Good for traditional deployment with a Node backend.

### Step 1: Install Heroku CLI
```bash
# macOS
brew tap heroku/brew && brew install heroku

# Linux/Windows - download from heroku.com/download
```

### Step 2: Login
```bash
heroku login
```

### Step 3: Create App
```bash
heroku create nba-predictor-webapp
```

### Step 4: Set Environment Variables
```bash
heroku config:set BALLDONTLIE_API_KEY=your_key
heroku config:set ODDS_API_KEY=your_key
```

### Step 5: Deploy
```bash
git push heroku main
```

### Step 6: View Logs
```bash
heroku logs --tail
```

---

## Docker

Deploy anywhere with Docker.

### Step 1: Create Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Server stage
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=build /app/dist ./public
COPY server server

EXPOSE 3001
ENV NODE_ENV=production
CMD ["node", "server/index.js"]
```

### Step 2: Create .dockerignore
```
node_modules
.git
.env
dist
.gitignore
```

### Step 3: Build and Run Locally
```bash
docker build -t nba-predictor:latest .
docker run -p 3001:3001 \
  -e BALLDONTLIE_API_KEY=your_key \
  -e ODDS_API_KEY=your_key \
  nba-predictor:latest
```

### Step 4: Push to Registry
```bash
# Docker Hub
docker tag nba-predictor:latest yourusername/nba-predictor:latest
docker push yourusername/nba-predictor:latest

# Google Cloud
docker tag nba-predictor:latest gcr.io/your-project/nba-predictor:latest
docker push gcr.io/your-project/nba-predictor:latest
```

### Step 5: Deploy to Cloud Run (Google Cloud)
```bash
gcloud run deploy nba-predictor \
  --image gcr.io/your-project/nba-predictor:latest \
  --port 3001 \
  --set-env-vars BALLDONTLIE_API_KEY=your_key,ODDS_API_KEY=your_key
```

---

## Traditional VPS

Deploy to AWS EC2, DigitalOcean, Linode, etc.

### Step 1: SSH into Server
```bash
ssh user@your-server-ip
```

### Step 2: Set Up Environment
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y

# Install PM2 for process management
sudo npm install -g pm2
```

### Step 3: Clone Repository
```bash
cd /var/www
git clone https://github.com/yourusername/nba-predictor-webapp.git
cd nba-predictor-webapp
npm install
npm run build
```

### Step 4: Configure PM2
```bash
pm2 start server/index.js --name "nba-predictor"
pm2 startup
pm2 save
```

### Step 5: Set Up Nginx (Reverse Proxy)
```bash
sudo apt install nginx -y
```

Create `/etc/nginx/sites-available/nba-predictor`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/nba-predictor-webapp/dist;
        try_files $uri /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/nba-predictor /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 6: SSL Certificate (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

---

## Environment Variables

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:3001
```

### Backend (.env)
```
PORT=3001
NODE_ENV=production

# API Keys (optional)
BALLDONTLIE_API_KEY=your_key
ODDS_API_KEY=your_key

# Optional: Database or other services
DATABASE_URL=...
REDIS_URL=...
```

---

## Production Checklist

- [ ] Build tested locally with `npm run build`
- [ ] All environment variables configured
- [ ] API keys verified working
- [ ] CORS settings correct for your domain
- [ ] SSL certificate enabled (HTTPS)
- [ ] Error logging set up
- [ ] Performance monitoring enabled
- [ ] Backups configured
- [ ] CI/CD pipeline set up (GitHub Actions, etc.)
- [ ] Security headers configured
- [ ] Rate limiting enabled on API
- [ ] Cache headers set appropriately

---

## Monitoring & Maintenance

### View Real-Time Logs
```bash
# Vercel
vercel logs

# Heroku
heroku logs --tail

# PM2
pm2 logs
```

### Monitor Performance
```bash
# PM2
pm2 monit

# Install monitoring tools
npm install -g pm2-auto-pull  # Auto-restart on changes
```

### Auto-Deploy on Git Push
**GitHub Actions** (`.github/workflows/deploy.yml`):
```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install && npm run build
      - run: vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

---

## Troubleshooting

### Build fails
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

### API keys not working
- Check they're in the correct environment
- Verify they're not expired
- Test directly with curl

### High latency
- Enable caching in backend
- Use CDN for static assets
- Optimize database queries

### Memory issues
```bash
# Increase Node memory
NODE_OPTIONS="--max-old-space-size=4096" npm start
```

---

## Support

- 📖 [Vercel Docs](https://vercel.com/docs)
- 📖 [Netlify Docs](https://docs.netlify.com/)
- 📖 [Heroku Docs](https://devcenter.heroku.com/)

---

**Ready to go live?** Choose your platform above and follow the steps! 🚀
