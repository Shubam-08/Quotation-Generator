'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Currency = 'USD' | 'GBP' | 'EUR' | 'QAR' | 'AED' | 'SAR' | 'BHD' | 'OMR' | 'INR';

export interface CurrencyInfo {
  code: Currency;
  symbol: string;
  name: string;
  rate: number; // Exchange rate relative to USD (base currency)
}

// Fallback exchange rates (used if API fails or during initial load)
// Rate calculation: Exchange rate relative to USD (base currency)
// Example: 1 USD = 88.65 INR, 1 USD = 0.79 GBP, etc.
const FALLBACK_RATES: Record<Currency, number> = {
  USD: 1,        // Base currency
  INR: 88.65,    // 1 USD = 88.65 INR
  GBP: 0.79,     // 1 USD = 0.79 GBP
  EUR: 0.92,     // 1 USD = 0.92 EUR
  QAR: 3.64,     // 1 USD = 3.64 QAR
  AED: 3.67,     // 1 USD = 3.67 AED
  SAR: 3.75,     // 1 USD = 3.75 SAR
  BHD: 0.376,    // 1 USD = 0.376 BHD
  OMR: 0.385,    // 1 USD = 0.385 OMR
};

// Currency metadata (symbols and names)
const CURRENCY_METADATA: Record<Currency, { symbol: string; name: string }> = {
  INR: { symbol: '₹', name: 'Indian Rupee' },
  USD: { symbol: '$', name: 'US Dollar' },
  GBP: { symbol: '£', name: 'British Pound' },
  EUR: { symbol: '€', name: 'Euro' },
  QAR: { symbol: 'QAR', name: 'Qatari Riyal' },
  AED: { symbol: 'AED', name: 'UAE Dirham' },
  SAR: { symbol: 'SAR', name: 'Saudi Riyal' },
  BHD: { symbol: 'BD', name: 'Bahraini Dinar' },
  OMR: { symbol: 'OMR', name: 'Omani Rial' },
};

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  currencyInfo: CurrencyInfo;
  convertPrice: (priceInUSD: number) => number;
  formatPrice: (priceInUSD: number) => string;
  getAllCurrencies: () => CurrencyInfo[];
  lastUpdated: number | null;
  refreshRates: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {
  const [currency, setCurrencyState] = useState<Currency>('USD');
  const [exchangeRates, setExchangeRates] = useState<Record<Currency, number>>(FALLBACK_RATES);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  // Fetch exchange rates from API
  const fetchExchangeRates = async () => {
    try {
      const response = await fetch('/api/exchange-rates');
      if (!response.ok) throw new Error('Failed to fetch rates');
      
      const data = await response.json();
      setExchangeRates({ ...data.rates, USD: 1 });
      setLastUpdated(data.lastUpdated);
      
      // Store rates in localStorage for offline use
      localStorage.setItem('exchangeRates', JSON.stringify(data.rates));
      localStorage.setItem('ratesLastUpdated', data.lastUpdated.toString());
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      // Try to load from localStorage if API fails
      const storedRates = localStorage.getItem('exchangeRates');
      const storedLastUpdated = localStorage.getItem('ratesLastUpdated');
      
      if (storedRates) {
        setExchangeRates({ ...JSON.parse(storedRates), USD: 1 });
        setLastUpdated(storedLastUpdated ? parseInt(storedLastUpdated) : null);
      }
    }
  };

  // Load currency from localStorage and fetch rates on mount
  useEffect(() => {
    const savedCurrency = localStorage.getItem('selectedCurrency');
    if (savedCurrency && FALLBACK_RATES[savedCurrency as Currency] !== undefined) {
      setCurrencyState(savedCurrency as Currency);
    }

    // Try to load cached rates first for instant display
    const storedRates = localStorage.getItem('exchangeRates');
    const storedLastUpdated = localStorage.getItem('ratesLastUpdated');
    
    if (storedRates) {
      setExchangeRates({ ...JSON.parse(storedRates), USD: 1 });
      setLastUpdated(storedLastUpdated ? parseInt(storedLastUpdated) : null);
    }

    // Then fetch fresh rates in the background
    fetchExchangeRates();
  }, []);

  // Save currency to localStorage whenever it changes
  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('selectedCurrency', newCurrency);
  };

  // Manual refresh function
  const refreshRates = async () => {
    await fetchExchangeRates();
  };

  const currencyInfo: CurrencyInfo = {
    code: currency,
    symbol: CURRENCY_METADATA[currency].symbol,
    name: CURRENCY_METADATA[currency].name,
    rate: exchangeRates[currency],
  };

  const convertPrice = (priceInUSD: number): number => {
    return priceInUSD * exchangeRates[currency];
  };

  const formatPrice = (priceInUSD: number): string => {
    // For USD, use the exact price without conversion to avoid floating-point precision issues
    const convertedPrice = currency === 'USD' ? priceInUSD : convertPrice(priceInUSD);
    
    // Round to 2 decimal places to fix floating-point precision issues
    const roundedPrice = Math.round(convertedPrice * 100) / 100;
    
    const formatted = roundedPrice.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${currencyInfo.symbol} ${formatted}`;
  };

  const getAllCurrencies = (): CurrencyInfo[] => {
    return Object.keys(CURRENCY_METADATA).map((code) => ({
      code: code as Currency,
      symbol: CURRENCY_METADATA[code as Currency].symbol,
      name: CURRENCY_METADATA[code as Currency].name,
      rate: exchangeRates[code as Currency],
    }));
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        currencyInfo,
        convertPrice,
        formatPrice,
        getAllCurrencies,
        lastUpdated,
        refreshRates,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
