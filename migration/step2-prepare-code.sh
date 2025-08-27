#!/bin/bash
# Code Preparation Script - Modifies code for GCP compatibility
set -e

echo "🔧 Preparing code for GCP deployment..."

# Create production environment file
cat > .env.production << 'EOF'
NODE_ENV=production
PORT=8080
GCP_PROJECT_ID=korsify-app
STORAGE_BUCKET=korsify-documents
EOF

# Create optimized Dockerfile
cat > Dockerfile << 'EOF'
# Multi-stage build for smaller image
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./

# Install all dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/migrations ./migrations

# Install production dependencies only
RUN npm prune --production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/api/health', (r) => {r.statusCode === 200 ? process.exit(0) : process.exit(1)})"

EXPOSE 8080

CMD ["node", "dist/index.js"]
EOF

# Create .dockerignore
cat > .dockerignore << 'EOF'
node_modules
.git
.gitignore
README.md
.env*
.vscode
.idea
coverage
.nyc_output
.DS_Store
*.log
test*
attached_assets
migration
*.sql
backup*
EOF

# Create Cloud Build configuration
cat > cloudbuild.yaml << 'EOF'
steps:
  # Build the container image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/korsify:$COMMIT_SHA', '.']
  
  # Push the container image to Container Registry
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/korsify:$COMMIT_SHA']
  
  # Deploy to Cloud Run
  - name: 'gcr.io/cloud-builders/gcloud'
    args:
      - 'run'
      - 'deploy'
      - 'korsify'
      - '--image=gcr.io/$PROJECT_ID/korsify:$COMMIT_SHA'
      - '--region=us-central1'
      - '--platform=managed'
      - '--allow-unauthenticated'
      - '--service-account=korsify-sa@$PROJECT_ID.iam.gserviceaccount.com'
      - '--add-cloudsql-instances=$PROJECT_ID:us-central1:korsify-db'
      - '--set-secrets=DATABASE_URL=database-url:latest,GEMINI_API_KEY=gemini-api-key:latest,JWT_SECRET=jwt-secret:latest'
      - '--set-env-vars=NODE_ENV=production,GCP_PROJECT_ID=$PROJECT_ID,STORAGE_BUCKET=korsify-documents'
      - '--memory=1Gi'
      - '--cpu=1'
      - '--timeout=300'
      - '--max-instances=10'
      - '--min-instances=0'

images:
  - 'gcr.io/$PROJECT_ID/korsify:$COMMIT_SHA'

timeout: '1200s'
EOF

echo "✅ Code preparation complete!"
echo ""
echo "📝 Created files:"
echo "  - Dockerfile (optimized multi-stage build)"
echo "  - .dockerignore (exclude unnecessary files)"
echo "  - cloudbuild.yaml (CI/CD pipeline)"
echo "  - .env.production (environment config)"
echo ""
echo "Next: Run step3-database-migration.sh"