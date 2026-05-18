export const EXPERT_APPLICATION_FIELDS = [
  {
    name: 'name',
    label: 'Expert Name',
    type: 'text',
    placeholder: 'Dr. Anil Kumar',
    required: true,
  },
  {
    name: 'specialization',
    label: 'Specialization',
    type: 'text',
    placeholder: 'Paddy Expert / Organic Farming',
    required: true,
  },
  {
    name: 'experience',
    label: 'Experience',
    type: 'text',
    placeholder: '10 Years',
    required: true,
  },
  {
    name: 'fee',
    label: 'Consultation Fee (₹)',
    type: 'number',
    placeholder: '400',
    required: true,
  },
  {
    name: 'imageFile',
    label: 'Profile Image',
    type: 'file',
    accept: 'image/*',
    required: true,
  },
  {
    name: 'description',
    label: 'Profile Description',
    type: 'textarea',
    placeholder: 'Expert in modern irrigation and soil health management.',
    required: true,
  },
  {
    name: 'location',
    label: 'Location',
    type: 'text',
    placeholder: 'Madhya Pradesh, India',
    required: true,
  },
  {
    name: 'expertEmail',
    label: 'Login Email',
    type: 'email',
    placeholder: 'you@example.com',
    required: true,
  },
  {
    name: 'expertPassword',
    label: 'Login Password',
    type: 'password',
    placeholder: 'Create a password',
    required: true,
  },
  {
    name: 'availableSlots',
    label: 'Available Slots (AM / PM)',
    type: 'multiselect',
    options: Array.from({ length: 24 }, (_, i) => {
      const hour = i;
      const period = hour < 12 ? 'AM' : 'PM';
      const hour12 = hour % 12 === 0 ? 12 : hour % 12;
      return { value: `${hour12}:00 ${period}`, label: `${hour12}:00 ${period}` };
    }),
    required: true,
  },
];

const EXPERT_STORAGE_KEY = 'agriExpertApplications';
const USER_STORAGE_KEY = 'agriUsers';
const BOOKING_STORAGE_KEY = 'agriBookings';
const REVIEW_STORAGE_KEY = 'agriReviews';
const DELETE_REQUEST_STORAGE_KEY = 'agriDeleteRequests';

const safeParse = (value) => {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(value || '[]');
  } catch {
    return [];
  }
};

export const loadSavedExpertApplications = () => {
  if (typeof window === 'undefined') return [];
  return safeParse(localStorage.getItem(EXPERT_STORAGE_KEY));
};

export const saveExpertApplication = (application) => {
  const existing = loadSavedExpertApplications();
  localStorage.setItem(EXPERT_STORAGE_KEY, JSON.stringify([...existing, application]));
};

export const deleteExpertApplication = (expertId) => {
  const existing = loadSavedExpertApplications();
  const updated = existing.map((expert) =>
    expert.id === expertId
      ? {
          ...expert,
          status: 'deleted',
          deletedAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        }
      : expert
  );
  localStorage.setItem(EXPERT_STORAGE_KEY, JSON.stringify(updated));
};

export const updateExpertApplication = (updatedExpert) => {
  const existing = loadSavedExpertApplications();
  const updated = existing.map((expert) =>
    expert.id === updatedExpert.id
      ? { ...expert, ...updatedExpert, lastUpdated: new Date().toISOString() }
      : expert
  );
  localStorage.setItem(EXPERT_STORAGE_KEY, JSON.stringify(updated));
};

export const getAllExpertApplications = () => {
  return loadSavedExpertApplications();
};

export const getAllExperts = () => {
  return loadSavedExpertApplications().filter((expert) => expert.status === 'approved');
};

export const getPendingExpertApplications = () => {
  return loadSavedExpertApplications().filter((expert) => expert.status === 'pending');
};

export const getExpertApplicationById = (expertId) => {
  return loadSavedExpertApplications().find((expert) => expert.id === expertId) || null;
};

export const getExpertById = (expertId) => {
  return getAllExperts().find((expert) => expert.id === expertId) || null;
};

export const approveExpertApplication = (expertId) => {
  const existing = loadSavedExpertApplications();
  const updated = existing.map((expert) =>
    expert.id === expertId
      ? {
          ...expert,
          status: 'approved',
          approvedAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        }
      : expert
  );
  localStorage.setItem(EXPERT_STORAGE_KEY, JSON.stringify(updated));
};

export const rejectExpertApplication = (expertId) => {
  const existing = loadSavedExpertApplications();
  const updated = existing.map((expert) =>
    expert.id === expertId
      ? {
          ...expert,
          status: 'rejected',
          rejectedAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        }
      : expert
  );
  localStorage.setItem(EXPERT_STORAGE_KEY, JSON.stringify(updated));
  return updated.find((expert) => expert.id === expertId) || null;
};

