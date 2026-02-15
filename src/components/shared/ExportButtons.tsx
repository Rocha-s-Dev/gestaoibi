import { Button } from "@/components/ui/button";
import { FileText, FileSpreadsheet } from "lucide-react";
import { exportToPDF, exportToCSV } from "@/lib/exportUtils";

interface ExportColumn {
  header: string;
  key: string;
  format?: (value: any) => string;
}

interface ExportButtonsProps {
  title: string;
  columns: ExportColumn[];
  data: any[];
  filename: string;
}

export function ExportButtons({ title, columns, data, filename }: ExportButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => exportToPDF(title, columns, data, filename)}
        disabled={data.length === 0}
      >
        <FileText className="h-4 w-4 mr-1" />PDF
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => exportToCSV(columns, data, filename)}
        disabled={data.length === 0}
      >
        <FileSpreadsheet className="h-4 w-4 mr-1" />CSV
      </Button>
    </div>
  );
}
