# Authentication Setup Guide

This application uses **NextAuth.js** with MongoDB for secure authentication and role-based access control.

## Features

- ✅ Secure login/logout system
- ✅ User registration
- ✅ Role-based access control (Admin & User)
- ✅ Session-based authentication
- ✅ Protected API routes
- ✅ Password hashing with bcryptjs

## User Roles

### Admin
- Access to `/admin` dashboard
- Can add, edit, and delete products
- Full CRUD operations on products via API

### User
- Can view products at `/products`
- Can generate quotations
- Cannot access admin dashboard or modify products

## Setup Instructions

### 1. Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# NextAuth Configuration
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

Or use an online generator: https://generate-secret.vercel.app/32

### 2. Create Admin User

Run the admin creation script:

```bash
node scripts/create-admin.js
```

This creates an admin user with:
- **Email:** admin@qlite.com
- **Password:** admin123

⚠️ **Important:** Change this password after first login!

### 3. Start the Application

```bash
npm run dev
```

## Usage

### For Admins

1. Navigate to `/login`
2. Login with admin credentials
3. Access the admin dashboard at `/admin`
4. Add, edit, or delete products

### For Regular Users

1. Navigate to `/register` to create an account
2. Login at `/login`
3. Browse products at `/products`
4. Generate quotations

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth handler (login/logout)

### Products (Protected)

- `GET /api/products` - Get all products (public)
- `POST /api/products` - Create product (admin only)
- `PUT /api/products?id={id}` - Update product (admin only)
- `DELETE /api/products?id={id}` - Delete product (admin only)

## Security Features

1. **Password Hashing:** All passwords are hashed using bcryptjs
2. **JWT Sessions:** Secure session management with NextAuth
3. **Role Verification:** Server-side role checks on all admin routes
4. **API Protection:** Admin APIs require authentication and admin role
5. **Middleware Protection:** Route-level protection for admin pages

## Creating Additional Admin Users

You can create additional admin users in two ways:

### Option 1: Via Registration API (Requires Code Modification)

Temporarily modify `/api/auth/register/route.ts` to allow admin role:

```typescript
// In the registration handler, set role to "admin"
role: "admin"
```

### Option 2: Via MongoDB

Directly update a user's role in MongoDB:

```javascript
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { role: "admin" } }
)
```

## Troubleshooting

### "Unauthorized" Error
- Ensure you're logged in
- Check if your session is valid
- Verify NEXTAUTH_SECRET is set correctly

### "Forbidden: Admin access required"
- Your account doesn't have admin role
- Contact an existing admin to upgrade your role

### Cannot Access Admin Dashboard
- Verify you're logged in as admin
- Check browser console for errors
- Ensure middleware is configured correctly

## File Structure

```
lib/
  ├── auth.ts                 # NextAuth configuration
  ├── auth-helpers.ts         # Authentication helper functions
  └── models/
      └── User.ts             # User model with roles

app/
  ├── api/
  │   ├── auth/
  │   │   ├── [...nextauth]/route.ts  # NextAuth API handler
  │   │   └── register/route.ts       # Registration endpoint
  │   └── products/route.ts            # Protected product APIs
  ├── admin/
  │   ├── page.tsx            # Admin dashboard
  │   └── layout.tsx          # Admin layout with SessionProvider
  ├── login/page.tsx          # Login page
  └── register/page.tsx       # Registration page

components/
  ├── Navbar.tsx              # Navigation with auth status
  └── Providers.tsx           # SessionProvider wrapper

middleware.ts                 # Route protection middleware
scripts/
  └── create-admin.js         # Admin user creation script
```

## Best Practices

1. **Never commit `.env.local`** - Keep secrets secure
2. **Change default admin password** immediately
3. **Use strong passwords** for all accounts
4. **Regularly update dependencies** for security patches
5. **Monitor admin access logs** in production

## Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [MongoDB Security Best Practices](https://www.mongodb.com/docs/manual/security/)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
