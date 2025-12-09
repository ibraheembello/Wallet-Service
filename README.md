# 💰 Wallet Service with Paystack, JWT & API Keys

> **HNG Backend Stage 8 Task** - A production-ready wallet service implementing deposits via Paystack, wallet-to-wallet transfers, Google OAuth authentication, and API key management.

---

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [Getting Your Server Base URL](#getting-your-server-base-url)
- [API Documentation](#api-documentation)
- [Testing Workflow](#testing-workflow)
- [Database Schema](#database-schema)
- [Security Features](#security-features)
- [Deployment](#deployment)

---

## ✨ Features

### Authentication
- ✅ Google OAuth 2.0 sign-in
- ✅ JWT token generation and validation
- ✅ Dual authentication (JWT or API Key)

### API Key Management
- ✅ Create API keys with specific permissions (`deposit`, `transfer`, `read`)
- ✅ Expiry formats: `1H`, `1D`, `1M`, `1Y`
- ✅ Maximum 5 active keys per user
- ✅ Rollover expired keys with same permissions
- ✅ Automatic expiry validation

### Wallet Operations
- ✅ Auto-generate unique 13-digit wallet numbers
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

---

## 🛠 Technology Stack

| Category | Technology |
|----------|-----------|
| **Framework** | NestJS 10.x |
| **Language** | TypeScript 5.x |
| **Database** | PostgreSQL |
| **ORM** | TypeORM |
| **Authentication** | Passport (Google OAuth, JWT) |
| **Payment** | Paystack API |
| **Validation** | class-validator, class-transformer |
| **Documentation** | Swagger/OpenAPI |

---

## 📁 Project Structure

```
src/
├── entities/                 # Database entities
│   ├── user.entity.ts
│   ├── wallet.entity.ts
│   ├── transaction.entity.ts
│   └── api-key.entity.ts
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
├── app.module.ts
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

4. **Google OAuth Credentials** (already configured)
5. **Paystack Account** (test keys already configured)

---

## 📥 Installation & Setup

### Step 1: Install Dependencies

```bash
# Navigate to project directory
cd "c:\Users\bello\Desktop\HNG Internship\Wallet Service with Paystack, JWT, & API Keys"

# Install all dependencies
npm install
```

### Step 2: Create Environment File

```bash
# Copy the example environment file
cp .env.example .env
```

### Step 3: Configure Environment Variables

Open `.env` and verify all values (pre-configured):

```env
# Application
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database (CONFIGURED)
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=ib65426444
DB_DATABASE=wallet_service
DB_SYNCHRONIZE=true
DB_LOGGING=true

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-characters
JWT_EXPIRES_IN=7d

# Google OAuth (CONFIGURED)
GOOGLE_CLIENT_ID=338109137530-o58m827vbqnhjkma6vo8nock30em809e.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Paystack (CONFIGURED)
PAYSTACK_SECRET_KEY=sk_test_b2c5e9cb8b241f7860fd1e86fb74ae6188e9d4ab
PAYSTACK_PUBLIC_KEY=pk_test_81aca4e5892519d8bbf6b0f94f76956c1dd36625
PAYSTACK_BASE_URL=https://api.paystack.co
```

### Step 4: Setup PostgreSQL Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE wallet_service;

# Exit PostgreSQL
\q
```

**Note**: The application will auto-create tables on first run (`DB_SYNCHRONIZE=true`).

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

## 🌐 Getting Your Server Base URL

### Local Development

When running locally, your base URL is:

```
http://localhost:3000
```

**Alternative formats:**
- `http://127.0.0.1:3000`
- `http://[your-local-ip]:3000` (e.g., `http://192.168.1.100:3000`)

### Finding Your Local IP Address

**Windows:**
```bash
ipconfig
# Look for "IPv4 Address" under your active network adapter
```

**macOS/Linux:**
```bash
ifconfig
# or
ip addr show
```

### Production Deployment

After deploying to a hosting service:

| Platform | Base URL Format |
|----------|----------------|
| **Render** | `https://your-app-name.onrender.com` |
| **Railway** | `https://your-app-name.up.railway.app` |
| **Heroku** | `https://your-app-name.herokuapp.com` |
| **AWS EC2** | `http://your-ec2-ip:3000` or `https://your-domain.com` |
| **DigitalOcean** | `http://your-droplet-ip:3000` or `https://your-domain.com` |
| **Vercel** | `https://your-app-name.vercel.app` |

---

## 📚 API Documentation

### Accessing Swagger UI

Once the server is running, visit:

```
http://localhost:3000/api
```

This provides an interactive API documentation where you can:
- ✅ View all endpoints
- ✅ Test API calls directly
- ✅ See request/response schemas
- ✅ Authenticate with JWT or API Key

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
| POST | `/wallet/deposit` | JWT/API Key | Initialize deposit |
| POST | `/wallet/paystack/webhook` | None (Paystack) | Webhook handler |
| GET | `/wallet/deposit/:ref/status` | JWT/API Key | Check deposit status |
| GET | `/wallet/balance` | JWT/API Key | Get wallet balance |
| POST | `/wallet/transfer` | JWT/API Key | Transfer funds |
| GET | `/wallet/transactions` | JWT/API Key | Transaction history |

---

## 🧪 Testing Workflow (Step-by-Step)

### 1. Google Authentication & Get JWT

**Step 1:** Open browser and navigate to:
```
http://localhost:3000/auth/google
```

**Step 2:** Complete Google sign-in

**Step 3:** Copy the `access_token` from the response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "walletNumber": "1234567890123"
  }
}
```

**Step 4:** In Swagger UI, click "Authorize" and paste the token:
```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 2. Create API Key

**Endpoint:** `POST /keys/create`

**Request Body:**
```json
{
  "name": "wallet-service",
  "permissions": ["deposit", "transfer", "read"],
  "expiry": "1D"
}
```

**Response:**
```json
{
  "api_key": "sk_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "expires_at": "2025-12-10T12:00:00Z"
}
```

**Step:** Copy the `api_key` for later use.

---

### 3. Test API Key Authentication

**Option 1: Use Swagger**
- Click "Authorize" button
- Under "x-api-key", paste your API key
- Click "Authorize"

**Option 2: Use cURL**
```bash
curl -X GET http://localhost:3000/wallet/balance \
  -H "x-api-key: sk_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
```

---

### 4. Initialize Deposit

**Endpoint:** `POST /wallet/deposit`

**Auth:** JWT or API Key with `deposit` permission

**Request Body:**
```json
{
  "amount": 5000
}
```

**Response:**
```json
{
  "reference": "dep_1702123456789_a1b2c3d4",
  "authorization_url": "https://checkout.paystack.com/xxxxx"
}
```

**Step:** Open the `authorization_url` in browser and complete payment.

---

### 5. Test Webhook (Locally with Paystack Events)

**Note:** For local testing, you'll need to expose your localhost using:

**Option 1: ngrok**
```bash
ngrok http 3000
```

Then set webhook URL in Paystack Dashboard:
```
https://your-ngrok-url.ngrok.io/wallet/paystack/webhook
```

**Option 2: Manual Webhook Simulation (Testing)**
```bash
curl -X POST http://localhost:3000/wallet/paystack/webhook \
  -H "Content-Type: application/json" \
  -H "x-paystack-signature: [computed-hmac]" \
  -d '{
    "event": "charge.success",
    "data": {
      "reference": "dep_1702123456789_a1b2c3d4",
      "amount": 500000,
      "status": "success"
    }
  }'
```

---

### 6. Check Deposit Status

**Endpoint:** `GET /wallet/deposit/:reference/status`

**Auth:** JWT or API Key with `read` permission

**Example:**
```
GET /wallet/deposit/dep_1702123456789_a1b2c3d4/status
```

**Response:**
```json
{
  "reference": "dep_1702123456789_a1b2c3d4",
  "status": "success",
  "amount": 5000
}
```

---

### 7. Check Wallet Balance

**Endpoint:** `GET /wallet/balance`

**Auth:** JWT or API Key with `read` permission

**Response:**
```json
{
  "balance": 5000
}
```

---

### 8. Transfer Funds

**Prerequisites:**
1. Create a second user via Google OAuth
2. Note their `walletNumber` from the callback response

**Endpoint:** `POST /wallet/transfer`

**Auth:** JWT or API Key with `transfer` permission

**Request Body:**
```json
{
  "wallet_number": "9876543210987",
  "amount": 3000
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Transfer completed"
}
```

---

### 9. View Transaction History

**Endpoint:** `GET /wallet/transactions`

**Auth:** JWT or API Key with `read` permission

**Response:**
```json
[
  {
    "type": "deposit",
    "amount": 5000,
    "status": "success",
    "reference": "dep_1702123456789_a1b2c3d4",
    "createdAt": "2025-12-09T10:30:00Z"
  },
  {
    "type": "transfer",
    "amount": 3000,
    "status": "success",
    "reference": "txf_1702123456790_b2c3d4e5",
    "createdAt": "2025-12-09T10:35:00Z"
  }
]
```

---

### 10. Test API Key Rollover

**Step 1:** Wait for API key to expire (or manually change `expiresAt` in DB)

**Step 2:** Get the expired key ID from database

**Endpoint:** `POST /keys/rollover`

**Request Body:**
```json
{
  "expired_key_id": "uuid-of-expired-key",
  "expiry": "1M"
}
```

**Response:**
```json
{
  "api_key": "sk_live_new_key_here",
  "expires_at": "2026-01-09T12:00:00Z"
}
```

---

## 🗄 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
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
  id UUID PRIMARY KEY,
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
  id UUID PRIMARY KEY,
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
  id UUID PRIMARY KEY,
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

### 1. Authentication
- ✅ Google OAuth 2.0 with verified credentials
- ✅ JWT with secure secret and expiration
- ✅ API keys hashed with bcrypt (never stored in plain text)

### 2. Webhook Security
- ✅ Paystack signature verification using HMAC-SHA512
- ✅ Idempotent processing (prevents double-crediting)

### 3. Authorization
- ✅ Permission-based access control
- ✅ Automatic API key expiry validation
- ✅ Maximum 5 active keys per user

### 4. Transaction Safety
- ✅ Atomic database transactions for transfers
- ✅ Balance validation before transfers
- ✅ Unique transaction references

### 5. Input Validation
- ✅ class-validator on all DTOs
- ✅ Whitelist and forbid non-whitelisted properties
- ✅ Type transformation and sanitization

---

## 🚢 Deployment

### Deploy to Render

1. **Create account:** https://render.com
2. **Create New Web Service**
3. **Connect GitHub repository**
4. **Configure:**
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start:prod`
5. **Add Environment Variables** (from `.env`)
6. **Deploy**

Your base URL will be: `https://your-app-name.onrender.com`

### Deploy to Railway

1. **Create account:** https://railway.app
2. **New Project → Deploy from GitHub**
3. **Add PostgreSQL database** (auto-provision)
4. **Add environment variables**
5. **Deploy**

Your base URL will be: `https://your-app-name.up.railway.app`

### Important: Update Paystack Webhook URL

After deployment, update webhook URL in Paystack Dashboard:

```
https://your-production-url.com/wallet/paystack/webhook
```

---

## 🧪 Testing with Postman

Import this collection for quick testing:

```json
{
  "info": {
    "name": "Wallet Service API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000"
    },
    {
      "key": "jwt_token",
      "value": ""
    },
    {
      "key": "api_key",
      "value": ""
    }
  ]
}
```

---

## 📞 Support

For issues or questions:
- Review this README
- Check Swagger documentation at `/api`
- Verify environment variables
- Check database connection
- Review application logs

---

## 📄 License

MIT License - HNG Internship Stage 8 Project

---

## ✅ Requirements Checklist

- [x] Google OAuth authentication
- [x] JWT token generation
- [x] API key creation with permissions
- [x] API key expiry (1H, 1D, 1M, 1Y)
- [x] Maximum 5 active keys per user
- [x] API key rollover
- [x] Wallet creation per user
- [x] 13-digit wallet numbers
- [x] Paystack deposit initialization
- [x] **Mandatory webhook implementation**
- [x] Webhook signature verification
- [x] Idempotent transaction processing
- [x] Wallet balance inquiry
- [x] Wallet-to-wallet transfers
- [x] Atomic transfer operations
- [x] Transaction history
- [x] Permission-based access control
- [x] Dual authentication (JWT + API Key)
- [x] Comprehensive error handling
- [x] Swagger documentation
- [x] PostgreSQL database
- [x] TypeORM entities

---

**Built with ❤️ for HNG Internship Stage 8**
