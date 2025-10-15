# AWS S3 Integration - Architecture Diagram

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────┐              ┌──────────────────────┐    │
│  │   Admin Dashboard    │              │   Products Page      │    │
│  │   /admin             │              │   /products          │    │
│  │                      │              │                      │    │
│  │  • Upload Files      │              │  • View Files        │    │
│  │  • Manage Products   │              │  • Download Links    │    │
│  │  • Preview Files     │              │  • File Badges       │    │
│  └──────────┬───────────┘              └──────────┬───────────┘    │
│             │                                      │                 │
└─────────────┼──────────────────────────────────────┼─────────────────┘
              │                                      │
              │                                      │
┌─────────────┼──────────────────────────────────────┼─────────────────┐
│             │         NEXT.JS API LAYER            │                 │
├─────────────┼──────────────────────────────────────┼─────────────────┤
│             ▼                                      ▼                 │
│  ┌──────────────────────┐              ┌──────────────────────┐    │
│  │  POST /api/upload    │              │  GET /api/products   │    │
│  │                      │              │                      │    │
│  │  • Validate file     │              │  • Fetch products    │    │
│  │  • Check auth        │              │  • Include file URLs │    │
│  │  • Upload to S3      │              │                      │    │
│  │  • Return URL        │              │                      │    │
│  └──────────┬───────────┘              └──────────┬───────────┘    │
│             │                                      │                 │
│             │                          ┌───────────┴───────────┐    │
│             │                          │ PUT/GET               │    │
│             │                          │ /api/products/files   │    │
│             │                          │                       │    │
│             │                          │ • Add/remove files    │    │
│             │                          │ • Get product files   │    │
│             │                          └───────────┬───────────┘    │
│             │                                      │                 │
└─────────────┼──────────────────────────────────────┼─────────────────┘
              │                                      │
              │                                      │
┌─────────────┼──────────────────────────────────────┼─────────────────┐
│             │         BUSINESS LOGIC               │                 │
├─────────────┼──────────────────────────────────────┼─────────────────┤
│             ▼                                      ▼                 │
│  ┌──────────────────────┐              ┌──────────────────────┐    │
│  │   lib/s3.ts          │              │  lib/models/         │    │
│  │                      │              │  Product.ts          │    │
│  │  • uploadFileToS3()  │              │                      │    │
│  │  • deleteFileFromS3()│              │  • productImages[]   │    │
│  │  • validateFile()    │              │  • datasheets[]      │    │
│  │  • getFolderName()   │              │  • iesFiles[]        │    │
│  │                      │              │  • certifications[]  │    │
│  └──────────┬───────────┘              └──────────┬───────────┘    │
│             │                                      │                 │
└─────────────┼──────────────────────────────────────┼─────────────────┘
              │                                      │
              │                                      │
┌─────────────┼──────────────────────────────────────┼─────────────────┐
│             │         DATA STORAGE                 │                 │
├─────────────┼──────────────────────────────────────┼─────────────────┤
│             ▼                                      ▼                 │
│  ┌──────────────────────┐              ┌──────────────────────┐    │
│  │     AWS S3           │              │   MongoDB Atlas      │    │
│  │                      │              │                      │    │
│  │  product-images/     │              │  Products Collection │    │
│  │  datasheets/         │◄─────────────┤  {                   │    │
│  │  ies-files/          │  File URLs   │    sku: "...",       │    │
│  │  certifications/     │  stored in   │    productImages: [] │    │
│  │                      │  MongoDB     │    datasheets: []    │    │
│  │  [Actual Files]      │              │    iesFiles: []      │    │
│  │                      │              │    certifications: []│    │
│  └──────────────────────┘              │  }                   │    │
│                                         └──────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

## 📊 Data Flow Diagrams

### File Upload Flow

```
┌─────────┐
│  Admin  │
│  User   │
└────┬────┘
     │
     │ 1. Selects file
     ▼
┌─────────────────┐
│ Admin Dashboard │
│  File Input     │
└────┬────────────┘
     │
     │ 2. onChange event
     ▼
┌──────────────────────┐
│ handleFileUpload()   │
│ • Create FormData    │
│ • Set file & type    │
└────┬─────────────────┘
     │
     │ 3. POST request
     ▼
┌──────────────────────┐
│ /api/upload          │
│ • Check auth         │
│ • Validate file      │
└────┬─────────────────┘
     │
     │ 4. Upload file
     ▼
┌──────────────────────┐
│ lib/s3.ts            │
│ uploadFileToS3()     │
│ • Sanitize filename  │
│ • Upload to S3       │
│ • Return URL         │
└────┬─────────────────┘
     │
     │ 5. S3 URL returned
     ▼
┌──────────────────────┐
│ Admin Dashboard      │
│ • Add URL to state   │
│ • Display preview    │
└────┬─────────────────┘
     │
     │ 6. Save product
     ▼
┌──────────────────────┐
│ /api/products        │
│ • Save URLs to DB    │
└────┬─────────────────┘
     │
     │ 7. URLs stored
     ▼
┌──────────────────────┐
│ MongoDB              │
│ Product document     │
│ with file URLs       │
└──────────────────────┘
```

### File Display Flow

