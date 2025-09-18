# Korsify - AI-Powered Course Creation Platform

Korsify is a comprehensive learning management system that leverages AI to automatically generate courses from documents. It supports both course creators and learners with features like document processing, AI-generated content, quizzes, progress tracking, and analytics.

## 🚀 Features

### For Course Creators
- **AI-Powered Course Generation**: Upload documents (PDF, DOC, DOCX, TXT, MD) and automatically generate structured courses
- **Document Processing**: Intelligent content extraction and analysis using Google Gemini AI
- **Course Templates**: Pre-built templates for quick course creation
- **Rich Text Editor**: Advanced course content editing with TipTap
- **Quiz Generation**: Automatic quiz creation with customizable difficulty and frequency
- **Analytics Dashboard**: Comprehensive insights into course performance and student engagement
- **Multi-format Support**: Support for various document types and file uploads

### For Learners
- **Course Discovery**: Browse and search published courses
- **Progress Tracking**: Detailed progress monitoring with streaks and study time tracking
- **Interactive Quizzes**: Engaging quiz system with multiple attempts
- **Learning Analytics**: Personal learning metrics and achievement tracking
- **Responsive Design**: Mobile-friendly interface for learning anywhere

### Technical Features
- **Modern Tech Stack**: React, TypeScript, Express.js, PostgreSQL
- **AI Integration**: Google Gemini AI for content generation and analysis
- **Authentication**: Multiple OAuth providers (Google, Apple, LinkedIn) + local auth
- **File Storage**: Google Cloud Storage integration
- **Real-time Updates**: WebSocket support for live progress tracking
- **Database**: PostgreSQL with Drizzle ORM
- **Deployment Ready**: Optimized for Google Cloud Platform deployment
- **Secrets Management**: Automatic GCP Secrets Manager integration
- **CORS Support**: Configurable cross-origin resource sharing
- **Health Checks**: Built-in health monitoring endpoints
- **Containerized**: Docker support with multi-stage builds

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Wouter** for routing
- **TanStack Query** for data fetching
- **Tailwind CSS** for styling
- **Radix UI** for components
- **TipTap** for rich text editing
- **Framer Motion** for animations

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **PostgreSQL** with Drizzle ORM
- **Google Gemini AI** for content generation
- **Google Cloud Storage** for file management
- **Passport.js** for authentication
- **Multer** for file uploads

### Infrastructure
- **Google Cloud Platform** (Cloud Run, Cloud SQL, Cloud Storage)
- **Docker** for containerization
- **Drizzle Kit** for database migrations

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Google Cloud Platform account (for deployment)
- Google Gemini API key

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd korsify-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/korsify

# AI Services
GEMINI_API_KEY=your-gemini-api-key

# Authentication
JWT_SECRET=your-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
APPLE_CLIENT_ID=your-apple-client-id
APPLE_CLIENT_SECRET=your-apple-client-secret
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret

# Google Cloud (for production)
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
GCS_BUCKET_NAME=your-bucket-name

# Server
PORT=5000
NODE_ENV=development
```

### 4. Database Setup
```bash
# Run database migrations
npm run db:push
```

### 5. Start Development Server
```bash
# Start the development server
npm run dev
```

The application will be available at `http://localhost:5000`

## 🏗️ Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - TypeScript type checking
- `npm run db:push` - Push database schema changes

### Project Structure
```
korsify-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Route components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and configurations
├── server/                 # Express.js backend
│   ├── services/          # Business logic services
│   ├── routes.ts          # API route definitions
│   └── auth.ts            # Authentication middleware
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Database schema definitions
├── migrations/             # Database migration files
└── migration/              # GCP deployment scripts
```

## 🚀 Deployment to Google Cloud Platform

### Prerequisites for Deployment
- Google Cloud SDK installed and configured
- Docker installed
- GCP project with billing enabled

### Automated Deployment (Recommended)

Use the provided deployment script for a complete setup:

```bash
# Make the script executable
chmod +x deploy-gcp.sh

# Run the deployment script
./deploy-gcp.sh
```

This script will:
- Enable required GCP APIs
- Create Cloud SQL instance and database
- Set up Cloud Storage bucket
- Create secrets in Secret Manager
- Build and deploy to Cloud Run

### Manual Deployment (35 minutes)

#### Step 1: GCP Project Setup
```bash
# Set your project ID
export PROJECT_ID=korsify-app
gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable storage.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

#### Step 2: Database Migration
```bash
# Create Cloud SQL instance
gcloud sql instances create korsify-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --network=default \
  --no-backup \
  --database-flags=max_connections=100

