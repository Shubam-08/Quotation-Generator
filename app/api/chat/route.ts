import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/lib/models/Product';

// Helper function to detect query type
function detectQueryType(message: string) {
  const lowerMessage = message.toLowerCase();
  
  // Analytical/informational queries
  if (lowerMessage.match(/average|mean|avg/i) && lowerMessage.match(/price|cost/i)) {
    return 'average_price';
  }
  if (lowerMessage.match(/how many|count|total|number of|do you have/i) && lowerMessage.match(/product/i)) {
    return 'product_count';
  }
  if (lowerMessage.match(/price range|cheapest|most expensive|min|max|budget/i)) {
    return 'price_range';
  }
  if (lowerMessage.match(/what.*categories|list.*categories|available categories|show.*categories|all categories/i)) {
    return 'list_categories';
  }
  if (lowerMessage.match(/what.*ip rating|list.*ip|available ip|show.*ip/i)) {
    return 'list_ip_ratings';
  }
  if (lowerMessage.match(/help|what can you|how to use|what do you do|capabilities/i)) {
    return 'help';
  }
  
  // Greeting detection
  if (lowerMessage.match(/^(hi|hello|hey|greetings|good morning|good afternoon|good evening)$/i)) {
    return 'greeting';
  }
  
  // Thanks detection
  if (lowerMessage.match(/^(thanks|thank you|thx|ty|appreciate)$/i)) {
    return 'thanks';
  }
  
  // Default to product search
  return 'product_search';
}

// Helper function to extract keywords and filters from user message
function parseUserQuery(message: string) {
  const lowerMessage = message.toLowerCase();
  
  // Extract wattage
  const wattMatch = lowerMessage.match(/(\d+)\s*w(?:att)?/i);
  const wattage = wattMatch ? parseInt(wattMatch[1]) : null;
  
  // Extract requested number of results
  const limitMatch = lowerMessage.match(/(?:show|give|find|get)\s+(?:me\s+)?(\d+)\s+(?:products?|items?|results?)/i);
  let requestedLimit = limitMatch ? parseInt(limitMatch[1]) : null;
  
  // Check for "all" keyword
  if (lowerMessage.match(/\ball\b|\bevery\b/i) && !requestedLimit) {
    requestedLimit = 50; // Show up to 50 when "all" is requested
  }
  
  // Extract price range (USD only)
  // Check for range first (e.g., "$50-$150", "50 to 100", "between 50 and 100", "between the 50 to 100")
  const rangeMatch = lowerMessage.match(/\$?(\d+)\s*[-–]\s*\$?(\d+)|(?:between\s+(?:the\s+)?)?\$?(\d+)\s+(?:and|to)\s+\$?(\d+)/i);
  let minPrice = null;
  let maxPrice = null;
  
  if (rangeMatch) {
    minPrice = parseInt(rangeMatch[1] || rangeMatch[3]);
    maxPrice = parseInt(rangeMatch[2] || rangeMatch[4]);
  } else {
    // Check for "under X" queries
    const underMatch = lowerMessage.match(/under\s*\$?(\d+)|below\s*\$?(\d+)|less\s*than\s*\$?(\d+)/i);
    if (underMatch) {
      maxPrice = parseInt(underMatch[1] || underMatch[2] || underMatch[3]);
    }
    
    // Check for "over X" or "above X" queries
    const overMatch = lowerMessage.match(/over\s*\$?(\d+)|above\s*\$?(\d+)|more\s*than\s*\$?(\d+)/i);
    if (overMatch) {
      minPrice = parseInt(overMatch[1] || overMatch[2] || overMatch[3]);
    }
  }
  
  // Handle budget keywords
  if (lowerMessage.includes('budget') && !minPrice && !maxPrice) {
    maxPrice = 50; // Budget-friendly: under $50
  } else if (lowerMessage.includes('mid-range') || lowerMessage.includes('midrange')) {
    minPrice = 50;
    maxPrice = 150;
  } else if (lowerMessage.includes('premium')) {
    minPrice = 150;
  }
  
  // Extract lumen
  const lumenMatch = lowerMessage.match(/(\d+)\s*(?:lm|lumen)/i);
  const lumen = lumenMatch ? lumenMatch[1] : null;
  
  // Detect IP rating
  const ipMatch = lowerMessage.match(/ip\s*(\d+)/i);
  const ipRating = ipMatch ? `IP${ipMatch[1]}` : null;
  
  // Detect application/usage
  let application = null;
  if (lowerMessage.includes('outdoor') || lowerMessage.includes('outside')) {
    application = 'outdoor';
  } else if (lowerMessage.includes('indoor') || lowerMessage.includes('inside')) {
    application = 'indoor';
  }
  
  // Detect voltage
  const voltageMatch = lowerMessage.match(/(\d+)\s*v(?:olt)?/i);
  const voltage = voltageMatch ? voltageMatch[1] : null;
  
  // Extract category keywords - comprehensive list matching database categories
  // Note: 'outdoor' and 'indoor' are handled separately as application filters, not categories
  const categoryKeywords = [
    'downlight', 'down light', 'track', 'tracklight', 'spotlight', 'spot light', 'panel', 'strip', 'bulb', 
    'tube', 'flood', 'floodlight', 'wall', 'ceiling', 'pendant', 'linear',
    'cob', 'led', 'driver', 'underwater', 'under water', 'rgb', 'recessed',
    'surface', 'mounted', 'hanging', 'chandelier', 'sconce', 'lamp',
    'garden', 'landscape', 'street', 'streetlight', 'decorative', 'high bay', 'low bay', 'bay',
    'bollard', 'bollards', 'pole', 'post', 'path', 'pathway',
    'step', 'stair', 'deck', 'well', 'inground', 'in-ground',
    'facade', 'wall washer', 'wallwasher', 'graze', 'grazing',
    'canopy', 'soffit', 'cove', 'profile', 'extrusion',
    'neon', 'flex', 'flexible', 'rope', 'tape',
    'puck', 'cabinet', 'under cabinet', 'task',
    'troffer', 'grid', 'drop ceiling', 'suspended',
    'emergency', 'exit', 'sign', 'indicator',
    'smart', 'dimmer', 'controller', 'sensor', 'bulkhead', 'projector', 'industrial'
  ];
  
  const detectedCategories = categoryKeywords.filter(keyword => 
    lowerMessage.includes(keyword)
  );
  
  // Extract general search terms (remove common words)
  const stopWords = ['show', 'me', 'find', 'need', 'want', 'looking', 'for', 'the', 'a', 'an', 'with', 'in', 'under', 'below', 'above', 'ok', 'okay', 'give', 'get', 'some', 'any', 'light', 'lights'];
  const words = lowerMessage.split(/\s+/).filter(word => 
    word.length > 2 && !stopWords.includes(word) && !word.match(/^\d+$/)
  );
  
  return {
    wattage,
    requestedLimit,
    minPrice,
    maxPrice,
    lumen,
    ipRating,
    application,
    voltage,
    categories: detectedCategories,
    searchTerms: words,
    originalMessage: message
  };
}

