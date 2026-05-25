import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, ShieldCheck, Trophy, Briefcase, Clock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { getPlatformStats } from '../data/mockData';

const featureCards = [
  { title: 'Verified Expert Badge', description: 'Trust professionals vetted for real industry experience.', icon: ShieldCheck },
  { title: 'Session Ratings', description: 'Choose experts with feedback from students.', icon: Trophy },
  { title: 'Consultation History', description: 'See expert with total consultations offered to students.', icon: Briefcase },
  { title: 'Customer Support', description: 'Write us on support@experthive.co.in in case of any issues faced', icon: Clock },
];

const audienceItems = [
  'Students',
  'MBA Aspirants',
  'Interns',
  'Early Career Professionals',
  'Career Switchers',
  'Job Seekers',
];

const faqItems = [
  {
    question: 'How do sessions work?',
    answer: 'Book one-on-one time with a verified expert, join the session online, and get practical guidance tailored to your career goals.',
  },
  {
    question: 'How are experts verified?',
    answer: 'Experts are verified through a rigorous process that includes background checks, experience validation, and student feedback to ensure quality guidance.',
  },
  {
    question: 'Can students request custom guidance?',
    answer: 'Yes - you can ask experts for interview prep, project feedback, career planning, or industry-specific advice.',
  },
  {
    question: 'How do experts earn?',
    answer: 'Experts earn by sharing knowledge, mentoring learners, and hosting paid one-on-one sessions.',
  },
];

