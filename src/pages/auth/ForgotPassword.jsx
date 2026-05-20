import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Password reset link sent to your email');
        setSent(true);
      } else {
        toast.error(data.error || 'Failed to send reset link');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-grow pt-16 flex items-center justify-center min-h-[calc(100vh-64px)] bg-surface-container-high px-lg py-xl">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-surface-container-lowest p-8 rounded-2xl shadow-md border border-outline-variant flex flex-col gap-6"
      >
        <div className="flex flex-col gap-2 text-center">
          <h1 className="font-h2 text-h2 text-on-surface">Reset Password</h1>
          <p className="font-body-md text-on-surface-variant">Enter your email to receive a password reset link.</p>
        </div>

        {sent ? (
          <div className="bg-success-container text-on-success-container p-4 rounded-xl flex flex-col gap-2 text-center font-body-md">
            Check your email! A password reset link has been sent to {email}.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-label-md text-on-surface" htmlFor="email">Email Address</label>
              <input 
                id="email"
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="me@gmail.com"
                className="w-full px-4 py-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body-md text-on-surface bg-surface-container"
              />
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 mt-4 rounded-lg font-label-md transition-colors shadow-sm ${isLoading ? 'bg-surface-variant text-on-surface-variant cursor-not-allowed' : 'bg-primary text-on-primary hover:bg-primary-container'}`}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <p className="text-center font-body-md text-on-surface-variant pt-4 border-t border-outline-variant">
          Remember your password? <Link to="/login" className="text-primary hover:underline font-bold">Sign in</Link>
        </p>
      </motion.div>
    </main>
  );
};
