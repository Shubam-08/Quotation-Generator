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


  lumen?: string;
  beamAngle?: string;
  application?: string;
  dimension?: string;
  cct?: string;
  dimming?: string;
  accessories?: string;
  finish?: string;
  reflectorFinish?: string;
  ipRating?: string | string[]; // Support both single string and array for backward compatibility
  images?: string[];
  productImages?: string[];
  // LED display specific fields (optional, passed through from products page)
  pixelPitch?: string;
  totalResolution?: string;
  sqft?: number;
  moduleSpecs?: any;
  cabinetSpecs?: any;
  screenParams?: any;
  cabinetRequired?: number;
  requiredLength?: string;
  requiredWidth?: string;
  // Derived LED display layout fields
  suggestedSize?: string;
  cabinetArrangementWidth?: number;
  cabinetArrangementHeight?: number;
  // Lighting control specific fields
  selectedVariant?: any;
};

type Driver = {
  _id: string;
  sku: string;
  name: string;
  description?: string;
  series?: string;
  price: number;
  wattageRange?: { min: number; max: number };
  outputVoltage?: string;
  outputCurrent?: string;

  ipRating?: string;
  type?: string;
  category?: string;
  images?: string[];
  productImages?: string[];
};

type CartItem = (Product | Driver) & {
  quantity: number;
  name: string;
  cartItemId: string;
  isDriver?: boolean;
  parentProductId?: string; // For drivers, links to the product they're associated with
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  addDriverToCart: (driver: Driver, parentProductId: string, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  increaseQuantity: (cartItemId: string) => void;
  decreaseQuantity: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  updateCartItem: (cartItemId: string, updates: Partial<CartItem>) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
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
    // Use provided cartItemId if available (for lighting controls with variants), otherwise generate one
    let cartItemId: string;
    
    if ((product as any).cartItemId) {
      // Use the pre-generated cartItemId from the product page
      cartItemId = (product as any).cartItemId;
    } else {
      // Generate cartItemId for LED lights and other products
      // Get IP rating as string for comparison
      const productIpRating = Array.isArray(product.ipRating) 
        ? product.ipRating[0] 
        : product.ipRating;
      
      // Get voltage and watt for unique identification

      const productWatt = product.watt || 'default';
      
      // Get beam angle for unique identification
      const productBeamAngle = product.beamAngle || 'default';
      
      // Get lumen for unique identification
      const productLumen = product.lumen || 'default';
      
      // For LED displays, include dimensions in the unique ID to allow multiple sizes of same product
      const dimensionKey = (product.requiredLength && product.requiredWidth) 
        ? `_${product.requiredLength}x${product.requiredWidth}` 
        : '';
      
      // For LED displays, include cabinet material in the unique ID
      const materialKey = (product as any).selectedCabinetMaterial 
        ? `_${(product as any).selectedCabinetMaterial.replace(/\s+/g, '')}` 
        : '';
      
      // Create unique cart item ID based on product ID + IP rating + watt + beam angle + lumen + dimensions + material
      cartItemId = `${product._id}_${(product as any).ipRatings && (product as any).ipRatings.length > 0 ? (product as any).ipRatings[0].rating : (productIpRating || 'default')}_${productWatt}_${productBeamAngle}_${productLumen}${dimensionKey}${materialKey}`;
    }
    
    // Check if this specific combination already exists
    const exists = cart.find(item => item.cartItemId === cartItemId);
    
    // Get IP rating for toast messages
    const productIpRating = Array.isArray(product.ipRating) 
      ? product.ipRating[0] 
      : product.ipRating;
    
    if (exists) {
      const ipRatingText = productIpRating ? ` (${productIpRating})` : '';

      const wattText = product.watt ? ` - ${product.watt}W` : '';
      const beamAngleText = product.beamAngle && product.beamAngle !== '-' ? ` - ${product.beamAngle}` : '';
      const lumenText = product.lumen && product.lumen !== '-' ? ` - ${product.lumen}` : '';
      showToast(`${product.sku}${ipRatingText}${wattText}${beamAngleText}${lumenText} is already in your list`, 'info');
      return; // Prevent duplicate
    }

    const validQuantity = Math.max(1, Math.floor(quantity)); // Ensure positive integer

    const cartItem: CartItem = {
      ...(product as any),
      _id: product._id,
      sku: product.sku,
      name: product.sku, // for display on sidebar
      price: product.price ?? 0,
      watt: product.watt ?? 0,
      lumen: product.lumen || '-',
      beamAngle: product.beamAngle || '-',
      category: product.category || '-',
      application: product.application || '-',
      dimension: product.dimension || '-',
      ipRating: productIpRating || 'N/A',
      // Ensure we always pass some image data to the cart, even if the
      // product only has a single `productImage` string (common for
      // lighting controls).
      images: (product as any).images && (product as any).images.length
        ? (product as any).images
        : ((product as any).productImage
          ? [(product as any).productImage]
          : []),
      productImages: (product as any).productImages && (product as any).productImages.length
        ? (product as any).productImages
        : ((product as any).productImage
          ? [(product as any).productImage]
          : []),
      quantity: validQuantity,
      cartItemId: cartItemId
    };

    setCart(prev => [...prev, cartItem]);
    const ipRatingText = productIpRating ? ` (${productIpRating})` : '';
    const beamAngleText = product.beamAngle && product.beamAngle !== '-' ? ` - ${product.beamAngle}` : '';
    const lumenText = product.lumen && product.lumen !== '-' ? ` - ${product.lumen}` : '';
    showToast(`${product.sku}${ipRatingText}${beamAngleText}${lumenText} added to your list`, 'success');
  };

  const addDriverToCart = (driver: Driver, parentProductId: string, quantity: number = 1) => {
    // Create unique cart item ID for driver
    const cartItemId = `driver_${driver._id}_${parentProductId}_${Date.now()}`;
    
    // Check if this driver is already added for this product
    const exists = cart.find(
      item => item.isDriver && item._id === driver._id && item.parentProductId === parentProductId
    );
    
    if (exists) {
      showToast(`${driver.name} is already added for this product`, 'info');
      return;
    }

    const validQuantity = Math.max(1, Math.floor(quantity));

    const cartItem: CartItem = {
      _id: driver._id,
      sku: driver.sku,
      name: driver.name,
      description: driver.description || '',
      price: driver.price ?? 0,
      category: driver.category || 'Driver',
      images: driver.images || [],
      productImages: driver.productImages || [],
      quantity: validQuantity,
      cartItemId: cartItemId,
      isDriver: true,
      parentProductId: parentProductId,
      wattageRange: driver.wattageRange,
      outputVoltage: driver.outputVoltage,
      outputCurrent: driver.outputCurrent,

      ipRating: driver.ipRating,
      type: driver.type,
      series: driver.series
    } as any;

    setCart(prev => [...prev, cartItem]);
    showToast(`${driver.name} added to your list`, 'success');
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

  const updateCartItem = (cartItemId: string, updates: Partial<CartItem>) => {
    setCart(prev =>
      prev.map(item =>
        item.cartItemId === cartItemId ? { ...item, ...updates } : item
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
      value={{ cart, addToCart, addDriverToCart, removeFromCart, increaseQuantity, decreaseQuantity, updateQuantity, updateCartItem, clearCart }}
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
