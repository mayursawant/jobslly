# 🔒 SSL Certificate Implementation Guide for AWS

## Complete In-Depth Guide for HTTPS Setup

---

## Table of Contents
1. [Understanding SSL/TLS](#understanding-ssltls)
2. [Prerequisites](#prerequisites)
3. [Method 1: Let's Encrypt (Free & Recommended)](#method-1-lets-encrypt-free--recommended)
4. [Method 2: AWS Certificate Manager (ACM)](#method-2-aws-certificate-manager-acm)
5. [Method 3: Custom SSL Certificate](#method-3-custom-ssl-certificate)
6. [SSL Configuration for Nginx](#ssl-configuration-for-nginx)
7. [Testing SSL Configuration](#testing-ssl-configuration)
8. [Auto-Renewal Setup](#auto-renewal-setup)
9. [Troubleshooting](#troubleshooting)
10. [Security Best Practices](#security-best-practices)

---

## Understanding SSL/TLS

### What is SSL/TLS?

**SSL (Secure Sockets Layer)** and **TLS (Transport Layer Security)** are cryptographic protocols that provide secure communication over a network.

**Why You Need It:**
- ✅ **Encrypts data** between client and server
- ✅ **Builds trust** with users (green padlock)
- ✅ **SEO benefits** - Google ranks HTTPS sites higher
- ✅ **Required for PWA** and modern web features
- ✅ **Prevents man-in-the-middle attacks**
- ✅ **Required for secure APIs**

### How SSL Works:

```
┌──────────┐                              ┌──────────┐
│  Client  │                              │  Server  │
│ (Browser)│                              │ (Nginx)  │
└────┬─────┘                              └────┬─────┘
     │                                         │
     │ 1. Client Hello (supported ciphers)    │
     │────────────────────────────────────────>│
     │                                         │
     │ 2. Server Hello + SSL Certificate      │
     │<────────────────────────────────────────│
     │                                         │
     │ 3. Verify Certificate (CA check)        │
     │                                         │
     │ 4. Generate Session Key                 │
     │────────────────────────────────────────>│
     │                                         │
     │ 5. Encrypted Communication Begins       │
     │<───────────────────────────────────────>│
     │                                         │
```

### Certificate Components:

1. **Public Key**: Shared with everyone (in certificate)
2. **Private Key**: Kept secret on server
3. **Certificate Authority (CA)**: Trusted third party that signs certificate
4. **Common Name (CN)**: Your domain name
5. **Validity Period**: Usually 90 days (Let's Encrypt) or 1 year

---

## Prerequisites

### 1. Domain Name Setup

**You MUST have a domain name pointed to your EC2 instance.**

```bash
# Verify DNS is working
nslookup yourdomain.com
# Should return your EC2 public IP

# Or use dig
dig yourdomain.com +short
# Should show: XX.XX.XX.XX (your EC2 IP)
```

**DNS Records Required:**
```
Type    Name    Value                       TTL
A       @       <YOUR-EC2-PUBLIC-IP>        300
A       www     <YOUR-EC2-PUBLIC-IP>        300
```

### 2. Ports Open in Security Group

Ensure these ports are open in AWS Security Group:
- **Port 80 (HTTP)** - Required for Let's Encrypt validation
- **Port 443 (HTTPS)** - For secure traffic

```bash
# Verify from EC2 instance
sudo netstat -tuln | grep -E ':(80|443)'
```

### 3. Nginx Installed and Running

```bash
# Check Nginx status
sudo systemctl status nginx

# Check Nginx version
nginx -v
```

---

## Method 1: Let's Encrypt (Free & Recommended)

Let's Encrypt is a free, automated, and open Certificate Authority.

### Step 1: Install Certbot

Certbot is the official Let's Encrypt client for obtaining and renewing certificates.

```bash
# Update package list
sudo apt update

# Install Certbot and Nginx plugin
sudo apt install -y certbot python3-certbot-nginx

# Verify installation
certbot --version
# Should show: certbot 2.x.x
```

### Step 2: Prepare Nginx Configuration

Before obtaining certificate, ensure your Nginx is configured with your domain.

```bash
# Edit Nginx configuration
sudo nano /etc/nginx/sites-available/jobslly
```

**Update server_name:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # ... rest of configuration
}
```

**Test and reload:**
```bash
# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Step 3: Obtain SSL Certificate

#### Option A: Automatic Configuration (Recommended)

Certbot will automatically configure Nginx for HTTPS.

```bash
# Obtain certificate and auto-configure Nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

**Interactive Prompts:**
```
1. Email address (for renewal notifications): your@email.com
2. Agree to Terms of Service: Yes (Y)
3. Share email with EFF: No (N) or Yes (Y)
4. Redirect HTTP to HTTPS: Yes (2)
```

#### Option B: Certificate Only (Manual Configuration)

```bash
# Just obtain certificate without Nginx configuration
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com
```

**Certificate Locations:**
```
Certificate: /etc/letsencrypt/live/yourdomain.com/fullchain.pem
Private Key: /etc/letsencrypt/live/yourdomain.com/privkey.pem
Chain: /etc/letsencrypt/live/yourdomain.com/chain.pem
```

### Step 4: Verify Certificate Installation

```bash
# Check certificate details
sudo certbot certificates

# Expected output:
# Found the following certs:
#   Certificate Name: yourdomain.com
#     Domains: yourdomain.com www.yourdomain.com
#     Expiry Date: 2025-XX-XX
#     Certificate Path: /etc/letsencrypt/live/yourdomain.com/fullchain.pem
#     Private Key Path: /etc/letsencrypt/live/yourdomain.com/privkey.pem
```

### Step 5: Update Frontend Environment

```bash
# Update frontend .env
cd /var/www/jobslly/frontend
nano .env
```

**Change to HTTPS:**
```env
REACT_APP_BACKEND_URL=https://yourdomain.com
WDS_SOCKET_PORT=443
```

**Rebuild frontend:**
```bash
yarn build
sudo supervisorctl restart jobslly-frontend
```

### Step 6: Test HTTPS

```bash
# Test HTTPS endpoint
curl -I https://yourdomain.com

# Should return:
# HTTP/2 200
# server: nginx
# ...

# Test HTTP redirect
curl -I http://yourdomain.com
# Should return:
# HTTP/1.1 301 Moved Permanently
# Location: https://yourdomain.com/
```

---

## Method 2: AWS Certificate Manager (ACM)

AWS Certificate Manager provides free SSL certificates for AWS services.

### When to Use ACM:
- ✅ Using Application Load Balancer (ALB)
- ✅ Using CloudFront CDN
- ✅ Want AWS-managed certificates
- ❌ NOT for direct EC2 use (requires ALB/CloudFront)

### Architecture with ALB:

```
┌─────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
│ Route53 │─────>│ ALB      │─────>│ Target   │─────>│ EC2      │
│ (DNS)   │      │ (HTTPS)  │      │ Group    │      │ (HTTP)   │
└─────────┘      └──────────┘      └──────────┘      └──────────┘
                      │
                      │ ACM Certificate
                      │ (*.yourdomain.com)
```

### Step 1: Request Certificate in ACM

```bash
# Using AWS CLI
aws acm request-certificate \
    --domain-name yourdomain.com \
    --subject-alternative-names www.yourdomain.com \
    --validation-method DNS \
    --region us-east-1

# Note the CertificateArn from output
```

**OR via AWS Console:**
1. Go to **AWS Certificate Manager**
2. Click **Request a certificate**
3. Choose **Request a public certificate**
4. Enter domain names:
   - `yourdomain.com`
   - `www.yourdomain.com`
5. Select **DNS validation**
6. Click **Request**

### Step 2: Validate Domain Ownership

AWS will provide CNAME records to add to your DNS.

```bash
# Get validation records
aws acm describe-certificate \
    --certificate-arn arn:aws:acm:us-east-1:xxx:certificate/xxx \
    --region us-east-1
```

**Add CNAME records to your DNS:**
```
Type    Name                            Value
CNAME   _xxx.yourdomain.com             _yyy.acm-validations.aws
```

**Wait for validation (5-30 minutes):**
```bash
# Check status
aws acm describe-certificate \
    --certificate-arn <your-cert-arn> \
    --query 'Certificate.Status' \
    --output text

# Should return: ISSUED
```

### Step 3: Create Application Load Balancer

```bash
# Create ALB
aws elbv2 create-load-balancer \
    --name jobslly-alb \
    --subnets subnet-xxxxx subnet-yyyyy \
    --security-groups sg-xxxxx \
    --scheme internet-facing \
    --type application

# Create target group
aws elbv2 create-target-group \
    --name jobslly-targets \
    --protocol HTTP \
    --port 80 \
    --vpc-id vpc-xxxxx \
    --health-check-path /api/health

# Register EC2 instance
aws elbv2 register-targets \
    --target-group-arn <target-group-arn> \
    --targets Id=<instance-id>

# Create HTTPS listener
aws elbv2 create-listener \
    --load-balancer-arn <alb-arn> \
    --protocol HTTPS \
    --port 443 \
    --certificates CertificateArn=<acm-cert-arn> \
    --default-actions Type=forward,TargetGroupArn=<target-group-arn>

# Create HTTP listener (redirect to HTTPS)
aws elbv2 create-listener \
    --load-balancer-arn <alb-arn> \
    --protocol HTTP \
    --port 80 \
    --default-actions Type=redirect,RedirectConfig='{Protocol=HTTPS,Port=443,StatusCode=HTTP_301}'
```

### Step 4: Update DNS to Point to ALB

```bash
# Get ALB DNS name
aws elbv2 describe-load-balancers \
    --names jobslly-alb \
    --query 'LoadBalancers[0].DNSName' \
    --output text
```

**Create Route 53 Alias:**
```bash
# Create alias record
aws route53 change-resource-record-sets \
    --hosted-zone-id <zone-id> \
    --change-batch '{
        "Changes": [{
            "Action": "UPSERT",
            "ResourceRecordSet": {
                "Name": "yourdomain.com",
                "Type": "A",
                "AliasTarget": {
                    "HostedZoneId": "<alb-hosted-zone-id>",
                    "DNSName": "<alb-dns-name>",
                    "EvaluateTargetHealth": true
                }
            }
        }]
    }'
```

---

## Method 3: Custom SSL Certificate

Use this if you purchased a certificate from a CA (GoDaddy, Namecheap, etc.).

### Step 1: Prepare Certificate Files

You should have received:
- `certificate.crt` - Your domain certificate
- `private.key` - Private key
- `ca_bundle.crt` - CA chain/intermediate certificates

### Step 2: Combine Certificates

```bash
# Create directory for certificates
sudo mkdir -p /etc/nginx/ssl
sudo chmod 700 /etc/nginx/ssl

# Copy your files
sudo cp certificate.crt /etc/nginx/ssl/
sudo cp private.key /etc/nginx/ssl/
sudo cp ca_bundle.crt /etc/nginx/ssl/

# Create full chain (certificate + CA bundle)
sudo cat /etc/nginx/ssl/certificate.crt \
         /etc/nginx/ssl/ca_bundle.crt \
         > /etc/nginx/ssl/fullchain.pem

# Secure private key
sudo chmod 600 /etc/nginx/ssl/private.key
```

### Step 3: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/jobslly
```

**Add SSL configuration** (see next section for complete config).

---

## SSL Configuration for Nginx

### Complete Production-Ready Nginx Configuration

```nginx
# HTTP Server - Redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Let's Encrypt validation
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    # Redirect all HTTP to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS Server - Main Configuration
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL Certificate Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384';
    
    # SSL Session Configuration
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_session_tickets off;
    
    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    ssl_trusted_certificate /etc/letsencrypt/live/yourdomain.com/chain.pem;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # Frontend - React App
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
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        
        # WebSocket support
        proxy_read_timeout 86400;
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
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
    }
    
    # API Documentation
    location /docs {
        proxy_pass http://localhost:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Static files caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Logging
    access_log /var/log/nginx/jobslly-access.log;
    error_log /var/log/nginx/jobslly-error.log;
}
```

### Apply Configuration

```bash
# Test configuration
sudo nginx -t

# Expected output:
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful

# Reload Nginx
sudo systemctl reload nginx

# Check status
sudo systemctl status nginx
```

---

## Testing SSL Configuration

### 1. Basic HTTPS Test

```bash
# Test HTTPS connection
curl -I https://yourdomain.com

# Should return:
# HTTP/2 200
# server: nginx
# strict-transport-security: max-age=31536000

# Test HTTP redirect
curl -I http://yourdomain.com
# Should return:
# HTTP/1.1 301 Moved Permanently
# Location: https://yourdomain.com/
```

### 2. SSL Certificate Details

```bash
# Check certificate details
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com < /dev/null

# View certificate expiry
echo | openssl s_client -connect yourdomain.com:443 -servername yourdomain.com 2>/dev/null | openssl x509 -noout -dates
```

### 3. Test TLS Versions

```bash
# Test TLS 1.2
openssl s_client -connect yourdomain.com:443 -tls1_2 < /dev/null

# Test TLS 1.3
openssl s_client -connect yourdomain.com:443 -tls1_3 < /dev/null

# Should NOT work with TLS 1.0/1.1 (deprecated)
openssl s_client -connect yourdomain.com:443 -tls1 < /dev/null
# Should return: handshake failure
```

### 4. Online SSL Testing Tools

**SSL Labs Test (Comprehensive):**
```
https://www.ssllabs.com/ssltest/analyze.html?d=yourdomain.com
```

**Expected Grade: A or A+**

**Security Headers Test:**
```
https://securityheaders.com/?q=yourdomain.com
```

### 5. Browser Test

1. Open `https://yourdomain.com` in browser
2. Click on padlock icon
3. Check certificate details:
   - ✅ Valid certificate
   - ✅ Issued by Let's Encrypt or your CA
   - ✅ Expires in future
   - ✅ Green padlock visible

### 6. Test from Different Locations

```bash
# Test from external server
curl -I -k https://yourdomain.com

# Check DNS propagation
nslookup yourdomain.com 8.8.8.8
```

---

## Auto-Renewal Setup

### Let's Encrypt Auto-Renewal

Let's Encrypt certificates expire every 90 days. Certbot automatically sets up renewal.

#### 1. Test Renewal Process

```bash
# Dry run (test without actually renewing)
sudo certbot renew --dry-run

# Expected output:
# Congratulations, all simulated renewals succeeded:
#   /etc/letsencrypt/live/yourdomain.com/fullchain.pem (success)
```

#### 2. Check Automatic Renewal Timer

```bash
# Check systemd timer
sudo systemctl status certbot.timer

# Should show: Active: active (waiting)

# View timer details
sudo systemctl list-timers | grep certbot
```

#### 3. Manual Renewal

```bash
# Force renewal (if needed)
sudo certbot renew --force-renewal

# Renew specific domain
sudo certbot renew --cert-name yourdomain.com
```

#### 4. Renewal Hooks

Create scripts to run before/after renewal:

```bash
# Create renewal hook
sudo mkdir -p /etc/letsencrypt/renewal-hooks/deploy

# Create deployment script
sudo tee /etc/letsencrypt/renewal-hooks/deploy/restart-nginx.sh > /dev/null << 'EOF'
#!/bin/bash
# Restart Nginx after certificate renewal
systemctl reload nginx
echo "$(date): Certificate renewed, Nginx reloaded" >> /var/log/certbot-renewal.log
EOF

# Make executable
sudo chmod +x /etc/letsencrypt/renewal-hooks/deploy/restart-nginx.sh
```

#### 5. Monitor Renewal

```bash
# Check renewal logs
sudo tail -f /var/log/letsencrypt/letsencrypt.log

# Check Certbot timer logs
sudo journalctl -u certbot.timer
```

#### 6. Email Notifications

Certbot sends email notifications before expiry:
- 20 days before expiry
- 10 days before expiry  
- 1 day before expiry

**Check email configuration:**
```bash
# View registered email
sudo certbot show_account

# Update email
sudo certbot update_account --email new@email.com
```

---

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: Certificate Not Trusted

**Symptoms:**
```
curl: (60) SSL certificate problem: unable to get local issuer certificate
```

**Solutions:**
```bash
# 1. Check certificate chain
openssl s_client -connect yourdomain.com:443 -showcerts

# 2. Ensure full chain is used
ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
# NOT just cert.pem

# 3. Update CA certificates
sudo update-ca-certificates
```

#### Issue 2: Port 443 Not Accessible

**Symptoms:**
```
curl: (7) Failed to connect to yourdomain.com port 443: Connection refused
```

**Solutions:**
```bash
# 1. Check if Nginx is listening on 443
sudo netstat -tuln | grep :443

# 2. Check AWS Security Group
# Ensure port 443 is open from 0.0.0.0/0

# 3. Check firewall
sudo ufw status
sudo ufw allow 443/tcp

# 4. Check Nginx SSL configuration
sudo nginx -t
```

#### Issue 3: Mixed Content Warnings

**Symptoms:**
Browser shows "Not Secure" or mixed content warnings.

**Solutions:**
```bash
# 1. Update all API calls to use HTTPS
# In frontend code, ensure:
REACT_APP_BACKEND_URL=https://yourdomain.com

# 2. Add this to Nginx
add_header Content-Security-Policy "upgrade-insecure-requests";

# 3. Rebuild frontend
cd /var/www/jobslly/frontend
yarn build
sudo supervisorctl restart jobslly-frontend
```

#### Issue 4: Certificate Renewal Fails

**Symptoms:**
```
Certbot failed to authenticate some domains
```

**Solutions:**
```bash
# 1. Check port 80 is accessible
curl http://yourdomain.com/.well-known/acme-challenge/test

# 2. Ensure webroot is correct
sudo mkdir -p /var/www/certbot
sudo chown -R www-data:www-data /var/www/certbot

# 3. Add to Nginx
location /.well-known/acme-challenge/ {
    root /var/www/certbot;
}

# 4. Reload Nginx
sudo nginx -t && sudo systemctl reload nginx

# 5. Try standalone mode
sudo systemctl stop nginx
sudo certbot renew --standalone
sudo systemctl start nginx
```

#### Issue 5: SSL Handshake Failure

**Symptoms:**
```
SSL23_GET_SERVER_HELLO:tlsv1 alert internal error
```

**Solutions:**
```bash
# 1. Check SSL protocols
ssl_protocols TLSv1.2 TLSv1.3;

# 2. Update OpenSSL
sudo apt update
sudo apt upgrade openssl

# 3. Check cipher compatibility
openssl ciphers -v 'ECDHE+AESGCM'

# 4. Restart Nginx
sudo systemctl restart nginx
```

#### Issue 6: HSTS Errors in Browser

**Symptoms:**
```
NET::ERR_CERT_AUTHORITY_INVALID
Cannot be overridden
```

**Solutions:**
```bash
# 1. Clear HSTS cache in browser
# Chrome: chrome://net-internals/#hsts
# Delete domain security policies

# 2. Temporarily remove HSTS header
# Comment out in Nginx:
# add_header Strict-Transport-Security ...;

# 3. Install proper certificate
# Then re-enable HSTS
```

---

## Security Best Practices

### 1. Strong SSL Configuration

```nginx
# Use only modern protocols
ssl_protocols TLSv1.2 TLSv1.3;

# Strong ciphers only
ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';

# Prefer server ciphers
ssl_prefer_server_ciphers on;
```

### 2. HTTP Strict Transport Security (HSTS)

```nginx
# Force HTTPS for 1 year
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
```

**HSTS Preload:**
After testing, submit to: https://hstspreload.org/

### 3. Certificate Pinning

```nginx
# Public Key Pinning (HPKP) - Optional, advanced
add_header Public-Key-Pins 'pin-sha256="base64+primary=="; pin-sha256="base64+backup=="; max-age=5184000; includeSubDomains';
```

### 4. OCSP Stapling

```nginx
# Reduce TLS handshake time
ssl_stapling on;
ssl_stapling_verify on;
ssl_trusted_certificate /etc/letsencrypt/live/yourdomain.com/chain.pem;
```

### 5. Disable SSL Compression

```nginx
# Prevent CRIME attack
ssl_compression off;
```

### 6. Security Headers

```nginx
# Complete security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" always;
```

### 7. Regular Updates

```bash
# Update Nginx
sudo apt update
sudo apt upgrade nginx

# Update OpenSSL
sudo apt upgrade openssl

# Update Certbot
sudo apt upgrade certbot
```

### 8. Monitor Certificate Expiry

```bash
# Create monitoring script
sudo tee /usr/local/bin/check-ssl-expiry.sh > /dev/null << 'EOF'
#!/bin/bash
DOMAIN="yourdomain.com"
EXPIRY=$(echo | openssl s_client -connect $DOMAIN:443 -servername $DOMAIN 2>/dev/null | openssl x509 -noout -enddate | cut -d= -f2)
EXPIRY_EPOCH=$(date -d "$EXPIRY" +%s)
NOW_EPOCH=$(date +%s)
DAYS_LEFT=$(( ($EXPIRY_EPOCH - $NOW_EPOCH) / 86400 ))

echo "Certificate expires in $DAYS_LEFT days"

if [ $DAYS_LEFT -lt 30 ]; then
    echo "WARNING: Certificate expires soon!"
    # Send alert (email, Slack, etc.)
fi
EOF

# Make executable
sudo chmod +x /usr/local/bin/check-ssl-expiry.sh

# Add to crontab (daily check)
(crontab -l 2>/dev/null; echo "0 9 * * * /usr/local/bin/check-ssl-expiry.sh") | crontab -
```

---

## Quick Reference Commands

### Certificate Management

```bash
# List certificates
sudo certbot certificates

# Renew all certificates
sudo certbot renew

# Renew specific certificate
sudo certbot renew --cert-name yourdomain.com

# Revoke certificate
sudo certbot revoke --cert-path /etc/letsencrypt/live/yourdomain.com/cert.pem

# Delete certificate
sudo certbot delete --cert-name yourdomain.com
```

### Testing Commands

```bash
# Test HTTPS
curl -I https://yourdomain.com

# Test certificate
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com

# Check expiry
echo | openssl s_client -connect yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates

# Test SSL Labs
https://www.ssllabs.com/ssltest/analyze.html?d=yourdomain.com
```

### Nginx Commands

```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# View SSL logs
sudo tail -f /var/log/nginx/access.log
```

---

## Summary Checklist

### SSL Implementation Checklist

- [ ] Domain DNS configured and propagated
- [ ] Ports 80 and 443 open in AWS Security Group
- [ ] Nginx installed and running
- [ ] Certbot installed
- [ ] SSL certificate obtained
- [ ] Nginx configured with SSL
- [ ] HTTP to HTTPS redirect working
- [ ] Frontend .env updated to HTTPS
- [ ] Frontend rebuilt and restarted
- [ ] HTTPS working in browser
- [ ] Green padlock visible
- [ ] SSL Labs test passed (Grade A)
- [ ] Auto-renewal configured
- [ ] Renewal tested with dry-run
- [ ] Security headers configured
- [ ] Mixed content resolved
- [ ] Certificate monitoring setup

---

## Cost

**Let's Encrypt:**
- ✅ **FREE Forever**
- ✅ Auto-renewal
- ✅ Unlimited certificates
- ✅ Wildcard certificates supported

**ACM (with ALB):**
- ✅ Certificate: **FREE**
- 💰 ALB: ~$16/month
- 💰 Data processing: ~$0.008/GB

**Commercial SSL:**
- 💰 $10-300/year depending on type
- Basic DV: $10-50/year
- OV: $50-150/year
- EV: $150-300/year

---

## Next Steps

1. ✅ Implement SSL certificate
2. ✅ Test HTTPS thoroughly
3. ✅ Update all references to use HTTPS
4. ✅ Monitor certificate expiry
5. ✅ Run SSL Labs test monthly
6. ✅ Consider HSTS preload
7. ✅ Setup monitoring alerts

---

**🔒 Your application is now secure with HTTPS!**

Test your SSL: https://www.ssllabs.com/ssltest/analyze.html?d=yourdomain.com
