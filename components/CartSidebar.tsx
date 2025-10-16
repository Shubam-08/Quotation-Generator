'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import CurrencySelector from './CurrencySelector';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ShoppingCart, Trash2, Plus, Minus, FileText, FileSpreadsheet } from 'lucide-react';

// Define Product & CartItem types
interface Product {
  _id: string;
  sku?: string;
  category?: string;
  application?: string;
  inputVoltage?: string;
  watt?: string;
  lumen?: string;
  beamAngle?: string;
  dimension?: string;
  cutOut?: string;
  ipRating?: string;
  price?: number;
}
type CartItem = Product & { quantity: number; name?: string; cartItemId: string; };

export default function CartSidebar({ closeSidebar }: { closeSidebar?: () => void }) {
  const { cart, removeFromCart, clearCart, increaseQuantity, decreaseQuantity, updateQuantity } = useCart() as {
    cart: CartItem[];
    removeFromCart: (id: string) => void;
    clearCart: () => void;
    increaseQuantity: (id: string) => void;
    decreaseQuantity: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
  };
  const { formatPrice, convertPrice, currencyInfo } = useCurrency();

  const [userInfo, setUserInfo] = useState({ email: '', mobile: '', project: '' });
  const [showError, setShowError] = useState(false);

  // Calculate total in selected currency (not base INR price)
  const total = cart.reduce((sum, item) => {
    const convertedPrice = convertPrice(item.price ?? 0);
    return sum + (convertedPrice * (item.quantity ?? 1));
  }, 0);
  const canDownload = userInfo.email && userInfo.mobile && userInfo.project;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInfo(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setShowError(false);
  };

  // Export Excel
  const exportExcel = () => {
    if (!canDownload) { setShowError(true); return; }

    const workbook = XLSX.utils.book_new();
    const headerData = [
      ['QLITE CO. WLL'],
      ['CR No.: 82699-01'],
      ['P.O. Box: 1858'],
      ['Manama - Kingdom of Bahrain'],
      ['TEL: +973 17232503  FAX: +973 17242125'],
      ['E-mail: sales@qliteglobal.com'],
      [`Project Name - ${userInfo.project}`],
      [`Email: ${userInfo.email}`],
      [`Mobile: ${userInfo.mobile}`],
      [],
    ];
    const ws = XLSX.utils.aoa_to_sheet(headerData);
    ws['!merges'] = headerData.map((_, i) => ({ s: { r: i, c: 0 }, e: { r: i, c: 12 } }));

    // Use currency code instead of symbol for Excel to avoid encoding issues with ₹
    const excelCurrency = currencyInfo.symbol === '₹' ? 'INR' : currencyInfo.symbol;
    const tableColumns = [
      'Model Number','Category','Application','Input Voltage','Watt','Lumen','Beam Angle','Dimension','Cut Out','IP Rating',`Price (${excelCurrency})`,'Quantity',`Total (${excelCurrency})`
    ];

    const tableData = cart.map(item => [
      item.sku ?? 'N/A', item.category ?? '-', item.application ?? '-', item.inputVoltage ?? '-', 
      item.watt ?? '-', item.lumen ?? '-', item.beamAngle ?? '-', item.dimension ?? '-', item.cutOut ?? '-', 
      item.ipRating && item.ipRating.trim() !== '' ? item.ipRating : 'N/A', 
      convertPrice(item.price ?? 0).toFixed(2), item.quantity ?? 1, 
      (convertPrice(item.price ?? 0) * (item.quantity ?? 1)).toFixed(2)
    ]);

    XLSX.utils.sheet_add_aoa(ws, [tableColumns], { origin: 10 });
    XLSX.utils.sheet_add_aoa(ws, tableData, { origin: 11 });

    const totalAmount = cart.reduce((sum, item) => sum + (convertPrice(item.price ?? 0) * (item.quantity ?? 1)), 0);
    const totalRowIndex = 11 + tableData.length;
    XLSX.utils.sheet_add_aoa(ws, [['','','','','','','','','','', `Total Amount (${excelCurrency}):`, totalAmount.toFixed(2)]], { origin: totalRowIndex });

    XLSX.utils.book_append_sheet(workbook, ws, 'Cart');
    XLSX.writeFile(workbook, `${userInfo.project}_cart.xlsx`);
  };

  // Export PDF
const exportPDF = () => {
  if (!canDownload) { setShowError(true); return; }

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginRight = 20;
  const rightX = pageWidth - marginRight;

  // Logo
  doc.addImage('/logo.jpg', 'JPEG', 14, 1, 80, 90);

  // Company Info - smaller & normal
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('QLITE CO. WLL', rightX, 20, { align: 'right' });
  doc.text('CR No.: 82699-01', rightX, 32, { align: 'right' });
  doc.text('P.O. Box: 1858', rightX, 44, { align: 'right' });
  doc.text('Manama - Kingdom of Bahrain', rightX, 56, { align: 'right' });
  doc.text('TEL: +973 17232503  FAX: +973 17242125', rightX, 68, { align: 'right' });
  doc.text('E-mail: sales@qliteglobal.com', rightX, 80, { align: 'right' });

  // Project Info
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`Project Name - ${userInfo.project}`, 14, 100);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Email: ${userInfo.email}`, 14, 112);
  doc.text(`Mobile: ${userInfo.mobile}`, 14, 124);

  // Table - with currency symbol in column headers
  // Use currency code instead of symbol for PDF to avoid encoding issues with ₹
  const pdfCurrency = currencyInfo.symbol === '₹' ? 'INR' : currencyInfo.symbol;
  const columns = [
    'Model Number','Category','Application','Input Voltage','Watt','Lumen','Beam Angle','IP Rating',`Price (${pdfCurrency})`,'Quantity',`Total (${pdfCurrency})`
  ];
  const rows = cart.map(item => [
    item.sku ?? 'N/A', item.category ?? '-', item.application ?? '-', item.inputVoltage ?? '-', 
    item.watt ?? '-', item.lumen ?? '-', item.beamAngle ?? '-', item.ipRating && item.ipRating.trim() !== '' ? item.ipRating : 'N/A', 
    convertPrice(item.price ?? 0).toFixed(2), item.quantity ?? 1, 
    (convertPrice(item.price ?? 0) * (item.quantity ?? 1)).toFixed(2)
  ]);

  autoTable(doc, {
    head: [columns],
    body: rows,
    startY: 136,
    styles: { fontSize: 7, cellPadding: 2, fontStyle: 'normal' }, // smaller, thin text
    headStyles: { fillColor: [0, 70, 255], textColor: 255, fontStyle: 'bold', fontSize: 8 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: 14, right: 14 },
    columnStyles: { 7: { cellWidth: 50 } },
  });

  // Total Amount - slightly bold
  const finalY = (doc as any).lastAutoTable.finalY || 140;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  // Total is already in converted currency, no need to convert again
  const formattedTotal = total.toFixed(2);
  // Use currency code instead of symbol for PDF to avoid encoding issues
  const currencyDisplay = currencyInfo.symbol === '₹' ? 'INR' : currencyInfo.symbol;
  doc.text(`Total Amount: ${currencyDisplay} ${formattedTotal}`, rightX, finalY + 20, { align: 'right' });

  doc.save(`${userInfo.project}_quotation.pdf`);
};


  return (
    <div style={{
  width: '100%',
  maxWidth: '800px',        // optional, to keep content centered
  margin: '2rem auto',      // top/bottom spacing and center horizontally
  backgroundColor: 'white',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  borderRadius: '0.75rem',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  padding: '1.5rem',
}}>
      {/* Close Button */}
      {closeSidebar && (
        <button onClick={closeSidebar} style={{
          position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.25rem'
        }}>×</button>
      )}

      {/* Header */}
      <div style={{ padding: '1.5rem', borderBottom: '2px solid #e2e8f0', backgroundColor: '#f8fafc', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShoppingCart size={24} color="#3b82f6" />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>Cart</h2>
            {cart.length > 0 && <span style={{ backgroundColor: '#3b82f6', color: 'white', borderRadius: '9999px', padding: '0.25rem 0.625rem', fontSize: '0.875rem', fontWeight: 700 }}>{cart.length}</span>}
          </div>
          <CurrencySelector />
        </div>
      </div>

      {/* Cart Items */}
      <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
            <ShoppingCart size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
            <p style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>Your cart is empty</p>
            <p style={{ fontSize: '0.875rem' }}>Add products to get best quotations</p>
          </div>
        ) : (
          <>
            {cart.map(item => (
              <div key={item.cartItemId} style={{ backgroundColor: '#f8fafc', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1rem', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#1e293b', marginBottom: '0.25rem' }}>{item.sku}</p>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>{item.category}</p>
                      {item.ipRating && item.ipRating !== 'N/A' && (
                        <span style={{ fontSize: '0.75rem', backgroundColor: '#fef3c7', color: '#92400e', padding: '0.125rem 0.5rem', borderRadius: '0.25rem', fontWeight: 600 }}>
                          IP: {item.ipRating}
                        </span>
                      )}
                      {item.watt && item.watt !== '-' && (
                        <span style={{ fontSize: '0.75rem', backgroundColor: '#dbeafe', color: '#1e40af', padding: '0.125rem 0.5rem', borderRadius: '0.25rem', fontWeight: 600 }}>
                          {item.watt}W
                        </span>
                      )}
                      {item.lumen && item.lumen !== '-' && (
                        <span style={{ fontSize: '0.75rem', backgroundColor: '#fce7f3', color: '#9f1239', padding: '0.125rem 0.5rem', borderRadius: '0.25rem', fontWeight: 600 }}>
                          {item.lumen.toLowerCase().includes('lm') ? item.lumen : `${item.lumen} lm`}
                        </span>
                      )}
                      {item.beamAngle && item.beamAngle !== '-' && (
                        <span style={{ fontSize: '0.75rem', backgroundColor: '#dcfce7', color: '#166534', padding: '0.125rem 0.5rem', borderRadius: '0.25rem', fontWeight: 600 }}>
                          {item.beamAngle}
                        </span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item.cartItemId)} style={{ padding: '0.375rem', backgroundColor: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}><Trash2 size={16} /></button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'white', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                    <button onClick={() => decreaseQuantity(item.cartItemId)} style={{ width: '32px', height: '32px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', color: '#1e293b' }}><Minus size={16} /></button>
                    <input 
                      type="number" 
                      min="1" 
                      value={item.quantity} 
                      onChange={(e) => updateQuantity(item.cartItemId, parseInt(e.target.value) || 1)}
                      style={{ width: '60px', textAlign: 'center', fontWeight: 600, fontSize: '0.9375rem', color: '#1e293b', border: 'none', outline: 'none', backgroundColor: 'transparent' }}
                    />
                    <button onClick={() => increaseQuantity(item.cartItemId)} style={{ width: '32px', height: '32px', backgroundColor: '#eff6ff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', color: '#1e293b' }}><Plus size={16} /></button>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.125rem' }}>{formatPrice(item.price ?? 0)} × {item.quantity}</p>
                    <p style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>{formatPrice((item.price ?? 0) * (item.quantity ?? 1))}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Total, User Info, Actions */}
            <div style={{ backgroundColor: '#eff6ff', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem', border: '2px solid #bfdbfe' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1rem', fontWeight: 600, color: '#1e40af' }}>Total Amount:</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e40af' }}>{currencyInfo.symbol} {total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>*Current price may vary. Final price on request.</p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.025em', marginBottom: '1rem' }}>Contact Details</h3>
              {['email','mobile','project'].map(field => (
                <div key={field} style={{ marginBottom: '0.75rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#64748b', marginBottom: '0.375rem' }}>{field==='project'?'Project Name':field==='mobile'?'Mobile Number':'Email'}</label>
                  <input type="text" name={field} value={(userInfo as any)[field]} onChange={handleChange} placeholder={field==='project'?'Enter project name':field==='mobile'?'Enter mobile number':'Enter email address'} style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.875rem', color: '#1e293b', backgroundColor: '#ffffff' }} />
                </div>
              ))}
              {showError && <div style={{ color:'#dc2626', backgroundColor:'#fef2f2', padding:'0.75rem', borderRadius:'0.5rem', fontSize:'0.8125rem', border:'1px solid #fecaca', marginTop:'0.75rem' }}>Please fill all details to download.</div>}
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
              <button onClick={exportPDF} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', padding:'0.875rem', backgroundColor:'#3b82f6', color:'white', borderRadius:'0.5rem' }}><FileText size={18}/> Export to PDF</button>
              <button onClick={exportExcel} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', padding:'0.875rem', backgroundColor:'#10b981', color:'white', borderRadius:'0.5rem' }}><FileSpreadsheet size={18}/> Export to Excel</button>
              <button onClick={clearCart} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', padding:'0.875rem', backgroundColor:'#ef4444', color:'white', borderRadius:'0.5rem' }}><Trash2 size={18}/> Clear Cart</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
