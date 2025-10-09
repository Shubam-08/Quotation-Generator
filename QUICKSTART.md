# Quick Start Guide

Get your QLite Global application up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (or local MongoDB)
- Git (optional)

## Step-by-Step Setup

### 1️⃣ Install Dependencies

```bash
npm install
```

### 2️⃣ Configure Environment

Create `.env.local` file in the root directory:

```bash
# Copy the example file
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/qlite_quotation

# NextAuth Secret (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=your-generated-secret-here

# Application URL
NEXTAUTH_URL=http://localhost:3000
```

**Generate NEXTAUTH_SECRET:**
```bash
# On Mac/Linux
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### 3️⃣ Verify Setup

```bash
npm run setup
```

This will check if all environment variables are configured correctly.

### 4️⃣ Create Admin User

```bash
npm run create-admin
```

This creates an admin account:
- **Email:** admin@qlite.com
- **Password:** admin123

### 5️⃣ Start the Application

```bash
npm run dev
```

Visit **http://localhost:3000** in your browser!

## First Login

1. Navigate to **http://localhost:3000/login**
2. Login with admin credentials:
   - Email: `admin@qlite.com`
   - Password: `admin123`
3. **Important:** Change your password immediately!

## What's Next?

### As Admin:
- Visit `/admin` to manage products
- Add your first product
- Edit or delete existing products

### As User:
- Register a new account at `/register`
- Browse products at `/products`
- Generate quotations

## Troubleshooting

### "Cannot connect to MongoDB"
- Check your `MONGODB_URI` is correct
- Ensure your IP is whitelisted in MongoDB Atlas
- Verify network connectivity

### "Invalid session"
- Check `NEXTAUTH_SECRET` is set
- Clear browser cookies
- Restart the dev server

### "Admin already exists"
- Admin user was already created
- Use existing credentials or reset in MongoDB

### Port 3000 already in use
```bash
# Use a different port
PORT=3001 npm run dev
```

## Common Commands

```bash
# Development
npm run dev              # Start dev server

# Setup
npm run setup            # Check environment
npm run create-admin     # Create admin user

# Production
npm run build            # Build for production
npm start                # Start production server
```

## Need Help?

- 📖 [Full Documentation](./README.md)
- 🔐 [Authentication Guide](./AUTH_SETUP.md)
- 💾 [MongoDB Setup](./MONGODB_SETUP.md)

## Security Checklist

- [ ] Changed default admin password
- [ ] Generated unique NEXTAUTH_SECRET
- [ ] Added `.env.local` to `.gitignore`
- [ ] Configured MongoDB IP whitelist
- [ ] Using strong passwords for all accounts

---

**Ready to go!** 🚀 Your application should now be running at http://localhost:3000
