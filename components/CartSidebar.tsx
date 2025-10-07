'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function CartSidebar() {
  const { cart, removeFromCart, clearCart, increaseQuantity, decreaseQuantity } = useCart();
  const [userInfo, setUserInfo] = useState({ email: '', mobile: '', project: '' });
  const [showError, setShowError] = useState(false);

  const total = cart.reduce((sum, item) => sum + (item.price ?? 0) * (item.quantity ?? 1), 0);
  const canDownload = userInfo.email && userInfo.mobile && userInfo.project;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInfo(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setShowError(false);
  };

  // Excel Export
  const exportExcel = () => {
    if (!canDownload) {
      setShowError(true);
      return;
    }

    const data = cart.map(item => ({
      'Model Number': item.sku ?? 'N/A',
      'Category': item.category ?? '-',
      'Application': item.application ?? '-',
      'Input Voltage': item.inputVoltage ?? '-',
      'Watt': item.watt ?? '-',
      'Lumen': item.lumen ?? '-',
      'Beam Angle': item.beamAngle ?? '-',
      'Price': item.price ?? 0,
      'Quantity': item.quantity ?? 1,
      'Total': (item.price ?? 0) * (item.quantity ?? 1)
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Cart');
    XLSX.writeFile(workbook, 'cart.xlsx');
  };

  // PDF Export (Professional)
  const exportPDF = () => {
    if (!canDownload) {
      setShowError(true);
      return;
    }

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();

    // Logo
    const imgWidth = 80;
    const imgHeight = 40;
    doc.addImage('/logo.jpg', 'JPEG', 14, 14, imgWidth, imgHeight);

    // Company Info (Top-Right)
    doc.setFontSize(10);
    doc.text('QLITE CO. WLL', pageWidth - 150, 20, { align: 'right' });
    doc.text('CR No.: 82699-01', pageWidth - 150, 32, { align: 'right' });
    doc.text('P.O. Box: 1858', pageWidth - 150, 44, { align: 'right' });
    doc.text('Manama - Kingdom of Bahrain', pageWidth - 150, 56, { align: 'right' });
    doc.text('TEL: +973 17232503  FAX: +973 17242125', pageWidth - 150, 68, { align: 'right' });
    doc.text('E-mail: sales@qliteglobal.com', pageWidth - 150, 80, { align: 'right' });

    // Project Info
    doc.setFontSize(12);
    doc.setTextColor(0, 70, 255);
    doc.text(`Project Name - ${userInfo.project}`, 14, 100);
    doc.setTextColor(0);
    doc.setFontSize(10);
    doc.text(`Email: ${userInfo.email}`, 14, 112);
    doc.text(`Mobile: ${userInfo.mobile}`, 14, 124);

    // Table
    const columns = [
      'Model Number', 'Category', 'Application', 'Input Voltage', 'Watt',
      'Lumen', 'Beam Angle', 'Price', 'Quantity', 'Total'
    ];

    const rows = cart.map(item => [
      item.sku ?? 'N/A',
      item.category ?? '-',
      item.application ?? '-',
      item.inputVoltage ?? '-',
      item.watt ?? '-',
      item.lumen ?? '-',
      item.beamAngle ?? '-',
      item.price ?? 0,
      item.quantity ?? 1,
      (item.price ?? 0) * (item.quantity ?? 1)
    ]);

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 140,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [0, 70, 255], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 14, right: 14 }
    });

    // Total Amount
    const finalY = (doc as any).lastAutoTable.finalY || 140;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Amount: ₹${total.toLocaleString()}`, pageWidth - 14, finalY + 20, { align: 'right' });

    doc.save(`${userInfo.project}_quotation.pdf`);
  };

  return (
    <div style={{
      position: 'fixed',
      right: 0,
      top: 0,
      height: '100%',
      width: '384px',
      backgroundColor: 'white',
      boxShadow: '-2px 0 8px rgba(0,0,0,0.1)',
      padding: '1.5rem',
      overflowY: 'auto',
      zIndex: 50
    }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        Cart ({cart.length})
      </h2>
      
      {cart.length === 0 && <p style={{ color: '#6b7280' }}>Your cart is empty.</p>}

      {cart.map(item => (
        <div
          key={item._id}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem',
            borderBottom: '1px solid #e5e7eb',
            paddingBottom: '0.5rem'
          }}
        >
          <div>
            <p style={{ fontWeight: '500', fontSize: '0.875rem' }}>
              {item.sku}
            </p>
            <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
              ₹{item.price} x {item.quantity} = ₹{((item.price ?? 0) * (item.quantity ?? 1)).toLocaleString()}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              style={{
                padding: '0.25rem 0.5rem',
                backgroundColor: '#e5e7eb',
                borderRadius: '0.25rem',
                border: 'none',
                cursor: 'pointer'
              }}
              onClick={() => decreaseQuantity(item._id)}
            >-</button>
            <span style={{ fontSize: '0.875rem' }}>{item.quantity}</span>
            <button
              style={{
                padding: '0.25rem 0.5rem',
                backgroundColor: '#e5e7eb',
                borderRadius: '0.25rem',
                border: 'none',
                cursor: 'pointer'
              }}
              onClick={() => increaseQuantity(item._id)}
            >+</button>
            <button
              style={{
                marginLeft: '0.5rem',
                color: '#ef4444',
                fontSize: '0.75rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
              onClick={() => removeFromCart(item._id)}
            >Remove</button>
          </div>
        </div>
      ))}

      {cart.length > 0 && (
        <>
          <div style={{ marginTop: '1rem' }}>
          <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
  Total: ₹{total.toLocaleString()}
</p>
<p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0' }}>
  *Current price may vary. Final price on request.
</p>

            <input
              type="email"
              placeholder="Your Email"
              name="email"
              value={userInfo.email}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                boxSizing: 'border-box'
              }}
            />
            <input
              type="text"
              placeholder="Mobile Number"
              name="mobile"
              value={userInfo.mobile}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                boxSizing: 'border-box'
              }}
            />
            <input
              type="text"
              placeholder="Project Name"
              name="project"
              value={userInfo.project}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                boxSizing: 'border-box'
              }}
            />

            {showError && (
              <p style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                Please fill all details to download.
              </p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button
                onClick={clearCart}
                style={{
                  width: '100%',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = '#b91c1c'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = '#dc2626'}
              >
                Clear Cart
              </button>
              <button
                onClick={exportExcel}
                style={{
                  width: '100%',
                  backgroundColor: '#16a34a',
                  color: 'white',
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = '#15803d'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = '#16a34a'}
              >
                Export to Excel
              </button>
              <button
                onClick={exportPDF}
                style={{
                  width: '100%',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = '#2563eb'}
              >
                Export to PDF
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
