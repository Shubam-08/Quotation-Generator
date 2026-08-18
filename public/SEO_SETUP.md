# SEO Setup Guide for Qlite Global

## ✅ Completed Configuration

### 1. **Title** (59 characters)
```
Qlite Global | Automatic Quotation Generator
```

### 2. **Description** (158 characters)
```
Generate professional product quotations in minutes. Qlite Global helps businesses automate pricing, proposals, and client management efficiently.
```

### 3. **Keywords** (10 terms)
- automatic quotation generator
- quotation software
- product quotation system
- quote automation
- quotation management
- proposal generator
- sales automation
- instant quote builder
- LED lighting quotation
- business proposal tool

### 4. **Icons Configuration**
- **Favicon**: `/favicon.ico` (needs to be created)
- **PNG Icon**: `/logoqliteweb.png` (existing)
- **Apple Touch Icon**: `/logoqliteweb.png` (180x180)

### 5. **OpenGraph Data**
- **Title**: Qlite Global | Instant Quotation Automation
- **Description**: Qlite Global enables instant product quotation generation with smart automation tools. Create, manage, and send quotes within minutes.
- **URL**: https://www.qliteglobal.com
- **Site Name**: Qlite Global
- **Image**: `/og-image.png` (1200x630 - needs to be created)
- **Locale**: en_US
- **Type**: website

### 6. **Twitter Card**
- **Card Type**: summary_large_image
- **Title**: Qlite Global | Automatic Quotation Generator
- **Description**: Generate professional product quotations in minutes with smart automation tools.
- **Image**: `/og-image.png`
- **Creator**: @qliteglobal

### 7. **Additional SEO Features**
- ✅ Authors metadata
- ✅ Creator and Publisher
- ✅ Robots configuration (index, follow)
- ✅ Google Bot specific settings
- ✅ Metadata base URL
- ✅ Canonical URL
- ✅ Verification placeholders (Google, Bing, Yandex)

---

## 🔧 Required Actions

### 1. Create Favicon
You need to create a `favicon.ico` file from your existing logo:

**Option A - Online Tool:**
1. Go to https://favicon.io/favicon-converter/
2. Upload `/public/logoqliteweb.png`
3. Download the generated `favicon.ico`
4. Place it in `/public/favicon.ico`

**Option B - Using ImageMagick (if installed):**
```bash
magick convert public/logoqliteweb.png -define icon:auto-resize=64,48,32,16 public/favicon.ico
```

### 2. Create OpenGraph Image (1200x630)
Create an optimized social sharing image:

**Option A - Design Tool:**
1. Use Canva, Figma, or Photoshop
2. Create 1200x630px image
3. Add your logo and tagline: "Automatic Quotation Generator"
4. Export as PNG
5. Save as `/public/og-image.png`

**Option B - Simple Conversion:**
```bash
# Resize and add padding to existing logo
magick convert public/logoqliteweb.png -resize 1200x630 -gravity center -background white -extent 1200x630 public/og-image.png
```

### 3. Update Domain (if different)
If your domain is not `https://www.qliteglobal.com`, update in `app/layout.tsx`:
- Line 92: `metadataBase` URL
- Line 65: OpenGraph URL

### 4. Add Search Console Verification
Once you have verification codes from search engines:
1. Uncomment lines 87-90 in `app/layout.tsx`
2. Add your verification codes

---

## 📊 Testing Your SEO

### Test OpenGraph Tags
1. **Facebook**: https://developers.facebook.com/tools/debug/
2. **Twitter**: https://cards-dev.twitter.com/validator
3. **LinkedIn**: https://www.linkedin.com/post-inspector/

### Test General SEO
1. **Google Rich Results**: https://search.google.com/test/rich-results
2. **Meta Tags Checker**: https://metatags.io/
3. **SEO Analyzer**: https://www.seobility.net/en/seocheck/

### Verify in Browser
```bash
npm run dev
```
Then check:
- View page source and look for `<meta>` tags
- Check favicon appears in browser tab
- Inspect Network tab for icon loading

---

## 🎯 Best Practices Implemented

✅ **Title**: Under 60 characters for full display in search results
✅ **Description**: Under 160 characters for optimal snippet display
✅ **Keywords**: 10 relevant, specific terms
✅ **OpenGraph**: Proper dimensions (1200x630) for social sharing
✅ **Structured Data**: Author, creator, publisher metadata
✅ **Robots**: Properly configured for search engine crawling
✅ **Canonical URLs**: Prevents duplicate content issues
✅ **Mobile Icons**: Apple touch icons for iOS devices
✅ **Twitter Cards**: Enhanced social media previews

---

## 📝 Next Steps

1. ✅ Metadata configured in `app/layout.tsx`
2. ⏳ Create `favicon.ico` (see instructions above)
3. ⏳ Create `og-image.png` (1200x630)
4. ⏳ Test with SEO tools
5. ⏳ Submit sitemap to Google Search Console
6. ⏳ Add verification codes when available

---

## 🔗 Useful Resources

- [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [OpenGraph Protocol](https://ogp.me/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [Google Search Console](https://search.google.com/search-console)
