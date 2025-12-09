/**
 * Generate Paystack Webhook Signature for Testing
 *
 * This script generates a valid HMAC SHA-512 signature for testing
 * the Paystack webhook endpoint locally.
 *
 * Usage: node generate-webhook-signature.js
 */

const crypto = require('crypto');
require('dotenv').config();

// Your Paystack secret key from .env
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// Example webhook payload (customize this with your actual data)
const webhookPayload = {
  event: "charge.success",
  data: {
    reference: "dep_1765253298333_eff3484bac601b0e", // Replace with your actual reference
    amount: 5000, // Amount in kobo (₦5000 = 500000 kobo)
    status: "success",
    customer: {
      email: "ib34457916@gmail.com" // Replace with actual user email
    },
    paid_at: new Date().toISOString()
  }
};

// Convert payload to JSON string (exactly as it will be sent in the request body)
const payloadString = JSON.stringify(webhookPayload);

// Generate HMAC SHA-512 signature
const signature = crypto
  .createHmac('sha512', PAYSTACK_SECRET_KEY)
  .update(payloadString)
  .digest('hex');

console.log('\n═══════════════════════════════════════════════════════════');
console.log('🔐 PAYSTACK WEBHOOK SIGNATURE GENERATOR');
console.log('═══════════════════════════════════════════════════════════\n');

console.log('📦 Webhook Payload:');
console.log(JSON.stringify(webhookPayload, null, 2));

console.log('\n🔑 Generated Signature:');
console.log(signature);

console.log('\n📋 cURL Command for Testing:');
console.log('───────────────────────────────────────────────────────────');
console.log(`curl -X POST http://localhost:3000/wallet/paystack/webhook \\
  -H "Content-Type: application/json" \\
  -H "x-paystack-signature: ${signature}" \\
  -d '${payloadString}'`);

console.log('\n📋 Postman/Thunder Client Instructions:');
console.log('───────────────────────────────────────────────────────────');
console.log('1. Method: POST');
console.log('2. URL: http://localhost:3000/wallet/paystack/webhook');
console.log('3. Headers:');
console.log('   - Content-Type: application/json');
console.log(`   - x-paystack-signature: ${signature}`);
console.log('4. Body (raw JSON):');
console.log(payloadString);

console.log('\n💡 IMPORTANT NOTES:');
console.log('───────────────────────────────────────────────────────────');
console.log('1. Replace the "reference" with your actual deposit reference');
console.log('2. Replace "email" with the actual user email from your JWT token');
console.log('3. Amount is in kobo (multiply by 100)');
console.log('4. The signature is tied to this EXACT payload');
console.log('5. Any change in the payload requires regenerating the signature');
console.log('\n═══════════════════════════════════════════════════════════\n');
