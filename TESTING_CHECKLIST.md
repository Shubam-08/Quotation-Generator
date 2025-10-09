# Testing Checklist

## User Feedback Feature (Toast Notifications)

### Product Page - Add to List Button
- [ ] Click "Add to List" button on any product
- [ ] Verify toast notification appears in top-right corner with success message
- [ ] Verify toast shows product SKU in the message
- [ ] Verify toast auto-dismisses after 3 seconds
- [ ] Verify toast can be manually dismissed by clicking X button
- [ ] Try adding the same product again
- [ ] Verify info toast appears saying product is already in list
- [ ] Verify button changes to "Added" and becomes disabled
- [ ] Verify button color changes to gray when product is in cart
- [ ] Verify button shows brief animation (scale down) when clicked

### Toast Notification Behavior
- [ ] Multiple toasts stack vertically
- [ ] Toasts slide in from the right with animation
- [ ] Toast icons match the message type (success/info/error)
- [ ] Toast colors match the type (green for success, blue for info, red for error)

---

## Multi-Currency Feature

### Currency Selector
- [ ] Currency selector appears in product page header
- [ ] Currency selector appears in cart page header
- [ ] Dropdown shows all 9 supported currencies
- [ ] Each option shows currency code and full name
- [ ] Selected currency persists after page refresh
- [ ] Currency icon (DollarSign) displays correctly

### Product Page
- [ ] Price column displays in product table
- [ ] Prices update immediately when currency is changed
- [ ] Price format includes correct currency symbol
- [ ] Prices show 2 decimal places
- [ ] All products show converted prices

### Cart Page
- [ ] Individual item prices show in selected currency
- [ ] Item subtotals (price × quantity) show in selected currency
- [ ] Total amount shows in selected currency
- [ ] Prices update when currency is changed
- [ ] Currency selector in cart header works independently

### PDF Export
- [ ] Generate PDF with different currencies
- [ ] Verify "Currency: [CODE] - [NAME]" appears in PDF header
- [ ] Verify all prices in table are converted correctly
- [ ] Verify total amount uses correct currency symbol
- [ ] Verify prices have 2 decimal places
- [ ] Verify currency formatting is consistent throughout PDF

### Excel Export
- [ ] Generate Excel with different currencies
- [ ] Verify "Currency: [CODE] - [NAME]" appears in header row
- [ ] Verify all prices in table are converted correctly
- [ ] Verify total amount is converted correctly
- [ ] Verify prices have 2 decimal places

### Currency Conversion Accuracy
Test with sample product price of ₹1000:
- [ ] USD: Should show $11.26
- [ ] GBP: Should show £8.93
- [ ] EUR: Should show €10.32
- [ ] QAR: Should show QR 41.01
- [ ] AED: Should show AED 41.36
- [ ] SAR: Should show SAR 42.24
- [ ] BHD: Should show BD 4.24
- [ ] OMR: Should show OMR 4.33
- [ ] INR: Should show ₹1,000.00

**Verification Example:**
- [ ] ₹5,194.20 should convert to $58.47 (USD)

### Edge Cases
- [ ] Cart with multiple items - all prices convert correctly
- [ ] Cart with high quantities - totals calculate correctly
- [ ] Switching currency multiple times - no calculation errors
- [ ] Empty cart - currency selector still works
- [ ] Products with price = 0 - displays correctly
- [ ] Very large prices - formatting remains correct

---

## Integration Testing

### Combined Features
- [ ] Add product to cart → Toast appears → Check cart → Price in selected currency
- [ ] Change currency → Add product → Toast shows → Cart shows correct currency
- [ ] Add multiple products → Change currency → Export PDF → All prices correct
- [ ] Add products → Change currency → Export Excel → All prices correct
- [ ] Clear cart → Change currency → Add products → Everything works

### Browser Compatibility
- [ ] Chrome - All features work
- [ ] Firefox - All features work
- [ ] Safari - All features work
- [ ] Edge - All features work

### Responsive Design
- [ ] Mobile view - Currency selector displays correctly
- [ ] Mobile view - Toast notifications display correctly
- [ ] Tablet view - All features accessible
- [ ] Desktop view - Optimal layout

### Performance
- [ ] Currency changes are instant (no lag)
- [ ] Toast animations are smooth
- [ ] No console errors
- [ ] No memory leaks with multiple toasts
- [ ] PDF generation completes successfully
- [ ] Excel export completes successfully

---

## Known Limitations

1. **Exchange Rates**: Currently hardcoded. For production, integrate with live API.
2. **Offline Mode**: Currency conversion requires rates to be loaded.
3. **Historical Rates**: No support for historical exchange rates.
4. **Rounding**: May have minor rounding differences in complex calculations.

---

## Test Data

### Sample Products for Testing
1. Product with low price (₹100)
2. Product with medium price (₹5,000)
3. Product with high price (₹50,000)
4. Product with decimal price (₹1,234.56)

### Test Scenarios
1. **Single Item**: Add 1 product, quantity 1
2. **Multiple Items**: Add 5 different products
3. **High Quantity**: Add 1 product with quantity 100
4. **Mixed Cart**: Various products with different quantities
5. **Currency Switch**: Add items in INR, switch to USD, verify totals
