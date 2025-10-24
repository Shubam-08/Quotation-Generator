# ✅ Voltage Variants Feature

## Overview
You can now add multiple input voltages with different wattages and prices for each product!

---

## How It Works

### Example Product
**Product**: LED Strip Light  
**Voltage Variants**:
- 12V DC - 5W - $45.00
- 24V DC - 5W - $48.00
- 110-240V AC - 7W - $55.00

---

## Admin Page Usage

### Adding Voltage Variants

1. **Open/Create Product** in admin modal
2. **Find "Voltage Variants" section** (below IP Ratings)
3. **Enter Details**:
   - Voltage: `12V DC`
   - Watt: `5`
   - Price (USD): `45.00`
4. **Click "Add"**
5. **Repeat** for other voltages

### Features
- ✅ **Multiple voltages** per product
- ✅ **Individual wattage** for each voltage
- ✅ **Individual price** for each voltage (in USD)
- ✅ **Optional** - leave empty if single voltage
- ✅ **Easy management** - add/remove variants
- ✅ **Visual display** - green badges show all variants

---

## Database Structure

```javascript
{
  sku: "LED-STRIP-001",
  voltageVariants: [
    { voltage: "12V DC", watt: 5, price: 45.00 },
    { voltage: "24V DC", watt: 5, price: 48.00 },
    { voltage: "110-240V AC", watt: 7, price: 55.00 }
  ]
}
```

---

## Benefits

### **Flexibility**
- Different voltages for different markets
- Different prices based on voltage complexity
- Different wattages for different voltages

### **Efficiency**
- One product, multiple variants
- No need to create separate products
- Easy to manage and update

### **Customer Choice**
- Customers can select their preferred voltage
- See wattage and price for each option
- Better shopping experience

---

## Use Cases

### 1. **LED Products**
- 12V DC (low voltage, safe)
- 24V DC (commercial)
- 110-240V AC (universal)

### 2. **Power Supplies**
- 5V DC (USB devices)
- 12V DC (automotive)
- 24V DC (industrial)

### 3. **Lighting Fixtures**
- 12V (landscape lighting)
- 120V (US standard)
- 230V (EU standard)

---

## Important Notes

### **Prices in USD**
- All prices stored in USD
- No conversion in admin
- Conversion only on product page

### **Optional Feature**
- Not required for all products
- Use only when needed
- Legacy single voltage still works

### **Existing Products**
- Not affected
- Can add voltage variants anytime
- Backward compatible

---

## Example Workflow

### **Scenario**: Adding LED Strip with Multiple Voltages

1. **Create Product**:
   - SKU: `LED-STRIP-RGB-5M`
   - Category: `LED Strips`
   - Add IP ratings (IP20, IP65)

2. **Add Voltage Variants**:
   - `12V DC` - `60W` - `$45.00`
   - `24V DC` - `60W` - `$48.00`

3. **Save Product**

4. **Result**: Customers can choose:
   - 12V DC version at $45.00
   - 24V DC version at $48.00

---

## Technical Details

### **Model Schema**
```typescript
voltageVariants: {
  type: [{
    voltage: { type: String, required: true },
    watt: { type: Number, required: false, default: 0 },
    price: { type: Number, required: false, default: 0 }
  }],
  default: []
}
```

### **Interface**
```typescript
interface VoltageVariant {
  voltage: string;  // e.g., "12V DC"
  watt: number;     // e.g., 5
  price: number;    // e.g., 45.00 (USD)
}
```

---

## Future Enhancements (Possible)

- Display voltage variants on product page
- Filter products by voltage
- Bulk import voltage variants
- Voltage-specific inventory tracking

---

**Status**: ✅ **LIVE**  
**Date**: October 24, 2025  
**Feature**: Multiple voltage variants with individual watt and price
