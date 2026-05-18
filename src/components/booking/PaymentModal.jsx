import React, { useState } from 'react';
import { X, ShieldCheck, CreditCard, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export const PaymentModal = ({ bookingDetails, onClose, onSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('upi');

  const handlePay = () => {
    setIsProcessing(true);
    
    // Simulate payment processing delay
    setTimeout(() => {
      setIsProcessing(false);
      toast.success('Payment successful!');
      onSuccess();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-outline-variant"
      >
        {/* Header mimicking a payment gateway */}
        <div className="bg-primary p-6 text-on-primary flex flex-col gap-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-primary-container rounded-full opacity-50 blur-xl"></div>
          <div className="flex justify-between items-start relative z-10">
            <div className="flex flex-col">
              <span className="font-caption text-primary-fixed-dim uppercase tracking-wider">AgriExpert Connect</span>
              <span className="font-h3 mt-1">₹{bookingDetails?.expert?.fee || 0}</span>
            </div>
            <button onClick={!isProcessing ? onClose : undefined} className="p-1 hover:bg-primary-container rounded-full transition-colors opacity-80 hover:opacity-100">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="text-primary-fixed-dim font-caption flex items-center gap-1 mt-2 relative z-10">
            <ShieldCheck className="w-4 h-4" /> Secured by MockPay
          </div>
        </div>

        <div className="p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h4 className="font-label-md text-on-surface">Select Payment Method</h4>
            
            <button 
              onClick={() => setPaymentMethod('upi')}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                paymentMethod === 'upi' ? 'border-primary bg-primary-fixed/20' : 'border-outline-variant hover:border-primary/50'
              }`}
            >
              <Smartphone className={`w-5 h-5 ${paymentMethod === 'upi' ? 'text-primary' : 'text-on-surface-variant'}`} />
              <div className="flex flex-col items-start">
                <span className="font-label-md text-on-surface">UPI Options</span>
                <span className="font-caption text-on-surface-variant">Google Pay, PhonePe, Paytm</span>
              </div>
            </button>

            <button 
              onClick={() => setPaymentMethod('card')}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                paymentMethod === 'card' ? 'border-primary bg-primary-fixed/20' : 'border-outline-variant hover:border-primary/50'
              }`}
            >
              <CreditCard className={`w-5 h-5 ${paymentMethod === 'card' ? 'text-primary' : 'text-on-surface-variant'}`} />
              <div className="flex flex-col items-start">
                <span className="font-label-md text-on-surface">Cards</span>
                <span className="font-caption text-on-surface-variant">Credit or Debit Card</span>
              </div>
            </button>
          </div>

          {/* Note to show it's mock */}
          <div className="bg-secondary-container text-on-secondary-container p-3 rounded-lg font-caption">
            <strong>Note:</strong> This is a mock payment gateway. No real money will be deducted. Click "Pay Now" to simulate a successful transaction.
          </div>

          <button 
            onClick={handlePay}
            disabled={isProcessing}
            className={`w-full py-3 rounded-lg font-label-md shadow-sm transition-all flex items-center justify-center gap-2 ${
              isProcessing 
                ? 'bg-surface-variant text-on-surface-variant cursor-not-allowed' 
                : 'bg-primary text-on-primary hover:bg-primary-container'
            }`}
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing Payment...
              </>
            ) : (
              `Pay ₹${bookingDetails?.expert?.fee || 0}`
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
