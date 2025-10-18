import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

/**
 * API Route: Convert INR to USD
 * 
 * This endpoint converts Indian Rupees (INR) to US Dollars (USD)
 * using the SAME exchange rate source as USD to INR conversion.
 * 
 * This ensures perfect consistency when round-tripping conversions:
 * USD -> INR (when saving) and INR -> USD (when editing)
 * 
 * Both conversions use: https://api.exchangerate-api.com/v4/latest/USD
 */

// Cache variables (shared with USD to INR)
let cachedRate: number | null = null;
let lastFetched: number | null = null;
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour
const FALLBACK_RATE = 88.65; // fallback USD → INR rate

// Fetch latest USD → INR rate
async function fetchUsdToInrRate(): Promise<number> {
  try {
    const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
    const rate = response.data.rates.INR;
    cachedRate = rate;
    lastFetched = Date.now();
    return rate;
  } catch (err) {
    console.error("Error fetching USD → INR rate:", err);
    // Use cached rate or fallback
    if (cachedRate) return cachedRate;
    return FALLBACK_RATE;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { inrAmount } = await request.json();

    if (!inrAmount || isNaN(inrAmount) || inrAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid INR amount' },
        { status: 400 }
      );
    }

    // Fetch the current USD to INR rate (same source as USD to INR conversion)
    if (!cachedRate || !lastFetched || Date.now() - lastFetched > CACHE_DURATION_MS) {
      await fetchUsdToInrRate();
    }
    
    const usdToInrRate = cachedRate || FALLBACK_RATE;
    
    // Convert INR to USD by dividing by the USD to INR rate
    const usdAmount = inrAmount / usdToInrRate;

    return NextResponse.json({
      inrAmount,
      usdAmount,
      usdToInrRate: usdToInrRate,
      inrToUsdRate: 1 / usdToInrRate,
      lastUpdated: lastFetched,
    });
  } catch (error) {
    console.error('Error converting INR to USD:', error);
    
    // Fallback to hardcoded rate if API fails
    const { inrAmount } = await request.json();
    const usdAmount = inrAmount / FALLBACK_RATE;
    
    return NextResponse.json({
      inrAmount,
      usdAmount,
      usdToInrRate: FALLBACK_RATE,
      inrToUsdRate: 1 / FALLBACK_RATE,
      lastUpdated: null,
      fallback: true,
    });
  }
}