export const Home = () => {
  const [stats, setStats] = useState({ totalExperts: 0, totalConsultations: 0, averageRating: '0.0' });

  useEffect(() => {
    getPlatformStats().then(setStats);
  }, []);

  return (
    <main className="flex-grow bg-slate-50">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80"
            alt="Green farmland in sunlight"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-950/60" />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_32%)] mix-blend-screen" />
        <div className="relative max-w-7xl mx-auto px-6 py-12 lg:px-8 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-8 text-white z-10 relative">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-100 ring-1 ring-white/15">
                Bridge the gap between classroom learning and real industry experience
              </span>
              <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-white drop-shadow-[0_8px_20px_rgba(0,0,0,0.35)] sm:text-5xl">Learn from Professionals. Grow with Real Experience.</h1>
              <p className="max-w-2xl text-lg leading-8 text-emerald-100/90">Book sessions with experienced professionals across industries in Agricultural Domain to gain practical knowledge, career guidance, and insights beyond classrooms.</p>
              <div className="flex flex-wrap gap-4">
                <Link to="/experts" className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-600">Explore Experts</Link>
                <Link to="/apply-expert" className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-slate-950/10 transition hover:bg-slate-100">Become an Expert</Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-3xl bg-white/95 p-5 shadow-xl shadow-slate-950/5 ring-1 ring-slate-900/5">
                  <p className="text-sm font-semibold text-slate-950">Search Expert by Domain</p>
                    <p className="mt-3 text-sm text-slate-600">Paddy, wheat, supply chain and many more domain experts are available.</p>
                </div>
                <div className="rounded-3xl bg-white/95 p-5 shadow-xl shadow-slate-950/5 ring-1 ring-slate-900/5">
                  <p className="text-sm font-semibold text-slate-950">Real Industry Experience</p>
                  <p className="mt-3 text-sm text-slate-600">See professionals with real industry backgrounds and get valuable insights from their experience.</p>
                </div>
                <div className="rounded-3xl bg-white/95 p-5 shadow-xl shadow-slate-950/5 ring-1 ring-slate-900/5">
                  <p className="text-sm font-semibold text-slate-950">Flexible pricing</p>
                  <p className="mt-3 text-sm text-slate-600">Affordable Pricing that fits student budgets. compare and find the best option for you.</p>
                </div>
              </div>
            </div>
            <div className="relative rounded-[32px] bg-slate-900 p-8 text-white shadow-xl ring-1 ring-slate-200/10 sm:p-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_35%)] opacity-75" />
              <div className="relative grid gap-6">
                <div className="rounded-3xl bg-slate-800/95 p-6 shadow-lg backdrop-blur-sm">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">Expert session spotlight</p>
                  <h2 className="mt-4 text-2xl font-semibold">Compliant Paddy Project</h2>
                  <p className="mt-3 text-sm text-slate-300">45 min session · ₹499 · 4.9 rating</p>
                </div>
                <div className="rounded-3xl bg-slate-800/95 p-6 shadow-lg backdrop-blur-sm">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">Career Guidance</p>
                  <h2 className="mt-4 text-2xl font-semibold">Agri Jobs & Interview Readiness</h2>
                  <p className="mt-3 text-sm text-slate-300">30 min session · ₹299 · expert feedback</p>
                </div>
                <div className="rounded-3xl bg-slate-800/95 p-6 shadow-lg backdrop-blur-sm">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">Mentor rating</p>
                  <p className="mt-4 text-5xl font-bold">{/*{stats.averageRating}*/}4.9</p>
                  <p className="mt-2 text-sm text-slate-300">Average student rating</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">How it works</p>
              <h2 className="text-3xl font-semibold text-slate-950">Simple steps for students and experts.</h2>
              <p className="max-w-xl text-lg leading-8 text-slate-600">ExpertHive makes it easy to find the right professional, schedule a session, and gain real guidance designed to build confidence and career momentum.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
                <p className="text-xl font-semibold text-slate-900">🎓 Students</p>
                <ol className="mt-4 space-y-3 text-slate-600 list-decimal list-inside">
                  <li>Find an expert</li>
                  <li>Book a session</li>
                  <li>Learn from real experience</li>
                  <li>Apply in projects & career</li>
                </ol>
              </div>
              <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
                <p className="text-xl font-semibold text-slate-900">👨‍💼 Experts</p>
                <ol className="mt-4 space-y-3 text-slate-600 list-decimal list-inside">
                  <li>Create profile</li>
                  <li>Set availability</li>
                  <li>Mentor learners</li>
                  <li>Earn from knowledge</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Why ExpertHive?</p>
            <h2 className="mt-4 text-3xl font-semibold text-slate-950">The value you get is industry-ready guidance, not another course.</h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              'Learn what industry actually expects',
              'Get practical insights, not theory',
              'Connect with experienced professionals',
              'Build confidence for interviews & internships',
              'Flexible sessions at affordable pricing',
            ].map((item) => (
              <div key={item} className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 text-slate-900 font-semibold">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  <span>{item}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Who is this for?</p>
            <h2 className="mt-4 text-3xl font-semibold text-slate-950">Learners and early professionals who want real career momentum.</h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {audienceItems.map((item) => (
              <div key={item} className="rounded-3xl bg-white p-6 text-center shadow-sm border border-slate-200">
                <p className="text-lg font-semibold text-slate-900">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-4">
            {featureCards.map(({ title, description, icon: Icon }) => (
              <div key={title} className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-950">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Trusted by learners</p>
              <h2 className="text-3xl font-semibold text-slate-950">Student Testimonials</h2>
              <p className="max-w-xl text-base leading-7 text-slate-600">Findout what students are saying about our ExpertHive platform</p>
            </div>
            <div className="grid gap-6">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <p className="font-semibold text-slate-900">“My mentor helped me understand compliant paddy project and prepare for internship presentation”</p>
                <p className="mt-4 text-sm text-slate-600">Ganesh G, Intern @ ITC Limited(ABD)</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <p className="font-semibold text-slate-900">“The session gave me confidence to switch from academics into a real marketing role.”</p>
                <p className="mt-4 text-sm text-slate-600">Priya, Student @ MANAGE Hyderabad</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
              <h2 className="text-2xl font-semibold text-slate-950">Frequently Asked Questions</h2>
              <div className="mt-8 space-y-4">
                {faqItems.map((item) => (
                  <div key={item.question} className="rounded-3xl bg-slate-50 p-5 border border-slate-200">
                    <p className="font-semibold text-slate-900">{item.question}</p>
                    <p className="mt-2 text-slate-600">{item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl bg-slate-900 p-8 text-white shadow-sm border border-slate-800">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">Book Session</p>
              <h2 className="mt-4 text-3xl font-semibold">Ready to connect with an expert?</h2>
              <p className="mt-4 text-base leading-7 text-slate-200">Start with a quick search and book your first session in minutes. Real experience is one conversation away.</p>
              <Link to="/experts" className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
                Browse Experts
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
