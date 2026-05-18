const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

const sendRequest = async (path, options) => {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });

    const data = await response.json();
    if (!response.ok) {
      console.warn('Sheets API error:', data);
      return null;
    }

    return data;
  } catch (error) {
    console.warn('Sheets API request failed:', error);
    return null;
  }
};

export const saveStudentToSheet = async (student) => {
  return sendRequest('/api/students', {
    method: 'POST',
    body: JSON.stringify(student),
  });
};

export const saveExpertToSheet = async (expert) => {
  return sendRequest('/api/experts', {
    method: 'POST',
    body: JSON.stringify(expert),
  });
};

export const updateExpertStatusInSheet = async (expertId, statusUpdate) => {
  return sendRequest(`/api/experts/${encodeURIComponent(expertId)}/status`, {
    method: 'PUT',
    body: JSON.stringify(statusUpdate),
  });
};

export const updateExpertInSheet = async (expert) => {
  return sendRequest(`/api/experts/${encodeURIComponent(expert.id)}`, {
    method: 'PUT',
    body: JSON.stringify(expert),
  });
};

export const getStudentsFromSheet = async () => {
  return sendRequest('/api/students');
};

export const getExpertsFromSheet = async () => {
  return sendRequest('/api/experts');
};
