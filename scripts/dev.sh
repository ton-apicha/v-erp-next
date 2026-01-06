#!/bin/bash

# V-ERP Development Startup Script
# Usage: ./scripts/dev.sh

set -e

echo "🚀 Starting V-ERP Development Environment..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 20+${NC}"
    exit 1
fi

echo -e "${BLUE}📦 Node.js version:${NC} $(node -v)"
echo ""

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker is running${NC}"
echo ""

# Start Docker services
echo -e "${BLUE}🐳 Starting Docker services (postgres, redis, minio)...${NC}"
sudo docker-compose up -d postgres redis minio

echo ""
echo -e "${GREEN}✅ Docker services started${NC}"
echo ""

# Wait for postgres to be ready
echo -e "${BLUE}⏳ Waiting for PostgreSQL to be ready...${NC}"
sleep 5

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    npm install
fi

# Check if Prisma Client is generated
if [ ! -d "node_modules/@prisma/client" ]; then
    echo -e "${BLUE}🔧 Generating Prisma Client...${NC}"
    npx prisma generate
fi

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo -e "${BLUE}🚀 Starting Next.js development server...${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "  ${GREEN}Application will be available at:${NC}"
echo ""
echo -e "  ${BLUE}➜  Local:${NC}   http://localhost:3000"
echo ""
echo -e "  ${GREEN}Login credentials:${NC}"
echo "     📧 admin@v-group.la"
echo "     🔑 admin123"
echo ""
echo "  Press ${RED}Ctrl+C${NC} to stop the server"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start dev server
npm run dev
