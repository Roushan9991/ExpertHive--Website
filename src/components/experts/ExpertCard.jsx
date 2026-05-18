import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';

export const ExpertCard = ({ expert, onBook, rating, reviewCount }) => {
  const displayRating = rating ?? expert.rating;
  const displayCount = reviewCount ?? expert.reviews;

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-surface-container-lowest rounded-2xl p-lg border border-outline-variant flex flex-col gap-md shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      <div className="flex items-start gap-4">
        <img 
          src={expert.imageUrl} 
          alt={expert.name} 
          className="w-16 h-16 rounded-full object-cover border-2 border-secondary-container"
        />
        <div className="flex flex-col">
          <h3 className="font-h3 text-h3 text-on-surface">{expert.name}</h3>
          <span className="font-label-md text-label-md text-primary mt-1">{expert.specialization}</span>
        </div>
      </div>
      
      <p className="font-body-md text-body-md text-on-surface-variant flex-grow line-clamp-3">
        {expert.description}
      </p>

      <div className="flex flex-col gap-2 mt-2">
        <div className="flex items-center gap-2 text-on-surface-variant font-caption text-caption">
          <Briefcase className="w-4 h-4 text-secondary" />
          <span>{expert.experience} Experience</span>
        </div>
        <div className="flex items-center gap-2 text-on-surface-variant font-caption text-caption">
          <MapPin className="w-4 h-4 text-secondary" />
          <span>{expert.location}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-4 border-t border-outline-variant mt-auto">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1 text-tertiary-container">
              <Star className="w-4 h-4 fill-current" />
              <span className="font-label-md font-bold">{displayRating}</span>
              <span className="text-on-surface-variant font-caption">({displayCount})</span>
            </div>
            <span className="font-label-md font-bold text-on-surface mt-1 block">₹{expert.fee} <span className="font-caption font-normal text-on-surface-variant">/ session</span></span>
          </div>
          <button 
            onClick={() => onBook(expert)}
            className="font-label-md text-label-md text-on-primary bg-primary hover:bg-primary-container transition-colors px-4 py-2 rounded-lg shadow-sm"
          >
            Book Slot
          </button>
        </div>
        <Link
          to={`/experts/${expert.id}`}
          className="font-label-md text-label-md text-on-surface-variant bg-surface-container hover:bg-surface-container-hover transition-colors px-4 py-2 rounded-lg text-center"
        >
          View Profile
        </Link>
      </div>
    </motion.div>
  );
};
