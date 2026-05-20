import { supabase } from '../lib/supabase';

// Expert Applications
export const getAllExpertApplications = async () => {
  const { data } = await supabase.from('experts').select('*');
  return data || [];
};

export const saveExpertApplication = async (application) => {
  // Convert application format to Supabase schema
  const expertData = {
    owner_id: (await supabase.auth.getUser()).data.user?.id,
    owner_email: application.expertEmail,
    name: application.name,
    specialization: application.specialization,
    experience: application.experience,
    fee: application.fee,
    description: application.description,
    location: application.location,
    languages: [], // Default empty or map if added
    image_url: application.imageFile || '',
    status: 'pending'
  };
  const { error } = await supabase.from('experts').insert([expertData]);
  if (error) console.error(error);
};

export const deleteExpertApplication = async (expertId) => {
  await supabase.from('experts').update({ status: 'deleted' }).eq('id', expertId);
};

export const updateExpertApplication = async (updatedExpert) => {
  const { error } = await supabase.from('experts').update(updatedExpert).eq('id', updatedExpert.id);
  if (error) {
    console.error(error);
    return false;
  }
  return true;
};

export const getAllExperts = async () => {
  const { data } = await supabase.from('experts').select('*').eq('status', 'approved');
  return data || [];
};

export const getPendingExpertApplications = async () => {
  const { data } = await supabase.from('experts').select('*').eq('status', 'pending');
  return data || [];
};

export const getPlatformStats = async () => {
  try {
    const { count: expertsCount } = await supabase.from('experts').select('*', { count: 'exact', head: true }).eq('status', 'approved');
    const { count: bookingsCount } = await supabase.from('bookings').select('*', { count: 'exact', head: true });
    const { data: expertsData } = await supabase.from('experts').select('rating').eq('status', 'approved');
    
    let avgRating = 0;
    if (expertsData && expertsData.length > 0) {
      const sum = expertsData.reduce((acc, curr) => acc + (Number(curr.rating) || 0), 0);
      avgRating = sum / expertsData.length;
    }
    
    return {
      totalExperts: expertsCount || 0,
      totalConsultations: bookingsCount || 0,
      averageRating: avgRating > 0 ? avgRating.toFixed(1) : '0.0'
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return { totalExperts: 0, totalConsultations: 0, averageRating: '0.0' };
  }
};

export const getExpertApplicationById = async (expertId) => {
  const { data } = await supabase.from('experts').select('*').eq('id', expertId).single();
  return data;
};

export const getExpertById = async (expertId) => {
  const { data } = await supabase.from('experts').select('*').eq('id', expertId).eq('status', 'approved').single();
  return data;
};

export const getExpertByOwnerEmail = async (email) => {
  const { data, error } = await supabase.from('experts').select('*').eq('owner_email', email).single();
  if (error) {
    console.error("Error fetching expert by email:", error);
    return null;
  }
  return data;
};

export const approveExpertApplication = async (expertId) => {
  await supabase.from('experts').update({ status: 'approved' }).eq('id', expertId);
};

export const rejectExpertApplication = async (expertId) => {
  await supabase.from('experts').update({ status: 'rejected' }).eq('id', expertId);
};


// Users
export const findUserByEmail = async (email) => {
  // Note: Only admins or service role can search emails globally in auth.users,
  // so we check the public.profiles table instead.
  const { data } = await supabase.from('profiles').select('*').eq('email', email).single();
  return data;
};

export const deleteUserByEmail = async (email) => {
  console.log('User deletion from frontend disabled for Supabase');
};

// Bookings
export const loadBookings = async () => {
  const { data } = await supabase.from('bookings').select('*');
  return data || [];
};

export const saveBooking = async (booking) => {
  const { error } = await supabase.from('bookings').insert([{
    expert_id: booking.expertId,
    student_id: (await supabase.auth.getUser()).data.user?.id,
    expert_name: booking.expertName,
    expert_email: booking.expertEmail,
    student_name: booking.studentName,
    student_email: booking.studentEmail,
    date: booking.date,
    time: booking.time,
    notes: booking.notes,
    amount: booking.amount,
    status: booking.status,
    zoom_link: booking.zoomLink
  }]);
  if (error) console.error(error);
};

export const updateBooking = async (updatedBooking) => {
  await supabase.from('bookings').update(updatedBooking).eq('id', updatedBooking.id);
};

export const getBookingsByStudent = async (studentEmail) => {
  const { data } = await supabase.from('bookings').select('*').eq('student_email', studentEmail);
  return data || [];
};

export const getBookingsByExpert = async ({ expertId, expertEmail }) => {
  const { data } = await supabase.from('bookings').select('*').eq('expert_email', expertEmail);
  return data || [];
};

export const loadReviews = async () => { return []; };
export const saveReview = async (review) => {};
export const getReviewsByExpert = async (expertId) => { return []; };
export const hasUserReviewedExpert = async (expertId, studentEmail) => { return false; };
export const getExpertRating = async (expertId) => { return { average: 0, count: 0 }; };

// Delete Requests
export const loadDeleteRequests = async () => [];
export const createDeleteRequest = async () => {};
export const getPendingDeleteRequests = async () => [];
export const approveDeleteRequest = async () => {};
export const rejectDeleteRequest = async () => {};
export const getDeleteRequestByExpertId = async () => null;

export const EXPERT_APPLICATION_FIELDS = [
  { name: 'name', label: 'Expert Name', type: 'text', placeholder: 'Dr. Anil Kumar', required: true },
  { name: 'specialization', label: 'Specialization', type: 'text', placeholder: 'Paddy Expert', required: true },
  { name: 'experience', label: 'Experience', type: 'text', placeholder: '10 Years', required: true },
  { name: 'fee', label: 'Consultation Fee (₹)', type: 'number', placeholder: '400', required: true },
  { name: 'imageFile', label: 'Profile Image', type: 'file', accept: 'image/*', required: true },
  { name: 'description', label: 'Profile Description', type: 'textarea', placeholder: 'Expert in farming', required: true },
  { name: 'location', label: 'Location', type: 'text', placeholder: 'Madhya Pradesh, India', required: true },
  { name: 'expertEmail', label: 'Login Email', type: 'email', placeholder: 'you@example.com', required: true },
  { name: 'expertPassword', label: 'Login Password', type: 'password', placeholder: 'Create a password', required: true },
  { name: 'availableSlots', label: 'Available Slots (AM / PM)', type: 'multiselect', options: Array.from({ length: 24 }, (_, i) => ({ value: `${i % 12 || 12}:00 ${i < 12 ? 'AM' : 'PM'}`, label: `${i % 12 || 12}:00 ${i < 12 ? 'AM' : 'PM'}` })), required: true },
];

export const updateProfile = async (id, name, imageUrl) => {
  try {
    const updates = { name };
    if (imageUrl) updates.image_url = imageUrl;
    
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error("Error updating profile:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error updating profile:", error);
    return false;
  }
};

