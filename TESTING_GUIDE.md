# 🧪 Complete Testing Guide - Wallet Service API

This guide provides step-by-step instructions for testing all endpoints using Swagger UI.

---

## 📋 Prerequisites

1. ✅ Server running: `npm run start:dev`
2. ✅ PostgreSQL database connected
3. ✅ Browser open at: `http://localhost:3000/api`

---

## 🔐 PART 1: Authentication Testing

### Test 1: Google OAuth Sign-In

**Step 1:** Open a new browser tab and navigate to:
```
http://localhost:3000/auth/google
```

**Step 2:** You'll be redirected to Google sign-in page. Complete the authentication.

**Step 3:** After successful login, you'll receive a JSON response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1dWlkLWhlcmUiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJuYW1lIjoiSm9obiBEb2UiLCJpYXQiOjE3MDIxMjM0NTZ9.xxxxx",
  "user": {
    "id": "abc123-uuid-here",
    "email": "user@example.com",
    "name": "John Doe",
    "walletNumber": "1234567890123"
  }
}
```

**Step 4:** Copy the entire `access_token` value (the long JWT string).

**Step 5:** Save the `walletNumber` - you'll need it for testing transfers.

---

### Test 2: Authenticate in Swagger

**Step 1:** Go to Swagger UI: `http://localhost:3000/api`

**Step 2:** Click the green **"Authorize"** button at the top right.

**Step 3:** In the "bearerAuth" section, paste your JWT token in this format:
```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Step 4:** Click **"Authorize"**, then **"Close"**.

**Step 5:** You should now see a lock icon next to authenticated endpoints.

---

## 🔑 PART 2: API Key Management Testing

### Test 3: Create Your First API Key

**Endpoint:** `POST /keys/create`

**Step 1:** In Swagger, expand `POST /keys/create`.

**Step 2:** Click **"Try it out"**.

**Step 3:** Replace the request body with:
```json
{
  "name": "my-first-api-key",
  "permissions": ["deposit", "transfer", "read"],
  "expiry": "1D"
}
```

**Step 4:** Click **"Execute"**.

**Expected Response (201):**
```json
{
  "api_key": "sk_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
  "expires_at": "2025-12-10T12:00:00.000Z"
}
```

**Step 5:** **IMPORTANT** - Copy and save the `api_key` value. You cannot retrieve it again!

---

### Test 4: Test Different Expiry Formats

Create multiple API keys with different expiry times:

**1 Hour Expiry:**
```json
{
  "name": "short-lived-key",
  "permissions": ["read"],
  "expiry": "1H"
}
```

**1 Month Expiry:**
```json
{
  "name": "monthly-key",
  "permissions": ["deposit", "read"],
  "expiry": "1M"
}
```

**1 Year Expiry:**
```json
{
  "name": "yearly-key",
  "permissions": ["deposit", "transfer", "read"],
  "expiry": "1Y"
}
```

---

### Test 5: Verify 5-Key Limit

**Step 1:** Create API keys one by one until you have 5 active keys.

**Step 2:** Try to create a 6th key with:
```json
{
  "name": "sixth-key",
  "permissions": ["read"],
  "expiry": "1D"
}
```

**Expected Response (400):**
```json
{
  "statusCode": 400,
  "message": "Maximum of 5 active API keys allowed per user"
}
```

---

### Test 6: Authenticate with API Key

**Step 1:** In Swagger, click **"Authorize"** again.

**Step 2:** In the "x-api-key" section, paste your API key:
```
sk_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

**Step 3:** Click **"Authorize"**, then **"Close"**.

**Step 4:** You can now use either JWT or API Key for authenticated requests.

---

## 💰 PART 3: Wallet Operations Testing

### Test 7: Check Initial Balance

**Endpoint:** `GET /wallet/balance`

**Step 1:** Expand `GET /wallet/balance`.

**Step 2:** Click **"Try it out"**, then **"Execute"**.

**Expected Response (200):**
```json
{
  "balance": 0
}
```

---

### Test 8: Initialize Deposit

**Endpoint:** `POST /wallet/deposit`

**Step 1:** Expand `POST /wallet/deposit`.

**Step 2:** Click **"Try it out"**.

**Step 3:** Enter deposit amount:
```json
{
  "amount": 5000
}
```

**Step 4:** Click **"Execute"**.

**Expected Response (201):**
```json
{
  "reference": "dep_1702123456789_a1b2c3d4e5f6g7h8",
  "authorization_url": "https://checkout.paystack.com/xxxxxxxxxxxxx"
}
```

**Step 5:** Copy the `reference` - you'll need it for checking status.

**Step 6:** Copy the `authorization_url` and open it in a new browser tab.

**Step 7:** Complete the payment on Paystack using test card:
```
Card Number: 4084084084084081
CVV: 408
Expiry: 12/25
PIN: 0000
OTP: 123456
```

---

### Test 9: Simulate Webhook (For Local Testing)

