# Complete API Testing Guide - Wallet Service

This guide provides step-by-step instructions to test all endpoints in your wallet service from beginning to end.

**Base URL**: `https://wallet-service-ibraheem-fkbafua4hpadgyf8.uksouth-01.azurewebsites.net`

**Swagger UI**: `https://wallet-service-ibraheem-fkbafua4hpadgyf8.uksouth-01.azurewebsites.net/api`

---

## Prerequisites

You'll need:

- A web browser (for Google OAuth)
- An API testing tool (Postman, Insomnia, or use Swagger UI)
- Your Paystack test keys (already configured)

---

## Phase 1: Authentication (Getting Your JWT Token)

### Step 1.1: Sign In with Google OAuth

**Method**: GET
**Endpoint**: `/auth/google`

**How to Test**:

1. Open your browser and navigate to:

   ```
   https://wallet-service-ibraheem-fkbafua4hpadgyf8.uksouth-01.azurewebsites.net/auth/google
   ```

2. You'll be redirected to Google's sign-in page

3. Sign in with your Google account

4. After successful authentication, you'll receive a JSON response:

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

5. **IMPORTANT**: Copy and save the `access_token` - you'll need it for all subsequent requests

6. **IMPORTANT**: Copy and save your `walletNumber` - you'll need it for transfer testing

**What Happens Internally**:

- A new user account is created (if first time)
- A wallet is automatically created with a unique wallet number
- Initial balance is 0.00

---

## Phase 2: API Key Management (Optional but Recommended)

API Keys allow you to access endpoints without JWT tokens, useful for server-to-server integrations.

### Step 2.1: Create an API Key

**Method**: POST
**Endpoint**: `/keys/create`
**Authentication**: Bearer Token (JWT from Step 1.1)

**Headers**:

```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
Content-Type: application/json
```

**Request Body**:

```json
{
  "name": "My First API Key",
  "permissions": ["read", "deposit", "transfer"],
  "expiresInDays": 365
}
```

**Available Permissions**:

- `read` - View balance and transactions
- `deposit` - Initialize deposits
- `transfer` - Transfer funds

**Expected Response**:

```json
{
  "api_key": "sk_live_xxxxxxxxxxxxxxxxxxxxxx",
  "expires_at": "2026-12-10T12:00:00Z"
}
```

**IMPORTANT**: Copy and save the `api_key` - it's only shown once!

---

### Step 2.2: Test API Key Authentication

You can now use either:

- **Bearer Token**: `Authorization: Bearer YOUR_JWT_TOKEN`
- **API Key**: `x-api-key: YOUR_API_KEY`

Both work for the wallet endpoints!

---

## Phase 3: Wallet Operations

### Step 3.1: Check Your Wallet Balance

**Method**: GET
**Endpoint**: `/wallet/balance`
**Authentication**: Bearer Token OR API Key

**Using JWT Token**:

```
Headers:
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**OR Using API Key**:

```
Headers:
x-api-key: YOUR_API_KEY_HERE
```

**Expected Response**:

```json
{
  "balance": 0
}
```

---

### Step 3.2: Initialize a Deposit (Paystack)

**Method**: POST
**Endpoint**: `/wallet/deposit`
**Authentication**: Bearer Token OR API Key

**Headers**:

```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
Content-Type: application/json
```

**Request Body**:

```json
{
  "amount": 5000
}
```

**Expected Response**:

```json
{
  "reference": "TXN_abc123xyz",
  "authorization_url": "https://checkout.paystack.com/xyz123"
}
```

**IMPORTANT**: Copy and save the `reference` - you'll need it to check deposit status

**What to Do Next**:

1. Copy the `authorization_url`
2. Open it in your browser
3. You'll see Paystack's payment page
4. Use Paystack test card details:
   - **Card Number**: 4084 0840 8408 4081
   - **Expiry**: Any future date (e.g., 12/25)
   - **CVV**: 408
   - **PIN**: 0000
   - **OTP**: 123456

5. Complete the payment

---

### Step 3.3: Simulate Webhook (Development Only)

**IMPORTANT**: This endpoint only works in development. In production, Paystack sends webhooks automatically.

Since you're in production, you have two options:

**Option A: Complete the Paystack Payment**

- After paying with the test card in Step 3.2, Paystack will automatically send a webhook to your server
- Your wallet will be credited automatically

**Option B: Use the Test Webhook Endpoint** (if NODE_ENV is not 'production')

```
Method: POST
Endpoint: /wallet/paystack/webhook/test

