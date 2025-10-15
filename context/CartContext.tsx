'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

type Product = {
  _id: string;
  sku: string;
  category?: string;
  price: number;
  stock?: number;
  watt?: number;
  inputVoltage?: string;
  type?: string;
  lumen?: string;
  beamAngle?: string;
  application?: string;
  dimension?: string;
  cutOut?: string;
  ipRating?: string | string[]; // Support both single string and array for backward compatibility
};

type CartContextType = {
  cart: (Product & { quantity: number; name: string; cartItemId: string })[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  increaseQuantity: (cartItemId: string) => void;
  decreaseQuantity: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<(Product & { quantity: number; name: string; cartItemId: string })[]>([]);
  const { showToast } = useToast();

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product, quantity: number = 1) => {
    // Get IP rating as string for comparison
    const productIpRating = Array.isArray(product.ipRating) 
      ? product.ipRating[0] 
      : product.ipRating;
    
    // Create unique cart item ID based on product ID + IP rating
    const cartItemId = `${product._id}_${productIpRating || 'default'}`;
    
    // Check if this specific product + IP rating combination already exists
    const exists = cart.find(item => item.cartItemId === cartItemId);
    
    if (exists) {
      const ipRatingText = productIpRating ? ` (${productIpRating})` : '';
      showToast(`${product.sku}${ipRatingText} is already in your list`, 'info');
      return; // Prevent duplicate
    }

    const validQuantity = Math.max(1, Math.floor(quantity)); // Ensure positive integer

    const cartItem = {
      _id: product._id,
      sku: product.sku,
      name: product.sku, // for display on sidebar
      price: product.price ?? 0,
      watt: product.watt ?? 0,
      inputVoltage: product.inputVoltage || '-',
      type: product.type || '-',
      lumen: product.lumen || '-',
      beamAngle: product.beamAngle || '-',
      category: product.category || '-',
      application: product.application || '-',
      dimension: product.dimension || '-',
      cutOut: product.cutOut || '-',
      ipRating: productIpRating || 'N/A',
      quantity: validQuantity,
      cartItemId: cartItemId
    };

    setCart(prev => [...prev, cartItem]);
    const ipRatingText = productIpRating ? ` (${productIpRating})` : '';
    showToast(`${product.sku}${ipRatingText} added to your list`, 'success');
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const increaseQuantity = (cartItemId: string) => {
    setCart(prev =>
      prev.map(item => (item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + 1 } : item))
    );
  };

  const decreaseQuantity = (cartItemId: string) => {
    setCart(prev =>
      prev.map(item =>
        item.cartItemId === cartItemId ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item
      )
    );
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    const validQuantity = Math.max(1, Math.floor(quantity)); // Ensure positive integer
    setCart(prev =>
      prev.map(item =>
        item.cartItemId === cartItemId ? { ...item, quantity: validQuantity } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, increaseQuantity, decreaseQuantity, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
