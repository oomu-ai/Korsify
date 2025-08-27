#!/bin/bash
# Backend Deployment Script
set -e

PROJECT_ID="korsify-app"
REGION="us-central1"
SERVICE_NAME="korsify"

echo "🚀 Deploying Backend to Cloud Run..."

# Build and tag the Docker image
echo "🔨 Building Docker image..."
docker build -t gcr.io/$PROJECT_ID/$SERVICE_NAME:latest .

# Configure Docker to use gcloud credentials
echo "🔐 Configuring Docker authentication..."
gcloud auth configure-docker

# Push to Container Registry
echo "📤 Pushing image to Container Registry..."
docker push gcr.io/$PROJECT_ID/$SERVICE_NAME:latest

# Deploy to Cloud Run
echo "☁️  Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME:latest \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --service-account korsify-sa@$PROJECT_ID.iam.gserviceaccount.com \
  --add-cloudsql-instances $PROJECT_ID:$REGION:korsify-db \
  --set-secrets DATABASE_URL=database-url:latest,GEMINI_API_KEY=gemini-api-key:latest,JWT_SECRET=jwt-secret:latest \
  --set-env-vars NODE_ENV=production,GCP_PROJECT_ID=$PROJECT_ID,STORAGE_BUCKET=korsify-documents \
  --memory 1Gi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 10 \
  --min-instances 0 \
  --port 8080

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --format 'value(status.url)')

echo "✅ Backend deployed successfully!"
echo "🌐 Service URL: $SERVICE_URL"

# Test the deployment
echo "🧪 Testing deployment..."
curl -s -o /dev/null -w "Health Check Response: %{http_code}\n" $SERVICE_URL/api/health

# Setup continuous deployment (optional)
echo ""
echo "📝 To enable automatic deployments from GitHub:"
echo "1. Connect your GitHub repository to Cloud Build"
echo "2. Cloud Build will use cloudbuild.yaml for automatic deployments"
echo ""
echo "Run this command to connect GitHub:"
echo "gcloud builds connections create github korsify-github --region=$REGION"
echo ""
echo "Next: Run step5-deploy-frontend.sh"