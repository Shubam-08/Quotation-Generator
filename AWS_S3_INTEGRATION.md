# AWS S3 File Upload Integration

This document explains the AWS S3 integration for uploading product files (images, datasheets, IES files, and certifications).

## Features

- **File Upload to AWS S3**: Secure file storage with automatic URL generation
- **Multiple File Types**: Support for images, datasheets (PDF), IES files, and certifications
- **File Management**: Add and remove files for both new and existing products
- **Product Matching**: Files can be attached to products by SKU
- **Data Preservation**: All existing product data remains intact when adding files

## Supported File Types

### 1. Product Images
- **Formats**: JPG, JPEG, PNG, WebP, GIF
- **Max Size**: 10MB per file
- **Storage**: `product-images/` folder in S3

### 2. Datasheets
- **Formats**: PDF
- **Max Size**: 10MB per file
- **Storage**: `datasheets/` folder in S3

### 3. IES Files
- **Formats**: .ies, .txt
- **Max Size**: 10MB per file
- **Storage**: `ies-files/` folder in S3

### 4. Certifications
- **Formats**: PDF, JPG, JPEG, PNG
- **Max Size**: 10MB per file
- **Storage**: `certifications/` folder in S3

## Setup Instructions

### 1. AWS S3 Configuration

#### Create an S3 Bucket
1. Log in to AWS Console
2. Navigate to S3 service
3. Click "Create bucket"
4. Choose a unique bucket name (e.g., `qlite-product-files`)
5. Select your preferred region (e.g., `us-east-1`)
6. **Uncheck** "Block all public access" (we need public read access for files)
7. Acknowledge the warning about public access
8. Click "Create bucket"

#### Configure Bucket Permissions
1. Go to your bucket → Permissions tab
2. Edit "Bucket policy" and add:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

Replace `your-bucket-name` with your actual bucket name.

3. Edit "CORS configuration" and add:

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

### 2. Create IAM User

1. Navigate to IAM service in AWS Console
2. Click "Users" → "Add users"
3. Enter username (e.g., `qlite-s3-uploader`)
4. Select "Access key - Programmatic access"
5. Click "Next: Permissions"
6. Click "Attach existing policies directly"
7. Search for and select `AmazonS3FullAccess` (or create a custom policy with limited permissions)
8. Click through to create the user
9. **IMPORTANT**: Save the Access Key ID and Secret Access Key (you won't see the secret again!)

### 3. Environment Variables

Add the following to your `.env.local` file:

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your-access-key-id-here
AWS_SECRET_ACCESS_KEY=your-secret-access-key-here
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-bucket-name-here
```

Replace the placeholder values with your actual AWS credentials.

## Usage

### Admin Dashboard

1. **Navigate to Admin Dashboard**: `/admin`
2. **Create or Edit a Product**
3. **Scroll to "File Attachments (AWS S3)" section**
4. **Upload Files**:
   - Click "Choose File" for the desired file type
   - Select a file from your computer
   - File will automatically upload to S3
   - URL will be saved to the product

### API Endpoints

#### Upload File
```
POST /api/upload
Content-Type: multipart/form-data

Body:
- file: File (the file to upload)
- fileType: string ("image" | "datasheet" | "ies" | "certification")

Response:
{
  "success": true,
  "url": "https://bucket-name.s3.region.amazonaws.com/folder/timestamp-filename.ext",
  "fileName": "original-filename.ext",
  "fileType": "image"
}
```

#### Update Product Files
```
PUT /api/products/files?sku=PRODUCT-SKU
Content-Type: application/json

Body:
{
  "fileType": "image",
  "fileUrl": "https://...",
  "action": "add" | "remove"
}

Response:
{
  "success": true,
  "product": { ... },
  "message": "File added successfully"
}
```

#### Get Product Files
```
GET /api/products/files?sku=PRODUCT-SKU

Response:
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

## Database Schema

The Product model has been updated with the following fields:

```typescript
{
  // ... existing fields ...
  productImages: string[];      // S3 uploaded images
  datasheets: string[];         // S3 uploaded datasheets
  iesFiles: string[];           // S3 uploaded IES files
  certifications: string[];     // S3 uploaded certifications
}
```

## File Naming Convention

Files are automatically renamed when uploaded to prevent conflicts:
- Format: `{timestamp}-{sanitized-filename}`
- Example: `1710123456789-product-datasheet.pdf`

## Security Considerations

1. **Public Access**: Files are publicly accessible via their URLs. Do not upload sensitive information.
2. **File Size Limits**: Maximum 10MB per file to prevent abuse
3. **File Type Validation**: Only allowed file types can be uploaded
4. **Authentication**: Only admin users can upload files
5. **HTTPS**: All file URLs use HTTPS for secure transmission

## Troubleshooting

### Upload Fails with "Access Denied"
- Check that your AWS credentials are correct
- Verify the IAM user has S3 permissions
- Ensure the bucket policy allows public read access

### Files Not Displaying
- Verify the bucket CORS configuration
- Check that the file URL is publicly accessible
- Ensure the bucket name and region in `.env.local` are correct

### "Bucket does not exist" Error
- Double-check the bucket name in `.env.local`
- Ensure the bucket exists in the specified region

## Cost Considerations

AWS S3 pricing includes:
- **Storage**: ~$0.023 per GB/month (first 50 TB)
- **Requests**: ~$0.005 per 1,000 PUT requests
- **Data Transfer**: Free for first 100 GB/month out to internet

For a typical product catalog with 1000 products and ~5MB of files per product:
- Storage: ~5GB = ~$0.12/month
- Very cost-effective for small to medium catalogs

## Migration Notes

- **Existing Products**: All existing product data is preserved
- **Legacy Images**: The old `images` field continues to work
- **Backward Compatibility**: Products without S3 files will display normally
- **Gradual Migration**: You can migrate files to S3 gradually by editing products

## Next Steps

1. Set up AWS S3 bucket and IAM user
2. Add credentials to `.env.local`
3. Test file upload with a sample product
4. Gradually migrate existing product files to S3
5. Update frontend to display uploaded files (if needed)

## Support

For issues or questions:
- Check AWS S3 documentation: https://docs.aws.amazon.com/s3/
- Review AWS SDK documentation: https://docs.aws.amazon.com/sdk-for-javascript/
- Check application logs for detailed error messages
