# New Features Documentation

## ✅ Implemented Features

### 1. Admin Setup Script
- **Location**: `scripts/setup-admin.js`
- **Usage**: `npm run setup-admin`
- **Features**:
  - Interactive script to create or update admin users
  - Sets admin role and email verification
  - Hashes passwords securely

### 2. Admin Password Change
- **Location**: Admin Panel (`/admin`)
- **Features**:
  - "Change Password" button in admin panel
  - Requires current password verification
  - Validates new password (min 6 characters)
  - Secure password hashing

### 3. Email OTP Verification System
- **Signup Flow**:
  1. User enters name and email
  2. System sends 6-digit OTP to email
  3. User enters OTP and sets password
  4. Account is verified and created

- **Features**:
  - OTP expires in 10 minutes
  - Resend OTP functionality
  - Email verification required before login
  - Beautiful HTML email templates

### 4. Order History & Reorder
- **Location**: Profile Page (`/profile`)
- **Features**:
  - View all past orders
  - Order details with status
  - "Reorder" button for each order
  - Automatically adds items to cart
  - Checks stock availability
  - Navigates to cart after reorder

### 5. Enhanced User Authentication
- **Email Verification Required**: Users must verify email before login
- **Secure Password Storage**: Passwords are hashed with bcrypt
- **OTP System**: 6-digit codes sent via email

### 6. Wishlist
- **Location**: Wishlist Page (`/wishlist`)
- **Features**:
  - Heart icon on product cards to add/remove items
  - Dedicated wishlist page to view all saved items
  - Quick add to cart from wishlist
  - Wishlist count badge in navbar
  - Works with product variants (color, size)
  - Authentication required

## 📋 API Endpoints

### Admin
- `POST /api/admin/change-password` - Change admin password

### Authentication
- `POST /api/auth/register` - Register with email (sends OTP)
- `POST /api/auth/verify-otp` - Verify OTP and set password
- `POST /api/auth/resend-otp` - Resend OTP to email

### Orders
- `POST /api/orders/reorder` - Reorder items from a previous order

### Wishlist
- `GET /api/wishlist` - Get user's wishlist items
- `POST /api/wishlist` - Add item to wishlist
- `DELETE /api/wishlist` - Remove item from wishlist
- `GET /api/wishlist/check` - Check if item is in wishlist

## 🗄️ Database Changes

### User Model Updates
- `emailVerified` (Boolean) - Tracks email verification status
- `otp` (String, optional) - Stores OTP code
- `otpExpires` (DateTime, optional) - OTP expiration time
- `password` (String, optional) - Now optional (set after OTP verification)

## 🚀 How to Use

### Setup Admin
```bash
npm run setup-admin
```
Follow the prompts to create an admin account.

### User Signup Flow
1. Go to `/auth/signup`
2. Enter name and email
3. Check email for OTP
4. Enter OTP and set password
5. Account created and verified!

### Admin Password Change
1. Login as admin
2. Go to `/admin`
3. Click "Change Password"
4. Enter current and new password
5. Password updated!

### Reorder Items
1. Go to `/profile`
2. Find the order you want to reorder
3. Click "Reorder" button
4. Items added to cart automatically
5. Proceed to checkout

## 📧 Email Configuration

Make sure your `.env` file has proper SMTP settings:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=your-email@gmail.com
```

For Gmail, you need to:
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password in SMTP_PASSWORD

## 🔒 Security Features

- Email verification required
- OTP expiration (10 minutes)
- Password hashing with bcrypt
- Current password verification for admin password change
- Stock validation on reorder

## 📝 Notes

- OTP codes are 6 digits
- OTP expires after 10 minutes
- Users cannot login until email is verified
- Reorder checks stock availability
- Unavailable items are skipped during reorder

