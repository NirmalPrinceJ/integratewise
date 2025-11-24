#!/bin/bash

# n8n AI Collaboration Workflow - Deployment Script
# Usage: ./n8n-deploy.sh [environment]

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
ENVIRONMENT=${1:-production}
N8N_VERSION="latest"
DOMAIN="ai-collab.integratewise.com"
EMAIL="admin@integratewise.com"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  n8n AI Collaboration Deployment${NC}"
echo -e "${BLUE}  Environment: $ENVIRONMENT${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Function to check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}Checking prerequisites...${NC}"
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}Docker is not installed${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Docker installed${NC}"
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}Docker Compose is not installed${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Docker Compose installed${NC}"
    
    # Check if ports are available
    if lsof -Pi :5678 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${RED}Port 5678 is already in use${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Port 5678 available${NC}"
}

# Function to create environment file
create_env_file() {
    echo -e "${YELLOW}Creating environment configuration...${NC}"
    
    # Generate secure keys
    N8N_ENCRYPTION_KEY=$(openssl rand -hex 32)
    N8N_PASSWORD=$(openssl rand -base64 20)
    POSTGRES_PASSWORD=$(openssl rand -base64 20)
    
    cat > .env << EOF
# n8n Configuration
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}
N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}
N8N_HOST=${DOMAIN}
N8N_PORT=5678
N8N_PROTOCOL=https
NODE_ENV=${ENVIRONMENT}
WEBHOOK_URL=https://${DOMAIN}/

# Database
DB_TYPE=postgresdb
DB_POSTGRESDB_DATABASE=n8n
DB_POSTGRESDB_HOST=postgres
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_USER=n8n
DB_POSTGRESDB_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Execution
EXECUTIONS_PROCESS=main
EXECUTIONS_TIMEOUT=300
EXECUTIONS_TIMEOUT_MAX=3600

# AI API Keys (to be filled)
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
GEMINI_API_KEY=your_gemini_key_here
PERPLEXITY_API_KEY=your_perplexity_key_here

# Coda Configuration
CODA_API_TOKEN=your_coda_token_here
CODA_DOC_ID=your_doc_id_here

# Slack
SLACK_WEBHOOK_URL=your_slack_webhook_here

# MongoDB
MONGODB_URI=mongodb://localhost:27017/ai_collaboration
EOF

    echo -e "${GREEN}✓ Environment file created${NC}"
    echo -e "${YELLOW}  Admin Password: ${N8N_PASSWORD}${NC}"
    echo -e "${YELLOW}  Please update API keys in .env file${NC}"
}

# Function to create Docker Compose file
create_docker_compose() {
    echo -e "${YELLOW}Creating Docker Compose configuration...${NC}"
    
    cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n-ai-collaboration
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=${N8N_BASIC_AUTH_ACTIVE}
      - N8N_BASIC_AUTH_USER=${N8N_BASIC_AUTH_USER}
      - N8N_BASIC_AUTH_PASSWORD=${N8N_BASIC_AUTH_PASSWORD}
      - N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}
      - N8N_HOST=${N8N_HOST}
      - N8N_PORT=${N8N_PORT}
      - N8N_PROTOCOL=${N8N_PROTOCOL}
      - NODE_ENV=${NODE_ENV}
      - WEBHOOK_URL=${WEBHOOK_URL}
      - DB_TYPE=${DB_TYPE}
      - DB_POSTGRESDB_DATABASE=${DB_POSTGRESDB_DATABASE}
      - DB_POSTGRESDB_HOST=${DB_POSTGRESDB_HOST}
      - DB_POSTGRESDB_PORT=${DB_POSTGRESDB_PORT}
      - DB_POSTGRESDB_USER=${DB_POSTGRESDB_USER}
      - DB_POSTGRESDB_PASSWORD=${DB_POSTGRESDB_PASSWORD}
      - EXECUTIONS_PROCESS=${EXECUTIONS_PROCESS}
      - EXECUTIONS_TIMEOUT=${EXECUTIONS_TIMEOUT}
      - EXECUTIONS_TIMEOUT_MAX=${EXECUTIONS_TIMEOUT_MAX}
    volumes:
      - n8n_data:/home/node/.n8n
      - ./backups:/backups
      - ./custom-nodes:/home/node/.n8n/custom
    depends_on:
      - postgres
      - redis
    networks:
      - n8n-network
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:5678/healthz"]
      interval: 30s
      timeout: 10s
      retries: 3

  postgres:
    image: postgres:15-alpine
    container_name: n8n-postgres
    restart: always
    environment:
      - POSTGRES_USER=${DB_POSTGRESDB_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${DB_POSTGRESDB_DATABASE}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-db.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - n8n-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U n8n"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: n8n-redis
    restart: always
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    networks:
      - n8n-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  nginx:
    image: nginx:alpine
    container_name: n8n-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - n8n
    networks:
      - n8n-network

  backup:
    image: postgres:15-alpine
    container_name: n8n-backup
    environment:
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - ./backups:/backups
      - ./backup.sh:/backup.sh:ro
    entrypoint: ["/bin/sh", "-c", "while true; do /backup.sh; sleep 86400; done"]
    depends_on:
      - postgres
    networks:
      - n8n-network

volumes:
  n8n_data:
    driver: local
  postgres_data:
    driver: local
  redis_data:
    driver: local

networks:
  n8n-network:
    driver: bridge
EOF

    echo -e "${GREEN}✓ Docker Compose file created${NC}"
}