# Create database
gcloud sql databases create korsify --instance=korsify-db
```

#### Step 3: Storage Setup
```bash
# Create storage bucket
gsutil mb -p $PROJECT_ID -c standard -l us-central1 gs://korsify-documents/
gsutil iam ch allUsers:objectViewer gs://korsify-documents/public/
```

#### Step 4: Secrets Management
```bash
# Required secrets
gcloud secrets create database-url --data-file=- <<< "postgresql://user:pass@/korsify?host=/cloudsql/PROJECT_ID:us-central1:korsify-db"
gcloud secrets create gemini-api-key --data-file=- <<< "your-gemini-api-key"
gcloud secrets create jwt-secret --data-file=- <<< "your-jwt-secret"

# Optional OAuth secrets
gcloud secrets create google-client-id --data-file=- <<< "your-google-client-id"
gcloud secrets create google-client-secret --data-file=- <<< "your-google-client-secret"
gcloud secrets create apple-client-id --data-file=- <<< "your-apple-client-id"
gcloud secrets create apple-client-secret --data-file=- <<< "your-apple-client-secret"
gcloud secrets create linkedin-client-id --data-file=- <<< "your-linkedin-client-id"
gcloud secrets create linkedin-client-secret --data-file=- <<< "your-linkedin-client-secret"

# Storage
gcloud secrets create gcs-bucket-name --data-file=- <<< "korsify-documents"
```

#### Step 5: Build and Deploy
```bash
# Build Docker image
docker build -t gcr.io/$PROJECT_ID/korsify:latest .

# Push to Google Container Registry
docker push gcr.io/$PROJECT_ID/korsify:latest

# Deploy to Cloud Run
gcloud run deploy korsify \
  --image gcr.io/$PROJECT_ID/korsify:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --add-cloudsql-instances $PROJECT_ID:us-central1:korsify-db \
  --set-env-vars="NODE_ENV=production" \
  --set-secrets="DATABASE_URL=database-url:latest,GEMINI_API_KEY=gemini-api-key:latest,JWT_SECRET=jwt-secret:latest" \
  --memory=1Gi \
  --cpu=1 \
  --max-instances=10 \
  --min-instances=0
```

### Automated Deployment Scripts

The project includes automated deployment scripts in the `migration/` directory:

1. `step1-gcp-setup.sh` - Sets up GCP resources
2. `step2-prepare-code.sh` - Prepares code for deployment
3. `step3-database-migration.sh` - Handles database migration
4. `step4-deploy-backend.sh` - Deploys backend services
5. `step5-deploy-frontend.sh` - Deploys frontend
6. `step6-final-checks.sh` - Runs final verification

Run these scripts in order for a complete deployment.

### Cost Optimization
- **Cloud Run**: Set `min-instances=0` to avoid charges when idle
- **Cloud SQL**: Start with `db-f1-micro` tier ($9.37/month)
- **Cloud Storage**: Use standard storage class for documents
- **CDN**: Enable Cloud CDN for static assets

## 📚 Usage Guide

### For Course Creators

1. **Sign Up/Login**: Create an account and select "Creator" role
2. **Create Course**: 
   - Upload documents (PDF, DOC, DOCX, TXT, MD)
   - Choose generation options (difficulty, quiz frequency, etc.)
   - Let AI generate course structure and content
3. **Edit Course**: Use the rich text editor to customize content
4. **Publish**: Make your course available to learners
5. **Analytics**: Monitor course performance and student engagement

### For Learners

1. **Browse Courses**: Search and discover published courses
2. **Enroll**: Join courses that interest you
3. **Learn**: Progress through modules and lessons
4. **Take Quizzes**: Test your knowledge with interactive quizzes
5. **Track Progress**: Monitor your learning journey and achievements

## 🔧 Configuration

### AI Generation Options
- **Difficulty Level**: Beginner, Intermediate, Advanced
- **Quiz Frequency**: Per lesson, per module, or none
- **Questions per Quiz**: 3-10 questions
- **Language**: Multiple language support
- **Target Audience**: Customizable for different learner groups

### Authentication Providers
- Google OAuth
- Apple Sign-In
- LinkedIn OAuth
- Local email/password authentication

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Verify `DATABASE_URL` is correct
   - Ensure PostgreSQL is running
   - Check network connectivity

2. **AI Generation Failures**
   - Verify `GEMINI_API_KEY` is valid
   - Check API quota limits
   - Ensure document format is supported

3. **File Upload Issues**
   - Check file size limits (50MB max)
   - Verify supported file types
   - Ensure storage permissions

4. **Authentication Problems**
   - Verify OAuth client credentials
   - Check redirect URLs
   - Ensure JWT secret is set

### Debug Mode
Set `NODE_ENV=development` to enable detailed logging and error messages.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section above
- Review the API documentation in the codebase

## 🔄 Updates

The application includes automatic database migrations and will update the schema as needed when deployed.

---

**Note**: This application requires a Google Gemini API key for AI functionality. Ensure you have proper API access and quota before deploying to production.
