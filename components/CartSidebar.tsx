'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import CurrencySelector from './CurrencySelector';
import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import autoTable, { CellHookData } from 'jspdf-autotable';
import { ShoppingCart, Trash2, Plus, Minus, FileText, FileSpreadsheet } from 'lucide-react';

// Define Product & CartItem types
interface Product {
  _id: string;
  sku?: string;
  category?: string;
  description?: string;
  application?: string;
  inputVoltage?: string;
  watt?: string;
  lumen?: string;
  beamAngle?: string;
  dimension?: string;
  cutOut?: string;
  ipRating?: string;
  price?: number;
  images?: string[];
  productImages?: string[];
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

  // Generate project description from product attributes
  const generateProjectDescription = (item: CartItem): string => {
    const parts = [];
    
    if (item.watt) parts.push(`${item.watt}W`);
    if (item.category) parts.push(item.category);
    
    const details = [];
    if (item.application) details.push(item.application);
    if (item.lumen) details.push(`${item.lumen}lm`);
    if (item.inputVoltage) details.push(item.inputVoltage);
    if (item.beamAngle) details.push(`${item.beamAngle} beam angle`);
    if (item.ipRating && item.ipRating.trim() !== '') details.push(item.ipRating);
    if (item.dimension) details.push(`Dimension: ${item.dimension}`);
    if (item.cutOut) details.push(`Cut Out: ${item.cutOut}`);
    
    let description = parts.join(' ');
    if (details.length > 0) {
      description += ` (${details.join(', ')})`;
    }
    
    return description || 'LED Light';
  };

