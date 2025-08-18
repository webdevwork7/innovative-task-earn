// Final Comprehensive QA Test Suite with Full Bug Report
const BASE_URL = 'http://localhost:5000';
const API_URL = 'http://localhost:5000/api';

// Comprehensive test results storage
const finalReport = {
  timestamp: new Date().toISOString(),
  environment: 'Development',
  baseUrl: BASE_URL,
  testSummary: {
    totalPages: 0,
    pagesPassedAuth: 0,
    pagesFailedAuth: 0,
    totalAPIs: 0,
    apisPassedAuth: 0,
    apisFailedAuth: 0,
    totalForms: 0,
    formsPassedValidation: 0,
    formsFailedValidation: 0
  },
  bugs: [],
  passedTests: [],
  recommendations: []
};

// Test user credentials
const testUsers = {
  demo: { email: 'demo@innovativetaskearn.online', password: 'demo123' },
  john: { email: 'john.doe@innovativetaskearn.online', password: 'verified123' },
  sarah: { email: 'sarah.wilson@innovativetaskearn.online', password: 'sarah123' },
  alex: { email: 'alex.kumar@innovativetaskearn.online', password: 'alex123' },
  admin: { email: 'admin@innovativetaskearn.online', password: 'admin123' }
};

// Helper function for making requests
async function testRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers }
    });
    
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    return { 
      status: response.status, 
      ok: response.ok, 
      data,
      isJson: contentType?.includes('application/json')
    };
  } catch (error) {
    return { status: 0, ok: false, error: error.message };
  }
}

