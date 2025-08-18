# Innovative Task Earn - Test User Credentials

## Test Accounts for Development Mode

### 1. John Doe - Fully Verified User (KYC Complete)
- **Email:** john.doe@innovativetaskearn.online
- **Password:** john123
- **Status:** Active
- **KYC:** Approved with ₹99 payment completed
- **Balance:** ₹250.00
- **Usage:** Test fully verified user features, task completion, payouts

### 2. Alex Kumar - Suspended User (Needs Reactivation)
- **Email:** alex.kumar@innovativetaskearn.online
- **Password:** alex123
- **Status:** Suspended
- **Suspension Reason:** Failed to complete minimum daily tasks
- **Required:** ₹49 reactivation fee
- **Usage:** Test suspended user flow and payment reactivation

### 3. Demo User - Verified User
- **Email:** demo@innovativetaskearn.online
- **Password:** demo123
- **Status:** Active
- **KYC:** Approved
- **Balance:** ₹1000.00
- **Usage:** General testing and demonstrations

### 4. Priya Patel - Verified User
- **Email:** priya.patel@test.com
- **Password:** priya123
- **Status:** Active
- **KYC:** Approved
- **Balance:** ₹89.50

### 5. Rahul Sharma - Pending KYC
- **Email:** rahul.sharma@test.com
- **Password:** rahul123
- **Status:** Active
- **KYC:** Pending
- **Balance:** ₹125.00

### 6. Suspended User - Basic Suspended Account
- **Email:** suspended@test.com
- **Password:** suspended123
- **Status:** Suspended
- **KYC:** Pending
- **Balance:** ₹0.00

## Admin Access
- **Username:** admin
- **Password:** admin123
- **URL:** /admin

## Testing Scenarios

### Test KYC Completion (John Doe):
1. Login with John's credentials
2. Navigate to /kyc
3. View completed KYC with all documents
4. Check payment status shows "Completed"

### Test Suspended User Flow (Alex Kumar):
1. Login with Alex's credentials
2. Automatically redirected to /suspended page
3. Click "Pay ₹49 to Reactivate"
4. Complete payment via Cashfree
5. Account reactivated and redirected to dashboard

### Test Admin Panel:
1. Login to /admin with admin credentials
2. View all users in Users section
3. Check John shows as "Active" with KYC approved
4. Check Alex shows as "Suspended" with reason
5. Manage users, payouts, and tasks

## Notes
- All test users work in development mode
- Passwords are securely hashed with bcrypt
- Users appear in admin panel immediately
- Payment flows use Cashfree production API