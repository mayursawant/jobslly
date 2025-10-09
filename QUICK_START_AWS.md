# 🚀 Jobslly - Quick Start AWS Deployment

## Fastest Way to Deploy on AWS (5 Steps)

---

## Prerequisites

- AWS Account
- Domain name (optional, can use EC2 IP)
- MongoDB Atlas account (or use local MongoDB)

---

## Step 1: Launch EC2 Instance (5 minutes)

### Via AWS Console:

1. **Login to AWS Console** → Go to EC2
2. **Click "Launch Instance"**
3. **Configure Instance:**
   - Name: `Jobslly-Server`
   - AMI: **Ubuntu Server 22.04 LTS**
   - Instance Type: **t3.medium** (2 vCPU, 4 GB RAM)
   - Key pair: Create new or use existing
   - Security Group: Create new with these inbound rules:
     ```
     SSH (22)     - From: Your IP
     HTTP (80)    - From: Anywhere
     HTTPS (443)  - From: Anywhere
     Custom (3000) - From: Anywhere (Frontend)
     Custom (8001) - From: Anywhere (Backend)
     ```
   - Storage: **30 GB gp3**
4. **Launch Instance**
5. **Note down the Public IP address**

---

## Step 2: Connect and Upload Code (3 minutes)

```bash
# Download your key pair if new
chmod 400 ~/Downloads/your-key.pem

# Connect to EC2
ssh -i ~/Downloads/your-key.pem ubuntu@<YOUR-EC2-IP>

# On your local machine (new terminal)
# Upload application code
scp -i ~/Downloads/your-key.pem -r /path/to/jobslly ubuntu@<YOUR-EC2-IP>:/home/ubuntu/

# Back on EC2, move to proper location
sudo mv /home/ubuntu/jobslly /var/www/
sudo chown -R ubuntu:ubuntu /var/www/jobslly
```

**OR Clone from GitHub:**
```bash
# On EC2 instance
sudo apt install -y git
sudo mkdir -p /var/www/jobslly
sudo chown -R ubuntu:ubuntu /var/www/jobslly
cd /var/www
git clone <your-repo-url> jobslly
```

---

## Step 3: Run Automated Deployment Script (10 minutes)

```bash
# Make script executable
chmod +x /var/www/jobslly/deploy-to-aws.sh

# Run deployment
cd /var/www/jobslly
./deploy-to-aws.sh
```

This script will automatically:
- ✅ Install Node.js, Python, Nginx, Supervisor
- ✅ Setup backend with virtual environment
- ✅ Setup frontend and build production version
- ✅ Configure Nginx reverse proxy
- ✅ Configure Supervisor for process management
- ✅ Start all services

---

## Step 4: Configure Environment Variables (2 minutes)

### Update Backend Environment

```bash
nano /var/www/jobslly/backend/.env
```

Update these values:
```env
MONGO_URL="mongodb+srv://your-user:your-password@cluster.mongodb.net/"
DB_NAME="jobslly_database"
JWT_SECRET="your-super-secret-key-$(openssl rand -hex 32)"
EMERGENT_LLM_KEY="your-emergent-llm-key-here"
CORS_ORIGINS="*"
```

### Update Frontend Environment

```bash
nano /var/www/jobslly/frontend/.env
```

Update:
```env
REACT_APP_BACKEND_URL=http://<YOUR-EC2-IP>
# OR with domain
REACT_APP_BACKEND_URL=https://yourdomain.com
```

### Rebuild and Restart

```bash
# Rebuild frontend with new URL
cd /var/www/jobslly/frontend
yarn build

# Restart all services
sudo supervisorctl restart all

# Check status
sudo supervisorctl status
```

---

## Step 5: Verify Deployment (2 minutes)

### Test Backend
```bash
curl http://<YOUR-EC2-IP>/api/jobs
```

### Test Frontend
Open browser: `http://<YOUR-EC2-IP>`

### Check Service Status
```bash
sudo supervisorctl status
```

Expected output:
```
jobslly-backend    RUNNING   pid 1234, uptime 0:01:23
jobslly-frontend   RUNNING   pid 1235, uptime 0:01:23
```

### View Logs
```bash
# Backend logs
sudo supervisorctl tail -f jobslly-backend stderr

# Frontend logs
sudo supervisorctl tail -f jobslly-frontend stdout

# Nginx logs
sudo tail -f /var/log/nginx/access.log
```

---

## 🎉 You're Live!

**Access your application:**
- **Frontend**: `http://<YOUR-EC2-IP>`
- **Backend API**: `http://<YOUR-EC2-IP>/api`
- **API Docs**: `http://<YOUR-EC2-IP>/docs`

---

## Optional: Setup Domain & SSL (10 minutes)

### 1. Point Domain to EC2

