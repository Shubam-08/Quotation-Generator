# Bulk Upload Drivers - Quick Guide

## How to Upload Multiple Drivers at Once

### Step 1: Download the Template
1. Go to `/admin/drivers`
2. Click the **"Download Template"** button (green button)
3. An Excel file `drivers_template.xlsx` will be downloaded

### Step 2: Fill in Your Driver Data

Open the Excel file and you'll see these columns:

| Column Name | Required | Example | Description |
|------------|----------|---------|-------------|
| **SKU** | ✓ Yes | DRV-12V-50W | Unique driver identifier |
| **Name** | ✓ Yes | 12V 50W LED Driver | Driver name |
| **Description** | No | Constant voltage LED driver | Additional details |
| **Min Wattage** | ✓ Yes | 10 | Minimum wattage (in Watts) |
| **Max Wattage** | ✓ Yes | 50 | Maximum wattage (in Watts) |
| **Output Voltage** | No | 12V DC | Driver output voltage |
| **Input Voltage** | No | 100-240V AC | Driver input voltage |
| **Price (USD)** | ✓ Yes | 25.00 | Price in US Dollars |
| **In Stock** | No | Yes | Yes or No (default: Yes) |

### Step 3: Add Your Drivers

Delete the example rows and add your own drivers. Example:

```
SKU             | Name                  | Description              | Min Wattage | Max Wattage | Output Voltage | Input Voltage  | Price (USD) | In Stock
DRV-12V-20W     | 12V 20W Driver        | Small lights driver      | 5           | 20          | 12V DC         | 100-240V AC    | 18.00       | Yes
DRV-12V-50W     | 12V 50W Driver        | Medium lights driver     | 20          | 50          | 12V DC         | 100-240V AC    | 25.00       | Yes
DRV-24V-60W     | 24V 60W Driver        | Medium-high power        | 30          | 60          | 24V DC         | 100-240V AC    | 32.00       | Yes
DRV-24V-100W    | 24V 100W Driver       | High power driver        | 50          | 100         | 24V DC         | 100-240V AC    | 45.00       | Yes
DRV-24V-150W    | 24V 150W Driver       | Very high power          | 80          | 150         | 24V DC         | 100-240V AC    | 65.00       | Yes
```

### Step 4: Upload the File
1. Save your Excel file
2. Go back to `/admin/drivers`
3. Click the **"Bulk Upload"** button (purple button)
4. Select your Excel file
5. Wait for upload to complete
6. You'll see a success message: "✓ Successfully uploaded X drivers"

## Important Notes

### Pricing
- **All prices must be in USD** (US Dollars)
- No currency symbols needed (just the number: 25.00)
- Currency conversion happens automatically for customers

### Wattage Ranges
- **Min Wattage** must be less than **Max Wattage**
- These determine which products can use this driver
- Example: Driver with 20-60W range works for 30W, 40W, 50W products

### SKU Rules
- Must be unique (no duplicates)
- Use clear naming: `DRV-[voltage]-[wattage]W`
- Examples: DRV-12V-50W, DRV-24V-100W

### In Stock
- Use "Yes" or "No"
- Case insensitive (yes, YES, Yes all work)
- Default is "Yes" if left empty

## Example Complete File

Here's a complete example with 5 common drivers:

| SKU | Name | Description | Min Wattage | Max Wattage | Output Voltage | Input Voltage | Price (USD) | In Stock |
|-----|------|-------------|-------------|-------------|----------------|---------------|-------------|----------|
| DRV-12V-20W | 12V 20W Compact Driver | For small LED strips and lights | 5 | 20 | 12V DC | 100-240V AC | 18.00 | Yes |
| DRV-12V-50W | 12V 50W Standard Driver | For medium LED applications | 20 | 50 | 12V DC | 100-240V AC | 25.00 | Yes |
| DRV-24V-60W | 24V 60W Driver | For medium-high power LEDs | 30 | 60 | 24V DC | 100-240V AC | 32.00 | Yes |
| DRV-24V-100W | 24V 100W High Power Driver | For high power LED installations | 50 | 100 | 24V DC | 100-240V AC | 45.00 | Yes |
| DRV-24V-150W | 24V 150W Industrial Driver | For industrial LED applications | 80 | 150 | 24V DC | 100-240V AC | 65.00 | Yes |

## Troubleshooting

### Upload Failed
- Check all required columns are filled
- Verify Min Wattage < Max Wattage
- Ensure prices are numbers (no currency symbols)
- Check for duplicate SKUs

### Some Drivers Failed
- The success message shows how many succeeded
- Failed drivers might have:
  - Duplicate SKUs
  - Invalid data format
  - Missing required fields
- Fix the errors and upload again

### Can't Find Uploaded Drivers
- Refresh the page
- Check if "In Stock" was set to "No"
- Verify the upload success message

## Tips for Best Results

1. **Start Small**: Test with 2-3 drivers first
2. **Use Template**: Always start from the downloaded template
3. **Clear Naming**: Use consistent SKU format
4. **Logical Ranges**: Don't overlap wattage ranges too much
5. **Competitive Pricing**: Research market prices
6. **Keep Backup**: Save your Excel file for future updates

## After Upload

Once uploaded, drivers will:
- ✓ Appear in the drivers table
- ✓ Be available in cart "Add Driver" option
- ✓ Show for all products (no automatic filtering)
- ✓ Be included in PDF/Excel quotations
- ✓ Have automatic currency conversion for customers

## Need to Update Drivers?

You can:
1. **Edit individually**: Click pencil icon on any driver
2. **Delete and re-upload**: Delete old ones, upload new file
3. **Mix methods**: Upload bulk, then edit specific ones

---

**Questions?** Check the main driver documentation in `DRIVER_FEATURE_GUIDE.md`
