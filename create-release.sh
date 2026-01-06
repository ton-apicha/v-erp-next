#!/bin/bash

# ==============================================
# Create Release Package for V-ERP
# ==============================================

echo "📦 Creating V-ERP release package..."

# Clean up old package
rm -f v-erp.zip

# Create zip (exclude node_modules, .next, etc.)
zip -r v-erp.zip . \
  -x "node_modules/*" \
  -x ".next/*" \
  -x ".git/*" \
  -x "*.log" \
  -x ".env.local" \
  -x "dist/*" \
  -x "build/*"

echo "✅ Package created: v-erp.zip"
echo ""
echo "🚀 Deployment Instructions:"
echo ""
echo "1. Upload to server (using gcloud):"
echo "   gcloud compute scp v-erp.zip deploy.sh instance-20260105-180659:~ --zone=asia-southeast1-b"
echo ""
echo "2. SSH to server:"
echo "   gcloud compute ssh instance-20260105-180659 --zone=asia-southeast1-b"
echo ""
echo "3. Run deployment:"
echo "   chmod +x deploy.sh"
echo "   ./deploy.sh"
echo ""