// Test 1: Authentication System
async function testAuthenticationSystem() {
  console.log('\n🔐 TESTING AUTHENTICATION SYSTEM\n');
  
  const authTests = [
    { name: 'Demo User Login', user: testUsers.demo, shouldPass: true },
    { name: 'John Doe Login', user: testUsers.john, shouldPass: true },
    { name: 'Sarah Wilson Login', user: testUsers.sarah, shouldPass: true },
    { name: 'Suspended User (Alex)', user: testUsers.alex, shouldPass: false, expectedStatus: 403 },
    { name: 'Admin Login', user: testUsers.admin, shouldPass: false },
    { name: 'Invalid User', user: { email: 'fake@test.com', password: 'wrong' }, shouldPass: false },
    { name: 'Empty Credentials', user: { email: '', password: '' }, shouldPass: false, expectedStatus: 400 },
    { name: 'XSS Prevention', user: { email: '<script>alert(1)</script>', password: 'test' }, shouldPass: false }
  ];
  
  for (const test of authTests) {
    const response = await testRequest(`${API_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(test.user)
    });
    
    const passed = test.shouldPass ? response.ok : !response.ok;
    
    if (passed) {
      finalReport.passedTests.push({
        category: 'Authentication',
        test: test.name,
        result: 'PASSED'
      });
      console.log(`✅ ${test.name}: PASSED`);
    } else {
      finalReport.bugs.push({
        page: '/api/auth/login',
        element: 'Login API',
        test: test.name,
        expected: test.shouldPass ? 'Successful login' : 'Login failure',
        actual: `Status ${response.status}: ${JSON.stringify(response.data)}`,
        severity: test.name.includes('Admin') ? 'HIGH' : 'MEDIUM'
      });
      console.log(`❌ ${test.name}: FAILED`);
    }
  }
}

// Test 2: Frontend Page Security
async function testFrontendPageSecurity() {
  console.log('\n🔒 TESTING FRONTEND PAGE SECURITY\n');
  
  const protectedPages = [
    '/dashboard', '/profile', '/tasks', '/earnings', '/withdrawal',
    '/kyc', '/referrals', '/settings', '/notifications', '/task-submission'
  ];
  
  const publicPages = [
    '/', '/login', '/signup', '/about', '/contact', '/privacy', '/terms', '/faq'
  ];
  
  // Test protected pages
  for (const page of protectedPages) {
    finalReport.testSummary.totalPages++;
    const response = await testRequest(`${BASE_URL}${page}`);
    
    if (response.ok && response.data) {
      const content = response.data.toString();
      const hasProtectedContent = 
        content.includes('Dashboard') || 
        content.includes('Profile') || 
        content.includes('Tasks') ||
        content.includes('Balance') ||
        !content.includes('login');
      
      if (hasProtectedContent) {
        finalReport.testSummary.pagesFailedAuth++;
        finalReport.bugs.push({
          page: page,
          element: 'Page Access',
          test: 'Authentication Check',
          expected: 'Redirect to login when not authenticated',
          actual: 'Page accessible without authentication',
          severity: 'CRITICAL'
        });
        console.log(`❌ ${page}: CRITICAL - Accessible without auth`);
      } else {
        finalReport.testSummary.pagesPassedAuth++;
        console.log(`✅ ${page}: Protected (redirects to login)`);
      }
    }
  }
  
  // Test public pages
  for (const page of publicPages) {
    finalReport.testSummary.totalPages++;
    const response = await testRequest(`${BASE_URL}${page}`);
    
    if (response.ok) {
      finalReport.passedTests.push({
        category: 'Public Pages',
        test: `${page} accessibility`,
        result: 'PASSED'
      });
      console.log(`✅ ${page}: Public page accessible`);
    } else {
      finalReport.bugs.push({
        page: page,
        element: 'Page Load',
        test: 'Public Page Access',
        expected: 'Page loads successfully',
        actual: `Failed with status ${response.status}`,
        severity: 'HIGH'
      });
      console.log(`❌ ${page}: Failed to load`);
    }
  }
}

// Test 3: API Endpoint Security
async function testAPIEndpointSecurity() {
  console.log('\n🛡️ TESTING API ENDPOINT SECURITY\n');
  
  const protectedEndpoints = [
    { path: '/user/profile', method: 'GET', name: 'User Profile' },
    { path: '/user/earnings', method: 'GET', name: 'User Earnings' },
    { path: '/user/work-time', method: 'GET', name: 'Work Time' },
    { path: '/user/update-activity', method: 'POST', name: 'Update Activity' },
    { path: '/user/tasks/submit', method: 'POST', name: 'Task Submission' },
    { path: '/admin/users', method: 'GET', name: 'Admin Users' },
    { path: '/admin/tasks', method: 'GET', name: 'Admin Tasks' },
    { path: '/admin/payouts', method: 'GET', name: 'Admin Payouts' }
  ];
  
  for (const endpoint of protectedEndpoints) {
    finalReport.testSummary.totalAPIs++;
    const response = await testRequest(`${API_URL}${endpoint.path}`, {
      method: endpoint.method
    });
    
    if (response.status === 401 || response.status === 403) {
      finalReport.testSummary.apisPassedAuth++;
      finalReport.passedTests.push({
        category: 'API Security',
        test: `${endpoint.name} protection`,
        result: 'PASSED'
      });
      console.log(`✅ ${endpoint.name}: Properly secured`);
    } else {
      finalReport.testSummary.apisFailedAuth++;
      finalReport.bugs.push({
        page: endpoint.path,
        element: 'API Endpoint',
        test: endpoint.name,
        expected: 'Return 401/403 without authentication',
        actual: `Status ${response.status}`,
        severity: 'HIGH'
      });
      console.log(`❌ ${endpoint.name}: Not properly secured`);
    }
  }
}

// Test 4: Form Validation
async function testFormValidation() {
  console.log('\n📝 TESTING FORM VALIDATION\n');
  
  const formTests = [
    {
      name: 'Signup - Missing Email',
      endpoint: '/auth/signup',
      data: { password: 'Test123!', firstName: 'Test', lastName: 'User', phone: '9876543210' },
      expectedError: true
    },
    {
      name: 'Signup - Invalid Email',
      endpoint: '/auth/signup',
      data: { email: 'notanemail', password: 'Test123!', firstName: 'Test', lastName: 'User', phone: '9876543210' },
      expectedError: true
    },
    {
      name: 'Signup - Weak Password',
      endpoint: '/auth/signup',
      data: { email: 'test@test.com', password: '123', firstName: 'Test', lastName: 'User', phone: '9876543210' },
      expectedError: true
    },
    {
      name: 'Login - SQL Injection',
      endpoint: '/auth/login',
      data: { email: "admin' OR '1'='1", password: "' OR '1'='1" },
      expectedError: true
    },
    {
      name: 'Login - Script Injection',
      endpoint: '/auth/login',
      data: { email: '<img src=x onerror=alert(1)>', password: 'test' },
      expectedError: true
    }
  ];
  
  for (const test of formTests) {
    finalReport.testSummary.totalForms++;
    const response = await testRequest(`${API_URL}${test.endpoint}`, {
      method: 'POST',
      body: JSON.stringify(test.data)
    });
    
    if (!response.ok && test.expectedError) {
      finalReport.testSummary.formsPassedValidation++;
      finalReport.passedTests.push({
        category: 'Form Validation',
        test: test.name,
        result: 'PASSED'
      });
      console.log(`✅ ${test.name}: Validation working`);
    } else {
      finalReport.testSummary.formsFailedValidation++;
      finalReport.bugs.push({
        page: test.endpoint,
        element: 'Form Validation',
        test: test.name,
        expected: 'Validation error',
        actual: `Status ${response.status}`,
        severity: 'MEDIUM'
      });
      console.log(`❌ ${test.name}: Validation failed`);
    }
  }
}

// Test 5: User Workflows
async function testUserWorkflows() {
  console.log('\n👤 TESTING USER WORKFLOWS\n');
  
  // Login as demo user
  const loginResponse = await testRequest(`${API_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify(testUsers.demo)
  });
  
  if (loginResponse.ok) {
    console.log('✅ User login successful');
    
    // Test logout
    const logoutResponse = await testRequest(`${API_URL}/auth/logout`, {
      method: 'POST'
    });
    
    if (logoutResponse.ok) {
      console.log('✅ User logout successful');
    } else {
      console.log('❌ User logout failed');
    }
  }
  
  // Test suspended user flow
  const suspendedResponse = await testRequest(`${API_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify(testUsers.alex)
  });
  
  if (suspendedResponse.status === 403 && suspendedResponse.data?.requiresReactivation) {
    console.log('✅ Suspended user detection working');
    finalReport.passedTests.push({
      category: 'User Workflows',
      test: 'Suspended user reactivation flow',
      result: 'PASSED'
    });
  } else {
    console.log('❌ Suspended user detection not working');
  }
}

// Test 6: Payment Integration
async function testPaymentIntegration() {
  console.log('\n💳 TESTING PAYMENT INTEGRATION\n');
  
  const paymentEndpoints = [
    { path: '/payment/kyc/initiate', name: 'KYC Payment' },
    { path: '/payment/reactivation/initiate', name: 'Reactivation Payment' }
  ];
  
  for (const endpoint of paymentEndpoints) {
    const response = await testRequest(`${API_URL}${endpoint.path}`, {
      method: 'POST'
    });
    
    if (!response.isJson) {
      finalReport.bugs.push({
        page: endpoint.path,
        element: 'Payment API',
        test: endpoint.name,
        expected: 'JSON response with error or payment URL',
        actual: 'HTML response instead of JSON',
        severity: 'HIGH'
      });
      console.log(`❌ ${endpoint.name}: Returns HTML instead of JSON`);
    } else if (response.status === 401 || response.status === 403) {
      console.log(`✅ ${endpoint.name}: Properly secured`);
    } else {
      console.log(`⚠️ ${endpoint.name}: Unexpected response`);
    }
  }
}

// Test 7: Responsiveness Check
async function testResponsiveness() {
  console.log('\n📱 TESTING RESPONSIVENESS\n');
  
  // This would typically use a headless browser, but we'll do basic checks
  const viewports = [
    { name: 'Desktop', width: 1920, height: 1080 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Mobile', width: 375, height: 667 }
  ];
  
  console.log('⚠️ Manual responsiveness testing required for:');
  viewports.forEach(vp => {
    console.log(`   - ${vp.name} (${vp.width}x${vp.height})`);
  });
  
  finalReport.recommendations.push(
    'Perform manual responsiveness testing on different viewport sizes',
    'Test touch interactions on mobile devices',
    'Verify that all forms are usable on mobile'
  );
}

// Generate final report
function generateFinalReport() {
  console.log('\n' + '='.repeat(80));
  console.log('                 COMPREHENSIVE QA TEST REPORT');
  console.log('='.repeat(80));
  
  console.log('\n📊 OVERALL STATISTICS');
  console.log('─'.repeat(40));
  
  const totalTests = 
    finalReport.testSummary.totalPages + 
    finalReport.testSummary.totalAPIs + 
    finalReport.testSummary.totalForms +
    finalReport.passedTests.length;
  
  const totalPassed = 
    finalReport.testSummary.pagesPassedAuth +
    finalReport.testSummary.apisPassedAuth +
    finalReport.testSummary.formsPassedValidation +
    finalReport.passedTests.length;
  
  const totalFailed = finalReport.bugs.length;
  
  console.log(`Total Tests Executed: ${totalTests}`);
  console.log(`Tests Passed: ${totalPassed} (${Math.round((totalPassed/totalTests)*100)}%)`);
  console.log(`Tests Failed: ${totalFailed} (${Math.round((totalFailed/totalTests)*100)}%)`);
  
  console.log('\n📋 TEST BREAKDOWN');
  console.log('─'.repeat(40));
  console.log(`Pages Tested: ${finalReport.testSummary.totalPages}`);
  console.log(`  - Protected properly: ${finalReport.testSummary.pagesPassedAuth}`);
  console.log(`  - Security issues: ${finalReport.testSummary.pagesFailedAuth}`);
  console.log(`API Endpoints Tested: ${finalReport.testSummary.totalAPIs}`);
  console.log(`  - Secured properly: ${finalReport.testSummary.apisPassedAuth}`);
  console.log(`  - Security issues: ${finalReport.testSummary.apisFailedAuth}`);
  console.log(`Forms Tested: ${finalReport.testSummary.totalForms}`);
  console.log(`  - Validation working: ${finalReport.testSummary.formsPassedValidation}`);
  console.log(`  - Validation issues: ${finalReport.testSummary.formsFailedValidation}`);
  
  console.log('\n🐛 BUGS BY SEVERITY');
  console.log('─'.repeat(40));
  
  const criticalBugs = finalReport.bugs.filter(b => b.severity === 'CRITICAL');
  const highBugs = finalReport.bugs.filter(b => b.severity === 'HIGH');
  const mediumBugs = finalReport.bugs.filter(b => b.severity === 'MEDIUM');
  const lowBugs = finalReport.bugs.filter(b => b.severity === 'LOW');
  
  console.log(`🔴 CRITICAL: ${criticalBugs.length} bugs`);
  if (criticalBugs.length > 0) {
    criticalBugs.forEach((bug, i) => {
      console.log(`   ${i+1}. ${bug.page} - ${bug.test}`);
      console.log(`      Expected: ${bug.expected}`);
      console.log(`      Actual: ${bug.actual}`);
    });
  }
  
  console.log(`\n🟠 HIGH: ${highBugs.length} bugs`);
  if (highBugs.length > 0) {
    highBugs.slice(0, 3).forEach((bug, i) => {
      console.log(`   ${i+1}. ${bug.page} - ${bug.test}`);
    });
    if (highBugs.length > 3) console.log(`   ... and ${highBugs.length - 3} more`);
  }
  
  console.log(`\n🟡 MEDIUM: ${mediumBugs.length} bugs`);
  console.log(`⚪ LOW: ${lowBugs.length} bugs`);
  
  console.log('\n✅ WORKING FEATURES');
  console.log('─'.repeat(40));
  const categories = [...new Set(finalReport.passedTests.map(t => t.category))];
  categories.forEach(cat => {
    const tests = finalReport.passedTests.filter(t => t.category === cat);
    console.log(`${cat}: ${tests.length} tests passed`);
  });
  
  console.log('\n🎯 FINAL VERDICT');
  console.log('─'.repeat(40));
  
  if (criticalBugs.length > 0) {
    console.log('❌ PLATFORM STATUS: NOT PRODUCTION READY');
    console.log('   Critical security vulnerabilities found!');
    console.log('   Frontend pages are accessible without authentication.');
  } else if (highBugs.length > 0) {
    console.log('⚠️ PLATFORM STATUS: NEEDS FIXES');
    console.log('   High severity issues must be resolved.');
  } else {
    console.log('✅ PLATFORM STATUS: PRODUCTION READY');
    console.log('   All critical tests passed!');
  }
  
  console.log('\n💡 RECOMMENDATIONS');
  console.log('─'.repeat(40));
  console.log('1. Implement frontend route guards for all protected pages');
  console.log('2. Fix payment endpoints to return JSON responses');
  console.log('3. Add comprehensive error handling');
  console.log('4. Implement CSRF protection');
  console.log('5. Add request logging and monitoring');
  console.log('6. Set up automated testing in CI/CD');
  
  console.log('\n' + '='.repeat(80));
  console.log(`Report Generated: ${new Date().toLocaleString()}`);
  console.log('Test Environment: Development');
  console.log('Base URL: ' + BASE_URL);
  console.log('='.repeat(80));
}

// Main test runner
async function runComprehensiveQATests() {
  console.log('🚀 STARTING COMPREHENSIVE QA AUTOMATION TESTS');
  console.log('='.repeat(80));
  
  try {
    await testAuthenticationSystem();
    await testFrontendPageSecurity();
    await testAPIEndpointSecurity();
    await testFormValidation();
    await testUserWorkflows();
    await testPaymentIntegration();
    await testResponsiveness();
    
    generateFinalReport();
    
    // Save report to file
    const fs = require('fs');
    fs.writeFileSync('qa-test-results.json', JSON.stringify(finalReport, null, 2));
    console.log('\n📁 Detailed report saved to: qa-test-results.json');
    
  } catch (error) {
    console.error('\n❌ Test suite error:', error.message);
    generateFinalReport();
  }
}

// Execute tests
runComprehensiveQATests();