In your domain registrar (GoDaddy, Namecheap, etc.):
- Create A record: `@` → `<YOUR-EC2-IP>`
- Create A record: `www` → `<YOUR-EC2-IP>`

### 2. Update Nginx Config

```bash
sudo nano /etc/nginx/sites-available/jobslly
```

Change:
```nginx
server_name yourdomain.com www.yourdomain.com;
```

Test and restart:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

### 3. Install SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate (follow prompts)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Verify auto-renewal
sudo certbot renew --dry-run
```

### 4. Update Frontend URL

```bash
nano /var/www/jobslly/frontend/.env
```

Change to:
```env
REACT_APP_BACKEND_URL=https://yourdomain.com
```

Rebuild:
```bash
cd /var/www/jobslly/frontend
yarn build
sudo supervisorctl restart jobslly-frontend
```

---

## MongoDB Atlas Configuration

### Add EC2 IP to Whitelist

1. Go to **MongoDB Atlas Dashboard**
2. Navigate to **Network Access**
3. Click **Add IP Address**
4. Add your EC2 public IP: `<YOUR-EC2-IP>/32`
   - OR for testing: `0.0.0.0/0` (allow from anywhere)
5. Click **Confirm**

### Test Connection

```bash
# On EC2
cd /var/www/jobslly/backend
source venv/bin/activate
python3 << 'EOF'
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()
client = MongoClient(os.environ['MONGO_URL'])
print("Available databases:", client.list_database_names())
print("✅ MongoDB connection successful!")
EOF
```

---

## Useful Commands

### Service Management
```bash
# Check status
sudo supervisorctl status

# Restart services
sudo supervisorctl restart jobslly-backend
sudo supervisorctl restart jobslly-frontend
sudo supervisorctl restart all

# Stop services
sudo supervisorctl stop all

# Start services
sudo supervisorctl start all
```

### View Logs
```bash
# Backend error logs
sudo supervisorctl tail -f jobslly-backend stderr

# Backend output logs
sudo supervisorctl tail -f jobslly-backend stdout

# Frontend logs
sudo supervisorctl tail -f jobslly-frontend stdout

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Update Application
```bash
# Pull latest code
cd /var/www/jobslly
git pull origin main

# Update backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
deactivate

# Update frontend
cd ../frontend
yarn install
yarn build

# Restart services
sudo supervisorctl restart all
```

---

## Troubleshooting

### Backend not starting

```bash
# Check logs
sudo supervisorctl tail -f jobslly-backend stderr

# Check if port is in use
sudo lsof -i :8001

# Manually test
cd /var/www/jobslly/backend
source venv/bin/activate
uvicorn server:app --host 0.0.0.0 --port 8001
```

### Frontend build fails

```bash
# Clear and rebuild
cd /var/www/jobslly/frontend
rm -rf node_modules build
yarn install
yarn build
```

### Cannot connect to MongoDB

```bash
# Check MongoDB Atlas network access
# Verify connection string in backend/.env
# Test connection with Python script above
```

### Nginx errors

```bash
# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Check error logs
sudo tail -f /var/log/nginx/error.log
```

---

## Cost Breakdown

**Monthly Costs:**
- EC2 t3.medium: ~$30-35
- EBS 30GB: ~$3
- Data Transfer (100GB): ~$9
- **Total: ~$42-47/month**

**Ways to Reduce Costs:**
- Use t3.small ($15/month) for low traffic
- Use spot instances (70% cheaper)
- Use AWS Free Tier (first 12 months)

---

## Next Steps

1. ✅ **Monitor Performance**
   - Setup CloudWatch alerts
   - Monitor CPU and memory usage

2. ✅ **Security Hardening**
   - Change SSH port
   - Setup fail2ban
   - Regular security updates

3. ✅ **Backup Strategy**
   - Setup automated backups
   - Test restore procedures

4. ✅ **CI/CD Pipeline**
   - Setup GitHub Actions
   - Automated deployments

5. ✅ **Scaling**
   - Add load balancer
   - Setup auto-scaling group
   - Database replication

---

## Support & Resources

- **Full Documentation**: `/var/www/jobslly/AWS_DEPLOYMENT_GUIDE.md`
- **AWS Documentation**: https://docs.aws.amazon.com/
- **Nginx Documentation**: https://nginx.org/en/docs/
- **Supervisor Documentation**: http://supervisord.org/

---

**🚀 Congratulations! Your Jobslly application is now live on AWS!**

**Share your deployment:**
- Frontend: `http://<YOUR-EC2-IP>` or `https://yourdomain.com`
- API Docs: `http://<YOUR-EC2-IP>/docs`

For production use, make sure to:
- ✅ Setup SSL certificate
- ✅ Configure firewall rules
- ✅ Setup monitoring and alerts
- ✅ Regular backups
- ✅ Security updates
