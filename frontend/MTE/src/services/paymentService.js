import api from './api';  // Change this line only

/*const getCSRFToken = () => {
    const name = 'csrftoken';
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }    
    }
    return cookieValue;
};*/
export const paymentService = {
  // Initiate Mpesa payment
  initiateMpesaPayment: async (orderId, phoneNumber) => {
    //const csrfToken = getCSRFToken();

    return await api({
      method: 'POST',
      url: '/payments/initiate-payment/',
      data: {
        order_id: orderId,
        phone_number: phoneNumber
      }
     // headers: {
       // 'X-CSRFToken': csrfToken
    });
  
  },

  // Check payment status
  checkPaymentStatus: async (paymentId) => {
    return await api.get(`/payments/status/${paymentId}/`);
    
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

