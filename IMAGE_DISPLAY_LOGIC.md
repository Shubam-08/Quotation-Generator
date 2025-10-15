# Product Image Display Logic

## 📷 How Images Are Displayed

### Image Fields in Product Model

```typescript
interface Product {
  // Legacy field (backward compatible)
  images: string[];           // URLs from admin (Google Drive, ImgBB, etc.)
  
  // NEW S3 field
  productImages: string[];    // S3 uploaded images
}
```

---

## 🖼️ Display Priority in Products Table

### Image Column (Main Product Image)

**Priority Order**:
1. **First**: S3 uploaded image (`productImages[0]`)
2. **Fallback**: Legacy image (`images[0]`)
3. **Default**: Package icon (if no images)

**Code Logic**:
```typescript
{(p.productImages?.length || p.images?.length) ? (
  <img src={p.productImages?.[0] || p.images?.[0]} />
) : (
  <PackageIcon />
)}
```

**What This Means**:
- ✅ If product has S3 images → Shows first S3 image
- ✅ If no S3 images but has legacy images → Shows first legacy image
- ✅ If no images at all → Shows placeholder icon

---

## 📁 Files Column (Download Links)

### What Shows in Files Column

**S3 Files Only**:
- 🔵 **Datasheets** (PDF) - Download links
- 🟣 **IES Files** - Download links
- 🟢 **Certifications** - Download links
- 🟡 **Image Count** - Number of S3 product images

**Note**: Legacy `images` field does NOT show in Files column

---

## 🔄 Migration Scenarios

### Scenario 1: Product with Only Legacy Images
```typescript
{
  sku: "PROD-001",
  images: ["https://drive.google.com/image1.jpg"],
  productImages: []  // Empty
}
```
**Result**: 
- Image column shows: `images[0]`
- Files column shows: Nothing

---

### Scenario 2: Product with Only S3 Images
```typescript
{
  sku: "PROD-002",
  images: [],
  productImages: ["https://bucket.s3.amazonaws.com/image1.jpg"]
}
```
**Result**:
- Image column shows: `productImages[0]`
- Files column shows: 📷 1

---

### Scenario 3: Product with Both
```typescript
{
  sku: "PROD-003",
  images: ["https://drive.google.com/image1.jpg"],
  productImages: [
    "https://bucket.s3.amazonaws.com/image1.jpg",
    "https://bucket.s3.amazonaws.com/image2.jpg"
  ]
}
```
**Result**:
- Image column shows: `productImages[0]` (S3 takes priority)
- Files column shows: 📷 2

---

### Scenario 4: Product with No Images
```typescript
{
  sku: "PROD-004",
  images: [],
  productImages: []
}
```
**Result**:
- Image column shows: Package icon placeholder
- Files column shows: Nothing

---

## 🎯 Best Practices

### For Admins

**Option 1: Use S3 Images (Recommended)**
- Upload images via "File Attachments (AWS S3)" section
- Images stored securely in S3
- Automatic organization
- Better performance

**Option 2: Use Legacy Images**
- Add URLs via "Images (URL)" field
- Works with Google Drive, ImgBB, etc.
- Backward compatible
- Good for external images

**Option 3: Use Both**
- S3 images will display in Image column
- Legacy images still accessible
- Gradual migration supported

### Migration Strategy

**Gradual Migration**:
1. Keep existing legacy images
2. Upload new images to S3
3. S3 images will automatically take priority
4. Eventually remove legacy images (optional)

**Immediate Migration**:
1. Upload all images to S3
2. Clear legacy `images` field
3. All images now in S3

---

## 📊 Visual Summary

```
┌─────────────────────────────────────────────────────────┐
│                    Products Table                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Image Column          │  Files Column                  │
│  ─────────────────────────────────────────────────      │
│                        │                                 │
│  Priority:             │  Shows:                         │
│  1. productImages[0]   │  • Datasheets (PDF)            │
│  2. images[0]          │  • IES Files                    │
│  3. Placeholder        │  • Certifications               │
│                        │  • Image count (📷 2)          │
│                        │                                 │
└─────────────────────────────────────────────────────────┘
```

---

## 🔍 How to Check Which Images Are Being Used

### In Admin Dashboard
1. Edit a product
2. Scroll to "Images (URL)" section → Legacy images
3. Scroll to "File Attachments (AWS S3)" → S3 images
4. Both sections show their respective images

### In MongoDB
```javascript
db.products.findOne({ sku: "PROD-001" })

// Result:
{
  images: ["https://..."],           // Legacy
  productImages: ["https://..."],    // S3
  datasheets: ["https://..."],       // S3
  iesFiles: ["https://..."],         // S3
  certifications: ["https://..."]    // S3
}
```

### In Browser DevTools
1. Open products page
2. Inspect image element
3. Check `src` attribute
4. S3 URLs contain: `s3.amazonaws.com`
5. Legacy URLs contain: `drive.google.com`, `i.ibb.co`, etc.

---

## ✅ Summary

| Field | Display Location | Purpose |
|-------|-----------------|---------|
| `productImages[]` | Image column (priority) + Files column count | S3 uploaded images |
| `images[]` | Image column (fallback) | Legacy image URLs |
| `datasheets[]` | Files column only | PDF downloads |
| `iesFiles[]` | Files column only | IES downloads |
| `certifications[]` | Files column only | Cert downloads |

**Key Point**: S3 `productImages` will **always display first** in the Image column if they exist!

---

*Last Updated: October 13, 2025*