Request Body:
{
  "reference": "TXN_abc123xyz",  // Use the reference from Step 3.2
  "amount": 5000,
  "success": true
}
```

---

### Step 3.4: Check Deposit Status

**Method**: GET
**Endpoint**: `/wallet/deposit/:reference/status`
**Authentication**: Bearer Token OR API Key

**Example**:

```
GET /wallet/deposit/TXN_abc123xyz/status

Headers:
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Expected Response**:

```json
{
  "reference": "TXN_abc123xyz",
  "status": "success",
  "amount": 5000
}
```

**Possible Statuses**:

- `pending` - Payment not yet completed
- `success` - Payment successful, wallet credited
- `failed` - Payment failed

---

### Step 3.5: Verify Balance Updated

**Method**: GET
**Endpoint**: `/wallet/balance`

Repeat Step 3.1 to verify your balance is now 5000

**Expected Response**:

```json
{
  "balance": 5000
}
```

---

### Step 3.6: View Transaction History

**Method**: GET
**Endpoint**: `/wallet/transactions`
**Authentication**: Bearer Token OR API Key

**Headers**:

```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Expected Response**:

```json
[
  {
    "id": "uuid-here",
    "type": "deposit",
    "amount": 5000,
    "status": "success",
    "reference": "TXN_abc123xyz",
    "createdAt": "2025-12-10T10:30:00Z"
  }
]
```

---

### Step 3.7: Transfer Funds to Another Wallet

**IMPORTANT**: For this test, you'll need a second wallet. You have two options:

**Option A: Create a Second Account**

1. Sign out from Google
2. Repeat Step 1.1 with a different Google account
3. Note down the second account's `walletNumber`

**Option B: Use Your Own Wallet Number for Testing**

- The system will prevent you from transferring to yourself
- This is good for testing error handling

**Method**: POST
**Endpoint**: `/wallet/transfer`
**Authentication**: Bearer Token OR API Key

**Headers**:

```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
Content-Type: application/json
```

**Request Body**:

```json
{
  "recipientWalletNumber": "WLT0987654321",
  "amount": 1000
}
```

**Expected Success Response**:

```json
{
  "status": "success",
  "message": "Transfer completed successfully"
}
```

**Expected Error Responses**:

If insufficient balance:

```json
{
  "statusCode": 400,
  "message": "Insufficient balance"
}
```

If recipient not found:

```json
{
  "statusCode": 404,
  "message": "Recipient wallet not found"
}
```

If trying to transfer to yourself:

```json
{
  "statusCode": 400,
  "message": "Cannot transfer to your own wallet"
}
```

---

### Step 3.8: Verify Balance After Transfer

**Method**: GET
**Endpoint**: `/wallet/balance`

**Expected Response** (if you transferred 1000):

```json
{
  "balance": 4000
}
```

---

### Step 3.9: View Updated Transaction History

**Method**: GET
**Endpoint**: `/wallet/transactions`

**Expected Response**:

```json
[
  {
    "id": "uuid-2",
    "type": "transfer",
    "amount": -1000,
    "status": "success",
    "reference": "TRF_xyz789abc",
    "recipientWalletNumber": "WLT0987654321",
    "createdAt": "2025-12-10T11:00:00Z"
  },
  {
    "id": "uuid-1",
    "type": "deposit",
    "amount": 5000,
    "status": "success",
    "reference": "TXN_abc123xyz",
    "createdAt": "2025-12-10T10:30:00Z"
  }
]
```

---

## Phase 4: API Key Management (Advanced)

### Step 4.1: Create Multiple API Keys with Different Permissions

**Read-Only API Key**:

```json
{
  "name": "Read-Only Key",
  "permissions": ["read"],
  "expiresInDays": 30
}
```

**Deposit-Only API Key**:

```json
{
  "name": "Deposit Key",
  "permissions": ["read", "deposit"],
  "expiresInDays": 90
}
```

**Full Access API Key**:

```json
{
  "name": "Full Access",
  "permissions": ["read", "deposit", "transfer"],
  "expiresInDays": 365
}
```

**Limit**: Maximum 5 active API keys per user

---

### Step 4.2: Test API Key Permissions

**Test Read-Only Key**:

1. Try to get balance (should work ✅)
2. Try to make a transfer (should fail ❌)

**Expected Error**:

```json
{
  "statusCode": 403,
  "message": "API key does not have required permissions"
}
```

---

### Step 4.3: Rollover an Expired API Key

**Note**: This only works if your API key has expired.

**Method**: POST
**Endpoint**: `/keys/rollover`
**Authentication**: Bearer Token (JWT)

**Request Body**:

```json
{
  "oldApiKey": "sk_live_expired_key_here"
}
```

**Expected Response**:

```json
{
  "api_key": "sk_live_new_key_here",
  "expires_at": "2026-12-10T12:00:00Z"
}
```

---

## Testing Checklist

Use this checklist to ensure you've tested everything:

### Authentication

- [ ] Google OAuth sign-in
- [ ] JWT token received
- [ ] User and wallet created

### API Keys

- [ ] Create API key with all permissions
- [ ] Create API key with limited permissions
- [ ] Test authentication with API key
- [ ] Test permission enforcement

### Wallet Operations

- [ ] Check initial balance (0)
- [ ] Initialize deposit
- [ ] Complete Paystack payment
- [ ] Check deposit status
- [ ] Verify balance updated
- [ ] View transaction history (deposit)
- [ ] Transfer funds to another wallet
- [ ] Verify balance after transfer
- [ ] View transaction history (transfer)

### Error Handling

- [ ] Transfer with insufficient balance
- [ ] Transfer to non-existent wallet
- [ ] Transfer to own wallet
- [ ] Use API key without required permissions
- [ ] Create more than 5 API keys

---

## Common Issues and Solutions

### Issue 1: "Unauthorized" Error

**Solution**: Make sure you're including the correct header:

- For JWT: `Authorization: Bearer YOUR_TOKEN`
- For API Key: `x-api-key: YOUR_KEY`

### Issue 2: "Insufficient Balance"

**Solution**: Make sure your deposit was successful first. Check:

1. Deposit status endpoint
2. Current balance endpoint

### Issue 3: "Recipient wallet not found"

**Solution**:

- Make sure you're using the correct wallet number format (WLTxxxxxxxxxx)
- Verify the recipient wallet exists (create another account if needed)

### Issue 4: Test Webhook Returns 403

**Solution**: The test webhook is disabled in production. Either:

- Complete actual Paystack payments, OR
- Change NODE_ENV to 'development' in your environment variables

### Issue 5: Google OAuth Callback Error

**Solution**: Verify these settings:

1. Google Cloud Console has the correct callback URL
2. GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct in environment variables

---

## Using Swagger UI for Testing

The easiest way to test is using Swagger UI:

1. Navigate to: `https://wallet-service-ibraheem-fkbafua4hpadgyf8.uksouth-01.azurewebsites.net/api`

