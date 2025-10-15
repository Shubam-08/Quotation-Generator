'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import CurrencySelector from '@/components/CurrencySelector';
import CurrencyInfo from '@/components/CurrencyInfo';
import { Search, Filter, X, ChevronDown, ChevronUp, Package, ShoppingCart, Sparkles, Sun, Moon, FileText, Download, File, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import CartButton from '@/components/CartButton';
import { getApplicationFromIpRating } from '@/lib/ipRatingUtils';

type IpRatingPrice = {
  rating: string;
  price: number;
};

type Product = {
  _id: string;
  sku: string;
  name: string;
  category: string;
  categoryFilter?: string;
  application?: string;
  inputVoltage?: string;
  watt?: number;
  lumen?: string;
  beamAngle?: string;
  dimension?: string;
  cutOut?: string;
  price: number;
  ipRating?: string[];
  ipRatings?: IpRatingPrice[];
  images?: string[];
  productImages?: string[];
  datasheets?: string[];
  iesFiles?: string[];
  certifications?: string[];
};

type Filters = {
  search: string;
  sku: string;
  category: string;
  application: string;
  inputVoltage: string;
  watt: string;
  lumen: string;
  beamAngle: string;
  sortBy: string;
  order: 'asc' | 'desc';
};

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
  const [showFilters, setShowFilters] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(20);

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

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (!value) return;

        if (key === 'watt' || key === 'lumen') {
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

  const fetchFilterOptions = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();

      if (!data.error) {
        const products = data as Product[];
        
        // Use categoryFilter if available, otherwise fallback to extracting from category
        const categoryFilters = products
          .map(p => {
            if (p.categoryFilter) return p.categoryFilter;
            // Fallback: extract last two words from category
            const words = p.category.trim().split(/\s+/);
            return words.length === 1 ? words[0] : words.slice(-2).join(' ');
          })
          .filter((v): v is string => Boolean(v));
        
        setFilterOptions({
          skus: [...new Set(products.map(p => p.sku).filter((v): v is string => Boolean(v)))].sort() as string[],
          categories: [...new Set(categoryFilters)].sort() as string[],
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
    setCurrentPage(1); // Reset to first page when filters are cleared
  };

  const activeFilterCount = Object.values(filters).filter(v => v && v !== 'sku' && v !== 'asc').length;

  // Pagination calculations
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = products.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-black' : 'bg-gray-50'}`}>
      <CartButton />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className={`text-3xl md:text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Product Quotation</h1>
                <div className="inline-flex items-center gap-2 bg-yellow-400/10 backdrop-blur-sm border border-yellow-400/20 text-yellow-400 px-3 py-1 rounded-full text-xs font-semibold">
                  <Sparkles className="w-3 h-3" />
                  <span>Build Your Quote</span>
                </div>
              </div>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Browse and select products for your quotation</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Theme Toggle Button */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  isDarkMode 
                    ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20' 
                    : 'bg-gray-800 hover:bg-gray-900 text-white border border-gray-700'
                }`}
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? (
                  <>
                    <Sun className="w-4 h-4" />
                    <span>Light</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4" />
                    <span>Dark</span>
                  </>
                )}
              </button>
              <CurrencySelector />
              <CurrencyInfo />
              {!loading && products.length > 0 && (
                <div className="bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 px-4 py-2 rounded-lg font-semibold text-sm">
                  {products.length} Products
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={`rounded-xl mb-6 overflow-hidden transition-colors ${
          isDarkMode 
            ? 'bg-gray-900/50 border border-white/10' 
            : 'bg-white border border-gray-200 shadow-sm'
        }`}>
          <div 
            className={`flex items-center justify-between p-6 cursor-pointer transition-colors ${
              isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'
            }`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-yellow-400" />
              <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Filters</h2>
              {activeFilterCount > 0 && (
                <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {activeFilterCount > 0 && (
                <button 
                  onClick={(e) => { e.stopPropagation(); resetFilters(); }} 
                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear All
                </button>
              )}
              {showFilters ? (
                <ChevronUp className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              ) : (
                <ChevronDown className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              )}
            </div>
          </div>

          {showFilters && (
            <div className={`p-6 ${isDarkMode ? 'border-t border-white/10' : 'border-t border-gray-200'}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {/* Search */}
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wide mb-2 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <Search className="w-3 h-3 inline mr-1" />
                    Search
                  </label>
                  <input 
                    type="text" 
                    placeholder="Search products..." 
                    value={filters.search} 
                    onChange={e => handleFilterChange('search', e.target.value)} 
                    className={`w-full px-4 py-2.5 rounded-lg outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-black border border-white/20 text-white placeholder-gray-500 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400' 
                        : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400'
                    }`}
                  />
                </div>

                {/* Category */}
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wide mb-2 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Category</label>
                  <select 
                    value={filters.category} 
                    onChange={e => handleFilterChange('category', e.target.value)} 
                    className={`w-full px-4 py-2.5 rounded-lg outline-none transition-all cursor-pointer ${
                      isDarkMode 
                        ? 'bg-black border border-white/20 text-white focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400' 
                        : 'bg-white border border-gray-300 text-gray-900 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400'
                    }`}
                  >
                    <option value="">All Categories</option>
                    {filterOptions.categories.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>

                {/* Application */}
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wide mb-2 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Application</label>
                  <select 
                    value={filters.application} 
                    onChange={e => handleFilterChange('application', e.target.value)} 
                    className={`w-full px-4 py-2.5 rounded-lg outline-none transition-all cursor-pointer ${
                      isDarkMode 
                        ? 'bg-black border border-white/20 text-white focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400' 
                        : 'bg-white border border-gray-300 text-gray-900 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400'
                    }`}
                  >
                    <option value="">All Applications</option>
                    {filterOptions.applications.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>

                {/* Wattage */}
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wide mb-2 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Wattage</label>
                  <select 
                    value={filters.watt} 
                    onChange={e => handleFilterChange('watt', e.target.value)} 
                    className={`w-full px-4 py-2.5 rounded-lg outline-none transition-all cursor-pointer ${
                      isDarkMode 
                        ? 'bg-black border border-white/20 text-white focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400' 
                        : 'bg-white border border-gray-300 text-gray-900 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400'
                    }`}
                  >
                    <option value="">All Wattages</option>
                    {wattRanges.map(r => <option key={r.label} value={`${r.min}-${r.max}`}>{r.label}</option>)}
                  </select>
                </div>

                {/* Lumen */}
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wide mb-2 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Lumen Output</label>
                  <select 
                    value={filters.lumen} 
                    onChange={e => handleFilterChange('lumen', e.target.value)} 
                    className={`w-full px-4 py-2.5 rounded-lg outline-none transition-all cursor-pointer ${
                      isDarkMode 
                        ? 'bg-black border border-white/20 text-white focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400' 
                        : 'bg-white border border-gray-300 text-gray-900 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400'
                    }`}
                  >
                    <option value="">All Lumens</option>
                    {lumenRanges.map(r => <option key={r.label} value={`${r.min}-${r.max}`}>{r.label}</option>)}
                  </select>
                </div>

                {/* Input Voltage */}
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wide mb-2 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Input Voltage</label>
                  <select 
                    value={filters.inputVoltage} 
                    onChange={e => handleFilterChange('inputVoltage', e.target.value)} 
                    className={`w-full px-4 py-2.5 rounded-lg outline-none transition-all cursor-pointer ${
                      isDarkMode 
                        ? 'bg-black border border-white/20 text-white focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400' 
                        : 'bg-white border border-gray-300 text-gray-900 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400'
                    }`}
                  >
                    <option value="">All Voltages</option>
                    {filterOptions.inputVoltages.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>

                {/* Beam Angle */}
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wide mb-2 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Beam Angle</label>
                  <select 
                    value={filters.beamAngle} 
                    onChange={e => handleFilterChange('beamAngle', e.target.value)} 
                    className={`w-full px-4 py-2.5 rounded-lg outline-none transition-all cursor-pointer ${
                      isDarkMode 
                        ? 'bg-black border border-white/20 text-white focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400' 
                        : 'bg-white border border-gray-300 text-gray-900 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400'
                    }`}
                  >
                    <option value="">All Beam Angles</option>
                    {filterOptions.beamAngles.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Products Table */}
        <div className={`rounded-xl overflow-hidden transition-colors ${
          isDarkMode 
            ? 'bg-gray-900/50 border border-white/10' 
            : 'bg-white border border-gray-200 shadow-sm'
        }`}>
          <div className={`p-6 ${isDarkMode ? 'border-b border-white/10' : 'border-b border-gray-200'}`}>
            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Products</h2>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Click column headers to sort</p>
          </div>

          <div className="p-6">
            {loading && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className={`w-12 h-12 border-4 rounded-full animate-spin mb-4 ${
                  isDarkMode ? 'border-white/10 border-t-yellow-400' : 'border-gray-200 border-t-yellow-400'
                }`}></div>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Loading products...</p>
              </div>
            )}
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-6 py-4 rounded-lg">
                <strong>Error:</strong> {error}
              </div>
            )}
            
            {!loading && !error && products.length === 0 && (
              <div className="text-center py-16">
                <Package className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No products found</p>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Try adjusting your filters to see more results</p>
              </div>
            )}

            {!loading && !error && products.length > 0 && (
              <div className={`overflow-x-auto rounded-lg ${
                isDarkMode ? 'border border-white/10' : 'border border-gray-200'
              }`}>
                <table className="w-full min-w-[1000px]">
                  <thead className={isDarkMode ? 'bg-black/50 border-b border-white/10' : 'bg-gray-50 border-b border-gray-200'}>
                    <tr>
                      <th className={`px-4 py-3 text-center text-xs font-bold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Image</th>
                      {[
                        { label: 'Model', key: 'sku' },
                        { label: 'Category', key: 'category' },
                        { label: 'Application', key: 'application' },
                        { label: 'Voltage', key: 'inputVoltage' },
                        { label: 'Watt', key: 'watt' },
                        { label: 'Lumen', key: 'lumen' },
                        { label: 'Beam Angle', key: 'beamAngle' },
                        { label: 'IP Rating', key: 'ipRating' },
                        { label: 'Price', key: 'price' },
                        { label: 'Files', key: 'files' },
                        { label: 'Action', key: 'action' }
                      ].map(col => (
                        <th 
                          key={col.key} 
                          className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          } ${col.key !== 'action' && col.key !== 'files' ? `cursor-pointer ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-100'}` : ''}`}
                          onClick={() => col.key !== 'action' && col.key !== 'files' && handleSortChange(col.key)}
                        >
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className={isDarkMode ? 'divide-y divide-white/10' : 'divide-y divide-gray-200'}>
                    {paginatedProducts.map((p) => {
                      let currentIpRating: string | undefined;
                      let currentPrice: number;
                      
                      if (p.ipRatings && p.ipRatings.length > 0) {
                        const selectedRating = selectedIpRatings[p._id] || p.ipRatings[0].rating;
                        const ipData = p.ipRatings.find(ip => ip.rating === selectedRating);
                        currentIpRating = selectedRating;
                        currentPrice = ipData?.price || 0;
                      } else if (p.ipRating && p.ipRating.length > 0) {
                        currentIpRating = p.ipRating.length > 1 ? (selectedIpRatings[p._id] || p.ipRating[0]) : p.ipRating[0];
                        currentPrice = p.price;
                      } else {
                        currentIpRating = undefined;
                        currentPrice = p.price;
                      }
                      
                      const cartItemId = `${p._id}_${currentIpRating || 'default'}`;
                      const isInCart = cart.some(item => item.cartItemId === cartItemId);

                      return (
                        <tr key={p._id} className={`transition-colors ${
                          isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'
                        }`}>
                          <td className="px-4 py-4 text-center">
                            {/* Prioritize S3 productImages, then fall back to legacy images */}
                            {(p.productImages?.length || p.images?.length) ? (
                              <img 
                                src={p.productImages?.[0] || p.images?.[0]} 
                                alt={p.sku} 
                                className={`w-16 h-16 object-cover rounded-lg border-2 mx-auto ${
                                  isDarkMode ? 'border-white/10' : 'border-gray-200'
                                }`}
                              />
                            ) : (
                              <div className={`w-16 h-16 rounded-lg flex items-center justify-center mx-auto ${
                                isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
                              }`}>
                                <Package className={`w-6 h-6 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                              </div>
                            )}
                          </td>
                          <td className={`px-4 py-4 text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{p.sku}</td>
                          <td className="px-4 py-4">
                            <span className="inline-block bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 px-3 py-1 rounded-full text-xs font-semibold">
                              {p.category}
                            </span>
                          </td>
                          <td className={`px-4 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {(() => {
                              // Get currently selected IP rating for this product
                              const currentIpRating = selectedIpRatings[p._id] || 
                                (p.ipRatings && p.ipRatings.length > 0 ? p.ipRatings[0].rating : 
                                (p.ipRating && p.ipRating.length > 0 ? p.ipRating[0] : null));
                              
                              // Calculate application based on selected IP rating
                              const dynamicApplication = currentIpRating 
                                ? getApplicationFromIpRating(currentIpRating)
                                : (p.application || 'Indoor');
                              
                              return dynamicApplication;
                            })()}
                          </td>
                          <td className={`px-4 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{p.inputVoltage || '-'}</td>
                          <td className={`px-4 py-4 text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{p.watt ? `${p.watt}W` : '-'}</td>
                          <td className={`px-4 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {p.lumen ? (p.lumen.toLowerCase().includes('lm') ? p.lumen : `${p.lumen} lm`) : '-'}
                          </td>
                          <td className={`px-4 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{p.beamAngle || '-'}</td>
                          <td className="px-4 py-4">
                            {p.ipRatings && p.ipRatings.length > 0 ? (
                              p.ipRatings.length === 1 ? (
                                <span className="inline-block bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 px-3 py-1 rounded-full text-xs font-semibold">
                                  {p.ipRatings[0].rating}
                                </span>
                              ) : (
                                <select
                                  value={selectedIpRatings[p._id] || p.ipRatings[0].rating}
                                  onChange={(e) => setSelectedIpRatings(prev => ({ ...prev, [p._id]: e.target.value }))}
                                  className="bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 px-2 py-1 rounded-lg text-xs font-semibold cursor-pointer outline-none"
                                >
                                  {p.ipRatings.map((ip) => (
                                    <option key={ip.rating} value={ip.rating}>{ip.rating}</option>
                                  ))}
                                </select>
                              )
                            ) : p.ipRating && p.ipRating.length > 0 ? (
                              p.ipRating.length === 1 ? (
                                <span className="inline-block bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 px-3 py-1 rounded-full text-xs font-semibold">
                                  {p.ipRating[0]}
                                </span>
                              ) : (
                                <select
                                  value={selectedIpRatings[p._id] || p.ipRating[0]}
                                  onChange={(e) => setSelectedIpRatings(prev => ({ ...prev, [p._id]: e.target.value }))}
                                  className="bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 px-2 py-1 rounded-lg text-xs font-semibold cursor-pointer outline-none"
                                >
                                  {p.ipRating.map((rating) => (
                                    <option key={rating} value={rating}>{rating}</option>
                                  ))}
                                </select>
                              )
                            ) : (
                              <span className="text-gray-500">N/A</span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-sm font-bold text-yellow-400">
                            {formatPrice(currentPrice)}
                          </td>
                          <td className="px-4 py-4">
                            {(p.datasheets?.length || p.iesFiles?.length || p.certifications?.length) ? (
                              <div className="relative group">
                                <button className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                                  isDarkMode 
                                    ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/30' 
                                    : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border border-yellow-300'
                                }`}>
                                  <File size={14} />
                                  <span>View Files</span>
                                  <ChevronDown size={12} className="group-hover:translate-y-0.5 transition-transform" />
                                </button>
                                
                                {/* Dropdown Menu */}
                                <div className={`absolute left-0 top-full mt-1 w-48 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 ${
                                  isDarkMode 
                                    ? 'bg-gray-800 border border-white/20' 
                                    : 'bg-white border border-gray-200'
                                }`}>
                                  <div className="py-2">
                                    {p.datasheets?.map((url, idx) => (
                                      <a
                                        key={`ds-${idx}`}
                                        href={url}
                                        download
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                                          isDarkMode 
                                            ? 'text-gray-300 hover:bg-blue-500/20 hover:text-blue-400' 
                                            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                                        }`}
                                        title="Click to download datasheet"
                                      >
                                        <FileText size={16} className="text-blue-500" />
                                        <span className="font-medium">Datasheet</span>
                                        <Download size={12} className="ml-auto opacity-50" />
                                      </a>
                                    ))}
                                    {p.iesFiles?.map((url, idx) => (
                                      <a
                                        key={`ies-${idx}`}
                                        href={url}
                                        download
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                                          isDarkMode 
                                            ? 'text-gray-300 hover:bg-purple-500/20 hover:text-purple-400' 
                                            : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                                        }`}
                                        title="Click to download IES file"
                                      >
                                        <Download size={16} className="text-purple-500" />
                                        <span className="font-medium">IES File</span>
                                        <Download size={12} className="ml-auto opacity-50" />
                                      </a>
                                    ))}
                                    {p.certifications?.map((url, idx) => (
                                      <a
                                        key={`cert-${idx}`}
                                        href={url}
                                        download
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                                          isDarkMode 
                                            ? 'text-gray-300 hover:bg-green-500/20 hover:text-green-400' 
                                            : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                                        }`}
                                        title="Click to download certificate"
                                      >
                                        <Award size={16} className="text-green-500" />
                                        <span className="font-medium">Certificate</span>
                                        <Download size={12} className="ml-auto opacity-50" />
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <span className={`text-xs italic ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>No files</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <button 
                              onClick={() => {
                                if (!isInCart) {
                                  setAddingProductId(p._id);
                                  const productToAdd = {
                                    ...p,
                                    ipRating: currentIpRating,
                                    price: currentPrice
                                  };
                                  addToCart(productToAdd);
                                  setTimeout(() => setAddingProductId(null), 300);
                                }
                              }}
                              disabled={isInCart}
                              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                                isInCart 
                                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                                  : 'bg-yellow-400 hover:bg-yellow-500 text-black hover:scale-105'
                              }`}
                            >
                              <ShoppingCart className="w-4 h-4" />
                              {isInCart ? 'Added' : 'Add to Cart'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {!loading && !error && products.length > 0 && totalPages > 1 && (
              <div className={`px-6 py-4 border-t flex items-center justify-between ${
                isDarkMode ? 'bg-gray-900/50 border-white/10' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                  Showing {startIndex + 1} to {Math.min(endIndex, products.length)} of {products.length} products
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-lg flex items-center gap-1 transition-colors ${
                      currentPage === 1
                        ? isDarkMode 
                          ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : isDarkMode
                          ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-white/10'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      // Show first 2, current page with neighbors, and last 2
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-1 rounded-lg transition-colors ${
                            currentPage === pageNum
                              ? isDarkMode
                                ? 'bg-blue-600 text-white'
                                : 'bg-blue-600 text-white'
                              : isDarkMode
                                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-white/10'
                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-lg flex items-center gap-1 transition-colors ${
                      currentPage === totalPages
                        ? isDarkMode 
                          ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : isDarkMode
                          ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-white/10'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
