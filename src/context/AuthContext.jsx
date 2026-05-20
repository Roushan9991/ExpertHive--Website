import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { getExpertByOwnerEmail } from '../data/mockData';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session on mount
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await fetchProfile(session.user);
      } else {
        setLoading(false);
      }
    };
    // Parse URL hash for OAuth errors (like our custom Postgres trigger error)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    if (hashParams.get('error_description')) {
      const errorMsg = decodeURIComponent(hashParams.get('error_description').replace(/\+/g, ' '));
      // Supabase hides custom trigger messages and returns this generic error instead
      if (errorMsg.includes('sign up with your email') || errorMsg.includes('Database error saving new user')) {
        toast.error('Google Login Failed: You must sign up with an email and password first.');
      } else {
        toast.error(`Authentication Error: ${errorMsg}`);
      }
      // Clean up the URL hash so the error doesn't show again on refresh
      window.history.replaceState(null, '', window.location.pathname);
    }

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        await fetchProfile(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (authUser) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      }

      // If user is expert, ensure they are approved before allowing login access
      // (Optional: handle this on the route level, but we do it here to mirror mockData logic)
      if (profile && profile.role === 'expert') {
        const expertProfile = await getExpertByOwnerEmail(profile.email);
        if (!expertProfile || expertProfile.status !== 'approved') {
          // Allow login but they are restricted (they can see their status in dashboard)
        }
      }

      if (profile) {
        if (profile.email.trim().toLowerCase() === 'support@experthive.co.in' || profile.email.trim().toLowerCase() === import.meta.env.VITE_SMTP_EMAIL) {
          profile.role = 'admin';
        }
        setUser({ ...authUser, ...profile });
      } else {
        // Fallback if profile trigger failed
        const fallbackRole = (authUser.email.trim().toLowerCase() === 'support@experthive.co.in' || authUser.email.trim().toLowerCase() === import.meta.env.VITE_SMTP_EMAIL) 
          ? 'admin' 
          : (authUser.user_metadata?.role || 'student');
          
        setUser({ 
          id: authUser.id, 
          email: authUser.email, 
          name: authUser.user_metadata?.full_name || authUser.email,
          role: fallbackRole
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message || 'Invalid email or password.');
      return false;
    }
    toast.success('Logged in successfully!');
    return true;
  };

  const signup = async (name, email, password, role = 'student', autoLogin = true) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role: role
        }
      }
    });

    if (error) {
      toast.error(error.message || 'Error signing up.');
      return false;
    }
    
    if (!autoLogin) {
      await supabase.auth.signOut();
      setUser(null);
    } else {
      toast.success('Account created successfully!');
    }
    return true;
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out of Supabase:", error);
    } finally {
      setUser(null);
      toast.success('Logged out successfully!');
      // Force redirect to clear any stuck states
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, fetchProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
