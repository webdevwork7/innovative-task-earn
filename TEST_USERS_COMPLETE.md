# Complete Test User Accounts for Innovative Task Earn

## Overview
This document lists all test user accounts with their different KYC statuses, verification states, and account conditions.

---

## 1. Admin Account
- **Email**: admin@innovativetaskearn.online
- **Password**: admin123
- **Status**: Active
- **Role**: Admin
- **Features**: Full admin access, can manage users, tasks, KYC, payouts

---

## 2. Demo User (Regular Active)
- **Email**: demo@innovativetaskearn.online
- **Password**: demo123
- **Status**: Active
- **KYC Status**: Pending
- **Balance**: ₹1,250.50
- **Work Hours**: Not tracked (unverified)
- **Description**: Standard user with signup bonus, hasn't started KYC

---

## 3. John Doe (Fully Verified High Performer)
- **Email**: john.doe@innovativetaskearn.online
- **Password**: verified123
- **Status**: Active ✅
- **KYC Status**: Verified ✅
- **Balance**: ₹4,500.75
- **Work Hours Today**: 8.5 hours (exceeding requirement)
- **Total Work Days**: 45 days
- **Description**: Model user, meets all requirements, high earner

---

## 4. Priya Sharma (KYC Documents Uploaded, Payment Pending)
- **Email**: priya.sharma@innovativetaskearn.online
- **Password**: priya123
- **Status**: Active
- **KYC Status**: Submitted (awaiting ₹99 payment)
- **Balance**: ₹1,350
- **Work Hours Today**: 2.3 hours
- **Description**: Uploaded KYC documents but hasn't paid the ₹99 fee

---

## 5. Alex Kumar (Suspended - Work Hour Violation)
- **Email**: alex.kumar@innovativetaskearn.online
- **Password**: alex123
- **Status**: Suspended ⚠️
- **KYC Status**: Verified
- **Balance**: ₹2,100
- **Work Hours**: 3.5 hours (failed 8-hour requirement)
- **Suspension Reason**: "Failed to complete 8-hour work requirement. Only worked 3.5 hours."
- **Description**: Was verified but got suspended for not meeting daily work requirement

---

## 6. Raj Patel (KYC Rejected)
- **Email**: raj.patel@innovativetaskearn.online
- **Password**: raj123
- **Status**: Active
- **KYC Status**: Rejected ❌
- **Balance**: ₹1,100
- **Description**: Paid ₹99 fee but documents were rejected, needs to resubmit

---

## 7. Sarah Wilson (Top Performer)
- **Email**: sarah.wilson@innovativetaskearn.online
- **Password**: sarah123
- **Status**: Active ✅
- **KYC Status**: Verified ✅
- **Balance**: ₹12,500 (highest earner)
- **Work Hours Today**: 9.2 hours
- **Total Work Days**: 120 days
- **Description**: Top performer with highest balance, excellent track record

---

## 8. Amit Singh (New User)
- **Email**: amit.singh@innovativetaskearn.online
- **Password**: amit123
- **Status**: Active
- **KYC Status**: Pending
- **Balance**: ₹1,000 (only signup bonus)
- **Joined**: Today
- **Description**: Brand new user, just signed up with welcome bonus

---

## 9. Maya Gupta (Suspended - Fraud)
- **Email**: maya.gupta@innovativetaskearn.online
- **Password**: maya123
- **Status**: Suspended ⛔
- **KYC Status**: Pending
- **Balance**: ₹750
- **Suspension Reason**: "Multiple fraudulent task submissions detected."
- **Description**: Suspended for policy violations, not work hours

---

## 10. Neha Reddy (KYC Under Review)
- **Email**: neha.reddy@innovativetaskearn.online
- **Password**: neha123
- **Status**: Active
- **KYC Status**: Submitted (paid ₹99, under review)
- **Balance**: ₹1,850
- **Work Hours Today**: 4.7 hours
- **Description**: Paid KYC fee and documents are being reviewed

---

## Quick Reference Table

| User | Email | Password | Status | KYC Status | Key Feature |
|------|-------|----------|--------|------------|-------------|
| Admin | admin@innovativetaskearn.online | admin123 | Active | Verified | Admin Access |
| Demo | demo@innovativetaskearn.online | demo123 | Active | Pending | Regular User |
| John | john.doe@innovativetaskearn.online | verified123 | Active | Verified | 8.5h worked |
| Priya | priya.sharma@innovativetaskearn.online | priya123 | Active | Submitted | KYC unpaid |
| Alex | alex.kumar@innovativetaskearn.online | alex123 | Suspended | Verified | Work violation |
| Raj | raj.patel@innovativetaskearn.online | raj123 | Active | Rejected | KYC rejected |
| Sarah | sarah.wilson@innovativetaskearn.online | sarah123 | Active | Verified | Top earner |
| Amit | amit.singh@innovativetaskearn.online | amit123 | Active | Pending | New user |
| Maya | maya.gupta@innovativetaskearn.online | maya123 | Suspended | Pending | Fraud |
| Neha | neha.reddy@innovativetaskearn.online | neha123 | Active | Submitted | KYC review |

---

## Testing Scenarios

### 1. **KYC Flow Testing**
- Use **Priya** to test KYC payment requirement
- Use **Neha** to see KYC under review status
- Use **Raj** to test KYC rejection flow

### 2. **Work Time Tracking**
- Use **John** or **Sarah** to see work time display (verified users)
- Use **Alex** to test suspended account reactivation (₹49 fee)

### 3. **Account States**
- Use **Maya** to test fraud suspension
- Use **Amit** to test new user experience
- Use **Demo** to test regular user flow

### 4. **High Performance**
- Use **Sarah** to see top performer dashboard
- Use **John** to see good standing verified user

---

## Notes
- All passwords follow pattern: firstname + "123" (e.g., john123, priya123)
- Verified users have work time tracking enabled
- Suspended users need ₹49 reactivation payment
- KYC verification requires ₹99 payment
- New users get ₹1000 signup bonus automatically