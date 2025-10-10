'use client';

import React from 'react';
import { useCurrency } from '@/context/CurrencyContext';
import { RefreshCw, Clock } from 'lucide-react';

export default function CurrencyInfo() {
  const { lastUpdated, refreshRates } = useCurrency();
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [relativeUpdated, setRelativeUpdated] = React.useState<string>(lastUpdated ? '...' : 'Never');

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshRates();
    } finally {
      setIsRefreshing(false);
    }
  };

  React.useEffect(() => {
    if (!lastUpdated) {
      setRelativeUpdated('Never');
      return;
    }
    const date = new Date(lastUpdated);
    const update = () => {
      const now = Date.now();
      const diffMs = now - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays > 0) {
        setRelativeUpdated(`${diffDays} day${diffDays > 1 ? 's' : ''} ago`);
      } else if (diffHours > 0) {
        setRelativeUpdated(`${diffHours} hour${diffHours > 1 ? 's' : ''} ago`);
      } else {
        setRelativeUpdated('Just now');
      }
    };
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, [lastUpdated]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        fontSize: '0.75rem',
        color: '#64748b',
        backgroundColor: '#f8fafc',
        padding: '0.5rem 0.75rem',
        borderRadius: '0.375rem',
        border: '1px solid #e2e8f0',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
        <Clock size={14} />
        <span>Rates updated: {relativeUpdated}</span>
      </div>
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          padding: '0.25rem 0.5rem',
          backgroundColor: isRefreshing ? '#e2e8f0' : '#eff6ff',
          color: isRefreshing ? '#94a3b8' : '#3b82f6',
          border: 'none',
          borderRadius: '0.25rem',
          cursor: isRefreshing ? 'not-allowed' : 'pointer',
          fontSize: '0.75rem',
          fontWeight: '600',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          if (!isRefreshing) {
            e.currentTarget.style.backgroundColor = '#dbeafe';
          }
        }}
        onMouseLeave={(e) => {
          if (!isRefreshing) {
            e.currentTarget.style.backgroundColor = '#eff6ff';
          }
        }}
      >
        <RefreshCw
          size={12}
          style={{
            animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
          }}
        />
        {isRefreshing ? 'Updating...' : 'Refresh'}
      </button>
      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
