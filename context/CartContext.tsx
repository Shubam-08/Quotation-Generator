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
  ipRating?: string;
};

type CartContextType = {
  cart: (Product & { quantity: number; name: string })[];
  addToCart: (product: Product) => void;
  removeFromCart: (_id: string) => void;
  increaseQuantity: (_id: string) => void;
  decreaseQuantity: (_id: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<(Product & { quantity: number; name: string })[]>([]);
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

  const addToCart = (product: Product) => {
    const exists = cart.find(item => item._id === product._id);
    if (exists) {
      showToast(`${product.sku} is already in your list`, 'info');
      return; // Prevent duplicate
    }

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
      ipRating: product.ipRating || 'N/A',
      quantity: 1
    };

    setCart(prev => [...prev, cartItem]);
    showToast(`${product.sku} added to your list`, 'success');
  };

  const removeFromCart = (_id: string) => {
    setCart(prev => prev.filter(item => item._id !== _id));
  };

  const increaseQuantity = (_id: string) => {
    setCart(prev =>
      prev.map(item => (item._id === _id ? { ...item, quantity: item.quantity + 1 } : item))
    );
  };

  const decreaseQuantity = (_id: string) => {
    setCart(prev =>
      prev.map(item =>
        item._id === _id ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart }}
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
