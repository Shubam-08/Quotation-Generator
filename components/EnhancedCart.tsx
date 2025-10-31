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
  Package, ArrowLeft, AlertCircle, CheckCircle2, X, Mail, Phone, Briefcase, MapPin
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
  const [selectedAddress, setSelectedAddress] = useState<'bahrain' | 'uae' | 'bangalore' | 'delhi'>('bahrain');
  const [discount, setDiscount] = useState(0); // Discount percentage (0-15%)
  const [showContactPopup, setShowContactPopup] = useState(false);

  // Calculate total in selected currency (not base INR price)
  const subtotal = cart.reduce((sum, item) => {
    const convertedPrice = convertPrice(item.price ?? 0);
    return sum + (convertedPrice * (item.quantity ?? 1));
  }, 0);
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount;
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
          ext: { width: 120, height: 135 }
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
    
    // Add column headers (optimized for PDF conversion)
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
    worksheet.getColumn(1).width = 6;  // SI No
    worksheet.getColumn(2).width = 12; // Image
    worksheet.getColumn(3).width = 18; // Model Number
    worksheet.getColumn(4).width = 30; // Description
    worksheet.getColumn(5).width = 15; // Category
    worksheet.getColumn(6).width = 15; // Application
    worksheet.getColumn(7).width = 12; // Input Voltage
    worksheet.getColumn(8).width = 8;  // Watt
    worksheet.getColumn(9).width = 10; // Lumen
    worksheet.getColumn(10).width = 10; // Beam Angle
    worksheet.getColumn(11).width = 10; // IP Rating
    worksheet.getColumn(12).width = 12; // Price
    worksheet.getColumn(13).width = 8;  // Quantity
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
      row.getCell(2).value = ''; // Image placeholder
      row.getCell(3).value = item.sku ?? 'N/A'; // Model Number
      row.getCell(4).value = ''; // Description - blank
      row.getCell(5).value = item.category ?? '-'; // Category
      row.getCell(6).value = item.application ?? '-'; // Application
      row.getCell(7).value = item.inputVoltage ?? '-'; // Input Voltage
      row.getCell(8).value = item.watt ? `${item.watt}W` : '-'; // Watt
      row.getCell(9).value = item.lumen ?? '-'; // Lumen
      row.getCell(10).value = item.beamAngle ?? '-'; // Beam Angle
      row.getCell(11).value = item.ipRating && item.ipRating.trim() !== '' ? item.ipRating : 'N/A'; // IP Rating
      row.getCell(12).value = convertPrice(item.price ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); // Price
      row.getCell(13).value = item.quantity ?? 1; // Quantity
      row.getCell(14).value = (convertPrice(item.price ?? 0) * (item.quantity ?? 1)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); // Total

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
              ext: { width: 70, height: 50 }
            });
          } catch (error) {
            console.error('Error adding image:', error);
          }
        }
      }
    }

    // Add empty row for spacing
    const emptyRowIndex = startRow + 1 + cart.length;
    
    // Add total row (after empty row)
    const totalRowIndex = emptyRowIndex + 1;
    const totalRow = worksheet.getRow(totalRowIndex);
    
    // Merge cells for total label
    worksheet.mergeCells(totalRowIndex, 12, totalRowIndex, 13);
    totalRow.getCell(12).value = `Total Amount (${excelCurrency}):`;
    totalRow.getCell(12).font = { bold: true, size: 14 };
    totalRow.getCell(12).alignment = { horizontal: 'right', vertical: 'middle' };
    
    // Total value
    totalRow.getCell(14).value = total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    totalRow.getCell(14).font = { bold: true, size: 14 };
    totalRow.getCell(14).alignment = { horizontal: 'left', vertical: 'middle' };

    // Set print options
    worksheet.pageSetup = {
      orientation: 'landscape',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: {
        left: 0.25,
        right: 0.25,
        top: 0.5,
        bottom: 0.5,
        header: 0.3,
        footer: 0.3
      }
    };

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

  // Get address based on user selection
  const getAddressInfo = () => {
    switch (selectedAddress) {
      case 'uae':
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
      case 'bangalore':
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
      case 'delhi':
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
      case 'bahrain':
      default:
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
    }
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
      convertPrice(item.price ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), 
      item.quantity ?? 1, 
      (convertPrice(item.price ?? 0) * (item.quantity ?? 1)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    ]);

    const cellPadding = { top: 6, right: 2, bottom: 6, left: 2 } as const;
    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 136,
      styles: { fontSize: 7, cellPadding, fontStyle: 'normal', valign: 'middle' },
      headStyles: { fillColor: [0, 0, 0], textColor: 255, fontStyle: 'bold', fontSize: 8 },
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
    const formattedTotal = total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const currencyDisplay = currencyInfo.symbol === '₹' ? 'INR' : currencyInfo.symbol;
    doc.text(`Total Amount: ${currencyDisplay} ${formattedTotal}`, rightX, finalY + 20, { align: 'right' });

    doc.save(`${userInfo.project}_quotation.pdf`);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-black' : 'bg-[#001f3f]'}`}>
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

      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* Header */}
        <div className="mb-3">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
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

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-7 h-7 text-yellow-400" />
              <div>
                <h1 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  My Quotations
                  {cart.length > 0 && (
                    <span className="ml-2 bg-yellow-400 text-black px-2 py-0.5 rounded-full text-xs font-bold">
                      {totalItems}
                    </span>
                  )}
                </h1>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Review and generate quotations
                </p>
              </div>
            </div>
          </div>
        </div>

        {cart.length === 0 ? (
          /* Empty Cart State */
          <div className={`rounded-xl p-8 sm:p-12 text-center ${
            isDarkMode ? 'bg-gray-900/50 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'
          }`}>
            <Package className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <h2 className={`text-xl sm:text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              No Products Added Yet
            </h2>
            <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Start by browsing our products and adding items to create your quotation
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
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
            {/* Cart Items - Left Column */}
            <div className="lg:col-span-3">
              {/* Products Count Header */}
              <div className={`mb-3 px-4 py-2 rounded-lg flex items-center justify-between ${
                isDarkMode ? 'bg-gray-900/30 border border-white/5' : 'bg-gray-50 border border-gray-200'
              }`}>
                <span className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {cart.length} Product{cart.length !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={() => {
                    if (confirm('Remove all products?')) {
                      clearCart();
                    }
                  }}
                  className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium text-xs transition-all ${
                    isDarkMode 
                      ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30' 
                      : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear All
                </button>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-2 gap-2">
              {cart.map((item) => (
                <div
                  key={item.cartItemId}
                  className={`rounded-lg p-2.5 transition-all ${
                    isDarkMode 
                      ? 'bg-white border border-gray-200 hover:border-yellow-400/50' 
                      : 'bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-yellow-400/50'
                  }`}
                >
                  <div className="flex flex-col gap-1.5">
                    {/* Product Image */}
                    <div className="w-20 h-20 mx-auto rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                      {(item.productImages?.length || item.images?.length) ? (
                        <img 
                          src={item.productImages?.[0] || item.images?.[0]} 
                          alt={item.sku} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start gap-1 mb-1">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-xs mb-0.5 truncate text-gray-900">
                            {item.sku}
                          </h3>
                          <p className="text-[10px] text-gray-600">
                            {item.category}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.cartItemId)}
                          className="p-1.5 rounded-md transition-all flex-shrink-0 hover:bg-red-100 text-red-600"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Product Specs */}
                      <div className="flex flex-wrap gap-1 mb-1.5">
                        {item.watt && item.watt !== '-' && (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700">
                            {item.watt}W
                          </span>
                        )}
                        {item.lumen && item.lumen !== '-' && (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700">
                            {item.lumen.toLowerCase().includes('lm') ? item.lumen : `${item.lumen}lm`}
                          </span>
                        )}
                        {item.ipRating && item.ipRating !== 'N/A' && (
                          <span className="inline-block bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                            {item.ipRating}
                          </span>
                        )}
                      </div>

                      {/* Quantity and Price */}
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-50 border border-gray-200">
                          <button
                            onClick={() => decreaseQuantity(item.cartItemId)}
                            className="w-6 h-6 rounded flex items-center justify-center transition-all hover:bg-gray-200 text-gray-900"
                          >
                            <Minus className="w-3 h-3" />
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
                            className="w-10 text-center font-bold text-xs outline-none bg-transparent text-gray-900"
                          />
                          <button
                            onClick={() => increaseQuantity(item.cartItemId)}
                            className="w-6 h-6 rounded flex items-center justify-center transition-all hover:bg-gray-200 text-gray-900"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="text-[10px] text-gray-500">
                            {formatPrice(item.price ?? 0)} × {item.quantity}
                          </p>
                          <p className="text-sm font-bold text-yellow-600">
                            {formatPrice((item.price ?? 0) * (item.quantity ?? 1))}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              </div>

              {/* Clear Cart Button - Mobile */}
              <button
                onClick={() => {
                  if (confirm('Remove all products?')) {
                    clearCart();
                  }
                }}
                className={`w-full sm:hidden mt-3 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  isDarkMode 
                    ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30' 
                    : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            </div>

            {/* Summary - Right Column */}
            <div className="lg:col-span-1">
              <div className={`rounded-lg p-4 sticky top-6 ${
                isDarkMode ? 'bg-gray-900/50 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'
              }`}>
                <h2 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Summary
                </h2>

                {/* Contact Details */}
                <div className="mb-4">
                  <h3 className={`text-xs font-bold uppercase tracking-wide mb-3 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Your Details
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className={`flex items-center gap-1.5 text-xs font-semibold mb-1.5 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <Mail className="w-3.5 h-3.5" />
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={userInfo.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        className={`w-full px-3 py-2 rounded-md text-xs transition-all outline-none ${
                          isDarkMode 
                            ? 'bg-black border border-white/20 text-white placeholder-gray-500 focus:border-yellow-400' 
                            : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-yellow-400'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`flex items-center gap-1.5 text-xs font-semibold mb-1.5 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <Phone className="w-3.5 h-3.5" />
                        Mobile
                      </label>
                      <input
                        type="tel"
                        name="mobile"
                        value={userInfo.mobile}
                        onChange={handleChange}
                        placeholder="+1234567890"
                        className={`w-full px-3 py-2 rounded-md text-xs transition-all outline-none ${
                          isDarkMode 
                            ? 'bg-black border border-white/20 text-white placeholder-gray-500 focus:border-yellow-400' 
                            : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-yellow-400'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`flex items-center gap-1.5 text-xs font-semibold mb-1.5 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <Briefcase className="w-3.5 h-3.5" />
                        Project
                      </label>
                      <input
                        type="text"
                        name="project"
                        value={userInfo.project}
                        onChange={handleChange}
                        placeholder="Project name"
                        className={`w-full px-3 py-2 rounded-md text-xs transition-all outline-none ${
                          isDarkMode 
                            ? 'bg-black border border-white/20 text-white placeholder-gray-500 focus:border-yellow-400' 
                            : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-yellow-400'
                        }`}
                      />
                    </div>

                    {/* Address Selector */}
                    <div>
                      <label className={`flex items-center gap-1.5 text-xs font-semibold mb-1.5 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <Package className="w-3.5 h-3.5" />
                        Select Address
                      </label>
                      <select
                        value={selectedAddress}
                        onChange={(e) => setSelectedAddress(e.target.value as 'bahrain' | 'uae' | 'bangalore' | 'delhi')}
                        className={`w-full px-3 py-2 rounded-md text-xs transition-all outline-none cursor-pointer ${
                          isDarkMode 
                            ? 'bg-black border border-white/20 text-white focus:border-yellow-400' 
                            : 'bg-white border border-gray-300 text-gray-900 focus:border-yellow-400'
                        }`}
                      >
                        <option value="bahrain">Bahrain</option>
                        <option value="uae">UAE (Dubai)</option>
                        <option value="bangalore">India - Bangalore</option>
                        <option value="delhi">India - Delhi</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Final Total */}
                <div className={`p-3 rounded-lg mb-4 ${
                  isDarkMode ? 'bg-yellow-400/10 border border-yellow-400/30' : 'bg-yellow-50 border border-yellow-200'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-semibold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                      Final Total
                    </span>
                    <span className={`text-xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                      {currencyInfo.symbol} {total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Discount Slider */}
                <div className="mb-4">
                  <h3 className={`text-xs font-bold uppercase tracking-wide mb-3 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Apply Discount
                  </h3>
                  <div className={`p-3 rounded-lg ${
                    isDarkMode ? 'bg-gray-800/50 border border-white/10' : 'bg-gray-50 border border-gray-200'
                  }`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-xs font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Discount (0-15%)
                      </span>
                      <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {discount}%
                      </span>
                    </div>
                    
                    <input
                      type="range"
                      min="0"
                      max="15"
                      step="1"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                    />
                    <div className="flex justify-between mt-1 mb-3">
                      <span className={`text-[10px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>0%</span>
                      <span className={`text-[10px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>15%</span>
                    </div>
                    
                    {discount > 0 && (
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Savings:
                        </span>
                        <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          -{currencyInfo.symbol} {discountAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}
                    
                    <button
                      onClick={() => setShowContactPopup(true)}
                      className={`w-full py-2.5 px-4 rounded-md font-bold text-xs transition-all border-2 ${
                        isDarkMode 
                          ? 'bg-white text-black border-white hover:bg-gray-100' 
                          : 'bg-black text-white border-black hover:bg-gray-800'
                      }`}
                    >
                     Need a personalized quote? Contact our team
                    </button>
                  </div>

                  {showError && (
                    <div className={`mt-3 p-2 rounded-md flex items-start gap-2 ${
                      isDarkMode 
                        ? 'bg-red-500/10 border border-red-500/30 text-red-400' 
                        : 'bg-red-50 border border-red-200 text-red-700'
                    }`}>
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      <span className="text-[10px]">Fill all fields to download</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={exportPDF}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold text-sm transition-all"
                  >
                    <FileText className="w-4 h-4" />
                    PDF
                  </button>

                  <button
                    onClick={exportExcel}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-md font-semibold text-sm transition-all"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    Excel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contact Popup Modal */}
      {showContactPopup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`max-w-2xl w-full rounded-xl ${
            isDarkMode ? 'bg-gray-900 border border-white/10' : 'bg-white border border-gray-200 shadow-lg'
          }`}>
            {/* Header */}
            <div className={`p-6 border-b ${
              isDarkMode ? 'border-white/10' : 'border-gray-200'
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Contact Sales Team
                  </h3>
                  <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Get in touch for bulk pricing and custom requirements
                  </p>
                </div>
                <button
                  onClick={() => setShowContactPopup(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
            
            <div className="space-y-6">
              {/* Middle East Section */}
              <div>
                <h4 className={`font-bold text-sm mb-3 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  <MapPin className="w-4 h-4 text-yellow-400" />
                  Middle East
                </h4>
                <div className={`p-4 rounded-lg border ${
                  isDarkMode ? 'bg-gray-800/50 border-white/10' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                      <a href="mailto:jignesh@qliteglobal.com" className={`hover:text-yellow-400 transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        jignesh@qliteglobal.com
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                      <a href="mailto:amit@qliteglobal.com" className={`hover:text-yellow-400 transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        amit@qliteglobal.com
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                      <a href="mailto:kunal@qliteglobal.com" className={`hover:text-yellow-400 transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        kunal@qliteglobal.com
                      </a>
                    </div>
                    
                  </div>
                </div>
              </div>

              {/* India Section */}
              <div>
                <h4 className={`font-bold text-sm mb-3 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  <MapPin className="w-4 h-4 text-yellow-400" />
                  India
                </h4>
                <div className="space-y-3">
                  {/* Bangalore */}
                  <div className={`p-4 rounded-lg border ${
                    isDarkMode ? 'bg-gray-800/50 border-white/10' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className={`text-xs font-semibold mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Bangalore
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                      <a href="mailto:revant@qliteglobal.com" className={`hover:text-yellow-400 transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        revant@qliteglobal.com
                      </a>
                    </div>
                  </div>

                  {/* Delhi */}
                  <div className={`p-4 rounded-lg border ${
                    isDarkMode ? 'bg-gray-800/50 border-white/10' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className={`text-xs font-semibold mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Delhi
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                      <span className={`${isDarkMode ? 'text-gray-500 italic' : 'text-gray-400 italic'}`}>
                        Contact information coming soon
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`mt-4 p-3 rounded-lg text-center ${
              isDarkMode ? 'bg-gray-800/50 border border-white/10' : 'bg-gray-50 border border-gray-200'
            }`}>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Our sales team typically responds within the business hours
              </p>
            </div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}
