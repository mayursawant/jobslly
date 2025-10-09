# 🚀 Jobslly - AWS Deployment Guide

## Complete Step-by-Step Guide to Deploy on AWS

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Deployment Architecture](#deployment-architecture)
3. [Option 1: AWS EC2 Deployment (Recommended)](#option-1-aws-ec2-deployment-recommended)
4. [Option 2: AWS Elastic Beanstalk](#option-2-aws-elastic-beanstalk)
5. [Option 3: AWS ECS with Docker](#option-3-aws-ecs-with-docker)
6. [Post-Deployment Configuration](#post-deployment-configuration)
7. [SSL Certificate Setup](#ssl-certificate-setup)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### 1. AWS Account Setup
- AWS Account with billing enabled
- AWS CLI installed on your local machine
- IAM user with appropriate permissions

### 2. Install Required Tools
```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Verify installation
aws --version
```

### 3. Configure AWS CLI
```bash
aws configure
# Enter:
# AWS Access Key ID: [your-access-key]
# AWS Secret Access Key: [your-secret-key]
# Default region: us-east-1 (or your preferred region)
# Default output format: json
```

### 4. Generate SSH Key Pair
```bash
# Generate SSH key for EC2 access
ssh-keygen -t rsa -b 4096 -f ~/.ssh/jobslly-aws-key
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         AWS Cloud                            │
│                                                              │
│  ┌────────────────┐      ┌──────────────────┐              │
│  │   Route 53     │─────▶│   CloudFront     │              │
│  │ (DNS)          │      │   (CDN)          │              │
│  └────────────────┘      └──────────────────┘              │
│                                 │                            │
│                                 ▼                            │
│  ┌─────────────────────────────────────────────────┐       │
│  │            Application Load Balancer            │       │
│  └─────────────────────────────────────────────────┘       │
│                      │              │                       │
│         ┌────────────┴──────┐      │                       │
│         ▼                    ▼      ▼                       │
│  ┌─────────────┐      ┌─────────────┐                     │
│  │   EC2       │      │   EC2       │                     │
│  │ (Frontend)  │      │ (Backend)   │                     │
│  │ React App   │      │ FastAPI     │                     │
│  └─────────────┘      └─────────────┘                     │
│                              │                              │
│                              ▼                              │
│                    ┌──────────────────┐                    │
│                    │  MongoDB Atlas   │                    │
│                    │  (External)      │                    │
│                    └──────────────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Option 1: AWS EC2 Deployment (Recommended)

This is the most flexible and cost-effective option for full control.

### Step 1: Create EC2 Instance

#### 1.1 Create Security Group
```bash
# Create security group
aws ec2 create-security-group \
    --group-name jobslly-sg \
    --description "Security group for Jobslly application" \
    --vpc-id <your-vpc-id>

# Add inbound rules
# Allow SSH (port 22)
aws ec2 authorize-security-group-ingress \
    --group-name jobslly-sg \
    --protocol tcp \
    --port 22 \
    --cidr 0.0.0.0/0

# Allow HTTP (port 80)
aws ec2 authorize-security-group-ingress \
    --group-name jobslly-sg \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0

# Allow HTTPS (port 443)
aws ec2 authorize-security-group-ingress \
    --group-name jobslly-sg \
    --protocol tcp \
    --port 443 \
    --cidr 0.0.0.0/0

# Allow Backend (port 8001)
aws ec2 authorize-security-group-ingress \
    --group-name jobslly-sg \
    --protocol tcp \
    --port 8001 \
    --cidr 0.0.0.0/0

# Allow Frontend (port 3000)
aws ec2 authorize-security-group-ingress \
    --group-name jobslly-sg \
    --protocol tcp \
    --port 3000 \
    --cidr 0.0.0.0/0
```

#### 1.2 Launch EC2 Instance
```bash
# Launch Ubuntu 22.04 EC2 instance
aws ec2 run-instances \
    --image-id ami-0c55b159cbfafe1f0 \
    --count 1 \
    --instance-type t3.medium \
    --key-name jobslly-key \
    --security-groups jobslly-sg \
    --block-device-mappings 'DeviceName=/dev/sda1,Ebs={VolumeSize=30}' \
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=Jobslly-Server}]'
```

**OR use AWS Console:**
1. Go to AWS Console → EC2 → Launch Instance
2. Choose **Ubuntu Server 22.04 LTS**
3. Instance Type: **t3.medium** (2 vCPU, 4 GB RAM)
4. Configure Security Group (allow ports 22, 80, 443, 3000, 8001)
5. Add Storage: **30 GB**
6. Launch and download key pair

### Step 2: Connect to EC2 Instance

```bash
# Get your instance public IP
aws ec2 describe-instances \
    --filters "Name=tag:Name,Values=Jobslly-Server" \
    --query "Reservations[*].Instances[*].PublicIpAddress" \
    --output text

# SSH into instance
chmod 400 ~/.ssh/jobslly-aws-key.pem
ssh -i ~/.ssh/jobslly-aws-key.pem ubuntu@<YOUR-EC2-PUBLIC-IP>
```

### Step 3: Install Dependencies on EC2

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Yarn
npm install -g yarn

# Install Python 3.11 and pip
sudo apt install -y python3.11 python3.11-venv python3-pip

# Install Nginx (reverse proxy)
sudo apt install -y nginx

# Install Supervisor (process manager)
sudo apt install -y supervisor

# Install Git
sudo apt install -y git

# Install build essentials
sudo apt install -y build-essential

# Verify installations
node --version
yarn --version
python3.11 --version
nginx -v
```

### Step 4: Clone and Setup Application

```bash
# Create application directory
sudo mkdir -p /var/www/jobslly
sudo chown -R ubuntu:ubuntu /var/www/jobslly
cd /var/www/jobslly

# Clone your repository
git clone <your-github-repo-url> .

# OR upload your code using SCP from local machine:
# scp -i ~/.ssh/jobslly-aws-key.pem -r /path/to/local/jobslly ubuntu@<EC2-IP>:/var/www/jobslly
```

### Step 5: Setup Backend

```bash
# Navigate to backend
cd /var/www/jobslly/backend

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file
cat > .env << 'EOF'
MONGO_URL="mongodb+srv://shar1ghdshgsd_db_user:database@cluster0.fslbobp.mongodb.net/?retryWrites=true&w=majority"
DB_NAME="jobslly_database"
JWT_SECRET="your-super-secret-key-change-in-production-$(openssl rand -hex 32)"
EMERGENT_LLM_KEY="your-emergent-llm-key-here"
CORS_ORIGINS="*"
EOF

# Test backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
# Press Ctrl+C after verifying it starts
```

### Step 6: Setup Frontend

```bash
# Navigate to frontend
cd /var/www/jobslly/frontend

# Install dependencies
yarn install

# Create .env file
cat > .env << 'EOF'
REACT_APP_BACKEND_URL=http://<YOUR-EC2-PUBLIC-IP>:8001
WDS_SOCKET_PORT=443
EOF

# Build production version
yarn build

# Test frontend (optional)
yarn start
# Press Ctrl+C after verifying
```

### Step 7: Configure Supervisor

```bash
# Create supervisor config for backend
sudo tee /etc/supervisor/conf.d/jobslly-backend.conf > /dev/null << 'EOF'
[program:jobslly-backend]
command=/var/www/jobslly/backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001
directory=/var/www/jobslly/backend
user=ubuntu
autostart=true
autorestart=true
stderr_logfile=/var/log/supervisor/jobslly-backend.err.log
stdout_logfile=/var/log/supervisor/jobslly-backend.out.log
environment=PYTHONUNBUFFERED=1
EOF

# Create supervisor config for frontend
sudo tee /etc/supervisor/conf.d/jobslly-frontend.conf > /dev/null << 'EOF'
[program:jobslly-frontend]
command=/usr/bin/yarn start
directory=/var/www/jobslly/frontend
user=ubuntu
autostart=true
autorestart=true
stderr_logfile=/var/log/supervisor/jobslly-frontend.err.log
stdout_logfile=/var/log/supervisor/jobslly-frontend.out.log
environment=PORT=3000,BROWSER=none
EOF

# Reload supervisor
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl status

# Check logs
sudo supervisorctl tail -f jobslly-backend stdout
sudo supervisorctl tail -f jobslly-frontend stdout
```

### Step 8: Configure Nginx Reverse Proxy

```bash
# Create Nginx configuration
sudo tee /etc/nginx/sites-available/jobslly > /dev/null << 'EOF'
server {
    listen 80;
    server_name <YOUR-DOMAIN-OR-IP>;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Increase timeouts for backend
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # API docs
    location /docs {
        proxy_pass http://localhost:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF

# Enable the site
sudo ln -s /etc/nginx/sites-available/jobslly /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
sudo systemctl enable nginx

# Check nginx status
sudo systemctl status nginx
```

### Step 9: Update Frontend Environment for Production

```bash
# Update frontend .env with actual domain
cd /var/www/jobslly/frontend

# Edit .env
nano .env
# Change:
# REACT_APP_BACKEND_URL=http://<YOUR-DOMAIN-OR-IP>

# Rebuild frontend
yarn build

# Restart frontend
sudo supervisorctl restart jobslly-frontend
```

### Step 10: Verify Deployment

```bash
# Check all services
sudo supervisorctl status

# Test backend API
curl http://localhost:8001/api/jobs

# Test frontend
curl http://localhost:3000

# Test through Nginx
curl http://<YOUR-EC2-PUBLIC-IP>/api/jobs

# Check logs
sudo supervisorctl tail -f jobslly-backend stderr
sudo supervisorctl tail -f jobslly-frontend stdout
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## Option 2: AWS Elastic Beanstalk

### Quick Deployment with Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli --upgrade --user

# Initialize EB application
cd /path/to/jobslly
eb init -p python-3.11 jobslly-app --region us-east-1

# Create environment
eb create jobslly-prod --instance-type t3.medium

# Deploy application
eb deploy

# Open application
eb open

# View logs
eb logs

# SSH into instance
eb ssh
```

---

## Option 3: AWS ECS with Docker

### Step 1: Create Docker Images

**Backend Dockerfile** (`backend/Dockerfile`):
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8001

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
```

**Frontend Dockerfile** (`frontend/Dockerfile`):
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Step 2: Push to Amazon ECR

```bash
# Create ECR repositories
aws ecr create-repository --repository-name jobslly-backend
aws ecr create-repository --repository-name jobslly-frontend

# Get login credentials
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build and push images
cd backend
docker build -t jobslly-backend .
docker tag jobslly-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/jobslly-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/jobslly-backend:latest

cd ../frontend
docker build -t jobslly-frontend .
docker tag jobslly-frontend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/jobslly-frontend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/jobslly-frontend:latest
```

### Step 3: Create ECS Cluster

```bash
# Create ECS cluster
aws ecs create-cluster --cluster-name jobslly-cluster

# Create task definition and service (use AWS Console or CloudFormation)
```

---

## Post-Deployment Configuration

### 1. Setup Domain Name (Route 53)

```bash
# Create hosted zone
aws route53 create-hosted-zone --name yourdomain.com --caller-reference $(date +%s)

# Create A record pointing to EC2 IP
aws route53 change-resource-record-sets \
    --hosted-zone-id <your-zone-id> \
    --change-batch '{
        "Changes": [{
            "Action": "CREATE",
            "ResourceRecordSet": {
                "Name": "yourdomain.com",
                "Type": "A",
                "TTL": 300,
                "ResourceRecords": [{"Value": "<YOUR-EC2-IP>"}]
            }
        }]
    }'
```

### 2. Setup MongoDB Atlas IP Whitelist

```bash
# Get your EC2 public IP
curl http://checkip.amazonaws.com

# Add this IP to MongoDB Atlas:
# 1. Go to MongoDB Atlas Dashboard
# 2. Network Access → Add IP Address
# 3. Add your EC2 IP or use 0.0.0.0/0 for testing
```

---

## SSL Certificate Setup

### Option A: Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Certbot will automatically configure Nginx
# Certificate auto-renewal is set up automatically

# Test auto-renewal
sudo certbot renew --dry-run
```

### Option B: AWS Certificate Manager

```bash
# Request certificate
aws acm request-certificate \
    --domain-name yourdomain.com \
    --subject-alternative-names www.yourdomain.com \
    --validation-method DNS

# Set up Application Load Balancer with ACM certificate
# (Use AWS Console for easier setup)
```

---

## Monitoring and Maintenance

### Setup CloudWatch Monitoring

```bash
# Install CloudWatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i amazon-cloudwatch-agent.deb

# Configure CloudWatch agent (create config.json)
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
    -a fetch-config \
    -m ec2 \
    -c file:/opt/aws/amazon-cloudwatch-agent/etc/config.json \
    -s
```

### Setup Automated Backups

```bash
# Create backup script
sudo tee /usr/local/bin/backup-jobslly.sh > /dev/null << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/jobslly"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /var/www/jobslly

# Upload to S3 (optional)
aws s3 cp $BACKUP_DIR/app_$DATE.tar.gz s3://your-backup-bucket/

# Keep only last 7 days of backups
find $BACKUP_DIR -name "app_*.tar.gz" -mtime +7 -delete
EOF

chmod +x /usr/local/bin/backup-jobslly.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-jobslly.sh") | crontab -
```

---

## Troubleshooting

### Common Issues

**1. Backend not starting:**
```bash
# Check logs
sudo supervisorctl tail -f jobslly-backend stderr

# Check if port is in use
sudo lsof -i :8001

# Restart service
sudo supervisorctl restart jobslly-backend
```

**2. Frontend not building:**
```bash
# Check Node version
node --version  # Should be 18+

# Clear cache and rebuild
cd /var/www/jobslly/frontend
rm -rf node_modules
rm -rf build
yarn install
yarn build
```

**3. Nginx errors:**
```bash
# Check configuration
sudo nginx -t

# Check logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

**4. MongoDB connection issues:**
```bash
# Test connection
python3 << EOF
from pymongo import MongoClient
client = MongoClient("your-mongo-url")
print(client.list_database_names())
EOF
```

---

## Cost Estimation

### Monthly AWS Costs (Approximate)

| Service | Configuration | Monthly Cost |
|---------|--------------|--------------|
| EC2 (t3.medium) | 2 vCPU, 4GB RAM | $30-40 |
| EBS Storage | 30 GB | $3 |
| Data Transfer | 100 GB | $9 |
| Route 53 | Hosted Zone | $0.50 |
| Load Balancer (optional) | ALB | $16 |
| CloudWatch (optional) | Basic monitoring | $3 |
| **Total (Basic)** | | **~$42-55/month** |
| **Total (With ALB)** | | **~$58-71/month** |

---

## Security Best Practices

1. **Change default credentials**
2. **Enable AWS WAF** for DDoS protection
3. **Use IAM roles** instead of hardcoded credentials
4. **Enable CloudTrail** for audit logging
5. **Regular security updates**: `sudo apt update && sudo apt upgrade`
6. **Use secrets manager** for sensitive data
7. **Enable VPC flow logs**
8. **Regular backups**

---

## Next Steps

1. ✅ Deploy application to EC2
2. ✅ Configure domain and SSL
3. ✅ Setup monitoring and alerts
4. ✅ Configure automated backups
5. ✅ Implement CI/CD pipeline
6. ✅ Load testing and optimization
7. ✅ Setup staging environment

---

## Support

For issues or questions:
- Check logs: `sudo supervisorctl tail -f jobslly-backend stderr`
- AWS Support: https://console.aws.amazon.com/support/
- Application Logs: `/var/log/supervisor/`

---

**🎉 Your Jobslly application is now deployed on AWS!**