2. For authentication endpoints (marked with 🔓):
   - Click "Try it out"
   - Click "Execute"

3. For protected endpoints (marked with 🔒):
   - Click the "Authorize" button at the top right
   - Enter your JWT token: `Bearer YOUR_TOKEN_HERE`
   - Click "Authorize"
   - Now you can test all protected endpoints

4. For API Key authentication:
   - When testing an endpoint, add the header manually:
   - Click "Try it out"
   - Add parameter: `x-api-key` with your API key value
   - Click "Execute"

---

## Test Scenarios for Complete Coverage

### Scenario 1: New User Journey

1. Sign in with Google
2. Check balance (should be 0)
3. Make a deposit of 10,000
4. Check balance (should be 10,000)
5. View transactions (should show deposit)
6. Create API key
7. Use API key to check balance

### Scenario 2: Two-User Transfer

1. Create Account A (sign in with Google account 1)
2. Note wallet number for Account A
3. Deposit 5,000 to Account A
4. Create Account B (sign in with Google account 2)
5. Note wallet number for Account B
6. From Account A, transfer 2,000 to Account B
7. Check balance A (should be 3,000)
8. Check balance B (should be 2,000)
9. View transactions for both accounts

### Scenario 3: API Key Permissions

1. Create read-only API key
2. Try to check balance with API key ✅
3. Try to make deposit with API key ❌ (should fail)
4. Create full-access API key
5. Make deposit with new API key ✅
6. Make transfer with API key ✅

---
