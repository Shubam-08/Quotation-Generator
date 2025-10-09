# Testing Guide

Complete testing checklist to verify the authentication system works correctly.

## Pre-Testing Setup

### 1. Environment Configuration
```bash
# Verify environment is configured
npm run setup
```

Expected output: ✅ All environment variables configured

### 2. Create Admin User
```bash
# Create the admin account
npm run create-admin
```

Expected output: ✅ Admin user created successfully

### 3. Start Development Server
```bash
npm run dev
```

Expected output: Server running at http://localhost:3000

---

## Test Suite

### 🧪 Test 1: User Registration

**Steps:**
1. Navigate to http://localhost:3000/register
2. Fill in the form:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `password123`
   - Confirm Password: `password123`
3. Click "Create Account"

**Expected Results:**
- ✅ Redirected to `/login` page
- ✅ Success message or indication
- ✅ No errors in console

**Verification:**
```bash
# Check MongoDB for the new user
# User should exist with role: "user"
```

---

### 🧪 Test 2: User Login (Regular User)

**Steps:**
1. Navigate to http://localhost:3000/login
2. Enter credentials:
   - Email: `test@example.com`
   - Password: `password123`
3. Click "Sign In"

**Expected Results:**
- ✅ Redirected to `/products` page
- ✅ Navbar shows user name
- ✅ Navbar shows "Logout" button
- ✅ No "Admin" link in navbar
- ✅ Session persists on page refresh

---

### 🧪 Test 3: Admin Login

**Steps:**
1. Logout if currently logged in
2. Navigate to http://localhost:3000/login
3. Enter admin credentials:
   - Email: `admin@qlite.com`
   - Password: `admin123`
4. Click "Sign In"

**Expected Results:**
- ✅ Redirected to `/products` page
- ✅ Navbar shows "Admin" badge
- ✅ Navbar shows "Admin" link
- ✅ Can access `/admin` dashboard

---

### 🧪 Test 4: Admin Dashboard Access

**Steps:**
1. Login as admin (see Test 3)
2. Click "Admin" link in navbar
3. Navigate to http://localhost:3000/admin

**Expected Results:**
- ✅ Admin dashboard loads
- ✅ Product table displays
- ✅ "Add Product" button visible
- ✅ Edit/Delete buttons on each product

---

### 🧪 Test 5: Unauthorized Admin Access

**Steps:**
1. Logout if logged in
2. Login as regular user (`test@example.com`)
3. Try to navigate to http://localhost:3000/admin

**Expected Results:**
- ✅ Redirected to `/products` page
- ✅ Cannot access admin dashboard
- ✅ No "Admin" link in navbar

---

### 🧪 Test 6: Add Product (Admin Only)

**Steps:**
1. Login as admin
2. Navigate to `/admin`
3. Click "Add Product" button
4. Fill in the form:
   - SKU: `TEST-001`
   - Category: `Test Category`
   - Price (USD): `10.00`
5. Click "Create"

**Expected Results:**
- ✅ Modal closes
- ✅ Product appears in table
- ✅ Price converted to INR
- ✅ Product saved in database

**Verification:**
```bash
# Check MongoDB for the new product
# Product should exist with converted INR price
```

---

### 🧪 Test 7: Edit Product (Admin Only)

**Steps:**
1. Login as admin
2. Navigate to `/admin`
3. Click edit icon on a product
4. Modify some fields
5. Click "Update"

**Expected Results:**
- ✅ Modal closes
- ✅ Product updates in table
- ✅ Changes saved in database

---

### 🧪 Test 8: Delete Product (Admin Only)

**Steps:**
1. Login as admin
2. Navigate to `/admin`
3. Click delete icon on a product
4. Confirm deletion

**Expected Results:**
- ✅ Confirmation dialog appears
- ✅ Product removed from table
- ✅ Product deleted from database

---

### 🧪 Test 9: API Protection - Unauthorized Product Creation

**Steps:**
1. Logout if logged in
2. Open browser console
3. Try to create product via API:

```javascript
fetch('/api/products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sku: 'HACK-001',
    category: 'Test',
    price: 100
  })
})
.then(r => r.json())
.then(console.log)
```

**Expected Results:**
- ✅ Returns 401 Unauthorized error
- ✅ Product NOT created
- ✅ Error message: "Unauthorized"

---

### 🧪 Test 10: API Protection - User Trying Admin Action

**Steps:**
1. Login as regular user (`test@example.com`)
2. Open browser console
3. Try to create product via API:

```javascript
fetch('/api/products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sku: 'HACK-002',
    category: 'Test',
    price: 100
  })
})
.then(r => r.json())
.then(console.log)
```

**Expected Results:**
- ✅ Returns 403 Forbidden error
- ✅ Product NOT created
- ✅ Error message: "Forbidden: Admin access required"

---

### 🧪 Test 11: Session Persistence

**Steps:**
1. Login as any user
2. Refresh the page
3. Navigate to different pages
4. Close and reopen browser tab

**Expected Results:**
- ✅ User remains logged in after refresh
- ✅ Session persists across navigation
- ✅ Session persists in new tab (same browser)

---

