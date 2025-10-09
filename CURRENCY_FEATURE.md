# Multi-Currency Support Implementation

## Overview
This application now supports multiple currencies for global users from different countries including India, Bahrain, Dubai, Qatar, and more.

## Supported Currencies
- **INR** - Indian Rupee (₹) - Base currency
- **USD** - US Dollar ($)
- **GBP** - British Pound (£)
- **EUR** - Euro (€)
- **QAR** - Qatari Riyal (QR)
- **AED** - UAE Dirham (AED)
- **SAR** - Saudi Riyal (SAR)
- **BHD** - Bahraini Dinar (BD)
- **OMR** - Omani Rial (OMR)

## Currency Conversion Accuracy
Test with sample product price of ₹1000:
- [ ] USD: Should show ~$11.26
- [ ] GBP: Should show ~£8.93
- [ ] EUR: Should show ~€10.32
- [ ] QAR: Should show ~QR 41.01
- [ ] AED: Should show ~AED 41.36
- [ ] SAR: Should show ~SAR 42.24
- [ ] BHD: Should show ~BD 4.24
- [ ] OMR: Should show ~OMR 4.33
- [ ] INR: Should show ₹1,000.00

**Example:** ₹5,194.20 → $58.47 (USD)

### Currency Selection
- Users can select their preferred currency from a dropdown selector
- Currency selection is available on:
  - Product listing page (header section)
  - Cart/Quotation page (header section)
- Selected currency is persisted in browser's localStorage
### 2. Real-time Price Conversion
- All prices are stored in INR (base currency) in the database
- Prices are automatically converted to the selected currency in real-time
- Conversion happens on:
  - Product listing table
  - Cart item prices
  - Cart total amount
  - PDF quotations
  - Excel exports

### 3. PDF & Excel Export
- Generated PDFs include:
  - Selected currency code and name
  - All prices converted to selected currency
  - Properly formatted currency symbols
- Excel exports include:
  - Currency information in header
  - Converted prices with 2 decimal precision

## Implementation Details

### Components Created
1. **CurrencyContext** (`context/CurrencyContext.tsx`)
   - Manages currency state globally
   - Provides conversion functions
   - Handles currency formatting
   - Persists selection to localStorage

2. **CurrencySelector** (`components/CurrencySelector.tsx`)
   - Dropdown component for currency selection
   - Shows currency code and full name
   - Styled to match application design

### Modified Components
1. **Providers** (`components/Providers.tsx`)
   - Added CurrencyProvider wrapper

2. **Product Page** (`app/products/page.tsx`)
   - Added currency selector to header
   - Added price column to product table
   - Prices display in selected currency

3. **CartSidebar** (`components/CartSidebar.tsx`)
   - Added currency selector to cart header
   - Updated all price displays to use selected currency
   - Modified PDF generation to include currency info
   - Modified Excel export to include currency info

## Exchange Rates

### Live Rate Fetching
- Exchange rates are fetched from a live API (open.er-api.com)
- Rates are cached for 24 hours to prevent excessive API calls
- Cached rates are stored in both server memory and browser localStorage
- Automatic fallback to cached rates if API is unavailable

### Rate Stability
- **Cache Duration**: 24 hours (configurable)
- **Purpose**: Prevents price fluctuations during the day
- **Benefits**: 
  - Consistent pricing for customers throughout the day
  - Reduced API calls
  - Better user experience with stable quotes

### Manual Refresh
- Admin users can manually refresh rates using the "Refresh" button
- Useful for updating rates before generating important quotations
- Shows last update timestamp

### Fallback Mechanism
1. **Primary**: Live API rates (cached for 24 hours)
2. **Secondary**: Browser localStorage (offline support)
3. **Tertiary**: Hardcoded fallback rates (if all else fails)

## Usage

### For Users
1. Navigate to the Products page
2. Select your preferred currency from the dropdown in the header
3. All prices will automatically update
4. Add products to cart
5. Generate PDF or Excel - currency will be reflected in exports

### For Developers
```typescript
// Use currency in any component
import { useCurrency } from '@/context/CurrencyContext';

function MyComponent() {
  const { formatPrice, convertPrice, currencyInfo } = useCurrency();
  
  // Format a price
  const formattedPrice = formatPrice(1000); // "$ 12.00" if USD selected
  
  // Convert without formatting
  const converted = convertPrice(1000); // 12.0 if USD selected
  
  // Get current currency info
  console.log(currencyInfo.code); // "USD"
  console.log(currencyInfo.symbol); // "$"
}
```

## Future Enhancements
1. Add live exchange rate API integration
2. Add currency conversion disclaimer in quotations
3. Add admin panel to manage exchange rates
4. Add support for more currencies
5. Add currency-specific formatting rules (decimal places, thousand separators)
