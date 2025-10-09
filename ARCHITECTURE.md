# System Architecture

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Actions                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Frontend Pages                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  Login   │  │ Register │  │ Products │  │  Admin   │       │
│  │  /login  │  │/register │  │/products │  │  /admin  │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Middleware Layer                            │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  middleware.ts - Route Protection                      │    │
│  │  • Checks authentication status                        │    │
│  │  • Verifies admin role for /admin routes              │    │
│  │  • Redirects unauthorized users                        │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Routes                                  │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │  Auth APIs       │  │  Product APIs    │                    │
│  │  /api/auth/*     │  │  /api/products   │                    │
│  │  • Login         │  │  • GET (public)  │                    │
│  │  • Register      │  │  • POST (admin)  │                    │
│  │  • Logout        │  │  • PUT (admin)   │                    │
│  │                  │  │  • DELETE (admin)│                    │
│  └──────────────────┘  └──────────────────┘                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Authentication Layer                           │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  NextAuth.js (lib/auth.ts)                            │    │
│  │  • Credentials Provider                                │    │
│  │  • JWT Session Strategy                               │    │
│  │  • Role-based Callbacks                               │    │
│  └────────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Auth Helpers (lib/auth-helpers.ts)                   │    │
│  │  • requireAuth() - Check if user is logged in         │    │
│  │  • requireAdmin() - Check if user is admin            │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Database Layer                              │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  MongoDB (via Mongoose)                                │    │
│  │  ┌──────────────┐  ┌──────────────┐                   │    │
│  │  │ Users        │  │ Products     │                   │    │
│  │  │ • name       │  │ • sku        │                   │    │
│  │  │ • email      │  │ • category   │                   │    │
│  │  │ • password   │  │ • price      │                   │    │
│  │  │ • role       │  │ • ...        │                   │    │
│  │  └──────────────┘  └──────────────┘                   │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
app/
├── layout.tsx (Root Layout)
│   └── Providers (SessionProvider + CartProvider)
│       ├── Navbar (Auth-aware navigation)
│       └── {children} (Page content)
│
├── login/page.tsx
│   └── Login Form
│       └── signIn() from next-auth/react
│
├── register/page.tsx
│   └── Registration Form
│       └── POST /api/auth/register
│
├── products/page.tsx
│   └── Product List (Public)
│       └── GET /api/products
│
└── admin/
    ├── layout.tsx (SessionProvider)
    └── page.tsx (Protected)
        ├── useSession() - Check auth & role
        ├── Product Table
        └── CRUD Operations
            ├── POST /api/products (Create)
            ├── PUT /api/products (Update)
            └── DELETE /api/products (Delete)
```

## Authentication Flow Diagram

### Login Flow
```
User enters credentials
        │
        ▼
POST /api/auth/signin
        │
        ▼
NextAuth validates credentials
        │
        ├─── Invalid ──→ Return error
        │
        ▼ Valid
Find user in MongoDB
        │
        ▼
Compare password hash (bcrypt)
        │
        ├─── Mismatch ──→ Return error
        │
        ▼ Match
Create JWT token with user data
        │
        ▼
Set session cookie
        │
        ▼
Return success + redirect
```

### Protected Route Access
```
User navigates to /admin
        │
        ▼
Middleware intercepts request
        │
        ▼
Check session token
        │
        ├─── No token ──→ Redirect to /login
        │
        ▼ Has token
Verify JWT signature
        │
        ├─── Invalid ──→ Redirect to /login
        │
        ▼ Valid
Check user role in token
        │
        ├─── Not admin ──→ Redirect to /products
        │
        ▼ Is admin
Allow access to /admin
```

### API Protection Flow
```
Client makes API request
        │
        ▼
API route handler
        │
        ▼
Call requireAdmin()
        │
        ▼
getServerSession()
        │
        ├─── No session ──→ 401 Unauthorized
        │
        ▼ Has session
Check session.user.role
        │
        ├─── Not admin ──→ 403 Forbidden
        │
        ▼ Is admin
Process request
        │
        ▼
Return response
```

## Data Flow

### User Registration
```
Client                  Server                  Database
  │                       │                       │
  │ POST /api/auth/       │                       │
  │ register              │                       │
  ├──────────────────────>│                       │
  │                       │                       │
  │                       │ Hash password         │
  │                       │ (bcrypt)              │
  │                       │                       │
  │                       │ Create user           │
  │                       ├──────────────────────>│
  │                       │                       │
  │                       │ User saved            │
  │                       │<──────────────────────┤
  │                       │                       │
  │ Success response      │                       │
  │<──────────────────────┤                       │
  │                       │                       │
```

### Product Creation (Admin)
```
Client                  Server                  Database
  │                       │                       │
  │ POST /api/products    │                       │
  ├──────────────────────>│                       │
  │                       │                       │
  │                       │ requireAdmin()        │
  │                       │ Check session         │
  │                       │                       │
  │                       │ Convert USD→INR       │
  │                       │                       │
  │                       │ Save product          │
  │                       ├──────────────────────>│
  │                       │                       │
  │                       │ Product saved         │
  │                       │<──────────────────────┤
  │                       │                       │
  │ Product data          │                       │
  │<──────────────────────┤                       │
  │                       │                       │
```

## Security Layers

```
┌─────────────────────────────────────────────────────────┐
│ Layer 1: Client-Side Protection                         │
│ • useSession() hook checks auth status                  │
│ • Conditional rendering based on role                   │
│ • Redirect unauthenticated users                        │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ Layer 2: Middleware Protection                          │
│ • Intercepts requests to protected routes               │
│ • Verifies JWT token validity                           │
│ • Checks user role for admin routes                     │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ Layer 3: API Route Protection                           │
│ • Server-side session verification                      │
│ • Role-based authorization checks                       │
│ • Returns 401/403 for unauthorized access               │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ Layer 4: Database Security                              │
│ • Password hashing (bcrypt)                             │
│ • Unique email constraint                               │
│ • Role validation (enum)                                │
└─────────────────────────────────────────────────────────┘
```

## Session Management

```
┌──────────────────────────────────────────────────────────┐
│                    JWT Token Structure                    │
├──────────────────────────────────────────────────────────┤
│  {                                                        │
│    "user": {                                              │
│      "id": "user_id",                                     │
│      "email": "user@example.com",                         │
│      "name": "User Name",                                 │
│      "role": "admin" | "user"                             │
│    },                                                     │
│    "iat": 1234567890,  // Issued at                      │
│    "exp": 1234567890   // Expiration                     │
│  }                                                        │
└──────────────────────────────────────────────────────────┘
```

## Role-Based Access Matrix

```
┌──────────────────┬─────────┬──────────┬─────────┐
│ Resource         │ Guest   │ User     │ Admin   │
├──────────────────┼─────────┼──────────┼─────────┤
│ /                │ ✅      │ ✅       │ ✅      │
│ /login           │ ✅      │ ✅       │ ✅      │
│ /register        │ ✅      │ ✅       │ ✅      │
│ /products        │ ✅      │ ✅       │ ✅      │
│ /admin           │ ❌      │ ❌       │ ✅      │
│ GET /api/products│ ✅      │ ✅       │ ✅      │
│ POST /api/products│ ❌     │ ❌       │ ✅      │
│ PUT /api/products│ ❌      │ ❌       │ ✅      │
│ DELETE /api/products│ ❌   │ ❌       │ ✅      │
└──────────────────┴─────────┴──────────┴─────────┘
```

## Technology Stack

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Layer                        │
│  • Next.js 15 (App Router)                              │
│  • React 19                                              │
│  • TailwindCSS 4                                         │
│  • Lucide Icons                                          │
│  • next-auth/react (Client hooks)                       │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│                   Authentication Layer                   │
│  • NextAuth.js 4.24                                     │
│  • JWT Strategy                                          │
│  • Credentials Provider                                  │
│  • bcryptjs (Password hashing)                          │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│                    Backend Layer                         │
│  • Next.js API Routes                                   │
│  • Server Components                                     │
│  • Middleware                                            │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│                    Database Layer                        │
│  • MongoDB Atlas                                         │
│  • Mongoose ODM                                          │
│  • Schema Validation                                     │
└─────────────────────────────────────────────────────────┘
```

---

This architecture provides:
- ✅ **Defense in depth** - Multiple security layers
- ✅ **Separation of concerns** - Clear component boundaries
- ✅ **Scalability** - Modular design for easy expansion
- ✅ **Maintainability** - Well-organized code structure
- ✅ **Security** - Role-based access at every level
