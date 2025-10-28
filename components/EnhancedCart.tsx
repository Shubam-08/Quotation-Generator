'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useSession } from 'next-auth/react';
import CurrencySelector from './CurrencySelector';
import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  ShoppingCart, Trash2, Plus, Minus, FileText, FileSpreadsheet, 
  Package, ArrowLeft, AlertCircle, CheckCircle2, X, Mail, Phone, Briefcase
} from 'lucide-react';
import Link from 'next/link';

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

type CartItem = Product & { quantity: number; name?: string; cartItemId: string };

export default function EnhancedCart() {
  const { cart, removeFromCart, clearCart, increaseQuantity, decreaseQuantity, updateQuantity } = useCart() as {
    cart: CartItem[];
    removeFromCart: (id: string) => void;
    clearCart: () => void;
    increaseQuantity: (id: string) => void;
    decreaseQuantity: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
  };
  const { formatPrice, convertPrice, currencyInfo } = useCurrency();
  const { data: session } = useSession();
  
  // Check if user is admin
  const isAdmin = session?.user?.role === 'admin';

  const [userInfo, setUserInfo] = useState({ email: '', mobile: '', project: '' });
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [editingQuantity, setEditingQuantity] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<'delhi' | 'bangalore'>('delhi'); // For INR currency

  // Calculate total in selected currency (not base INR price)
  const total = cart.reduce((sum, item) => {
    const convertedPrice = convertPrice(item.price ?? 0);
    return sum + (convertedPrice * (item.quantity ?? 1));
  }, 0);
  const canDownload = userInfo.email && userInfo.mobile && userInfo.project;
  const totalItems = cart.reduce((sum, item) => sum + (item.quantity ?? 1), 0);

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
    
    let description = parts.join(' ');
    if (details.length > 0) {
      description += ` (${details.join(', ')})`;
    }
    
    return description || 'LED Light';
  };

  const exportExcel = async () => {
    // Check if user is logged in
    if (!session) {
      setShowLoginPrompt(true);
      return;
    }
    
    if (!canDownload) { setShowError(true); return; }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Cart');
    
    // Get dynamic address based on currency
    const addressInfo = getAddressInfo();
    
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
    addressInfo.lines.forEach((line, index) => {
      const row = worksheet.getRow(index + 1);
      row.getCell(10).value = line; // Start from column 10 (right side)
      row.getCell(10).font = { bold: true, size: 9 };
      row.getCell(10).alignment = { horizontal: 'right' };
    });

    // Add project info below logo (left side)
    const projectInfoRow = addressInfo.lines.length + 2;
    worksheet.getRow(projectInfoRow).getCell(1).value = `Project Name - ${userInfo.project}`;
    worksheet.getRow(projectInfoRow).getCell(1).font = { bold: true, size: 10 };
    
    worksheet.getRow(projectInfoRow + 1).getCell(1).value = `Email: ${userInfo.email}`;
    worksheet.getRow(projectInfoRow + 1).getCell(1).font = { size: 9 };
    
    worksheet.getRow(projectInfoRow + 2).getCell(1).value = `Mobile: ${userInfo.mobile}`;
    worksheet.getRow(projectInfoRow + 2).getCell(1).font = { size: 9 };

    const excelCurrency = currencyInfo.symbol === '₹' ? 'INR' : currencyInfo.symbol;
    const startRow = addressInfo.lines.length + 6; // Adjusted for new header layout
    
    // Add column headers
    const headerRow = worksheet.getRow(startRow);
    const columns = [
      'SI No','Image','Model Number','Description','Category','Application','Input Voltage','Watt','Lumen','Beam Angle','IP Rating',`Price (${excelCurrency})`,'Quantity',`Total (${excelCurrency})`
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
    worksheet.getColumn(11).width = 10; // IP Rating
    worksheet.getColumn(12).width = 12; // Price
    worksheet.getColumn(13).width = 10; // Quantity
    worksheet.getColumn(14).width = 12; // Total

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
      
      // Debug: Log description
      if (i === 0) {
        console.log('First item description:', item.description);
        console.log('First item full data:', item);
      }
      row.getCell(5).value = item.category ?? '-';
      row.getCell(6).value = item.application ?? '-';
      row.getCell(7).value = item.inputVoltage ?? '-';
      row.getCell(8).value = item.watt ?? '-';
      row.getCell(9).value = item.lumen ?? '-';
      row.getCell(10).value = item.beamAngle ?? '-';
      row.getCell(11).value = item.ipRating && item.ipRating.trim() !== '' ? item.ipRating : 'N/A';
      row.getCell(12).value = convertPrice(item.price ?? 0).toFixed(2);
      row.getCell(13).value = item.quantity ?? 1;
      row.getCell(14).value = (convertPrice(item.price ?? 0) * (item.quantity ?? 1)).toFixed(2);

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
    totalRow.getCell(12).value = `Total Amount (${excelCurrency}):`;
    totalRow.getCell(12).font = { bold: true };
    totalRow.getCell(13).value = totalAmount.toFixed(2);
    totalRow.getCell(13).font = { bold: true };

    // Generate and download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${userInfo.project}_cart.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // Get address based on currency
  const getAddressInfo = () => {
    const currency = currencyInfo.code;
    
    // Dubai Address for AED
    if (currency === 'AED') {
      return {
        lines: [
          'Qlite Integrated Solutions',
          'Lighting Store',
          'Office No. 905, Sobha Ivory 1 Tower,',
          'Business Bay, Dubai – UAE',
          'E-mail: sales@qliteglobal.com',
          'TEL: +973 3330 8969'
        ]
      };
    }
    
    // India Addresses for INR
    if (currency === 'INR') {
      if (selectedRegion === 'bangalore') {
        return {
          lines: [
            'Qlite Electronics Controls Private Limited',
            'First Floor, Block -2, KSSIDC Complex, A-203,',
            'Indra Nagar, Electronic City Phase I,',
            'Electronic City, Bengaluru, Karnataka 560100',
            'E-mail: sales@qliteglobal.com',
            'TEL: +973 3330 8969'
          ]
        };
      } else {
        return {
          lines: [
            'Qlite Ltd',
            'Office 539-540, Spaze I Tech Park,',
            'Sohna Road, Gurgaon, Haryana,',
            'INDIA – 122001',
            'E-mail: sales@qliteglobal.com',
            'TEL: +973 3330 8969'
          ]
        };
      }
    }
    
    // Default Bahrain Address (for USD, GBP, EUR, QAR, BHD, SAR, OMR)
    return {
      lines: [
        'QLITE CO. WLL',
        'CR No.: 82699-01',
        'P.O. Box: 1858',
        'Manama - Kingdom of Bahrain',
        'TEL: +973 17232503  FAX: +973 17242125',
        'E-mail: sales@qliteglobal.com'
      ]
    };
  };

  const exportPDF = async () => {
    // Check if user is logged in
    if (!session) {
      setShowLoginPrompt(true);
      return;
    }
    
    if (!canDownload) { setShowError(true); return; }

    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginRight = 20;
    const rightX = pageWidth - marginRight;

    doc.addImage('/logo.jpg', 'JPEG', 14, 1, 80, 90);

    // Get dynamic address based on currency
    const addressInfo = getAddressInfo();
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    
    // Add address lines dynamically
    let yPosition = 20;
    addressInfo.lines.forEach((line) => {
      doc.text(line, rightX, yPosition, { align: 'right' });
      yPosition += 12;
    });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(`Project Name - ${userInfo.project}`, 14, 100);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Email: ${userInfo.email}`, 14, 112);
    doc.text(`Mobile: ${userInfo.mobile}`, 14, 124);

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
      styles: { fontSize: 7, cellPadding, fontStyle: 'normal', valign: 'middle' },
      headStyles: { fillColor: [0, 70, 255], textColor: 255, fontStyle: 'bold', fontSize: 8 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 14, right: 14, top: 20 },
      columnStyles: { 0: { cellWidth: 50 } },
      didParseCell: (data: any) => {
        if (data.section === 'body') {
          const idx = data.row.index;
          const imgInnerH = (rowHeights[idx] || 46);
          const desired = imgInnerH + cellPadding.top + cellPadding.bottom;
          data.cell.styles.minCellHeight = Math.max(data.cell.styles.minCellHeight || 0, desired, 52);
        }
      },
      didDrawCell: (data: any) => {
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

    const finalY = (doc as any).lastAutoTable.finalY || 140;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    // Total is already in converted currency, no need to convert again
    const formattedTotal = total.toFixed(2);
    const currencyDisplay = currencyInfo.symbol === '₹' ? 'INR' : currencyInfo.symbol;
    doc.text(`Total Amount: ${currencyDisplay} ${formattedTotal}`, rightX, finalY + 20, { align: 'right' });

    doc.save(`${userInfo.project}_quotation.pdf`);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-black' : 'bg-gray-50'}`}>
      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className={`max-w-md w-full mx-4 rounded-xl shadow-2xl ${
            isDarkMode ? 'bg-gray-900 border border-white/10' : 'bg-white'
          }`}>
            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Login Required
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    You need to be logged in to download quotations. Please login or register to continue.
                  </p>
                </div>
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className={`p-1 rounded-lg transition-colors ${
                    isDarkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Link
                  href="/login"
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-center transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold text-center transition-colors ${
                    isDarkMode 
                      ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300'
                  }`}
                >
                  Register
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg ${
            isDarkMode ? 'bg-green-500/10 border border-green-500/30' : 'bg-green-50 border border-green-200'
          }`}>
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <span className={`font-semibold ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
              File downloaded successfully!
            </span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <Link 
                href="/products"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  isDarkMode 
                    ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20' 
                    : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 shadow-sm'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Products</span>
                <span className="sm:hidden">Back</span>
              </Link>
            </div>
            <CurrencySelector />
          </div>

          <div className="flex items-center gap-3 mb-2">
            <ShoppingCart className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-400" />
            <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Shopping Cart
            </h1>
            {cart.length > 0 && (
              <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold">
                {totalItems}
              </span>
            )}
          </div>
          <p className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Review your items and generate quotation
          </p>
        </div>

        {cart.length === 0 ? (
          /* Empty Cart State */
          <div className={`rounded-xl p-8 sm:p-12 text-center ${
            isDarkMode ? 'bg-gray-900/50 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'
          }`}>
            <Package className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <h2 className={`text-xl sm:text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Your cart is empty
            </h2>
            <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Add products to create your quotation
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-lg transition-all"
            >
              <ShoppingCart className="w-5 h-5" />
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items - Left Column */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div
                  key={item.cartItemId}
                  className={`rounded-xl p-4 sm:p-6 transition-all ${
                    isDarkMode 
                      ? 'bg-gray-900/50 border border-white/10 hover:border-white/20' 
                      : 'bg-white border border-gray-200 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-lg flex-shrink-0 overflow-hidden ${
                      isDarkMode ? 'bg-gray-800 border border-white/10' : 'bg-gray-100 border border-gray-200'
                    }`}>
                      {(item.productImages?.length || item.images?.length) ? (
                        <img 
                          src={item.productImages?.[0] || item.images?.[0]} 
                          alt={item.sku} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                          <Package className={`w-8 h-8 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                          <span className={`text-[10px] uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>No Image</span>
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-bold text-base sm:text-lg mb-1 truncate ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {item.sku}
                          </h3>
                          <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {item.category}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.cartItemId)}
                          className={`p-2 rounded-lg transition-all flex-shrink-0 ${
                            isDarkMode 
                              ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30' 
                              : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
                          }`}
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Product Specs */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {item.ipRating && item.ipRating !== 'N/A' && (
                          <span className="inline-block bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 px-2 py-1 rounded text-xs font-semibold">
                            IP: {item.ipRating}
                          </span>
                        )}
                        {item.watt && item.watt !== '-' && (
                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                            isDarkMode 
                              ? 'bg-blue-500/10 border border-blue-500/30 text-blue-400' 
                              : 'bg-blue-50 border border-blue-200 text-blue-700'
                          }`}>
                            {item.watt}W
                          </span>
                        )}
                        {item.lumen && item.lumen !== '-' && (
                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                            isDarkMode 
                              ? 'bg-purple-500/10 border border-purple-500/30 text-purple-400' 
                              : 'bg-purple-50 border border-purple-200 text-purple-700'
                          }`}>
                            {item.lumen.toLowerCase().includes('lm') ? item.lumen : `${item.lumen} lm`}
                          </span>
                        )}
                        {item.beamAngle && item.beamAngle !== '-' && (
                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                            isDarkMode 
                              ? 'bg-green-500/10 border border-green-500/30 text-green-400' 
                              : 'bg-green-50 border border-green-200 text-green-700'
                          }`}>
                            {item.beamAngle}
                          </span>
                        )}
                      </div>

                      {/* Quantity and Price */}
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                          isDarkMode ? 'bg-black border border-white/20' : 'bg-gray-50 border border-gray-200'
                        }`}>
                          <button
                            onClick={() => decreaseQuantity(item.cartItemId)}
                            className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${
                              isDarkMode 
                                ? 'bg-white/10 hover:bg-white/20 text-white' 
                                : 'bg-white hover:bg-gray-100 text-gray-900 border border-gray-200'
                            }`}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 1;
                              updateQuantity(item.cartItemId, value);
                            }}
                            onFocus={() => setEditingQuantity(item.cartItemId)}
                            onBlur={() => setEditingQuantity(null)}
                            className={`w-16 text-center font-bold text-sm outline-none bg-transparent ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}
                          />
                          <button
                            onClick={() => increaseQuantity(item.cartItemId)}
                            className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${
                              isDarkMode 
                                ? 'bg-white/10 hover:bg-white/20 text-white' 
                                : 'bg-white hover:bg-gray-100 text-gray-900 border border-gray-200'
                            }`}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="text-right">
                          <p className={`text-xs sm:text-sm mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {formatPrice(item.price ?? 0)} × {item.quantity}
                          </p>
                          <p className={`text-lg sm:text-xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                            {formatPrice((item.price ?? 0) * (item.quantity ?? 1))}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Clear Cart Button - Mobile */}
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to clear the cart?')) {
                    clearCart();
                  }
                }}
                className={`w-full lg:hidden flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
                  isDarkMode 
                    ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30' 
                    : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                Clear Cart
              </button>
            </div>

            {/* Summary - Right Column */}
            <div className="lg:col-span-1">
              <div className={`rounded-xl p-6 sticky top-6 ${
                isDarkMode ? 'bg-gray-900/50 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'
              }`}>
                <h2 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Order Summary
                </h2>

                {/* Total */}
                <div className={`p-4 rounded-lg mb-6 ${
                  isDarkMode ? 'bg-yellow-400/10 border border-yellow-400/30' : 'bg-yellow-50 border border-yellow-200'
                }`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-sm font-semibold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                      Total Amount
                    </span>
                    <span className={`text-2xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                      {currencyInfo.symbol} {total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    *Current price may vary. Final price on request.
                  </p>
                </div>

                {/* Contact Details */}
                <div className="mb-6">
                  <h3 className={`text-sm font-bold uppercase tracking-wide mb-4 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Contact Details
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <Mail className="w-4 h-4" />
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={userInfo.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        className={`w-full px-4 py-3 rounded-lg text-sm transition-all outline-none ${
                          isDarkMode 
                            ? 'bg-black border border-white/20 text-white placeholder-gray-500 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400' 
                            : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <Phone className="w-4 h-4" />
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        name="mobile"
                        value={userInfo.mobile}
                        onChange={handleChange}
                        placeholder="+1234567890"
                        className={`w-full px-4 py-3 rounded-lg text-sm transition-all outline-none ${
                          isDarkMode 
                            ? 'bg-black border border-white/20 text-white placeholder-gray-500 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400' 
                            : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <Briefcase className="w-4 h-4" />
                        Project Name
                      </label>
                      <input
                        type="text"
                        name="project"
                        value={userInfo.project}
                        onChange={handleChange}
                        placeholder="Enter project name"
                        className={`w-full px-4 py-3 rounded-lg text-sm transition-all outline-none ${
                          isDarkMode 
                            ? 'bg-black border border-white/20 text-white placeholder-gray-500 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400' 
                            : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400'
                        }`}
                      />
                    </div>

                    {/* Region Selector for INR Currency */}
                    {currencyInfo.code === 'INR' && (
                      <div>
                        <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          <Package className="w-4 h-4" />
                          Select Region
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setSelectedRegion('delhi')}
                            className={`px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                              selectedRegion === 'delhi'
                                ? isDarkMode
                                  ? 'bg-yellow-500 text-black border-2 border-yellow-400'
                                  : 'bg-yellow-400 text-black border-2 border-yellow-500'
                                : isDarkMode
                                  ? 'bg-black border border-white/20 text-gray-300 hover:border-yellow-400'
                                  : 'bg-white border border-gray-300 text-gray-700 hover:border-yellow-400'
                            }`}
                          >
                            North (Delhi)
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedRegion('bangalore')}
                            className={`px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                              selectedRegion === 'bangalore'
                                ? isDarkMode
                                  ? 'bg-yellow-500 text-black border-2 border-yellow-400'
                                  : 'bg-yellow-400 text-black border-2 border-yellow-500'
                                : isDarkMode
                                  ? 'bg-black border border-white/20 text-gray-300 hover:border-yellow-400'
                                  : 'bg-white border border-gray-300 text-gray-700 hover:border-yellow-400'
                            }`}
                          >
                            South (Bangalore)
                          </button>
                        </div>
                        <p className={`mt-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {selectedRegion === 'delhi' 
                            ? '📍 Qlite Ltd - Gurgaon, Haryana' 
                            : '📍 Qlite Electronics Controls Pvt Ltd - Bengaluru, Karnataka'}
                        </p>
                      </div>
                    )}
                  </div>

                  {showError && (
                    <div className={`mt-4 p-3 rounded-lg flex items-start gap-2 ${
                      isDarkMode 
                        ? 'bg-red-500/10 border border-red-500/30 text-red-400' 
                        : 'bg-red-50 border border-red-200 text-red-700'
                    }`}>
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span className="text-xs">Please fill all details to download quotation.</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={exportPDF}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all"
                  >
                    <FileText className="w-5 h-5" />
                    Export to PDF
                  </button>

                  {/* Excel export - Available to all logged-in users */}
                  <button
                    onClick={exportExcel}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all"
                  >
                    <FileSpreadsheet className="w-5 h-5" />
                    Export to Excel
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to clear the cart?')) {
                        clearCart();
                      }
                    }}
                    className={`hidden lg:flex w-full items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
                      isDarkMode 
                        ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30' 
                        : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
                    }`}
                  >
                    <Trash2 className="w-5 h-5" />
                    Clear Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
