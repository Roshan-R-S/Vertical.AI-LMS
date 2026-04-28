const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
const ALLOWED_ORIGIN = new URL(BASE_URL).origin;

// Whitelist of allowed API paths to prevent SSRF
const ALLOWED_PATHS = [
  '/auth',
  '/users',
  '/courses',
  '/uploads',
  '/admin',
  '/partner',
  '/leads',
  '/meetings',
  '/dashboard',
  '/reports',
  '/analytics',
  '/milestones',
  '/dispositions',
  '/attachments',
  '/audit-logs',
  '/notifications',
  '/settings',
  '/sources',
  '/teams',
  '/targets',
  '/tasks',
  '/clients',
  '/invoices',
  '/interactions'
];

function validatePath(path) {
  if (!path.startsWith('/')) {
    throw new Error('Invalid path: must start with /');
  }
  
  const isAllowed = ALLOWED_PATHS.some(allowedPath => 
    path === allowedPath || path.startsWith(`${allowedPath}/`)
  );
  if (!isAllowed) {
    throw new Error(`Blocked request to disallowed path: ${path}`);
  }
  
  if (path.includes('..') || path.includes('//') || /[<>"'&]/.test(path)) {
    throw new Error('Invalid characters in path');
  }
  
  return path;
}

function buildSafeUrl(path) {
  const validatedPath = validatePath(path);
  const url = new URL(`${BASE_URL}${validatedPath}`);
  if (url.origin !== ALLOWED_ORIGIN) {
    throw new Error(`Blocked request to disallowed origin: ${url.origin}`);
  }
  return url.toString();
}

async function request(path, options = {}) {
  const token = sessionStorage.getItem('lms_token');
  
  // Sanitize options to prevent SSRF via options manipulation
  const safeOptions = {
    method: options.method || 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...(options.body && { body: options.body }),
    ...(options.signal && { signal: options.signal })
  };
  
  // Remove any potentially dangerous properties
  delete safeOptions.url;
  delete safeOptions.baseURL;
  delete safeOptions.hostname;
  delete safeOptions.port;
  delete safeOptions.protocol;

  const response = await fetch(buildSafeUrl(path), safeOptions);

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const error = new Error(data.message || data.error || 'Something went wrong');
    error.data = data;
    error.status = response.status;
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

  const response = await fetch(buildSafeUrl(path), {
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