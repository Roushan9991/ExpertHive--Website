import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signup, login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await signup(name, email, password, 'student');
    if (success) {
      if (email.trim().toLowerCase() === 'support@experthive.co.in' || email.trim().toLowerCase() === import.meta.env.VITE_SMTP_EMAIL) {
        toast.success('Welcome Admin!');
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
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
          <h1 className="font-h2 text-h2 text-on-surface">Join the Network</h1>
          <p className="font-body-md text-on-surface-variant">Create an account to book consultations</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="font-label-md text-on-surface" htmlFor="name">Full Name</label>
            <input 
              id="name"
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              className="w-full px-4 py-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body-md text-on-surface bg-surface-container"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-label-md text-on-surface" htmlFor="email">Email Address</label>
            <input 
              id="email"
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="farmer@example.com"
              className="w-full px-4 py-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body-md text-on-surface bg-surface-container"
            />
          </div>

          <div className="flex flex-col gap-2 relative">
            <label className="font-label-md text-on-surface" htmlFor="password">Password</label>
            <div className="relative">
              <input 
                id="password"
                type={showPassword ? "text" : "password"} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className="w-full px-4 py-3 pr-10 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body-md text-on-surface bg-surface-container"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>


          <button 
            type="submit"
            className="w-full py-3 mt-4 rounded-lg font-label-md bg-primary text-on-primary hover:bg-primary-container transition-colors shadow-sm"
          >
            Create Account
          </button>
        </form>



        <p className="text-center font-body-md text-on-surface-variant pt-4 border-t border-outline-variant mt-2">
          Already have an account? <Link to="/login" className="text-primary hover:underline font-bold">Sign in</Link>
        </p>
      </motion.div>
    </main>
  );
};
