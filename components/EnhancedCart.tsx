'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useSession } from 'next-auth/react';
import CurrencySelector from './CurrencySelector';
import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import autoTable, { CellHookData } from 'jspdf-autotable';
import { 
  ShoppingCart, Trash2, Plus, Minus, FileText, FileSpreadsheet, 
  Package, ArrowLeft, AlertCircle, CheckCircle2, X, Mail, Phone, Briefcase, MapPin, Zap, Search, Settings, Lock, Unlock
} from 'lucide-react';
import Link from 'next/link';
import { renderFormFields as renderLedDisplayFormFields } from '@/app/admin/led-displays/form-content';

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
}

interface Driver {
  _id: string;
  sku: string;
  name: string;
  description?: string;
  series?: string;
  price: number;
  wattageRange?: { min: number; max: number };
  outputVoltage?: string;
  outputCurrent?: string;
  inputVoltage?: string;
  ipRating?: string;
  type?: string;
  category?: string;
  images?: string[];
  productImages?: string[];
}

type CartItem = Product & { 
  quantity: number; 
  name?: string; 
  cartItemId: string;
  isDriver?: boolean;
  parentProductId?: string;
  // Driver-specific fields
  wattageRange?: { min: number; max: number };
  outputVoltage?: string;
  outputCurrent?: string;
  type?: string;
  series?: string;
  customTotalConverted?: number;
  // Spare and accessory fields
  spareModules?: string | number;
  sparePSU?: string | number;
  spareReceivingCard?: string | number;
  package?: string;
  novastarController?: string;
};

const isDisplayItem = (item: CartItem) => {
  const category = item.category?.toLowerCase() || '';
  return category.includes('display') || !!item.pixelPitch || typeof item.sqft === 'number';
};

