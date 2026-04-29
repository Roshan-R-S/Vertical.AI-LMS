const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Indian currency formatter
export function formatCurrency(value) {
  const num = Number(value) || 0;
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000)   return `₹${(num / 100000).toFixed(2)} L`;
  return `₹${num.toLocaleString('en-IN')}`;
}

async function request(path, options = {}) {
  const token = sessionStorage.getItem('lms_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const error = new Error(data.message || data.error || 'Something went wrong');
    error.data = data;
    throw error;
  }

  return response.json();
}

// Separate function for multipart/form-data uploads.
// Does NOT set Content-Type — browser sets it automatically with the correct boundary.
async function upload(path, formData) {
  const token = sessionStorage.getItem('lms_token');
  const headers = {
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const error = new Error(data.message || data.error || 'Upload failed');
    error.data = data;
    throw error;
  }

  return response.json();
}

export const api = {
  get: (path) => request(path),
  post: (path, data) => request(path, { method: 'POST', body: JSON.stringify(data) }),
  patch: (path, data) => request(path, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (path) => request(path, { method: 'DELETE' }),
  upload,
};