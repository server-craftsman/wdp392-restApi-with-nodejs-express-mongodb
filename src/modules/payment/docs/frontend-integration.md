# PayOS Frontend Integration Guide

This guide explains how to handle PayOS payment verification on the frontend after users complete their payment.

## Overview

When a user completes payment with PayOS, they are automatically redirected to your frontend with payment status information. Your frontend needs to handle this redirect and verify the payment status.

## Backend Endpoints

### 1. PayOS Return URL Handler
- **URL**: `GET /api/payments/payos-return`
- **Purpose**: Handles PayOS redirects and forwards to frontend
- **Redirects to**: `{DOMAIN_FE}/payos?{query_params}`

### 2. Payment Status API
- **URL**: `GET /api/payments/status/:orderCode`
- **Purpose**: Get detailed payment status for frontend verification
- **Response**: Detailed payment and verification information

## Frontend Implementation

### 1. PayOS Return Page Component (React)

```tsx
// PayOSReturnPage.tsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

interface PaymentVerificationResult {
  payment: {
    payment_no: string;
    amount: number;
    payment_method: string;
    status: string;
    payos_order_code: number;
    created_at: string;
    updated_at: string;
  };
  verification: {
    payment_status: string;
    appointment_id: string;
    paymentNo: string;
    payos_status?: string;
    last_verified_at: string;
  };
  appointment: {
    appointment_id: string;
  } | null;
  timestamp: string;
}

const PayOSReturnPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [verificationResult, setVerificationResult] = useState<PaymentVerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get parameters from URL
  const code = searchParams.get('code');
  const orderCode = searchParams.get('orderCode');
  const status = searchParams.get('status');
  const paymentNo = searchParams.get('paymentNo');
  const appointmentId = searchParams.get('appointmentId');
  const payosStatus = searchParams.get('payosStatus');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!orderCode) {
        setError('Missing order code');
        setLoading(false);
        return;
      }

      try {
        // Call your API to get detailed payment status
        const response = await fetch(`/api/payments/status/${orderCode}`);
        const data = await response.json();

        if (data.success) {
          setVerificationResult(data.data);
          
          // Auto-redirect based on payment status after 3 seconds
          setTimeout(() => {
            if (data.data.verification.payment_status === 'completed') {
              // Redirect to success page with appointment info
              navigate(`/appointments/${data.data.verification.appointment_id}?payment=success`);
            } else if (data.data.verification.payment_status === 'cancelled') {
              // Redirect to appointments list
              navigate('/appointments?payment=cancelled');
            } else {
              // Redirect to payment page to retry
              navigate(`/appointments/${data.data.verification.appointment_id}/payment?retry=true`);
            }
          }, 3000);
        } else {
          setError(data.message || 'Failed to verify payment');
        }
      } catch (err) {
        setError('Network error occurred');
        console.error('Payment verification error:', err);
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [orderCode, navigate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'cancelled': return 'text-red-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'cancelled': return '❌';
      case 'pending': return '⏳';
      default: return '❓';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Verifying Payment...</h2>
          <p className="text-gray-600">Please wait while we confirm your payment status.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Payment Verification Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/appointments')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Appointments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">
            {getStatusIcon(verificationResult?.verification.payment_status || 'unknown')}
          </div>
          <h2 className={`text-2xl font-bold mb-2 ${getStatusColor(verificationResult?.verification.payment_status || 'unknown')}`}>
            Payment {verificationResult?.verification.payment_status === 'completed' ? 'Successful' : 
                     verificationResult?.verification.payment_status === 'cancelled' ? 'Cancelled' : 
                     'Processing'}
          </h2>
        </div>

        {verificationResult && (
          <div className="space-y-4">
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Payment Details:</h3>
              <div className="text-sm space-y-1">
                <p><span className="font-medium">Payment No:</span> {verificationResult.payment.payment_no}</p>
                <p><span className="font-medium">Amount:</span> {verificationResult.payment.amount.toLocaleString()} VND</p>
                <p><span className="font-medium">Method:</span> {verificationResult.payment.payment_method}</p>
                <p><span className="font-medium">Status:</span> 
                  <span className={`ml-1 ${getStatusColor(verificationResult.verification.payment_status)}`}>
                    {verificationResult.verification.payment_status}
                  </span>
                </p>
                {verificationResult.verification.payos_status && (
                  <p><span className="font-medium">PayOS Status:</span> {verificationResult.verification.payos_status}</p>
                )}
              </div>
            </div>

            <div className="text-center text-sm text-gray-500">
              Redirecting automatically in 3 seconds...
            </div>
          </div>
        )}

        <div className="mt-6 space-y-2">
          <button
            onClick={() => navigate(`/appointments/${verificationResult?.verification.appointment_id}`)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Appointment
          </button>
          <button
            onClick={() => navigate('/appointments')}
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
          >
            All Appointments
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayOSReturnPage;
```

