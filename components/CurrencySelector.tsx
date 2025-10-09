'use client';

import React from 'react';
import { useCurrency } from '@/context/CurrencyContext';
import { DollarSign } from 'lucide-react';

export default function CurrencySelector() {
  const { currency, setCurrency, getAllCurrencies } = useCurrency();
  const currencies = getAllCurrencies();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        backgroundColor: 'white',
        padding: '0.5rem 0.75rem',
        borderRadius: '0.5rem',
        border: '2px solid #e2e8f0',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      }}
    >
      <DollarSign size={18} color="#64748b" />
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value as any)}
        style={{
          border: 'none',
          outline: 'none',
          backgroundColor: 'transparent',
          fontSize: '0.875rem',
          fontWeight: '600',
          color: '#1e293b',
          cursor: 'pointer',
          padding: '0.25rem',
        }}
      >
        {currencies.map((curr) => (
          <option key={curr.code} value={curr.code}>
            {curr.code} - {curr.name}
          </option>
        ))}
      </select>
    </div>
  );
}
