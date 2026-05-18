import React, { useState, useMemo } from 'react';
import { SearchBar } from '../components/experts/SearchBar';
import { ExpertCard } from '../components/experts/ExpertCard';
import { BookingModal } from '../components/booking/BookingModal';
import { PaymentModal } from '../components/booking/PaymentModal';
import { getAllExperts, saveBooking, getExpertRating } from '../data/mockData';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';


export const FindExperts = () => {
  const [problemStatement, setProblemStatement] = useState('');
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [savedExperts] = useState(() => getAllExperts());

  const { user } = useAuth();
  const navigate = useNavigate();

  const allExperts = useMemo(() => savedExperts, [savedExperts]);

  // Simple NLP: extract keywords from problem statement
  function extractKeywords(text) {
    if (!text) return [];
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2 && !['the','and','for','with','you','are','but','can','all','any','has','have','this','that','from','your','need','help','want','who','how','why','what','when','where','which','their','them','his','her','she','him','our','out','use','was','get','got','had','did','not','too','its','its','let','let','may','new','old','job','work','task','project','intern','internship','academic','problem','issue','query','question','about','like','just','more','now','one','two','three','four','five','six','seven','eight','nine','ten'].includes(word));
  }

  // Score expert by keyword match
  function scoreExpert(expert, keywords) {
    let score = 0;
    const fields = [expert.specialization, expert.description, expert.name];
    for (const kw of keywords) {
      for (const field of fields) {
        if (field && field.toLowerCase().includes(kw)) score++;
      }
    }
    return score;
  }

  const filteredExperts = useMemo(() => {
    let experts = allExperts;
    const keywords = extractKeywords(problemStatement);

    // If problem statement is provided, filter and rank by NLP match
    if (keywords.length > 0) {
      experts = experts
        .map(expert => ({
          ...expert,
          _nlpScore: scoreExpert(expert, keywords)
        }))
        .filter(expert => expert._nlpScore > 0);
    }

    // Sort by NLP score (if present), then by experience (highest first)
    experts = experts.sort((a, b) => {
      if (b._nlpScore !== (a._nlpScore || 0)) {
        return (b._nlpScore || 0) - (a._nlpScore || 0);
      }
      // Parse experience as number of years
      const getYears = exp => {
        if (!exp) return 0;
        const match = exp.match(/(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      };
      return getYears(b.experience) - getYears(a.experience);
    });

    return experts;
  }, [allExperts, problemStatement]);

  const handleBookClick = (expert) => {
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

  const handlePaymentSuccess = () => {
    if (bookingDetails && user) {
      const booking = {
        id: `booking_${Date.now()}`,
        expertId: bookingDetails.expert.id,
        expertName: bookingDetails.expert.name,
        expertEmail: bookingDetails.expert.expertEmail || bookingDetails.expert.ownerEmail || bookingDetails.expert.email,
        studentEmail: user.email,
        studentName: user.name,
        date: bookingDetails.date,
        time: bookingDetails.time,
        notes: bookingDetails.notes,
        amount: bookingDetails.expert.fee,
        status: 'Upcoming',
        zoomLink: `https://zoom.us/j/${Date.now()}`,
      };
      saveBooking(booking);
    }

    setBookingDetails(null);
    navigate('/dashboard');
  };

  return (
    <main className="flex-grow pt-16 bg-surface px-lg py-xl">
      <div className="max-w-container-max mx-auto flex flex-col gap-xl">
        <div className="flex flex-col gap-md text-center max-w-3xl mx-auto">
          <h1 className="font-h1 text-h1 text-on-surface">Find the Right Expert for Your Project</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Browse our network of verified agricultural specialists and book a 1-on-1 video consultation to get tailored advice.</p>
        </div>

        <SearchBar 
          problemStatement={problemStatement}
          setProblemStatement={setProblemStatement}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter mt-8">
          <AnimatePresence>
            {filteredExperts.map(expert => {
              const ratingInfo = getExpertRating(expert.id);
              return (
                <motion.div
                  key={expert.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  layout
                >
                  <ExpertCard 
                    expert={expert}
                    onBook={handleBookClick}
                    rating={ratingInfo.average || expert.rating}
                    reviewCount={ratingInfo.count || expert.reviews}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
          {filteredExperts.length === 0 && (
            <div className="col-span-full py-xl text-center flex flex-col items-center justify-center gap-4 text-on-surface-variant">
              <span className="font-h3 text-h3">No experts found</span>
              <p className="font-body-md">Try adjusting your search terms or filters.</p>
            </div>
          )}
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