# Function to create nginx configuration
create_nginx_config() {
    echo -e "${YELLOW}Creating Nginx configuration...${NC}"
    
    cat > nginx.conf << EOF
events {
    worker_connections 1024;
}

http {
    upstream n8n {
        server n8n:5678;
    }

    server {
        listen 80;
        server_name ${DOMAIN};
        return 301 https://\$server_name\$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name ${DOMAIN};

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        location / {
            proxy_pass http://n8n;
            proxy_set_header Connection '';
            proxy_http_version 1.1;
            chunked_transfer_encoding off;
            proxy_buffering off;
            proxy_cache off;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }

        location /webhook/ {
            proxy_pass http://n8n;
            proxy_set_header Connection '';
            proxy_http_version 1.1;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
    }
}
EOF

    echo -e "${GREEN}✓ Nginx configuration created${NC}"
}

# Function to create backup script
create_backup_script() {
    echo -e "${YELLOW}Creating backup script...${NC}"
    
    cat > backup.sh << 'EOF'
#!/bin/sh
# Automated backup script for n8n

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

echo "Starting backup at $(date)"

# Backup PostgreSQL
PGPASSWORD=$POSTGRES_PASSWORD pg_dump \
    -h postgres \
    -U n8n \
    -d n8n \
    -f "${BACKUP_DIR}/n8n_db_${DATE}.sql"

# Keep only last 7 days of backups
find ${BACKUP_DIR} -name "n8n_db_*.sql" -mtime +7 -delete

echo "Backup completed at $(date)"
EOF

    chmod +x backup.sh
    echo -e "${GREEN}✓ Backup script created${NC}"
}

# Function to import workflow
import_workflow() {
    echo -e "${YELLOW}Preparing workflow for import...${NC}"
    
    # Wait for n8n to be ready
    echo "Waiting for n8n to be ready..."
    sleep 30
    
    echo -e "${GREEN}✓ Workflow file ready for import${NC}"
    echo -e "${YELLOW}  Import manually through n8n UI:${NC}"
    echo -e "${YELLOW}  1. Navigate to http://localhost:5678${NC}"
    echo -e "${YELLOW}  2. Go to Workflows → Import${NC}"
    echo -e "${YELLOW}  3. Upload n8n-ai-collaboration-workflow.json${NC}"
}

# Function to setup SSL
setup_ssl() {
    echo -e "${YELLOW}Setting up SSL certificates...${NC}"
    
    mkdir -p ssl
    
    if [ "$ENVIRONMENT" = "production" ]; then
        # Use Let's Encrypt for production
        echo -e "${YELLOW}For production, set up Let's Encrypt:${NC}"
        echo -e "${YELLOW}  1. Install certbot${NC}"
        echo -e "${YELLOW}  2. Run: certbot certonly --standalone -d ${DOMAIN}${NC}"
        echo -e "${YELLOW}  3. Copy certificates to ./ssl/${NC}"
    else
        # Generate self-signed certificate for development
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout ssl/key.pem \
            -out ssl/cert.pem \
            -subj "/C=US/ST=State/L=City/O=IntegrateWise/CN=${DOMAIN}"
        echo -e "${GREEN}✓ Self-signed SSL certificate created${NC}"
    fi
}

# Function to start services
start_services() {
    echo -e "${YELLOW}Starting services...${NC}"
    
    docker-compose up -d
    
    echo -e "${GREEN}✓ Services started${NC}"
    
    # Show status
    docker-compose ps
}

# Function to show completion message
show_completion() {
    echo -e "\n${GREEN}========================================${NC}"
    echo -e "${GREEN}  Deployment Complete!${NC}"
    echo -e "${GREEN}========================================${NC}\n"
    
    echo -e "${BLUE}Access n8n:${NC}"
    echo -e "  URL: http://localhost:5678"
    echo -e "  Username: admin"
    echo -e "  Password: Check .env file"
    
    echo -e "\n${BLUE}Next Steps:${NC}"
    echo -e "  1. Update API keys in .env file"
    echo -e "  2. Restart services: docker-compose restart"
    echo -e "  3. Import workflow through n8n UI"
    echo -e "  4. Configure credentials in n8n"
    echo -e "  5. Test the workflow"
    
    echo -e "\n${BLUE}Useful Commands:${NC}"
    echo -e "  View logs: docker-compose logs -f"
    echo -e "  Stop services: docker-compose down"
    echo -e "  Backup database: docker exec n8n-backup /backup.sh"
    echo -e "  Update n8n: docker-compose pull && docker-compose up -d"
}

# Main deployment flow
main() {
    check_prerequisites
    create_env_file
    create_docker_compose
    create_nginx_config
    create_backup_script
    setup_ssl
    start_services
    import_workflow
    show_completion
}

# Run main function
main

# Save deployment info
cat > deployment-info.txt << EOF
n8n AI Collaboration Deployment
================================
Date: $(date)
Environment: ${ENVIRONMENT}
Domain: ${DOMAIN}
n8n Version: ${N8N_VERSION}
Admin Username: admin
Admin Password: See .env file

Services:
- n8n: http://localhost:5678
- PostgreSQL: localhost:5432
- Redis: localhost:6379

Backup Location: ./backups/
Logs: docker-compose logs -f
EOF

echo -e "\n${GREEN}Deployment information saved to deployment-info.txt${NC}"
