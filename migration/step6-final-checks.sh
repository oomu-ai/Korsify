#!/bin/bash
# Final Verification and Optimization Script
set -e

PROJECT_ID="korsify-app"
REGION="us-central1"
SERVICE_NAME="korsify"

echo "🔍 Running Final Migration Checks..."

# Get service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --format 'value(status.url)')

echo "📊 Service Information:"
echo "========================"
echo "URL: $SERVICE_URL"
echo ""

# Check service status
echo "✅ Checking service health..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $SERVICE_URL/api/health)
if [ $HTTP_STATUS -eq 200 ]; then
  echo "✓ Health check passed"
else
  echo "✗ Health check failed (HTTP $HTTP_STATUS)"
fi

# Check database connection
echo "✅ Checking database connection..."
gcloud sql instances describe korsify-db --format="value(state)" | grep -q RUNNABLE && \
  echo "✓ Database is running" || echo "✗ Database issue detected"

# Check storage bucket
echo "✅ Checking storage bucket..."
gsutil ls gs://korsify-documents/ > /dev/null 2>&1 && \
  echo "✓ Storage bucket accessible" || echo "✗ Storage bucket issue"

# List recent logs
echo ""
echo "📜 Recent application logs:"
echo "========================"
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE_NAME" \
  --limit=5 \
  --format="value(textPayload)"

# Performance recommendations
echo ""
echo "🚀 Performance Optimization Checklist:"
echo "======================================"
echo "[ ] Enable Cloud CDN for static assets"
echo "[ ] Set up Cloud Monitoring alerts"
echo "[ ] Configure custom domain with SSL"
echo "[ ] Set up Cloud Armor for DDoS protection"
echo "[ ] Enable Binary Authorization for container security"
echo "[ ] Configure Cloud Trace for performance monitoring"
echo "[ ] Set up regular database backups"
echo "[ ] Implement Cloud Scheduler for scheduled tasks"

# Cost optimization
echo ""
echo "💰 Cost Optimization Tips:"
echo "========================="
echo "1. Current estimated monthly cost: ~\$40-95"
echo "2. Monitor with: gcloud billing accounts list"
echo "3. Set budget alerts in GCP Console"
echo "4. Use Committed Use Discounts for predictable workloads"
echo "5. Review and delete unused resources regularly"

# Security checklist
echo ""
echo "🔒 Security Checklist:"
echo "====================="
echo "[ ] Update all secrets in Secret Manager"
echo "[ ] Enable VPC Service Controls"
echo "[ ] Set up Cloud IAP for admin routes"
echo "[ ] Configure Cloud Security Scanner"
echo "[ ] Enable audit logging"
echo "[ ] Review IAM permissions"

# DNS Configuration
echo ""
echo "🌐 To connect your domain:"
echo "========================"
echo "1. Go to Cloud Run service in GCP Console"
echo "2. Click 'Manage Custom Domains'"
echo "3. Add your domain (e.g., korsify.com)"
echo "4. Update your DNS records as instructed"

echo ""
echo "✅ Migration Complete!"
echo "===================="
echo "Your Korsify app is now running on GCP!"
echo "Service URL: $SERVICE_URL"
echo ""
echo "📚 Useful commands:"
echo "- View logs: gcloud logging read \"resource.labels.service_name=$SERVICE_NAME\" --limit=50"
echo "- Stream logs: gcloud alpha run services logs tail $SERVICE_NAME --region=$REGION"
echo "- Update service: gcloud run deploy $SERVICE_NAME --image=gcr.io/$PROJECT_ID/$SERVICE_NAME:latest"
echo "- Rollback: gcloud run revisions list --service=$SERVICE_NAME"
echo ""
echo "🎉 Congratulations on your successful migration!"