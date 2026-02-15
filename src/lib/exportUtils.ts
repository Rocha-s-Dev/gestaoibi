import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ExportColumn {
  header: string;
  key: string;
  format?: (value: any) => string;
}

export function exportToPDF(
  title: string,
  columns: ExportColumn[],
  data: any[],
  filename: string
) {
  const doc = new jsPDF();
  
  doc.setFontSize(16);
  doc.text(title, 14, 22);
  doc.setFontSize(10);
  doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`, 14, 30);

  const headers = columns.map(c => c.header);
  const rows = data.map(item =>
    columns.map(col => {
      const value = item[col.key];
      return col.format ? col.format(value) : (value ?? "—").toString();
    })
  );

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 36,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  doc.save(`${filename}.pdf`);
}

export function exportToCSV(
  columns: ExportColumn[],
  data: any[],
  filename: string
) {
  const headers = columns.map(c => c.header).join(";");
  const rows = data.map(item =>
    columns.map(col => {
      const value = item[col.key];
      const formatted = col.format ? col.format(value) : (value ?? "").toString();
      return `"${formatted.replace(/"/g, '""')}"`;
    }).join(";")
  );

  const csvContent = "\uFEFF" + [headers, ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}