  // Export Excel
  const exportExcel = async () => {
    if (!canDownload) { setShowError(true); return; }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Cart');
    
    const addressLines = [
      'QLITE CO. WLL',
      'CR No.: 82699-01',
      'P.O. Box: 1858',
      'Manama - Kingdom of Bahrain',
      'TEL: +973 17232503  FAX: +973 17242125',
      'E-mail: sales@qliteglobal.com'
    ];
    
    // Add logo on the left side
    try {
      const logoResponse = await fetch('/logo.jpg');
      if (logoResponse.ok) {
        const logoBuffer = await logoResponse.arrayBuffer();
        const logoId = workbook.addImage({
          buffer: logoBuffer,
          extension: 'jpeg',
        });
        
        worksheet.addImage(logoId, {
          tl: { col: 0, row: 0 },
          ext: { width: 80, height: 90 }
        });
      }
    } catch (error) {
      console.error('Error adding logo:', error);
    }

    // Add address lines on the right side
    addressLines.forEach((line, index) => {
      const row = worksheet.getRow(index + 1);
      row.getCell(12).value = line; // Start from column 12 (right side)
      row.getCell(12).font = { bold: true, size: 9 };
      row.getCell(12).alignment = { horizontal: 'right' };
    });

    // Add project info below logo (left side)
    const projectInfoRow = addressLines.length + 2;
    worksheet.getRow(projectInfoRow).getCell(1).value = `Project Name - ${userInfo.project}`;
    worksheet.getRow(projectInfoRow).getCell(1).font = { bold: true, size: 10 };
    
    worksheet.getRow(projectInfoRow + 1).getCell(1).value = `Email: ${userInfo.email}`;
    worksheet.getRow(projectInfoRow + 1).getCell(1).font = { size: 9 };
    
    worksheet.getRow(projectInfoRow + 2).getCell(1).value = `Mobile: ${userInfo.mobile}`;
    worksheet.getRow(projectInfoRow + 2).getCell(1).font = { size: 9 };

    const excelCurrency = currencyInfo.symbol === '₹' ? 'INR' : currencyInfo.symbol;
    const startRow = addressLines.length + 6; // Adjusted for new header layout
    
    // Add column headers
    const headerRow = worksheet.getRow(startRow);
    const columns = [
      'SI No','Image','Model Number','Description','Category','Application','Input Voltage','Watt','Lumen','Beam Angle','Dimension','Cut Out','IP Rating',`Price (${excelCurrency})`,'Quantity',`Total (${excelCurrency})`
    ];
    columns.forEach((col, index) => {
      headerRow.getCell(index + 1).value = col;
      headerRow.getCell(index + 1).font = { bold: true };
      headerRow.getCell(index + 1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0046FF' }
      };
      headerRow.getCell(index + 1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    });
    headerRow.height = 20;

    // Set column widths
    worksheet.getColumn(1).width = 8;  // SI No
    worksheet.getColumn(2).width = 15; // Image
    worksheet.getColumn(3).width = 15; // Model Number
    worksheet.getColumn(4).width = 30; // Description
    worksheet.getColumn(5).width = 12; // Category
    worksheet.getColumn(6).width = 12; // Application
    worksheet.getColumn(7).width = 15; // Input Voltage
    worksheet.getColumn(8).width = 8;  // Watt
    worksheet.getColumn(9).width = 10; // Lumen
    worksheet.getColumn(10).width = 12; // Beam Angle
    worksheet.getColumn(11).width = 12; // Dimension
    worksheet.getColumn(12).width = 12; // Cut Out
    worksheet.getColumn(13).width = 10; // IP Rating
    worksheet.getColumn(14).width = 12; // Price
    worksheet.getColumn(15).width = 10; // Quantity
    worksheet.getColumn(16).width = 12; // Total

    // Helper function to get image URL
    const getPrimaryImageUrl = (item: CartItem): string | null => {
      return item.productImages?.[0] || item.images?.[0] || null;
    };

    // Helper function to resolve Google Drive URLs
    const resolveImageUrl = async (url: string): Promise<string> => {
      try {
        if (url.includes('drive.google.com')) {
          const res = await fetch('/api/resolve-image', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ url }) 
          });
          if (res.ok) {
            const data = await res.json();
            if (data?.url) return data.url as string;
          }
        }
      } catch {}
      return url;
    };

    // Helper function to fetch image as buffer
    const fetchImageBuffer = async (url: string): Promise<ArrayBuffer | null> => {
      try {
        const resolvedUrl = await resolveImageUrl(url);
        const response = await fetch(resolvedUrl, { mode: 'cors' });
        if (!response.ok) return null;
        return await response.arrayBuffer();
      } catch {
        return null;
      }
    };

    // Add data rows with images
    for (let i = 0; i < cart.length; i++) {
      const item = cart[i];
      const rowIndex = startRow + 1 + i;
      const row = worksheet.getRow(rowIndex);
      
      // Set row height for images
      row.height = 60;
      
      // Add data
      row.getCell(1).value = i + 1; // SI No
      row.getCell(3).value = item.sku ?? 'N/A'; // Model Number
      row.getCell(4).value = item.description || ''; // Description - from product or blank
      row.getCell(4).alignment = { wrapText: true, vertical: 'top' }; // Enable text wrapping
      row.getCell(5).value = item.category ?? '-';
      row.getCell(6).value = item.application ?? '-';
      row.getCell(7).value = item.inputVoltage ?? '-';
      row.getCell(8).value = item.watt ?? '-';
      row.getCell(9).value = item.lumen ?? '-';
      row.getCell(10).value = item.beamAngle ?? '-';
      row.getCell(11).value = item.dimension ?? '-';
      row.getCell(12).value = item.cutOut ?? '-';
      row.getCell(13).value = item.ipRating && item.ipRating.trim() !== '' ? item.ipRating : 'N/A';
      row.getCell(14).value = convertPrice(item.price ?? 0).toFixed(2);
      row.getCell(15).value = item.quantity ?? 1;
      row.getCell(16).value = (convertPrice(item.price ?? 0) * (item.quantity ?? 1)).toFixed(2);

      // Add image
      const imageUrl = getPrimaryImageUrl(item);
      if (imageUrl) {
        const imageBuffer = await fetchImageBuffer(imageUrl);
        if (imageBuffer) {
          try {
            const imageId = workbook.addImage({
              buffer: imageBuffer,
              extension: 'jpeg',
            });
            
            worksheet.addImage(imageId, {
              tl: { col: 1, row: rowIndex - 1 },
              ext: { width: 80, height: 60 }
            });
          } catch (error) {
            console.error('Error adding image:', error);
          }
        }
      }
    }

    // Add total row
    const totalAmount = cart.reduce((sum, item) => sum + (convertPrice(item.price ?? 0) * (item.quantity ?? 1)), 0);
    const totalRowIndex = startRow + 1 + cart.length;
    const totalRow = worksheet.getRow(totalRowIndex);
    totalRow.getCell(14).value = `Total Amount (${excelCurrency}):`;
    totalRow.getCell(14).font = { bold: true };
    totalRow.getCell(15).value = totalAmount.toFixed(2);
    totalRow.getCell(15).font = { bold: true };

    // Generate and download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${userInfo.project}_cart.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  // Export PDF
