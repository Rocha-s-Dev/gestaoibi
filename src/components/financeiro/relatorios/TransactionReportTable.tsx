
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowUpDown, Download, FileText, FileSpreadsheet } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";

type TransactionReportTableProps = {
  transactions: any[];
  loading: boolean;
};

export function TransactionReportTable({ transactions, loading }: TransactionReportTableProps) {
  const [sortColumn, setSortColumn] = useState("transaction_date");
  const [sortDirection, setSortDirection] = useState("desc");

  // Formatador de moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Função para ordenar os dados
  const sortedTransactions = [...transactions].sort((a, b) => {
    if (sortColumn === "transaction_date") {
      const dateA = new Date(a.transaction_date).getTime();
      const dateB = new Date(b.transaction_date).getTime();
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    }
    
    if (sortColumn === "amount") {
      return sortDirection === "asc" 
        ? Number(a.amount) - Number(b.amount) 
        : Number(b.amount) - Number(a.amount);
    }
    
    if (sortColumn === "description") {
      return sortDirection === "asc"
        ? a.description.localeCompare(b.description)
        : b.description.localeCompare(a.description);
    }
    
    return 0;
  });

  // Função para alternar a ordenação
  const toggleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Função para exportar para PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Adicionar título
    doc.setFontSize(18);
    doc.text("Relatório de Transações Financeiras", 14, 22);
    doc.setFontSize(12);
    doc.text(`Data de geração: ${format(new Date(), "dd/MM/yyyy")}`, 14, 30);
    
    // Adicionar cabeçalho da tabela
    doc.setFontSize(10);
    doc.text("Data", 14, 45);
    doc.text("Descrição", 40, 45);
    doc.text("Categoria", 100, 45);
    doc.text("Departamento", 140, 45);
    doc.text("Valor", 185, 45);
    
    // Adicionar linha horizontal
    doc.line(14, 48, 196, 48);
    
    // Adicionar dados da tabela
    let y = 55;
    
    sortedTransactions.forEach((transaction, index) => {
      // Verificar se precisa adicionar uma nova página
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      
      const date = format(new Date(transaction.transaction_date), "dd/MM/yyyy");
      const description = transaction.description.substring(0, 30);
      const category = transaction.category?.name || "";
      const department = transaction.department?.name || "N/A";
      const amount = formatCurrency(Number(transaction.amount));
      
      // Definir cor com base no tipo
      if (transaction.type === "receita") {
        doc.setTextColor(34, 197, 94); // Verde
      } else {
        doc.setTextColor(239, 68, 68); // Vermelho
      }
      
      doc.text(date, 14, y);
      
      // Voltar para cor padrão para os outros campos
      doc.setTextColor(0, 0, 0);
      
      doc.text(description, 40, y);
      doc.text(category, 100, y);
      doc.text(department, 140, y);
      
      // Definir cor novamente para o valor
      if (transaction.type === "receita") {
        doc.setTextColor(34, 197, 94);
      } else {
        doc.setTextColor(239, 68, 68);
      }
      
      doc.text(amount, 185, y, { align: "right" });
      
      // Resetar cor
      doc.setTextColor(0, 0, 0);
      
      y += 8;
      
      // Adicionar linha horizontal leve entre as linhas
      if (index < sortedTransactions.length - 1) {
        doc.setDrawColor(220, 220, 220);
        doc.line(14, y - 4, 196, y - 4);
      }
    });
    
    // Adicionar rodapé com totais
    const totalReceitas = sortedTransactions
      .filter(t => t.type === "receita")
      .reduce((sum, t) => sum + Number(t.amount), 0);
      
    const totalDespesas = sortedTransactions
      .filter(t => t.type === "despesa")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    y += 10;
    
    doc.line(14, y - 4, 196, y - 4);
    doc.setFontSize(11);
    
    doc.text("Total de Receitas:", 130, y + 5);
    doc.setTextColor(34, 197, 94);
    doc.text(formatCurrency(totalReceitas), 185, y + 5, { align: "right" });
    
    doc.setTextColor(0, 0, 0);
    doc.text("Total de Despesas:", 130, y + 13);
    doc.setTextColor(239, 68, 68);
    doc.text(formatCurrency(totalDespesas), 185, y + 13, { align: "right" });
    
    doc.setTextColor(0, 0, 0);
    doc.text("Saldo:", 130, y + 21);
    
    const saldo = totalReceitas - totalDespesas;
    if (saldo >= 0) {
      doc.setTextColor(34, 197, 94);
    } else {
      doc.setTextColor(239, 68, 68);
    }
    
    doc.text(formatCurrency(saldo), 185, y + 21, { align: "right" });
    
    // Salvar o PDF
    doc.save("relatorio-financeiro.pdf");
  };

  // Função para exportar para Excel
  const exportToExcel = () => {
    // Preparar dados para o Excel
    const worksheetData = sortedTransactions.map(transaction => ({
      Data: format(new Date(transaction.transaction_date), "dd/MM/yyyy"),
      Tipo: transaction.type === "receita" ? "Receita" : "Despesa",
      Descrição: transaction.description,
      Categoria: transaction.category?.name || "",
      Departamento: transaction.department?.name || "N/A",
      Valor: Number(transaction.amount)
    }));
    
    // Criar planilha
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    
    // Aplicar formatação de moeda à coluna de valor
    const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
    for (let row = range.s.r + 1; row <= range.e.r; row++) {
      const cell = worksheet[XLSX.utils.encode_cell({ r: row, c: 5 })]; // Coluna Valor (F)
      if (cell && cell.v) {
        cell.z = '"R$"#,##0.00';
      }
    }
    
    // Criar workbook e adicionar a planilha
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transações");
    
    // Gerar arquivo e fazer download
    XLSX.writeFile(workbook, "relatorio-financeiro.xlsx");
  };

  if (loading) {
    return (
      <div className="w-full rounded-md p-4 flex items-center justify-center">
        <p className="text-muted-foreground">Carregando transações...</p>
      </div>
    );
  }

  if (!transactions.length) {
    return (
      <div className="w-full rounded-md p-4 flex items-center justify-center">
        <p className="text-muted-foreground">Nenhuma transação encontrada no período selecionado</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">
          {transactions.length} transações encontradas
        </h3>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={exportToPDF}>
              <FileText className="h-4 w-4 mr-2" />
              Exportar para PDF
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={exportToExcel}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Exportar para Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-muted/30"
                onClick={() => toggleSort("transaction_date")}
              >
                <div className="flex items-center space-x-1">
                  <span>Data</span>
                  {sortColumn === "transaction_date" && (
                    <ArrowUpDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/30"
                onClick={() => toggleSort("description")}
              >
                <div className="flex items-center space-x-1">
                  <span>Descrição</span>
                  {sortColumn === "description" && (
                    <ArrowUpDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Departamento</TableHead>
              <TableHead 
                className="text-right cursor-pointer hover:bg-muted/30"
                onClick={() => toggleSort("amount")}
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Valor</span>
                  {sortColumn === "amount" && (
                    <ArrowUpDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  {format(new Date(transaction.transaction_date), "dd/MM/yyyy")}
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      transaction.type === "receita"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {transaction.type === "receita" ? "Receita" : "Despesa"}
                  </span>
                </TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell>{transaction.category?.name}</TableCell>
                <TableCell>{transaction.department?.name || "N/A"}</TableCell>
                <TableCell
                  className={`text-right font-medium ${
                    transaction.type === "receita" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatCurrency(Number(transaction.amount))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
