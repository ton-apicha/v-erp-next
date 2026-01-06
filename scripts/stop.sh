#!/bin/bash

# V-ERP Services Stop Script
# Usage: ./scripts/stop.sh

set -e

echo "🛑 Stopping V-ERP Services..."
echo ""

# Stop Docker services
echo "🐳 Stopping Docker services..."
sudo docker-compose down

echo ""
echo "✅ All services stopped"
echo ""
echo "Note: To start again, run: ./scripts/dev.sh"
