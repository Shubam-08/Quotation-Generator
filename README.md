# Qlite Global - Product Quotation System

A modern product quotation and management system built with Next.js, MongoDB, and NextAuth.js.

## Features

- 🔐 **Secure Authentication** - Login/logout with NextAuth.js
- 👥 **Role-Based Access Control** - Admin and User roles
- 📦 **Product Management** - Full CRUD operations for admins
- 🏷️ **Multiple IP Ratings** - Support for products with multiple IP rating variants
- 💰 **Multi-Currency Support** - Real-time currency conversion (USD, EUR, GBP, QAR, AED, SAR, BHD, OMR, INR)
- 📄 **Quotation Generation** - Professional PDF and Excel export with IP ratings
- 🛒 **Smart Cart System** - Separate entries for different IP rating selections
- 🎨 **Modern UI** - Built with TailwindCSS and Lucide icons
- 🖼️ **Flexible Image Hosting** - Support for direct URLs, ImgBB, and Google Drive

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
MONGODB_URI=your-mongodb-connection-string
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

See [AUTH_SETUP.md](./AUTH_SETUP.md) for detailed authentication setup.

### 3. Create Admin User

```bash
node scripts/create-admin.js
```

### 4. Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## User Roles

### Admin
- Access admin dashboard at `/admin`
- Add, edit, and delete products
- Full product management capabilities

### User
- Browse products at `/products`
- Generate quotations (PDF/Excel)
- View product details

## Default Admin Credentials

After running the create-admin script:
- **Email:** admin@qlite.com
- **Password:** admin123

⚠️ **Change this password immediately after first login!**

## Project Structure

```
app/
  ├── admin/              # Admin dashboard (protected)
  ├── login/              # Login page
  ├── register/           # User registration
  ├── products/           # Product listing
  └── api/
      ├── auth/           # Authentication endpoints
      ├── products/       # Product CRUD APIs (protected)
      └── quotations/     # Quotation generation

lib/
  ├── auth.ts             # NextAuth configuration
  ├── auth-helpers.ts     # Auth utility functions
  └── models/             # MongoDB models

components/
  ├── Navbar.tsx          # Navigation with auth
  └── Providers.tsx       # Context providers

middleware.ts             # Route protection
```

## Documentation

- [Authentication Setup Guide](./AUTH_SETUP.md) - Detailed auth configuration
- [MongoDB Setup Guide](./MONGODB_SETUP.md) - Database configuration
- [IP Rating Implementation](./IP_RATING_IMPLEMENTATION.md) - Multiple IP ratings feature
- [Production Readiness](./PRODUCTION_READINESS.md) - Pre-deployment checklist

## Technologies

- **Framework:** Next.js 15 (App Router)
- **Database:** MongoDB with Mongoose
- **Authentication:** NextAuth.js
- **Styling:** TailwindCSS
- **Icons:** Lucide React
- **PDF Generation:** jsPDF
- **Excel Export:** XLSX

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [MongoDB Documentation](https://www.mongodb.com/docs/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