export default function EnhancedCart() {
  const { cart, removeFromCart, clearCart, increaseQuantity, decreaseQuantity, updateQuantity, addDriverToCart, updateCartItem } = useCart() as {
    cart: CartItem[];
    removeFromCart: (id: string) => void;
    clearCart: () => void;
    increaseQuantity: (id: string) => void;
    decreaseQuantity: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    addDriverToCart: (driver: Driver, parentProductId: string, quantity?: number) => void;
    updateCartItem: (cartItemId: string, updates: Partial<CartItem>) => void;
  };
  const { formatPrice, convertPrice, currencyInfo } = useCurrency();
  const { data: session } = useSession();
  
  // Check if user is admin
  const isAdmin = session?.user?.role === 'admin';

  const [userInfo, setUserInfo] = useState({ email: '', mobile: '', project: '', company: '', subject: '', invoiceNo: '' });
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [editingQuantity, setEditingQuantity] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<'bahrain' | 'uae' | 'bangalore' | 'delhi'>('bahrain');
  const [discount, setDiscount] = useState(0); // Discount percentage (0-15%)
  const [showContactPopup, setShowContactPopup] = useState(false);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [selectedProductForDriver, setSelectedProductForDriver] = useState<CartItem | null>(null);
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [editingDisplay, setEditingDisplay] = useState<CartItem | null>(null);
  const [displayFormData, setDisplayFormData] = useState<any | null>(null);
  // Password lock for Price Calculation editing
  const [priceEditUnlocked, setPriceEditUnlocked] = useState(false);
  const [showPriceEditModal, setShowPriceEditModal] = useState(false);
  const [priceEditPassword, setPriceEditPassword] = useState('');
  const [priceEditError, setPriceEditError] = useState('');
  const PRICE_EDIT_PASSWORD = 'Qlitescreen2025';
  
  // Driver search state
  const [driverSearchTerm, setDriverSearchTerm] = useState('');
  
  // Terms and Conditions state
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAndConditions, setTermsAndConditions] = useState({
    deliveryLocation: 'DDP Bahrain',
    deliveryTime: '8-10 Weeks',
    paymentTerms: '50% advance and balance 50% on delivery',
    productMake: 'Qlite UK make',
    validityDays: '45 days',
    vatNote: 'VAT will charged as per applicable government regulations',
    salesPersonName: ''
  });

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

  // Update delivery location when address changes
  useEffect(() => {
    updateDeliveryLocation(selectedAddress);
  }, [selectedAddress]);

  const handleCloseDisplayEdit = () => {
    setEditingDisplay(null);
    setDisplayFormData(null);
    setPriceEditUnlocked(false);
    setShowPriceEditModal(false);
    setPriceEditPassword('');
    setPriceEditError('');
  };

  const handleSaveDisplayEdit = () => {
    if (!editingDisplay || !displayFormData) return;

    const updates: Partial<CartItem> = {
      category: displayFormData.category,
      application: displayFormData.application,
      ipRating: displayFormData.ipRating,
      pixelPitch: displayFormData.pixelPitch,
      totalResolution: displayFormData.totalResolution,
      sqft: displayFormData.sqft,
      price: displayFormData.price,
      images: displayFormData.images,
      productImages: displayFormData.productImages,
      moduleSpecs: displayFormData.moduleSpecs,
      cabinetSpecs: displayFormData.cabinetSpecs,
      screenParams: displayFormData.screenParams,
      // Include editable calculation fields
      requiredLength: displayFormData.requiredLength,
      requiredWidth: displayFormData.requiredWidth,
      cabinetRequired: displayFormData.cabinetRequired,
      customTotalConverted: displayFormData.customTotalConverted,
      // Spare and accessory fields
      spareModules: displayFormData.spareModules,
      sparePSU: displayFormData.sparePSU,
      spareReceivingCard: displayFormData.spareReceivingCard,
      package: displayFormData.package,
      novastarController: displayFormData.novastarController,
    };

    updateCartItem(editingDisplay.cartItemId, updates);
    handleCloseDisplayEdit();
  };

  // Fetch all available drivers for a product
  const fetchDriversForProduct = async (product: CartItem) => {
    setLoadingDrivers(true);
    setSelectedProductForDriver(product);
    setShowDriverModal(true);
    
    // Reset search when opening modal
    setDriverSearchTerm('');
    
    try {
      // Fetch all in-stock drivers without filtering by wattage
      const response = await fetch(`/api/drivers`);
      if (!response.ok) throw new Error('Failed to fetch drivers');
      
      const drivers = await response.json();
      setAvailableDrivers(drivers);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      setAvailableDrivers([]);
    } finally {
      setLoadingDrivers(false);
    }
  };

  const handleAddDriver = (driver: Driver) => {
    if (selectedProductForDriver) {
      addDriverToCart(driver, selectedProductForDriver.cartItemId, 1);
      setShowDriverModal(false);
      // Reset search when closing
      setDriverSearchTerm('');
    }
  };
  
  const handleCloseDriverModal = () => {
    setShowDriverModal(false);
    // Reset search when closing
    setDriverSearchTerm('');
  };

  // Helper function to extract numeric IP rating from string (e.g., "IP67" -> 67)
  const getNumericIPRating = (ipRating: string | undefined): number => {
    if (!ipRating) return 0;
    const match = ipRating.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };

  // Filter and categorize drivers by IP rating with search
  const categorizeDrivers = () => {
    let filtered = [...availableDrivers];
    
    // Apply search filter
    if (driverSearchTerm.trim()) {
      const searchLower = driverSearchTerm.toLowerCase();
      filtered = filtered.filter(driver => 
        driver.name?.toLowerCase().includes(searchLower) ||
        driver.sku?.toLowerCase().includes(searchLower) ||
        driver.series?.toLowerCase().includes(searchLower) ||
        driver.description?.toLowerCase().includes(searchLower) ||
        driver.outputVoltage?.toLowerCase().includes(searchLower) ||
        driver.type?.toLowerCase().includes(searchLower) ||
        driver.wattageRange && `${driver.wattageRange.min}-${driver.wattageRange.max}w`.includes(searchLower)
      );
    }
    
    // Categorize by IP rating
    const indoor: Driver[] = [];
    const outdoor: Driver[] = [];
    
    filtered.forEach(driver => {
      const ipValue = getNumericIPRating(driver.ipRating);
      if (ipValue <= 64) {
        indoor.push(driver);
      } else {
        outdoor.push(driver);
      }
    });
    
    return { indoor, outdoor };
  };

  // Get drivers associated with a product
  const getDriversForProduct = (productCartItemId: string) => {
    return cart.filter(item => item.isDriver && item.parentProductId === productCartItemId);
  };

  // Separate products and standalone drivers
  const products = cart.filter(item => !item.isDriver);
  const standaloneDrivers = cart.filter(item => item.isDriver && !item.parentProductId);

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

    // Add company address on the right side aligned with table end (column 9)
    let currentRow = 1;
    addressInfo.lines.forEach((line, index) => {
      const row = worksheet.getRow(currentRow);
      row.getCell(9).value = line;
      row.getCell(9).font = { bold: true, size: index === 0 ? 11 : 9 };
      row.getCell(9).alignment = { horizontal: 'right', vertical: 'middle' };
      currentRow++;
    });
    
    // Add contact details, date, and invoice below the address
    const currentDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    
    // Add a blank row for spacing
    currentRow++;
    
    // Contact No
    worksheet.getRow(currentRow).getCell(9).value = `Contact No: ${userInfo.mobile || ''}`;
    worksheet.getRow(currentRow).getCell(9).font = { bold: true, size: 9 };
    worksheet.getRow(currentRow).getCell(9).alignment = { horizontal: 'right', vertical: 'middle' };
    currentRow++;
    
    // Date
    worksheet.getRow(currentRow).getCell(9).value = `Date: ${currentDate}`;
    worksheet.getRow(currentRow).getCell(9).font = { bold: true, size: 9 };
    worksheet.getRow(currentRow).getCell(9).alignment = { horizontal: 'right', vertical: 'middle' };
    currentRow++;
    
    // Invoice No
    worksheet.getRow(currentRow).getCell(9).value = `Invoice No: ${userInfo.invoiceNo || ''}`;
    worksheet.getRow(currentRow).getCell(9).font = { bold: true, size: 9 };
    worksheet.getRow(currentRow).getCell(9).alignment = { horizontal: 'right', vertical: 'middle' };

    // Create bordered summary box below logo - Left side only
    const summaryStartRow = addressInfo.lines.length + 2;
    const summaryEndRow = summaryStartRow + 2; // 3 rows for the box
    
    // Left section (columns 1-7): Attn, Company, Subject
    worksheet.getRow(summaryStartRow).getCell(1).value = 'Attn:';
    worksheet.getRow(summaryStartRow).getCell(1).font = { bold: true, size: 10 };
    worksheet.getRow(summaryStartRow).getCell(2).value = userInfo.project || '';
    worksheet.getRow(summaryStartRow).getCell(2).font = { bold: true, size: 10 };
    
    worksheet.getRow(summaryStartRow + 1).getCell(1).value = 'Company:';
    worksheet.getRow(summaryStartRow + 1).getCell(1).font = { bold: true, size: 10 };
    worksheet.getRow(summaryStartRow + 1).getCell(2).value = userInfo.company || '';
    worksheet.getRow(summaryStartRow + 1).getCell(2).font = { bold: true, size: 10 };
    
    worksheet.getRow(summaryStartRow + 2).getCell(1).value = 'Subject:';
    worksheet.getRow(summaryStartRow + 2).getCell(1).font = { bold: true, size: 10 };
    worksheet.getRow(summaryStartRow + 2).getCell(2).value = userInfo.subject || '';
    worksheet.getRow(summaryStartRow + 2).getCell(2).font = { bold: true, size: 10 };
    
    // Set row heights for summary box (no borders)
    for (let row = summaryStartRow; row <= summaryEndRow; row++) {
      worksheet.getRow(row).height = 20;
      // Set alignment for all cells in the row
      for (let col = 1; col <= 7; col++) {
        const cell = worksheet.getRow(row).getCell(col);
        cell.alignment = { vertical: 'middle' };
      }
    }

    const excelCurrency = currencyInfo.symbol === '₹' ? 'INR' : currencyInfo.symbol;
    const startRow = addressInfo.lines.length + 6; // Adjusted for new header layout
    
    // Add column headers (optimized for PDF conversion)
    const headerRow = worksheet.getRow(startRow);
    const columns = [
      'SI No','Type','Description','Image','Code','Description',`QTY`,`Unit Rate (${excelCurrency})`,`Total (${excelCurrency})`
    ];
    columns.forEach((col, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.value = col;
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0046FF' }
      };
      // Add borders to header cells
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });
    headerRow.height = 20;

    // Set column widths
    worksheet.getColumn(1).width = 8;  // SI No
    worksheet.getColumn(2).width = 12; // Type (blank)
    worksheet.getColumn(3).width = 25; // Description (Category)
    worksheet.getColumn(4).width = 15; // Image
    worksheet.getColumn(5).width = 20; // Code (Model Number)
    worksheet.getColumn(6).width = 25; // Description (blank)
    worksheet.getColumn(7).width = 10; // QTY
    worksheet.getColumn(8).width = 15; // Unit Rate
    worksheet.getColumn(9).width = 15; // Total

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

    // Reorganize cart to group drivers with their parent products
    const organizedCartExcel: CartItem[] = [];
    cart.forEach(item => {
      if (!item.isDriver) {
        // Add product
        organizedCartExcel.push(item);
        // Add its drivers right after
        const productDrivers = cart.filter(d => d.isDriver && d.parentProductId === item.cartItemId);
        organizedCartExcel.push(...productDrivers);
      }
    });
    // Add any standalone drivers (without parent)
    const standaloneDriversExcel = cart.filter(item => item.isDriver && !item.parentProductId);
    organizedCartExcel.push(...standaloneDriversExcel);

    // Add data rows with images (including drivers)
    let serialNumber = 1;
    let currentRowIndex = startRow + 1; // Start after header row
    
    for (let i = 0; i < organizedCartExcel.length; i++) {
      const item = organizedCartExcel[i];
      
      if (item.isDriver) {
        // DRIVER: single row with merged specs
        const rowIndex = currentRowIndex;
        const row = worksheet.getRow(rowIndex);
        row.height = 60;
        
        row.getCell(1).value = serialNumber; // SI No
        row.getCell(2).value = item.sku ?? 'N/A'; // Type (Model Number for drivers)
        
        // Build driver specs
        const parts: string[] = [];
        if (item.wattageRange) parts.push(`Power: ${item.wattageRange.min}W`);
        if (item.outputVoltage) parts.push(`Output: ${item.outputVoltage}`);
        if ((item as any).outputCurrent) parts.push(`Current: ${(item as any).outputCurrent}`);
        if (item.inputVoltage) parts.push(`Input: ${item.inputVoltage}`);
        if ((item as any).ipRating) parts.push(`IP: ${(item as any).ipRating}`);
        if ((item as any).type) parts.push(`Type: ${(item as any).type}`);
        const specText = parts.join(' | ');

        // Merge columns 3-6 for specs
        row.getCell(3).value = specText;
        for (let c = 4; c <= 6; c++) row.getCell(c).value = '';
        worksheet.mergeCells(rowIndex, 3, rowIndex, 6);
        
        row.getCell(7).value = item.quantity ?? 1; // QTY
        row.getCell(8).value = convertPrice(item.price ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); // Unit Rate
        row.getCell(9).value = (convertPrice(item.price ?? 0) * (item.quantity ?? 1)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); // Total

        // Add borders
        for (let col = 1; col <= 9; col++) {
          const cell = row.getCell(col);
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.font = { bold: true, size: 9 };
        }
        
        currentRowIndex++;
        serialNumber++;
      } else {
        // LED PRODUCT: Single row with each cell merged vertically across 2 rows
        const row1Index = currentRowIndex;
        const row2Index = row1Index + 1;
        
        const row1 = worksheet.getRow(row1Index);
        const row2 = worksheet.getRow(row2Index);
        row1.height = 50;
        row2.height = 50;
        
        // SI No - merge 2 rows vertically
        row1.getCell(1).value = serialNumber;
        worksheet.mergeCells(row1Index, 1, row2Index, 1);
        
        // Type - merge 2 rows vertically (blank for LED)
        row1.getCell(2).value = '';
        worksheet.mergeCells(row1Index, 2, row2Index, 2);
        
        // Description (Category) - merge 2 rows vertically
        row1.getCell(3).value = item.category ?? '-';
        worksheet.mergeCells(row1Index, 3, row2Index, 3);
        
        // Image - merge 2 rows vertically
        row1.getCell(4).value = '';
        worksheet.mergeCells(row1Index, 4, row2Index, 4);
        
        // Code (Model Number) - merge 2 rows vertically
        row1.getCell(5).value = item.sku ?? 'N/A';
        worksheet.mergeCells(row1Index, 5, row2Index, 5);
        
        // Description (blank) - merge 2 rows vertically
        row1.getCell(6).value = '';
        worksheet.mergeCells(row1Index, 6, row2Index, 6);
        
        // QTY - merge 2 rows vertically
        row1.getCell(7).value = item.quantity ?? 1;
        worksheet.mergeCells(row1Index, 7, row2Index, 7);
        
        // Unit Rate - merge 2 rows vertically
        row1.getCell(8).value = convertPrice(item.price ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        worksheet.mergeCells(row1Index, 8, row2Index, 8);
        
        // Total - merge 2 rows vertically
        row1.getCell(9).value = (convertPrice(item.price ?? 0) * (item.quantity ?? 1)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        worksheet.mergeCells(row1Index, 9, row2Index, 9);
        
        // Add borders to all cells in both rows
        for (let r = row1Index; r <= row2Index; r++) {
          for (let col = 1; col <= 9; col++) {
            const cell = worksheet.getRow(r).getCell(col);
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.font = { bold: true, size: 9, color: { argb: 'FF000000' } };
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFFFFFF' }
            };
          }
        }
        
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
                tl: { col: 3, row: row1Index - 1 },
                ext: { width: 70, height: 70 },
                editAs: 'oneCell'
              });
            } catch (error) {
              console.error('Error adding image:', error);
            }
          }
        }
        
        currentRowIndex += 2; // Move by 2 rows for LED products
        serialNumber++;
      }
    }

    // Add empty row for spacing
    const emptyRowIndex = currentRowIndex + 1;
    
    // Add total row (after empty row)
    const totalRowIndex = emptyRowIndex + 1;
    const totalRow = worksheet.getRow(totalRowIndex);
    
    // Merge cells for total label
    worksheet.mergeCells(totalRowIndex, 7, totalRowIndex, 8);
    totalRow.getCell(7).value = `Total Amount (${excelCurrency}):`;
    totalRow.getCell(7).font = { bold: true, size: 14 };
    totalRow.getCell(7).alignment = { horizontal: 'right', vertical: 'middle' };
    totalRow.getCell(7).border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
    
    // Total value
    totalRow.getCell(9).value = total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    totalRow.getCell(9).font = { bold: true, size: 14 };
    totalRow.getCell(9).alignment = { horizontal: 'left', vertical: 'middle' };
    totalRow.getCell(9).border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };

    // Add Terms and Conditions
    const termsStartRow = totalRowIndex + 3;
    worksheet.getRow(termsStartRow).getCell(1).value = 'Terms and Conditions:';
    worksheet.getRow(termsStartRow).getCell(1).font = { bold: true, size: 11, underline: true };
    // Merge cells for header
    worksheet.mergeCells(termsStartRow, 1, termsStartRow, 9);
    
    const terms = [
      `1. The prices quoted on ${termsAndConditions.deliveryLocation}.`,
      `2. Delivery: Within ${termsAndConditions.deliveryTime} from the date of PO and advance payment.`,
      `3. Payment Terms: ${termsAndConditions.paymentTerms}.`,
      `4. The quoted products are ${termsAndConditions.productMake}`,
      `5. Validity of offer: ${termsAndConditions.validityDays}`,
      `6. ${termsAndConditions.vatNote}`
    ];
    
    terms.forEach((term, index) => {
      const rowNum = termsStartRow + index + 1;
      const row = worksheet.getRow(rowNum);
      row.getCell(1).value = term;
      row.getCell(1).font = { bold: true, size: 9 };
      row.getCell(1).alignment = { wrapText: true, vertical: 'middle' };
      // Merge 3 cells for each term line (columns 1-3)
      worksheet.mergeCells(rowNum, 1, rowNum, 3);
      row.height = 25; // Set row height for better readability
    });
    
    // Add closing
    const closingRow = termsStartRow + terms.length + 2;
    worksheet.getRow(closingRow).getCell(1).value = 'Thanking You';
    worksheet.getRow(closingRow).getCell(1).font = { bold: true, size: 10 };
    
    worksheet.getRow(closingRow + 2).getCell(1).value = 'Yours Sincerely';
    worksheet.getRow(closingRow + 2).getCell(1).font = { bold: true, size: 10 };
    
    if (termsAndConditions.salesPersonName) {
      worksheet.getRow(closingRow + 4).getCell(1).value = termsAndConditions.salesPersonName;
      worksheet.getRow(closingRow + 4).getCell(1).font = { bold: true, size: 10 };
    }

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
  // Update delivery location based on selected address
  const updateDeliveryLocation = (address: 'bahrain' | 'uae' | 'bangalore' | 'delhi') => {
    const locationMap = {
      'bahrain': 'DDP Bahrain',
      'uae': 'DDP Dubai, UAE',
      'bangalore': 'DDP Bangalore, India',
      'delhi': 'DDP Delhi, India'
    };
    setTermsAndConditions(prev => ({
      ...prev,
      deliveryLocation: locationMap[address]
    }));
  };
  
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

    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginRight = 20;
    const rightX = pageWidth - marginRight;

    doc.addImage('/logo.jpg', 'JPEG', 14, 10, 80, 90);

    // Get dynamic address based on currency
    const addressInfo = getAddressInfo();
    
    // Add company name (first line) - BOLD and LARGER
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    let yPosition = 25;
    doc.text(addressInfo.lines[0], rightX, yPosition, { align: 'right' });
    yPosition += 15;
    
    // Add remaining address lines - slightly larger font
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    for (let i = 1; i < addressInfo.lines.length; i++) {
      doc.text(addressInfo.lines[i], rightX, yPosition, { align: 'right' });
      yPosition += 12;
    }

    // Compute total for PDF using overrides/area logic
    const FEET_TO_METER = 0.3048;
    const computeItemTotalConverted = (item: CartItem): number => {
      const qty = item.quantity ?? 1;
      const overridden = (item as any).customTotalConverted;
      if (typeof overridden === 'number' && overridden > 0) return overridden;
      if (isDisplayItem(item)) {
        const lenFt = parseFloat((item as any)?.requiredLength ?? '');
        const widFt = parseFloat((item as any)?.requiredWidth ?? '');
        if (!isNaN(lenFt) && !isNaN(widFt) && lenFt > 0 && widFt > 0) {
          const lenM = lenFt * FEET_TO_METER;
          const widM = widFt * FEET_TO_METER;
          const areaSqm = lenM * widM;
          const unitUSD = (item.price ?? 0) * areaSqm;
          const unitConv = convertPrice(unitUSD);
          return unitConv * qty;
        }
      }
      return convertPrice(item.price ?? 0) * qty;
    };
    const pdfTotal = cart.reduce((sum, item) => sum + computeItemTotalConverted(item), 0);

    // Add two boxes side by side (appearing as one)
    const boxX = 14;
    const boxY = 105;
    const totalWidth = pageWidth - 28;
    const leftBoxWidth = totalWidth / 2;
    const rightBoxWidth = totalWidth / 2;
    const boxHeight = 50;
    const rowHeight = boxHeight / 3; // 3 rows
    
    doc.setLineWidth(1);
    doc.setDrawColor(0, 0, 0);
    
    // Draw outer border
    doc.rect(boxX, boxY, totalWidth, boxHeight);
    
    // Draw vertical line separating left and right sections
    doc.line(boxX + leftBoxWidth, boxY, boxX + leftBoxWidth, boxY + boxHeight);
    
    // Draw horizontal lines for rows (2 lines to create 3 rows)
    doc.line(boxX, boxY + rowHeight, boxX + totalWidth, boxY + rowHeight);
    doc.line(boxX, boxY + (rowHeight * 2), boxX + totalWidth, boxY + (rowHeight * 2));
    
    // Left box content
    const leftX = boxX + 8;
    let leftY = boxY + 12;
    const lineHeight = rowHeight;
    const labelWidth = 50;
    
    doc.setFontSize(9);
    
    // Attn
    doc.setFont('helvetica', 'bold');
    doc.text('Attn:', leftX, leftY);
    doc.setFont('helvetica', 'normal');
    doc.text(userInfo.project || '', leftX + labelWidth, leftY);
    leftY += lineHeight;
    
    // Company
    doc.setFont('helvetica', 'bold');
    doc.text('Company:', leftX, leftY);
    doc.setFont('helvetica', 'normal');
    doc.text(userInfo.company || '', leftX + labelWidth, leftY);
    leftY += lineHeight;
    
    // Subject
    doc.setFont('helvetica', 'bold');
    doc.text('Subject:', leftX, leftY);
    doc.setFont('helvetica', 'normal');
    doc.text(userInfo.subject || '', leftX + labelWidth, leftY);
    
    // Right box content
    const rightColX = boxX + leftBoxWidth + 8;
    let rightY = boxY + 12;
    
    // Contact No
    doc.setFont('helvetica', 'bold');
    doc.text('Contact No:', rightColX, rightY);
    doc.setFont('helvetica', 'normal');
    doc.text(userInfo.mobile || '', rightColX + labelWidth, rightY);
    rightY += lineHeight;
    
    // Date
    doc.setFont('helvetica', 'bold');
    doc.text('Date:', rightColX, rightY);
    doc.setFont('helvetica', 'normal');
    const currentDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    doc.text(currentDate, rightColX + labelWidth, rightY);
    rightY += lineHeight;
    
    // Invoice No
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice No:', rightColX, rightY);
    doc.setFont('helvetica', 'normal');
    doc.text(userInfo.invoiceNo || '', rightColX + labelWidth, rightY);

    const pdfCurrency = currencyInfo.symbol === '₹' ? 'INR' : currencyInfo.symbol;
    const columns = [
      'SI No','Image','Model Number','Category','Application','Input Voltage','Watt','Lumen','Beam Angle','IP Rating',`Price (${pdfCurrency})`,'Quantity',`Total (${pdfCurrency})`
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
      
      // For external images (Cloudinary, etc.), use server-side proxy to avoid CORS
      if (u.includes('cloudinary.com') || u.includes('res.cloudinary')) {
        try {
          const res = await fetch('/api/resolve-image', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ url: u, returnDataUrl: true }) 
          });
          
          if (res.ok) {
            const data = await res.json();
            if (data?.dataUrl) {
              return data.dataUrl;
            }
          }
          throw new Error('Proxy failed to return dataUrl');
        } catch (error) {
          console.error('Proxy fetch failed:', error);
          throw error;
        }
      }
      
      // For other URLs, try direct CORS fetch
      const res = await fetch(u, { mode: 'cors' });
      const blob = await res.blob();
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    };

    // Reorganize cart to group drivers with their parent products
    const organizedCart: CartItem[] = [];
    cart.forEach(item => {
      if (!item.isDriver) {
        // Add product
        organizedCart.push(item);
        // Add its drivers right after
        const productDrivers = cart.filter(d => d.isDriver && d.parentProductId === item.cartItemId);
        organizedCart.push(...productDrivers);
      }
    });
    // Add any standalone drivers (without parent)
    const standaloneDrivers = cart.filter(item => item.isDriver && !item.parentProductId);
    organizedCart.push(...standaloneDrivers);

    const imageDataUrls = await Promise.all(
      organizedCart.map(async (item) => {
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

    // Check if cart contains LED Displays
    const hasDisplays = organizedCart.some(item => !item.isDriver && isDisplayItem(item));
    const hasLights = organizedCart.some(item => !item.isDriver && !isDisplayItem(item));

    // If we have LED Displays, we need to render them differently
    if (hasDisplays && !hasLights) {
      // ALL LED DISPLAYS - Use vertical layout for each display
      let currentY = 170; // start below the header box (which ends at ~155)
      const pageHeight = doc.internal.pageSize.height;
      
      for (let i = 0; i < organizedCart.length; i++) {
        const item = organizedCart[i];
        if (item.isDriver) continue; // Skip drivers for now

        const boxX = 14;
        const boxWidth = pageWidth - 28;
        const leftColWidth = boxWidth * 0.75; // 75% for specs
        const rightColWidth = boxWidth * 0.25; // 25% for image

        const asAny = item as any;

        // Define all fields for LED Display including Module, Cabinet and Screen specs,
        // grouped into sections matching the admin panel order
        type DisplayField = { label: string; value: string; isSection?: boolean; rightLabel?: string; rightValue?: string };

        // Helper function to pair items into two columns
        const pairItems = (items: DisplayField[]): DisplayField[] => {
          const paired: DisplayField[] = [];
          const leftCount = Math.ceil(items.length / 2);
          for (let idx = 0; idx < leftCount; idx++) {
            const left = items[idx];
            const right = items[leftCount + idx];
            paired.push({
              label: left.label,
              value: left.value,
              rightLabel: right?.label,
              rightValue: right?.value,
            });
          }
          return paired;
        };

        // Basic Information items (10 items -> 5 left, 5 right)
        const basicInfoItems: DisplayField[] = [
          { label: 'SI No', value: (i + 1).toString() },
          { label: 'Model Number', value: item.sku ?? 'N/A' },
          { label: 'Category', value: item.category ?? 'N/A' },
          { label: 'Application', value: item.application ?? 'N/A' },
          { label: 'IP Rating', value: typeof asAny.ipRating === 'string' ? asAny.ipRating : (Array.isArray(asAny.ipRating) ? asAny.ipRating.join(', ') : 'N/A') },
          // Removed from Basic Information as requested: Pixel Pitch, Total Resolution, Square Feet, Price (USD)
        ];

        // Module Specifications items (5 items -> 3 left, 2 right)
        const moduleSpecItems: DisplayField[] = [
          { label: '1. Pixel Pitch', value: asAny.moduleSpecs?.pixelPitch ?? 'N/A' },
          { label: '2. Pixel Configuration', value: asAny.moduleSpecs?.pixelConfiguration ?? 'N/A' },
          { label: '3. Module Resolution', value: asAny.moduleSpecs?.moduleResolution ?? 'N/A' },
          { label: '4. Module Size (mm)', value: asAny.moduleSpecs?.moduleSize ?? 'N/A' },
          { label: '5. Module Weight (kg)', value: asAny.moduleSpecs?.moduleWeight != null ? asAny.moduleSpecs.moduleWeight.toString() : 'N/A' },
        ];

        // Cabinet Specifications items (8 items -> 4 left, 4 right)
        const cabinetSpecItems: DisplayField[] = [
          { label: '1. Cabinet Size (W*H)', value: asAny.cabinetSpecs?.cabinetSize ?? 'N/A' },
          { label: '2. Cabinet Resolution', value: asAny.cabinetSpecs?.cabinetResolution ?? 'N/A' },
          { label: '3. Module Quantity', value: asAny.cabinetSpecs?.moduleQuantity != null ? asAny.cabinetSpecs.moduleQuantity.toString() : 'N/A' },
          { label: '4. Pixel Density', value: asAny.cabinetSpecs?.pixelDensity ?? 'N/A' },
          { label: '5. Cabinet Weight (kg)', value: asAny.cabinetSpecs?.cabinetWeight != null ? asAny.cabinetSpecs.cabinetWeight.toString() : 'N/A' },
          { label: '6. Cabinet Area (sqm)', value: asAny.cabinetSpecs?.cabinetArea != null ? asAny.cabinetSpecs.cabinetArea.toString() : 'N/A' },
          { label: '7. Material', value: asAny.cabinetSpecs?.material ?? 'N/A' },
          { label: '8. Maintenance', value: asAny.cabinetSpecs?.maintenance ?? 'N/A' },
        ];

        // Screen Parameters items (17 items -> 9 left, 8 right)
        const screenParamItems: DisplayField[] = [
          { label: '1. Brightness Control', value: asAny.screenParams?.brightnessControl ?? 'N/A' },
          { label: '2. White Balance Brightness', value: asAny.screenParams?.whiteBalanceBrightness ?? 'N/A' },
          { label: '3. Color Temperature', value: asAny.screenParams?.colorTemperature ?? 'N/A' },
          { label: '4. Best Viewing Distance', value: asAny.screenParams?.bestViewingDistance ?? 'N/A' },
          { label: '5. Brightness Uniformity', value: asAny.screenParams?.brightnessUniformity ?? 'N/A' },
          { label: '6. Color Uniformity', value: asAny.screenParams?.colorUniformity ?? 'N/A' },
          { label: '7. Protective Grade', value: asAny.screenParams?.protectiveGrade ?? 'N/A' },
          { label: '8. View Angle', value: asAny.screenParams?.viewAngle ?? 'N/A' },
          { label: '9. Defects Rate', value: asAny.screenParams?.defectsRate ?? 'N/A' },
          { label: '10. Frame Frequency', value: asAny.screenParams?.frameFrequency ?? 'N/A' },
          { label: '11. Refresh Rate', value: asAny.screenParams?.refreshRate ?? 'N/A' },
          { label: '12. Input Voltage', value: asAny.screenParams?.inputVoltage ?? 'N/A' },
          { label: '13. Max Power Consumption', value: asAny.screenParams?.maxPowerConsumption ?? 'N/A' },
          { label: '14. Avg Power Consumption', value: asAny.screenParams?.avgPowerConsumption ?? 'N/A' },
          { label: '15. Life Span', value: asAny.screenParams?.lifeSpan ?? 'N/A' },
          { label: '16. Temperature-Operating', value: asAny.screenParams?.temperatureOperating ?? 'N/A' },
          { label: '17. Humidity-Operating', value: asAny.screenParams?.humidityOperating ?? 'N/A' },
        ];

        const displayFields: DisplayField[] = [
          // Basic Information
          { label: 'Basic Information', value: '', isSection: true },
          ...pairItems(basicInfoItems),

          // Module Specifications
          { label: 'Module Specifications', value: '', isSection: true },
          ...pairItems(moduleSpecItems),

          // Cabinet Specifications
          { label: 'Cabinet Specifications', value: '', isSection: true },
          ...pairItems(cabinetSpecItems),

          // Screen Parameters (9 left, 8 right)
          { label: 'Screen Parameters', value: '', isSection: true },
          ...pairItems(screenParamItems),

        ];

        const rowHeight = 16; // fixed safe height
        const bottomMargin = 40;

        let startIndex = 0;
        let isFirstSlice = true;

        while (startIndex < displayFields.length) {
          const remainingRows = displayFields.length - startIndex;
          const availableHeight = pageHeight - bottomMargin - currentY;
          let rowsThisPage = Math.floor(availableHeight / rowHeight);

          if (rowsThisPage <= 0) {
            // No space left on this page, go to next page
            doc.addPage();
            currentY = 40;
            continue;
          }

          if (rowsThisPage > remainingRows) {
            rowsThisPage = remainingRows;
          }

          const slice = displayFields.slice(startIndex, startIndex + rowsThisPage);
          const sliceHeight = slice.length * rowHeight;

          // Draw outer box for this slice
          doc.setLineWidth(1.5);
          doc.setDrawColor(0, 0, 0);
          doc.rect(boxX, currentY, boxWidth, sliceHeight);

          // Draw vertical line separating specs from image
          const specsRightX = boxX + leftColWidth;
          doc.line(specsRightX, currentY, specsRightX, currentY + sliceHeight);

          // Inner vertical line to split into two columns (but skip section header rows)
          const innerColX = boxX + leftColWidth / 2;
          let prevY = currentY;
          for (let r = 0; r < slice.length; r++) {
            const field = slice[r];
            const rowY = currentY + (r * rowHeight);
            const nextRowY = currentY + ((r + 1) * rowHeight);
            
            // Draw inner vertical line only for non-section rows
            if (!field.isSection) {
              doc.line(innerColX, rowY, innerColX, nextRowY);
            }
          }

          // Draw horizontal lines for each row in this slice (spec side only)
          for (let r = 1; r < slice.length; r++) {
            doc.line(boxX, currentY + (r * rowHeight), boxX + leftColWidth, currentY + (r * rowHeight));
          }

          // Fill in labels and values (supporting optional right-side label/value)
          doc.setFontSize(7);
          const leftLabelX = boxX + 3;
          const leftValueX = boxX + 105;
          const rightLabelX = innerColX + 3;
          const rightValueX = innerColX + 105;
          const leftMaxWidth = (innerColX - boxX) - 105 - 5;
          const rightMaxWidth = (specsRightX - innerColX) - 105 - 5;

          for (let f = 0; f < slice.length; f++) {
            const field = slice[f];
            const fieldY = currentY + (f * rowHeight) + rowHeight * 0.7;

            if (field.isSection) {
              // Section header - centered and bold
              doc.setFont('helvetica', 'bold');
              const sectionCenterX = boxX + (leftColWidth / 2);
              doc.text(field.label, sectionCenterX, fieldY, { align: 'center' });
            } else {
              // Left Label
              doc.setFont('helvetica', 'bold');
              doc.text(field.label + ':', leftLabelX, fieldY);

              // Left Value
              doc.setFont('helvetica', 'normal');
              const wrappedLeft = doc.splitTextToSize(field.value, leftMaxWidth);
              doc.text(wrappedLeft[0] || field.value, leftValueX, fieldY);

              // Right side (for paired rows)
              if (field.rightLabel) {
                // Right label
                doc.setFont('helvetica', 'bold');
                doc.text(field.rightLabel + ':', rightLabelX, fieldY);

                // Right value
                doc.setFont('helvetica', 'normal');
                const wrappedRight = doc.splitTextToSize(field.rightValue || 'N/A', rightMaxWidth);
                doc.text(wrappedRight[0] || field.rightValue || 'N/A', rightValueX, fieldY);
              }
            }
          }

          // Add image only on the first slice for this item
          if (isFirstSlice) {
            const imageUrl = getPrimaryImageUrl(item);
            const imgX = boxX + leftColWidth + 10;
            const imgY = currentY + 10;
            const imgMaxWidth = rightColWidth - 20;
            const imgMaxHeight = sliceHeight - 20;

            if (imageUrl) {
              const dataUrl = imageDataUrls[i];
              if (dataUrl) {
                try {
                  const img = new Image();
                  await new Promise((resolve) => {
                    img.onload = resolve;
                    img.src = dataUrl;
                  });

                  const aspectRatio = img.width / img.height;
                  let imgWidth = imgMaxWidth;
                  let imgHeight = imgWidth / aspectRatio;

                  if (imgHeight > imgMaxHeight) {
                    imgHeight = imgMaxHeight;
                    imgWidth = imgHeight * aspectRatio;
                  }

                  const imgCenterX = imgX + (imgMaxWidth - imgWidth) / 2;
                  const imgCenterY = imgY + (imgMaxHeight - imgHeight) / 2;

                  doc.addImage(dataUrl, 'JPEG', imgCenterX, imgCenterY, imgWidth, imgHeight);
                } catch (error) {
                  console.error('Error adding image:', error);
                  doc.setFontSize(10);
                  doc.setFont('helvetica', 'normal');
                  doc.setTextColor(150);
                  doc.text('No Image', imgX + imgMaxWidth / 2, imgY + imgMaxHeight / 2, { align: 'center' });
                  doc.setTextColor(0);
                }
              } else {
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(150);
                doc.text('No Image', imgX + imgMaxWidth / 2, imgY + imgMaxHeight / 2, { align: 'center' });
                doc.setTextColor(0);
              }
            } else {
              doc.setFontSize(10);
              doc.setFont('helvetica', 'normal');
              doc.setTextColor(150);
              doc.text('No Image', imgX + imgMaxWidth / 2, imgY + imgMaxHeight / 2, { align: 'center' });
              doc.setTextColor(0);
            }
          }

          isFirstSlice = false;
          startIndex += rowsThisPage;
          currentY += sliceHeight + 10; // small gap before next slice
        }

        // Draw commercial details in a separate box (left spec area)
        {
          const FEET_TO_METER = 0.3048;
          const commLabel = 'Required Size';
          const lenFt = parseFloat(asAny.requiredLength ?? '');
          const widFt = parseFloat(asAny.requiredWidth ?? '');
          const toM = (ft: number) => (ft * FEET_TO_METER);
          const fmt = (m: number) => m.toFixed(2);
          const hasLen = !isNaN(lenFt);
          const hasWid = !isNaN(widFt);
          const sizeText = hasLen && hasWid
            ? `W${fmt(toM(lenFt))}m × H${fmt(toM(widFt))}m`
            : 'N/A';

          const cabinetQty = asAny.cabinetRequired != null ? String(asAny.cabinetRequired) : 'N/A';
          const qty = (item.quantity ?? 1);
          // Price per sqm is stored in USD in item.price; compute area-based price
          const areaSqm = hasLen && hasWid ? (toM(lenFt) * toM(widFt)) : 0;
          const unitPriceUSD = (item.price ?? 0) * areaSqm;
          const unitPriceConverted = convertPrice(unitPriceUSD);
          const unitPriceText = unitPriceConverted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          const qtyText = String(qty);
          const totalConv = computeItemTotalConverted(item);
          const totalText = totalConv.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

          let rows: Array<{ label: string; value: string }> = [
            { label: `${commLabel} (m)`, value: sizeText },
            { label: 'Cabinet Required (qty)', value: cabinetQty },
            { label: 'Quantity', value: qtyText },
            { label: `Total (${pdfCurrency})`, value: totalText },
          ];

          // Append spare/accessory lines if present
          const spareLines: Array<{ label: string; value: string }> = [];
          if (asAny.spareModules) spareLines.push({ label: 'Spare modules (3% of total modules)', value: String(asAny.spareModules) });
          if (asAny.sparePSU) spareLines.push({ label: 'Spare PSU', value: String(asAny.sparePSU) });
          if (asAny.spareReceivingCard) spareLines.push({ label: 'Spare receiving card', value: String(asAny.spareReceivingCard) });
          if (asAny.package) spareLines.push({ label: 'Package', value: String(asAny.package) });
          if (asAny.novastarController) spareLines.push({ label: 'Novastar Controller', value: String(asAny.novastarController) });
          if (spareLines.length > 0) {
            rows = rows.concat(spareLines);
          }

          const commRowH = 16;
          const commHeight = rows.length * commRowH;

          // Page break if needed
          if (currentY + commHeight + 10 > pageHeight - bottomMargin) {
            doc.addPage();
            currentY = 40;
          }

          // Box and content
          const commX = boxX;
          const commW = leftColWidth; // only spec area, not image
          doc.setLineWidth(1.2);
          doc.setDrawColor(0, 0, 0);
          doc.rect(commX, currentY, commW, commHeight);

          // Horizontal separators
          for (let r = 1; r < rows.length; r++) {
            doc.line(commX, currentY + r * commRowH, commX + commW, currentY + r * commRowH);
          }

          // Labels/values
          doc.setFontSize(8);
          const labX = commX + 5;
          const valX = commX + 120;
          const maxValW = commW - (valX - commX) - 6;
          for (let r = 0; r < rows.length; r++) {
            const y = currentY + r * commRowH + commRowH * 0.7;
            doc.setFont('helvetica', 'bold');
            doc.text(rows[r].label + ':', labX, y);
            doc.setFont('helvetica', 'normal');
            const wrapped = doc.splitTextToSize(rows[r].value, maxValW);
            doc.text(wrapped[0] || rows[r].value, valX, y);
          }

          currentY += commHeight + 12;
        }
      }
      
      // Add total at the end
      const finalY = currentY;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      const formattedTotal = pdfTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const currencyDisplay = currencyInfo.symbol === '₹' ? 'INR' : currencyInfo.symbol;
      doc.text(`Total Amount: ${currencyDisplay} ${formattedTotal}`, rightX, finalY + 20, { align: 'right' });
      
      // Skip the autoTable section and go directly to terms
      const termsStartY = finalY + 50;
      addTermsAndConditions(doc, termsStartY, pageWidth, rightX);
      
    } else {
      // ORIGINAL FORMAT FOR LED LIGHTS (and mixed carts)
      const rows = organizedCart.map((item, index) => {
        if (item.isDriver) {
          // Driver row - all specs in one large merged cell
          // Build complete driver specification string
          const driverSpecs = [];
          if (item.wattageRange) {
            // Just show the min value as the single wattage
            driverSpecs.push(`Power: ${item.wattageRange.min}W`);
          }
          if (item.outputVoltage) {
            driverSpecs.push(`Output: ${item.outputVoltage}`);
          }
          if (item.outputCurrent) {
            driverSpecs.push(`Current: ${item.outputCurrent}`);
          }
          if (item.inputVoltage) {
            driverSpecs.push(`Input: ${item.inputVoltage}`);
          }
          if (item.ipRating) {
            driverSpecs.push(`IP: ${item.ipRating}`);
          }
          if (item.type) {
            driverSpecs.push(`Type: ${item.type}`);
          }
          const allSpecs = driverSpecs.join(' | ');
          
          return [
            index + 1, // SI No
            '', // No image for driver
            `   > ${item.sku ?? 'N/A'}`, // Indented driver SKU
            { content: allSpecs, colSpan: 7, styles: { halign: 'left' as const } }, // Merged cell with all specs
            convertPrice(item.price ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            item.quantity ?? 1,
            (convertPrice(item.price ?? 0) * (item.quantity ?? 1)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          ];
        } else {
          // LED Product row - normal format
          return [
            index + 1, // SI No
            '',
            item.sku ?? 'N/A',
            item.category ?? '-',
            item.application ?? '-',
            item.inputVoltage ?? '-',
            item.watt ?? '-',
            item.lumen ?? '-',
            item.beamAngle ?? '-',
            item.ipRating && item.ipRating.trim() !== '' ? item.ipRating : 'N/A',
            convertPrice(item.price ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            item.quantity ?? 1,
            (convertPrice(item.price ?? 0) * (item.quantity ?? 1)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          ];
        }
      });

    const cellPadding = { top: 6, right: 2, bottom: 6, left: 2 } as const;
    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 165,
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
      columnStyles: { 
        0: { cellWidth: 15 }, // SI No column
        1: { cellWidth: 50 },  // Image column
        9: { cellWidth: 'auto', minCellWidth: 45 }  // IP Rating column - ensure enough width for text like "IP67 front / IP65 rear"
      },
      theme: 'grid', // Use grid theme to show all borders
      didParseCell: (data: CellHookData) => {
        if (data.section === 'body') {
          const idx = data.row.index;
          const item = organizedCart[idx];
          
          // For driver rows, use lighter background and smaller height
          if (item?.isDriver) {
            data.cell.styles.fillColor = [250, 250, 250]; // Very light gray
            data.cell.styles.textColor = [0, 0, 0]; // Black text for better visibility
            data.cell.styles.fontSize = 7.5;
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.minCellHeight = 30; // Smaller height for drivers
          } else {
            const imgInnerH = (rowHeights[idx] || 46);
            const desired = imgInnerH + cellPadding.top + cellPadding.bottom;
            data.cell.styles.minCellHeight = Math.max(data.cell.styles.minCellHeight || 0, desired, 52);
          }
        }
      },
      didDrawCell: (data: CellHookData) => {
        if (data.section === 'body') {
          const idx = data.row.index;
          const item = organizedCart[idx];
          
          // Render images for product rows (Image column is now index 1)
          if (data.column.index === 1) {
            const item = organizedCart[idx];
            
            // Skip image rendering for driver rows
            if (item?.isDriver) {
              return;
            }
            
            // For LED products, render image as normal
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
        }
      },
    });

      const finalY = (doc as any).lastAutoTable.finalY || 140;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      // Total is computed using overrides/area logic and conversion
      const formattedTotal = pdfTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const currencyDisplay = currencyInfo.symbol === '₹' ? 'INR' : currencyInfo.symbol;
      doc.text(`Total Amount: ${currencyDisplay} ${formattedTotal}`, rightX, finalY + 20, { align: 'right' });

      // Add terms and conditions
      const termsStartY = finalY + 50;
      addTermsAndConditions(doc, termsStartY, pageWidth, rightX);
    }

    // Helper function to add terms and conditions
    function addTermsAndConditions(doc: any, startY: number, pageWidth: number, rightX: number) {
      // Add Terms and Conditions in a bordered box
      const pageHeight = doc.internal.pageSize.height;
      let termsY = startY;
      
      // Check if we need a new page for terms
      if (termsY > pageHeight - 200) {
        doc.addPage();
        termsY = 40;
      }
      
      // Calculate box dimensions
      const termsBoxX = 14;
      const termsBoxY = termsY;
      const termsBoxWidth = pageWidth - 28; // Full width with margins
      let termsContentY = termsBoxY + 15;
      
      // Add Terms header
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Terms and Conditions:', termsBoxX + 8, termsContentY);
      
      termsContentY += 15;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      
      const terms = [
        `1. The prices quoted on ${termsAndConditions.deliveryLocation}.`,
        `2. Delivery: Within ${termsAndConditions.deliveryTime} from the date of PO and advance payment.`,
        `3. Payment Terms: ${termsAndConditions.paymentTerms}.`,
        `4. The quoted products are ${termsAndConditions.productMake}`,
        `5. Validity of offer: ${termsAndConditions.validityDays}`,
        `6. ${termsAndConditions.vatNote}`
      ];
      
      terms.forEach((term) => {
        const lines = doc.splitTextToSize(term, termsBoxWidth - 20);
        doc.text(lines, termsBoxX + 8, termsContentY);
        termsContentY += lines.length * 12;
      });
      
      // Add closing
      termsContentY += 15;
      doc.setFontSize(9);
      doc.text('Thanking You', termsBoxX + 8, termsContentY);
      
      termsContentY += 20;
      doc.text('Yours Sincerely', termsBoxX + 8, termsContentY);
      
      if (termsAndConditions.salesPersonName) {
        termsContentY += 20;
        doc.setFont('helvetica', 'bold');
        doc.text(termsAndConditions.salesPersonName, termsBoxX + 8, termsContentY);
      }
    
      // Draw box around entire terms section
      const termsBoxHeight = termsContentY - termsBoxY + 15;
      doc.setLineWidth(1.5);
      doc.setDrawColor(0, 0, 0); // Blue border
      doc.rect(termsBoxX, termsBoxY, termsBoxWidth, termsBoxHeight);
    }

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
              <div className="grid grid-cols-2 gap-3">
              {cart.map((item) => {
                const isDisplay = isDisplayItem(item);
                return (
                  <div
                    key={item.cartItemId}
                    className={`${isDisplay ? 'col-span-2' : ''}`}
                  >
                    <div
                      className={`rounded-xl p-4 transition-all duration-300 hover:-translate-y-1 bg-white border-2 border-gray-200 hover:border-blue-400 shadow-lg hover:shadow-2xl ${
                        isDarkMode ? '' : ''
                      }`}
                    >
                      {isDisplay ? (
                        <div className="flex gap-5">
                          {/* Left: Image */}
                          <div className="flex-shrink-0">
                            <div className="w-44 h-44 rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 border-2 border-slate-300 shadow-md">
                              {(item.productImages?.length || item.images?.length) ? (
                                <img 
                                  src={item.productImages?.[0] || item.images?.[0]} 
                                  alt={item.sku} 
                                  className="w-full h-full object-contain p-2"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-10 h-10 text-slate-400" />
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Center: Product Info & Specs */}
                          <div className="flex-1 flex flex-col gap-3">
                            {/* Header Section */}
                            <div className="border-b border-gray-200 pb-2">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h3 className="font-bold text-lg text-gray-900 tracking-tight">{item.sku}</h3>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-700 text-white shadow-sm">
                                      {item.category}
                                    </span>
                                    {item.pixelPitch && (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-600 text-white shadow-sm">
                                        {item.pixelPitch}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Specifications Grid with Icons */}
                            <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                              {item.application && (
                                <div className="flex items-center gap-2 bg-white/60 px-3 py-2 rounded-lg border border-gray-200">
                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                  <div className="flex-1">
                                    <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Application</span>
                                    <p className="text-xs text-gray-900 font-semibold">{item.application}</p>
                                  </div>
                                </div>
                              )}
                              {item.ipRating && item.ipRating !== 'N/A' && (
                                <div className="flex items-center gap-2 bg-white/60 px-3 py-2 rounded-lg border border-gray-200">
                                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                  <div className="flex-1">
                                    <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">IP Rating</span>
                                    <p className="text-xs text-gray-900 font-semibold">{
                                      typeof item.ipRating === 'string' 
                                        ? item.ipRating 
                                        : Array.isArray(item.ipRating) 
                                          ? (item.ipRating as string[]).join(', ')
                                          : String(item.ipRating)
                                    }</p>
                                  </div>
                                </div>
                              )}
                              {(item.requiredLength || item.requiredWidth) && (
                                <div className="flex items-center gap-2 bg-white/60 px-3 py-2 rounded-lg border border-gray-200">
                                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                  <div className="flex-1">
                                    <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Screen Size</span>
                                    <p className="text-xs text-gray-900 font-semibold">
                                      W{(() => {
                                        const ft = parseFloat(item.requiredLength || '0');
                                        return (ft * 0.3048).toFixed(2);
                                      })()}m × H{(() => {
                                        const ft = parseFloat(item.requiredWidth || '0');
                                        return (ft * 0.3048).toFixed(2);
                                      })()}m
                                    </p>
                                  </div>
                                </div>
                              )}
                              {typeof item.cabinetRequired === 'number' && item.cabinetRequired > 0 && (
                                <div className="flex items-center gap-2 bg-white/60 px-3 py-2 rounded-lg border border-gray-200">
                                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                                  <div className="flex-1">
                                    <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Cabinets</span>
                                    <p className="text-xs text-gray-900 font-semibold">{item.cabinetRequired} Units</p>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {/* Quantity & Price Row */}
                            <div className="flex items-center justify-between gap-4 mt-auto pt-3 border-t border-gray-200">
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-semibold text-gray-600">Quantity:</span>
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-slate-100 to-slate-200 border-2 border-slate-300 shadow-sm">
                                  <button
                                    onClick={() => decreaseQuantity(item.cartItemId)}
                                    className="w-6 h-6 rounded-md flex items-center justify-center transition-all hover:bg-white hover:shadow-md text-gray-700 hover:text-blue-600"
                                  >
                                    <Minus className="w-3.5 h-3.5" />
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
                                    className="w-12 text-center font-bold text-sm outline-none bg-transparent text-gray-900"
                                  />
                                  <button
                                    onClick={() => increaseQuantity(item.cartItemId)}
                                    className="w-6 h-6 rounded-md flex items-center justify-center transition-all hover:bg-white hover:shadow-md text-gray-700 hover:text-blue-600"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] text-gray-500 font-medium mb-0.5">Total (USD)</p>
                                <p className="text-base font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                                  {(() => {
                                    const FEET_TO_METER = 0.3048;
                                    const asAny = item as any;
                                    const lenFt = parseFloat(asAny.requiredLength ?? '0');
                                    const widFt = parseFloat(asAny.requiredWidth ?? '0');
                                    let totalUSD = 0;
                                    if (!isNaN(lenFt) && !isNaN(widFt) && lenFt > 0 && widFt > 0) {
                                      const areaSqm = (lenFt * FEET_TO_METER) * (widFt * FEET_TO_METER);
                                      totalUSD = areaSqm * (item.price ?? 0) * (item.quantity ?? 1);
                                    } else {
                                      totalUSD = (item.price ?? 0) * (item.quantity ?? 1);
                                    }
                                    const formatted = totalUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                                    return `$ ${formatted}`;
                                  })()}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Right: Actions */}
                          <div className="flex flex-col gap-3 items-end justify-between">
                            <button
                              onClick={() => removeFromCart(item.cartItemId)}
                              className="p-2.5 rounded-lg transition-all bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 shadow-sm hover:shadow-md"
                              title="Remove from cart"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={async () => {
                                setEditingDisplay(item);
                                // Base form data
                                let baseData: any = {
                                  __context: 'cart',
                                  ...item,
                                  moduleSpecs: item.moduleSpecs || {},
                                  cabinetSpecs: item.cabinetSpecs || {},
                                  screenParams: item.screenParams || {},
                                  customTotalManuallyEdited: false,
                                  priceInput: (typeof item.price === 'number' ? String(item.price) : (item.price || '')) as any,
                                  cabinetRequiredManuallyEdited: false,
                                };
                                // Try to hydrate cabinet specs from backend by SKU
                                try {
                                  if (item.sku) {
                                    const res = await fetch(`/api/led-displays?search=${encodeURIComponent(item.sku)}`);
                                    if (res.ok) {
                                      const list = await res.json();
                                      const match = Array.isArray(list) ? list.find((d: any) => d.sku === item.sku) : null;
                                      if (match?.cabinetSpecs) {
                                        const mergedCabinetSpecs = { ...match.cabinetSpecs, ...baseData.cabinetSpecs };
                                        baseData.cabinetSpecs = mergedCabinetSpecs;
                                        // If required size present, compute initial cabinetRequired
                                        const FEET_TO_METER = 0.3048;
                                        const lenFt = parseFloat((baseData as any)?.requiredLength ?? '');
                                        const widFt = parseFloat((baseData as any)?.requiredWidth ?? '');
                                        if (!isNaN(lenFt) && !isNaN(widFt) && lenFt > 0 && widFt > 0) {
                                          const lenM = lenFt * FEET_TO_METER;
                                          const widM = widFt * FEET_TO_METER;
                                          const areaSqm = lenM * widM;
                                          let cabArea = mergedCabinetSpecs?.cabinetArea;
                                          if (!(cabArea > 0)) {
                                            const sizeStr = mergedCabinetSpecs?.cabinetSize || '';
                                            const m = String(sizeStr).match(/(\d+(?:\.\d+)?)\s*[xX*×]\s*(\d+(?:\.\d+)?)/);
                                            if (m) {
                                              const w = parseFloat(m[1]);
                                              const h = parseFloat(m[2]);
                                              if (!isNaN(w) && !isNaN(h)) {
                                                cabArea = (w / 1000) * (h / 1000);
                                              }
                                            }
                                          }
                                          if (cabArea && cabArea > 0) {
                                            baseData.cabinetRequired = Math.round(areaSqm / cabArea);
                                          }
                                        }
                                      }
                                    }
                                  }
                                } catch {}
                                setDisplayFormData(baseData);
                                // Reset price edit lock state when opening editor
                                setPriceEditUnlocked(false);
                                setShowPriceEditModal(false);
                                setPriceEditPassword('');
                                setPriceEditError('');
                              }}
                              className="px-4 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all border-2 border-blue-400 hover:border-blue-500"
                            >
                              ✏️ Edit Specs
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <div className="w-20 h-20 mx-auto rounded-lg overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 shadow-sm">
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
                          <div className="flex-1">
                            <div className="flex justify-between items-start gap-1 mb-1.5">
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
                                className="p-1.5 rounded-lg transition-all flex-shrink-0 hover:bg-red-50 text-red-600 hover:text-red-700"
                                title="Remove"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {item.inputVoltage && item.inputVoltage !== '-' && (
                                <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
                                  {item.inputVoltage}
                                </span>
                              )}
                              {item.watt && item.watt !== '-' && (
                                <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                  {item.watt}W
                                </span>
                              )}
                              {item.lumen && item.lumen !== '-' && (
                                <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                  {item.lumen.toLowerCase().includes('lm') ? item.lumen : `${item.lumen}lm`}
                                </span>
                              )}
                              {item.beamAngle && item.beamAngle !== '-' && (
                                <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200">
                                  {item.beamAngle}
                                </span>
                              )}
                              {item.ipRating && item.ipRating !== 'N/A' && (
                                <span className="inline-block bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-md text-[10px] font-bold border border-yellow-200">
                                  {item.ipRating}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-200 shadow-sm">
                                <button
                                  onClick={() => decreaseQuantity(item.cartItemId)}
                                  className="w-6 h-6 rounded-md flex items-center justify-center transition-all hover:bg-white hover:shadow text-gray-900"
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
                                  className="w-6 h-6 rounded-md flex items-center justify-center transition-all hover:bg-white hover:shadow text-gray-900"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] text-gray-500">
                                  {formatPrice(item.price ?? 0)} × {item.quantity}
                                </p>
                                <p className="text-sm font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                                  {formatPrice((item.price ?? 0) * (item.quantity ?? 1))}
                                </p>
                              </div>
                            </div>
                            {!item.isDriver && !isDisplay && (
                              <button
                                onClick={() => fetchDriversForProduct(item)}
                                className="w-full mt-2 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-700 border border-blue-200 transition-all text-xs font-bold shadow-sm hover:shadow"
                              >
                                <Zap className="w-3.5 h-3.5" />
                                Add Driver
                              </button>
                            )}
                            {!item.isDriver && !isDisplay && getDriversForProduct(item.cartItemId).length > 0 && (
                              <div className="mt-2 pt-2 border-t border-gray-200">
                                <p className="text-[10px] font-bold text-gray-700 mb-1.5">🔌 Drivers:</p>
                                {getDriversForProduct(item.cartItemId).map((driver) => (
                                  <div key={driver.cartItemId} className="flex items-center justify-between gap-1 mb-1.5 p-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 shadow-sm">
                                    <div className="flex-1 min-w-0">
                                      <p className="text-[10px] font-bold text-blue-900 truncate">{driver.name}</p>
                                      <p className="text-[9px] text-blue-700">Qty: {driver.quantity}</p>
                                    </div>
                                    <button
                                      onClick={() => removeFromCart(driver.cartItemId)}
                                      className="p-1 rounded-md hover:bg-red-100 text-red-600 transition-all"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
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
                        Attn (Name)
                      </label>
                      <input
                        type="text"
                        name="project"
                        value={userInfo.project}
                        onChange={handleChange}
                        placeholder="Contact person name"
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
                        Company
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={userInfo.company}
                        onChange={handleChange}
                        placeholder="Company name"
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
                        <FileText className="w-3.5 h-3.5" />
                        Subject
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={userInfo.subject}
                        onChange={handleChange}
                        placeholder="e.g., Quotation"
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
                        <FileText className="w-3.5 h-3.5" />
                        Invoice No
                      </label>
                      <input
                        type="text"
                        name="invoiceNo"
                        value={userInfo.invoiceNo}
                        onChange={handleChange}
                        placeholder="e.g., QT-12345678"
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
                    💎 Apply Discount
                  </h3>
                  <div className={`p-4 rounded-xl border ${
                    isDarkMode 
                      ? 'bg-gradient-to-br from-gray-900 to-gray-800 border-yellow-400/40 shadow-xl shadow-yellow-400/10' 
                      : 'bg-gradient-to-br from-white to-yellow-50/30 border-yellow-400/50 shadow-xl'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Discount Rate
                      </span>
                      <div className={`px-4 py-1.5 rounded-lg font-bold text-lg transition-all ${
                        isDarkMode 
                          ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/50 shadow-lg shadow-yellow-400/20' 
                          : 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white border border-yellow-500 shadow-lg'
                      }`}>
                        {discount}%
                      </div>
                    </div>
                    
                    <input
                      type="range"
                      min="0"
                      max="15"
                      step="1"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      className="w-full h-2.5 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-yellow-500 transition-all"
                    />
                    <div className="flex justify-between mt-2 mb-4">
                      <span className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>0%</span>
                      <span className={`text-xs font-semibold ${isDarkMode ? 'text-yellow-400' : 'text-orange-600'}`}>15% Max</span>
                    </div>
                    
                    {discount > 0 && (
                      <div className={`p-3 rounded-lg mb-3 border-l-4 transition-all ${
                        isDarkMode 
                          ? 'bg-green-500/10 border-green-400 shadow-md shadow-green-400/10' 
                          : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-500 shadow-md'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-semibold ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>
                            ✨ Total Savings
                          </span>
                          <span className={`text-lg font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                            -{currencyInfo.symbol} {discountAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <button
                      onClick={() => setShowContactPopup(true)}
                      className={`w-full py-2.5 px-4 rounded-lg font-bold text-sm transition-all border-2 ${
                        isDarkMode 
                          ? 'bg-white text-black border-white hover:bg-gray-100 hover:shadow-lg' 
                          : 'bg-black text-white border-black hover:bg-gray-800 hover:shadow-xl'
                      }`}
                    >
                      Request Custom Quotation
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
                <div className="space-y-2">
                  <button
                    onClick={() => setShowTermsModal(true)}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all ${
                      isDarkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-white border border-white/20' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300'
                    }`}
                  >
                    <Settings className="w-4 h-4" />
                    Edit Terms & Conditions
                  </button>
                  
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
                      <a href="mailto:revant@qliteglobal.com" className={`hover:text-yellow-400 transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        ankit.mittal@qliteglobal.com
                      </a>
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

      {/* Price Edit Unlock Modal */}
      {showPriceEditModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className={`w-full max-w-sm rounded-xl overflow-hidden ${
            isDarkMode ? 'bg-gray-900 border border-white/10' : 'bg-white border border-gray-200 shadow-lg'
          }`}>
            <div className={`p-4 border-b ${isDarkMode ? 'border-white/10 bg-gray-900' : 'border-gray-200 bg-white'}`}>
              <h3 className={`text-base font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <Lock className="w-4 h-4 text-blue-500" /> Enter Password to Edit Price
              </h3>
            </div>
            <div className="p-4">
              <label className={`text-xs font-semibold block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Password</label>
              <input
                type="password"
                value={priceEditPassword}
                onChange={(e) => { setPriceEditPassword(e.target.value); setPriceEditError(''); }}
                className={`w-full px-3 py-2 rounded-lg text-sm outline-none ${
                  isDarkMode ? 'bg-gray-800 border border-white/20 text-white placeholder-gray-500' : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
                placeholder="Enter password"
              />
              {priceEditError && (
                <p className={`mt-2 text-xs ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{priceEditError}</p>
              )}
            </div>
            <div className={`flex justify-end gap-2 p-4 border-t ${isDarkMode ? 'border-white/10 bg-gray-900' : 'border-gray-100 bg-gray-50'}`}>
              <button
                type="button"
                onClick={() => { setShowPriceEditModal(false); setPriceEditPassword(''); setPriceEditError(''); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  isDarkMode ? 'bg-transparent border border-white/20 text-gray-200 hover:bg-white/10' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (priceEditPassword === PRICE_EDIT_PASSWORD) {
                    setPriceEditUnlocked(true);
                    setShowPriceEditModal(false);
                    setPriceEditPassword('');
                    setPriceEditError('');
                  } else {
                    setPriceEditError('Invalid password');
                  }
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-500 hover:bg-blue-600 text-white"
              >
                Unlock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Driver Selection Modal */}
      {/* LED Display Edit Modal */}
      {editingDisplay && displayFormData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-5xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl ${
            isDarkMode ? 'bg-gray-900 border-2 border-white/10' : 'bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-slate-600'
          }`}>
            {/* Header */}
            <div className={`flex items-center justify-between px-6 py-5 border-b-2 flex-shrink-0 ${
              isDarkMode ? 'border-white/10 bg-gray-900' : 'border-slate-600 bg-gradient-to-r from-slate-700 to-slate-800'
            }`}>
              <div>
                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-white'}`}>
                  Edit LED Display Specifications
                </h3>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-slate-300'}`}>
                  SKU: {editingDisplay.sku}
                </p>
              </div>
              <button
                onClick={handleCloseDisplayEdit}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-slate-600 text-white'
                }`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form Content */}
            <div className="px-6 py-5 overflow-y-auto flex-1 min-h-0 bg-gradient-to-b from-slate-800 via-slate-850 to-slate-900">
              {renderLedDisplayFormFields(displayFormData, setDisplayFormData, isDarkMode)}

              {/* Spare and Accessories */}
              <div className={`mt-6 p-5 rounded-xl border-2 shadow-lg ${isDarkMode ? 'bg-gray-900/40 border-white/10' : 'bg-gradient-to-br from-slate-700 to-slate-800 border-slate-500'}`}>
                <h4 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-white'}`}>
                  <span className="w-1.5 h-7 bg-indigo-600 rounded shadow-sm"></span>
                  Spare and Accessories
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className={`font-bold block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-200'}`}>Spare modules (3% of total modules)</label>
                    <input
                      type="text"
                      value={displayFormData?.spareModules ?? ''}
                      onChange={(e) => setDisplayFormData({ ...displayFormData, spareModules: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border-2 text-sm font-medium ${isDarkMode ? 'bg-gray-800 border-white/20 text-white' : 'bg-slate-900 border-slate-400 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30'}`}
                      placeholder="e.g., 12 pcs"
                    />
                  </div>
                  <div>
                    <label className={`font-bold block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-200'}`}>Spare PSU</label>
                    <input
                      type="text"
                      value={displayFormData?.sparePSU ?? ''}
                      onChange={(e) => setDisplayFormData({ ...displayFormData, sparePSU: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border-2 text-sm font-medium ${isDarkMode ? 'bg-gray-800 border-white/20 text-white' : 'bg-slate-900 border-slate-400 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30'}`}
                      placeholder="e.g., 2 pcs"
                    />
                  </div>
                  <div>
                    <label className={`font-bold block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-200'}`}>Spare receiving card</label>
                    <input
                      type="text"
                      value={displayFormData?.spareReceivingCard ?? ''}
                      onChange={(e) => setDisplayFormData({ ...displayFormData, spareReceivingCard: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border-2 text-sm font-medium ${isDarkMode ? 'bg-gray-800 border-white/20 text-white' : 'bg-slate-900 border-slate-400 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30'}`}
                      placeholder="e.g., 1 pc"
                    />
                  </div>
                  <div>
                    <label className={`font-bold block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-200'}`}>Package</label>
                    <input
                      type="text"
                      value={displayFormData?.package ?? ''}
                      onChange={(e) => setDisplayFormData({ ...displayFormData, package: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border-2 text-sm font-medium ${isDarkMode ? 'bg-gray-800 border-white/20 text-white' : 'bg-slate-900 border-slate-400 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30'}`}
                      placeholder="e.g., Flight case"
                    />
                  </div>
                  <div>
                    <label className={`font-bold block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-200'}`}>Novastar Controller</label>
                    <input
                      type="text"
                      value={displayFormData?.novastarController ?? ''}
                      onChange={(e) => setDisplayFormData({ ...displayFormData, novastarController: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border-2 text-sm font-medium ${isDarkMode ? 'bg-gray-800 border-white/20 text-white' : 'bg-slate-900 border-slate-400 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30'}`}
                      placeholder="e.g., VX4S"
                    />
                  </div>
                </div>
              </div>
              
              {/* Price Calculation Preview - EDITABLE */}
              <div className={`mt-6 p-5 rounded-xl border-2 shadow-lg ${
                isDarkMode ? 'bg-gray-900/30 border-white/10' : 'bg-gradient-to-br from-slate-700 to-slate-800 border-slate-500'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className={`text-lg font-bold flex items-center gap-2 ${isDarkMode ? 'text-gray-200' : 'text-white'}`}>
                    <span className="w-1.5 h-7 bg-emerald-600 rounded shadow-sm"></span>
                    <Settings className="w-5 h-5" />
                    Price Calculation Preview (Editable)
                    {!priceEditUnlocked && (
                      <span className={`ml-2 px-3 py-1 rounded-full text-xs font-bold ${isDarkMode ? 'bg-white/10 text-gray-200' : 'bg-yellow-500 text-slate-900 border-2 border-yellow-400 shadow-sm'}`}>🔒 Locked</span>
                    )}
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      if (!priceEditUnlocked) {
                        setPriceEditPassword('');
                        setPriceEditError('');
                        setShowPriceEditModal(true);
                      } else {
                        setPriceEditUnlocked(false);
                      }
                    }}
                    className={`px-2 py-1 rounded text-xs font-semibold inline-flex items-center gap-1 ${
                      isDarkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-white hover:bg-gray-100 border border-gray-300 text-gray-800'
                    }`}
                  >
                    {priceEditUnlocked ? (<><Unlock className="w-3 h-3" /> Unlocked</>) : (<><Lock className="w-3 h-3" /> Unlock to edit</>)}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {(() => {
                    const FEET_TO_METER = 0.3048;
                    const lenFt = parseFloat(displayFormData?.requiredLength ?? '0');
                    const widFt = parseFloat(displayFormData?.requiredWidth ?? '0');
                    const hasLen = !isNaN(lenFt) && lenFt > 0;
                    const hasWid = !isNaN(widFt) && widFt > 0;
                    const lenM = hasLen ? lenFt * FEET_TO_METER : 0;
                    const widM = hasWid ? widFt * FEET_TO_METER : 0;
                    const areaSqm = hasLen && hasWid ? lenM * widM : 0;
                    const pricePerSqm = displayFormData.price ?? 0;
                    const unitPriceUSD = areaSqm * pricePerSqm;
                    const unitPriceConverted = convertPrice(unitPriceUSD);
                    const qty = editingDisplay?.quantity ?? 1;
                    const totalConverted = unitPriceConverted * qty;
                    const currencyDisplay = currencyInfo.symbol === '₹' ? 'INR' : currencyInfo.code;

                    return (
                      <>
                        {/* Required Length (ft) - EDITABLE */}
                        <div className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                          <label className="font-semibold block mb-1">Required Length (ft):</label>
                          <input
                            type="number"
                            step="0.01"
                            value={displayFormData?.requiredLength ?? ''}
                            onWheel={(e) => e.currentTarget.blur()}
                            onChange={(e) => {
                              const val = e.target.value;
                              // Update length
                              let next: any = { ...displayFormData, requiredLength: val };
                              // Recompute area-based total if possible and not manually overridden
                              const FEET_TO_METER = 0.3048;
                              const lenFt = parseFloat(val);
                              const widFt = parseFloat(displayFormData?.requiredWidth ?? '0');
                              const hasLen = !isNaN(lenFt) && lenFt > 0;
                              const hasWid = !isNaN(widFt) && widFt > 0;
                              if (hasLen && hasWid) {
                                const lenM = lenFt * FEET_TO_METER;
                                const widM = widFt * FEET_TO_METER;
                                const areaSqm = lenM * widM;
                                // Auto-calc cabinetRequired if cabinet area exists (or derive from cabinet size)
                                const rawArea = (displayFormData as any)?.cabinetSpecs?.cabinetArea;
                                let cabArea = typeof rawArea === 'number' ? rawArea : parseFloat(rawArea ?? '');
                                console.log('🔍 [LENGTH] Cabinet specs:', { cabinetSpecs: displayFormData?.cabinetSpecs, rawArea, cabArea });
                                if (!(cabArea > 0)) {
                                  const sizeStr = (displayFormData as any)?.cabinetSpecs?.cabinetSize || '';
                                  console.log('🔍 [LENGTH] Parsing cabinet size:', sizeStr);
                                  const m = String(sizeStr).match(/(\d+(?:\.\d+)?)\s*[xX*×]\s*(\d+(?:\.\d+)?)/);
                                  if (m) {
                                    const w = parseFloat(m[1]);
                                    const h = parseFloat(m[2]);
                                    console.log('🔍 [LENGTH] Parsed dimensions (mm):', { w, h });
                                    if (!isNaN(w) && !isNaN(h)) {
                                      // Assume mm, convert to meters
                                      const wm = w / 1000;
                                      const hm = h / 1000;
                                      cabArea = wm * hm; // in sqm
                                      console.log('🔍 [LENGTH] Calculated cabArea (sqm):', cabArea);
                                    }
                                  }
                                }
                                console.log('🔧 [LENGTH] Cabinet calc:', { lenFt, widFt, areaSqm, cabArea, manualFlag: displayFormData?.cabinetRequiredManuallyEdited, currentCab: displayFormData?.cabinetRequired });
                                if (!displayFormData?.cabinetRequiredManuallyEdited && cabArea && cabArea > 0) {
                                  next.cabinetRequired = Math.round(areaSqm / cabArea);
                                  console.log('✅ [LENGTH] Auto-updated cabinet to:', next.cabinetRequired);
                                }
                                if (!displayFormData?.customTotalManuallyEdited) {
                                  const unitUSD = areaSqm * (displayFormData?.price || 0);
                                  const unitConv = convertPrice(unitUSD);
                                  const qty = editingDisplay?.quantity ?? 1;
                                  const calc = unitConv * qty;
                                  next.customTotalConverted = Math.round(calc * 100) / 100;
                                }
                              }
                              setDisplayFormData(next);
                            }}
                            disabled={!priceEditUnlocked}
                            className={`w-full px-2 py-1.5 rounded border text-xs [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                              isDarkMode 
                                ? `bg-gray-800 border-white/20 text-white ${!priceEditUnlocked ? 'opacity-60 cursor-not-allowed' : ''}` 
                                : `bg-white border-gray-300 text-gray-900 ${!priceEditUnlocked ? 'opacity-60 cursor-not-allowed' : ''}`
                            }`}
                            placeholder="Width in feet"
                          />
                        </div>

                        {/* Required Width (ft) - EDITABLE */}
                        <div className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                          <label className="font-semibold block mb-1">Required Height (ft):</label>
                          <input
                            type="number"
                            step="0.01"
                            value={displayFormData?.requiredWidth ?? ''}
                            onWheel={(e) => e.currentTarget.blur()}
                            onChange={(e) => {
                              const val = e.target.value;
                              let next: any = { ...displayFormData, requiredWidth: val };
                              const FEET_TO_METER = 0.3048;
                              const lenFt = parseFloat(displayFormData?.requiredLength ?? '0');
                              const widFt = parseFloat(val);
                              const hasLen = !isNaN(lenFt) && lenFt > 0;
                              const hasWid = !isNaN(widFt) && widFt > 0;
                              if (hasLen && hasWid) {
                                const lenM = lenFt * FEET_TO_METER;
                                const widM = widFt * FEET_TO_METER;
                                const areaSqm = lenM * widM;
                                // Auto-calc cabinetRequired with same robust logic
                                const rawArea = (displayFormData as any)?.cabinetSpecs?.cabinetArea;
                                let cabArea = typeof rawArea === 'number' ? rawArea : parseFloat(rawArea ?? '');
                                console.log('🔍 [HEIGHT] Cabinet specs:', { cabinetSpecs: displayFormData?.cabinetSpecs, rawArea, cabArea });
                                if (!(cabArea > 0)) {
                                  const sizeStr = (displayFormData as any)?.cabinetSpecs?.cabinetSize || '';
                                  console.log('🔍 [HEIGHT] Parsing cabinet size:', sizeStr);
                                  const m = String(sizeStr).match(/(\d+(?:\.\d+)?)\s*[xX*×]\s*(\d+(?:\.\d+)?)/);
                                  if (m) {
                                    const w = parseFloat(m[1]);
                                    const h = parseFloat(m[2]);
                                    console.log('🔍 [HEIGHT] Parsed dimensions (mm):', { w, h });
                                    if (!isNaN(w) && !isNaN(h)) {
                                      cabArea = (w / 1000) * (h / 1000);
                                      console.log('🔍 [HEIGHT] Calculated cabArea (sqm):', cabArea);
                                    }
                                  }
                                }
                                console.log('🔧 [HEIGHT] Cabinet calc:', { lenFt, widFt, areaSqm, cabArea, manualFlag: displayFormData?.cabinetRequiredManuallyEdited, currentCab: displayFormData?.cabinetRequired });
                                if (!displayFormData?.cabinetRequiredManuallyEdited && cabArea && cabArea > 0) {
                                  next.cabinetRequired = Math.round(areaSqm / cabArea);
                                  console.log('✅ [HEIGHT] Auto-updated cabinet to:', next.cabinetRequired);
                                }
                                if (!displayFormData?.customTotalManuallyEdited) {
                                  const unitUSD = areaSqm * (displayFormData?.price || 0);
                                  const unitConv = convertPrice(unitUSD);
                                  const qty = editingDisplay?.quantity ?? 1;
                                  const calc = unitConv * qty;
                                  next.customTotalConverted = Math.round(calc * 100) / 100;
                                }
                              }
                              setDisplayFormData(next);
                            }}
                            disabled={!priceEditUnlocked}
                            className={`w-full px-2 py-1.5 rounded border text-xs [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                              isDarkMode 
                                ? `bg-gray-800 border-white/20 text-white ${!priceEditUnlocked ? 'opacity-60 cursor-not-allowed' : ''}` 
                                : `bg-white border-gray-300 text-gray-900 ${!priceEditUnlocked ? 'opacity-60 cursor-not-allowed' : ''}`
                            }`}
                            placeholder="Height in feet"
                          />
                        </div>

                        {/* Required Size (m) - READ ONLY */}
                        <div className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                          <span className="font-semibold">Required Size (m):</span>
                          <div className="mt-1">{hasLen && hasWid ? `W${lenM.toFixed(2)}m × H${widM.toFixed(2)}m` : 'N/A'}</div>
                        </div>

                        {/* Area (sqm) - READ ONLY */}
                        <div className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                          <span className="font-semibold">Area (sqm):</span>
                          <div className={`mt-1 font-bold ${isDarkMode ? 'text-gray-100' : 'text-slate-700'}`}>{areaSqm > 0 ? areaSqm.toFixed(2) : 'N/A'}</div>
                        </div>

                        {/* Price per sqm (USD) - EDITABLE */}
                        <div className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                          <label className="font-semibold block mb-1">Price per sqm (USD):</label>
                          <input
                            type="number"
                            step="0.01"
                            value={displayFormData?.priceInput ?? (displayFormData?.price != null ? String(displayFormData.price) : '')}
                            onWheel={(e) => e.currentTarget.blur()}
                            onChange={(e) => {
                              const val = e.target.value;
                              // Update string value first to avoid flicker/leading zero
                              let next: any = { ...displayFormData, priceInput: val };
                              const parsed = parseFloat(val);
                              // Recompute total (converted) if numeric and not manually edited
                              const FEET_TO_METER = 0.3048;
                              const lenFt = parseFloat(displayFormData?.requiredLength ?? '0');
                              const widFt = parseFloat(displayFormData?.requiredWidth ?? '0');
                              const hasLen = !isNaN(lenFt) && lenFt > 0;
                              const hasWid = !isNaN(widFt) && widFt > 0;
                              const lenM = hasLen ? lenFt * FEET_TO_METER : 0;
                              const widM = hasWid ? widFt * FEET_TO_METER : 0;
                              const areaSqm = hasLen && hasWid ? lenM * widM : 0;
                              if (!isNaN(parsed)) {
                                next.price = parsed;
                                const unitUSD = areaSqm * parsed;
                                const unitConv = convertPrice(unitUSD);
                                const qty = editingDisplay?.quantity ?? 1;
                                const newTotal = Math.round(unitConv * qty * 100) / 100;
                                if (!displayFormData?.customTotalManuallyEdited) {
                                  next.customTotalConverted = newTotal;
                                }
                              } else {
                                next.price = undefined;
                              }
                              setDisplayFormData(next);
                            }}
                            disabled={!priceEditUnlocked}
                            className={`w-full px-2 py-1.5 rounded border text-xs [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                              isDarkMode 
                                ? `bg-gray-800 border-white/20 text-white ${!priceEditUnlocked ? 'opacity-60 cursor-not-allowed' : ''}` 
                                : `bg-white border-gray-300 text-gray-900 ${!priceEditUnlocked ? 'opacity-60 cursor-not-allowed' : ''}`
                            }`}
                            placeholder="Price per sqm"
                          />
                        </div>

                        {/* Cabinet Required - EDITABLE (auto-calculated if not overridden) */}
                        <div className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                          <label className="font-semibold block mb-1">Cabinet Required:</label>
                          <input
                            type="number"
                            step="1"
                            value={displayFormData?.cabinetRequired ?? ''}
                            onWheel={(e) => e.currentTarget.blur()}
                            onChange={(e) => setDisplayFormData({ ...displayFormData, cabinetRequired: parseInt(e.target.value) || 0, cabinetRequiredManuallyEdited: true })}
                            disabled={!priceEditUnlocked}
                            className={`w-full px-2 py-1.5 rounded border text-xs [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                              isDarkMode 
                                ? `bg-gray-800 border-white/20 text-white ${!priceEditUnlocked ? 'opacity-60 cursor-not-allowed' : ''}` 
                                : `bg-white border-gray-300 text-gray-900 ${!priceEditUnlocked ? 'opacity-60 cursor-not-allowed' : ''}`
                            }`}
                            placeholder="Number of cabinets"
                          />
                        </div>

                        {/* Quantity - READ ONLY (editable elsewhere) */}
                        <div className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                          <span className="font-semibold">Quantity:</span>
                          <div className="mt-1">{qty}</div>
                        </div>

                        {/* Calculated Totals - Editable Total when unlocked (Unit Price hidden) */}
                        <div className={`col-span-2 pt-2 border-t ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
                          {/* Unit Price hidden as requested */}
                          {priceEditUnlocked ? (
                            <div className="mt-2">
                              <label className={`text-xs font-semibold block mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Total ({currencyDisplay})</label>
                              <div className="flex items-center gap-2">
                                <span className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{currencyInfo.symbol}</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={(displayFormData?.customTotalConverted ?? Math.round(totalConverted*100)/100).toFixed(2)}
                                  onWheel={(e) => e.currentTarget.blur()}
                                  onChange={(e) => setDisplayFormData({ ...displayFormData, customTotalConverted: parseFloat(e.target.value) || 0, customTotalManuallyEdited: true })}
                                  className={`flex-1 px-2 py-1.5 rounded border text-xs [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                                    isDarkMode 
                                      ? 'bg-gray-800 border-white/20 text-white' 
                                      : 'bg-white border-gray-300 text-gray-900'
                                  }`}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className={`font-bold mt-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                              Total ({currencyDisplay}): {currencyInfo.symbol}{(displayFormData?.customTotalConverted ?? totalConverted).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
                <p className={`text-[10px] mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Formula: Area (sqm) = W(m) × H(m) | Total derives from area × price per sqm × qty (unit price hidden)
                </p>
              </div>
            </div>

            {/* Footer Actions */}
            <div className={`flex justify-end gap-3 px-6 py-5 border-t-2 flex-shrink-0 ${
              isDarkMode ? 'border-white/10 bg-gray-900/80' : 'border-slate-600 bg-gradient-to-r from-slate-800 to-slate-900'
            }`}>
              <button
                type="button"
                onClick={handleCloseDisplayEdit}
                className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  isDarkMode
                    ? 'bg-transparent border-2 border-white/20 text-gray-200 hover:bg-white/10'
                    : 'bg-white border-2 border-gray-400 text-gray-700 hover:bg-gray-50 shadow-sm'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveDisplayEdit}
                className="px-6 py-2.5 rounded-lg text-sm font-bold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg transition-all"
              >
                💾 Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Driver Selection Modal */}
      {showDriverModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`max-w-5xl w-full rounded-xl max-h-[85vh] overflow-hidden ${
            isDarkMode ? 'bg-gray-900 border border-white/10' : 'bg-white border border-gray-200 shadow-lg'
          }`}>
            {/* Header - Sticky */}
            <div className={`sticky top-0 z-10 p-4 border-b ${
              isDarkMode ? 'border-white/10 bg-gray-900' : 'border-gray-200 bg-white'
            }`}>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className={`text-lg font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <Zap className="w-5 h-5 text-blue-500" />
                    Select Driver for {selectedProductForDriver?.sku}
                    {selectedProductForDriver?.watt && (
                      <span className="text-blue-500">
                        ({selectedProductForDriver.watt}W)
                      </span>
                    )}
                  </h3>
                  <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {availableDrivers.length} driver{availableDrivers.length !== 1 ? 's' : ''} available
                  </p>
                </div>
                <button
                  onClick={handleCloseDriverModal}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Search Bar */}
              {!loadingDrivers && availableDrivers.length > 0 && (
                <div className="mt-4">
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <input
                      type="text"
                      placeholder="Search by name, SKU, series, voltage, type..."
                      value={driverSearchTerm}
                      onChange={(e) => setDriverSearchTerm(e.target.value)}
                      className={`w-full pl-10 pr-10 py-2.5 rounded-lg text-sm transition-all outline-none ${
                        isDarkMode 
                          ? 'bg-gray-800 border border-white/20 text-white placeholder-gray-500 focus:border-blue-500' 
                          : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                      }`}
                    />
                    {driverSearchTerm && (
                      <button
                        onClick={() => setDriverSearchTerm('')}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors ${
                          isDarkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                        }`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  
                  {/* Results Count */}
                  {driverSearchTerm && (() => {
                    const { indoor, outdoor } = categorizeDrivers();
                    const totalFiltered = indoor.length + outdoor.length;
                    if (totalFiltered < availableDrivers.length) {
                      return (
                        <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Showing {totalFiltered} of {availableDrivers.length} drivers
                        </p>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}
            </div>
            
            {/* Content */}
            <div className="p-4 overflow-y-auto max-h-[calc(85vh-240px)]">
              {loadingDrivers ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className={`w-12 h-12 border-4 rounded-full animate-spin mb-4 ${
                    isDarkMode ? 'border-white/10 border-t-blue-500' : 'border-gray-200 border-t-blue-500'
                  }`}></div>
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Loading compatible drivers...</p>
                </div>
              ) : availableDrivers.length === 0 ? (
                <div className="text-center py-12">
                  <Package className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    No drivers available
                  </p>
                  <p className={`mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    No drivers have been added to the system yet
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    Add drivers in the admin panel to make them available
                  </p>
                </div>
              ) : (
                <div>
                  {(() => {
                    const { indoor, outdoor } = categorizeDrivers();
                    const totalFiltered = indoor.length + outdoor.length;
                    
                    // Show "No results" message if search is applied but no drivers match
                    if (totalFiltered === 0 && driverSearchTerm) {
                      return (
                        <div className="text-center py-12">
                          <Search className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                          <p className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            No drivers found
                          </p>
                          <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Try a different search term
                          </p>
                          <button
                            onClick={() => setDriverSearchTerm('')}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                              isDarkMode 
                                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                          >
                            Clear Search
                          </button>
                        </div>
                      );
                    }
                    
                    return (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Indoor Drivers Section */}
                        {indoor.length > 0 && (
                          <div className={`rounded-lg border p-4 ${
                            isDarkMode ? 'bg-gray-800/30 border-white/10' : 'bg-gray-50 border-gray-200'
                          }`}>
                            <div className={`flex items-center gap-2 mb-3 pb-2 border-b ${
                              isDarkMode ? 'border-white/10' : 'border-gray-200'
                            }`}>
                              <div className={`p-1.5 rounded-lg ${
                                isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50'
                              }`}>
                                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                              </div>
                              <div>
                                <h4 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                  Indoor Drivers
                                </h4>
                                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  IP Rating ≤ 64 ({indoor.length} driver{indoor.length !== 1 ? 's' : ''})
                                </p>
                              </div>
                            </div>
                            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                              {indoor.map((driver) => (
                    <div
                      key={driver._id}
                      className={`p-3 rounded-lg border transition-all cursor-pointer ${
                        isDarkMode 
                          ? 'bg-gray-800/50 border-white/10 hover:border-blue-500/50 hover:bg-gray-800' 
                          : 'bg-white border-gray-200 hover:border-blue-500/50 shadow-sm hover:shadow-md'
                      }`}
                      onClick={() => handleAddDriver(driver)}
                    >
                      {/* Header with Name and Price */}
                      <div className="flex items-start justify-between mb-2 pb-2 border-b border-gray-200/30">
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-bold text-sm mb-0.5 truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {driver.name}
                          </h4>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {driver.sku}
                          </p>
                        </div>
                        <div className="text-right ml-2">
                          <p className="text-base font-bold text-blue-600 whitespace-nowrap">
                            {formatPrice(driver.price)}
                          </p>
                        </div>
                      </div>

                      {/* Compact Specifications */}
                      <div className="space-y-1 mb-2">
                        {driver.wattageRange && (
                          <div className="flex items-center justify-between text-xs">
                            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Power:</span>
                            <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {driver.wattageRange.min}-{driver.wattageRange.max}W
                            </span>
                          </div>
                        )}
                        
                        {driver.outputVoltage && (
                          <div className="flex items-center justify-between text-xs">
                            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Output:</span>
                            <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {driver.outputVoltage}
                            </span>
                          </div>
                        )}
                        
                        {driver.outputCurrent && (
                          <div className="flex items-center justify-between text-xs">
                            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Current:</span>
                            <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {driver.outputCurrent}
                            </span>
                          </div>
                        )}
                        
                        {driver.inputVoltage && (
                          <div className="flex items-center justify-between text-xs">
                            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Input:</span>
                            <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {driver.inputVoltage}
                            </span>
                          </div>
                        )}
                        
                        {driver.ipRating && (
                          <div className="flex items-center justify-between text-xs">
                            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>IP Rating:</span>
                            <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {driver.ipRating}
                            </span>
                          </div>
                        )}
                        
                        {driver.type && (
                          <div className="flex items-center justify-between text-xs">
                            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Type:</span>
                            <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {driver.type}
                            </span>
                          </div>
                        )}
                        
                        {driver.series && (
                          <div className="flex items-center justify-between text-xs">
                            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Series:</span>
                            <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {driver.series}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Add Button - Compact */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddDriver(driver);
                        }}
                        className="w-full px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add
                      </button>
                    </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Outdoor Drivers Section */}
                        {outdoor.length > 0 && (
                          <div className={`rounded-lg border p-4 ${
                            isDarkMode ? 'bg-gray-800/30 border-white/10' : 'bg-gray-50 border-gray-200'
                          }`}>
                            <div className={`flex items-center gap-2 mb-3 pb-2 border-b ${
                              isDarkMode ? 'border-white/10' : 'border-gray-200'
                            }`}>
                              <div className={`p-1.5 rounded-lg ${
                                isDarkMode ? 'bg-green-500/10' : 'bg-green-50'
                              }`}>
                                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <div>
                                <h4 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                  Outdoor Drivers
                                </h4>
                                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  IP Rating ≥ 65 ({outdoor.length} driver{outdoor.length !== 1 ? 's' : ''})
                                </p>
                              </div>
                            </div>
                            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                              {outdoor.map((driver) => (
                                <div
                                  key={driver._id}
                                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                                    isDarkMode 
                                      ? 'bg-gray-800/50 border-white/10 hover:border-blue-500/50 hover:bg-gray-800' 
                                      : 'bg-white border-gray-200 hover:border-blue-500/50 shadow-sm hover:shadow-md'
                                  }`}
                                  onClick={() => handleAddDriver(driver)}
                                >
                                  {/* Header with Name and Price */}
                                  <div className="flex items-start justify-between mb-2 pb-2 border-b border-gray-200/30">
                                    <div className="flex-1 min-w-0">
                                      <h4 className={`font-bold text-sm mb-0.5 truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {driver.name}
                                      </h4>
                                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {driver.sku}
                                      </p>
                                    </div>
                                    <div className="text-right ml-2">
                                      <p className="text-base font-bold text-blue-600 whitespace-nowrap">
                                        {formatPrice(driver.price)}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Compact Specifications */}
                                  <div className="space-y-1 mb-2">
                                    {driver.wattageRange && (
                                      <div className="flex items-center justify-between text-xs">
                                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Power:</span>
                                        <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                          {driver.wattageRange.min}-{driver.wattageRange.max}W
                                        </span>
                                      </div>
                                    )}
                                    
                                    {driver.outputVoltage && (
                                      <div className="flex items-center justify-between text-xs">
                                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Output:</span>
                                        <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                          {driver.outputVoltage}
                                        </span>
                                      </div>
                                    )}
                                    
                                    {driver.outputCurrent && (
                                      <div className="flex items-center justify-between text-xs">
                                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Current:</span>
                                        <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                          {driver.outputCurrent}
                                        </span>
                                      </div>
                                    )}
                                    
                                    {driver.inputVoltage && (
                                      <div className="flex items-center justify-between text-xs">
                                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Input:</span>
                                        <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                          {driver.inputVoltage}
                                        </span>
                                      </div>
                                    )}
                                    
                                    {driver.ipRating && (
                                      <div className="flex items-center justify-between text-xs">
                                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>IP Rating:</span>
                                        <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                          {driver.ipRating}
                                        </span>
                                      </div>
                                    )}
                                    
                                    {driver.type && (
                                      <div className="flex items-center justify-between text-xs">
                                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Type:</span>
                                        <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                          {driver.type}
                                        </span>
                                      </div>
                                    )}
                                    
                                    {driver.series && (
                                      <div className="flex items-center justify-between text-xs">
                                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Series:</span>
                                        <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                          {driver.series}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Add Button - Compact */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddDriver(driver);
                                    }}
                                    className="w-full px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    Add
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Terms and Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`max-w-3xl w-full rounded-xl max-h-[90vh] overflow-hidden ${
            isDarkMode ? 'bg-gray-900 border border-white/10' : 'bg-white border border-gray-200 shadow-lg'
          }`}>
            {/* Header */}
            <div className={`p-4 border-b ${
              isDarkMode ? 'border-white/10 bg-gray-900' : 'border-gray-200 bg-white'
            }`}>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className={`text-lg font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <Settings className="w-5 h-5 text-blue-500" />
                    Edit Terms & Conditions
                  </h3>
                  <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Customize terms for your territory
                  </p>
                </div>
                <button
                  onClick={() => setShowTermsModal(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-4">
                {/* Delivery Location */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    1. Delivery Location
                  </label>
                  <input
                    type="text"
                    value={termsAndConditions.deliveryLocation}
                    onChange={(e) => setTermsAndConditions(prev => ({ ...prev, deliveryLocation: e.target.value }))}
                    placeholder="e.g., DDP Bahrain"
                    className={`w-full px-4 py-2.5 rounded-lg text-sm transition-all outline-none ${
                      isDarkMode 
                        ? 'bg-gray-800 border border-white/20 text-white placeholder-gray-500 focus:border-blue-500' 
                        : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                    }`}
                  />
                </div>

                {/* Delivery Time */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    2. Delivery Time
                  </label>
                  <input
                    type="text"
                    value={termsAndConditions.deliveryTime}
                    onChange={(e) => setTermsAndConditions(prev => ({ ...prev, deliveryTime: e.target.value }))}
                    placeholder="e.g., 8-10 Weeks"
                    className={`w-full px-4 py-2.5 rounded-lg text-sm transition-all outline-none ${
                      isDarkMode 
                        ? 'bg-gray-800 border border-white/20 text-white placeholder-gray-500 focus:border-blue-500' 
                        : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                    }`}
                  />
                </div>

                {/* Payment Terms */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    3. Payment Terms
                  </label>
                  <input
                    type="text"
                    value={termsAndConditions.paymentTerms}
                    onChange={(e) => setTermsAndConditions(prev => ({ ...prev, paymentTerms: e.target.value }))}
                    placeholder="e.g., 50% advance and balance 50% on delivery"
                    className={`w-full px-4 py-2.5 rounded-lg text-sm transition-all outline-none ${
                      isDarkMode 
                        ? 'bg-gray-800 border border-white/20 text-white placeholder-gray-500 focus:border-blue-500' 
                        : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                    }`}
                  />
                </div>

                {/* Product Make */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    4. Product Make
                  </label>
                  <input
                    type="text"
                    value={termsAndConditions.productMake}
                    onChange={(e) => setTermsAndConditions(prev => ({ ...prev, productMake: e.target.value }))}
                    placeholder="e.g., Qlite UK make"
                    className={`w-full px-4 py-2.5 rounded-lg text-sm transition-all outline-none ${
                      isDarkMode 
                        ? 'bg-gray-800 border border-white/20 text-white placeholder-gray-500 focus:border-blue-500' 
                        : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                    }`}
                  />
                </div>

                {/* Validity Days */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    5. Validity of Offer
                  </label>
                  <input
                    type="text"
                    value={termsAndConditions.validityDays}
                    onChange={(e) => setTermsAndConditions(prev => ({ ...prev, validityDays: e.target.value }))}
                    placeholder="e.g., 45 days"
                    className={`w-full px-4 py-2.5 rounded-lg text-sm transition-all outline-none ${
                      isDarkMode 
                        ? 'bg-gray-800 border border-white/20 text-white placeholder-gray-500 focus:border-blue-500' 
                        : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                    }`}
                  />
                </div>

                {/* VAT Note */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    6. VAT Note
                  </label>
                  <input
                    type="text"
                    value={termsAndConditions.vatNote}
                    onChange={(e) => setTermsAndConditions(prev => ({ ...prev, vatNote: e.target.value }))}
                    placeholder="e.g., VAT will charged as per applicable government regulations"
                    className={`w-full px-4 py-2.5 rounded-lg text-sm transition-all outline-none ${
                      isDarkMode 
                        ? 'bg-gray-800 border border-white/20 text-white placeholder-gray-500 focus:border-blue-500' 
                        : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                    }`}
                  />
                </div>

                {/* Sales Person Name */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Sales Person Name
                  </label>
                  <input
                    type="text"
                    value={termsAndConditions.salesPersonName}
                    onChange={(e) => setTermsAndConditions(prev => ({ ...prev, salesPersonName: e.target.value }))}
                    placeholder="Enter your name (will appear in closing)"
                    className={`w-full px-4 py-2.5 rounded-lg text-sm transition-all outline-none ${
                      isDarkMode 
                        ? 'bg-gray-800 border border-white/20 text-white placeholder-gray-500 focus:border-blue-500' 
                        : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                    }`}
                  />
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                    Your name will appear after "Yours Sincerely" in the quotation
                  </p>
                </div>

                {/* Preview */}
                <div className={`mt-6 p-4 rounded-lg border ${
                  isDarkMode ? 'bg-gray-800/50 border-white/10' : 'bg-gray-50 border-gray-200'
                }`}>
                  <h4 className={`text-sm font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Preview:
                  </h4>
                  <div className={`text-xs space-y-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <p>1. The prices quoted on {termsAndConditions.deliveryLocation}.</p>
                    <p>2. Delivery: Within {termsAndConditions.deliveryTime} from the date of PO and advance payment.</p>
                    <p>3. Payment Terms: {termsAndConditions.paymentTerms}.</p>
                    <p>4. The quoted products are {termsAndConditions.productMake}</p>
                    <p>5. Validity of offer: {termsAndConditions.validityDays}</p>
                    <p>6. {termsAndConditions.vatNote}</p>
                    <p className="mt-3">Thanking You</p>
                    <p className="mt-2">Yours Sincerely</p>
                    {termsAndConditions.salesPersonName && (
                      <p className="mt-2 font-semibold">{termsAndConditions.salesPersonName}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className={`p-4 border-t ${
              isDarkMode ? 'border-white/10 bg-gray-900' : 'border-gray-200 bg-white'
            }`}>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowTermsModal(false)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-all"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