**Note:** Since webhooks need a public URL, we'll simulate it for local testing.

**Option 1: Use Postman/cURL**

First, compute the HMAC signature:

```javascript
// In Node.js console or browser console:
const crypto = require('crypto');
const payload = JSON.stringify({
  "event": "charge.success",
  "data": {
    "reference": "dep_1702123456789_a1b2c3d4e5f6g7h8", // Use your actual reference
    "amount": 500000, // 5000 * 100 (in kobo)
    "status": "success"
  }
});
const secret = "sk_test_b2c5e9cb8b241f7860fd1e86fb74ae6188e9d4ab";
const hash = crypto.createHmac('sha512', secret).update(payload).digest('hex');
console.log(hash);
```

Then send the webhook:

```bash
curl -X POST http://localhost:3000/wallet/paystack/webhook \
  -H "Content-Type: application/json" \
  -H "x-paystack-signature: [paste-computed-hash-here]" \
  -d '{
    "event": "charge.success",
    "data": {
      "reference": "dep_1702123456789_a1b2c3d4e5f6g7h8",
      "amount": 500000,
      "status": "success"
    }
  }'
```

**Option 2: Complete actual Paystack payment**
- Use ngrok to expose your local server
- Set webhook URL in Paystack dashboard
- Complete real payment

---

### Test 10: Check Deposit Status

**Endpoint:** `GET /wallet/deposit/{reference}/status`

**Step 1:** Expand `GET /wallet/deposit/{reference}/status`.

**Step 2:** Click **"Try it out"**.

**Step 3:** In the `reference` parameter, paste your deposit reference:
```
dep_1702123456789_a1b2c3d4e5f6g7h8
```

**Step 4:** Click **"Execute"**.

**Expected Response (200):**
```json
{
  "reference": "dep_1702123456789_a1b2c3d4e5f6g7h8",
  "status": "success",
  "amount": 5000
}
```

---

### Test 11: Verify Balance Updated

**Endpoint:** `GET /wallet/balance`

**Step 1:** Expand `GET /wallet/balance` again.

**Step 2:** Click **"Try it out"**, then **"Execute"**.

**Expected Response (200):**
```json
{
  "balance": 5000
}
```

**✅ Success!** Your wallet has been credited after webhook processing.

---

### Test 12: View Transaction History

**Endpoint:** `GET /wallet/transactions`

**Step 1:** Expand `GET /wallet/transactions`.

**Step 2:** Click **"Try it out"**, then **"Execute"**.

**Expected Response (200):**
```json
[
  {
    "type": "deposit",
    "amount": 5000,
    "status": "success",
    "reference": "dep_1702123456789_a1b2c3d4e5f6g7h8",
    "createdAt": "2025-12-09T10:30:00.000Z",
    "metadata": {
      "email": "user@example.com",
      "initiated_by": "uuid-here",
      "paystack_status": "success",
      "processed_at": "2025-12-09T10:31:00.000Z"
    }
  }
]
```

---

## 💸 PART 4: Transfer Testing

### Test 13: Create Second User

**Step 1:** Open an **incognito/private browser window**.

**Step 2:** Navigate to:
```
http://localhost:3000/auth/google
```

**Step 3:** Sign in with a **different Google account**.

**Step 4:** Copy the `walletNumber` from the response:
```json
{
  "access_token": "...",
  "user": {
    "walletNumber": "9876543210987"  // ← Copy this
  }
}
```

---

### Test 14: Transfer Funds

**Step 1:** Return to your **main browser** (with first user logged in).

**Step 2:** In Swagger, expand `POST /wallet/transfer`.

**Step 3:** Click **"Try it out"**.

**Step 4:** Enter transfer details:
```json
{
  "wallet_number": "9876543210987",
  "amount": 3000
}
```

**Step 5:** Click **"Execute"**.

**Expected Response (200):**
```json
{
  "status": "success",
  "message": "Transfer completed"
}
```

---

### Test 15: Verify Sender Balance Deducted

**Endpoint:** `GET /wallet/balance`

**Expected Response:**
```json
{
  "balance": 2000
}
```
(5000 - 3000 = 2000)

---

### Test 16: Verify Recipient Balance Credited

**Step 1:** Switch to **incognito window** (second user).

**Step 2:** Go to Swagger: `http://localhost:3000/api`

**Step 3:** Authorize with second user's JWT.

**Step 4:** Call `GET /wallet/balance`.

**Expected Response:**
```json
{
  "balance": 3000
}
```

---

### Test 17: View Transfer in Transaction History

**Both users should see the transfer:**

**Sender's perspective:**
```json
[
  {
    "type": "deposit",
    "amount": 5000,
    "status": "success"
  },
  {
    "type": "transfer",
    "amount": 3000,  // Debit
    "status": "success",
    "metadata": {
      "type": "debit",
      "recipient": "9876543210987"
    }
  }
]
```