```
┌─────────┐
│Customer │
│  User   │
└────┬────┘
     │
     │ 1. Visit /products
     ▼
┌─────────────────┐
│ Products Page   │
└────┬────────────┘
     │
     │ 2. Fetch products
     ▼
┌──────────────────────┐
│ GET /api/products    │
└────┬─────────────────┘
     │
     │ 3. Query database
     ▼
┌──────────────────────┐
│ MongoDB              │
│ • Fetch products     │
│ • Include file URLs  │
└────┬─────────────────┘
     │
     │ 4. Products with URLs
     ▼
┌──────────────────────┐
│ Products Page        │
│ • Map products       │
│ • Render file badges │
└────┬─────────────────┘
     │
     │ 5. Click download
     ▼
┌──────────────────────┐
│ AWS S3               │
│ • Serve file         │
│ • Public read access │
└──────────────────────┘
```

## 🔄 Component Interaction

```
┌──────────────────────────────────────────────────────────┐
│                    Admin Dashboard                        │
│                                                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Product   │  │    File     │  │   Upload    │     │
│  │    Form     │  │   Upload    │  │  Progress   │     │
│  │             │  │   Inputs    │  │  Indicator  │     │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │
│         │                │                │             │
│         └────────────────┴────────────────┘             │
│                          │                               │
│                          ▼                               │
│              ┌───────────────────────┐                  │
│              │   State Management    │                  │
│              │                       │                  │
│              │  • productImages[]    │                  │
│              │  • datasheets[]       │                  │
│              │  • iesFiles[]         │                  │
│              │  • certifications[]   │                  │
│              │  • uploadingFile      │                  │
│              └───────────────────────┘                  │
└──────────────────────────────────────────────────────────┘
```

## 🗄️ Database Schema

```
Product Collection
┌─────────────────────────────────────────────────────────┐
│ {                                                        │
│   _id: ObjectId,                                        │
│   sku: String,                                          │
│   category: String,                                     │
│   price: Number,                                        │
│   ipRatings: [{ rating: String, price: Number }],      │
│                                                         │
│   // Legacy field (backward compatible)                │
│   images: [String],                                     │
│                                                         │
│   // NEW S3 file fields                                │
│   productImages: [                                      │
│     "https://bucket.s3.region.amazonaws.com/..."       │
│   ],                                                    │
│   datasheets: [                                         │
│     "https://bucket.s3.region.amazonaws.com/..."       │
│   ],                                                    │
│   iesFiles: [                                           │
│     "https://bucket.s3.region.amazonaws.com/..."       │
│   ],                                                    │
│   certifications: [                                     │
│     "https://bucket.s3.region.amazonaws.com/..."       │
│   ],                                                    │
│                                                         │
│   createdAt: Date,                                      │
│   updatedAt: Date                                       │
│ }                                                        │
└─────────────────────────────────────────────────────────┘
```

## 🌐 S3 Bucket Structure

```
your-s3-bucket/
│
├── product-images/
│   ├── 1710123456789-product1.jpg
│   ├── 1710123456790-product2.png
│   └── 1710123456791-product3.webp
│
├── datasheets/
│   ├── 1710123456792-datasheet1.pdf
│   ├── 1710123456793-specs.pdf
│   └── 1710123456794-manual.pdf
│
├── ies-files/
│   ├── 1710123456795-lighting-profile.ies
│   ├── 1710123456796-beam-pattern.ies
│   └── 1710123456797-distribution.ies
│
└── certifications/
    ├── 1710123456798-ce-cert.pdf
    ├── 1710123456799-rohs-cert.pdf
    └── 1710123456800-ul-cert.jpg
```

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Security Layers                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Layer 1: Authentication                                │
│  ┌────────────────────────────────────────────┐        │
│  │  • NextAuth session verification           │        │
│  │  • Admin role check                        │        │
│  │  • Reject unauthorized requests            │        │
│  └────────────────────────────────────────────┘        │
│                                                          │
│  Layer 2: File Validation                              │
│  ┌────────────────────────────────────────────┐        │
│  │  • File type validation                    │        │
│  │  • File size check (10MB limit)            │        │
│  │  • MIME type verification                  │        │
│  └────────────────────────────────────────────┘        │
│                                                          │
│  Layer 3: Filename Sanitization                        │
│  ┌────────────────────────────────────────────┐        │
│  │  • Remove special characters               │        │
│  │  • Add timestamp prefix                    │        │
│  │  • Prevent path traversal                  │        │
│  └────────────────────────────────────────────┘        │
│                                                          │
│  Layer 4: S3 Permissions                               │
│  ┌────────────────────────────────────────────┐        │
│  │  • Public read-only access                 │        │
│  │  • No public write access                  │        │
│  │  • IAM user with minimal permissions       │        │
│  └────────────────────────────────────────────┘        │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 📈 Scalability Considerations

```
Current Architecture (Small to Medium Scale)
┌──────────────┐
│   Next.js    │
│   Server     │──────► AWS S3 (Direct Upload)
└──────────────┘

Future Scaling Options
┌──────────────┐
│   Next.js    │
│   Server     │──────► CloudFront CDN ──────► AWS S3
└──────────────┘              │
                              ▼
                        (Cached Content)
                        (Faster Delivery)
```

---

**This architecture ensures:**
- ✅ Secure file uploads
- ✅ Scalable storage
- ✅ Fast file delivery
- ✅ Data integrity
- ✅ Easy maintenance
