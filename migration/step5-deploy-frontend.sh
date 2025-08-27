#!/bin/bash
# Frontend Deployment Script (if separating frontend)
set -e

PROJECT_ID="korsify-app"
REGION="us-central1"
BUCKET_NAME="korsify-frontend"

echo "🎨 Deploying Frontend..."

# Note: Since your app serves both frontend and backend from the same server,
# this step is OPTIONAL. Use this only if you want to serve static files separately.

echo "📝 Your current setup serves frontend through the Express server."
echo "This is already handled by the Cloud Run deployment."
echo ""
echo "If you want to optimize with CDN (recommended for production):"
echo ""
echo "Option 1: Use Cloud CDN with Cloud Run"
echo "========================================="
echo "gcloud compute backend-services create korsify-backend \\"
echo "  --load-balancing-scheme=EXTERNAL \\"
echo "  --global"
echo ""
echo "gcloud compute backend-services add-backend korsify-backend \\"
echo "  --global \\"
echo "  --network-endpoint-group-region=$REGION \\"
echo "  --network-endpoint-group=korsify-neg"
echo ""
echo "Option 2: Separate Static Hosting (Cloud Storage + CDN)"
echo "========================================="
echo "# Build frontend separately"
echo "npm run build"
echo ""
echo "# Create frontend bucket"
echo "gsutil mb -p $PROJECT_ID gs://$BUCKET_NAME"
echo ""
echo "# Upload built files"
echo "gsutil -m rsync -r dist/public gs://$BUCKET_NAME"
echo ""
echo "# Make bucket public"
echo "gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME"
echo ""
echo "# Enable CDN"
echo "gcloud compute backend-buckets create korsify-frontend-backend \\"
echo "  --gcs-bucket-name=$BUCKET_NAME"
echo ""
echo "✅ Frontend deployment notes completed!"
echo "Next: Run step6-final-checks.sh"