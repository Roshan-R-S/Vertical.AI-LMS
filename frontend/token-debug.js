// Test this in browser console after login
// Copy and paste this code in browser console to debug token issues

console.log('🔍 Token Debug Information:');
console.log('='.repeat(50));

const token = sessionStorage.getItem('lms_token');
console.log('Token exists:', !!token);
console.log('Token length:', token?.length);

if (token) {
  console.log('Token preview:', token.substring(0, 20) + '...');
  
  // Try to decode JWT (just the payload, not verify)
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      console.log('Token payload:', payload);
      console.log('Token expires:', new Date(payload.exp * 1000));
      console.log('Token expired:', Date.now() > payload.exp * 1000);
    }
  } catch (e) {
    console.error('Failed to decode token:', e);
  }
  
  // Test API call
  console.log('\n🧪 Testing API call...');
  fetch('http://localhost:5000/api/v1/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(res => {
    console.log('Auth test response:', res.status, res.statusText);
    return res.json();
  })
  .then(data => console.log('Auth test data:', data))
  .catch(err => console.error('Auth test failed:', err));
} else {
  console.log('❌ No token found in sessionStorage');
}