### 2. Payment Status Hook

```tsx
// usePaymentStatus.ts
import { useState, useEffect } from 'react';

interface PaymentStatusHook {
  verifyPayment: (orderCode: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  paymentData: any | null;
  isCompleted: boolean;
  isCancelled: boolean;
  isPending: boolean;
}

export const usePaymentStatus = (): PaymentStatusHook => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<any | null>(null);

  const verifyPayment = async (orderCode: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/payments/status/${orderCode}`);
      const data = await response.json();

      if (data.success) {
        setPaymentData(data.data);
      } else {
        setError(data.message || 'Failed to verify payment');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Payment verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  const isCompleted = paymentData?.verification?.payment_status === 'completed';
  const isCancelled = paymentData?.verification?.payment_status === 'cancelled';
  const isPending = paymentData?.verification?.payment_status === 'pending';

  return {
    verifyPayment,
    loading,
    error,
    paymentData,
    isCompleted,
    isCancelled,
    isPending
  };
};
```

### 3. Router Setup

```tsx
// App.tsx or Router setup
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PayOSReturnPage from './components/PayOSReturnPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Other routes */}
        <Route path="/payos" element={<PayOSReturnPage />} />
        {/* Other routes */}
      </Routes>
    </Router>
  );
}
```

### 4. Environment Variables

Make sure your `.env` file includes:

```env
# Backend
DOMAIN_FE=https://your-frontend-domain.com
PAYOS_RETURN_URL=https://your-backend-domain.com/api/payments/payos-return
PAYOS_CANCEL_URL=https://your-backend-domain.com/api/payments/payos-cancel

# PayOS credentials
PAYOS_CLIENT_ID=your_client_id
PAYOS_API_KEY=your_api_key
PAYOS_CHECKSUM_KEY=your_checksum_key
```

## How It Works

1. **Payment Creation**: User creates payment and gets PayOS checkout URL
2. **PayOS Payment**: User completes payment on PayOS
3. **PayOS Redirect**: PayOS redirects to your backend return URL
4. **Backend Processing**: Backend verifies payment and redirects to frontend
5. **Frontend Handling**: Frontend receives redirect with payment info
6. **Status Verification**: Frontend calls API to get detailed status
7. **User Experience**: User sees payment result and gets redirected appropriately

## URL Parameters

When PayOS redirects to your frontend `/payos` page, you'll receive these parameters:

- `code`: '00' for success, '99' for failure/cancel
- `orderCode`: PayOS order code
- `status`: Payment status (completed, cancelled, pending, etc.)
- `paymentNo`: Your internal payment number
- `appointmentId`: Related appointment ID
- `payosStatus`: PayOS-specific status
- `verifiedAt`: Timestamp of verification

## Error Handling

The frontend should handle these scenarios:

1. **Missing Parameters**: Show error and redirect to appointments
2. **Payment Not Found**: Show error message
3. **Network Errors**: Show retry option
4. **Verification Failures**: Provide manual verification option

## Testing

To test the integration:

1. Create a test payment
2. Complete payment on PayOS sandbox
3. Verify redirect to frontend works
4. Check that payment status is correctly displayed
5. Confirm automatic redirects work as expected

## Security Notes

- Always verify payment status server-side
- Don't trust frontend-only verification
- Use HTTPS for all payment-related URLs
- Validate all incoming parameters
- Log payment verification attempts for debugging 