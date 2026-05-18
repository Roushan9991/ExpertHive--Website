import React, { useState } from 'react';
import { X, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export const BookingModal = ({ expert, onClose, onProceedToPayment }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [notes, setNotes] = useState('');

  const handleProceed = () => {
    if (!selectedDate || !selectedSlot) {
      toast.error('Please select a date and a slot.');
      return;
    }
    onProceedToPayment({
      expert,
      date: selectedDate,
      time: selectedSlot,
      notes
    });
  };

  // Generate some mock dates starting from tomorrow
  const mockDates = Array.from({ length: 5 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d.toISOString().split('T')[0];
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-xl flex flex-col overflow-hidden"
      >
        <div className="flex justify-between items-center p-6 border-b border-outline-variant bg-surface-container-low">
          <h2 className="font-h3 text-h3 text-on-surface">Book Consultation</h2>
          <button onClick={onClose} className="p-2 hover:bg-surface-variant rounded-full transition-colors">
            <X className="w-5 h-5 text-on-surface-variant" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6 overflow-y-auto max-h-[70vh]">
          {/* Expert Summary */}
          <div className="flex items-center gap-4 bg-surface-container p-4 rounded-xl">
            <img src={expert.imageUrl} alt={expert.name} className="w-12 h-12 rounded-full object-cover" />
            <div>
              <h4 className="font-label-md font-bold text-on-surface">{expert.name}</h4>
              <p className="font-caption text-on-surface-variant">{expert.specialization}</p>
            </div>
            <div className="ml-auto text-right">
              <span className="font-label-md font-bold text-primary">₹{expert.fee}</span>
              <p className="font-caption text-on-surface-variant">Session Fee</p>
            </div>
          </div>

          {/* Date Selection */}
          <div className="flex flex-col gap-3">
            <label className="font-label-md text-on-surface flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-primary" /> Select Date
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {mockDates.map(date => (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`flex-shrink-0 px-4 py-3 rounded-xl border transition-all ${
                    selectedDate === date
                      ? 'border-primary bg-primary-fixed text-on-primary-fixed'
                      : 'border-outline-variant text-on-surface-variant hover:border-primary'
                  }`}
                >
                  <div className="font-caption font-bold">
                    {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="font-label-md">
                    {new Date(date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Time Selection */}
          <div className="flex flex-col gap-3">
            <label className="font-label-md text-on-surface flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Select Time Slot
            </label>
            <div className="grid grid-cols-3 gap-2">
              {expert.availableSlots.map(slot => (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className={`px-3 py-2 rounded-lg border font-label-md transition-all ${
                    selectedSlot === slot
                      ? 'border-primary bg-primary text-on-primary shadow-sm'
                      : 'border-outline-variant text-on-surface hover:border-primary'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-2">
            <label className="font-label-md text-on-surface">Briefly describe your issue (Optional)</label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="E.g., I need advice on choosing the right fertilizer for my wheat crop..."
              className="w-full p-3 bg-surface-container rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body-md text-body-md text-on-surface resize-none h-24"
            />
          </div>
        </div>

        <div className="p-6 border-t border-outline-variant bg-surface-container-low flex justify-end gap-4">
          <button 
            onClick={onClose}
            className="font-label-md text-on-surface-variant hover:text-on-surface px-4 py-2"
          >
            Cancel
          </button>
          <button 
            onClick={handleProceed}
            className="font-label-md text-on-primary bg-primary hover:bg-primary-container transition-colors px-6 py-3 rounded-lg shadow-sm"
          >
            Proceed to Payment
          </button>
        </div>
      </motion.div>
    </div>
  );
};
