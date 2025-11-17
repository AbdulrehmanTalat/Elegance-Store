# Authentication & Redirect Flow Explained

## Overview
This document explains how authentication and redirects work in the Elegance Store application, including why we had redirect loops and how they were fixed.

---

## 🔐 Authentication Flow

### 1. **User Signs In** (`/auth/signin`)

```
User enters email/password
    ↓
POST to /api/auth/signin (NextAuth)
    ↓
NextAuth validates credentials
    ↓
Creates JWT token with user info (id, role, email)
    ↓
Token stored in HTTP-only cookie
    ↓
Session created
```

**Key Point:** The token is stored in a cookie that's sent with every request.

---

## 🛡️ Middleware Protection (Server-Side)

### What is Middleware?
Middleware runs on **every request** before the page loads. It's like a security guard checking your ID before you enter.

### How It Works:

```typescript
// middleware.ts runs BEFORE any page loads

1. Request comes in → /profile
    ↓
2. Middleware checks: "Do you have a token?"
    ↓
3. If NO token → Redirect to /auth/signin
    ↓
4. If YES token → Check role/permissions
    ↓
5. Allow or redirect based on role
```

### Middleware Matcher
The middleware only runs on specific routes:
- `/admin/*` - Admin pages
- `/profile/*` - User profile
- `/checkout/*` - Checkout
- `/orders/*` - Orders
- `/auth/signin` - Sign-in page

**Why?** We don't want to check auth on public pages like `/products` or `/`.

---

## 🔄 Redirect Flow After Sign-In

### Step-by-Step Process:

```
1. User submits sign-in form
    ↓
2. NextAuth authenticates user
    ↓
3. Client-side code fetches session
    ↓
4. Client redirects: window.location.href = '/profile'
    ↓
5. Browser makes NEW request to /profile
    ↓
6. Middleware intercepts request
    ↓
7. Middleware checks token in cookie
    ↓
8. Token exists? → Allow access to /profile
    ↓
9. Page loads with user data
```

---

## 🚫 Why We Had Redirect Loops

### The Problem:

```
User signs in
    ↓
Redirects to /profile
    ↓
Profile page loads
    ↓
Client-side code checks: "Is session loaded?"
    ↓
Session not ready yet (still loading)
    ↓
Client redirects: window.location.href = '/auth/signin'
    ↓
Middleware sees token → Redirects back to /profile
    ↓
Profile page loads again
    ↓
Client redirects again → LOOP! 🔄
```

### Root Cause:
- **Client-side code** was redirecting before session was ready
- **Middleware** was redirecting based on token (which exists)
- **Conflict** between client and server redirects

---

## ✅ How We Fixed It

### Solution 1: Removed Client-Side Redirects

**Before:**
```typescript
// Profile page
if (!session) {
  window.location.href = '/auth/signin' // ❌ Causes loop
}
```

**After:**
```typescript
// Profile page
// Middleware handles redirects - we just wait for session
if (session) {
  fetchOrders() // ✅ Just fetch data
}
```

### Solution 2: Middleware Handles Everything

**Middleware is now the single source of truth:**
- ✅ Checks authentication
- ✅ Redirects unauthenticated users
- ✅ Redirects authenticated users away from sign-in
- ✅ Enforces role-based access

**Client-side pages:**
- ✅ Just wait for session to load
- ✅ Fetch data when session is available
- ✅ No redirect logic

---

## 📋 Current Flow (Fixed)

### Scenario 1: Unauthenticated User Tries to Access /profile

```
1. User visits /profile
    ↓
2. Middleware checks token → NO token found
    ↓
3. Middleware redirects to /auth/signin
    ↓
4. Sign-in page loads
    ↓
5. User signs in
    ↓
6. Client redirects to /profile
    ↓
7. Middleware checks token → Token exists ✅
    ↓
8. Profile page loads successfully
```

### Scenario 2: Authenticated User Visits /auth/signin

```
1. User visits /auth/signin
    ↓
2. Middleware checks token → Token exists ✅
    ↓
3. Middleware redirects to /admin or /profile
    ↓
4. User never sees sign-in page
```

### Scenario 3: Admin Tries to Access Regular User Route

```
1. Admin visits /profile
    ↓
2. Middleware checks token → Token exists ✅
    ↓
3. Middleware checks role → ADMIN ✅
    ↓
4. Profile page loads (admins can access)
```

### Scenario 4: Regular User Tries to Access /admin

```
1. User visits /admin
    ↓
2. Middleware checks token → Token exists ✅
    ↓
3. Middleware checks role → USER (not ADMIN) ❌
    ↓
4. Middleware redirects to / (home page)
```

---

## 🔑 Key Concepts

### 1. **Server-Side vs Client-Side**

**Server-Side (Middleware):**
- Runs before page loads
- Has access to token immediately
- Can redirect before any HTML is sent
- ✅ Reliable, no timing issues

**Client-Side (React Components):**
- Runs after page loads
- Session might not be ready yet
- Can cause timing issues
- ❌ Can cause loops if used for redirects

### 2. **Token vs Session**

**Token (JWT in Cookie):**
- Stored in HTTP-only cookie
- Available immediately in middleware
- Contains: user id, role, email
- ✅ Always available on server

**Session (Client-Side):**
- Fetched from `/api/auth/session`
- Takes time to load
- Used by React components
- ⏳ Might not be ready immediately

### 3. **Why Hard Redirects?**

**`window.location.href` (Hard Redirect):**
- Full page reload
- Clears React state
- Breaks any loops
- ✅ Reliable

**`router.push()` or `router.replace()` (Soft Redirect):**
- Client-side navigation
- Keeps React state
- Can cause loops
- ❌ Unreliable for auth redirects

---

## 🎯 Best Practices Applied

1. **Single Source of Truth**
   - Middleware handles ALL redirects
   - Client-side code doesn't redirect

2. **Wait for Session**
   - Client-side waits for `status === 'authenticated'`
   - Don't redirect while `status === 'loading'`

3. **Hard Redirects After Sign-In**
   - Use `window.location.href` after authentication
   - Ensures clean state

4. **Proper Session Checks**
   - Check `status === 'unauthenticated'` not just `!session`
   - Session might be loading

---

## 🐛 Common Issues & Solutions

### Issue: "Redirecting..." Forever
**Cause:** Client-side redirect conflicting with middleware
**Solution:** Remove client-side redirects, let middleware handle it

### Issue: ERR_TOO_MANY_REDIRECTS
**Cause:** Loop between pages
**Solution:** Use hard redirects and remove conflicting logic

### Issue: Session Not Ready
**Cause:** Redirecting before session loads
**Solution:** Wait for `status === 'authenticated'` before using session

---

## 📊 Flow Diagram

```
┌─────────────────┐
│  User Request   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Middleware    │ ◄─── Checks token in cookie
└────────┬────────┘
         │
    ┌────┴────┐
    │        │
    ▼         ▼
Token?    No Token?
    │         │
    │         └──► Redirect to /auth/signin
    │
    ▼
Check Role
    │
    ├──► Admin? → Allow /admin
    │
    └──► User? → Allow /profile
```

---

## 💡 Summary

**The Golden Rule:**
> **Middleware handles redirects. Client-side code just waits and fetches data.**

**Why This Works:**
1. Middleware runs first (server-side)
2. Token is always available in middleware
3. No timing issues
4. No conflicts between client and server
5. Single source of truth

**What We Learned:**
- Don't redirect on the client for auth
- Wait for session to load
- Trust the middleware
- Use hard redirects when needed

