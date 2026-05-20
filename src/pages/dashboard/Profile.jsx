import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { EXPERT_APPLICATION_FIELDS, getExpertByOwnerEmail, updateExpertApplication, updateProfile } from '../../data/mockData';
import { Camera, Save, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export const Profile = () => {
  const { user, fetchProfile } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('user'); // 'user' or 'expert'
  
  // User Form State
  const [displayName, setDisplayName] = useState(user.name || '');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(user.image_url || null);
  const [newPassword, setNewPassword] = useState('');

  // Expert Form State
  const [expertProfile, setExpertProfile] = useState(null);
  const [expertForm, setExpertForm] = useState({});

  useEffect(() => {
    const loadExpertData = async () => {
      if (user.role === 'expert') {
        const profile = await getExpertByOwnerEmail(user.email);
        setExpertProfile(profile);
        if (profile) {
          setExpertForm(profile);
        }
      }
    };
    loadExpertData();
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1048576) {
        toast.error('Image must be less than 1MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUserSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Update Password if provided
      if (newPassword) {
        const { error: pwdError } = await supabase.auth.updateUser({ password: newPassword });
        if (pwdError) throw pwdError;
        toast.success('Password updated successfully');
        setNewPassword('');
      }

      // 2. Update Profile Name and Image
      // For simplicity in this prototype, we save the image as a base64 string directly in the database
      const success = await updateProfile(user.id, displayName, imagePreview);
      if (!success) throw new Error('Failed to update profile details');
      
      toast.success('Profile updated successfully');
      
      // Refresh user context
      await fetchProfile({ id: user.id, email: user.email });

    } catch (error) {
      toast.error(error.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleExpertSave = async (e) => {
    e.preventDefault();
    if (!expertProfile) return;
    setLoading(true);
    
    try {
      const updates = { ...expertForm };
      
      // If image is uploaded in expert form, convert it
      if (updates.imageFile && updates.imageFile instanceof File) {
        const reader = new FileReader();
        const imageBase64 = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(updates.imageFile);
        });
        updates.image_url = imageBase64;
        delete updates.imageFile;
      }

      // Ensure we only send fields that exist in our Supabase schema
      const payload = {
        name: updates.name,
        specialization: updates.specialization,
        experience: String(updates.experience),
        fee: Number(updates.fee),
        description: updates.description,
        location: updates.location,
      };
      
      if (updates.image_url) {
        payload.image_url = updates.image_url;
      }

      const success = await updateExpertApplication({ id: expertProfile.id, ...payload });
      if (success) {
        toast.success('Expert profile updated successfully');
      } else {
        throw new Error('Database error');
      }
    } catch (error) {
      toast.error('Error updating expert profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-grow pt-16 bg-surface px-lg py-xl min-h-screen">
      <div className="max-w-3xl mx-auto flex flex-col gap-lg">
        <h1 className="font-h2 text-h2 text-on-surface">Account Settings</h1>
        
        {user.role === 'expert' && (
          <div className="flex gap-4 border-b border-outline-variant mb-4">
            <button
              onClick={() => setActiveTab('user')}
              className={`pb-2 font-label-md px-4 ${activeTab === 'user' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              General Settings
            </button>
            <button
              onClick={() => setActiveTab('expert')}
              className={`pb-2 font-label-md px-4 ${activeTab === 'expert' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              Expert Profile
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === 'user' ? (
            <motion.div
              key="user"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6"
            >
              <form onSubmit={handleUserSave} className="flex flex-col gap-6">
                {/* Photo Upload */}
                <div className="flex flex-col gap-3 items-center sm:items-start">
                  <span className="font-label-md text-on-surface">Profile Photo</span>
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-surface-container overflow-hidden flex items-center justify-center border-2 border-outline-variant relative group">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-8 h-8 text-on-surface-variant" />
                      )}
                      <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Camera className="w-6 h-6 text-white" />
                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                      </label>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-body-sm text-on-surface-variant">Recommended: Square image, max 1MB.</span>
                      {imagePreview && (
                        <button type="button" onClick={() => setImagePreview(null)} className="text-error text-sm text-left hover:underline">Remove Photo</button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="h-px bg-outline-variant w-full" />

                {/* Display Name */}
                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-on-surface">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-outline-variant focus:border-primary outline-none bg-surface-container"
                  />
                </div>

                {/* Email (Read Only) */}
                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-on-surface">Email Address</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-high text-on-surface-variant cursor-not-allowed"
                  />
                  <p className="font-body-sm text-on-surface-variant">Email cannot be changed.</p>
                </div>

                <div className="h-px bg-outline-variant w-full" />

                {/* Change Password */}
                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-on-surface flex items-center gap-2">
                    <Lock className="w-4 h-4" /> Change Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Leave blank to keep current password"
                    className="w-full px-4 py-3 rounded-lg border border-outline-variant focus:border-primary outline-none bg-surface-container"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-4 w-full sm:w-auto px-8 py-3 bg-primary text-on-primary rounded-lg font-label-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="expert"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 md:p-8 shadow-sm"
            >
              {!expertProfile ? (
                <p className="text-on-surface-variant">Loading expert profile...</p>
              ) : (
                <form onSubmit={handleExpertSave} className="flex flex-col gap-6">
                  {EXPERT_APPLICATION_FIELDS.filter(f => f.name !== 'expertEmail' && f.name !== 'expertPassword' && f.name !== 'imageFile').map((field) => (
                    <div key={field.name} className="flex flex-col gap-2">
                      <label className="font-label-md text-on-surface">{field.label}</label>
                      {field.type === 'textarea' ? (
                        <textarea
                          value={expertForm[field.name] || ''}
                          onChange={(e) => setExpertForm({ ...expertForm, [field.name]: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-outline-variant focus:border-primary outline-none bg-surface-container min-h-[100px]"
                        />
                      ) : field.type === 'multiselect' ? (
                        <div className="flex flex-wrap gap-2">
                          {field.options.map((opt) => {
                            const isSelected = (expertForm[field.name] || []).includes(opt.value);
                            return (
                              <button
                                type="button"
                                key={opt.value}
                                onClick={() => {
                                  const current = expertForm[field.name] || [];
                                  if (isSelected) {
                                    setExpertForm({ ...expertForm, [field.name]: current.filter((v) => v !== opt.value) });
                                  } else {
                                    setExpertForm({ ...expertForm, [field.name]: [...current, opt.value] });
                                  }
                                }}
                                className={`px-4 py-2 rounded-full font-label-md text-sm transition-colors border ${
                                  isSelected 
                                    ? 'bg-primary text-on-primary border-primary' 
                                    : 'bg-surface border-outline-variant text-on-surface hover:bg-surface-container'
                                }`}
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <input
                          type={field.type}
                          value={expertForm[field.name] || ''}
                          onChange={(e) => setExpertForm({ ...expertForm, [field.name]: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-outline-variant focus:border-primary outline-none bg-surface-container"
                        />
                      )}
                    </div>
                  ))}

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-4 w-full sm:w-auto px-8 py-3 bg-primary text-on-primary rounded-lg font-label-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    {loading ? 'Saving...' : 'Save Expert Profile'}
                  </button>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
};
