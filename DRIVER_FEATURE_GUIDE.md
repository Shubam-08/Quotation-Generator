# Driver Feature Implementation Guide

## Overview
The driver feature allows customers to add compatible LED drivers to their lighting products in the cart. Drivers are matched based on product wattage and voltage specifications.

## Backend Implementation

### 1. Driver Model (`lib/models/Driver.ts`)
- **Fields:**
  - `sku`: Driver SKU/model number
  - `name`: Driver name/description
  - `wattageRange`: { min, max } - Compatible wattage range (e.g., 10-50W)
  - `outputVoltage`: Output voltage (e.g., "12V DC", "24V DC")
  - `inputVoltage`: Input voltage (e.g., "100-240V AC")
  - `price`: Price in USD (base currency)
  - `category`: Default "Driver"
  - `images`, `productImages`: Product images
  - `datasheets`, `certifications`: File attachments
  - `inStock`: Availability status

### 2. API Endpoint (`app/api/drivers/route.ts`)
- **GET `/api/drivers`**
  - Query params: `wattage`, `voltage`
  - Returns compatible drivers based on product specifications
  - Filters by wattage range and voltage matching
  
- **POST `/api/drivers`**
  - Creates new driver entries
  - Admin use only

## Frontend Implementation

### 1. Cart Context Updates (`context/CartContext.tsx`)
- Added `Driver` type definition
- Extended `CartItem` type with:
  - `isDriver`: Boolean flag
  - `parentProductId`: Links driver to specific product
- New function: `addDriverToCart(driver, parentProductId, quantity)`
- Drivers are stored in the same cart array with products

### 2. Enhanced Cart UI (`components/EnhancedCart.tsx`)

#### Features:
- **"Add Driver" button** on each product card
- **Driver selection modal** with:
  - Loading state while fetching compatible drivers
  - Grid display of available drivers with specs
  - Wattage range, voltage, and price information
  - Add button to add driver to cart
  
- **Associated drivers display** under each product showing:
  - Driver name and quantity
  - Remove button for each driver
  
- **Export functionality** (Excel & PDF):
  - Drivers included in quotations
  - Driver names shown in Description/Category column
  - Proper serial numbering

## How to Add Drivers to Database

### Option 1: Via API (Recommended for Admin)
```javascript
POST /api/drivers
Content-Type: application/json

{
  "sku": "DRV-12V-50W",
  "name": "12V 50W LED Driver",
  "description": "Constant voltage LED driver",
  "wattageRange": {
    "min": 10,
    "max": 50
  },
  "outputVoltage": "12V DC",
  "inputVoltage": "100-240V AC",
  "price": 25.00,
  "category": "Driver",
  "inStock": true
}
```

### Option 2: Direct Database Insert
```javascript
// Using MongoDB shell or admin interface
db.drivers.insertOne({
  sku: "DRV-24V-100W",
  name: "24V 100W LED Driver",
  description: "High power constant voltage driver",
  wattageRange: { min: 50, max: 100 },
  outputVoltage: "24V DC",
  inputVoltage: "100-240V AC",
  price: 45.00,
  category: "Driver",
  images: [],
  productImages: [],
  datasheets: [],
  certifications: [],
  inStock: true,
  createdAt: new Date(),
  updatedAt: new Date()
});
```

## User Flow

1. **User adds products to cart** from the products page
2. **User goes to cart page** and sees all products
3. **User clicks "Add Driver"** button on any product
4. **Modal opens** showing compatible drivers based on:
   - Product wattage (driver wattage range must include product wattage)
   - Product voltage (optional matching)
5. **User selects a driver** and clicks "Add"
6. **Driver appears** under the product in cart
7. **Driver is included** in Excel/PDF exports with proper pricing

## Key Features

### Smart Matching
- Drivers are filtered by wattage compatibility
- Only drivers that can handle the product's wattage are shown
- Voltage matching is optional but recommended

### Price Management
- All driver prices stored in USD (base currency)
- Automatic currency conversion on display
- Drivers included in total calculations

### Export Integration
- Drivers appear as separate line items in Excel/PDF
- Clear association with parent products
- Proper serial numbering and totals

### Data Integrity
- Drivers linked to specific cart items
- Removing a product doesn't auto-remove its drivers (user choice)
- Duplicate prevention for same driver on same product

## Example Driver Data

```javascript
// Low wattage driver for small lights
{
  sku: "DRV-12V-20W",
  name: "12V 20W Compact LED Driver",
  wattageRange: { min: 5, max: 20 },
  outputVoltage: "12V DC",
  inputVoltage: "100-240V AC",
  price: 18.00
}

// Medium wattage driver
{
  sku: "DRV-24V-60W",
  name: "24V 60W LED Driver",
  wattageRange: { min: 30, max: 60 },
  outputVoltage: "24V DC",
  inputVoltage: "100-240V AC",
  price: 32.00
}

// High wattage driver
{
  sku: "DRV-24V-150W",
  name: "24V 150W High Power LED Driver",
  wattageRange: { min: 80, max: 150 },
  outputVoltage: "24V DC",
  inputVoltage: "100-240V AC",
  price: 65.00
}
```

## Notes

- Drivers are optional - users can complete checkout without them
- Multiple drivers can be added to a single product if needed
- Driver inventory management via `inStock` field
- Supports images and documentation attachments
- Fully integrated with existing currency conversion system
