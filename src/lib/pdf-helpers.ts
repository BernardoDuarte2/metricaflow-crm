import jsPDF from "jspdf";

const COLORS = {
  headerBg: [30, 64, 175] as [number, number, number],     // blue-800
  headerText: [255, 255, 255] as [number, number, number],
  sectionTitle: [30, 64, 175] as [number, number, number],
  tableHeaderBg: [219, 234, 254] as [number, number, number], // blue-100
  tableHeaderText: [30, 64, 175] as [number, number, number],
  tableRowEven: [248, 250, 252] as [number, number, number],  // slate-50
  tableRowOdd: [255, 255, 255] as [number, number, number],
  tableBorder: [226, 232, 240] as [number, number, number],   // slate-200
  text: [15, 23, 42] as [number, number, number],             // slate-900
  muted: [100, 116, 139] as [number, number, number],         // slate-500
  success: [22, 163, 74] as [number, number, number],
  danger: [220, 38, 38] as [number, number, number],
  warning: [234, 179, 8] as [number, number, number],
};

const PAGE_MARGIN = 15;

export function getPageWidth(doc: jsPDF): number {
  return doc.internal.pageSize.getWidth();
}

export function getContentWidth(doc: jsPDF): number {
  return getPageWidth(doc) - PAGE_MARGIN * 2;
}

export function checkPageBreak(doc: jsPDF, y: number, needed: number): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (y + needed > pageHeight - 20) {
    doc.addPage();
    drawFooter(doc);
    return 15;
  }
  return y;
}

export function drawHeader(doc: jsPDF, title: string, subtitle?: string): number {
  const pageWidth = getPageWidth(doc);
  doc.setFillColor(...COLORS.headerBg);
  doc.rect(0, 0, pageWidth, 32, "F");

  doc.setTextColor(...COLORS.headerText);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(title, pageWidth / 2, 15, { align: "center" });

  if (subtitle) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(subtitle, pageWidth / 2, 24, { align: "center" });
  }

  return 42;
}

export function drawSection(doc: jsPDF, title: string, y: number): number {
  y = checkPageBreak(doc, y, 15);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.sectionTitle);
  doc.text(title, PAGE_MARGIN, y);
  y += 2;
  doc.setDrawColor(...COLORS.tableBorder);
  doc.setLineWidth(0.5);
  doc.line(PAGE_MARGIN, y, getPageWidth(doc) - PAGE_MARGIN, y);
  doc.setTextColor(...COLORS.text);
  return y + 7;
}

export function drawTable(
  doc: jsPDF,
  headers: string[],
  rows: string[][],
  y: number,
  colWidths?: number[]
): number {
  const contentWidth = getContentWidth(doc);
  const cols = headers.length;
  const widths = colWidths || headers.map(() => contentWidth / cols);
  const rowHeight = 8;

  // Header row
  y = checkPageBreak(doc, y, rowHeight + 4);
  let x = PAGE_MARGIN;
  doc.setFillColor(...COLORS.tableHeaderBg);
  doc.rect(PAGE_MARGIN, y - 5, contentWidth, rowHeight, "F");

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.tableHeaderText);
  headers.forEach((h, i) => {
    doc.text(h, x + 2, y);
    x += widths[i];
  });
  y += rowHeight - 1;

  // Data rows
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.text);
  doc.setFontSize(8);

  rows.forEach((row, rowIndex) => {
    y = checkPageBreak(doc, y, rowHeight);
    x = PAGE_MARGIN;

    const bgColor = rowIndex % 2 === 0 ? COLORS.tableRowOdd : COLORS.tableRowEven;
    doc.setFillColor(...bgColor);
    doc.rect(PAGE_MARGIN, y - 5, contentWidth, rowHeight, "F");

    row.forEach((cell, colIndex) => {
      const maxWidth = widths[colIndex] - 4;
      const truncated = doc.splitTextToSize(cell || "-", maxWidth)[0] || "-";
      doc.text(truncated, x + 2, y);
      x += widths[colIndex];
    });
    y += rowHeight - 1;
  });

  // Bottom border
  doc.setDrawColor(...COLORS.tableBorder);
  doc.setLineWidth(0.3);
  doc.line(PAGE_MARGIN, y - 3, PAGE_MARGIN + contentWidth, y - 3);

  return y + 4;
}

export function drawKeyValuePairs(
  doc: jsPDF,
  pairs: { label: string; value: string }[],
  y: number,
  columns: number = 2
): number {
  const contentWidth = getContentWidth(doc);
  const colWidth = contentWidth / columns;

  doc.setFontSize(9);
  let col = 0;

  for (const pair of pairs) {
    y = checkPageBreak(doc, y, 10);
    const x = PAGE_MARGIN + col * colWidth;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.muted);
    doc.text(pair.label, x, y);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.text);
    doc.text(pair.value, x, y + 5);

    col++;
    if (col >= columns) {
      col = 0;
      y += 14;
    }
  }

  if (col > 0) y += 14;
  return y;
}

export function drawBadge(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  color: [number, number, number]
): void {
  const textWidth = doc.getTextWidth(text);
  doc.setFillColor(...color);
  doc.roundedRect(x, y - 4, textWidth + 6, 6, 1.5, 1.5, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text(text, x + 3, y);
}

export function drawFooter(doc: jsPDF, companyName?: string): void {
  const pageWidth = getPageWidth(doc);
  const pageHeight = doc.internal.pageSize.getHeight();
  const totalPages = doc.getNumberOfPages();
  const currentPage = (doc as any).getCurrentPageInfo?.()?.pageNumber || totalPages;

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.muted);

  if (companyName) {
    doc.text(companyName, PAGE_MARGIN, pageHeight - 8);
  }

  doc.text(
    `Gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
    pageWidth / 2,
    pageHeight - 8,
    { align: "center" }
  );
}

export function addFooterToAllPages(doc: jsPDF, companyName?: string): void {
  const totalPages = doc.getNumberOfPages();
  const pageWidth = getPageWidth(doc);
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.muted);

    if (companyName) {
      doc.text(companyName, PAGE_MARGIN, pageHeight - 8);
    }

    doc.text(`Página ${i} de ${totalPages}`, pageWidth - PAGE_MARGIN, pageHeight - 8, { align: "right" });

    doc.text(
      `Gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: "center" }
    );
  }
}

export function formatCurrency(value: number): string {
  return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export { COLORS, PAGE_MARGIN };
