# AWS S3 File Upload - Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### Step 1: Create AWS S3 Bucket

1. Go to [AWS S3 Console](https://s3.console.aws.amazon.com/)
2. Click **"Create bucket"**
3. Enter bucket name: `qlite-product-files` (or your preferred name)
4. Select region: `us-east-1` (or your preferred region)
5. **UNCHECK** "Block all public access"
6. Acknowledge the warning
7. Click **"Create bucket"**

### Step 2: Configure Bucket Permissions

1. Click on your newly created bucket
2. Go to **Permissions** tab
3. Click **"Edit"** under "Bucket policy"
4. Paste this policy (replace `YOUR-BUCKET-NAME`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}
```

5. Click **"Save changes"**
6. Go to **"Cross-origin resource sharing (CORS)"**
7. Click **"Edit"** and paste:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

8. Click **"Save changes"**

### Step 3: Create IAM User

1. Go to [IAM Console](https://console.aws.amazon.com/iam/)
2. Click **"Users"** → **"Add users"**
3. Username: `qlite-s3-uploader`
4. Select **"Access key - Programmatic access"**
5. Click **"Next: Permissions"**
6. Click **"Attach existing policies directly"**
7. Search and select **"AmazonS3FullAccess"**
8. Click through to **"Create user"**
9. **⚠️ IMPORTANT**: Copy and save:
   - Access Key ID
   - Secret Access Key
   (You won't see the secret again!)

### Step 4: Configure Environment Variables

1. Open your `.env.local` file
2. Add these lines:

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your-access-key-id-here
AWS_SECRET_ACCESS_KEY=your-secret-access-key-here
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=qlite-product-files
```

3. Replace with your actual values
4. Save the file

### Step 5: Restart Your Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## ✅ Test the Integration

1. Navigate to `/admin` in your browser
2. Click **"Add Product"** or edit an existing product
3. Scroll to **"File Attachments (AWS S3)"** section
4. Try uploading a file:
   - **Product Image**: Upload a JPG/PNG
   - **Datasheet**: Upload a PDF
   - **IES File**: Upload an .ies file
   - **Certification**: Upload a PDF or image

5. Click **"Create"** or **"Update"**
6. Go to `/products` page
7. You should see file download links in the "Files" column

## 📁 Supported File Types

| Category | Formats | Max Size |
|----------|---------|----------|
| **Product Images** | JPG, PNG, WebP, GIF | 10MB |
| **Datasheets** | PDF | 10MB |
| **IES Files** | .ies, .txt | 10MB |
| **Certifications** | PDF, JPG, PNG | 10MB |

## 🎯 Features

✅ Upload files directly from admin dashboard
✅ Files stored securely in AWS S3
✅ Automatic URL generation
✅ Support for multiple files per product
✅ Works with both new and existing products
✅ All existing product data preserved
✅ Files displayed on products page with download links
✅ Organized by file type in S3 folders

## 🔍 Troubleshooting

### Upload fails with "Access Denied"
- Check AWS credentials in `.env.local`
- Verify IAM user has S3 permissions
- Ensure bucket policy is correct

### Files not displaying
- Check bucket CORS configuration
- Verify files are publicly accessible
- Check browser console for errors

### "Bucket does not exist" error
- Double-check bucket name in `.env.local`
- Ensure bucket exists in the correct region

## 💰 Cost Estimate

For 1000 products with ~5MB files each:
- **Storage**: ~5GB = **~$0.12/month**
- **Requests**: Minimal cost
- **Transfer**: First 100GB free

Very affordable for small to medium catalogs!

## 📚 Full Documentation

See `AWS_S3_INTEGRATION.md` for complete documentation including:
- API endpoints
- Database schema
- Security considerations
- Migration notes

## 🆘 Need Help?

1. Check AWS S3 documentation
2. Review application logs
3. Verify all environment variables are set
4. Test with a small file first

---

**Ready to use!** Your file upload system is now integrated and ready for production. 🎉
