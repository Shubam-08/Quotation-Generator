# How to Add Drivers - Admin Guide

## Accessing Driver Management

1. **Login as Admin** at `/login`
2. **Navigate to Admin Dashboard** at `/admin`
3. **Click on "Drivers" tab** in the navigation bar

## Adding a New Driver

### Step 1: Click "Add Driver" Button
Click the blue "Add Driver" button in the top right corner.

### Step 2: Fill in Driver Details

#### Required Fields:
- **SKU**: Unique identifier (e.g., `DRV-12V-50W`)
- **Driver Name**: Descriptive name (e.g., `12V 50W LED Driver`)
- **Min Wattage**: Minimum wattage this driver can handle (e.g., `10`)
- **Max Wattage**: Maximum wattage this driver can handle (e.g., `50`)
- **Price (USD)**: Price in US Dollars (e.g., `25.00`)

#### Optional Fields:
- **Description**: Additional details about the driver
- **Output Voltage**: Driver output (e.g., `12V DC`, `24V DC`)
- **Input Voltage**: Driver input (e.g., `100-240V AC`)
- **In Stock**: Check if driver is available (default: checked)

### Step 3: Save
Click "Add Driver" to save the new driver to the database.

## Example Drivers to Add

### Small Lights (5-20W)
```
SKU: DRV-12V-20W
Name: 12V 20W Compact LED Driver
Min Wattage: 5
Max Wattage: 20
Output Voltage: 12V DC
Input Voltage: 100-240V AC
Price: 18.00
```

### Medium Lights (20-60W)
```
SKU: DRV-24V-60W
Name: 24V 60W LED Driver
Min Wattage: 20
Max Wattage: 60
Output Voltage: 24V DC
Input Voltage: 100-240V AC
Price: 32.00
```

### High Power Lights (60-150W)
```
SKU: DRV-24V-150W
Name: 24V 150W High Power LED Driver
Min Wattage: 60
Max Wattage: 150
Output Voltage: 24V DC
Input Voltage: 100-240V AC
Price: 65.00
```

## How Drivers Work with Products

### Automatic Matching
When a customer clicks "Add Driver" on a product in their cart:
1. System checks the product's wattage
2. Shows only drivers where:
   - `Min Wattage ≤ Product Wattage ≤ Max Wattage`
3. Customer selects compatible driver
4. Driver is added to cart linked to that product

### Example:
- **Product**: 30W LED Light
- **Compatible Drivers Shown**:
  - ✅ 12V 20W Driver (Min: 5, Max: 20) - ❌ Too small
  - ✅ 24V 60W Driver (Min: 20, Max: 60) - ✅ Compatible
  - ✅ 24V 150W Driver (Min: 60, Max: 150) - ❌ Too large

Only the 24V 60W driver will be shown as it can handle 30W.

## Managing Existing Drivers

### Edit Driver
1. Click the **pencil icon** next to any driver
2. Update the fields
3. Click "Update Driver"

### Delete Driver
1. Click the **trash icon** next to any driver
2. Confirm deletion
3. Driver is removed from database

### Mark Out of Stock
1. Edit the driver
2. Uncheck "In Stock"
3. Save changes
4. Driver won't appear in customer cart selections

## Search Drivers
Use the search bar to find drivers by:
- SKU
- Name

## Important Notes

### Pricing
- All prices are in **USD (US Dollars)**
- Currency conversion happens automatically for customers
- Prices are displayed in customer's selected currency

### Wattage Ranges
- Make sure ranges don't overlap too much
- Create specific drivers for specific wattage ranges
- Example ranges:
  - 5-20W (Small lights)
  - 20-60W (Medium lights)
  - 60-150W (High power lights)

### Voltage Specifications
- **Output Voltage**: What the driver provides to the LED (12V DC, 24V DC, etc.)
- **Input Voltage**: What the driver accepts from mains (100-240V AC, etc.)
- Use consistent formatting (e.g., always "12V DC" not "12VDC" or "12 V DC")

## Customer Experience

When customers add products to cart:
1. They see an "Add Driver" button on each product
2. Click button to see compatible drivers
3. Select driver and add to cart
4. Driver appears under the product
5. Driver is included in quotation (Excel/PDF)

## Troubleshooting

### Driver not showing for a product?
- Check wattage range includes product wattage
- Verify driver is marked "In Stock"
- Check product has wattage value set

### Need to update prices?
- Edit driver and change price
- All future cart additions use new price
- Existing carts keep old price until refreshed

## Best Practices

1. **Clear Naming**: Use descriptive names (voltage + wattage + type)
2. **Accurate Ranges**: Set realistic min/max wattage
3. **Consistent Formatting**: Use same format for voltages
4. **Regular Updates**: Keep stock status current
5. **Competitive Pricing**: Price in USD, conversions are automatic
