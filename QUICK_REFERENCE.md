# Quick Reference Guide

## 🚀 Getting Started

### First Time Setup
```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env

# 3. Edit .env with your values
# - MONGODB_URI
# - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)
# - NEXTAUTH_URL

# 4. Create admin user
npm run create-admin

# 5. Start development server
npm run dev
```

---

## 👤 User Management

### Create Admin User
```bash
npm run create-admin
```
Default credentials:
- Email: `admin@qlite.com`
- Password: `admin123`

### Change Password
```bash
npm run change-password
```

---

## 📦 Product Management

### Adding Products with Multiple IP Ratings

**Admin Dashboard → Add Product**

1. Fill in basic details (SKU, Category, Wattage, etc.)
2. In "IP Ratings" section:
   - Type IP rating (e.g., `IP20`)
   - Click "Add" or press Enter
   - Repeat for all IP ratings (IP30, IP40, etc.)
3. Add images (supports direct URLs, ImgBB, Google Drive)
4. Enter price in USD (will be converted to INR)
5. Click "Create"

### Adding Product Variants (Different Wattages)

For the same model with different wattages:
1. Add first variant: Model X - 3W with IP20, IP30, IP40
2. Add second variant: Model X - 4W with IP20, IP30, IP40
3. Add third variant: Model X - 5W with IP20, IP30, IP40

Each wattage is a separate product entry.

---

## 🛒 Using the Cart System

### Adding Products to Cart

1. Browse products table
2. If product has multiple IP ratings, select from dropdown
3. Click "Add to List"
4. To add same product with different IP rating:
   - Change IP rating in dropdown
   - Button changes back to "Add to List"
   - Click to add as separate entry

### Example:
- Select LED-100W → IP20 → Add → "Added"
- Change to IP40 → "Add to List" appears
- Click Add → Now have 2 entries in cart

---

## 📄 Generating Quotations

### PDF Export
1. Add products to cart
2. Fill in user information:
   - Email
   - Mobile
   - Project Name
3. Click "Export PDF"
4. File downloads as `{ProjectName}_quotation.pdf`

### Excel Export
1. Same as PDF
2. Click "Export Excel"
3. File downloads as `{ProjectName}_cart.xlsx`

Both exports include:
- All product details
- Selected IP ratings
- Quantities
- Prices in selected currency
- Total amount

---

## 💱 Currency Conversion

### Supported Currencies
- INR (Indian Rupee) - Base currency
- USD (US Dollar)
- EUR (Euro)
- GBP (British Pound)
- QAR (Qatari Riyal)
- AED (UAE Dirham)
- SAR (Saudi Riyal)
- BHD (Bahraini Dinar)
- OMR (Omani Rial)

### How It Works
1. Products stored in INR (prices entered in USD, converted once)
2. Users can view/export in any currency
3. Rates update every 24 hours
4. Admins can manually refresh rates

### Manual Rate Refresh (Admin Only)
```bash
# Via API
POST /api/exchange-rates
# Requires admin authentication
```

---

## 🖼️ Image Hosting Options

### Recommended: ImgBB
1. Go to https://imgbb.com
2. Upload image
3. Copy "Direct link" (ends with .jpg/.png)
4. Paste in admin panel

### Google Drive
1. Upload to Google Drive
2. Right-click → Share → Anyone with link
3. Copy sharing link
4. Paste in admin panel (will auto-convert)

### Direct URLs
- Any direct image URL ending with .jpg, .png, .gif, etc.
- Example: `https://example.com/image.jpg`

---

## 🔍 Search & Filtering

### Global Search
- Searches across: SKU, Category, Application, Voltage, Lumen, Beam Angle, IP Rating

### Filter Options
- **Model Number** - Exact match
- **Category** - Dropdown selection
- **Application** - Dropdown selection
- **Input Voltage** - Dropdown selection
- **Beam Angle** - Dropdown selection
- **Wattage Range** - Predefined ranges
- **Lumen Range** - Predefined ranges

### Sorting
- Sort by any column
- Ascending/Descending order

---

## 🔧 Common Tasks

### Update Product Price
1. Admin Dashboard
2. Click edit (pencil icon) on product
3. Update price in INR (not USD when editing)
4. Click "Update"

### Add More IP Ratings to Existing Product
1. Edit product
2. Add new IP ratings in "IP Ratings" section
3. Click "Update"

### Remove Product
1. Admin Dashboard
2. Click delete (trash icon)
3. Confirm deletion

### Clear Cart
1. Open cart sidebar
2. Click "Clear Cart" button
3. Confirm

---

## 🐛 Troubleshooting

### "Could not resolve a direct image URL"
**Solution:** Use ImgBB or direct image URLs instead of Google Drive

### "Invalid email or password"
**Solution:** 
- Check credentials
- Run `npm run change-password` to reset

### Products not showing
**Solution:**
- Check MongoDB connection
- Verify products exist in database
- Check browser console for errors

### PDF/Excel not downloading
**Solution:**
- Fill in all user information (Email, Mobile, Project)
- Check browser pop-up blocker
- Ensure `/public/logo.jpg` exists

### Currency conversion not working
**Solution:**
- Check internet connection (needs API access)
- Fallback rates will be used if API fails
- Admin can manually refresh rates

### Cart items disappearing
**Solution:**
- Cart stored in localStorage
- Clearing browser data clears cart
- Export quotations before clearing data

---

## 📱 Access Levels

### Admin (`/admin`)
- ✅ Add/Edit/Delete products
- ✅ View all products
- ✅ Access admin dashboard
- ✅ Manually refresh exchange rates

### User (`/products`)
- ✅ Browse products
- ✅ Search and filter
- ✅ Add to cart
- ✅ Generate quotations
- ❌ Cannot modify products

---

## 🔐 Security Best Practices

### For Admins
1. **Change default password immediately**
2. **Use strong passwords** (12+ characters, mixed case, numbers, symbols)
3. **Don't share admin credentials**
4. **Log out after use**
5. **Regularly backup database**

### For Deployment
1. **Never commit `.env` file**
2. **Use environment variables for secrets**
3. **Enable HTTPS in production**
4. **Keep dependencies updated**
5. **Monitor error logs**

---

## 📞 Support

### Documentation
- [README.md](./README.md) - Overview
- [AUTH_SETUP.md](./AUTH_SETUP.md) - Authentication setup
- [MONGODB_SETUP.md](./MONGODB_SETUP.md) - Database setup
- [IP_RATING_IMPLEMENTATION.md](./IP_RATING_IMPLEMENTATION.md) - IP ratings feature
- [PRODUCTION_READINESS.md](./PRODUCTION_READINESS.md) - Deployment checklist
- [CODE_REVIEW_REPORT.md](./CODE_REVIEW_REPORT.md) - Code review

### Common Commands
```bash
# Development
npm run dev              # Start dev server

# Production
npm run build           # Build for production
npm start               # Start production server

# User Management
npm run create-admin    # Create admin user
npm run change-password # Change user password

# Setup
npm run setup          # Interactive environment setup
```

---

**Last Updated:** 2025-10-10  
**Version:** 1.0.0
