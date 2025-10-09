#!/bin/bash

##############################################################################
# Jobslly AWS Deployment Script
# This script automates the deployment of Jobslly to AWS EC2
##############################################################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running on EC2 instance
check_environment() {
    log_info "Checking environment..."
    
    if [ ! -f /etc/os-release ]; then
        log_error "Cannot detect OS. This script is for Ubuntu/Debian systems."
        exit 1
    fi
    
    . /etc/os-release
    if [[ "$ID" != "ubuntu" && "$ID" != "debian" ]]; then
        log_warn "This script is optimized for Ubuntu. Your OS: $ID"
    fi
    
    log_info "OS detected: $PRETTY_NAME"
}

# Update system
update_system() {
    log_info "Updating system packages..."
    sudo apt update
    sudo apt upgrade -y
}

# Install Node.js and Yarn
install_nodejs() {
    log_info "Installing Node.js 18..."
    
    if command -v node &> /dev/null; then
        log_info "Node.js already installed: $(node --version)"
    else
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt install -y nodejs
        log_info "Node.js installed: $(node --version)"
    fi
    
    if command -v yarn &> /dev/null; then
        log_info "Yarn already installed: $(yarn --version)"
    else
        sudo npm install -g yarn
        log_info "Yarn installed: $(yarn --version)"
    fi
}

# Install Python
install_python() {
    log_info "Installing Python 3.11..."
    
    if command -v python3.11 &> /dev/null; then
        log_info "Python 3.11 already installed: $(python3.11 --version)"
    else
        sudo apt install -y python3.11 python3.11-venv python3-pip
        log_info "Python 3.11 installed: $(python3.11 --version)"
    fi
}

# Install Nginx
install_nginx() {
    log_info "Installing Nginx..."
    
    if command -v nginx &> /dev/null; then
        log_info "Nginx already installed: $(nginx -v 2>&1)"
    else
        sudo apt install -y nginx
        sudo systemctl enable nginx
        log_info "Nginx installed and enabled"
    fi
}

# Install Supervisor
install_supervisor() {
    log_info "Installing Supervisor..."
    
    if command -v supervisorctl &> /dev/null; then
        log_info "Supervisor already installed"
    else
        sudo apt install -y supervisor
        sudo systemctl enable supervisor
        log_info "Supervisor installed and enabled"
    fi
}

# Install build essentials
install_build_tools() {
    log_info "Installing build essentials..."
    sudo apt install -y build-essential git curl wget
}

# Setup application directory
setup_app_directory() {
    log_info "Setting up application directory..."
    
    APP_DIR="/var/www/jobslly"
    
    if [ -d "$APP_DIR" ]; then
        log_warn "Application directory already exists: $APP_DIR"
        read -p "Do you want to remove it and start fresh? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            sudo rm -rf "$APP_DIR"
            log_info "Removed existing directory"
        else
            log_info "Using existing directory"
            return
        fi
    fi
    
    sudo mkdir -p "$APP_DIR"
    sudo chown -R $USER:$USER "$APP_DIR"
    log_info "Application directory created: $APP_DIR"
}

# Setup backend
setup_backend() {
    log_info "Setting up backend..."
    
    cd /var/www/jobslly/backend
    
    # Create virtual environment
    if [ ! -d "venv" ]; then
        log_info "Creating Python virtual environment..."
        python3.11 -m venv venv
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Install dependencies
    log_info "Installing Python dependencies..."
    pip install --upgrade pip
    pip install -r requirements.txt
    
    # Create .env if not exists
    if [ ! -f ".env" ]; then
        log_info "Creating backend .env file..."
        cat > .env << 'EOF'
MONGO_URL="mongodb://localhost:27017"
DB_NAME="jobslly_database"
JWT_SECRET="change-this-secret-$(openssl rand -hex 32)"
EMERGENT_LLM_KEY="your-emergent-llm-key-here"
CORS_ORIGINS="*"
EOF
        log_warn "Please update .env file with your actual credentials"
    fi
    
    deactivate
    log_info "Backend setup complete"
}

