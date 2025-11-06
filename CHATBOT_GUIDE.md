# Product Chatbot Feature Guide

## Overview
The Product Chatbot is an interactive AI assistant that helps users find products from your database in real-time. It understands natural language queries and provides intelligent product suggestions with pricing.

## Features

### 🎯 Smart Query Understanding
The chatbot can understand and extract:
- **Wattage**: "Show me 10W lights" → Finds products around 10W (±2W range)
- **Price Range**: "Under $100" or "Below $50" → Filters by maximum price
- **IP Rating**: "IP65 products" → Searches for specific IP ratings
- **Application**: "Outdoor lights" or "Indoor use" → Filters by application type
- **Voltage**: "12V products" → Searches input voltage and voltage variants
- **Categories**: Detects keywords like "downlight", "track", "spotlight", "panel", etc.
- **Lumen Output**: "1000 lumen" → Searches for specific brightness levels

### 💬 Example Queries
Users can ask questions like:
- "Show me LED downlights for outdoor use"
- "I need a 10W spotlight"
- "What's available in IP65 rating?"
- "Show me track lights under $100"
- "Find 12V LED strips"
- "Indoor panel lights around 20W"
- "Outdoor floodlights with high lumens"

### 🛒 Direct Cart Integration
- Each product suggestion has an "Add to Cart" button
- Clicking adds the product directly to the shopping cart
- Supports the existing cart system with all product variants

### 💰 Real-time Pricing
- Displays prices in the user's selected currency
- Uses the same currency conversion system as the main site
- Shows accurate pricing from:
  - IP rating variants
  - Voltage variants
  - Base product prices

## Technical Implementation

### Components Created

1. **ProductChatbot.tsx** (`/components/ProductChatbot.tsx`)
   - Chat UI with floating button
   - Message display with user/assistant distinction
   - Product card rendering with specifications
   - Real-time loading states
   - Responsive design

2. **Chat API** (`/app/api/chat/route.ts`)
   - Natural language query parsing
   - MongoDB query building
   - Product search and filtering
   - Response generation

### Query Processing Flow

1. **User Input** → User types a question
2. **Parse Query** → Extract filters (wattage, price, IP rating, etc.)
3. **Build MongoDB Query** → Construct database query with filters
4. **Search Database** → Find matching products (limit 5)
5. **Process Results** → Format products with correct pricing
6. **Generate Response** → Create natural language response
7. **Display Products** → Show product cards with "Add to Cart" buttons

### Database Integration

The chatbot queries your existing Product collection with support for:
- Standard product fields (sku, category, watt, lumen, etc.)
- IP rating variants with individual pricing
- Voltage variants with wattage and pricing
- Product descriptions and applications
- All file attachments (datasheets, IES files, certifications)

## Customization Options

### Modify Search Logic
Edit `/app/api/chat/route.ts`:

```typescript
// Adjust wattage tolerance
query.watt = { $gte: parsedQuery.wattage - 5, $lte: parsedQuery.wattage + 5 };

// Change result limit
let products = await Product.find(dbQuery).limit(10);

// Add more category keywords
const categoryKeywords = [
  'downlight', 'track', 'your-custom-category'
];
```

### Customize UI Appearance
Edit `/components/ProductChatbot.tsx`:

```typescript
// Change colors
className="bg-yellow-400" // Change to your brand color

// Adjust chat window size
className="w-[400px] h-[600px]" // Modify dimensions

// Update welcome message
content: "Your custom welcome message here"
```

### Add More Query Patterns
In `/app/api/chat/route.ts`, extend the `parseUserQuery` function:

```typescript
// Add beam angle detection
const beamAngleMatch = lowerMessage.match(/(\d+)\s*(?:degree|°)/i);
const beamAngle = beamAngleMatch ? beamAngleMatch[1] : null;

// Add color temperature
if (lowerMessage.includes('warm white') || lowerMessage.includes('2700k')) {
  // Add to query
}
```

## Usage Tips

### For End Users
1. Click the yellow chat button in the bottom-right corner
2. Type your question naturally (no special syntax needed)
3. Browse suggested products
4. Click "Add" to add products to cart
5. Continue asking questions or close the chat

### For Developers
- The chatbot uses the existing CartContext for cart operations
- Currency formatting uses the CurrencyContext
- All product data comes from your MongoDB database
- No external APIs or AI services required
- Fully customizable and extendable

## Performance Considerations

- Results are limited to 5 products per query (adjustable)
- Database queries use indexes on common fields
- Lean queries for better performance
- Client-side state management for smooth UX

## Future Enhancements

Potential improvements you could add:
- [ ] Multi-language support
- [ ] Product comparison feature
- [ ] Save chat history
- [ ] Export chat as PDF
- [ ] Voice input support
- [ ] Product recommendations based on chat history
- [ ] Integration with inventory levels
- [ ] Suggested follow-up questions

## Troubleshooting

### Chatbot not appearing
- Check that ProductChatbot is imported in layout.tsx
- Verify the component is inside the Providers wrapper

### No products returned
- Check MongoDB connection
- Verify Product model schema matches
- Review query parsing logic in console

### Pricing issues
- Ensure ipRatings and voltageVariants have price fields
- Check currency conversion is working
- Verify formatPrice function from CurrencyContext

## Support

For issues or questions:
1. Check browser console for errors
2. Review API response in Network tab
3. Verify database connection and data structure
4. Test with simple queries first ("show me products")
