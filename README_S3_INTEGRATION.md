# 🚀 AWS S3 File Upload Integration - Complete Guide

## 📋 Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Features](#features)
4. [Documentation Index](#documentation-index)
5. [What's New](#whats-new)
6. [Setup Instructions](#setup-instructions)
7. [Usage Guide](#usage-guide)
8. [API Reference](#api-reference)
9. [Troubleshooting](#troubleshooting)
10. [FAQ](#faq)

---

## Overview

The Qlite Quotation Generator now includes **AWS S3 file upload integration**, allowing admins to upload and manage product files including:

- 📷 **Product Images** (JPG, PNG, WebP, GIF)
- 📄 **Datasheets** (PDF)
- ⚡ **IES Files** (.ies, .txt)
- 🏆 **Certifications** (PDF, JPG, PNG)

All files are securely stored in AWS S3 and automatically linked to products in MongoDB.

---

## Quick Start

### 5-Minute Setup

1. **Create AWS S3 Bucket** → [Detailed Guide](S3_QUICK_START.md)
2. **Configure Bucket Permissions** → Public read access
3. **Create IAM User** → Get access keys
4. **Add to `.env.local`**:
   ```env
   AWS_ACCESS_KEY_ID=your-key
   AWS_SECRET_ACCESS_KEY=your-secret
   AWS_REGION=us-east-1
   AWS_S3_BUCKET_NAME=your-bucket
   ```
5. **Restart Server**: `npm run dev`
6. **Test Upload**: Go to `/admin` → Add/Edit Product → Upload Files

✅ **Done!** You're ready to upload files.

---

## Features

### ✨ What You Can Do

#### For Admins
- ✅ Upload multiple file types per product
- ✅ Preview images before saving
- ✅ Remove files easily
- ✅ Add files to existing products without data loss
- ✅ Organize files automatically by type
- ✅ See upload progress in real-time

#### For Customers
- ✅ Download datasheets directly
- ✅ Access IES files for lighting design
- ✅ View certifications
- ✅ See product images
- ✅ Quick access via color-coded badges

### 🔒 Security Features
- ✅ Admin-only uploads
- ✅ File type validation
- ✅ Size limits (10MB max)
- ✅ Sanitized filenames
- ✅ Public read-only access
- ✅ HTTPS encryption

### 💾 Data Integrity
- ✅ All existing products preserved
- ✅ Backward compatible
- ✅ No breaking changes
- ✅ Legacy images still work
- ✅ Gradual migration supported

---

## Documentation Index

### 📚 Available Documentation

| Document | Description | Use Case |
|----------|-------------|----------|
| **[S3_QUICK_START.md](S3_QUICK_START.md)** | 5-minute setup guide | First-time setup |
| **[AWS_S3_INTEGRATION.md](AWS_S3_INTEGRATION.md)** | Complete technical docs | Detailed reference |
| **[S3_INTEGRATION_SUMMARY.md](S3_INTEGRATION_SUMMARY.md)** | Implementation overview | Understanding changes |
| **[S3_FILES_CHANGED.md](S3_FILES_CHANGED.md)** | Files modified/created | Code review |
| **[S3_ARCHITECTURE_DIAGRAM.md](S3_ARCHITECTURE_DIAGRAM.md)** | System architecture | Architecture review |
| **[S3_IMPLEMENTATION_CHECKLIST.md](S3_IMPLEMENTATION_CHECKLIST.md)** | Deployment checklist | Pre-deployment |
| **README_S3_INTEGRATION.md** | This file | Overview & guide |

### 📖 Reading Order

**New to the integration?**
1. Start with this README
2. Follow [S3_QUICK_START.md](S3_QUICK_START.md)
3. Reference [AWS_S3_INTEGRATION.md](AWS_S3_INTEGRATION.md) as needed

**Deploying to production?**
1. Review [S3_IMPLEMENTATION_CHECKLIST.md](S3_IMPLEMENTATION_CHECKLIST.md)
2. Check [S3_FILES_CHANGED.md](S3_FILES_CHANGED.md)
3. Understand [S3_ARCHITECTURE_DIAGRAM.md](S3_ARCHITECTURE_DIAGRAM.md)

---

## What's New

### 🆕 New Features Added

#### Backend
- **New API Endpoints**:
  - `POST /api/upload` - Upload files to S3
  - `PUT /api/products/files` - Manage product files
  - `GET /api/products/files` - Get product files

- **New Database Fields**:
  - `productImages[]` - S3 image URLs
  - `datasheets[]` - Datasheet URLs
  - `iesFiles[]` - IES file URLs
  - `certifications[]` - Certification URLs

- **New Utilities**:
  - `lib/s3.ts` - S3 upload/delete functions
  - File validation
  - Automatic folder organization

#### Frontend
- **Admin Dashboard**:
  - File upload sections for each type
  - Real-time upload progress
  - Image preview
  - File management UI

- **Products Page**:
  - "Files" column in table
  - Download badges
  - Color-coded file types
  - Image count indicator

### 📦 Dependencies Added
```json
{
  "@aws-sdk/client-s3": "^3.x",
  "@aws-sdk/lib-storage": "^3.x"
}
```

---

## Setup Instructions

### Prerequisites
- AWS Account
- MongoDB database
- Node.js & npm installed
- Admin access to the application

### Step-by-Step Setup

#### 1. AWS S3 Configuration

**Create Bucket**:
```bash
# Via AWS Console:
1. Go to S3 Console
2. Click "Create bucket"
3. Name: qlite-product-files
4. Region: us-east-1
5. Uncheck "Block all public access"
6. Create bucket
```

**Set Bucket Policy**:
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadGetObject",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::qlite-product-files/*"
  }]
}
```

**Configure CORS**:
```json
[{
  "AllowedHeaders": ["*"],
  "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
  "AllowedOrigins": ["*"],
  "ExposeHeaders": []
}]
```

#### 2. IAM User Setup

**Create User**:
```bash
# Via AWS Console:
1. Go to IAM Console
2. Users → Add users
3. Name: qlite-s3-uploader
4. Access type: Programmatic access
5. Attach policy: AmazonS3FullAccess
6. Create user
7. Save Access Key ID and Secret Access Key
```

#### 3. Environment Configuration

**Update `.env.local`**:
```env
# MongoDB (existing)
MONGODB_URI=mongodb+srv://...
MONGODB_DB=qlite_quotation

# NextAuth (existing)
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000

# AWS S3 (new)
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=qlite-product-files
```

#### 4. Install Dependencies

```bash
npm install
```

#### 5. Restart Server

```bash
npm run dev
```

---

## Usage Guide

### For Admins

#### Uploading Files to a New Product

1. Navigate to `/admin`
2. Click **"Add Product"**
3. Fill in product details (SKU, category, etc.)
4. Scroll to **"File Attachments (AWS S3)"**
5. Click **"Choose File"** for desired file type
6. Select file from your computer
7. Wait for upload to complete (progress indicator shows)
8. File appears in the list below
9. Repeat for other file types as needed
10. Click **"Create"** to save product

#### Adding Files to Existing Product

1. Navigate to `/admin`
2. Click **"Edit"** (pencil icon) on product
3. Existing files are displayed
4. Upload new files as needed
5. Remove unwanted files by clicking **"Remove"**
6. Click **"Update"** to save changes

#### File Management Tips

- **Images**: Use high-quality JPG or PNG (< 5MB recommended)
- **Datasheets**: Keep PDFs under 5MB for faster loading
- **IES Files**: Standard .ies format from lighting software
- **Certifications**: PDF format preferred for documents

### For Customers

#### Viewing Product Files

1. Navigate to `/products`
2. Browse products in the table
3. Look at the **"Files"** column
4. See color-coded badges:
   - 🔵 **Blue** = Datasheet (PDF)
   - 🟣 **Purple** = IES File
   - 🟢 **Green** = Certification
   - 🟡 **Yellow** = Image count

#### Downloading Files

1. Click on any badge in the "Files" column
2. File opens in new tab
3. Use browser's download function if needed
4. Files are served directly from AWS S3

---

## API Reference

### Upload File

**Endpoint**: `POST /api/upload`

**Request**:
```javascript
const formData = new FormData();
formData.append('file', fileObject);
formData.append('fileType', 'datasheet'); // or 'image', 'ies', 'certification'

fetch('/api/upload', {
  method: 'POST',
  body: formData
});
```

**Response**:
```json
{
  "success": true,
  "url": "https://bucket.s3.region.amazonaws.com/datasheets/1710123456789-file.pdf",
  "fileName": "file.pdf",
  "fileType": "datasheet"
}
```

### Manage Product Files

**Endpoint**: `PUT /api/products/files?sku=PRODUCT-SKU`

**Request**:
```json
{
  "fileType": "datasheet",
  "fileUrl": "https://...",
  "action": "add"
}
```

**Response**:
```json
{
  "success": true,
  "product": { ... },
  "message": "File added successfully"
}
```

### Get Product Files

**Endpoint**: `GET /api/products/files?sku=PRODUCT-SKU`

**Response**:
```json
{
  "sku": "PRODUCT-SKU",
  "files": {
    "images": ["url1", "url2"],
    "datasheets": ["url1"],
    "iesFiles": ["url1"],
    "certifications": ["url1", "url2"],
    "legacyImages": ["url1"]
  }
}
```

---

## Troubleshooting

### Common Issues

#### Upload Fails with "Access Denied"

**Cause**: Invalid AWS credentials or insufficient permissions

**Solution**:
1. Check `.env.local` has correct AWS credentials
2. Verify IAM user has S3 permissions
3. Ensure bucket policy allows public read
4. Restart development server

#### Files Not Displaying

**Cause**: CORS not configured or bucket not public

**Solution**:
1. Check S3 bucket CORS configuration
2. Verify bucket policy allows public read
3. Test file URL directly in browser
4. Check browser console for errors

#### "Bucket does not exist" Error

**Cause**: Incorrect bucket name or region

**Solution**:
1. Double-check `AWS_S3_BUCKET_NAME` in `.env.local`
2. Verify `AWS_REGION` matches bucket region
3. Ensure bucket exists in AWS console
4. Restart server after changes

#### Upload Succeeds but File Not Saved

**Cause**: Product not saved after upload

**Solution**:
1. Ensure you click "Create" or "Update" button
2. Check for validation errors in form
3. Verify MongoDB connection is working
4. Check browser console for errors

### Getting Help

1. **Check Logs**: Look at server console for errors
2. **AWS Console**: Verify bucket and files exist
3. **MongoDB**: Check product documents have file URLs
4. **Documentation**: Review [AWS_S3_INTEGRATION.md](AWS_S3_INTEGRATION.md)

---

## FAQ

### General Questions

**Q: Do I need to migrate existing products?**
A: No, existing products work as-is. You can add files gradually.

**Q: What happens to existing images?**
A: They continue to work. The `images` field is preserved.

**Q: Can I use both legacy and S3 images?**
A: Yes, both systems work together seamlessly.

**Q: Is there a file size limit?**
A: Yes, 10MB per file. This can be adjusted in `lib/s3.ts`.

### Cost Questions

**Q: How much does S3 storage cost?**
A: ~$0.023 per GB/month. For 1000 products with 5MB each = ~$0.12/month.

**Q: Are there data transfer costs?**
A: First 100GB/month is free. After that, ~$0.09/GB.

**Q: How can I reduce costs?**
A: Compress images, use lifecycle policies, enable intelligent tiering.

### Security Questions

**Q: Are files publicly accessible?**
A: Yes, files have public read access via their URLs. Don't upload sensitive data.

**Q: Can anyone upload files?**
A: No, only authenticated admin users can upload.

**Q: How are filenames secured?**
A: Filenames are sanitized and prefixed with timestamps.

### Technical Questions

**Q: Can I change the S3 folder structure?**
A: Yes, modify `getFolderForFileType()` in `lib/s3.ts`.

**Q: Can I add more file types?**
A: Yes, update `ALLOWED_FILE_TYPES` in `lib/s3.ts` and add UI components.

**Q: Does this work with other cloud providers?**
A: Currently S3 only, but can be adapted for Azure Blob or Google Cloud Storage.

---

## 🎉 Congratulations!

You now have a fully functional file upload system integrated with AWS S3!

### Next Steps

1. ✅ Complete AWS setup
2. ✅ Test file uploads
3. ✅ Add files to products
4. ✅ Deploy to production
5. ✅ Monitor usage and costs

### Resources

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/)
- [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

**Need help?** Check the documentation files or review the implementation checklist.

**Ready for production?** Follow [S3_IMPLEMENTATION_CHECKLIST.md](S3_IMPLEMENTATION_CHECKLIST.md)

---

*Last Updated: October 13, 2025*
*Version: 1.0.0*
*Status: ✅ Production Ready*
