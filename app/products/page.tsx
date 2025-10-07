'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useCart } from '@/context/CartContext';
import CartSidebar from '@/components/CartSidebar';

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
  price: number;
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
  const { addToCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setFilterOptions({
          skus: [...new Set(data.map((p: Product) => p.sku).filter(Boolean))].sort(),
          categories: [...new Set(data.map((p: Product) => p.category).filter(Boolean))].sort(),
          applications: [...new Set(data.map((p: Product) => p.application).filter(Boolean))].sort(),
          inputVoltages: [...new Set(data.map((p: Product) => p.inputVoltage).filter(Boolean))].sort(),
          beamAngles: [...new Set(data.map((p: Product) => p.beamAngle).filter(Boolean))].sort(),
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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <CartSidebar />

      <div style={{ flex: 1, marginRight: '400px', padding: '1rem', boxSizing: 'border-box' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '2rem' }}>Product Quotations</h1>

        {/* FILTERS */}
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>Search & Filters</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {/* Search */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ marginBottom: '0.5rem', fontWeight: '500' }}>Search</label>
              <input type="text" placeholder="Search by name..." value={filters.search} onChange={e => handleFilterChange('search', e.target.value)} style={selectStyle} />
            </div>

            {/* SKU */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ marginBottom: '0.5rem', fontWeight: '500' }}>Model Number</label>
              <select value={filters.sku} onChange={e => handleFilterChange('sku', e.target.value)} style={selectStyle}>
                <option value="">All Model Numbers</option>
                {filterOptions.skus.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            {/* Other filters except watt/lumen */}
            {[
              ['category', 'Category', filterOptions.categories],
              ['application', 'Application', filterOptions.applications],
              ['inputVoltage', 'Input Voltage', filterOptions.inputVoltages],
              ['beamAngle', 'Beam Angle', filterOptions.beamAngles],
            ].map(([key, label, options]) => (
              <div key={key as string} style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ marginBottom: '0.5rem', fontWeight: '500' }}>{label}</label>
                <select value={(filters as any)[key]} onChange={e => handleFilterChange(key as keyof Filters, e.target.value)} style={selectStyle}>
                  <option value="">All {label}s</option>
                  {(options as string[]).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            ))}

            {/* Wattage Range */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ marginBottom: '0.5rem', fontWeight: '500' }}>Wattage</label>
              <select value={filters.watt} onChange={e => handleFilterChange('watt', e.target.value)} style={selectStyle}>
                <option value="">All Wattages</option>
                {wattRanges.map(r => <option key={r.label} value={`${r.min}-${r.max}`}>{r.label}</option>)}
              </select>
            </div>

            {/* Lumen Range */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ marginBottom: '0.5rem', fontWeight: '500' }}>Lumen Output</label>
              <select value={filters.lumen} onChange={e => handleFilterChange('lumen', e.target.value)} style={selectStyle}>
                <option value="">All Lumens</option>
                {lumenRanges.map(r => <option key={r.label} value={`${r.min}-${r.max}`}>{r.label}</option>)}
              </select>
            </div>

          </div>

          <button onClick={resetFilters} style={{ padding: '0.5rem 1.5rem', backgroundColor: '#4b5563', color: 'white', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', fontWeight: '500' }}>
            Reset Filters
          </button>
        </div>

        {/* PRODUCT TABLE */}
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>Products {!loading && `(${products.length})`}</h2>

          {loading && <p style={{ color: '#6b7280' }}>Loading products...</p>}
          {error && <div style={{ color: '#991b1b', backgroundColor: '#fee2e2', padding: '1rem', borderRadius: '0.375rem' }}>Error: {error}</div>}
          {!loading && !error && products.length === 0 && <p>No products found.</p>}

          {!loading && !error && products.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f3f4f6' }}>
                  <tr>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Image</th>
                    {['Model Number','category','application','input','watt','lumen','beamAngle','action'].map(col => (
                      <th key={col} style={{ padding: '0.75rem 1rem', textAlign: 'left', textTransform: 'uppercase' }} onClick={() => col !== 'action' && handleSortChange(col)}>
                        {col.toUpperCase()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, idx) => (
                    <tr key={p._id} style={{ borderTop: '1px solid #e5e7eb', backgroundColor: idx % 2 === 0 ? 'white' : '#f9fafb' }}>
                      <td style={{ textAlign: 'center', padding: '0.75rem 1rem' }}>
                        {p.images?.length ? <img src={p.images[0]} alt={p.sku} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' }} /> : <span style={{ color:'#9ca3af' }}>No Image</span>}
                      </td>
                      <td>{p.sku}</td>
                      <td>{p.category}</td>
                      <td>{p.application||'-'}</td>
                      <td>{p.inputVoltage||'-'}</td>
                      <td>{p.watt ? `${p.watt}W`:'-'}</td>
                      <td>{p.lumen||'-'}</td>
                      <td>{p.beamAngle||'-'}</td>
                      <td>
                        <button style={{ padding:'0.5rem', borderRadius:'0.375rem', backgroundColor:'#16a34a', color:'white', border:'none', cursor:'pointer' }} onClick={()=>addToCart(p)}>Add to Cart</button>
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
  );
}
