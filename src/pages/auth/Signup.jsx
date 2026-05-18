import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

export const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (signup(name, email, password, 'student')) {
      navigate('/dashboard');
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

          <div className="flex flex-col gap-2">
            <label className="font-label-md text-on-surface" htmlFor="password">Password</label>
            <input 
              id="password"
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              className="w-full px-4 py-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body-md text-on-surface bg-surface-container"
            />
          </div>


          <button 
            type="submit"
            className="w-full py-3 mt-4 rounded-lg font-label-md bg-primary text-on-primary hover:bg-primary-container transition-colors shadow-sm"
          >
            Create Account
          </button>
        </form>

        <p className="text-center font-body-md text-on-surface-variant pt-4 border-t border-outline-variant">
          Already have an account? <Link to="/login" className="text-primary hover:underline font-bold">Sign in</Link>
        </p>
      </motion.div>
    </main>
  );
};
