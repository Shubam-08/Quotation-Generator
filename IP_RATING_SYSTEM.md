# IP Rating System with Individual Prices

## Overview

The system has been updated to support **individual prices for each IP rating**. Previously, a product could have multiple IP ratings but only one price. Now, each IP rating can have its own specific price.

## What Changed

### 1. **Database Schema (Product Model)**
- **New Field**: `ipRatings` - Array of objects with `rating` and `price`
  ```typescript
  ipRatings: [
    { rating: "IP20", price: 100 },
    { rating: "IP30", price: 120 },
    { rating: "IP40", price: 150 }
  ]
  ```
- **Legacy Fields Preserved**: `ipRating` (array of strings) and `price` (number) are kept for backward compatibility

### 2. **Admin Panel**
- Admin can now add multiple IP ratings with individual prices
- Each IP rating entry shows both the rating and its price
- The base price field is disabled when IP ratings are added
- Old products display a yellow badge indicating they need price updates

### 3. **Products Page**
- When a user selects an IP rating from the dropdown, the price automatically updates
- Each IP rating selection shows its corresponding price
- Cart functionality respects the selected IP rating and its price

### 4. **Cart System**
- Each product + IP rating combination is treated as a unique cart item
- The correct price is stored based on the selected IP rating
- Users can add the same product with different IP ratings separately

## Migration Guide

### For Existing Data

If you have existing products with the old format, run the migration script:

```bash
npx ts-node scripts/migrate-ip-ratings.ts
```

This will:
1. Find all products with old IP rating format
2. Convert them to the new format
3. Copy the existing price to all IP ratings
4. Preserve the old fields for compatibility

### After Migration

**Admin users should:**
1. Go to the Admin Dashboard
2. Edit each product
3. Update the individual prices for each IP rating as needed
4. Products with old format will show yellow badges

## How to Use

### Adding a New Product (Admin)

1. Navigate to Admin Dashboard
2. Click "Add Product"
3. Fill in product details
4. Add IP ratings with prices:
   - Enter IP rating (e.g., IP20)
   - Enter price in **USD** (will be automatically converted to INR)
   - Click "Add"
   - Repeat for each IP rating
5. Click "Create"

**Note:** When adding a new product, all prices are entered in USD and automatically converted to INR using live exchange rates.

### Editing Existing Products (Admin)

1. Click the edit icon on any product
2. The modal will show existing IP ratings with prices in INR
3. Add new IP ratings or remove existing ones
4. When editing, prices are in **INR** (no conversion needed)
5. Click "Update"

**Note:** When editing an existing product, all prices are displayed and entered in INR directly.

### Selecting Products (Users)

1. Browse products on the Products page
2. If a product has multiple IP ratings, use the dropdown to select
3. The price will automatically update based on selection
4. Click "Add to List" to add the product with selected IP rating
5. You can add the same product with different IP ratings separately

## Technical Details

### Data Structure

**New Format:**
```typescript
interface IpRatingPrice {
  rating: string;  // e.g., "IP20"
  price: number;   // e.g., 100.50
}

interface Product {
  ipRatings: IpRatingPrice[];  // New field
  // ... other fields
}
```

**Legacy Format (still supported):**
```typescript
interface Product {
  ipRating: string[];  // e.g., ["IP20", "IP30"]
  price: number;       // e.g., 100
  // ... other fields
}
```

### API Changes

- **POST /api/products**: Accepts `ipRatings` array
- **PUT /api/products**: Updates `ipRatings` array
- **GET /api/products**: Returns both old and new formats
- Search functionality works with both formats

### Backward Compatibility

The system maintains full backward compatibility:
- Old products continue to work
- API supports both formats
- Frontend handles both formats gracefully
- No data loss during migration

## Benefits

1. **Flexible Pricing**: Different prices for different IP ratings
2. **Better Inventory Management**: Track each IP variant separately
3. **Accurate Quotations**: Customers see exact prices for their selection
4. **No Data Loss**: Existing data is preserved and migrated safely
5. **User-Friendly**: Automatic price updates on selection

## Troubleshooting

### Products Not Showing Prices
- Check if the product has `ipRatings` array populated
- Run the migration script if products are in old format
- Verify prices are set in the admin panel

### Cart Shows Wrong Price
- Ensure the correct IP rating is selected before adding to cart
- Clear browser cache and localStorage
- Check that the product has individual prices set

### Migration Issues
- Ensure MongoDB connection is working
- Check that all products have valid price values
- Review console logs for specific errors

## Support

For issues or questions, please contact the development team or refer to the main project documentation.
