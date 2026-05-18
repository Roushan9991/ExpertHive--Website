import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { saveStudentToSheet } from '../api/sheetsApi';
import { saveUser, findUserByEmail, loadUsers, getExpertByOwnerEmail } from '../data/mockData';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    const storedUser = localStorage.getItem('agriUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    if (email === 'rkmourya999@gmail.com' && password === 'ImAgr!786') {
      const adminUser = {
        id: 'admin_001',
        name: 'Admin',
        email: 'rkmourya999@gmail.com',
        role: 'admin',
      };
      setUser(adminUser);
      localStorage.setItem('agriUser', JSON.stringify(adminUser));
      toast.success('Admin logged in successfully!');
      return true;
    }

    const existingUser = findUserByEmail(email);
    if (!existingUser || existingUser.password !== password) {
      toast.error('Invalid email or password. Please sign up first.');
      return false;
    }

    if (existingUser.role === 'expert') {
      const expertProfile = getExpertByOwnerEmail(existingUser.email);
      if (!expertProfile || expertProfile.status !== 'approved') {
        toast.error('Your expert profile is still pending approval. Please wait for admin approval before logging in.');
        return false;
      }
    }

    setUser(existingUser);
    localStorage.setItem('agriUser', JSON.stringify(existingUser));
    toast.success('Logged in successfully!');
    return true;
  };

  const signup = (name, email, password, role = 'student') => {
    const normalizedEmail = email.toLowerCase();
    const existingUser = findUserByEmail(normalizedEmail);
    if (existingUser) {
      toast.error('An account with this email already exists. Please login.');
      return false;
    }

    const newUser = {
      id: 'user_' + Date.now(),
      name,
      email: normalizedEmail,
      password,
      role,
    };
    saveUser(newUser);
    if (role === 'student') {
      saveStudentToSheet({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        registeredAt: new Date().toISOString(),
        status: 'active',
        lastUpdated: new Date().toISOString(),
      });
    }
    setUser(newUser);
    localStorage.setItem('agriUser', JSON.stringify(newUser));
    toast.success('Account created successfully!');
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('agriUser');
    toast.success('Logged out successfully!');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading, loadUsers }}>
      {children}
    </AuthContext.Provider>
  );
};
