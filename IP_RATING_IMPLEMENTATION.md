# Multiple IP Ratings Implementation

## Overview
This implementation allows products to have multiple IP ratings (e.g., IP20, IP30, IP40) and enables users to select their preferred IP rating when viewing products.

## Changes Made

### 1. Database Schema (`lib/models/Product.ts`)
- Changed `ipRating` from `String` to `[String]` (array of strings)
- Supports multiple IP ratings per product variant

### 2. Admin Panel (`app/admin/page.tsx`)
- Added state management for IP ratings:
  - `ipRatings`: Array of IP ratings for the current product
  - `newIpRating`: Input field for adding new IP rating
  
- Added handlers:
  - `handleAddIpRating()`: Validates and adds IP rating (format: IP##)
  - `handleRemoveIpRating()`: Removes IP rating from list
  
- Updated form UI:
  - Multi-select interface similar to images
  - Validation for IP rating format (e.g., IP20, IP65)
  - Prevents duplicate IP ratings
  - Visual chips showing added IP ratings

- Updated product table:
  - Added "IP Ratings" column
  - Displays all IP ratings as colored badges

### 3. Products Page (`app/products/page.tsx`)
- Updated Product type to support `ipRating?: string[]`
- Added state: `selectedIpRatings` to track user's IP rating selection per product
- Updated IP rating display:
  - Single IP rating: Shows as badge
  - Multiple IP ratings: Shows as dropdown selector
  - User can select preferred IP rating before adding to cart
- When adding to cart: Passes selected IP rating (or first one if not selected)

### 4. Cart Context (`context/CartContext.tsx`)
- Updated Product type: `ipRating?: string | string[]`
- Supports both single string and array for backward compatibility

## Usage Workflow

### For Admins (Adding Products):
1. Navigate to Admin Dashboard
2. Click "Add Product" or edit existing product
3. Fill in product details including wattage
4. In "IP Ratings" section:
   - Enter IP rating (e.g., IP20)
   - Click "Add" or press Enter
   - Repeat for all available IP ratings (IP30, IP40, etc.)
5. Save product

### For Adding Different Wattage Variants:
1. Add first product: Model X - 3W with IP20, IP30, IP40
2. Add second product: Model X - 4W with IP20, IP30, IP40
3. Add third product: Model X - 5W with IP20, IP30, IP40
4. Each wattage is a separate product entry with its own IP rating options

### For Users (Selecting Products):
1. Browse products table
2. If product has multiple IP ratings, a dropdown appears
3. Select desired IP rating from dropdown (e.g., IP20)
4. Click "Add to List" - button shows "Added"
5. Select different IP rating (e.g., IP40)
6. Button reverts to "Add to List" - click to add
7. Both IP20 and IP40 variants are now separate entries in cart

## Technical Details

### IP Rating Validation
- Format: `IP` followed by exactly 2 digits (e.g., IP20, IP65)
- Regex: `/^IP\d{2}$/`
- Case insensitive input, stored as uppercase

### Data Structure
```typescript
{
  sku: "LED-MODEL-X",
  watt: 3,
  ipRating: ["IP20", "IP30", "IP40"],
  // ... other fields
}
```

### Cart Item Structure
```typescript
{
  _id: "product_id",
  sku: "LED-MODEL-X",
  watt: 3,
  ipRating: "IP30", // Selected IP rating
  quantity: 1,
  cartItemId: "product_id_IP30", // Unique identifier: productId_ipRating
  // ... other fields
}
```

### Unique Cart Item Identification
- Each cart item has a unique `cartItemId` = `${productId}_${ipRating}`
- This allows the same product with different IP ratings to exist as separate cart items
- Example: 
  - Item 1: `cartItemId: "abc123_IP20"` (Product ABC with IP20)
  - Item 2: `cartItemId: "abc123_IP40"` (Same product ABC with IP40)
- Cart operations (remove, increase/decrease quantity) use `cartItemId` instead of just `_id`

## Future Enhancements
- Add IP rating filter in products page
- Show IP rating in quotation PDF
- Add datasheet and IES file support per product
- Consider variant-based pricing (different prices for different IP ratings)
