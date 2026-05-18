import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Verified, Sprout, Video } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAllExperts, getExpertRating, loadReviews } from '../data/mockData';

export const Home = () => {
  const [experts, setExperts] = useState([]);

  useEffect(() => {
    setExperts(getAllExperts());
  }, []);

  const totalExperts = experts.length;
  const totalConsultations = loadReviews().length;
  const averageRating = experts.length > 0
    ? (experts.reduce((sum, expert) => {
        const rating = getExpertRating(expert.id).average || expert.rating || 0;
        return sum + rating;
      }, 0) / experts.length).toFixed(1)
    : '0.0';
  return (
    <main className="flex-grow pt-16">
      {/* Hero Section */}
      <section className="relative w-full min-h-[calc(100vh-64px)] flex items-center justify-center px-lg py-xl overflow-hidden bg-surface-container-high">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1920&auto=format&fit=crop" 
            alt="Agricultural field background" 
            className="w-full h-full object-cover opacity-80" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-surface/90 via-surface/70 to-transparent"></div>
        </div>

        <div className="relative z-10 w-full max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-2 gap-xl items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-lg max-w-2xl"
          >
            <span className="inline-block px-3 py-1 bg-secondary-container text-on-secondary-container font-label-md text-label-md rounded-full w-max shadow-sm">
              Early Career Support
            </span>
            <h1 className="font-h1 text-h1 text-on-surface">
              Connect Students or Interns with Industry Experts
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg">
              Find mentorship for your job, internship, or academic project in paddy, wheat, or any other domain in agriculture. Get practical guidance from professionals who understand the industry.
            </p>
            <div className="flex flex-wrap items-center gap-md pt-4">
              <Link to="/experts" className="font-label-md text-label-md text-on-primary bg-primary hover:bg-primary-container transition-colors px-6 py-3 rounded-lg shadow-sm">
                Find Mentors
              </Link>
            </div>

            {/* Quick Stats Bento */}
            <div className="grid grid-cols-3 gap-sm mt-8 p-md bg-surface/80 backdrop-blur-md rounded-xl border border-outline-variant shadow-sm">
              <div className="flex flex-col">
                <span className="font-h3 text-h3 text-primary">{totalExperts}+</span>
                <span className="font-caption text-caption text-on-surface-variant">Verified Experts</span>
              </div>
              <div className="flex flex-col border-l border-outline-variant pl-sm">
                <span className="font-h3 text-h3 text-primary">{totalConsultations}+</span>
                <span className="font-caption text-caption text-on-surface-variant">Consultations</span>
              </div>
              <div className="flex flex-col border-l border-outline-variant pl-sm">
                <span className="font-h3 text-h3 text-primary">{averageRating}/5</span>
                <span className="font-caption text-caption text-on-surface-variant">Average Rating</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="w-full max-w-container-max mx-auto px-lg py-xl flex flex-col gap-xl my-8">
        <div className="text-center max-w-3xl mx-auto flex flex-col gap-sm">
          <h2 className="font-h2 text-h2 text-on-surface">Guidance for Your Job, Internship, or Campus Project</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">A platform that links learners with agriculture experts to support practical learning, project success, and career growth.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          <motion.div whileHover={{ y: -8 }} className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant flex flex-col gap-md shadow-sm">
            <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-primary mb-2">
              <Sprout className="w-6 h-6" />
            </div>
            <h3 className="font-h3 text-h3 text-on-surface">Mentorship for Learners</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">Get advice on academic assignments, internship tasks, and career steps from experts in paddy, wheat, and agriculture operations.</p>
          </motion.div>
          
          <motion.div whileHover={{ y: -8 }} className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant flex flex-col gap-md shadow-sm relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-tertiary-fixed-dim rounded-full opacity-20 blur-2xl"></div>
            <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-primary mb-2 relative z-10">
              <Verified className="w-6 h-6" />
            </div>
            <h3 className="font-h3 text-h3 text-on-surface relative z-10">Trusted Industry Insight</h3>
            <p className="font-body-md text-body-md text-on-surface-variant relative z-10">Learn from agriculture professionals who know the field and can help you prepare for interviews, reports, and practical farm work.</p>
          </motion.div>

          <motion.div whileHover={{ y: -8 }} className="bg-primary text-on-primary rounded-xl p-lg flex flex-col gap-md shadow-lg">
            <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-primary-fixed mb-2">
              <Video className="w-6 h-6" />
            </div>
            <h3 className="font-h3 text-h3 text-on-primary">Easy Expert Sessions</h3>
            <p className="font-body-md text-body-md text-primary-fixed-dim">Book live guidance sessions quickly and connect with mentors over video or chat for real-time support.</p>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="w-full bg-surface-container py-xl">
        <div className="max-w-container-max mx-auto px-lg flex flex-col lg:flex-row gap-xl items-center">
          <div className="lg:w-1/3 flex flex-col gap-md">
            <h2 className="font-h2 text-h2 text-on-surface">Success Stories from the Students</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Hear how expert guidance is making students more confident in their early stages of learning.</p>
            
          </div>
          <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-gutter">
            <div className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-outline-variant flex flex-col gap-md mt-0 sm:mt-8">
              <div className="flex items-center gap-xs text-tertiary-container">
                {[1,2,3,4,5].map(i => <Starey key={i} />)}
              </div>
              <p className="font-body-md text-body-md text-on-surface italic">"Very Useful Platform for gaining real experience from the experts."</p>
              <div className="flex items-center gap-md mt-auto pt-4 border-t border-outline-variant">
                <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-h3">R</div>
                <div>
                  <h4 className="font-label-md text-label-md text-on-surface">Roushan Kumar Mourya</h4>
                  <span className="font-caption text-caption text-on-surface-variant">Noida</span>
                </div>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-outline-variant flex flex-col gap-md">
              <div className="flex items-center gap-xs text-tertiary-container">
                {[1,2,3,4,5].map(i => <Starey key={i} />)}
              </div>
              <p className="font-body-md text-body-md text-on-surface italic">"It is very useful for my Compliant Paddy Project at ITC Limited. I have connected to the Abhishek Sir and his guidance helps me a lot."</p>
              <div className="flex items-center gap-md mt-auto pt-4 border-t border-outline-variant">
                <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-h3">S</div>
                <div>
                  <h4 className="font-label-md text-label-md text-on-surface">Ganesh G</h4>
                  <span className="font-caption text-caption text-on-surface-variant">Bhopal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full max-w-4xl mx-auto px-lg py-xl my-xl">
        <div className="bg-secondary text-on-secondary rounded-[24px] p-xl flex flex-col md:flex-row items-center justify-between gap-lg shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="flex flex-col gap-sm relative z-10 max-w-lg">
            <h2 className="font-h2 text-h2">Are you an Agriculture Expert?</h2>
            <p className="font-body-md text-body-md text-secondary-fixed-dim">Join our network to share your knowledge, help students or interns across India, and earn through specialized consultations.</p>
          </div>
          <Link to="/apply-expert" className="font-label-md text-label-md text-primary bg-secondary-fixed hover:bg-secondary-fixed-dim transition-colors px-6 py-3 rounded-lg whitespace-nowrap relative z-10 shadow-sm">
            Apply as Expert
          </Link>
        </div>
      </section>
    </main>
  );
};

const Starey = () => <Star className="w-5 h-5 fill-current text-tertiary-container" />;
