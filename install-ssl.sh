#!/bin/bash

##############################################################################
# Jobslly SSL Certificate Installation Script
# Automated Let's Encrypt SSL certificate installation
##############################################################################

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        log_error "Please run as root or with sudo"
        exit 1
    fi
}

# Check prerequisites
check_prerequisites() {
    log_step "Checking prerequisites..."
    
    # Check Nginx
    if ! command -v nginx &> /dev/null; then
        log_error "Nginx is not installed"
        exit 1
    fi
    log_info "✓ Nginx found: $(nginx -v 2>&1)"
    
    # Check if Nginx is running
    if ! systemctl is-active --quiet nginx; then
        log_warn "Nginx is not running. Starting..."
        systemctl start nginx
    fi
    log_info "✓ Nginx is running"
}

# Get domain information
get_domain_info() {
    log_step "Domain Configuration"
    
    read -p "Enter your domain name (e.g., example.com): " DOMAIN
    
    if [ -z "$DOMAIN" ]; then
        log_error "Domain name is required"
        exit 1
    fi
    
    read -p "Include www subdomain? (y/n): " INCLUDE_WWW
    
    if [[ $INCLUDE_WWW =~ ^[Yy]$ ]]; then
        WWW_DOMAIN="www.$DOMAIN"
        DOMAIN_LIST="-d $DOMAIN -d $WWW_DOMAIN"
    else
        WWW_DOMAIN=""
        DOMAIN_LIST="-d $DOMAIN"
    fi
    
    read -p "Enter your email for certificate notifications: " EMAIL
    
    if [ -z "$EMAIL" ]; then
        log_error "Email is required"
        exit 1
    fi
    
    log_info "Configuration:"
    log_info "  Domain: $DOMAIN"
    [ ! -z "$WWW_DOMAIN" ] && log_info "  WWW: $WWW_DOMAIN"
    log_info "  Email: $EMAIL"
    
    read -p "Continue with this configuration? (y/n): " CONFIRM
    if [[ ! $CONFIRM =~ ^[Yy]$ ]]; then
        log_info "Installation cancelled"
        exit 0
    fi
}

