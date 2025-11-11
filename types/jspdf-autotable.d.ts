import 'jspdf-autotable';

declare module 'jspdf-autotable' {
  interface CellDef {
    content?: string | number;
    colSpan?: number;
    rowSpan?: number;
    styles?: Partial<Styles>;
  }

  interface CellHookData {
    cell: {
      raw: string | number | CellDef;
      text: string[];
      styles: Styles;
      section: 'head' | 'body' | 'foot';
      x: number;
      y: number;
      width: number;
      height: number;
      textPos: { x: number; y: number };
      padding: number | { top: number; right: number; bottom: number; left: number };
    };
    row: {
      index: number;
      raw: any;
      cells: any;
      section: 'head' | 'body' | 'foot';
      height: number;
      y: number;
    };
    column: {
      index: number;
      dataKey: string | number;
      raw: any;
    };
    section: 'head' | 'body' | 'foot';
    table?: {
      body: any[];
      head: any[];
      foot: any[];
    };
    doc: any;
    cursor?: { x: number; y: number };
  }

  interface Styles {
    font?: string;
    fontStyle?: 'normal' | 'bold' | 'italic' | 'bolditalic';
    overflow?: 'linebreak' | 'ellipsize' | 'visible' | 'hidden';
    fillColor?: number | [number, number, number] | false;
    textColor?: number | [number, number, number];
    cellPadding?: number | { top: number; right: number; bottom: number; left: number };
    fontSize?: number;
    lineColor?: number | [number, number, number];
    lineWidth?: number | { top: number; right: number; bottom: number; left: number };
    minCellHeight?: number;
    minCellWidth?: number;
    halign?: 'left' | 'center' | 'right';
    valign?: 'top' | 'middle' | 'bottom';
    cellWidth?: 'auto' | 'wrap' | number;
  }

  interface UserOptions {
    head?: any[][];
    body?: any[][];
    foot?: any[][];
    columns?: any[];
    theme?: 'striped' | 'grid' | 'plain';
    styles?: Partial<Styles>;
    headStyles?: Partial<Styles>;
    bodyStyles?: Partial<Styles>;
    footStyles?: Partial<Styles>;
    alternateRowStyles?: Partial<Styles>;
    columnStyles?: { [key: string | number]: Partial<Styles> };
    margin?: number | { top?: number; right?: number; bottom?: number; left?: number };
    startY?: number;
    pageBreak?: 'auto' | 'avoid' | 'always';
    rowPageBreak?: 'auto' | 'avoid';
    tableWidth?: 'auto' | 'wrap' | number;
    showHead?: 'everyPage' | 'firstPage' | 'never';
    showFoot?: 'everyPage' | 'lastPage' | 'never';
    tableLineColor?: number | [number, number, number];
    tableLineWidth?: number;
    didParseCell?: (data: CellHookData) => void;
    willDrawCell?: (data: CellHookData) => void;
    didDrawCell?: (data: CellHookData) => void;
    didDrawPage?: (data: any) => void;
  }
}
