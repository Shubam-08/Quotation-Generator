'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import CartSidebar from '@/components/CartSidebar';
import CurrencySelector from '@/components/CurrencySelector';
import CurrencyInfo from '@/components/CurrencyInfo';
import { Search, Filter, X, ChevronDown, ChevronUp, Package, ShoppingCart, Menu, ArrowUpDown } from 'lucide-react';
import CartButton from '@/components/CartButton';

// Modern UI styles
const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#000000',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  mainContent: {
    flex: 1,
    padding: '2rem 3rem',
    maxWidth: '1600px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '2.5rem',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: '0.5rem',
    letterSpacing: '-0.025em',
  },
  subtitle: {
    fontSize: '1rem',
    color: '#9ca3af',
    fontWeight: '400',
  },
  filterCard: {
    backgroundColor: '#faf8f5',
    padding: '2rem',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    marginBottom: '2rem',
    border: '1px solid #e8e3db',
  },
  filterHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.75rem',
    paddingBottom: '1rem',
    borderBottom: '2px solid #f1f5f9',
  },
  filterTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1f2937',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  filterGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '1.25rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  label: {
    marginBottom: '0.5rem',
    fontWeight: '600',
    fontSize: '0.875rem',
    color: '#6b7280',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.025em',
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '2px solid #e8e3db',
    borderRadius: '0.5rem',
    fontSize: '0.9375rem',
    transition: 'all 0.2s',
    backgroundColor: '#ffffff',
    color: '#1f2937',
    outline: 'none',
  },
  select: {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '2px solid #e8e3db',
    borderRadius: '0.5rem',
    fontSize: '0.9375rem',
    transition: 'all 0.2s',
    backgroundColor: '#ffffff',
    color: '#1f2937',
    cursor: 'pointer',
    outline: 'none',
  },
  resetButton: {
    padding: '0.625rem 1.5rem',
    backgroundColor: '#64748b',
    color: 'white',
    borderRadius: '0.5rem',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9375rem',
    transition: 'all 0.2s',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  productCard: {
    backgroundColor: '#faf8f5',
    padding: '2rem',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    border: '1px solid #e8e3db',
  },
  productHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '2px solid #f1f5f9',
  },
  productTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1f2937',
  },
  productCount: {
    fontSize: '0.875rem',
    color: '#fbbf24',
    backgroundColor: 'rgba(251,191,36,0.1)',
    padding: '0.375rem 0.875rem',
    borderRadius: '9999px',
    fontWeight: '600',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  },
  tableHeader: {
    backgroundColor: '#f5f3ef',
    borderBottom: '2px solid #e8e3db',
  },
  th: {
    padding: '1rem 1.25rem',
    textAlign: 'left' as const,
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  thCenter: {
    padding: '1rem 1.25rem',
    textAlign: 'center' as const,
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  tr: {
    borderBottom: '1px solid #e8e3db',
    transition: 'background-color 0.15s',
  },
  td: {
    padding: '1.25rem 1.25rem',
    fontSize: '0.9375rem',
    color: '#374151',
  },
  tdCenter: {
    textAlign: 'center' as const,
    padding: '1.25rem 1.25rem',
  },
  productImage: {
    width: '70px',
    height: '70px',
    objectFit: 'cover' as const,
    borderRadius: '0.75rem',
    border: '2px solid #e2e8f0',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  addButton: {
    padding: '0.625rem 1.25rem',
    borderRadius: '0.5rem',
    backgroundColor: '#fbbf24',
    color: '#000000',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.875rem',
    transition: 'all 0.2s',
    boxShadow: '0 2px 4px rgba(251,191,36,0.2)',
    whiteSpace: 'nowrap' as const,
  },
  badge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: '0.375rem',
    fontSize: '0.8125rem',
    fontWeight: '600',
    backgroundColor: 'rgba(251,191,36,0.1)',
    color: '#fbbf24',
  },
  loadingSpinner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    color: '#9ca3af',
    fontSize: '1rem',
  },
  errorBox: {
    color: '#dc2626',
    backgroundColor: '#fef2f2',
    padding: '1rem 1.5rem',
    borderRadius: '0.75rem',
    border: '1px solid #fecaca',
    fontSize: '0.9375rem',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '3rem',
    color: '#9ca3af',
    fontSize: '1rem',
  },
};

type IpRatingPrice = {
  rating: string;
  price: number;
};