### 🧪 Test 12: Logout Functionality

**Steps:**
1. Login as any user
2. Click "Logout" button in navbar
3. Try to access `/admin` (if was admin)

**Expected Results:**
- ✅ Redirected to home page
- ✅ Navbar shows "Login" and "Register"
- ✅ Cannot access protected routes
- ✅ Session cleared

---

### 🧪 Test 13: Invalid Login Attempts

**Steps:**
1. Navigate to `/login`
2. Try these invalid credentials:
   - Wrong email: `wrong@example.com` / `password123`
   - Wrong password: `test@example.com` / `wrongpassword`
   - Empty fields

**Expected Results:**
- ✅ Error message displayed
- ✅ User NOT logged in
- ✅ Remains on login page
- ✅ Appropriate error messages

---

### 🧪 Test 14: Registration Validation

**Steps:**
1. Navigate to `/register`
2. Try these invalid inputs:
   - Passwords don't match
   - Password too short (< 6 chars)
   - Duplicate email
   - Empty required fields

**Expected Results:**
- ✅ Validation errors displayed
- ✅ User NOT created
- ✅ Appropriate error messages

---

### 🧪 Test 15: Middleware Route Protection

**Steps:**
1. Logout completely
2. Try to directly access: http://localhost:3000/admin

**Expected Results:**
- ✅ Redirected to `/login` page
- ✅ Cannot access admin dashboard
- ✅ URL changes to login page

---

## API Testing with cURL

### Test Authentication Required
```bash
# Should return 401
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"sku":"TEST","category":"Test","price":10}'
```

### Test Get Products (Public)
```bash
# Should return products list
curl http://localhost:3000/api/products
```

---

## Security Checklist

### Password Security
- [ ] Passwords are hashed in database (not plain text)
- [ ] Password minimum length enforced (6 chars)
- [ ] Password confirmation required on registration

### Session Security
- [ ] Sessions use JWT tokens
- [ ] Sessions include user role
- [ ] Sessions expire appropriately
- [ ] Sessions cleared on logout

### API Security
- [ ] Admin APIs require authentication
- [ ] Admin APIs verify admin role
- [ ] Proper HTTP status codes (401, 403)
- [ ] Error messages don't leak sensitive info

### Route Security
- [ ] Middleware protects admin routes
- [ ] Unauthorized users redirected
- [ ] Client-side checks complement server-side
- [ ] No admin access for regular users

---

## Performance Testing

### Load Time
- [ ] Login page loads < 1 second
- [ ] Admin dashboard loads < 2 seconds
- [ ] Product list loads < 2 seconds

### Database Queries
- [ ] User lookup is efficient
- [ ] Product queries are optimized
- [ ] No N+1 query problems

---

## Browser Compatibility

Test in multiple browsers:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if on Mac)

---

## Mobile Responsiveness

Test on mobile devices or browser dev tools:
- [ ] Login form is usable
- [ ] Registration form is usable
- [ ] Admin dashboard is responsive
- [ ] Navigation works on mobile

---

## Error Handling

### Network Errors
- [ ] Graceful handling of network failures
- [ ] User-friendly error messages
- [ ] No app crashes

### Database Errors
- [ ] Connection failures handled
- [ ] Duplicate key errors caught
- [ ] Validation errors displayed

---

## Test Results Template

```
Test Date: _______________
Tester: _______________

┌────────────────────────────────────┬──────┬───────┐
│ Test Case                          │ Pass │ Notes │
├────────────────────────────────────┼──────┼───────┤
│ 1. User Registration               │  □   │       │
│ 2. User Login (Regular)            │  □   │       │
│ 3. Admin Login                     │  □   │       │
│ 4. Admin Dashboard Access          │  □   │       │
│ 5. Unauthorized Admin Access       │  □   │       │
│ 6. Add Product                     │  □   │       │
│ 7. Edit Product                    │  □   │       │
│ 8. Delete Product                  │  □   │       │
│ 9. API Protection (Unauthorized)   │  □   │       │
│ 10. API Protection (User)          │  □   │       │
│ 11. Session Persistence            │  □   │       │
│ 12. Logout Functionality           │  □   │       │
│ 13. Invalid Login Attempts         │  □   │       │
│ 14. Registration Validation        │  □   │       │
│ 15. Middleware Protection          │  □   │       │
└────────────────────────────────────┴──────┴───────┘

Overall Status: ____________
Issues Found: ____________
```

---

## Troubleshooting Common Issues

### Issue: "Cannot connect to database"
**Solution:** Check MongoDB URI in `.env.local`

### Issue: "Invalid session"
**Solution:** 
1. Check NEXTAUTH_SECRET is set
2. Clear browser cookies
3. Restart dev server

### Issue: "Admin already exists"
**Solution:** Admin was already created, use existing credentials

### Issue: Build fails
**Solution:** 
1. Run `npm install`
2. Check for TypeScript errors
3. Verify all imports are correct

---

## Automated Testing (Future Enhancement)

Consider adding:
- Jest for unit tests
- Playwright for E2E tests
- API testing with Supertest

---

**Testing Complete!** ✅

If all tests pass, your authentication system is working correctly!
