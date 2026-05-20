import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { getAllExpertApplications, deleteExpertApplication, updateExpertApplication, approveExpertApplication, rejectExpertApplication, deleteUserByEmail, loadBookings, getPendingDeleteRequests, approveDeleteRequest, rejectDeleteRequest } from '../../data/mockData';
import { updateExpertInSheet, updateExpertStatusInSheet } from '../../api/sheetsApi';
import { Users, TrendingUp, IndianRupee, Trash2, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [deleteRequests, setDeleteRequests] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [editingExpert, setEditingExpert] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [viewingExpert, setViewingExpert] = useState(null);

  const loadData = async () => {
    setApplications(await getAllExpertApplications());
    setDeleteRequests(await getPendingDeleteRequests());
    setBookings(await loadBookings());
  };

  useEffect(() => {
    loadData();
  }, []);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  const handleDeleteExpert = async (expertId, expertEmail) => {
    if (window.confirm('Are you sure you want to delete this expert profile?')) {
      await deleteExpertApplication(expertId);
      await deleteUserByEmail(expertEmail);
      updateExpertStatusInSheet(expertId, {
        status: 'deleted',
        deletedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      });
      loadData();
      toast.success('Expert deleted successfully!');
    }
  };

  const handleApproveExpert = async (expertId) => {
    await approveExpertApplication(expertId);
    updateExpertStatusInSheet(expertId, {
      status: 'approved',
      approvedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    });
    loadData();
    toast.success('Expert application approved. The expert is now visible in Find Experts.');
  };

  const handleRejectExpert = async (expertId, expertEmail) => {
    if (window.confirm('Reject this expert application and delete the profile?')) {
      await rejectExpertApplication(expertId);
      await deleteUserByEmail(expertEmail);
      updateExpertStatusInSheet(expertId, {
        status: 'rejected',
        rejectedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      });
      loadData();
      toast.success('Expert application rejected and removed.');
    }
  };

  const handleEditExpert = (expert) => {
    setEditingExpert(expert);
    setEditForm({
      ...expert,
      availableSlots: expert.availableSlots || [],
    });
  };

  const handleEditChange = (event) => {
    const { name, value, type, files } = event.target;
    if (name === 'image_url' && type === 'file' && files?.[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditForm((prev) => ({ ...prev, image_url: e.target.result }));
      };
      reader.readAsDataURL(files[0]);
      return;
    }
    setEditForm((prev) => ({ ...prev, [name]: value }));
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

  const handleSaveEdit = async (event) => {
    event.preventDefault();
    await updateExpertApplication(editForm);
    updateExpertInSheet({
      ...editForm,
      lastUpdated: new Date().toISOString(),
    });
    setEditingExpert(null);
    loadData();
    toast.success('Expert profile updated successfully!');
  };

  const handleApproveDeleteRequest = async (requestId, expertId) => {
    await approveDeleteRequest(requestId);
    updateExpertStatusInSheet(expertId, {
      status: 'deleted',
      deletedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    });
    loadData();
    toast.success('Account deletion request approved. Expert account has been deleted.');
  };

  const handleRejectDeleteRequest = async (requestId) => {
    await rejectDeleteRequest(requestId);
    loadData();
    toast.success('Account deletion request rejected.');
  };

  const revenue = bookings.reduce((sum, consultation) => sum + (consultation.amount || 0), 0);

  // Process revenue data day-wise
  const revenueMap = {};
  bookings.forEach(booking => {
    if (booking.date && booking.amount) {
      revenueMap[booking.date] = (revenueMap[booking.date] || 0) + booking.amount;
    }
  });
  const revenueData = Object.keys(revenueMap).map(date => ({
    date,
    revenue: revenueMap[date]
  })).sort((a, b) => new Date(a.date) - new Date(b.date));

  const approvedExperts = applications.filter((app) => app.status === 'approved');
  const pendingApplications = applications.filter((app) => app.status === 'pending');
  const rejectedApplications = applications.filter((app) => app.status === 'rejected');

  // Group by specialization for the table
  const specMap = {};
  approvedExperts.forEach(expert => {
    const spec = expert.specialization || 'Other';
    specMap[spec] = (specMap[spec] || 0) + 1;
  });
  const specializationData = Object.keys(specMap).map(spec => ({
    specialization: spec,
    count: specMap[spec]
  })).sort((a, b) => b.count - a.count);

  const stats = [
    { label: 'Approved Experts', value: approvedExperts.length, icon: Users, color: 'text-primary' },
    { label: 'Pending Applications', value: pendingApplications.length, icon: TrendingUp, color: 'text-secondary' },
    { label: 'Rejected Applications', value: rejectedApplications.length, icon: XCircle, color: 'text-error' },
    { label: 'Total Revenue', value: `₹${revenue.toLocaleString()}`, icon: IndianRupee, color: 'text-tertiary-container' },
  ];

  return (
    <main className="flex-grow pt-16 bg-surface px-lg py-xl min-h-screen">
      <div className="max-w-container-max mx-auto flex flex-col gap-xl">
        
        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-xs">
            <h1 className="font-h2 text-h2 text-on-surface">Admin Portal</h1>
            <p className="font-body-md text-on-surface-variant">Platform overview and expert management.</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {stats.map((stat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col gap-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full bg-surface-container ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <span className="font-label-md text-on-surface-variant">{stat.label}</span>
              </div>
              <span className="font-h1 text-h1 text-on-surface">{stat.value}</span>
            </motion.div>
          ))}
        </div>

        {/* Charts and Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
          {/* Revenue Chart */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-6 flex flex-col gap-4">
            <h3 className="font-h3 text-on-surface">Revenue Collection</h3>
            <div className="h-64 w-full">
              {revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: '#737373', fontSize: 12 }} axisLine={{ stroke: '#e0e0e0' }} tickLine={false} />
                    <YAxis tick={{ fill: '#737373', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e0e0e0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value) => [`₹${value}`, 'Revenue']}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="#2e7d32" strokeWidth={3} dot={{ r: 4, fill: '#2e7d32', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-on-surface-variant font-body-md">No revenue data available</div>
              )}
            </div>
          </div>

          {/* Specialization Table */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-outline-variant bg-surface-container-low">
              <h3 className="font-h3 text-on-surface">Approved Experts by Specialization</h3>
            </div>
            <div className="overflow-y-auto max-h-[19.5rem]">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-surface-container z-10">
                  <tr className="text-on-surface-variant font-label-md shadow-[0_1px_0_#e0e0e0]">
                    <th className="p-4 font-medium">Specialization</th>
                    <th className="p-4 font-medium text-right">Number of Experts</th>
                  </tr>
                </thead>
                <tbody>
                  {specializationData.length > 0 ? specializationData.map((item, idx) => (
                    <tr key={idx} className="border-b border-outline-variant hover:bg-surface/50 transition-colors">
                      <td className="p-4 font-body-md text-on-surface">{item.specialization}</td>
                      <td className="p-4 font-body-md text-on-surface text-right font-medium">{item.count}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="2" className="p-8 text-center text-on-surface-variant font-body-md">No approved experts found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Expert Management Table */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-outline-variant bg-surface-container-low">
            <h3 className="font-h3 text-on-surface">Expert Directory</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container text-on-surface-variant font-label-md">
                  <th className="p-4 border-b border-outline-variant font-medium">Name</th>
                  <th className="p-4 border-b border-outline-variant font-medium">Specialization</th>
                  <th className="p-4 border-b border-outline-variant font-medium">Fee</th>
                  <th className="p-4 border-b border-outline-variant font-medium">Status</th>
                  <th className="p-4 border-b border-outline-variant font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((expert) => (
                  <tr key={expert.id} className="border-b border-outline-variant hover:bg-surface/50 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <img src={expert.image_url} alt={expert.name} className="w-8 h-8 rounded-full object-cover" />
                      <span className="font-body-md text-on-surface font-medium">{expert.name}</span>
                    </td>
                    <td className="p-4 font-body-md text-on-surface-variant">{expert.specialization}</td>
                    <td className="p-4 font-body-md text-on-surface">₹{expert.fee}</td>
                    <td className="p-4 font-body-md text-on-surface">
                      <span className={`px-3 py-1 rounded-full ${expert.status === 'approved' ? 'bg-primary/10 text-primary' : 'bg-secondary-container text-secondary'}`}>
                        {expert.status}
                      </span>
                    </td>
                    <td className="p-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => setViewingExpert(expert)}
                        className="font-label-md text-tertiary hover:underline"
                      >
                        View
                      </button>
                      {expert.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleApproveExpert(expert.id)}
                            className="font-label-md text-primary hover:underline"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectExpert(expert.id, expert.expertEmail)}
                            className="font-label-md text-error hover:text-error-container transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEditExpert(expert)}
                            className="font-label-md text-primary hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteExpert(expert.id, expert.expertEmail)}
                            className="font-label-md text-error hover:text-error-container transition-colors flex items-center gap-1"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Account Deletion Requests */}
        {deleteRequests.length > 0 && (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-outline-variant bg-surface-container-low flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-secondary" />
              <h3 className="font-h3 text-on-surface">Account Deletion Requests ({deleteRequests.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container text-on-surface-variant font-label-md">
                    <th className="p-4 border-b border-outline-variant font-medium">Expert Name</th>
                    <th className="p-4 border-b border-outline-variant font-medium">Email</th>
                    <th className="p-4 border-b border-outline-variant font-medium">Requested Date</th>
                    <th className="p-4 border-b border-outline-variant font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deleteRequests.map((request) => (
                    <tr key={request.id} className="border-b border-outline-variant hover:bg-surface/50 transition-colors">
                      <td className="p-4 font-body-md text-on-surface font-medium">{request.expertName}</td>
                      <td className="p-4 font-body-md text-on-surface-variant">{request.expertEmail}</td>
                      <td className="p-4 font-body-md text-on-surface-variant">{new Date(request.requestedAt).toLocaleDateString()}</td>
                      <td className="p-4 flex flex-wrap gap-3">
                        <button
                          onClick={() => {
                            if (window.confirm(`Approve deletion request for ${request.expertName}? Their account and profile will be permanently deleted.`)) {
                              handleApproveDeleteRequest(request.id, request.expertId);
                            }
                          }}
                          className="font-label-md text-success hover:text-success-container transition-colors flex items-center gap-1"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectDeleteRequest(request.id)}
                          className="font-label-md text-tertiary hover:text-tertiary-container transition-colors flex items-center gap-1"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {viewingExpert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8">
            <div className="w-full max-w-3xl rounded-3xl bg-surface-container-lowest p-8 shadow-2xl border border-outline-variant overflow-y-auto max-h-[90vh]">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="font-h3 text-h3 text-on-surface">Expert Profile</h2>
                  <p className="font-body-sm text-on-surface-variant">Detailed view of the application.</p>
                </div>
                <button
                  onClick={() => setViewingExpert(null)}
                  className="font-label-md text-on-surface-variant hover:text-on-surface"
                >
                  Close
                </button>
              </div>

              <div className="flex flex-col md:flex-row gap-6 mb-8">
                {viewingExpert.image_url ? (
                  <img src={viewingExpert.image_url} alt={viewingExpert.name} className="w-32 h-32 rounded-2xl object-cover border border-outline-variant shrink-0" />
                ) : (
                  <div className="w-32 h-32 rounded-2xl bg-surface-container flex items-center justify-center text-on-surface-variant shrink-0">No Image</div>
                )}
                <div className="flex flex-col gap-2">
                  <h3 className="font-h2 text-h2 text-on-surface">{viewingExpert.name}</h3>
                  <span className="font-label-md text-primary">{viewingExpert.specialization}</span>
                  <p className="font-body-md text-on-surface-variant mt-2 whitespace-pre-line">{viewingExpert.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="bg-surface-container rounded-xl p-4">
                  <span className="font-label-sm text-on-surface-variant block mb-1">Email</span>
                  <span className="font-body-md text-on-surface">{viewingExpert.expertEmail}</span>
                </div>
                <div className="bg-surface-container rounded-xl p-4">
                  <span className="font-label-sm text-on-surface-variant block mb-1">Location</span>
                  <span className="font-body-md text-on-surface">{viewingExpert.location}</span>
                </div>
                <div className="bg-surface-container rounded-xl p-4">
                  <span className="font-label-sm text-on-surface-variant block mb-1">Experience</span>
                  <span className="font-body-md text-on-surface">{viewingExpert.experience}</span>
                </div>
                <div className="bg-surface-container rounded-xl p-4">
                  <span className="font-label-sm text-on-surface-variant block mb-1">Fee</span>
                  <span className="font-body-md text-on-surface">₹{viewingExpert.fee}</span>
                </div>
              </div>

              <div className="mb-8">
                <span className="font-label-md text-on-surface block mb-3">Available Slots</span>
                <div className="flex flex-wrap gap-2">
                  {(viewingExpert.availableSlots || []).map(slot => (
                    <span key={slot} className="px-3 py-1 bg-primary/10 text-primary rounded-full font-label-sm">{slot}</span>
                  ))}
                  {(!viewingExpert.availableSlots || viewingExpert.availableSlots.length === 0) && (
                    <span className="font-body-sm text-on-surface-variant">No slots selected</span>
                  )}
                </div>
              </div>

              {viewingExpert.status === 'pending' && (
                <div className="flex gap-4 pt-4 border-t border-outline-variant">
                  <button
                    onClick={() => {
                      handleApproveExpert(viewingExpert.id);
                      setViewingExpert(null);
                    }}
                    className="flex-1 rounded-xl bg-primary px-4 py-3 text-label-md font-semibold text-on-primary transition hover:bg-primary-container"
                  >
                    Approve Application
                  </button>
                  <button
                    onClick={() => {
                      handleRejectExpert(viewingExpert.id, viewingExpert.expertEmail);
                      setViewingExpert(null);
                    }}
                    className="flex-1 rounded-xl bg-error-container px-4 py-3 text-label-md font-semibold text-error transition hover:bg-[#ffd0cb]"
                  >
                    Reject Application
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {editingExpert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8">
            <div className="w-full max-w-4xl rounded-3xl bg-surface-container-lowest p-8 shadow-2xl border border-outline-variant overflow-y-auto max-h-[90vh]">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="font-h3 text-h3 text-on-surface">Edit Expert Profile</h2>
                  <p className="font-body-sm text-on-surface-variant">Update profile details and save changes.</p>
                </div>
                <button
                  onClick={() => setEditingExpert(null)}
                  className="font-label-md text-on-surface-variant hover:text-on-surface"
                >
                  Close
                </button>
              </div>
              <form className="grid grid-cols-1 lg:grid-cols-2 gap-6" onSubmit={handleSaveEdit}>
                <label className="flex flex-col gap-2 text-on-surface">
                  <span className="font-label-md text-label-md">Name</span>
                  <input
                    name="name"
                    value={editForm.name || ''}
                    onChange={handleEditChange}
                    className="rounded-2xl border border-outline-variant bg-surface px-4 py-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </label>
                <label className="flex flex-col gap-2 text-on-surface">
                  <span className="font-label-md text-label-md">Specialization</span>
                  <input
                    name="specialization"
                    value={editForm.specialization || ''}
                    onChange={handleEditChange}
                    className="rounded-2xl border border-outline-variant bg-surface px-4 py-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </label>
                <label className="flex flex-col gap-2 text-on-surface">
                  <span className="font-label-md text-label-md">Experience</span>
                  <input
                    name="experience"
                    value={editForm.experience || ''}
                    onChange={handleEditChange}
                    className="rounded-2xl border border-outline-variant bg-surface px-4 py-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </label>
                <label className="flex flex-col gap-2 text-on-surface">
                  <span className="font-label-md text-label-md">Fee</span>
                  <input
                    name="fee"
                    type="number"
                    value={editForm.fee || 0}
                    onChange={handleEditChange}
                    className="rounded-2xl border border-outline-variant bg-surface px-4 py-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </label>
                <label className="flex flex-col gap-2 text-on-surface lg:col-span-2">
                  <span className="font-label-md text-label-md">Description</span>
                  <textarea
                    name="description"
                    value={editForm.description || ''}
                    onChange={handleEditChange}
                    className="min-h-[140px] rounded-2xl border border-outline-variant bg-surface p-4 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </label>
                <label className="flex flex-col gap-2 text-on-surface">
                  <span className="font-label-md text-label-md">Location</span>
                  <input
                    name="location"
                    value={editForm.location || ''}
                    onChange={handleEditChange}
                    className="rounded-2xl border border-outline-variant bg-surface px-4 py-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </label>
                <label className="flex flex-col gap-2 text-on-surface lg:col-span-2">
                  <span className="font-label-md text-label-md">Profile Image</span>
                  <input
                    name="image_url"
                    type="file"
                    accept="image/*"
                    onChange={handleEditChange}
                    className="rounded-2xl border border-outline-variant bg-surface px-4 py-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1 file:text-sm file:text-on-primary"
                  />
                  {editForm.image_url && (
                    <img src={editForm.image_url} alt="Preview" className="w-24 h-24 rounded-lg object-cover border border-outline-variant mt-2" />
                  )}
                </label>
                <div className="lg:col-span-2">
                  <span className="font-label-md text-label-md text-on-surface">Available Slots</span>
                  <div className="grid grid-cols-3 gap-3 mt-3 max-h-56 overflow-y-auto rounded-2xl border border-outline-variant bg-surface p-4">
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0');
                      const value = `${hour}:00`;
                      return (
                        <label key={value} className="flex items-center gap-2 text-body-sm">
                          <input
                            type="checkbox"
                            checked={(editForm.availableSlots || []).includes(value)}
                            onChange={() => handleSlotToggle(value)}
                            className="rounded border-outline-variant text-primary focus:ring-primary"
                          />
                          {value}
                        </label>
                      );
                    })}
                  </div>
                </div>
                <div className="lg:col-span-2 flex flex-col gap-4">
                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-primary px-6 py-4 text-label-md font-semibold text-on-primary transition hover:bg-primary-container"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </main>
  );
};