export const getExpertByOwnerEmail = (email) => {
  return loadSavedExpertApplications().find((expert) => expert.ownerEmail?.toLowerCase() === email?.toLowerCase()) || null;
};

export const loadUsers = () => {
  if (typeof window === 'undefined') return [];
  return safeParse(localStorage.getItem(USER_STORAGE_KEY));
};

export const saveUser = (user) => {
  const users = loadUsers();
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify([...users, user]));
};

export const findUserByEmail = (email) => {
  return loadUsers().find((user) => user.email.toLowerCase() === email.toLowerCase()) || null;
};

export const deleteUserByEmail = (email) => {
  const users = loadUsers();
  const filtered = users.filter((user) => user.email.toLowerCase() !== email.toLowerCase());
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(filtered));
};

export const loadBookings = () => {
  if (typeof window === 'undefined') return [];
  return safeParse(localStorage.getItem(BOOKING_STORAGE_KEY));
};

export const saveBooking = (booking) => {
  const existing = loadBookings();
  localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify([...existing, booking]));
};

export const updateBooking = (updatedBooking) => {
  const existing = loadBookings();
  const updated = existing.map((booking) =>
    booking.id === updatedBooking.id ? { ...booking, ...updatedBooking } : booking
  );
  localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(updated));
};

export const getBookingsByStudent = (studentEmail) => {
  return loadBookings().filter((booking) => booking.studentEmail.toLowerCase() === studentEmail.toLowerCase());
};

export const getBookingsByExpert = ({ expertId, expertEmail }) => {
  return loadBookings().filter(
    (booking) => booking.expertId === expertId || booking.expertEmail?.toLowerCase() === expertEmail?.toLowerCase()
  );
};

export const loadReviews = () => {
  if (typeof window === 'undefined') return [];
  return safeParse(localStorage.getItem(REVIEW_STORAGE_KEY));
};

export const saveReview = (review) => {
  const existing = loadReviews();
  localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify([...existing, review]));
};

export const getReviewsByExpert = (expertId) => {
  return loadReviews()
    .filter((review) => review.expertId === expertId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
};

export const hasUserReviewedExpert = (expertId, studentEmail) => {
  return loadReviews().some(
    (review) => review.expertId === expertId && review.studentEmail.toLowerCase() === studentEmail.toLowerCase()
  );
};

export const getExpertRating = (expertId) => {
  const reviews = getReviewsByExpert(expertId);
  if (!reviews.length) {
    return { average: 0, count: 0 };
  }
  const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  return { average: Number(average.toFixed(1)), count: reviews.length };
};

// Delete Account Request Management
export const loadDeleteRequests = () => {
  if (typeof window === 'undefined') return [];
  return safeParse(localStorage.getItem(DELETE_REQUEST_STORAGE_KEY));
};

export const createDeleteRequest = (expertId, expertEmail, expertName) => {
  const existing = loadDeleteRequests();
  const deleteRequest = {
    id: `deleteReq_${Date.now()}`,
    expertId,
    expertEmail,
    expertName,
    status: 'pending',
    requestedAt: new Date().toISOString(),
  };
  localStorage.setItem(DELETE_REQUEST_STORAGE_KEY, JSON.stringify([...existing, deleteRequest]));
  return deleteRequest;
};

export const getPendingDeleteRequests = () => {
  return loadDeleteRequests().filter((req) => req.status === 'pending');
};

export const approveDeleteRequest = (requestId) => {
  const existing = loadDeleteRequests();
  const request = existing.find((req) => req.id === requestId);
  if (!request) return null;

  // Delete the expert profile and user account
  deleteExpertApplication(request.expertId);
  deleteUserByEmail(request.expertEmail);

  // Mark request as approved
  const updated = existing.map((req) =>
    req.id === requestId ? { ...req, status: 'approved', approvedAt: new Date().toISOString() } : req
  );
  localStorage.setItem(DELETE_REQUEST_STORAGE_KEY, JSON.stringify(updated));
  return request;
};

export const rejectDeleteRequest = (requestId) => {
  const existing = loadDeleteRequests();
  const updated = existing.map((req) =>
    req.id === requestId ? { ...req, status: 'rejected', rejectedAt: new Date().toISOString() } : req
  );
  localStorage.setItem(DELETE_REQUEST_STORAGE_KEY, JSON.stringify(updated));
};

export const getDeleteRequestByExpertId = (expertId) => {
  return loadDeleteRequests().find((req) => req.expertId === expertId && req.status === 'pending');
};