// Helper function to build MongoDB query
function buildQuery(parsedQuery: any) {
  const query: any = {};
  const orConditions: any[] = [];
  
  // Wattage filter
  if (parsedQuery.wattage) {
    query.watt = { $gte: parsedQuery.wattage - 2, $lte: parsedQuery.wattage + 2 };
  }
  
  // Note: Price filter is applied AFTER processing products, not in DB query
  // This is because actual prices are in ipRatings/voltageVariants arrays
  
  // IP Rating filter
  if (parsedQuery.ipRating) {
    orConditions.push(
      { 'ipRatings.rating': { $regex: parsedQuery.ipRating, $options: 'i' } },
      { ipRating: { $regex: parsedQuery.ipRating, $options: 'i' } }
    );
  }
  
  // Application filter
  if (parsedQuery.application) {
    query.application = { $regex: parsedQuery.application, $options: 'i' };
  }
  
  // Voltage filter
  if (parsedQuery.voltage) {
    orConditions.push(
      { inputVoltage: { $regex: parsedQuery.voltage, $options: 'i' } },
      { 'voltageVariants.voltage': { $regex: parsedQuery.voltage, $options: 'i' } }
    );
  }
  
  // Category search - prioritize category fields over SKU
  if (parsedQuery.categories.length > 0) {
    const categoryRegex = parsedQuery.categories.join('|');
    // Search in category fields first, then SKU and description
    orConditions.push(
      { category: { $regex: categoryRegex, $options: 'i' } },
      { categoryFilter: { $regex: categoryRegex, $options: 'i' } },
      { sku: { $regex: categoryRegex, $options: 'i' } },
      { description: { $regex: categoryRegex, $options: 'i' } }
    );
  }
  
  // General search terms
  if (parsedQuery.searchTerms.length > 0) {
    const searchRegex = parsedQuery.searchTerms.join('|');
    orConditions.push(
      { sku: { $regex: searchRegex, $options: 'i' } },
      { category: { $regex: searchRegex, $options: 'i' } },
      { description: { $regex: searchRegex, $options: 'i' } },
      { application: { $regex: searchRegex, $options: 'i' } }
    );
  }
  
  if (orConditions.length > 0) {
    query.$or = orConditions;
  }
  
  return query;
}

