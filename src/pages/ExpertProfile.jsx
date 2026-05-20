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
} from '../data/mockData';
import { BookingModal } from '../components/booking/BookingModal';
import { PaymentModal } from '../components/booking/PaymentModal';
import { ArrowLeft, Star, MapPin, Briefcase, MessageCircle } from 'lucide-react';
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
    if (bookingDetails && user) {
      toast.loading('Finalizing booking...', { id: 'booking-flow' });
      const expertEmail = bookingDetails.expert.expertEmail || bookingDetails.expert.ownerEmail || bookingDetails.expert.email;
      let zoomLink = `https://zoom.us/j/${Date.now()}`;

      try {
        let isoTime = new Date().toISOString();
        if (bookingDetails.date && bookingDetails.time) {
           const timePart = bookingDetails.time.split(' ')[0]; // assuming "10:00 AM"
           isoTime = new Date(`${bookingDetails.date}T${timePart}:00`).toISOString();
        }
        
        const zoomRes = await fetch('/api/zoom/meeting', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: `Consultation: ${user.name} and ${bookingDetails.expert.name}`,
            startTime: isoTime,
            duration: 60
          })
        });
        const zoomData = await zoomRes.json();
        if (zoomData.joinUrl) zoomLink = zoomData.joinUrl;
      } catch (err) {
        console.error('Zoom link generation failed, using mock link.');
      }
      
      try {
        await fetch('/api/email/zoom', {
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
        toast.success('Consultation booked and emails sent!', { id: 'booking-flow' });
      } catch (err) {
        toast.error('Consultation booked but email sending failed.', { id: 'booking-flow' });
      }

      const booking = {
        id: `booking_${Date.now()}`,
        expertId: bookingDetails.expert.id,
        expertName: bookingDetails.expert.name,
        expertEmail,
        studentEmail: user.email,
        studentName: user.name,
        date: bookingDetails.date,
        time: bookingDetails.time,
        notes: bookingDetails.notes,
        amount: bookingDetails.expert.fee,
        status: 'Upcoming',
        zoomLink,
      };
      await saveBooking(booking);
    }

    setBookingDetails(null);
    navigate('/dashboard');
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
          <Link to="/experts" className="font-label-md text-primary hover:underline flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to experts
          </Link>
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
                  <p className="font-h3 text-h3">₹{expert.fee}</p>
                </div>
                <div className="bg-surface-container p-4 rounded-3xl border border-outline-variant">
                  <span className="font-caption text-on-surface-variant">Rating</span>
                  <p className="font-h3 text-h3 flex items-center gap-2"><Star className="w-5 h-5 fill-current text-primary" /> {ratingInfo.average || 0}/5</p>
                </div>
                <div className="bg-surface-container p-4 rounded-3xl border border-outline-variant">
                  <span className="font-caption text-on-surface-variant">Reviews</span>
                  <p className="font-h3 text-h3">{ratingInfo.count} total</p>
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
