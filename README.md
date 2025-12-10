# 💰 Wallet Service with Paystack, JWT & API Keys

> **HNG Backend Stage 8 Task** - A production-ready wallet service implementing deposits via Paystack, wallet-to-wallet transfers, Google OAuth authentication, and API key management.

## 🚀 Live Deployment

**Production URL**: https://wallet-service-ibraheem-fkbafua4hpadgyf8.uksouth-01.azurewebsites.net

**API Documentation (Swagger)**: https://wallet-service-ibraheem-fkbafua4hpadgyf8.uksouth-01.azurewebsites.net/api

**Platform**: Microsoft Azure (UK South Region)
**Status**: ✅ Live and Running
**CI/CD**: GitHub Actions (Auto-deploy on push to main)

---

## 📋 Table of Contents

- [Live Deployment](#-live-deployment)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Production Architecture](#-production-architecture)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Environment Configuration](#-environment-configuration)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Testing the Live API](#-testing-the-live-api)
- [Complete Testing Guide](#-complete-testing-guide)
- [Database Schema](#-database-schema)
- [Security Features](#-security-features)
- [Deployment Details](#-deployment-details)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Features

### Authentication
- ✅ Google OAuth 2.0 sign-in
- ✅ JWT token generation and validation
- ✅ Dual authentication (JWT or API Key)

### API Key Management
- ✅ Create API keys with specific permissions (`deposit`, `transfer`, `read`)
- ✅ Configurable expiry (days-based)
- ✅ Maximum 5 active keys per user
- ✅ Rollover expired keys with same permissions
- ✅ Automatic expiry validation

### Wallet Operations
- ✅ Auto-generate unique wallet numbers (WLT + 10 digits)
- ✅ Deposit funds via Paystack
- ✅ **Mandatory webhook implementation** for crediting wallets
- ✅ Wallet-to-wallet transfers
- ✅ Transaction history
- ✅ Balance inquiry

### Security & Reliability
- ✅ Paystack webhook signature verification
- ✅ Idempotent transaction processing
- ✅ Atomic transfers (database transactions)
- ✅ Permission-based access control
- ✅ API key hashing with bcrypt
- ✅ SSL/TLS encryption (Azure PostgreSQL)

---

## 🛠 Technology Stack

| Category | Technology |
|----------|-----------|
| **Framework** | NestJS 10.x |
| **Language** | TypeScript 5.x (Strict Mode) |
| **Database** | PostgreSQL 17.7 (Azure Flexible Server) |
| **ORM** | TypeORM |
| **Authentication** | Passport (Google OAuth, JWT) |
| **Payment** | Paystack API |
| **Validation** | class-validator, class-transformer |
| **Documentation** | Swagger/OpenAPI 3.0 |
| **Hosting** | Azure App Service (Linux, Node 18 LTS) |
| **CI/CD** | GitHub Actions |

---

## 🏗 Production Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USERS/CLIENTS                        │
│                 (Browser, Mobile, Postman)                  │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS
                     ↓
┌─────────────────────────────────────────────────────────────┐
│              Azure App Service (UK South)                   │
│  wallet-service-ibraheem-fkbafua4hpadgyf8.uksouth-01...    │
│                                                             │
│  ┌───────────────────────────────────────────────────┐     │
│  │         NestJS Application (Node 18 LTS)          │     │
│  │  - Authentication (Google OAuth + JWT)            │     │
│  │  - API Key Management                             │     │
│  │  - Wallet Operations                              │     │
│  │  - Paystack Integration                           │     │
│  └───────────────────────────────────────────────────┘     │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ↓                         ↓
┌──────────────────┐    ┌──────────────────────┐
│ Azure PostgreSQL │    │   Paystack API       │
│ Flexible Server  │    │   (Payment Gateway)  │
│                  │    │                      │
│ - walletdb       │    │ - Deposit Init       │
│ - SSL Enabled    │    │ - Webhook Events     │
│ - uuid-ossp ext  │    │ - Signature Verify   │
└──────────────────┘    └──────────────────────┘
        ↑
        │
┌───────┴─────────────┐
│  GitHub Repository  │
│  (Auto-deployment)  │
│                     │
│  Push to main →     │
│  GitHub Actions →   │
│  Deploy to Azure    │
└─────────────────────┘
```

---

## 📁 Project Structure

```
src/
├── entities/                 # Database entities
│   ├── user.entity.ts       # User with Google OAuth
│   ├── wallet.entity.ts     # Wallet with unique number
│   ├── transaction.entity.ts # Deposits & Transfers
│   └── api-key.entity.ts    # Hashed API keys
│
├── auth/                     # Authentication module
│   ├── strategies/
│   │   ├── google.strategy.ts
│   │   └── jwt.strategy.ts
│   ├── guards/
│   │   ├── google-auth.guard.ts
│   │   └── jwt-auth.guard.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
│
├── api-keys/                 # API Key management
│   ├── dto/
│   │   ├── create-api-key.dto.ts
│   │   └── rollover-api-key.dto.ts
│   ├── guards/
│   │   ├── api-key.guard.ts
│   │   ├── jwt-or-api-key.guard.ts
│   │   └── permissions.guard.ts
│   ├── decorators/
│   │   └── permissions.decorator.ts
│   ├── api-keys.controller.ts
│   ├── api-keys.service.ts
│   └── api-keys.module.ts
│
├── wallet/                   # Wallet operations
│   ├── dto/
│   │   ├── deposit.dto.ts
│   │   └── transfer.dto.ts
│   ├── wallet.controller.ts
│   ├── wallet.service.ts
│   ├── paystack.service.ts
│   └── wallet.module.ts
│
├── config/
│   └── configuration.ts
│
├── app.module.ts            # SSL config for Azure PostgreSQL
└── main.ts
```

---

## ✅ Prerequisites

Before running this application, ensure you have:

1. **Node.js** (v18 or higher)
   ```bash
   node --version
   ```

2. **PostgreSQL** (v14 or higher)
   ```bash
   psql --version
   ```

3. **npm** or **yarn**
   ```bash
   npm --version
   ```

4. **Google OAuth Credentials** (configured)
5. **Paystack Account** (test keys configured)

---

## 📥 Installation & Setup

### Step 1: Clone Repository

```bash
git clone https://github.com/ibraheembello/Wallet-Service.git
cd Wallet-Service
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Create Environment File

```bash
# Copy the example environment file
cp .env.example .env
```

### Step 4: Configure Environment Variables

Open `.env` and update with your values:

```env
# Application
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=wallet_service
DB_SYNCHRONIZE=true
DB_LOGGING=true
DB_SSL=false  # Set to true for Azure PostgreSQL

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-characters
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Paystack
PAYSTACK_SECRET_KEY=sk_test_your_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key
PAYSTACK_BASE_URL=https://api.paystack.co
```

### Step 5: Setup PostgreSQL Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE wallet_service;

# Enable UUID extension
\c wallet_service
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

# Exit PostgreSQL
\q
```

---

## 🚀 Running the Application

### Development Mode (with hot reload)

```bash
npm run start:dev
```

### Production Build

```bash
# Build the application
npm run build

# Run production server
npm run start:prod
```

### Run Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Expected Output

```
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🚀 Wallet Service API is running!                       ║
║                                                            ║
║   📍 Server URL:        http://localhost:3000              ║
║   📚 API Documentation: http://localhost:3000/api          ║
║   🔐 Authentication:    Google OAuth + JWT + API Keys      ║
║   💳 Payment Provider:  Paystack                           ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

---

## 📚 API Documentation

### Production Swagger UI

Visit the live API documentation:

**URL**: https://wallet-service-ibraheem-fkbafua4hpadgyf8.uksouth-01.azurewebsites.net/api

This provides an interactive API documentation where you can:
- ✅ View all endpoints with descriptions
- ✅ Test API calls directly in your browser
- ✅ See request/response schemas
- ✅ Authenticate with JWT or API Key
- ✅ Download OpenAPI specification

### API Endpoints Overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| **Authentication** |
| GET | `/auth/google` | None | Initiate Google OAuth |
| GET | `/auth/google/callback` | None | OAuth callback, returns JWT |
| **API Keys** |
| POST | `/keys/create` | JWT | Create new API key |
| POST | `/keys/rollover` | JWT | Rollover expired key |
| **Wallet** |
| POST | `/wallet/deposit` | JWT/API Key | Initialize Paystack deposit |
| POST | `/wallet/paystack/webhook` | Paystack Signature | Webhook handler (internal) |
| POST | `/wallet/paystack/webhook/test` | None | Test webhook (dev only) |
| GET | `/wallet/deposit/:ref/status` | JWT/API Key | Check deposit status |
| GET | `/wallet/balance` | JWT/API Key | Get wallet balance |
| POST | `/wallet/transfer` | JWT/API Key | Transfer to another wallet |
| GET | `/wallet/transactions` | JWT/API Key | View transaction history |

---

## 🧪 Testing the Live API

### Quick Start (5 minutes)

#### Step 1: Sign In with Google

Open your browser and navigate to:
```
https://wallet-service-ibraheem-fkbafua4hpadgyf8.uksouth-01.azurewebsites.net/auth/google
```

You'll receive a JSON response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "your-email@gmail.com",
    "name": "Your Name",
    "walletNumber": "WLT1234567890"
  }
}
```

**IMPORTANT**: Copy the `access_token` and `walletNumber`

#### Step 2: Test with Swagger UI

1. Go to: https://wallet-service-ibraheem-fkbafua4hpadgyf8.uksouth-01.azurewebsites.net/api
2. Click the "Authorize" button (top right)
3. Paste your token: `Bearer YOUR_TOKEN_HERE`
4. Click "Authorize"
5. Now you can test all protected endpoints!

#### Step 3: Check Your Balance

1. Find the `GET /wallet/balance` endpoint
2. Click "Try it out"
3. Click "Execute"
4. You should see:
```json
{
  "balance": 0
}
```

#### Step 4: Make a Deposit

1. Find the `POST /wallet/deposit` endpoint
2. Click "Try it out"
3. Enter request body:
```json
{
  "amount": 5000
}
```
4. Click "Execute"
5. Copy the `authorization_url` and open it in a new tab
6. Use Paystack test card:
   - **Card**: 4084 0840 8408 4081
   - **Expiry**: 12/25
   - **CVV**: 408
   - **PIN**: 0000
   - **OTP**: 123456

#### Step 5: Verify Balance Updated

After completing the payment, check your balance again - it should now show 5000!

---

## 📖 Complete Testing Guide

For a comprehensive step-by-step testing guide covering all endpoints, see:

**[API_TESTING_GUIDE.md](./API_TESTING_GUIDE.md)**

This guide includes:
- ✅ Authentication flow
- ✅ API key creation and management
- ✅ Wallet operations (deposit, transfer, balance)
- ✅ Testing scenarios for complete coverage
- ✅ Error handling examples
- ✅ Troubleshooting common issues

---

## 🗄 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  google_id VARCHAR UNIQUE NOT NULL,
  picture VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Wallets Table
```sql
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id),
  wallet_number VARCHAR(13) UNIQUE NOT NULL,
  balance DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Transactions Table
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id UUID REFERENCES wallets(id),
  type VARCHAR NOT NULL, -- 'deposit' | 'transfer'
  amount DECIMAL(15,2) NOT NULL,
  status VARCHAR NOT NULL, -- 'pending' | 'success' | 'failed'
  reference VARCHAR UNIQUE,
  metadata JSONB,
  recipient_wallet_number VARCHAR(13),
  sender_wallet_number VARCHAR(13),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### API Keys Table
```sql
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  name VARCHAR NOT NULL,
  key_hash VARCHAR UNIQUE NOT NULL,
  permissions TEXT[],
  expires_at TIMESTAMP NOT NULL,
  is_revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔒 Security Features

### 1. Authentication & Authorization
- ✅ Google OAuth 2.0 with verified credentials
- ✅ JWT with secure secret (256-bit) and 7-day expiration
- ✅ API keys hashed with bcrypt (never stored in plain text)
- ✅ Permission-based access control (read, deposit, transfer)
- ✅ Automatic API key expiry validation

### 2. Payment Security
- ✅ Paystack webhook signature verification (HMAC-SHA512)
- ✅ Idempotent transaction processing (prevents double-crediting)
- ✅ Reference uniqueness enforcement
- ✅ Test webhook disabled in production

### 3. Data Security
- ✅ SSL/TLS encryption for PostgreSQL (Azure)
- ✅ HTTPS-only in production
- ✅ Environment variable encryption
- ✅ Sensitive data not logged

### 4. Transaction Safety
- ✅ Atomic database transactions for transfers
- ✅ Balance validation before transfers
- ✅ Unique transaction references
- ✅ Optimistic locking on balance updates

### 5. Input Validation
- ✅ class-validator on all DTOs
- ✅ Whitelist and forbid non-whitelisted properties
- ✅ Type transformation and sanitization
- ✅ SQL injection prevention (TypeORM parameterization)

---

## 🚢 Deployment Details

### Production Environment

**Platform**: Microsoft Azure
**Region**: UK South
**Resource Group**: wallet-service-rg

#### App Service
- **Name**: wallet-service-ibraheem
- **URL**: https://wallet-service-ibraheem-fkbafua4hpadgyf8.uksouth-01.azurewebsites.net
- **Runtime**: Node 18 LTS (Linux)
- **Plan**: Basic B1 (1 vCPU, 1.75 GB RAM)
- **Auto-scaling**: Enabled

#### Database
- **Type**: Azure Database for PostgreSQL Flexible Server
- **Server**: wallet-db-yourname.postgres.database.azure.com
- **Database**: walletdb
- **Version**: PostgreSQL 17.7
- **SSL**: Required
- **Extensions**: uuid-ossp enabled

#### CI/CD Pipeline
- **Source**: GitHub (ibraheembello/Wallet-Service)
- **Workflow**: GitHub Actions
- **Trigger**: Push to main branch
- **Process**:
  1. Checkout code
  2. Setup Node.js 18
  3. Install dependencies
  4. Build application
  5. Deploy to Azure App Service
  6. Restart service

### Environment Variables (Production)

```env
NODE_ENV=production
PORT=8080
DB_SSL=true
DB_SYNCHRONIZE=true  # Change to false after initial deployment
DB_LOGGING=false
FRONTEND_URL=https://wallet-service-ibraheem-fkbafua4hpadgyf8.uksouth-01.azurewebsites.net
GOOGLE_CALLBACK_URL=https://wallet-service-ibraheem-fkbafua4hpadgyf8.uksouth-01.azurewebsites.net/auth/google/callback
```

### Deployment Steps (For Reference)

1. **Created Azure Resources**:
   - Resource Group
   - PostgreSQL Flexible Server
   - App Service (Linux, Node 18)

2. **Configured Database**:
   - Enabled SSL
   - Allowed Azure services access
   - Created database `walletdb`
   - Enabled uuid-ossp extension

3. **Set Environment Variables** in App Service

4. **Configured GitHub Deployment**:
   - Connected GitHub repository
   - Set up GitHub Actions workflow
   - Configured automatic deployment

5. **Deployed Application**:
   - Pushed code to GitHub
   - GitHub Actions built and deployed
   - Application restarted

6. **Verified Deployment**:
   - Tested health endpoint
   - Verified database connection
   - Tested OAuth flow
   - Tested API endpoints

### Updating Google OAuth

In Google Cloud Console, ensure these redirect URIs are authorized:

```
https://wallet-service-ibraheem-fkbafua4hpadgyf8.uksouth-01.azurewebsites.net/auth/google/callback
```

### Configuring Paystack Webhook

In Paystack Dashboard → Settings → Webhooks:

```
https://wallet-service-ibraheem-fkbafua4hpadgyf8.uksouth-01.azurewebsites.net/wallet/paystack/webhook
```

---

## 🐛 Troubleshooting

### Issue 1: "Application Error" on Azure

**Symptoms**: Browser shows "Application Error"

**Solutions**:
1. Check App Service logs in Azure Portal
2. Verify all environment variables are set
3. Ensure database connection string is correct
4. Check if SSL is enabled (`DB_SSL=true`)
5. Restart the App Service

### Issue 2: Database Connection Failed

**Symptoms**: "no pg_hba.conf entry for host" error

**Solutions**:
1. Ensure SSL is enabled in app.module.ts:
```typescript
ssl: configService.get('DB_SSL') === 'true' ? {
  rejectUnauthorized: false
} : false
```
2. Verify PostgreSQL allows Azure services
3. Check database credentials in environment variables

### Issue 3: UUID Generation Error

**Symptoms**: "function uuid_generate_v4() does not exist"

**Solutions**:
1. Connect to PostgreSQL via Azure Cloud Shell
2. Run: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
3. Restart App Service

### Issue 4: Google OAuth Fails

**Symptoms**: OAuth callback returns error

**Solutions**:
1. Verify `GOOGLE_CALLBACK_URL` matches production URL
2. Check Google Cloud Console has production URL in authorized redirects
3. Ensure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct

### Issue 5: Paystack Webhook Not Received

**Symptoms**: Deposits remain pending

**Solutions**:
1. Verify webhook URL in Paystack Dashboard
2. Check webhook signature verification is working
3. Review App Service logs for webhook errors
4. Test webhook using Paystack's webhook testing tool

### Viewing Logs

**Azure Portal**:
1. Go to App Service → wallet-service-ibraheem
2. Click "Log stream" or "Deployment Center → Logs"

**GitHub Actions**:
1. Go to repository → Actions tab
2. Click on latest workflow run
3. View deployment logs

---

## 📊 Monitoring

### Application Insights

Azure Application Insights is enabled for:
- Request tracking
- Error monitoring
- Performance metrics
- Dependency tracking

**Access**: Azure Portal → Application Insights → wallet-service-ibraheem

### Health Check

Monitor application health:
```
GET https://wallet-service-ibraheem-fkbafua4hpadgyf8.uksouth-01.azurewebsites.net
```

Should return API information.

---

## 🔄 Continuous Deployment

Every push to the `main` branch automatically:
1. Triggers GitHub Actions workflow
2. Builds the application
3. Runs tests (if configured)
4. Deploys to Azure App Service
5. Restarts the service

**View Deployment Status**:
- GitHub: Repository → Actions tab
- Azure: App Service → Deployment Center

---

## 📞 Support & Contact

### Resources
- **Live API**: https://wallet-service-ibraheem-fkbafua4hpadgyf8.uksouth-01.azurewebsites.net/api
- **GitHub Repository**: https://github.com/ibraheembello/Wallet-Service
- **Testing Guide**: [API_TESTING_GUIDE.md](./API_TESTING_GUIDE.md)

### For Issues
1. Check this README's troubleshooting section
2. Review Swagger documentation
3. Check Azure App Service logs
4. Verify environment variables
5. Review GitHub Actions logs

---

## 📄 License

MIT License - HNG Internship Stage 8 Project

---

## ✅ Requirements Checklist

### Authentication & Authorization
- [x] Google OAuth 2.0 authentication
- [x] JWT token generation with 7-day expiry
- [x] API key creation with custom permissions
- [x] API key expiry (configurable days)
- [x] Maximum 5 active keys per user
- [x] API key rollover functionality
- [x] Dual authentication (JWT + API Key)

### Wallet Features
- [x] Automatic wallet creation on user registration
- [x] Unique wallet numbers (WLT + 10 digits)
- [x] Balance inquiry endpoint
- [x] Transaction history endpoint

### Payment Integration
- [x] Paystack deposit initialization
- [x] **Mandatory webhook implementation**
- [x] Webhook signature verification
- [x] Idempotent transaction processing
- [x] Deposit status checking

### Transfers
- [x] Wallet-to-wallet transfers
- [x] Atomic transfer operations
- [x] Balance validation
- [x] Recipient validation

### Security
- [x] Permission-based access control
- [x] API key hashing (bcrypt)
- [x] Input validation (class-validator)
- [x] SQL injection prevention
- [x] SSL/TLS encryption
- [x] HTTPS in production

### Documentation
- [x] Swagger/OpenAPI documentation
- [x] Comprehensive README
- [x] API testing guide
- [x] Environment configuration guide

### Deployment
- [x] Production deployment on Azure
- [x] PostgreSQL database setup
- [x] SSL configuration
- [x] Environment variables configured
- [x] CI/CD with GitHub Actions
- [x] Health monitoring

### Testing
- [x] Unit tests for services
- [x] Integration tests
- [x] All 14 tests passing
- [x] ESLint configured and passing
- [x] TypeScript strict mode enabled

---

## 🎉 Quick Links

| Resource | URL |
|----------|-----|
| **Live API** | https://wallet-service-ibraheem-fkbafua4hpadgyf8.uksouth-01.azurewebsites.net |
| **Swagger Docs** | https://wallet-service-ibraheem-fkbafua4hpadgyf8.uksouth-01.azurewebsites.net/api |
| **Google Sign-In** | https://wallet-service-ibraheem-fkbafua4hpadgyf8.uksouth-01.azurewebsites.net/auth/google |
| **GitHub Repo** | https://github.com/ibraheembello/Wallet-Service |
| **Testing Guide** | [API_TESTING_GUIDE.md](./API_TESTING_GUIDE.md) |

---

**Built with ❤️ for HNG Internship Stage 8**

**Deployed on Microsoft Azure - Powered by NestJS, PostgreSQL & Paystack**
