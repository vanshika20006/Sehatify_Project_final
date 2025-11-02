# Health Monitoring Wristband App

## Overview
This is a comprehensive health monitoring platform that integrates with a smart wristband to track and analyze vital health parameters. The application provides real-time health insights, AI-powered analysis, doctor consultations, and emergency features.

## Project Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **UI Framework**: Tailwind CSS + Radix UI components
- **State Management**: React Query (@tanstack/react-query)
- **Routing**: Wouter
- **Database**: Neon PostgreSQL (via @neondatabase/serverless)
- **AI Integration**: Google Gemini AI for health analysis
- **Authentication**: Firebase Auth + Passport.js
- **3D Visualization**: Three.js + React Three Fiber

### Project Structure
```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   ├── context/        # React context providers
│   │   ├── lib/           # Utility libraries and configuration
│   │   └── types/         # TypeScript type definitions
├── server/                # Express backend
│   ├── routes/            # API route handlers
│   ├── services/          # Business logic services
│   ├── middleware/        # Express middleware
│   └── validation/        # Request validation schemas
├── shared/                # Shared types and schemas
└── attached_assets/       # 3D models and assets
```

## Core Features

### Health Monitoring
- Real-time vital signs tracking (blood pressure, pulse, oxygen levels)
- Historical health data visualization with charts
- AI-powered health analysis using Gemini
- Predictive health insights and risk assessment

### Medical Services
- Virtual doctor consultations with AI chatbot
- Lab test booking and pathology services
- Medical report upload and analysis
- Doctor appointment scheduling
- Medicine ordering and delivery

### Emergency Features
- SOS emergency alert system
- Automatic emergency contact notification
- Critical health threshold monitoring
- Location-based emergency services

### User Experience
- Multi-language support (i18n)
- Offline capability for core features
- Responsive design for mobile and desktop
- 3D body visualization for health mapping

## Development Setup

### Current Configuration
- **Port**: 5000 (serves both frontend and backend)
- **Host**: 0.0.0.0 (configured for Replit proxy compatibility)
- **Environment**: Development mode with hot module reloading
- **Authentication**: Demo user available (demo@sehatify.com)

### Key Integrations
- **Firebase**: Authentication and real-time data
- **Google Gemini**: AI health analysis and chat responses
- **Neon Database**: PostgreSQL for data persistence
- **Drizzle ORM**: Type-safe database operations

## API Endpoints

### Health & Vitals
- `GET/POST /api/health/vitals` - Vital signs data
- `POST /api/health/analyze` - AI health analysis
- `POST /api/health/predict` - Predictive health insights
- `GET /api/health/wristband-status` - Device status

### Medical Services
- `GET /api/doctors` - Available doctors
- `POST /api/doctors/send-report` - Send report to doctor
- `GET /api/labs` - Available pathology labs
- `POST /api/labs/book` - Book lab tests

### File Management
- `POST /api/uploads` - Upload medical reports
- `GET /api/uploads` - List user reports
- `DELETE /api/uploads/:id` - Delete reports

### Emergency & Chat
- `POST /api/emergency/alert` - Emergency SOS
- `POST /api/chat/doctor` - AI doctor chat

## User Preferences
- Professional healthcare application setup
- Focus on data privacy and HIPAA compliance
- Clean, medical-grade UI/UX design
- Real-time data processing capabilities

## Recent Changes

### November 1, 2025 - Deployment Issues Fixed for Render ✅
- **Issue**: Render deployment was failing with dependency conflicts and build errors
- **Root Causes**:
  1. `@react-three/drei@10.7.6` requires React 19, but project uses React 18.3.1
  2. npm install failing due to peer dependency conflicts
  3. Vite build failing to resolve `react-leaflet` import
- **Solutions Implemented**:
  1. Downgraded `@react-three/drei` from `10.7.6` to `9.114.0` (React 18 compatible)
  2. Downgraded `@react-three/fiber` from `9.4.0` to `8.17.10` (React 18 compatible)
  3. Added `.npmrc` file with `legacy-peer-deps=true` for deployment compatibility
  4. Successfully tested build locally - all tests passing
- **Status**: Project now builds successfully and is ready for Render deployment
- **Note**: These version constraints (React 18 + fiber 8.x + drei 9.x) must be maintained to prevent reintroducing deployment issues

### November 1, 2025 - Gemini AI Integration Fixed ✅
- **Issue**: AI Doctor chat was failing due to incorrect Gemini API implementation
- **Root Cause**: Code was using legacy `@google/generative-ai` API patterns with newer `@google/genai` package
- **Solution**: Updated all Gemini API calls to use correct `ai.models.generateContent()` syntax
- **Model**: Migrated to Gemini 2.0 Flash Exp model for better performance
- **Status**: AI Doctor chat now fully operational with structured responses
- **Features Working**:
  - AI-powered health consultations with diet plans and exercise recommendations
  - Document upload and analysis (PDF, JPEG, PNG)
  - Real-time ESP32 health monitoring integration
  - 3D anatomical visualization for body part focus

### September 20, 2025 - Authentication Issues Fixed
- **Problem**: 401 authentication errors across all API endpoints
- **Solution**: Implemented secure DEV_AUTH_BYPASS flag for development mode
- **Status**: All API endpoints working with 200 status codes

### September 19, 2025 - GitHub Import & Replit Setup ✅
- **Import Status**: Fresh GitHub clone successfully configured and operational
- **Workflow**: "Health App" workflow configured with webview on port 5000
- **Database**: PostgreSQL (Neon) connected with sample data
- **Authentication**: Demo user system operational (demo@sehatify.com / demo123)
- **Architecture**: Unified Express server serving both React frontend and API
- **Deployment**: Autoscale deployment configured with proper build commands

## Development Notes
- The application uses a unified server approach where Express serves both API routes and the Vite-built frontend
- Secure demo authentication available in development via DEV_AUTH_BYPASS=true flag
- Production requires valid Firebase authentication tokens for security
- AI services require proper API keys (Gemini, Firebase)
- Database connection uses Replit PostgreSQL with automatic provisioning
- File uploads are stored locally with database metadata tracking