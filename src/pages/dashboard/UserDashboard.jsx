import React, { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import {
  getBookingsByStudent,
  getBookingsByExpert,
  getExpertByOwnerEmail,
  createDeleteRequest,
  getDeleteRequestByExpertId,
} from '../../data/mockData';
import { Calendar, Video, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export const UserDashboard = () => {
  const { user } = useAuth();
  const [deleteRequested, setDeleteRequested] = useState(false);
  const [expertProfile, setExpertProfile] = useState(null);
  const [existingDeleteRequest, setExistingDeleteRequest] = useState(null);
  const [studentBookings, setStudentBookings] = useState([]);
  const [expertBookings, setExpertBookings] = useState([]);



  React.useEffect(() => {
    if (!user) return;
    
    const loadData = async () => {
      if (user.role === 'expert') {
        const profile = await getExpertByOwnerEmail(user.email);
        setExpertProfile(profile);
        if (profile) {
          setExistingDeleteRequest(await getDeleteRequestByExpertId(profile.id));
          setExpertBookings(await getBookingsByExpert({ expertId: profile.id, expertEmail: user.email }));
        }
      } else {
        setStudentBookings(await getBookingsByStudent(user.email));
      }
    };
    loadData();
  }, [user]);

  const handleDeleteAccountRequest = async () => {
    if (!expertProfile) {
      toast.error('No expert profile found');
      return;
    }

    if (window.confirm('Are you sure you want to request account deletion? This will be sent to admin for approval.')) {
      const success = await createDeleteRequest(expertProfile.id, user.email, expertProfile.name);
      if (success) {
        setDeleteRequested(true);
        toast.success('Account deletion request submitted. Admin will review and approve/reject.');
      } else {
        toast.error('Failed to submit deletion request. Please try again.');
      }
    }
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const upcomingBookings = (user.role === 'student' ? studentBookings : expertBookings).filter((booking) => booking.status === 'Upcoming');
  const completedBookings = (user.role === 'student' ? studentBookings : expertBookings).filter((booking) => booking.status === 'Completed');
  const revenue = expertBookings.reduce((sum, booking) => sum + (booking.amount || 0), 0);
  const totalCalls = (user.role === 'expert' ? expertBookings : studentBookings).length;
  const completedCalls = completedBookings.length;

  return (
    <main className="flex-grow pt-16 bg-surface px-lg py-xl min-h-screen">
      <div className="max-w-container-max mx-auto flex flex-col gap-xl">
        <div className="flex flex-col gap-sm">
          <h1 className="font-h2 text-h2 text-on-surface">Welcome back, {user.name}</h1>
          <p className="font-body-md text-on-surface-variant">Manage your consultations and monitor upcoming sessions.</p>
        </div>

        {user.role === 'expert' ? (
          <>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-xl">
              <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-sm">
                <p className="font-caption text-on-surface-variant">Expert Profile</p>
                <h2 className="font-h3 text-h3 text-on-surface">{expertProfile ? expertProfile.name : 'No profile yet'}</h2>
                <p className="font-body-sm text-on-surface-variant mt-2">{expertProfile ? expertProfile.specialization : 'Create your expert profile from Apply as Expert.'}</p>
              </div>
              <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-sm">
                <p className="font-caption text-on-surface-variant">Total Consultations</p>
                <h2 className="font-h1 text-h1 text-on-surface">{totalCalls}</h2>
                <p className="font-body-sm text-on-surface-variant mt-2">Scheduled and completed sessions</p>
              </div>
              <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-sm">
                <p className="font-caption text-on-surface-variant">Revenue</p>
                <h2 className="font-h1 text-h1 text-on-surface">₹{revenue}</h2>
                <p className="font-body-sm text-on-surface-variant mt-2">Total earned from booked sessions</p>
              </div>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-xl">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-sm">
              <p className="font-caption text-on-surface-variant">Upcoming Sessions</p>
              <h2 className="font-h1 text-h1 text-on-surface">{upcomingBookings.length}</h2>
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-sm">
              <p className="font-caption text-on-surface-variant">Completed Sessions</p>
              <h2 className="font-h1 text-h1 text-on-surface">{completedCalls}</h2>
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-sm">
              <p className="font-caption text-on-surface-variant">Total Bookings</p>
              <h2 className="font-h1 text-h1 text-on-surface">{totalCalls}</h2>
            </div>
          </div>
        )}

        {user.role === 'expert' ? (
          <div className="flex flex-col gap-xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl">
              <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="font-h3 text-h3 text-on-surface flex items-center gap-2"><Calendar className="w-5 h-5 text-primary" /> Upcoming Calls</h2>
                  <span className="font-caption text-on-surface-variant">{upcomingBookings.length} scheduled</span>
                </div>
                {upcomingBookings.length ? (
                  <div className="mt-6 flex flex-col gap-4">
                    {upcomingBookings.map((booking) => (
                      <motion.div key={booking.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-surface p-5 rounded-3xl border border-outline-variant">
                        <div className="flex justify-between gap-4">
                          <div>
                            <p className="font-label-md font-semibold text-on-surface">{booking.studentName}</p>
                            <p className="font-caption text-on-surface-variant">{booking.date} • {booking.time}</p>
                          </div>
                          <a href={booking.zoom_link || booking.zoomLink} target="_blank" rel="noreferrer" className="font-label-md text-primary hover:underline">Zoom Link</a>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-6 text-on-surface-variant">No upcoming calls scheduled.</p>
                )}
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="font-h3 text-h3 text-on-surface flex items-center gap-2"><CheckCircle className="w-5 h-5 text-secondary" /> Completed Calls</h2>
                  <span className="font-caption text-on-surface-variant">{completedBookings.length} done</span>
                </div>
                {completedBookings.length ? (
                  <div className="mt-6 flex flex-col gap-4">
                    {completedBookings.map((booking) => (
                      <motion.div key={booking.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-surface p-5 rounded-3xl border border-outline-variant">
                        <div className="flex flex-col gap-2">
                          <p className="font-label-md font-semibold text-on-surface">{booking.studentName}</p>
                          <p className="font-caption text-on-surface-variant">{booking.date} • {booking.time}</p>
                          <p className="font-caption text-on-surface-variant">Earned ₹{booking.amount}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-6 text-on-surface-variant">No completed sessions yet.</p>
                )}
              </div>
            </div>

            <div className="mt-10 bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-sm">
              {existingDeleteRequest || deleteRequested ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-secondary-container text-on-secondary-container rounded-3xl p-6 border border-outline-variant flex items-start gap-4">
                  <AlertCircle className="w-6 h-6 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-h3 text-h3">Account Deletion Request Pending</h3>
                    <p className="font-body-md mt-2">Your account deletion request is under admin review. You will receive notification once the admin approves or rejects your request.</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <h3 className="font-h3 text-h3 text-on-surface">Request Expert Profile Deletion</h3>
                    <p className="font-body-md text-on-surface-variant mt-2">Submit a deletion request for your expert profile. Admin approval is required before the profile is removed from the site.</p>
                  </div>
                  <button
                    onClick={handleDeleteAccountRequest}
                    className="px-6 py-3 bg-error text-on-error rounded-lg font-label-md hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap"
                  >
                    <Trash2 className="w-4 h-4" />
                    Request Deletion
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="font-h3 text-h3 text-on-surface flex items-center gap-2"><Calendar className="w-5 h-5 text-primary" /> Upcoming Sessions</h2>
                <span className="font-caption text-on-surface-variant">{upcomingBookings.length}</span>
              </div>
              {upcomingBookings.length ? (
                <div className="mt-6 flex flex-col gap-4">
                  {upcomingBookings.map((booking) => (
                    <motion.div key={booking.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-surface p-5 rounded-3xl border border-outline-variant">
                      <div className="flex justify-between gap-4">
                        <div>
                          <p className="font-label-md font-semibold text-on-surface">{booking.expertName}</p>
                          <p className="font-caption text-on-surface-variant">{booking.date} • {booking.time}</p>
                        </div>
                        <a href={booking.zoom_link || booking.zoomLink} target="_blank" rel="noreferrer" className="font-label-md text-primary hover:underline">Join call</a>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="mt-6 text-on-surface-variant">No upcoming bookings yet.</p>
              )}
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="font-h3 text-h3 text-on-surface flex items-center gap-2"><CheckCircle className="w-5 h-5 text-secondary" /> Completed Sessions</h2>
                <span className="font-caption text-on-surface-variant">{completedBookings.length}</span>
              </div>
              {completedBookings.length ? (
                <div className="mt-6 flex flex-col gap-4">
                  {completedBookings.map((booking) => (
                    <motion.div key={booking.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-surface p-5 rounded-3xl border border-outline-variant flex flex-col gap-3">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-label-md font-semibold text-on-surface">{booking.expertName}</p>
                          <p className="font-caption text-on-surface-variant">{booking.date} • {booking.time}</p>
                        </div>
                        <span className="font-caption text-on-surface-variant">Paid ₹{booking.amount}</span>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <Link to={`/experts/${booking.expertId}`} className="font-label-md text-primary hover:underline">View Expert</Link>
                        <Link to={`/experts/${booking.expertId}`} className="font-label-md text-on-primary bg-primary px-4 py-2 rounded-full hover:bg-primary-container transition-colors">Rate Expert</Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="mt-6 text-on-surface-variant">No completed sessions yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
};
