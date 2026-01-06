#!/bin/bash

# ==============================================
# V-ERP Production Deployment Script
# For VM: 34.142.158.126
# Instance: instance-20260105-180659
# ==============================================

set -e

echo "🚀 Starting V-ERP Deployment..."

# Variables
PROJECT_NAME="v-erp"
INSTALL_DIR="/opt/v-erp"
BACKUP_DIR="/opt/v-erp-backup"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Backup existing installation
if [ -d "$INSTALL_DIR" ]; then
    echo -e "${YELLOW}📦 Backing up existing installation...${NC}"
    sudo rm -rf $BACKUP_DIR
    sudo cp -r $INSTALL_DIR $BACKUP_DIR
fi

# 2. Create installation directory
echo "📁 Creating installation directory..."
sudo mkdir -p $INSTALL_DIR
sudo chown $USER:$USER $INSTALL_DIR

# 3. Extract project
echo "📂 Extracting project..."
if [ -f "v-erp.zip" ]; then
    sudo unzip -o v-erp.zip -d $INSTALL_DIR
else
    echo "❌ Error: v-erp.zip not found"
    exit 1
fi

cd $INSTALL_DIR

# 4. Check Docker
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

# 5. Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "🐳 Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# 6. Setup environment
if [ ! -f ".env" ]; then
    echo "⚙️ Setting up environment..."
    cp .env.production .env
    
    # Generate secret
    SECRET=$(openssl rand -base64 32)
    sed -i "s/your-super-secret-key-minimum-32-characters-long/$SECRET/g" .env
    
    echo "⚠️  Please edit .env file and set DB_PASSWORD"
    echo "⚠️  Please edit .env file and set DB_PASSWORD"
    # echo "Press Enter to continue..."
    # read
fi

# 7. Stop old containers
echo "🛑 Stopping old containers..."
sudo docker-compose down || true

# 8. Build and start
# Ensure web-proxy network exists
if ! sudo docker network inspect web-proxy >/dev/null 2>&1; then
    echo "🌐 Creating 'web-proxy' network..."
    sudo docker network create web-proxy
fi

echo "🔨 Building Docker images..."
sudo docker-compose build

echo "▶️  Starting containers..."
sudo docker-compose up -d

# 9. Wait for database
echo "⏳ Waiting for database..."
sleep 10

# 10. Run migrations
echo "🗄️  Running database migrations..."
sudo docker-compose exec -T app npx prisma db push --accept-data-loss --skip-generate
sudo docker-compose exec -T app npm run db:seed

echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo ""
echo "🌐 V-ERP is running at:"
echo "   http://34.142.158.126:3000"
echo "   http://v-erp.itd.in.th (after DNS setup)"
echo ""
echo "📊 View logs:"
echo "   sudo docker-compose logs -f app"
echo ""
echo "🛑 Stop:"
echo "   sudo docker-compose down"
