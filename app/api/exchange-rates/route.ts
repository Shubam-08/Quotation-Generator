import { NextResponse } from 'next/server';

// In-memory cache for exchange rates
let cachedRates: {
  rates: Record<string, number>;
  lastUpdated: number;
  nextUpdate: number;
} | null = null;

// Cache duration: 24 hours (in milliseconds)
const CACHE_DURATION = 24 * 60 * 60 * 1000;

// Fallback rates (used if API fails)
// These rates represent: 1 USD = X foreign currency
// Example: 1 USD = 88.65 INR, 1 USD = 0.79 GBP, etc.
const FALLBACK_RATES = {
  USD: 1,        // Base currency
  INR: 88.65,    // 1 USD = 88.65 INR
  GBP: 0.79,     // 1 USD = 0.79 GBP
  EUR: 0.92,     // 1 USD = 0.92 EUR
  QAR: 3.64,     // 1 USD = 3.64 QAR
  AED: 3.67,     // 1 USD = 3.67 AED
  SAR: 3.75,     // 1 USD = 3.75 SAR
  BHD: 0.38,    // 1 USD = 0.376 BHD
  OMR: 0.385,    // 1 USD = 0.385 OMR
};

// Free exchange rate API (no API key required)
// Alternative: Use exchangerate-api.com with API key for better reliability
const EXCHANGE_API_URL = 'https://open.er-api.com/v6/latest/USD';

async function fetchLiveRates(): Promise<Record<string, number>> {
  try {
    const response = await fetch(EXCHANGE_API_URL, {
      next: { revalidate: CACHE_DURATION / 1000 }, // Next.js cache
    });

    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }

    const data = await response.json();
    
    if (data.result === 'success' && data.rates) {
      // Extract only the currencies we support
      return {
        USD: 1, // Base currency
        INR: data.rates.INR || FALLBACK_RATES.INR,
        GBP: data.rates.GBP || FALLBACK_RATES.GBP,
        EUR: data.rates.EUR || FALLBACK_RATES.EUR,
        QAR: data.rates.QAR || FALLBACK_RATES.QAR,
        AED: data.rates.AED || FALLBACK_RATES.AED,
        SAR: data.rates.SAR || FALLBACK_RATES.SAR,
        BHD: data.rates.BHD || FALLBACK_RATES.BHD,
        OMR: data.rates.OMR || FALLBACK_RATES.OMR,
      };
    }

    throw new Error('Invalid API response');
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    // Return fallback rates if API fails
    return FALLBACK_RATES;
  }
}

export async function GET() {
  try {
    const now = Date.now();

    // TEMPORARY: Force cache refresh to apply new fallback rates
    // Remove this block after rates are updated
    const forceRefresh = true;
    
    // Check if we have cached rates and they're still valid
    if (cachedRates && now < cachedRates.nextUpdate && !forceRefresh) {
      return NextResponse.json({
        rates: cachedRates.rates,
        lastUpdated: cachedRates.lastUpdated,
        nextUpdate: cachedRates.nextUpdate,
        cached: true,
      });
    }

    // Fetch new rates
    const rates = await fetchLiveRates();
    
    // Update cache
    cachedRates = {
      rates,
      lastUpdated: now,
      nextUpdate: now + CACHE_DURATION,
    };

    return NextResponse.json({
      rates: cachedRates.rates,
      lastUpdated: cachedRates.lastUpdated,
      nextUpdate: cachedRates.nextUpdate,
      cached: false,
    });
  } catch (error) {
    console.error('Error in exchange rates API:', error);
    
    // Return fallback rates if everything fails
    return NextResponse.json({
      rates: FALLBACK_RATES,
      lastUpdated: Date.now(),
      nextUpdate: Date.now() + CACHE_DURATION,
      cached: false,
      fallback: true,
    });
  }
}

// POST endpoint to manually refresh rates (admin only)
export async function POST(request: Request) {
  try {
    // Authentication check - admin only
    const { requireAdmin, unauthorizedResponse, forbiddenResponse } = await import('@/lib/auth-helpers');
    const authCheck = await requireAdmin(request);
    if ('error' in authCheck) {
      return authCheck.status === 401
        ? unauthorizedResponse(authCheck.error)
        : forbiddenResponse(authCheck.error);
    }

    const rates = await fetchLiveRates();
    const now = Date.now();

    cachedRates = {
      rates,
      lastUpdated: now,
      nextUpdate: now + CACHE_DURATION,
    };

    return NextResponse.json({
      success: true,
      rates: cachedRates.rates,
      lastUpdated: cachedRates.lastUpdated,
      nextUpdate: cachedRates.nextUpdate,
    });
  } catch (error) {
    console.error('Error refreshing exchange rates:', error);
    return NextResponse.json(
      { error: 'Failed to refresh exchange rates' },
      { status: 500 }
    );
  }
}