// Helper function to generate response message
function generateResponseMessage(products: any[], parsedQuery: any) {
  if (products.length === 0) {
    return "I couldn't find any products matching your criteria. Try adjusting your search or ask me about:\n• Different wattage ranges\n• Other IP ratings\n• Alternative categories\n• Higher budget";
  }
  
  let message = `I found ${products.length} product${products.length > 1 ? 's' : ''} for you`;
  
  if (parsedQuery.wattage) {
    message += ` around ${parsedQuery.wattage}W`;
  }
  if (parsedQuery.minPrice && parsedQuery.maxPrice) {
    message += ` between $${parsedQuery.minPrice} and $${parsedQuery.maxPrice}`;
  } else if (parsedQuery.maxPrice) {
    message += ` under $${parsedQuery.maxPrice}`;
  } else if (parsedQuery.minPrice) {
    message += ` over $${parsedQuery.minPrice}`;
  }
  if (parsedQuery.ipRating) {
    message += ` with ${parsedQuery.ipRating} rating`;
  }
  if (parsedQuery.application) {
    message += ` for ${parsedQuery.application} use`;
  }
  if (parsedQuery.categories.length > 0) {
    message += ` in ${parsedQuery.categories.join(', ')} category`;
  }
  
  message += '. Here are the best matches:';
  
  return message;
}

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }
    
    // Connect to database
    await connectDB();
    
    // Get context from conversation history
    const lastAssistantMessage = history && history.length > 0 
      ? history.filter((msg: any) => msg.role === 'assistant').pop()?.content || ''
      : '';
    
    const lastUserMessage = history && history.length > 0
      ? history.filter((msg: any) => msg.role === 'user').pop()?.content || ''
      : '';
    
    // Handle conversational responses (yes, no, show me, etc.)
    const lowerMessage = message.toLowerCase().trim();
    
    // Extract context keywords from conversation history
    const contextKeywords: string[] = [];
    if (lastUserMessage) {
      const userWords = lastUserMessage.toLowerCase().split(/\s+/);
      contextKeywords.push(...userWords.filter((w: string) => w.length > 3));
    }
    if (lastAssistantMessage) {
      // Extract product categories mentioned
      const categoryMatches = lastAssistantMessage.match(/underwater|downlight|track|panel|strip|flood|spotlight|bulb|tube|linear|bollard|rgb|recessed|surface|pendant|chandelier|wall|ceiling|high bay|low bay/gi);
      if (categoryMatches) {
        contextKeywords.push(...categoryMatches.map((m: string) => m.toLowerCase()));
      }
    }
    
    // Check for affirmative responses
    if (['yes', 'yeah', 'sure', 'ok', 'okay', 'yep', 'yup', 'please', 'show me', 'show'].includes(lowerMessage)) {
      // Extract context from last assistant message
      if (lastAssistantMessage.includes('price range') || lastAssistantMessage.includes('budget')) {
        return NextResponse.json({
          message: "Great! What's your budget? You can say:\n• \"Under $50\"\n• \"Between $50 and $100\"\n• \"Show me budget options\"\n• \"Premium products\"\n\nOr just tell me a price range naturally!",
          products: []
        });
      }
      if (lastAssistantMessage.includes('category') || lastAssistantMessage.includes('categories')) {
        return NextResponse.json({
          message: "Which category would you like to explore? Try:\n• \"Show me downlights\"\n• \"Track lights\"\n• \"LED panels\"\n• \"Outdoor lights\"\n\nOr just tell me what you're looking for!",
          products: []
        });
      }
      if (lastAssistantMessage.includes('explore') || lastAssistantMessage.includes('What would you like')) {
        // Default helpful response
        return NextResponse.json({
          message: "I can show you:\n\n🔦 Popular categories:\n• Downlights\n• Track lights\n• Panel lights\n• Strip lights\n\n💡 Or search by:\n• Wattage (e.g., \"10W lights\")\n• Application (\"outdoor\" or \"indoor\")\n• IP rating (\"IP65\")\n• Budget (\"under $100\")\n\nWhat interests you?",
          products: []
        });
      }
      
      // If context mentions specific category, search for it
      if (lastAssistantMessage.includes('underwater')) {
        const parsedQuery = parseUserQuery('underwater lights');
        const dbQuery = buildQuery(parsedQuery);
        const products = await Product.find(dbQuery).limit(10).lean();
        const processedProducts = products.map((product: any) => ({
          ...product,
          price: product.ipRatings?.[0]?.price || product.voltageVariants?.[0]?.price || product.price || 0,
          ipRating: product.ipRatings?.[0]?.rating || product.ipRating?.[0] || '',
          watt: product.voltageVariants?.[0]?.watt || product.watt || 0,
          lumen: product.voltageVariants?.[0]?.lumen || product.lumen || '',
        }));
        
        return NextResponse.json({
          message: `I found ${processedProducts.length} underwater lights for you. Here are the best matches:`,
          products: processedProducts
        });
      }
    }
    
    // Handle negative responses
    if (['no', 'nope', 'nah', 'not really'].includes(lowerMessage)) {
      return NextResponse.json({
        message: "No problem! What else can I help you with? You can:\n• Search for specific products\n• Ask about pricing\n• Explore categories\n• Get product recommendations",
        products: []
      });
    }
    
    // Handle vague queries with context
    if (['more', 'show more', 'other', 'others', 'different', 'else'].includes(lowerMessage)) {
      return NextResponse.json({
        message: "I'd be happy to show you more! Could you be more specific?\n• Different category?\n• Different wattage?\n• Different price range?\n• Different application?",
        products: []
      });
    }
    
    // Detect query type
    const queryType = detectQueryType(message);
    
    // Handle "categories" request or vague queries - ask for category selection
    if (lowerMessage === 'categories' || lowerMessage === 'category' || lowerMessage === 'show categories') {
      // Get all unique categories from database
      const categories = await Product.distinct('categoryFilter');
      const categoryList = categories.filter((c: string) => c).sort().join('\n• ');
      
      return NextResponse.json({
        message: `Here are all our product categories:\n\n• ${categoryList}\n\nWhich one would you like to explore? Just type the category name!`,
        products: []
      });
    }
    
    const vagueLightQueries = /^(lights?|products?|show|find|search|i want|give me|looking for)$/i;
    if (vagueLightQueries.test(lowerMessage.trim())) {
      
      // Get all unique categories from database
      const categories = await Product.distinct('categoryFilter');
      const categoryList = categories.filter((c: string) => c).sort().slice(0, 15).join('\n• ');
      
      return NextResponse.json({
        message: `I'd be happy to help you find the perfect lighting! 🔦\n\nWhich category are you interested in?\n\n• ${categoryList}\n\n...and more! Type "categories" to see all, or just tell me what you need!`,
        products: []
      });
    }
    
    // Handle analytical queries
    if (queryType === 'average_price') {
      const products = await Product.find({}).select('price ipRatings voltageVariants').lean();
      let totalPrice = 0;
      let count = 0;
      
      products.forEach((product: any) => {
        if (product.ipRatings && product.ipRatings.length > 0) {
          product.ipRatings.forEach((ip: any) => {
            if (ip.price > 0) {
              totalPrice += ip.price;
              count++;
            }
          });
        } else if (product.voltageVariants && product.voltageVariants.length > 0) {
          product.voltageVariants.forEach((variant: any) => {
            if (variant.price > 0) {
              totalPrice += variant.price;
              count++;
            }
          });
        } else if (product.price > 0) {
          totalPrice += product.price;
          count++;
        }
      });
      
      const average = count > 0 ? (totalPrice / count).toFixed(2) : 0;
      return NextResponse.json({
        message: `Based on our ${count} products, the average price is $${average} USD. This includes all product variants and IP rating options.\n\nWould you like to see products in a specific price range?`,
        products: []
      });
    }
    
    if (queryType === 'product_count') {
      const count = await Product.countDocuments({});
      return NextResponse.json({
        message: `We currently have ${count} products in our catalog. You can search by:\n• Category (downlight, track, panel, etc.)\n• Wattage\n• IP rating\n• Application (indoor/outdoor)\n• Price range\n\nWhat would you like to explore?`,
        products: []
      });
    }
    
    if (queryType === 'price_range') {
      const products = await Product.find({}).select('price ipRatings voltageVariants sku').lean();
      let prices: number[] = [];
      
      products.forEach((product: any) => {
        if (product.ipRatings && product.ipRatings.length > 0) {
          product.ipRatings.forEach((ip: any) => {
            if (ip.price > 0) prices.push(ip.price);
          });
        } else if (product.voltageVariants && product.voltageVariants.length > 0) {
          product.voltageVariants.forEach((variant: any) => {
            if (variant.price > 0) prices.push(variant.price);
          });
        } else if (product.price > 0) {
          prices.push(product.price);
        }
      });
      
      const min = Math.min(...prices).toFixed(2);
      const max = Math.max(...prices).toFixed(2);
      
      return NextResponse.json({
        message: `Our product prices range from $${min} to $${max} USD.\n\n💰 Budget-friendly: Under $50\n💎 Mid-range: $50-$150\n⭐ Premium: Above $150\n\nWhat's your budget?`,
        products: []
      });
    }
    
    if (queryType === 'list_categories') {
      const products = await Product.find({}).select('category categoryFilter').lean();
      const categories = new Set<string>();
      
      products.forEach((product: any) => {
        if (product.categoryFilter) {
          categories.add(product.categoryFilter);
        } else if (product.category) {
          categories.add(product.category);
        }
      });
      
      const categoryList = Array.from(categories).sort().join('\n• ');
      
      return NextResponse.json({
        message: `Here are our product categories:\n\n• ${categoryList}\n\nWhich category interests you?`,
        products: []
      });
    }
    
    if (queryType === 'list_ip_ratings') {
      const products = await Product.find({}).select('ipRating ipRatings').lean();
      const ipRatings = new Set<string>();
      
      products.forEach((product: any) => {
        if (product.ipRatings && product.ipRatings.length > 0) {
          product.ipRatings.forEach((ip: any) => ipRatings.add(ip.rating));
        } else if (product.ipRating && product.ipRating.length > 0) {
          product.ipRating.forEach((rating: string) => ipRatings.add(rating));
        }
      });
      
      const ratingList = Array.from(ipRatings).sort().join(', ');
      
      return NextResponse.json({
        message: `Available IP ratings: ${ratingList}\n\n💡 Tip:\n• IP20-IP40: Indoor use\n• IP54-IP65: Outdoor/wet areas\n• IP67-IP68: Submersible\n\nWhich IP rating do you need?`,
        products: []
      });
    }
    
    if (queryType === 'help') {
      return NextResponse.json({
        message: `I can help you with:\n\n🔍 Product Search:\n• "Show me 10W downlights"\n• "Outdoor LED lights"\n• "IP65 products under $100"\n\n📊 Information:\n• "What's the average price?"\n• "How many products do you have?"\n• "List all categories"\n• "What IP ratings are available?"\n\n💬 Just ask naturally - I'll understand!`,
        products: []
      });
    }
    
    if (queryType === 'greeting') {
      return NextResponse.json({
        message: `Hello! 👋 I'm here to help you find the perfect lighting products.\n\nYou can:\n• Search for specific products\n• Ask about pricing and availability\n• Explore categories\n• Get recommendations\n\nWhat are you looking for today?`,
        products: []
      });
    }
    
    if (queryType === 'thanks') {
      return NextResponse.json({
        message: `You're welcome! 😊 Feel free to ask if you need anything else. I'm here to help!`,
        products: []
      });
    }
    
    // Default: Product search
    // Combine current message with context for better understanding
    let searchMessage = message;
    
    // If message is very short and we have context, combine them
    if (message.split(/\s+/).length <= 5 && contextKeywords.length > 0) {
      // Check if message contains price, wattage, IP rating, or application filters
      const hasFilter = message.match(/\d+|\$|price|budget|cheap|expensive|under|over|between|ip\d+|watt|indoor|outdoor/i);
      if (hasFilter) {
        // Keep filter context, add category from history
        const categoryFromContext = contextKeywords.find((k: string) => 
          ['underwater', 'downlight', 'track', 'panel', 'strip', 'flood', 'spotlight', 'bulb', 'tube', 
           'linear', 'bollard', 'rgb', 'recessed', 'surface', 'pendant', 'chandelier', 'wall', 'ceiling'].includes(k)
        );
        if (categoryFromContext) {
          searchMessage = `${categoryFromContext} ${message}`;
          console.log('Combined search:', searchMessage); // Debug log
        }
      }
    }
    
    const parsedQuery = parseUserQuery(searchMessage);
    const dbQuery = buildQuery(parsedQuery);
    
    // If no specific filters, do a general search
    if (Object.keys(dbQuery).length === 0) {
      dbQuery.$or = [
        { sku: { $regex: searchMessage, $options: 'i' } },
        { category: { $regex: searchMessage, $options: 'i' } },
        { description: { $regex: searchMessage, $options: 'i' } }
      ];
    }
    
    // Query database
    // Get more products since we'll filter by price after processing and sort by relevance
    // If user requested specific number, fetch more to ensure we have enough after filtering
    const defaultLimit = 5;
    const userLimit = parsedQuery.requestedLimit || defaultLimit;
    // Fetch more products to ensure we get the best matches after relevance sorting
    const fetchLimit = parsedQuery.minPrice || parsedQuery.maxPrice ? userLimit * 10 : Math.max(userLimit * 5, 25);
    
    let products = await Product.find(dbQuery)
      .limit(fetchLimit)
      .select('sku category description price watt lumen beamAngle inputVoltage ipRating ipRatings application voltageVariants categoryFilter')
      .lean();
    
    // Process products to get the right price and IP rating
    let processedProducts = products.map((product: any) => {
      let finalPrice = product.price || 0;
      let finalIpRating = null;
      
      // Get price from ipRatings if available
      if (product.ipRatings && product.ipRatings.length > 0) {
        finalPrice = product.ipRatings[0].price || finalPrice;
        finalIpRating = product.ipRatings[0].rating;
      } else if (product.ipRating && product.ipRating.length > 0) {
        finalIpRating = Array.isArray(product.ipRating) ? product.ipRating[0] : product.ipRating;
      }
      
      // Get price from voltage variants if available
      if (product.voltageVariants && product.voltageVariants.length > 0) {
        const variant = product.voltageVariants[0];
        if (variant.price > 0) {
          finalPrice = variant.price;
        }
      }
      
      // Calculate relevance score for sorting
      let relevanceScore = 0;
      const lowerCategory = (product.category || '').toLowerCase();
      const lowerCategoryFilter = (product.categoryFilter || '').toLowerCase();
      
      // Exact category match gets highest priority
      if (parsedQuery.categories.length > 0) {
        parsedQuery.categories.forEach((cat: string) => {
          if (lowerCategory === cat.toLowerCase()) relevanceScore += 100;
          else if (lowerCategory.includes(cat.toLowerCase())) relevanceScore += 50;
          
          if (lowerCategoryFilter === cat.toLowerCase()) relevanceScore += 100;
          else if (lowerCategoryFilter.includes(cat.toLowerCase())) relevanceScore += 50;
        });
      }
      
      return {
        _id: product._id.toString(),
        sku: product.sku,
        category: product.category,
        description: product.description,
        price: finalPrice,
        watt: product.watt,
        lumen: product.lumen,
        beamAngle: product.beamAngle,
        inputVoltage: product.inputVoltage,
        ipRating: finalIpRating,
        application: product.application,
        relevanceScore
      };
    });
    
    // Sort by relevance score (highest first)
    processedProducts.sort((a: any, b: any) => b.relevanceScore - a.relevanceScore);
    
    // Apply price filter AFTER processing (since real prices are in ipRatings/voltageVariants)
    if (parsedQuery.minPrice !== null && parsedQuery.maxPrice !== null) {
      const minPrice = parsedQuery.minPrice;
      const maxPrice = parsedQuery.maxPrice;
      processedProducts = processedProducts.filter((p: any) => 
        p.price >= minPrice && p.price <= maxPrice
      );
    } else if (parsedQuery.maxPrice !== null) {
      const maxPrice = parsedQuery.maxPrice;
      processedProducts = processedProducts.filter((p: any) => 
        p.price <= maxPrice
      );
    } else if (parsedQuery.minPrice !== null) {
      const minPrice = parsedQuery.minPrice;
      processedProducts = processedProducts.filter((p: any) => 
        p.price >= minPrice
      );
    }
    
    // Limit to requested number or default 5
    processedProducts = processedProducts.slice(0, userLimit);
    
    // Generate response message
    let responseMessage = generateResponseMessage(processedProducts, parsedQuery);
    
    // Add follow-up questions if products found and no specific filters applied
    if (processedProducts.length > 0 && !parsedQuery.minPrice && !parsedQuery.maxPrice && !parsedQuery.wattage && !parsedQuery.ipRating) {
      responseMessage += "\n\n💡 Want to narrow down your search?\n• \"Show me under $100\"\n• \"I need IP65 rating\"\n• \"10W to 20W\"\n• \"Outdoor use\"";
    }
    
    return NextResponse.json({
      message: responseMessage,
      products: processedProducts,
      query: parsedQuery // For debugging
    });
    
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
