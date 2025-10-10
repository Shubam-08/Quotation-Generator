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
const FALLBACK_RATES = {
  USD: 0.01126,
  GBP: 0.00893,
  EUR: 0.01032,
  QAR: 0.04101,
  AED: 0.04136,
  SAR: 0.04224,
  BHD: 0.00424,
  OMR: 0.00433,
  INR: 1,
};

// Free exchange rate API (no API key required)
// Alternative: Use exchangerate-api.com with API key for better reliability
const EXCHANGE_API_URL = 'https://open.er-api.com/v6/latest/INR';

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
        USD: data.rates.USD || FALLBACK_RATES.USD,
        GBP: data.rates.GBP || FALLBACK_RATES.GBP,
        EUR: data.rates.EUR || FALLBACK_RATES.EUR,
        QAR: data.rates.QAR || FALLBACK_RATES.QAR,
        AED: data.rates.AED || FALLBACK_RATES.AED,
        SAR: data.rates.SAR || FALLBACK_RATES.SAR,
        BHD: data.rates.BHD || FALLBACK_RATES.BHD,
        OMR: data.rates.OMR || FALLBACK_RATES.OMR,
        INR: 1,
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

    // Check if we have cached rates and they're still valid
    if (cachedRates && now < cachedRates.nextUpdate) {
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
