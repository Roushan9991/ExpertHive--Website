import React, { useState } from 'react';
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getExpertById,
  getExpertRating,
  getReviewsByExpert,
  saveReview,
  saveBooking,
  hasUserReviewedExpert,
  deleteExpertApplication,
  updateExpertApplication,
} from '../data/mockData';
import { updateExpertInSheet, updateExpertStatusInSheet } from '../api/sheetsApi';
import { BookingModal } from '../components/booking/BookingModal';
import { PaymentModal } from '../components/booking/PaymentModal';
import { ArrowLeft, Star, MapPin, Briefcase, MessageCircle, Trash2, Edit, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export const ExpertProfile = () => {
  const { expertId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [expert, setExpert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ratingInfo, setRatingInfo] = useState({ average: 0, count: 0 });
  const [reviews, setReviews] = useState([]);

  React.useEffect(() => {
    const fetchExpert = async () => {
      const data = await getExpertById(expertId);
      setExpert(data);
      setLoading(false);
    };
    fetchExpert();
  }, [expertId]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(null);

  // Admin Editing States
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    specialization: '',
    experience: '',
    fee: 0,
    description: '',
    location: '',
    availableSlots: [],
  });

  React.useEffect(() => {
    if (expert) {
      setEditForm({
        name: expert.name || '',
        specialization: expert.specialization || '',
        experience: expert.experience || '',
        fee: expert.fee || 0,
        description: expert.description || '',
        location: expert.location || '',
        availableSlots: expert.availableSlots || expert.available_slots || [],
      });
    }
  }, [expert]);

  const handleDeleteProfile = async () => {
    if (window.confirm('Are you sure you want to delete this expert profile? This will change their status to deleted.')) {
      try {
        toast.loading('Deleting expert profile...', { id: 'admin-action' });
        await deleteExpertApplication(expert.id);
        
        await updateExpertStatusInSheet(expert.id, {
          status: 'deleted',
          deletedAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        });

        toast.success('Expert profile deleted successfully!', { id: 'admin-action' });
        navigate('/experts');
      } catch (err) {
        console.error(err);
        toast.error('Failed to delete expert profile.', { id: 'admin-action' });
      }
    }
  };

  const handleSaveEdits = async (e) => {
    e.preventDefault();
    try {
      toast.loading('Saving changes...', { id: 'admin-action' });
      
      const updatedData = {
        id: expert.id,
        name: editForm.name,
        specialization: editForm.specialization,
        experience: String(editForm.experience),
        fee: Number(editForm.fee),
        description: editForm.description,
        location: editForm.location,
        available_slots: editForm.availableSlots,
        availableSlots: editForm.availableSlots,
      };

      const success = await updateExpertApplication(updatedData);
      if (!success) throw new Error('Supabase save failed');

      await updateExpertInSheet({
        ...expert,
        ...updatedData,
        lastUpdated: new Date().toISOString(),
      });

      setExpert((prev) => ({
        ...prev,
        ...updatedData,
      }));

      setIsEditing(false);
      toast.success('Expert profile updated successfully!', { id: 'admin-action' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to update profile.', { id: 'admin-action' });
    }
  };

  const handleSlotToggle = (slot) => {
    setEditForm((prev) => {
      const hasSlot = prev.availableSlots.includes(slot);
      return {
        ...prev,
        availableSlots: hasSlot
          ? prev.availableSlots.filter((item) => item !== slot)
          : [...prev.availableSlots, slot],
      };
    });
  };

  const handleBookClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role === 'expert') {
      toast.error('Expert accounts cannot book consultations. Please use a student account to book.');
      return;
    }

    setSelectedExpert(expert);
  };

  const handleProceedToPayment = (details) => {
    setBookingDetails(details);
    setSelectedExpert(null);
  };

  const handlePaymentSuccess = async () => {
    console.log('>>> handlePaymentSuccess TRIGGERED!');
    console.log('>>> bookingDetails:', bookingDetails);
    console.log('>>> user:', user);

    if (bookingDetails && user) {
      console.log('>>> Passed the if condition. Starting zoom fetch...');
      toast.loading('Finalizing booking...', { id: 'booking-flow' });
      const expertEmail = bookingDetails.expert.expertEmail || bookingDetails.expert.owner_email || bookingDetails.expert.ownerEmail || bookingDetails.expert.email;
      let zoomLink = `https://zoom.us/j/${Date.now()}`;

      try {
        let isoTime = new Date().toISOString();
        if (bookingDetails.date && bookingDetails.time) {
           let timePart = bookingDetails.time.split(' ')[0]; // "9:00"
           if (timePart.length === 4) timePart = '0' + timePart; // pad "9:00" to "09:00"
           isoTime = new Date(`${bookingDetails.date}T${timePart}:00`).toISOString();
        }
        
        console.log('>>> Calling /api/zoom/meeting...');
        const zoomRes = await fetch('/api/zoom/meeting', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: `Consultation: ${user.name} and ${bookingDetails.expert.name}`,
            startTime: isoTime,
            duration: 60
          })
        });
        
        console.log('>>> Zoom response status:', zoomRes.status);
        if (!zoomRes.ok) throw new Error(`Zoom API returned ${zoomRes.status}`);
        const zoomData = await zoomRes.json();
        if (zoomData.joinUrl) zoomLink = zoomData.joinUrl;
      } catch (err) {
        console.error('>>> Zoom link generation failed:', err);
        toast.error('Warning: Could not connect to Zoom. Using backup link.', { id: 'booking-flow' });
      }
      
      try {
        console.log('>>> Calling /api/email/zoom...');
        const emailRes = await fetch('/api/email/zoom', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentEmail: user.email,
            expertEmail: expertEmail,
            zoomLink,
            studentName: user.name,
            expertName: bookingDetails.expert.name,
            date: bookingDetails.date,
            time: bookingDetails.time
          })
        });
        
        console.log('>>> Email response status:', emailRes.status);
        if (!emailRes.ok) throw new Error(`Email API returned ${emailRes.status}`);
        toast.success('Consultation booked and emails sent!', { id: 'booking-flow' });
      } catch (err) {
        console.error('>>> Email sending failed:', err);
        toast.error('Consultation booked but email sending failed. Check Vercel logs.', { id: 'booking-flow' });
      }

      console.log('>>> Saving booking to database...');
      const booking = {
        id: `booking_${Date.now()}`,
        expertId: bookingDetails.expert.owner_id || bookingDetails.expert.id,
        expertName: bookingDetails.expert.name,
        expertEmail,
        studentEmail: user.email,
        studentName: user.name,
        date: bookingDetails.date,
        time: bookingDetails.time,
        notes: bookingDetails.notes || '',
        amount: bookingDetails.expert.fee,
        status: 'Upcoming',
        zoomLink
      };
      
      await saveBooking(booking);
      console.log('>>> Database save finished. Closing modal.');
      setBookingDetails(null);
      toast.success('Consultation successfully booked!', { id: 'booking-flow' });
      navigate('/dashboard');
    } else {
      console.error('>>> MISSING DATA! bookingDetails or user is null!');
    }
  };


  if (loading) {
    return <div className="pt-32 text-center text-on-surface">Loading expert profile...</div>;
  }

  if (!expert && !loading) {
    return <Navigate to="/experts" replace />;
  }

  const alreadyReviewed = user?.role === 'student' && hasUserReviewedExpert(expert.id, user.email);

  const handleSubmitReview = (event) => {
    event.preventDefault();
    if (!user) {
      toast.error('Please login to submit your review.');
      return;
    }
    if (user.role !== 'student') {
      toast.error('Only student accounts can leave reviews.');
      return;
    }
    if (alreadyReviewed) {
      toast.error('You have already submitted a review for this expert.');
      return;
    }
    if (!comment.trim()) {
      toast.error('Please enter your experience.');
      return;
    }

    const review = {
      id: `review_${Date.now()}`,
      expertId: expert.id,
      expertName: expert.name,
      studentEmail: user.email,
      studentName: user.name,
      rating,
      comment: comment.trim(),
      date: new Date().toISOString(),
    };

    saveReview(review);
    toast.success('Review submitted successfully!');
    setComment('');
    setRating(5);
  };

  return (
    <main className="flex-grow pt-16 bg-surface px-lg py-xl min-h-screen">
      <div className="max-w-container-max mx-auto flex flex-col gap-xl">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
            <Link to="/experts" className="font-label-md text-primary hover:underline flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to experts
            </Link>
            {user?.role === 'admin' && (
              <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-label-sm text-emerald-800 font-semibold">Logged in as Admin</span>
              </div>
            )}
          </div>

          {/* Admin Controls Panel */}
          {user?.role === 'admin' && !isEditing && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg flex flex-wrap items-center justify-between gap-4 text-white mb-4"
            >
              <div className="flex flex-col gap-1">
                <h3 className="font-h3 text-lg font-bold flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400 fill-current" /> Admin Control Center
                </h3>
                <p className="text-slate-300 text-sm">Directly manage this expert profile's status or detailed fields.</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold font-label-md px-5 py-2.5 rounded-2xl transition flex items-center gap-2 animate-hover"
                >
                  <Edit className="w-4 h-4" /> Edit Profile
                </button>
                <button
                  onClick={handleDeleteProfile}
                  className="bg-rose-500 hover:bg-rose-600 text-white font-semibold font-label-md px-5 py-2.5 rounded-2xl transition flex items-center gap-2 animate-hover"
                >
                  <Trash2 className="w-4 h-4" /> Delete Profile
                </button>
              </div>
            </motion.div>
          )}

          {isEditing ? (
            /* ELEGANT ADMIN DIRECT EDIT FORM */
            <motion.form 
              onSubmit={handleSaveEdits}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 md:p-8 shadow-md flex flex-col gap-6"
            >
              <div className="flex items-center justify-between border-b border-outline-variant pb-4">
                <h2 className="font-h3 text-h3 text-on-surface">Edit Expert Profile (Admin Mode)</h2>
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)} 
                  className="p-2 hover:bg-surface-container rounded-full text-on-surface-variant hover:text-on-surface transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-on-surface">Expert Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary outline-none bg-surface-container text-on-surface"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-on-surface">Specialization</label>
                  <input
                    type="text"
                    value={editForm.specialization}
                    onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary outline-none bg-surface-container text-on-surface"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-on-surface">Experience</label>
                  <input
                    type="text"
                    value={editForm.experience}
                    onChange={(e) => setEditForm({ ...editForm, experience: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary outline-none bg-surface-container text-on-surface"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-on-surface">Consultation Fee (₹)</label>
                  <input
                    type="number"
                    value={editForm.fee}
                    onChange={(e) => setEditForm({ ...editForm, fee: Number(e.target.value) })}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary outline-none bg-surface-container text-on-surface"
                  />
                </div>

                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="font-label-md text-on-surface">Location</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary outline-none bg-surface-container text-on-surface"
                  />
                </div>

                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="font-label-md text-on-surface">Profile Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary outline-none bg-surface-container min-h-[140px] text-on-surface"
                  />
                </div>

                <div className="md:col-span-2 flex flex-col gap-3">
                  <label className="font-label-md text-on-surface">Select Available Slots</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-56 overflow-y-auto rounded-2xl border border-outline-variant bg-surface-container p-4">
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i % 12 || 12;
                      const ampm = i < 12 ? 'AM' : 'PM';
                      const value = `${hour}:00 ${ampm}`;
                      const isChecked = editForm.availableSlots.includes(value);
                      return (
                        <label key={value} className="flex items-center gap-2 text-body-sm text-on-surface cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleSlotToggle(value)}
                            className="rounded border-outline-variant text-primary focus:ring-primary h-4 w-4"
                          />
                          {value}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-outline-variant mt-4">
                <button
                  type="submit"
                  className="bg-primary hover:opacity-90 text-on-primary font-semibold font-label-md px-6 py-3 rounded-xl transition flex items-center gap-2"
                >
                  <Save className="w-5 h-5" /> Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold font-label-md px-6 py-3 rounded-xl transition"
                >
                  Cancel
                </button>
              </div>
            </motion.form>
          ) : (
            /* NORMAL DETAILED PROFILE CARD */
            <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-xl shadow-sm flex flex-col lg:flex-row gap-xl">
              <img src={expert.image_url} alt={expert.name} className="w-full lg:w-72 h-72 rounded-3xl object-cover border border-outline-variant" />
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <h1 className="font-h2 text-h2 text-on-surface">{expert.name}</h1>
                  <p className="font-label-lg text-label-lg text-primary">{expert.specialization}</p>
                  <div className="flex flex-wrap items-center gap-3 text-on-surface-variant font-caption">
                    <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {expert.location}</span>
                    <span className="flex items-center gap-2"><Briefcase className="w-4 h-4" /> {expert.experience} experience</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-surface-container p-4 rounded-3xl border border-outline-variant">
                    <span className="font-caption text-on-surface-variant">Fee</span>
                    <p className="font-h3 text-h3 text-on-surface">₹{expert.fee}</p>
                  </div>
                  <div className="bg-surface-container p-4 rounded-3xl border border-outline-variant">
                    <span className="font-caption text-on-surface-variant">Rating</span>
                    <p className="font-h3 text-h3 flex items-center gap-2 text-on-surface"><Star className="w-5 h-5 fill-current text-primary" /> {ratingInfo.average || 0}/5</p>
                  </div>
                  <div className="bg-surface-container p-4 rounded-3xl border border-outline-variant">
                    <span className="font-caption text-on-surface-variant">Reviews</span>
                    <p className="font-h3 text-h3 text-on-surface">{ratingInfo.count} total</p>
                  </div>
                </div>

                <div className="bg-surface p-6 rounded-3xl border border-outline-variant">
                  <h2 className="font-h3 text-h3 text-on-surface">About this expert</h2>
                  <p className="font-body-md text-on-surface-variant leading-7">{expert.description}</p>
                </div>

                <div className="bg-surface p-6 rounded-3xl border border-outline-variant flex flex-col gap-4">
                  <div>
                    <h2 className="font-h3 text-h3 text-on-surface flex items-center gap-2"><MessageCircle className="w-5 h-5" /> Available slots</h2>
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {(expert.availableSlots || expert.available_slots)?.length ? (expert.availableSlots || expert.available_slots).map((slot) => (
                        <span key={slot} className="font-label-sm text-on-surface bg-surface-container-lowest border border-outline-variant rounded-full px-3 py-2 text-center">{slot}</span>
                      )) : (
                        <span className="font-body-md text-on-surface-variant">No slots available yet.</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleBookClick}
                    className="w-full py-3 rounded-3xl bg-primary text-on-primary font-label-md hover:bg-primary-container transition-colors"
                  >
                    Book Slot
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-xl shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-h3 text-h3">Reviews</h2>
                  <p className="font-body-sm text-on-surface-variant">See learner feedback and experiences.</p>
                </div>
              </div>

              {reviews.length > 0 ? (
                <div className="mt-6 flex flex-col gap-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-surface p-5 rounded-3xl border border-outline-variant">
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <div>
                          <p className="font-label-md text-on-surface font-semibold">{review.studentName}</p>
                          <p className="font-caption text-on-surface-variant">{new Date(review.date).toLocaleDateString()}</p>
                        </div>
                        <span className="font-label-md text-primary">{review.rating} / 5</span>
                      </div>
                      <p className="font-body-md text-on-surface-variant leading-7">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-3xl border border-dashed border-outline-variant p-8 text-center text-on-surface-variant">
                  No reviews yet for this expert. Be the first student to leave feedback.
                </div>
              )}
            </div>
          </div>

          <aside className="flex flex-col gap-6">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-xl shadow-sm">
              <h2 className="font-h3 text-h3">Share your rating</h2>
              <p className="font-body-sm text-on-surface-variant">Only students can leave a rating for this expert.</p>
              {!user ? (
                <Link to="/login" className="block mt-6 font-label-md text-primary hover:underline">Login to leave a review</Link>
              ) : user.role !== 'student' ? (
                <p className="mt-6 font-body-md text-on-surface-variant">Expert accounts cannot leave reviews here.</p>
              ) : alreadyReviewed ? (
                <p className="mt-6 font-body-md text-on-surface-variant">You have already reviewed this expert.</p>
              ) : (
                <form onSubmit={handleSubmitReview} className="flex flex-col gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`rounded-full p-2 ${rating >= star ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'}`}
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    placeholder="Write your experience..."
                    className="w-full min-h-[140px] rounded-3xl border border-outline-variant bg-surface px-4 py-3 text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                  <button type="submit" className="w-full py-3 rounded-3xl bg-primary text-on-primary font-label-md hover:bg-primary-container transition-colors">
                    Submit Review
                  </button>
                </form>
              )}
            </div>
          </aside>
        </div>
      </div>

      <AnimatePresence>
        {selectedExpert && (
          <BookingModal
            expert={selectedExpert}
            onClose={() => setSelectedExpert(null)}
            onProceedToPayment={handleProceedToPayment}
          />
        )}
        {bookingDetails && (
          <PaymentModal
            bookingDetails={bookingDetails}
            onClose={() => setBookingDetails(null)}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </AnimatePresence>
    </main>
  );
};
