'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Currency = 'USD' | 'GBP' | 'EUR' | 'QAR' | 'AED' | 'SAR' | 'BHD' | 'OMR' | 'INR';

export interface CurrencyInfo {
  code: Currency;
  symbol: string;
  name: string;
  rate: number; // Exchange rate relative to INR (base currency)
}

// Fallback exchange rates (used if API fails or during initial load)
const FALLBACK_RATES: Record<Currency, number> = {
  INR: 1,
  USD: 0.01126,
  GBP: 0.00893,
  EUR: 0.01032,
  QAR: 0.04101,
  AED: 0.04136,
  SAR: 0.04224,
  BHD: 0.00424,
  OMR: 0.00433,
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
  convertPrice: (priceInINR: number) => number;
  formatPrice: (priceInINR: number) => string;
  getAllCurrencies: () => CurrencyInfo[];
  lastUpdated: number | null;
  refreshRates: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {
  const [currency, setCurrencyState] = useState<Currency>('INR');
  const [exchangeRates, setExchangeRates] = useState<Record<Currency, number>>(FALLBACK_RATES);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  // Fetch exchange rates from API
  const fetchExchangeRates = async () => {
    try {
      const response = await fetch('/api/exchange-rates');
      if (!response.ok) throw new Error('Failed to fetch rates');
      
      const data = await response.json();
      setExchangeRates({ ...data.rates, INR: 1 });
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
        setExchangeRates({ ...JSON.parse(storedRates), INR: 1 });
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
      setExchangeRates({ ...JSON.parse(storedRates), INR: 1 });
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

  const convertPrice = (priceInINR: number): number => {
    return priceInINR * exchangeRates[currency];
  };

  const formatPrice = (priceInINR: number): string => {
    const convertedPrice = convertPrice(priceInINR);
    const formatted = convertedPrice.toLocaleString('en-US', {
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
