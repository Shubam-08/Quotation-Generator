const fs = require('fs');
const file = 'd:/Websites/qlite-quotation/components/EnhancedCart.tsx';
let content = fs.readFileSync(file, 'utf8');

// Change 1a: Replace logo + address header
const oldHeaderRegex = /doc\.addImage\('\/logo\.jpg', 'JPEG', 14, 10, 80, 90\);\s*\/\/ Get dynamic address[\s\S]*?yPosition \+= 12;\s*\}/;
const newHeader = `// Add logo on left
      doc.addImage('/logo.jpg', 'JPEG', 14, 10, 60, 50);

      // Add headerImage spanning rest of width
      const headerImgData = await fetch('/headerImage.jpeg')
        .then(r => r.arrayBuffer())
        .then(buf => {
          const bytes = new Uint8Array(buf);
          let binary = '';
          bytes.forEach(b => binary += String.fromCharCode(b));
          return btoa(binary);
        });
      doc.addImage(
        'data:image/jpeg;base64,' + headerImgData,
        'JPEG', 74, 10, pageWidth - 88, 50
      );

      // Address block with grey-blue background
      const addrY = 62;
      const addrHeight = 30;
      doc.setFillColor(165, 183, 205);
      doc.rect(14, addrY, pageWidth - 28, addrHeight, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(0, 0, 0);
      const addressInfo = getAddressInfo();
      const addressText = addressInfo.lines.join('   |   ');
      doc.text(addressText, 18, addrY + 10, { 
        maxWidth: pageWidth - 36 
      });`;
content = content.replace(oldHeaderRegex, newHeader);

// Change 1b: Remove the two boxes
const twoBoxesRegex = /\/\/ Add two boxes side by side \([\s\S]*?doc\.text\(exportQuoteNo \|\| userInfo\.invoiceNo \|\| '', rightColX \+ rightLabelWidth, rightY\);/;
content = content.replace(twoBoxesRegex, '');

// Change 2: Update table columns for LED Lights
const oldColumnsRegex = /const columns = hasOnlyLightingControls \? \[[^\]]*\] : \[\s*'SI No', 'Image', 'Model Number', 'Category', 'Application', 'Input Voltage', 'Watt', 'Lumen', 'Beam Angle', 'IP Rating', `Price \(\$\{pdfCurrency\}\)`, 'Quantity', `Total \(\$\{pdfCurrency\}\)`\s*\];/;
const newColumns = `const columns = hasOnlyLightingControls ? [
        'SI No', 'Image', 'Product Name', 'Description', \`Price (\${pdfCurrency})\`, 'Quantity', \`Total (\${pdfCurrency})\`
      ] : [
        'S.No.', 'Description', 'Model No.', 'Image', 
        'Unit', 'Quantity', 'Unit Price', 'Total Amount'
      ];`;
content = content.replace(oldColumnsRegex, newColumns);

// Change 3: Update LED product rows
const oldLedRowRegex = /\/\/ LED Product row - normal format[\s\S]*?index \+ 1,\s*\/\/ SI No[^\]]*?\];/;
const newLedRow = `// LED Product row - normal format
            return [
              index + 1,
              // Description with all specs
              \`Category: \${item.category ?? '-'}\\nType: \${item.type ?? '-'}\\nWattage: \${item.watt ? item.watt + 'W' : '-'}\\nDimension: \${item.dimension ?? '-'}\\nBeam Angle: \${item.beamAngle ?? '-'}\\nLumen: \${item.lumen ?? '-'}\\nIP Rating: \${Array.isArray(item.ipRating) ? item.ipRating.join(', ') : item.ipRating ?? '-'}\`,
              item.sku ?? 'N/A',
              '', // Image column
              'Nos',
              item.quantity ?? 1,
              convertPrice(item.price ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
              (convertPrice(item.price ?? 0) * (item.quantity ?? 1)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            ];`;
content = content.replace(oldLedRowRegex, newLedRow);

// Change 4: Update autoTable config
// First replace startY and cellPadding in styles
content = content.replace(/startY: 165,\s*styles: \{/, 'startY: 95,\n          styles: {');
content = content.replace(/styles: \{\s*fontSize: 8,\s*cellPadding,/, 'styles: {\n            fontSize: 8,\n            cellPadding: { top: 4, right: 3, bottom: 4, left: 3 },');

// Replace headStyles fillColor and textColor
const oldHeadStyles = /headStyles: \{\s*fillColor: \[0, 70, 255\],\s*textColor: 255,/;
const newHeadStyles = `headStyles: {
            fillColor: [183, 183, 183],
            textColor: [0, 0, 0],`;
content = content.replace(oldHeadStyles, newHeadStyles);

// Update columnStyles
const oldColumnStylesRegex = /columnStyles: hasOnlyLightingControls \? \{[^]*?\} : \{[^]*?\}/;
const newColumnStyles = `columnStyles: hasOnlyLightingControls ? {
            0: { cellWidth: 15 },
            1: { cellWidth: 50 }, 
            2: { cellWidth: 'auto', minCellWidth: 70 },
            3: { cellWidth: 'auto', minCellWidth: 50 }  
          } : {
            0: { cellWidth: 20 },        // S.No.
            1: { cellWidth: 'auto' },    // Description
            2: { cellWidth: 55 },        // Model No.
            3: { cellWidth: 55 },        // Image
            4: { cellWidth: 25 },        // Unit
            5: { cellWidth: 30 },        // Quantity
            6: { cellWidth: 45 },        // Unit Price
            7: { cellWidth: 45 },        // Total Amount
          }`;
content = content.replace(oldColumnStylesRegex, newColumnStyles);

// Change 5: Image column index in didDrawCell
// Need to find the specific didDrawCell for ORIGINAL FORMAT FOR LED LIGHTS.
// But wait, there is only one didDrawCell for LED Lights autoTable.
// Let's replace `if (data.column.index === 1) {` with 3. But wait, `hasOnlyLightingControls` still uses index 1.
// So we should do: `const imgColIndex = hasOnlyLightingControls ? 1 : 3; if (data.column.index === imgColIndex) {`
const oldDidDrawCellRegex = /if \(data\.column\.index === 1\) \{\s*const item = organizedCart\[idx\];/;
const newDidDrawCell = `const imgColIndex = hasOnlyLightingControls ? 1 : 3;
              if (data.column.index === imgColIndex) {
                const item = organizedCart[idx];`;
content = content.replace(oldDidDrawCellRegex, newDidDrawCell);

// Change 7: Remove from addTermsAndConditions
const oldTermsEnding = /termsContentY \+= 15;\s*doc\.setFontSize\(9\);\s*doc\.text\('Thanking You', termsBoxX \+ 8, termsContentY\);\s*termsContentY \+= 20;\s*doc\.text\('Yours Sincerely', termsBoxX \+ 8, termsContentY\);\s*if \(termsAndConditions\.salesPersonName\) \{\s*termsContentY \+= 20;\s*doc\.setFont\('helvetica', 'bold'\);\s*doc\.text\(termsAndConditions\.salesPersonName, termsBoxX \+ 8, termsContentY\);\s*\}/;
content = content.replace(oldTermsEnding, '');

fs.writeFileSync(file, content);
console.log('PDF export changes applied successfully.');
