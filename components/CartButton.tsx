'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';

export default function CartButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push('/cart')} // navigate to /cart
      style={{
        position: 'fixed',
        bottom: '0.75rem',  
        right: '0.75rem',   
        width: '44px',      
        height: '44px',
        borderRadius: '50%',
        backgroundColor: '#3b82f6',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 3px 10px rgba(59, 130, 246, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        transition: 'all 0.2s',
      }}
      className="cart-breath"
    >
      <ShoppingCart size={18} />
    </button>
  );
}