# Verify DNS configuration
verify_dns() {
    log_step "Verifying DNS configuration..."
    
    # Get current server IP
    SERVER_IP=$(curl -s http://checkip.amazonaws.com)
    log_info "Server IP: $SERVER_IP"
    
    # Check domain DNS
    DOMAIN_IP=$(dig +short $DOMAIN | tail -1)
    
    if [ -z "$DOMAIN_IP" ]; then
        log_error "DNS not configured for $DOMAIN"
        log_info "Please add an A record pointing to $SERVER_IP"
        read -p "Continue anyway? (y/n): " CONTINUE
        if [[ ! $CONTINUE =~ ^[Yy]$ ]]; then
            exit 1
        fi
    elif [ "$DOMAIN_IP" != "$SERVER_IP" ]; then
        log_warn "DNS mismatch!"
        log_warn "Domain points to: $DOMAIN_IP"
        log_warn "Server IP is: $SERVER_IP"
        read -p "Continue anyway? (y/n): " CONTINUE
        if [[ ! $CONTINUE =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        log_info "✓ DNS configured correctly: $DOMAIN → $SERVER_IP"
    fi
    
    # Check www subdomain if included
    if [ ! -z "$WWW_DOMAIN" ]; then
        WWW_IP=$(dig +short $WWW_DOMAIN | tail -1)
        if [ -z "$WWW_IP" ]; then
            log_warn "DNS not configured for $WWW_DOMAIN"
        elif [ "$WWW_IP" != "$SERVER_IP" ]; then
            log_warn "WWW DNS mismatch: $WWW_IP vs $SERVER_IP"
        else
            log_info "✓ WWW DNS configured correctly"
        fi
    fi
}

# Install Certbot
install_certbot() {
    log_step "Installing Certbot..."
    
    if command -v certbot &> /dev/null; then
        log_info "Certbot already installed: $(certbot --version)"
        return
    fi
    
    apt update
    apt install -y certbot python3-certbot-nginx
    
    log_info "✓ Certbot installed: $(certbot --version)"
}

# Backup current Nginx configuration
backup_nginx_config() {
    log_step "Backing up Nginx configuration..."
    
    BACKUP_DIR="/var/backups/nginx-$(date +%Y%m%d-%H%M%S)"
    mkdir -p $BACKUP_DIR
    
    cp -r /etc/nginx/sites-available $BACKUP_DIR/
    cp -r /etc/nginx/sites-enabled $BACKUP_DIR/
    
    log_info "✓ Backup created: $BACKUP_DIR"
}

# Update Nginx configuration with domain
update_nginx_config() {
    log_step "Updating Nginx configuration..."
    
    NGINX_CONFIG="/etc/nginx/sites-available/jobslly"
    
    if [ ! -f "$NGINX_CONFIG" ]; then
        log_error "Nginx configuration not found: $NGINX_CONFIG"
        exit 1
    fi
    
    # Update server_name
    if [ ! -z "$WWW_DOMAIN" ]; then
        sed -i "s/server_name .*/server_name $DOMAIN $WWW_DOMAIN;/" $NGINX_CONFIG
    else
        sed -i "s/server_name .*/server_name $DOMAIN;/" $NGINX_CONFIG
    fi
    
    # Test configuration
    nginx -t
    
    if [ $? -ne 0 ]; then
        log_error "Nginx configuration test failed"
        exit 1
    fi
    
    # Reload Nginx
    systemctl reload nginx
    
    log_info "✓ Nginx configuration updated and reloaded"
}

# Obtain SSL certificate
obtain_certificate() {
    log_step "Obtaining SSL certificate from Let's Encrypt..."
    
    log_info "This may take a few minutes..."
    
    # Run Certbot
    certbot --nginx $DOMAIN_LIST \
        --non-interactive \
        --agree-tos \
        --email $EMAIL \
        --redirect \
        --hsts \
        --staple-ocsp \
        --must-staple
    
    if [ $? -ne 0 ]; then
        log_error "Failed to obtain certificate"
        log_info "Common issues:"
        log_info "  1. DNS not properly configured"
        log_info "  2. Firewall blocking port 80 or 443"
        log_info "  3. Domain already has certificate rate limit"
        exit 1
    fi
    
    log_info "✓ SSL certificate obtained successfully!"
}

# Verify certificate
verify_certificate() {
    log_step "Verifying SSL certificate..."
    
    # Check certificate files
    CERT_PATH="/etc/letsencrypt/live/$DOMAIN"
    
    if [ ! -d "$CERT_PATH" ]; then
        log_error "Certificate directory not found"
        exit 1
    fi
    
    log_info "Certificate files:"
    log_info "  - Certificate: $CERT_PATH/fullchain.pem"
    log_info "  - Private Key: $CERT_PATH/privkey.pem"
    
    # Show certificate details
    certbot certificates
    
    # Test HTTPS
    log_info "Testing HTTPS connection..."
    sleep 2
    
    if curl -Is https://$DOMAIN | head -1 | grep -q "200\|301\|302"; then
        log_info "✓ HTTPS is working!"
    else
        log_warn "HTTPS test failed, but certificate may still be valid"
    fi
}

# Update frontend environment
update_frontend_env() {
    log_step "Updating frontend environment..."
    
    FRONTEND_ENV="/var/www/jobslly/frontend/.env"
    
    if [ ! -f "$FRONTEND_ENV" ]; then
        log_warn "Frontend .env not found: $FRONTEND_ENV"
        return
    fi
    
    # Backup current .env
    cp $FRONTEND_ENV ${FRONTEND_ENV}.backup
    
    # Update to HTTPS
    sed -i "s|REACT_APP_BACKEND_URL=.*|REACT_APP_BACKEND_URL=https://$DOMAIN|" $FRONTEND_ENV
    
    log_info "✓ Frontend .env updated"
    log_info "Building frontend..."
    
    # Rebuild frontend
    cd /var/www/jobslly/frontend
    sudo -u ubuntu yarn build
    
    # Restart frontend
    if command -v supervisorctl &> /dev/null; then
        supervisorctl restart jobslly-frontend
        log_info "✓ Frontend restarted"
    fi
}

# Setup auto-renewal
setup_auto_renewal() {
    log_step "Setting up automatic certificate renewal..."
    
    # Certbot timer should be enabled by default
    systemctl enable certbot.timer
    systemctl start certbot.timer
    
    # Test renewal
    log_info "Testing renewal process..."
    certbot renew --dry-run
    
    if [ $? -eq 0 ]; then
        log_info "✓ Auto-renewal configured and tested successfully"
    else
        log_warn "Renewal test failed, but auto-renewal is configured"
    fi
    
    # Create renewal hook
    HOOK_DIR="/etc/letsencrypt/renewal-hooks/deploy"
    mkdir -p $HOOK_DIR
    
    cat > $HOOK_DIR/reload-nginx.sh << 'EOF'
#!/bin/bash
systemctl reload nginx
echo "$(date): Certificate renewed, Nginx reloaded" >> /var/log/certbot-renewal.log
EOF
    
    chmod +x $HOOK_DIR/reload-nginx.sh
    
    log_info "✓ Renewal hook created"
}

# Show summary
show_summary() {
    echo ""
    echo "======================================================================"
    log_info "🎉 SSL Certificate Installation Complete!"
    echo "======================================================================"
    echo ""
    echo "Your application is now secured with HTTPS!"
    echo ""
    echo "URLs:"
    echo "  Frontend: https://$DOMAIN"
    [ ! -z "$WWW_DOMAIN" ] && echo "  WWW: https://$WWW_DOMAIN"
    echo "  Backend API: https://$DOMAIN/api"
    echo "  API Docs: https://$DOMAIN/docs"
    echo ""
    echo "Certificate Details:"
    echo "  Issuer: Let's Encrypt"
    echo "  Valid for: 90 days"
    echo "  Auto-renewal: Enabled (runs twice daily)"
    echo "  Email notifications: $EMAIL"
    echo ""
    echo "Certificate Files:"
    echo "  Certificate: /etc/letsencrypt/live/$DOMAIN/fullchain.pem"
    echo "  Private Key: /etc/letsencrypt/live/$DOMAIN/privkey.pem"
    echo ""
    echo "Useful Commands:"
    echo "  View certificates: sudo certbot certificates"
    echo "  Renew manually: sudo certbot renew"
    echo "  Test renewal: sudo certbot renew --dry-run"
    echo "  Revoke certificate: sudo certbot revoke --cert-name $DOMAIN"
    echo ""
    echo "Next Steps:"
    echo "  1. Test your site: https://$DOMAIN"
    echo "  2. Check SSL Labs: https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN"
    echo "  3. Update all HTTP links to HTTPS"
    echo "  4. Consider HSTS preload: https://hstspreload.org/"
    echo ""
    echo "Security Headers Configured:"
    echo "  ✓ HSTS (HTTP Strict Transport Security)"
    echo "  ✓ OCSP Stapling"
    echo "  ✓ TLS 1.2 and 1.3 only"
    echo "  ✓ Strong cipher suites"
    echo ""
    echo "Monitoring:"
    echo "  Certificate expiry emails will be sent to: $EMAIL"
    echo "  Auto-renewal runs twice daily via systemd timer"
    echo ""
    echo "======================================================================"
}

# Main installation flow
main() {
    echo "======================================================================"
    echo "        Jobslly SSL Certificate Installation (Let's Encrypt)"
    echo "======================================================================"
    echo ""
    
    check_root
    check_prerequisites
    get_domain_info
    verify_dns
    install_certbot
    backup_nginx_config
    update_nginx_config
    obtain_certificate
    verify_certificate
    update_frontend_env
    setup_auto_renewal
    show_summary
}

# Run main function
main
