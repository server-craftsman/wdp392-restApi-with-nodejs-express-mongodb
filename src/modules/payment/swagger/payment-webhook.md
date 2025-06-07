# PayOS Webhook Handling Documentation

## Overview
This document describes the process flow for handling PayOS payment webhooks in the system.

## Webhook Flow

1. **Webhook Received**
   - PayOS sends a webhook notification to our API endpoint (`/api/payment/webhook`)
   - The webhook contains payment status information, amount, payment number, and a signature

2. **Signature Verification**
   - The system verifies the webhook signature using HMAC-SHA256
   - If the signature is invalid, the request is rejected

3. **Payment Lookup**
   - The system looks up the payment using the payment number
   - Verifies that the payment exists and is in PENDING or PROCESSING status
   - Validates that the amount matches the expected amount

4. **Payment Status Update**
   - If payment status is SUCCESS:
     - Updates payment status to COMPLETED
     - Updates appointment status to CONFIRMED and payment_status to PAID
     - Creates or updates transactions for each sample
     - Sends a payment success email to the customer

   - If payment status is FAILED or other:
     - Updates payment status to FAILED
     - Updates appointment payment status to FAILED
     - Updates any existing transactions to FAILED status
     - Sends a payment failed email to the customer

5. **Response**
   - Returns a success response to PayOS to acknowledge receipt

## Transaction Handling

For successful payments, the system creates a transaction record for each sample associated with the payment. If no samples are found, a single transaction record is created as a fallback.

Each transaction includes:
- Payment ID
- Receipt number (formatted as `{payment_no}-{sample_id_prefix}`)
- Transaction date
- Sample ID (if available)
- PayOS transaction ID
- Payment status and timestamp
- Webhook received timestamp

## Error Handling

The system implements comprehensive error handling:
- Invalid signatures are rejected
- Missing payments are reported
- Amount mismatches are detected
- Transaction creation errors are logged but don't block the process
- Email sending errors are logged but don't block the process

## Testing Webhooks

To test the webhook functionality:
1. Create a test payment using the PayOS sandbox environment
2. Use a tool like Postman to send a simulated webhook to the endpoint
3. Verify that the payment and appointment statuses are updated correctly
4. Check that transaction records are created
5. Verify that the appropriate email is sent 