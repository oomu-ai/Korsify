#!/bin/bash

# GCP Deployment Script for Korsify
# This script sets up all necessary GCP resources and deploys the application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID=${PROJECT_ID:-"korsify-app"}
REGION=${REGION:-"us-central1"}
SERVICE_NAME="korsify"
DB_INSTANCE_NAME="korsify-db"
BUCKET_NAME="korsify-documents"

echo -e "${GREEN}🚀 Starting GCP deployment for Korsify${NC}"
echo -e "${YELLOW}Project ID: ${PROJECT_ID}${NC}"
echo -e "${YELLOW}Region: ${REGION}${NC}"

# Check if gcloud is installed and authenticated
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Set the project
echo -e "${YELLOW}📋 Setting project to ${PROJECT_ID}${NC}"
gcloud config set project $PROJECT_ID

# Enable required APIs
echo -e "${YELLOW}🔧 Enabling required APIs${NC}"
gcloud services enable run.googleapis.com \
    sqladmin.googleapis.com \
    storage.googleapis.com \
    secretmanager.googleapis.com \
    cloudbuild.googleapis.com \
    containerregistry.googleapis.com

# Create Cloud SQL instance if it doesn't exist
echo -e "${YELLOW}🗄️ Setting up Cloud SQL instance${NC}"
if ! gcloud sql instances describe $DB_INSTANCE_NAME --quiet 2>/dev/null; then
    gcloud sql instances create $DB_INSTANCE_NAME \
        --database-version=POSTGRES_15 \
        --tier=db-f1-micro \
        --region=$REGION \
        --network=default \
        --no-backup \
        --database-flags=max_connections=100
    
    # Create database
    gcloud sql databases create korsify --instance=$DB_INSTANCE_NAME
else
    echo -e "${GREEN}✅ Cloud SQL instance already exists${NC}"
fi

# Create storage bucket if it doesn't exist
echo -e "${YELLOW}📦 Setting up Cloud Storage bucket${NC}"
if ! gsutil ls gs://$BUCKET_NAME/ 2>/dev/null; then
    gsutil mb -p $PROJECT_ID -c standard -l $REGION gs://$BUCKET_NAME/
    gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME/public/
else
    echo -e "${GREEN}✅ Storage bucket already exists${NC}"
fi

# Function to create secret if it doesn't exist
create_secret_if_not_exists() {
    local secret_name=$1
    local secret_value=$2
    
    if ! gcloud secrets describe $secret_name --quiet 2>/dev/null; then
        echo -n "$secret_value" | gcloud secrets create $secret_name --data-file=-
        echo -e "${GREEN}✅ Created secret: $secret_name${NC}"
    else
        echo -e "${YELLOW}⚠️ Secret $secret_name already exists${NC}"
    fi
}

# Create secrets (you'll need to provide actual values)
echo -e "${YELLOW}🔐 Setting up secrets${NC}"
echo -e "${RED}⚠️ You need to provide actual values for these secrets:${NC}"

# Database URL
DB_URL="postgresql://korsify:password@/korsify?host=/cloudsql/$PROJECT_ID:$REGION:$DB_INSTANCE_NAME"
create_secret_if_not_exists "database-url" "$DB_URL"

# Prompt for other secrets
echo -e "${YELLOW}Enter your Gemini API key:${NC}"
read -s GEMINI_API_KEY
create_secret_if_not_exists "gemini-api-key" "$GEMINI_API_KEY"

echo -e "${YELLOW}Enter your JWT secret (or press Enter for auto-generated):${NC}"
read -s JWT_SECRET
if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET=$(openssl rand -base64 32)
fi
create_secret_if_not_exists "jwt-secret" "$JWT_SECRET"

# Optional OAuth secrets
echo -e "${YELLOW}Enter your Google Client ID (optional):${NC}"
read GOOGLE_CLIENT_ID
if [ ! -z "$GOOGLE_CLIENT_ID" ]; then
    create_secret_if_not_exists "google-client-id" "$GOOGLE_CLIENT_ID"
    
    echo -e "${YELLOW}Enter your Google Client Secret:${NC}"
    read -s GOOGLE_CLIENT_SECRET
    create_secret_if_not_exists "google-client-secret" "$GOOGLE_CLIENT_SECRET"
fi

# GCS Bucket name
create_secret_if_not_exists "gcs-bucket-name" "$BUCKET_NAME"

# Build and deploy
echo -e "${YELLOW}🏗️ Building and deploying application${NC}"

# Build Docker image
docker build -t gcr.io/$PROJECT_ID/$SERVICE_NAME:latest .

# Push to Container Registry
docker push gcr.io/$PROJECT_ID/$SERVICE_NAME:latest

# Deploy to Cloud Run
gcloud run deploy $SERVICE_NAME \
    --image gcr.io/$PROJECT_ID/$SERVICE_NAME:latest \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --add-cloudsql-instances $PROJECT_ID:$REGION:$DB_INSTANCE_NAME \
    --set-env-vars="NODE_ENV=production,GOOGLE_CLOUD_PROJECT=$PROJECT_ID" \
    --set-secrets="DATABASE_URL=database-url:latest,GEMINI_API_KEY=gemini-api-key:latest,JWT_SECRET=jwt-secret:latest,GCS_BUCKET_NAME=gcs-bucket-name:latest" \
    --memory=1Gi \
    --cpu=1 \
    --max-instances=10 \
    --min-instances=0 \
    --port=5000

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)')

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Service URL: $SERVICE_URL${NC}"
echo -e "${YELLOW}📝 Next steps:${NC}"
echo -e "1. Update your OAuth redirect URLs to include: $SERVICE_URL"
echo -e "2. Test the health endpoint: $SERVICE_URL/api/health"
echo -e "3. Access your application at: $SERVICE_URL"