**Recipient's perspective:**
```json
[
  {
    "type": "transfer",
    "amount": 3000,  // Credit
    "status": "success",
    "metadata": {
      "type": "credit",
      "sender": "1234567890123"
    }
  }
]
```

---

## 🔒 PART 5: Permission Testing

### Test 18: Create Read-Only API Key

**Step 1:** Create a restricted API key:
```json
{
  "name": "read-only-key",
  "permissions": ["read"],
  "expiry": "1D"
}
```

**Step 2:** Copy the generated API key.

---

### Test 19: Test Read Permission

**Step 1:** Authorize with the read-only API key.

**Step 2:** Try `GET /wallet/balance` - **Should succeed** ✅

**Step 3:** Try `GET /wallet/transactions` - **Should succeed** ✅

---

### Test 20: Test Missing Permissions

**Step 1:** Still using read-only API key.

**Step 2:** Try `POST /wallet/deposit`:
```json
{
  "amount": 1000
}
```

**Expected Response (403):**
```json
{
  "statusCode": 403,
  "message": "Missing required permissions: deposit"
}
```

**Step 3:** Try `POST /wallet/transfer`:
```json
{
  "wallet_number": "9876543210987",
  "amount": 100
}
```

**Expected Response (403):**
```json
{
  "statusCode": 403,
  "message": "Missing required permissions: transfer"
}
```

---

## ⚠️ PART 6: Error Handling Testing

### Test 21: Insufficient Balance

**Step 1:** Check your current balance (e.g., 2000).

**Step 2:** Try to transfer more than available:
```json
{
  "wallet_number": "9876543210987",
  "amount": 5000
}
```

**Expected Response (400):**
```json
{
  "statusCode": 400,
  "message": "Insufficient balance"
}
```

---

### Test 22: Invalid Wallet Number

**Step 1:** Try transferring to non-existent wallet:
```json
{
  "wallet_number": "9999999999999",
  "amount": 100
}
```

**Expected Response (404):**
```json
{
  "statusCode": 404,
  "message": "Recipient wallet not found"
}
```

---

### Test 23: Invalid Wallet Number Format

**Step 1:** Try with wrong length:
```json
{
  "wallet_number": "123",
  "amount": 100
}
```

**Expected Response (400):**
```json
{
  "statusCode": 400,
  "message": ["Wallet number must be exactly 13 digits"]
}
```

---

### Test 24: Expired API Key

**Step 1:** Create a 1-hour expiry key:
```json
{
  "name": "temp-key",
  "permissions": ["read"],
  "expiry": "1H"
}
```

**Step 2:** To test immediately, manually update the database:
```sql
UPDATE api_keys
SET expires_at = NOW() - INTERVAL '1 hour'
WHERE name = 'temp-key';
```

**Step 3:** Try using the expired key.

**Expected Response (401):**
```json
{
  "statusCode": 401,
  "message": "API key has expired"
}
```

---

### Test 25: Test API Key Rollover

**Step 1:** Get the ID of the expired key from database.

**Step 2:** Call `POST /keys/rollover`:
```json
{
  "expired_key_id": "uuid-of-expired-key",
  "expiry": "1M"
}
```

**Expected Response (201):**
```json
{
  "api_key": "sk_live_new_key_generated_here",
  "expires_at": "2026-01-09T12:00:00.000Z"
}
```

**Step 3:** Verify new key has same permissions as old key.

---

## 🎯 Testing Summary Checklist

### Authentication ✅
- [x] Google OAuth login works
- [x] JWT token generated
- [x] JWT authentication works in Swagger
- [x] Wallet auto-created on first login

### API Keys ✅
- [x] Create API key with all permissions
- [x] Create API key with limited permissions
- [x] Test all expiry formats (1H, 1D, 1M, 1Y)
- [x] 5-key limit enforced
- [x] API key authentication works
- [x] Expired keys rejected
- [x] Rollover works with same permissions

### Deposits ✅
- [x] Initialize deposit returns Paystack URL
- [x] Webhook processes payment correctly
- [x] Balance updated after webhook
- [x] Idempotency prevents double-credit
- [x] Deposit status endpoint works

### Transfers ✅
- [x] Transfer between wallets succeeds
- [x] Sender balance deducted
- [x] Recipient balance credited
- [x] Insufficient balance rejected
- [x] Invalid wallet number rejected
- [x] Transfer appears in both users' history

### Permissions ✅
- [x] Read-only key can view balance
- [x] Read-only key cannot deposit
- [x] Read-only key cannot transfer
- [x] JWT bypasses permission checks

### Transaction History ✅
- [x] Shows all user transactions
- [x] Deposits marked correctly
- [x] Transfers show sender/recipient info
- [x] Sorted by most recent first

---

## 🌐 Testing with Production URL

After deploying, repeat all tests using your production URL:

1. Replace `http://localhost:3000` with your deployed URL
2. Update Google OAuth callback URL
3. Update Paystack webhook URL
4. Test all flows end-to-end

---

**🎉 Congratulations!** If all tests pass, your wallet service is fully functional and production-ready!
