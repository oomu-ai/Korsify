#!/bin/bash
# Database Migration Script
set -e

echo "🗄️  Starting Database Migration to Cloud SQL..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL environment variable not set"
  echo "Please set your current Neon database URL:"
  echo "export DATABASE_URL='your-neon-database-url'"
  exit 1
fi

PROJECT_ID="korsify-app"
REGION="us-central1"
INSTANCE_NAME="korsify-db"
DB_NAME="korsify"
BACKUP_FILE="korsify-backup-$(date +%Y%m%d-%H%M%S).sql"

echo "📦 Dumping current database..."
pg_dump $DATABASE_URL \
  --no-owner \
  --no-privileges \
  --no-tablespaces \
  --no-unlogged-table-data \
  --quote-all-identifiers \
  --schema=public \
  > $BACKUP_FILE

echo "📊 Database backup created: $BACKUP_FILE"
echo "Size: $(du -h $BACKUP_FILE | cut -f1)"

# Upload to Cloud Storage
echo "☁️  Uploading backup to Cloud Storage..."
gsutil cp $BACKUP_FILE gs://korsify-backups/

# Get Cloud SQL instance connection info
echo "🔍 Getting Cloud SQL connection details..."
INSTANCE_IP=$(gcloud sql instances describe $INSTANCE_NAME \
  --format="value(ipAddresses[0].ipAddress)")

# Import the backup to Cloud SQL
echo "📥 Importing data to Cloud SQL..."
gcloud sql import sql $INSTANCE_NAME \
  gs://korsify-backups/$BACKUP_FILE \
  --database=$DB_NAME \
  --quiet

echo "✅ Database migration complete!"

# Verify migration
echo "🔍 Verifying migration..."
cat > verify.sql << 'EOF'
SELECT 
  'Tables' as type, 
  COUNT(*) as count 
FROM information_schema.tables 
WHERE table_schema = 'public'
UNION ALL
SELECT 
  'Users' as type, 
  COUNT(*) as count 
FROM users
UNION ALL
SELECT 
  'Courses' as type, 
  COUNT(*) as count 
FROM courses
UNION ALL
SELECT 
  'Documents' as type, 
  COUNT(*) as count 
FROM documents;
EOF

# You'll need to run this manually with Cloud SQL proxy or from Cloud Shell
echo ""
echo "📝 To verify migration, connect to Cloud SQL and check:"
echo "  - Table count"
echo "  - User records"
echo "  - Course records"
echo "  - Document records"
echo ""
echo "Connection string for your app:"
echo "postgresql://korsify-user:YOUR_PASSWORD@/$DB_NAME?host=/cloudsql/$PROJECT_ID:$REGION:$INSTANCE_NAME"
echo ""
echo "⚠️  Remember to update the database-url secret in Secret Manager!"
echo ""
echo "Next: Run step4-deploy-backend.sh"

# Keep backup locally for safety
echo "💾 Local backup kept at: $BACKUP_FILE"