# Setup frontend
setup_frontend() {
    log_info "Setting up frontend..."
    
    cd /var/www/jobslly/frontend
    
    # Install dependencies
    log_info "Installing Node.js dependencies..."
    yarn install
    
    # Create .env if not exists
    if [ ! -f ".env" ]; then
        log_info "Creating frontend .env file..."
        
        # Get EC2 public IP
        PUBLIC_IP=$(curl -s http://checkip.amazonaws.com || echo "localhost")
        
        cat > .env << EOF
REACT_APP_BACKEND_URL=http://${PUBLIC_IP}:8001
WDS_SOCKET_PORT=443
EOF
        log_warn "Frontend configured with backend URL: http://${PUBLIC_IP}:8001"
    fi
    
    # Build production version
    log_info "Building production frontend..."
    yarn build
    
    log_info "Frontend setup complete"
}

# Configure Supervisor
configure_supervisor() {
    log_info "Configuring Supervisor..."
    
    # Backend supervisor config
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
    
    # Frontend supervisor config
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
    
    log_info "Supervisor configured"
}

# Configure Nginx
configure_nginx() {
    log_info "Configuring Nginx..."
    
    PUBLIC_IP=$(curl -s http://checkip.amazonaws.com || echo "localhost")
    
    sudo tee /etc/nginx/sites-available/jobslly > /dev/null << EOF
server {
    listen 80;
    server_name ${PUBLIC_IP} _;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # API docs
    location /docs {
        proxy_pass http://localhost:8001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF
    
    # Enable site
    sudo ln -sf /etc/nginx/sites-available/jobslly /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test and restart nginx
    sudo nginx -t
    sudo systemctl restart nginx
    
    log_info "Nginx configured and restarted"
}

# Start services
start_services() {
    log_info "Starting services..."
    
    sudo supervisorctl restart jobslly-backend
    sudo supervisorctl restart jobslly-frontend
    
    sleep 5
    
    sudo supervisorctl status
    
    log_info "Services started"
}

# Show deployment info
show_deployment_info() {
    PUBLIC_IP=$(curl -s http://checkip.amazonaws.com || echo "localhost")
    
    echo ""
    echo "======================================================================"
    log_info "🎉 Deployment Complete!"
    echo "======================================================================"
    echo ""
    echo "Application URLs:"
    echo "  Frontend: http://${PUBLIC_IP}"
    echo "  Backend API: http://${PUBLIC_IP}/api"
    echo "  API Docs: http://${PUBLIC_IP}/docs"
    echo ""
    echo "Useful Commands:"
    echo "  Check status: sudo supervisorctl status"
    echo "  Restart backend: sudo supervisorctl restart jobslly-backend"
    echo "  Restart frontend: sudo supervisorctl restart jobslly-frontend"
    echo "  View backend logs: sudo supervisorctl tail -f jobslly-backend stderr"
    echo "  View frontend logs: sudo supervisorctl tail -f jobslly-frontend stdout"
    echo "  Nginx logs: sudo tail -f /var/log/nginx/access.log"
    echo ""
    echo "Next Steps:"
    echo "  1. Update backend/.env with MongoDB credentials"
    echo "  2. Configure domain name in Nginx config"
    echo "  3. Setup SSL certificate with Let's Encrypt"
    echo "  4. Configure MongoDB Atlas IP whitelist"
    echo ""
    echo "======================================================================"
}

# Main deployment flow
main() {
    echo "======================================================================"
    echo "           Jobslly AWS Deployment Automation"
    echo "======================================================================"
    echo ""
    
    read -p "This will install and configure Jobslly. Continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Deployment cancelled"
        exit 0
    fi
    
    check_environment
    update_system
    install_build_tools
    install_nodejs
    install_python
    install_nginx
    install_supervisor
    
    # Check if code already exists
    if [ ! -d "/var/www/jobslly/backend" ]; then
        log_error "Application code not found in /var/www/jobslly"
        log_info "Please copy your code to /var/www/jobslly first"
        log_info "Example: scp -r /local/jobslly/* user@server:/var/www/jobslly/"
        exit 1
    fi
    
    setup_backend
    setup_frontend
    configure_supervisor
    configure_nginx
    start_services
    show_deployment_info
}

# Run main function
main