const exportPDF = async () => {
  if (!canDownload) { setShowError(true); return; }

  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
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
    'Image','Model Number','Category','Application','Input Voltage','Watt','Lumen','Beam Angle','IP Rating',`Price (${pdfCurrency})`,'Quantity',`Total (${pdfCurrency})`
  ];

  const getPrimaryImageUrl = (item: CartItem): string | null => {
    const url = item.productImages?.[0] || item.images?.[0] || null;
    return url || null;
  };

  const resolveImageUrl = async (url: string): Promise<string> => {
    try {
      if (url.includes('drive.google.com')) {
        const res = await fetch('/api/resolve-image', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) });
        if (res.ok) {
          const data = await res.json();
          if (data?.url) return data.url as string;
        }
      }
    } catch {}
    return url;
  };

  const toDataUrl = async (url: string): Promise<string> => {
    const u = await resolveImageUrl(url);
    const res = await fetch(u, { mode: 'cors' });
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const imageDataUrls = await Promise.all(
    cart.map(async (item) => {
      const url = getPrimaryImageUrl(item);
      if (!url) return null;
      try { return await toDataUrl(url); } catch { return null; }
    })
  );

  const getScaledImgHeight = (dataUrl: string, targetWidth: number): Promise<number> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const ratio = img.height / img.width;
        resolve(targetWidth * ratio);
      };
      img.onerror = () => resolve(46);
      img.src = dataUrl;
    });
  };

  const targetImgWidth = 46;
  const rowHeights = await Promise.all(
    imageDataUrls.map(async (du) => {
      if (!du) return 0;
      const h = await getScaledImgHeight(du, targetImgWidth);
      return Math.ceil(h + 4);
    })
  );

  const rows = cart.map(item => [
    '',
    item.sku ?? 'N/A', item.category ?? '-', item.application ?? '-', item.inputVoltage ?? '-', 
    item.watt ?? '-', item.lumen ?? '-', item.beamAngle ?? '-', item.ipRating && item.ipRating.trim() !== '' ? item.ipRating : 'N/A', 
    convertPrice(item.price ?? 0).toFixed(2), item.quantity ?? 1, 
    (convertPrice(item.price ?? 0) * (item.quantity ?? 1)).toFixed(2)
  ]);

  const cellPadding = { top: 6, right: 2, bottom: 6, left: 2 } as const;
  autoTable(doc, {
    head: [columns],
    body: rows,
    startY: 136,
    styles: { 
      fontSize: 8, 
      cellPadding, 
      fontStyle: 'bold', 
      valign: 'middle',
      lineColor: [0, 0, 0], // Black border lines
      lineWidth: 1, // Bold border line thickness
      textColor: [0, 0, 0] // Black text for better visibility
    },
    headStyles: { 
      fillColor: [0, 70, 255], 
      textColor: 255, 
      fontStyle: 'bold', 
      fontSize: 8,
      lineColor: [0, 0, 0],
      lineWidth: 1
    },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: 14, right: 14, top: 20 },
    columnStyles: { 0: { cellWidth: 50 } },
    theme: 'grid', // Use grid theme to show all borders
    didParseCell: (data: CellHookData) => {
      if (data.section === 'body') {
        const idx = data.row.index;
        const imgInnerH = (rowHeights[idx] || 46);
        const desired = imgInnerH + cellPadding.top + cellPadding.bottom;
        data.cell.styles.minCellHeight = Math.max(data.cell.styles.minCellHeight || 0, desired, 52);
      }
    },
    didDrawCell: (data: CellHookData) => {
      if (data.section === 'body' && data.column.index === 0) {
        const idx = data.row.index;
        const dataUrl = imageDataUrls[idx];
        const innerW = data.cell.width - (cellPadding.left + cellPadding.right);
        const innerH = (data.cell.height || 0) - (cellPadding.top + cellPadding.bottom);
        const imgW = Math.max(1, Math.min(targetImgWidth, innerW));
        const rawH = Math.max(46, (rowHeights[idx] || 46));
        const imgH = Math.min(rawH, innerH);
        const x = data.cell.x + cellPadding.left + (innerW - imgW) / 2;
        const y = data.cell.y + cellPadding.top + (innerH - imgH) / 2;
        if (dataUrl) {
          try { doc.addImage(dataUrl, 'JPEG', x, y, imgW, imgH); } catch {}
        } else {
          try {
            (doc as any).setFillColor(240);
            doc.rect(x, y, imgW, imgH, 'F');
            (doc as any).setTextColor(120);
            doc.setFontSize(6);
            const label = 'No Image';
            const tw = doc.getTextWidth(label);
            const tx = x + (imgW - tw) / 2;
            const ty = y + imgH / 2 + 2;
            doc.text(label, tx, ty);
          } catch {}
        }
      }
    },
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
