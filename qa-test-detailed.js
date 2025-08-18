// Detailed QA Test with Frontend Page Security Checks
const BASE_URL = 'http://localhost:5000';

async function testFrontendPageSecurity() {
  console.log('\n=== TESTING FRONTEND PAGE SECURITY ===\n');
  
  const protectedPages = [
    '/dashboard',
    '/profile', 
    '/tasks',
    '/earnings',
    '/withdrawal',
    '/kyc',
    '/referrals',
    '/settings',
    '/notifications'
  ];
  
  for (const page of protectedPages) {
    try {
      const response = await fetch(`${BASE_URL}${page}`, {
        method: 'GET',
        redirect: 'manual'
      });
      
      // Check if page redirects to login (302/303) or shows content (200)
      if (response.status === 200) {
        const text = await response.text();
        
        // Check if the page contains login form (meaning it redirected client-side)
        if (text.includes('login') || text.includes('Login') || text.includes('Sign In')) {
          console.log(`✓ ${page}: Protected (redirects to login)`);
        } else if (text.includes('dashboard') || text.includes('Profile') || text.includes('Tasks')) {
          console.log(`✗ ${page}: SECURITY ISSUE - Shows protected content without auth`);
        } else {
          console.log(`⚠️  ${page}: Unclear protection status`);
        }
      } else if (response.status === 302 || response.status === 303 || response.status === 301) {
        console.log(`✓ ${page}: Protected (server redirect)`);
      } else {
        console.log(`⚠️  ${page}: Status ${response.status}`);
      }
    } catch (error) {
      console.log(`✗ ${page}: Error - ${error.message}`);
    }
  }
}

async function testAPIEndpointSecurity() {
  console.log('\n=== TESTING API ENDPOINT SECURITY ===\n');
  
  const protectedEndpoints = [
    { path: '/api/user/profile', method: 'GET', name: 'User Profile' },
    { path: '/api/user/earnings', method: 'GET', name: 'User Earnings' },
    { path: '/api/user/work-time', method: 'GET', name: 'Work Time' },
    { path: '/api/user/update-activity', method: 'POST', name: 'Update Activity' },
    { path: '/api/admin/users', method: 'GET', name: 'Admin Users' },
    { path: '/api/admin/tasks', method: 'GET', name: 'Admin Tasks' },
    { path: '/api/payment/kyc/initiate', method: 'POST', name: 'KYC Payment' },
    { path: '/api/payment/reactivation/initiate', method: 'POST', name: 'Reactivation Payment' }
  ];
  
  for (const endpoint of protectedEndpoints) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint.path}`, {
        method: endpoint.method,
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.status === 401 || response.status === 403) {
        console.log(`✓ ${endpoint.name}: Properly secured (${response.status})`);
      } else if (response.status === 200) {
        const data = await response.json();
        if (data.error && data.error.includes('auth')) {
          console.log(`✓ ${endpoint.name}: Secured with error message`);
        } else {
          console.log(`✗ ${endpoint.name}: ACCESSIBLE WITHOUT AUTH (Status: ${response.status})`);
        }
      } else {
        console.log(`⚠️  ${endpoint.name}: Status ${response.status}`);
      }
    } catch (error) {
      console.log(`⚠️  ${endpoint.name}: ${error.message}`);
    }
  }
}

async function testUserAuthentication() {
  console.log('\n=== TESTING USER AUTHENTICATION ===\n');
  
  const testCredentials = [
    { email: 'demo@innovativetaskearn.online', password: 'demo123', name: 'Demo User' },
    { email: 'john.doe@innovativetaskearn.online', password: 'verified123', name: 'John Doe' },
    { email: 'sarah.wilson@innovativetaskearn.online', password: 'sarah123', name: 'Sarah Wilson' }
  ];
  
  for (const creds of testCredentials) {
    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: creds.email, password: creds.password })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log(`✓ ${creds.name}: Login successful`);
      } else {
        console.log(`✗ ${creds.name}: Login failed - ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`✗ ${creds.name}: Error - ${error.message}`);
    }
  }
}

// Run all tests
async function runDetailedTests() {
  console.log('🔍 Running Detailed Security Tests...\n');
  console.log('=' .repeat(60));
  
  await testUserAuthentication();
  await testFrontendPageSecurity();
  await testAPIEndpointSecurity();
  
  console.log('\n' + '=' .repeat(60));
  console.log('Detailed Security Tests Complete');
}

runDetailedTests();