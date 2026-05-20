import React, { useState } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export const PaymentModal = ({ bookingDetails, onClose, onSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePay = async () => {
    setIsProcessing(true);
    
    try {
      // 1. Create order on backend
      const res = await fetch('/api/payment/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: bookingDetails.expert.fee })
      });
      const order = await res.json();

      if (!order || !order.id) {
        throw new Error(order?.error || 'Failed to create order');
      }

      // 2. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'ExpertHive',
        description: `Consultation with ${bookingDetails.expert.name}`,
        order_id: order.id,
        handler: async function (response) {
          // 3. Verify payment on backend
          try {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            const verifyData = await verifyRes.json();
            
            if (verifyData.success) {
              toast.success('Payment successful!');
              onSuccess();
            } else {
              toast.error('Payment verification failed.');
            }
          } catch (err) {
            toast.error('Payment verification failed.');
          }
        },
        prefill: {
          name: bookingDetails.studentName || 'Student',
          email: bookingDetails.studentEmail || 'student@example.com',
        },
        theme: {
          color: '#1a5d20' // Using primary color
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        toast.error('Payment failed: ' + response.error.description);
      });
      rzp.open();

    } catch (error) {
      console.error('Payment initiation error:', error);
      toast.error(error.message || 'Error initiating payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-outline-variant"
      >
        <div className="bg-primary p-6 text-on-primary flex flex-col gap-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-primary-container rounded-full opacity-50 blur-xl"></div>
          <div className="flex justify-between items-start relative z-10">
            <div className="flex flex-col">
              <span className="font-caption text-primary-fixed-dim uppercase tracking-wider">ExpertHive Connect</span>
              <span className="font-h3 mt-1">₹{bookingDetails?.expert?.fee || 0}</span>
            </div>
            <button onClick={!isProcessing ? onClose : undefined} className="p-1 hover:bg-primary-container rounded-full transition-colors opacity-80 hover:opacity-100">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="text-primary-fixed-dim font-caption flex items-center gap-1 mt-2 relative z-10">
            <ShieldCheck className="w-4 h-4" /> Secured by Razorpay
          </div>
        </div>

        <div className="p-6 flex flex-col gap-6">
          <p className="font-body-md text-on-surface-variant">
            You are about to book a consultation with <strong>{bookingDetails?.expert?.name}</strong> for ₹{bookingDetails?.expert?.fee || 0}.
          </p>

          <button 
            onClick={handlePay}
            disabled={isProcessing}
            className={`w-full py-3 rounded-lg font-label-md shadow-sm transition-all flex items-center justify-center gap-2 ${
              isProcessing 
                ? 'bg-surface-variant text-on-surface-variant cursor-not-allowed' 
                : 'bg-primary text-on-primary hover:bg-primary-container'
            }`}
          >
            {isProcessing ? 'Processing...' : `Pay ₹${bookingDetails?.expert?.fee || 0}`}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
