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
        bottom: '2rem',
        right: '2rem',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        backgroundColor: '#3b82f6',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        transition: 'all 0.3s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)';
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.5)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
      }}
    >
      <ShoppingCart size={24} />
    </button>
  );
}
