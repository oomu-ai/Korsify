#!/bin/bash
# GCP Setup Script - Run this first to prepare all GCP resources
set -e

PROJECT_ID="korsify-app"
REGION="us-central1"
SERVICE_NAME="korsify"

echo "🚀 Starting GCP Setup for Korsify Migration..."

# Set project
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "📦 Enabling required GCP APIs..."
gcloud services enable \
  run.googleapis.com \
  sqladmin.googleapis.com \
  storage.googleapis.com \
  secretmanager.googleapis.com \
  cloudbuild.googleapis.com \
  containerregistry.googleapis.com \
  monitoring.googleapis.com \
  logging.googleapis.com

# Create Cloud SQL instance (smallest tier for cost efficiency)
echo "💾 Creating Cloud SQL PostgreSQL instance..."
gcloud sql instances create korsify-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=$REGION \
  --network=default \
  --storage-size=10GB \
  --storage-type=SSD \
  --backup-start-time=03:00 \
  --database-flags=max_connections=100,shared_buffers=256MB

# Create database
echo "📊 Creating database..."
gcloud sql databases create korsify \
  --instance=korsify-db

# Create user
echo "👤 Creating database user..."
gcloud sql users create korsify-user \
  --instance=korsify-db \
  --password=temp-password-change-me

# Create service account for Cloud Run
echo "🔐 Creating service account..."
gcloud iam service-accounts create korsify-sa \
  --display-name="Korsify Service Account"

# Grant permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:korsify-sa@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/cloudsql.client"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:korsify-sa@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

# Create storage bucket for documents
echo "📁 Creating Cloud Storage bucket..."
gsutil mb -p $PROJECT_ID -c standard -l $REGION gs://korsify-documents/
gsutil iam ch allUsers:objectViewer gs://korsify-documents/public/

# Create backup bucket
gsutil mb -p $PROJECT_ID -c nearline -l $REGION gs://korsify-backups/

# Setup Secret Manager secrets (placeholders)
echo "🔑 Setting up Secret Manager..."
echo -n "CHANGE_ME" | gcloud secrets create database-url --data-file=- || true
echo -n "CHANGE_ME" | gcloud secrets create gemini-api-key --data-file=- || true
echo -n "CHANGE_ME" | gcloud secrets create jwt-secret --data-file=- || true
echo -n "CHANGE_ME" | gcloud secrets create google-client-id --data-file=- || true
echo -n "CHANGE_ME" | gcloud secrets create google-client-secret --data-file=- || true

# Grant service account access to secrets
gcloud secrets add-iam-policy-binding database-url \
  --member="serviceAccount:korsify-sa@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding gemini-api-key \
  --member="serviceAccount:korsify-sa@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding jwt-secret \
  --member="serviceAccount:korsify-sa@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

echo "✅ GCP Setup Complete!"
echo ""
echo "⚠️  IMPORTANT NEXT STEPS:"
echo "1. Update secrets in Secret Manager with actual values:"
echo "   - database-url: postgresql://korsify-user:password@/korsify?host=/cloudsql/$PROJECT_ID:$REGION:korsify-db"
echo "   - gemini-api-key: Your Gemini API key"
echo "   - jwt-secret: A secure random string"
echo "2. Run step2-prepare-code.sh to prepare your code"
echo "3. Run step3-database-migration.sh to migrate your database"