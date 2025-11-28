import api from './api';

export const paymentService = {
  // Initiate Mpesa payment - ✅ FIXED: Added /api/
  initiateMpesaPayment: async (orderId, phoneNumber) => {
    return await api({
      method: 'POST',
      url: '/api/payments/initiate-payment/',
      data: {
        order_id: orderId,
        phone_number: phoneNumber
      }
    });
  },

  // Check payment status - ✅ FIXED: Added /api/
  checkPaymentStatus: async (paymentId) => {
    return await api.get(`/api/payments/status/${paymentId}/`);
  },

  // Poll payment status (for real-time updates)
  pollPaymentStatus: async (paymentId, interval = 3000, maxAttempts = 20) => {
    return new Promise((resolve, reject) => {
      let attempts = 0;

      const checkStatus = async () => {
        try {
          const response = await paymentService.checkPaymentStatus(paymentId);
          const payment = response.data;
          
          if (payment.status === 'successful') {
            resolve({ success: true, payment });
          } else if (payment.status === 'failed') {
            resolve({ success: false, error: payment.result_description });
          } else if (attempts >= maxAttempts) {
            resolve({ success: false, error: 'Payment timeout' });
          } else {
            attempts++;
            setTimeout(checkStatus, interval);
          }
        } catch (error) {
          reject(error);
        }
      };

      checkStatus();
    });
  }
};