type Product = {
  _id: string;
  sku: string;
  name: string;
  category: string;
  application?: string;
  inputVoltage?: string;
  watt?: number;
  lumen?: string;
  beamAngle?: string;
  dimension?: string;
  cutOut?: string;
  price: number; // Legacy field
  ipRating?: string[]; // Legacy field
  ipRatings?: IpRatingPrice[]; // New structure with individual prices
  images?: string[];
};

type Filters = {
  search: string;
  sku: string;
  category: string;
  application: string;
  inputVoltage: string;
  watt: string;   // Will store range: "min-max"
  lumen: string;  // Will store range: "min-max"
  beamAngle: string;
  sortBy: string;
  order: 'asc' | 'desc';
};

// Define ranges for wattage and lumen
const wattRanges = [
  { label: '0-10 W', min: 0, max: 10 },
  { label: '10-20 W', min: 10, max: 20 },
  { label: '20-50 W', min: 20, max: 50 },
  { label: '50-100 W', min: 50, max: 100 },
  { label: '100+ W', min: 100, max: Infinity },
];

const lumenRanges = [
  { label: '0-500 Lm', min: 0, max: 500 },
  { label: '500-1000 Lm', min: 500, max: 1000 },
  { label: '1000-2000 Lm', min: 1000, max: 2000 },
  { label: '2000+ Lm', min: 2000, max: Infinity },
];

