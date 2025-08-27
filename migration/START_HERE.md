# Korsify GCP Migration Guide - Efficient Path

## Quick Start - 6 Step Migration Process

### Prerequisites
- GCP Project: `korsify-app` (already set up)
- `gcloud` CLI installed and authenticated
- Docker installed locally

## Phase 1: Database Migration (15 minutes)

### Step 1: Export from Neon Database
```bash
# Run from project root
pg_dump $DATABASE_URL > backup.sql
```

### Step 2: Create Cloud SQL Instance
```bash
gcloud sql instances create korsify-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --network=default \
  --no-backup \
  --database-flags=max_connections=100
```

### Step 3: Import Data
```bash
gcloud sql import sql korsify-db gs://korsify-backup/backup.sql \
  --database=korsify
```

## Phase 2: Container Preparation (10 minutes)

### Step 4: Build & Push Docker Image
```bash
# Build optimized container
docker build -t gcr.io/korsify-app/korsify:latest .

# Push to GCR
docker push gcr.io/korsify-app/korsify:latest
```

## Phase 3: Deploy to Cloud Run (5 minutes)

### Step 5: Deploy Application
```bash
gcloud run deploy korsify \
  --image gcr.io/korsify-app/korsify:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --add-cloudsql-instances korsify-app:us-central1:korsify-db \
  --set-env-vars="NODE_ENV=production" \
  --set-secrets="DATABASE_URL=database-url:latest,GEMINI_API_KEY=gemini-api-key:latest" \
  --memory=1Gi \
  --cpu=1 \
  --max-instances=10 \
  --min-instances=0
```

## Phase 4: Storage Setup (5 minutes)

### Step 6: Create Storage Bucket
```bash
gsutil mb -p korsify-app -c standard -l us-central1 gs://korsify-documents/
gsutil iam ch allUsers:objectViewer gs://korsify-documents/public/
```

## Total Migration Time: ~35 minutes

## Environment Variables to Set in Secret Manager

```bash
# Create secrets
echo -n "postgresql://user:pass@/korsify?host=/cloudsql/korsify-app:us-central1:korsify-db" | \
  gcloud secrets create database-url --data-file=-

echo -n "your-gemini-api-key" | \
  gcloud secrets create gemini-api-key --data-file=-

echo -n "your-jwt-secret" | \
  gcloud secrets create jwt-secret --data-file=-
```

## Cost Optimization Tips

1. **Use Cloud Run min-instances=0** - No charges when idle
2. **Start with db-f1-micro** - Upgrade only if needed ($9.37/month)
3. **Enable Cloud CDN** for static assets
4. **Use Spot VMs** if using Compute Engine

## Monitoring Setup

```bash
# Enable APIs
gcloud services enable monitoring.googleapis.com
gcloud services enable logging.googleapis.com

# Create alerts
gcloud alpha monitoring policies create \
  --notification-channels=your-channel-id \
  --display-name="High Error Rate" \
  --condition="rate(logging.googleapis.com/user/korsify-errors[1m]) > 10"
```

## Quick Rollback Plan

If issues occur:
```bash
# Rollback to previous Cloud Run revision
gcloud run revisions list --service=korsify
gcloud run services update-traffic korsify --to-revisions=korsify-00001-abc=100
```

## Next Files to Check:
1. `step1-gcp-setup.sh` - Automated GCP resource creation
2. `step2-prepare-code.sh` - Code modifications for GCP
3. `Dockerfile` - Optimized container configuration
4. `cloudbuild.yaml` - CI/CD pipeline setup