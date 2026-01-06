#!/bin/bash
set -e

echo "🚀 Setting up Nginx Proxy..."

# Create network if it doesn't exist
docker network create web-proxy || true
echo "✅ Network 'web-proxy' ready."

# Start Proxy
echo "🔄 Starting Nginx Proxy..."
docker-compose up -d

echo "✅ Nginx Proxy is running on ports 80 & 443."