export default function ProductsPage() {
  const { addToCart, cart } = useCart();
  const { formatPrice } = useCurrency();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingProductId, setAddingProductId] = useState<string | null>(null);
  const [selectedIpRatings, setSelectedIpRatings] = useState<Record<string, string>>({});

  const [filters, setFilters] = useState<Filters>({
    search: '',
    sku: '',
    category: '',
    application: '',
    inputVoltage: '',
    watt: '',
    lumen: '',
    beamAngle: '',
    sortBy: 'sku',
    order: 'asc',
  });

  const [filterOptions, setFilterOptions] = useState({
    skus: [] as string[],
    categories: [] as string[],
    applications: [] as string[],
    inputVoltages: [] as string[],
    beamAngles: [] as string[],
  });

  // Fetch products with range support
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (!value) return;

        if (key === 'watt' || key === 'lumen') {
          // send min/max separately for API
          const [min, max] = value.split('-');
          params.append(`${key}Min`, min);
          params.append(`${key}Max`, max);
        } else {
          params.append(key, value);
        }
      });

      const res = await fetch(`/api/products?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch products');

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch filter options
  const fetchFilterOptions = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();

      if (!data.error) {
        const products = data as Product[];
        setFilterOptions({
          skus: [...new Set(products.map(p => p.sku).filter((v): v is string => Boolean(v)))].sort() as string[],
          categories: [...new Set(products.map(p => p.category).filter((v): v is string => Boolean(v)))].sort() as string[],
          applications: [...new Set(products.map(p => p.application).filter((v): v is string => Boolean(v)))].sort() as string[],
          inputVoltages: [...new Set(products.map(p => p.inputVoltage).filter((v): v is string => Boolean(v)))].sort() as string[],
          beamAngles: [...new Set(products.map(p => p.beamAngle).filter((v): v is string => Boolean(v)))].sort() as string[],
        });
      }
    } catch (err) {
      console.error('Failed to fetch filter options:', err);
    }
  };

  useEffect(() => { fetchFilterOptions(); }, []);
  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSortChange = (sortBy: string) => {
    setFilters(prev => ({
      ...prev,
      sortBy,
      order: prev.sortBy === sortBy && prev.order === 'asc' ? 'desc' : 'asc',
    }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      sku: '',
      category: '',
      application: '',
      inputVoltage: '',
      watt: '',
      lumen: '',
      beamAngle: '',
      sortBy: 'sku',
      order: 'asc',
    });
  };

  const selectStyle = { width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.875rem' };

  const [showFilters, setShowFilters] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const activeFilterCount = Object.values(filters).filter(v => v && v !== 'sku' && v !== 'asc').length;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#000000', position: 'relative' }}>
      {/* Cart Toggle Button - Visible on all screens */}
       <CartButton />

      <div style={{ 
        flex: 1, 
        padding: '1.5rem', 
        boxSizing: 'border-box', 
        maxWidth: '100%',
        width: '100%',
      }}>
        {/* Header Section */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {/*<Package size={32} color="#fbbf24" strokeWidth={2.5} />*/}
              <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: '700', color: '#ffffff', margin: 0, letterSpacing: '-0.025em' }}>Get Your Quotation</h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <CurrencySelector />
              <CurrencyInfo />
              {!loading && products.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(251,191,36,0.1)', padding: '0.625rem 1.25rem', borderRadius: '9999px', border: '2px solid rgba(251,191,36,0.3)' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#fbbf24' }}>{products.length} Products</span>
                </div>
              )}
            </div>
          </div>
          <p style={{ fontSize: '0.9375rem', color: '#9ca3af', margin: 0 }}>Browse and select products for your quotation</p>
        </div>

        {/* Filter Section */}
        <div style={{ backgroundColor: '#faf8f5', borderRadius: '0.75rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '1.5rem', border: '1px solid #e8e3db', overflow: 'hidden' }}>
          {/* Filter Header */}
          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '1.5rem 2rem', 
              borderBottom: showFilters ? '2px solid #e8e3db' : 'none',
              cursor: 'pointer',
              backgroundColor: '#f5f3ef',
              transition: 'background-color 0.2s'
            }}
            onClick={() => setShowFilters(!showFilters)}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ede9e3'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f5f3ef'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Filter size={20} color="#fbbf24" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', margin: 0 }}>Search & Filters</h2>
              {activeFilterCount > 0 && (
                <span style={{ backgroundColor: '#fbbf24', color: '#000000', fontSize: '0.75rem', fontWeight: '700', padding: '0.25rem 0.625rem', borderRadius: '9999px' }}>
                  {activeFilterCount}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {activeFilterCount > 0 && (
                <button 
                  onClick={(e) => { e.stopPropagation(); resetFilters(); }} 
                  style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem', 
                    backgroundColor: '#ef4444', 
                    color: 'white', 
                    borderRadius: '0.5rem', 
                    border: 'none', 
                    cursor: 'pointer', 
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    transition: 'all 0.2s',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                >
                  <X size={16} />
                  Clear All
                </button>
              )}
              {showFilters ? <ChevronUp size={20} color="#9ca3af" /> : <ChevronDown size={20} color="#9ca3af" />}
            </div>
          </div>

          {/* Filter Content */}
          {showFilters && (
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.25rem' }}>
                {/* Search */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ marginBottom: '0.625rem', fontWeight: '600', fontSize: '0.875rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
                    <Search size={14} style={{ display: 'inline', marginRight: '0.375rem', verticalAlign: 'middle' }} />
                    Search
                  </label>
                  <input 
                    type="text" 
                    placeholder="Search products..." 
                    value={filters.search} 
                    onChange={e => handleFilterChange('search', e.target.value)} 
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '2px solid #e8e3db',
                      borderRadius: '0.5rem',
                      fontSize: '0.9375rem',
                      transition: 'all 0.2s',
                      backgroundColor: '#ffffff',
                      color: '#1f2937',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#fbbf24'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#e8e3db'}
                  />
                </div>

                {/* SKU */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ marginBottom: '0.625rem', fontWeight: '600', fontSize: '0.875rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.025em' }}>Model Number</label>
                  <select 
                    value={filters.sku} 
                    onChange={e => handleFilterChange('sku', e.target.value)} 
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '2px solid #e8e3db',
                      borderRadius: '0.5rem',
                      fontSize: '0.9375rem',
                      transition: 'all 0.2s',
                      backgroundColor: '#ffffff',
                      color: '#1f2937',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#fbbf24'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#e8e3db'}
                  >
                    <option value="">All Models</option>
                    {filterOptions.skus.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>

                {/* Other filters */}
                {([
                  ['category', 'Category', filterOptions.categories],
                  ['application', 'Application', filterOptions.applications],
                  ['inputVoltage', 'Input Voltage', filterOptions.inputVoltages],
                  ['beamAngle', 'Beam Angle', filterOptions.beamAngles],
                ] as const).map(([key, label, options]) => (
                  <div key={key} style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ marginBottom: '0.625rem', fontWeight: '600', fontSize: '0.875rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.025em' }}>{label as string}</label>
                    <select 
                      value={filters[key]} 
                      onChange={e => handleFilterChange(key, e.target.value)} 
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: '2px solid #e8e3db',
                        borderRadius: '0.5rem',
                        fontSize: '0.9375rem',
                        transition: 'all 0.2s',
                        backgroundColor: '#ffffff',
                        color: '#1f2937',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#fbbf24'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#e8e3db'}
                    >
                      <option value="">All {label as string}s</option>
                      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                ))}

                {/* Wattage Range */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ marginBottom: '0.625rem', fontWeight: '600', fontSize: '0.875rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.025em' }}>Wattage</label>
                  <select 
                    value={filters.watt} 
                    onChange={e => handleFilterChange('watt', e.target.value)} 
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '2px solid #e8e3db',
                      borderRadius: '0.5rem',
                      fontSize: '0.9375rem',
                      transition: 'all 0.2s',
                      backgroundColor: '#ffffff',
                      color: '#1f2937',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#fbbf24'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#e8e3db'}
                  >
                    <option value="">All Wattages</option>
                    {wattRanges.map(r => <option key={r.label} value={`${r.min}-${r.max}`}>{r.label}</option>)}
                  </select>
                </div>

                {/* Lumen Range */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ marginBottom: '0.625rem', fontWeight: '600', fontSize: '0.875rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.025em' }}>Lumen Output</label>
                  <select 
                    value={filters.lumen} 
                    onChange={e => handleFilterChange('lumen', e.target.value)} 
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '2px solid #e8e3db',
                      borderRadius: '0.5rem',
                      fontSize: '0.9375rem',
                      transition: 'all 0.2s',
                      backgroundColor: '#ffffff',
                      color: '#1f2937',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#fbbf24'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#e8e3db'}
                  >
                    <option value="">All Lumens</option>
                    {lumenRanges.map(r => <option key={r.label} value={`${r.min}-${r.max}`}>{r.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Product Table Section */}
        <div style={{ backgroundColor: '#faf8f5', borderRadius: '0.75rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: '1px solid #e8e3db', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '2px solid #e8e3db', backgroundColor: '#f5f3ef', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <h2 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.5rem)', fontWeight: '600', color: '#1f2937', margin: 0 }}>Products</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#9ca3af' }}>
              <ArrowUpDown size={16} />
              <span>Click column headers to sort</span>
            </div>
          </div>

          <div style={{ padding: '1.5rem' }}>
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', color: '#9ca3af', fontSize: '1rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderTopColor: '#fbbf24', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
                  <p>Loading products...</p>
                </div>
              </div>
            )}
            
            {error && (
              <div style={{ color: '#dc2626', backgroundColor: '#fef2f2', padding: '1.25rem 1.5rem', borderRadius: '0.75rem', border: '1px solid #fecaca', fontSize: '0.9375rem' }}>
                <strong>Error:</strong> {error}
              </div>
            )}
            
            {!loading && !error && products.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
                <Package size={48} color="#6b7280" style={{ margin: '0 auto 1rem' }} />
                <p style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1f2937' }}>No products found</p>
                <p style={{ fontSize: '0.9375rem' }}>Try adjusting your filters to see more results</p>
              </div>
            )}

            {!loading && !error && products.length > 0 && (
              <div style={{ overflowX: 'auto', borderRadius: '0.75rem', border: '1px solid #e8e3db', WebkitOverflowScrolling: 'touch' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
                  <thead style={{ backgroundColor: '#f5f3ef', borderBottom: '2px solid #e8e3db' }}>
                    <tr>
                      <th style={{ padding: '1rem 1.25rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Image</th>
                      {[
                        { label: 'Model Number', key: 'sku' },
                        { label: 'Category', key: 'category' },
                        { label: 'Application', key: 'application' },
                        { label: 'Input Voltage', key: 'inputVoltage' },
                        { label: 'Watt', key: 'watt' },
                        { label: 'Lumen', key: 'lumen' },
                        { label: 'Beam Angle', key: 'beamAngle' },
                        { label: 'IP Rating', key: 'ipRating' },
                        { label: 'Price', key: 'price' },
                        { label: 'Action', key: 'action' }
                      ].map(col => (
                        <th 
                          key={col.key} 
                          style={{ 
                            padding: '1rem 1.25rem', 
                            textAlign: 'left', 
                            fontSize: '0.75rem', 
                            fontWeight: '700', 
                            color: '#6b7280', 
                            textTransform: 'uppercase', 
                            letterSpacing: '0.05em',
                            cursor: col.key !== 'action' ? 'pointer' : 'default',
                            transition: 'background-color 0.2s'
                          }} 
                          onClick={() => col.key !== 'action' && handleSortChange(col.key)}
                          onMouseEnter={(e) => col.key !== 'action' && (e.currentTarget.style.backgroundColor = '#ede9e3')}
                          onMouseLeave={(e) => col.key !== 'action' && (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p, idx) => (
                      <tr 
                        key={p._id} 
                        style={{ 
                          borderBottom: '1px solid #e8e3db', 
                          transition: 'background-color 0.15s',
                          backgroundColor: '#ffffff'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f7f4'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                      >
                        <td style={{ textAlign: 'center', padding: '1rem 1.25rem' }}>
                          {p.images?.length ? (
                            <img 
                              src={p.images[0]} 
                              alt={p.sku} 
                              style={{ 
                                width: '70px', 
                                height: '70px', 
                                objectFit: 'cover', 
                                borderRadius: '0.75rem', 
                                border: '2px solid #e2e8f0',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                              }} 
                            />
                          ) : (
                            <div style={{ 
                              width: '70px', 
                              height: '70px', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              backgroundColor: '#1f2937', 
                              borderRadius: '0.75rem',
                              margin: '0 auto'
                            }}>
                              <Package size={28} color="#9ca3af" />
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '1rem 1.25rem', fontSize: '0.9375rem', color: '#1f2937', fontWeight: '600' }}>{p.sku}</td>
                        <td style={{ padding: '1rem 1.25rem', fontSize: '0.9375rem', color: '#374151' }}>
                          <span style={{ backgroundColor: 'rgba(251,191,36,0.1)', color: '#fbbf24', padding: '0.25rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.8125rem', fontWeight: '600', border: '1px solid rgba(251,191,36,0.2)' }}>
                            {p.category}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.25rem', fontSize: '0.9375rem', color: '#374151' }}>{p.application || '-'}</td>
                        <td style={{ padding: '1rem 1.25rem', fontSize: '0.9375rem', color: '#374151' }}>{p.inputVoltage || '-'}</td>
                        <td style={{ padding: '1rem 1.25rem', fontSize: '0.9375rem', color: '#374151', fontWeight: '600' }}>{p.watt ? `${p.watt}W` : '-'}</td>
                        <td style={{ padding: '1rem 1.25rem', fontSize: '0.9375rem', color: '#374151' }}>{p.lumen || '-'}</td>
                        <td style={{ padding: '1rem 1.25rem', fontSize: '0.9375rem', color: '#374151' }}>{p.beamAngle || '-'}</td>
                        <td style={{ padding: '1rem 1.25rem', fontSize: '0.9375rem', color: '#374151' }}>
                          {p.ipRatings && p.ipRatings.length > 0 ? (
                            p.ipRatings.length === 1 ? (
                              <span style={{ backgroundColor: 'rgba(251,191,36,0.1)', color: '#fbbf24', padding: '0.25rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.8125rem', fontWeight: '600', border: '1px solid rgba(251,191,36,0.2)' }}>
                                {p.ipRatings[0].rating}
                              </span>
                            ) : (
                              <select
                                value={selectedIpRatings[p._id] || p.ipRatings[0].rating}
                                onChange={(e) => setSelectedIpRatings(prev => ({ ...prev, [p._id]: e.target.value }))}
                                style={{ 
                                  backgroundColor: 'rgba(251,191,36,0.1)', 
                                  color: '#fbbf24', 
                                  padding: '0.25rem 0.5rem', 
                                  borderRadius: '0.375rem', 
                                  fontSize: '0.8125rem', 
                                  fontWeight: '600', 
                                  border: '1px solid rgba(251,191,36,0.2)',
                                  cursor: 'pointer',
                                  outline: 'none'
                                }}
                              >
                                {p.ipRatings.map((ip) => (
                                  <option key={ip.rating} value={ip.rating}>{ip.rating}</option>
                                ))}
                              </select>
                            )
                          ) : p.ipRating && p.ipRating.length > 0 ? (
                            p.ipRating.length === 1 ? (
                              <span style={{ backgroundColor: 'rgba(251,191,36,0.1)', color: '#fbbf24', padding: '0.25rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.8125rem', fontWeight: '600', border: '1px solid rgba(251,191,36,0.2)' }}>
                                {p.ipRating[0]}
                              </span>
                            ) : (
                              <select
                                value={selectedIpRatings[p._id] || p.ipRating[0]}
                                onChange={(e) => setSelectedIpRatings(prev => ({ ...prev, [p._id]: e.target.value }))}
                                style={{ 
                                  backgroundColor: 'rgba(251,191,36,0.1)', 
                                  color: '#fbbf24', 
                                  padding: '0.25rem 0.5rem', 
                                  borderRadius: '0.375rem', 
                                  fontSize: '0.8125rem', 
                                  fontWeight: '600', 
                                  border: '1px solid rgba(251,191,36,0.2)',
                                  cursor: 'pointer',
                                  outline: 'none'
                                }}
                              >
                                {p.ipRating.map((rating) => (
                                  <option key={rating} value={rating}>{rating}</option>
                                ))}
                              </select>
                            )
                          ) : (
                            <span style={{ color: '#9ca3af' }}>N/A</span>
                          )}
                        </td>
                        <td style={{ padding: '1rem 1.25rem', fontSize: '0.9375rem', color: '#fbbf24', fontWeight: '700' }}>
                          {(() => {
                            // Get the price based on selected IP rating
                            if (p.ipRatings && p.ipRatings.length > 0) {
                              const selectedRating = selectedIpRatings[p._id] || p.ipRatings[0].rating;
                              const ipData = p.ipRatings.find(ip => ip.rating === selectedRating);
                              return formatPrice(ipData?.price || 0);
                            }
                            return formatPrice(p.price);
                          })()}
                        </td>
                        <td style={{ padding: '0.25rem 0.5rem', width: '1px', whiteSpace: 'nowrap' }}>
  {(() => {
    // Get the current selected IP rating and price for this product
    let currentIpRating: string | undefined;
    let currentPrice: number;
    
    if (p.ipRatings && p.ipRatings.length > 0) {
      // New format with individual prices
      const selectedRating = selectedIpRatings[p._id] || p.ipRatings[0].rating;
      const ipData = p.ipRatings.find(ip => ip.rating === selectedRating);
      currentIpRating = selectedRating;
      currentPrice = ipData?.price || 0;
    } else if (p.ipRating && p.ipRating.length > 0) {
      // Legacy format
      currentIpRating = p.ipRating.length > 1 ? (selectedIpRatings[p._id] || p.ipRating[0]) : p.ipRating[0];
      currentPrice = p.price;
    } else {
      // No IP rating
      currentIpRating = undefined;
      currentPrice = p.price;
    }
    
    // Create the cart item ID for this combination
    const cartItemId = `${p._id}_${currentIpRating || 'default'}`;
    
    // Check if this specific product + IP rating combination is already in cart
    const isInCart = cart.some(item => item.cartItemId === cartItemId);
    
    return (
      <button 
        style={{ 
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          padding: '0.25rem 0.5rem', 
          borderRadius: '0.125rem', 
          backgroundColor: isInCart ? '#6b7280' : '#fbbf24', 
          color: '#000000', 
          border: 'none', 
          cursor: isInCart ? 'not-allowed' : 'pointer',
          fontWeight: '500',
          fontSize: '0.70rem',
          transition: 'all 0.2s',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          whiteSpace: 'nowrap',
          opacity: addingProductId === p._id ? 0.7 : 1,
          transform: addingProductId === p._id ? 'scale(0.95)' : 'scale(1)',
        }} 
        onClick={() => {
          if (!isInCart) {
            setAddingProductId(p._id);
            // Create product with selected IP rating and correct price
            const productToAdd = {
              ...p,
              ipRating: currentIpRating,
              price: currentPrice
            };
            addToCart(productToAdd);
            setTimeout(() => setAddingProductId(null), 300);
          }
        }}
        onMouseEnter={(e) => {
          if (!isInCart) {
            e.currentTarget.style.backgroundColor = '#eab308';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.08)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isInCart) {
            e.currentTarget.style.backgroundColor = '#fbbf24';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
          }
        }}
        disabled={isInCart}
      >
        <ShoppingCart size={12} />
        {isInCart ? 'Added' : 'Add to List'}
      </button>
    );
  })()}

</td>


                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add keyframe animation and responsive styles */}
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @media (min-width: 1024px) {
          .cart-toggle-btn {
            display: none !important;
          }
        }
        
        @media (max-width: 1023px) {
          .main-content {
            margin-right: 0 !important;
            padding: 1rem !important;
          }
        }
        
        @media (max-width: 768px) {
          .filter-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
