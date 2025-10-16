import axios from "axios";

// Cache variables
let cachedRate: number | null = null;
let lastFetched: number | null = null;

// Configuration
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

// Convert USD to INR
export async function convertUsdToInr(usdAmount: number): Promise<number> {
  if (!cachedRate || !lastFetched || Date.now() - lastFetched > CACHE_DURATION_MS) {
    await fetchUsdToInrRate();
  }
  const rate = cachedRate || FALLBACK_RATE;
  return usdAmount * rate;
}
