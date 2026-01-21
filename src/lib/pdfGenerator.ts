import jsPDF from "jspdf";
import "jspdf-autotable";

// Extend jsPDF type to include autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: { finalY: number };
  }
}

export interface AlunoData {
  nome: string;
  numero_matricula: string;
  data_nascimento: string;
  escola?: string;
  turma?: string;
  serie?: string;
}

export interface NotaItem {
  disciplina: string;
  bimestre1?: number | null;
  bimestre2?: number | null;
  bimestre3?: number | null;
  bimestre4?: number | null;
  media?: number;
  situacao?: string;
}

export interface HistoricoItem {
  ano_letivo: number;
  escola_nome: string;
  serie: string;
  turma_nome?: string;
  notas_finais: Record<string, number>;
  media_geral: number;
  total_faltas: number;
  percentual_frequencia: number;
  situacao: string;
}

function addHeader(doc: jsPDF, titulo: string, subtitulo?: string) {
  const pageWidth = doc.internal.pageSize.width;
  
  // Cabeçalho
  doc.setFillColor(59, 130, 246); // Primary blue
  doc.rect(0, 0, pageWidth, 45, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("SECRETARIA MUNICIPAL DE EDUCAÇÃO", pageWidth / 2, 18, { align: "center" });
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text(titulo.toUpperCase(), pageWidth / 2, 30, { align: "center" });
  
  if (subtitulo) {
    doc.setFontSize(10);
    doc.text(subtitulo, pageWidth / 2, 40, { align: "center" });
  }
  
  doc.setTextColor(0, 0, 0);
}

function addFooter(doc: jsPDF, pageNumber: number = 1) {
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  
  doc.setDrawColor(200, 200, 200);
  doc.line(20, pageHeight - 40, pageWidth - 20, pageHeight - 40);
  
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(
    `Documento gerado eletronicamente em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`,
    pageWidth / 2,
    pageHeight - 30,
    { align: "center" }
  );
  doc.text(
    "Este documento é válido sem assinatura física conforme legislação vigente.",
    pageWidth / 2,
    pageHeight - 22,
    { align: "center" }
  );
  doc.text(`Página ${pageNumber}`, pageWidth - 25, pageHeight - 10);
}

function addAlunoInfo(doc: jsPDF, aluno: AlunoData, startY: number): number {
  const pageWidth = doc.internal.pageSize.width;
  
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(20, startY, pageWidth - 40, 35, 3, 3, "F");
  
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text("NOME DO ALUNO", 25, startY + 8);
  doc.text("MATRÍCULA", 120, startY + 8);
  doc.text("DATA DE NASCIMENTO", 170, startY + 8);
  
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text(aluno.nome, 25, startY + 18);
  doc.text(aluno.numero_matricula, 120, startY + 18);
  doc.text(new Date(aluno.data_nascimento).toLocaleDateString("pt-BR"), 170, startY + 18);
  
  if (aluno.escola) {
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "normal");
    doc.text("ESCOLA", 25, startY + 26);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(aluno.escola, 50, startY + 26);
    
    if (aluno.turma) {
      doc.setTextColor(100, 100, 100);
      doc.text("TURMA", 120, startY + 26);
      doc.setTextColor(0, 0, 0);
      doc.text(aluno.turma, 145, startY + 26);
    }
  }
  
  doc.setFont("helvetica", "normal");
  return startY + 45;
}

export function gerarBoletimPDF(aluno: AlunoData, notas: NotaItem[], anoLetivo: number): jsPDF {
  const doc = new jsPDF();
  
  addHeader(doc, "Boletim Escolar", `Ano Letivo ${anoLetivo}`);
  
  let currentY = addAlunoInfo(doc, aluno, 55);
  
  // Tabela de notas
  const tableData = notas.map((n) => [
    n.disciplina,
    n.bimestre1?.toFixed(1) || "-",
    n.bimestre2?.toFixed(1) || "-",
    n.bimestre3?.toFixed(1) || "-",
    n.bimestre4?.toFixed(1) || "-",
    n.media?.toFixed(1) || "-",
    n.situacao || "-",
  ]);
  
  doc.autoTable({
    startY: currentY,
    head: [["Disciplina", "1º Bim", "2º Bim", "3º Bim", "4º Bim", "Média", "Situação"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontSize: 10,
      fontStyle: "bold",
      halign: "center",
    },
    bodyStyles: {
      fontSize: 9,
      halign: "center",
    },
    columnStyles: {
      0: { halign: "left", cellWidth: 50 },
    },
    margin: { left: 20, right: 20 },
    didParseCell: function(data: any) {
      // Colorir células de média com base no valor
      if (data.section === "body" && data.column.index === 5) {
        const value = parseFloat(data.cell.raw);
        if (!isNaN(value)) {
          if (value >= 7) {
            data.cell.styles.textColor = [22, 163, 74]; // Green
          } else if (value >= 5) {
            data.cell.styles.textColor = [202, 138, 4]; // Yellow
          } else {
            data.cell.styles.textColor = [220, 38, 38]; // Red
          }
        }
      }
    },
  });
  
  // Legenda
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text("Média para Aprovação: 6.0 | Frequência Mínima: 75%", 20, finalY);
  
  addFooter(doc);
  
  return doc;
}

export function gerarHistoricoPDF(aluno: AlunoData, historicos: HistoricoItem[]): jsPDF {
  const doc = new jsPDF();
  
  addHeader(doc, "Histórico Escolar");
  
  let currentY = addAlunoInfo(doc, aluno, 55);
  
  historicos.forEach((h, index) => {
    if (currentY > 230) {
      doc.addPage();
      currentY = 20;
    }
    
    // Cabeçalho do ano
    doc.setFillColor(240, 240, 240);
    doc.roundedRect(20, currentY, doc.internal.pageSize.width - 40, 12, 2, 2, "F");
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(59, 130, 246);
    doc.text(`${h.ano_letivo}`, 25, currentY + 8);
    
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.text(`${h.escola_nome} - ${h.serie}`, 55, currentY + 8);
    
    // Badge de situação
    const situacaoColor = h.situacao === "aprovado" ? [22, 163, 74] : 
                          h.situacao === "reprovado" ? [220, 38, 38] : [100, 100, 100];
    doc.setTextColor(situacaoColor[0], situacaoColor[1], situacaoColor[2]);
    doc.setFontSize(9);
    doc.text(h.situacao.toUpperCase(), doc.internal.pageSize.width - 45, currentY + 8);
    
    currentY += 18;
    
    // Tabela de notas do ano
    const notasData = Object.entries(h.notas_finais).map(([disciplina, nota]) => [
      disciplina,
      nota.toFixed(1),
    ]);
    
    if (notasData.length > 0) {
      doc.autoTable({
        startY: currentY,
        head: [["Disciplina", "Nota Final"]],
        body: notasData,
        theme: "plain",
        headStyles: {
          fillColor: [245, 245, 245],
          textColor: [60, 60, 60],
          fontSize: 9,
          fontStyle: "bold",
        },
        bodyStyles: {
          fontSize: 9,
        },
        columnStyles: {
          0: { cellWidth: 100 },
          1: { halign: "center", cellWidth: 30 },
        },
        margin: { left: 25, right: 25 },
        tableWidth: 130,
      });
      
      currentY = doc.lastAutoTable.finalY + 5;
    }
    
    // Resumo do ano
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Média Geral: ${h.media_geral.toFixed(1)} | Faltas: ${h.total_faltas} | Frequência: ${h.percentual_frequencia.toFixed(1)}%`, 25, currentY);
    
    currentY += 15;
  });
  
  // Linha de assinatura
  currentY += 10;
  if (currentY < 240) {
    doc.setDrawColor(0, 0, 0);
    doc.line(doc.internal.pageSize.width / 2 - 40, currentY + 30, doc.internal.pageSize.width / 2 + 40, currentY + 30);
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text("Secretário(a) de Educação", doc.internal.pageSize.width / 2, currentY + 38, { align: "center" });
  }
  
  addFooter(doc);
  
  return doc;
}

export function gerarDeclaracaoMatriculaPDF(aluno: AlunoData, anoLetivo: number): jsPDF {
  const doc = new jsPDF();
  
  addHeader(doc, "Declaração de Matrícula");
  
  let currentY = addAlunoInfo(doc, aluno, 55);
  
  currentY += 20;
  
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  
  const texto = `Declaramos para os devidos fins que o(a) aluno(a) ${aluno.nome}, portador(a) da matrícula nº ${aluno.numero_matricula}, nascido(a) em ${new Date(aluno.data_nascimento).toLocaleDateString("pt-BR")}, encontra-se regularmente matriculado(a) na rede municipal de ensino no ano letivo de ${anoLetivo}${aluno.escola ? `, na ${aluno.escola}` : ""}${aluno.turma ? `, turma ${aluno.turma}` : ""}.`;
  
  const splitText = doc.splitTextToSize(texto, 170);
  doc.text(splitText, 20, currentY);
  
  currentY += splitText.length * 7 + 20;
  
  doc.text("Esta declaração é válida por 30 (trinta) dias a partir da data de emissão.", 20, currentY);
  
  currentY += 50;
  
  // Data e local
  doc.text(`${aluno.escola ? aluno.escola.split(" - ")[0] : "Município"}, ${new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}`, doc.internal.pageSize.width / 2, currentY, { align: "center" });
  
  currentY += 40;
  
  // Assinatura
  doc.setDrawColor(0, 0, 0);
  doc.line(doc.internal.pageSize.width / 2 - 50, currentY, doc.internal.pageSize.width / 2 + 50, currentY);
  doc.setFontSize(10);
  doc.text("Secretário(a) de Educação", doc.internal.pageSize.width / 2, currentY + 8, { align: "center" });
  
  addFooter(doc);
  
  return doc;
}

export function gerarDeclaracaoFrequenciaPDF(
  aluno: AlunoData, 
  anoLetivo: number,
  totalAulas: number,
  totalFaltas: number,
  percentualFrequencia: number
): jsPDF {
  const doc = new jsPDF();
  
  addHeader(doc, "Declaração de Frequência");
  
  let currentY = addAlunoInfo(doc, aluno, 55);
  
  currentY += 20;
  
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  
  const texto = `Declaramos para os devidos fins que o(a) aluno(a) ${aluno.nome}, portador(a) da matrícula nº ${aluno.numero_matricula}, nascido(a) em ${new Date(aluno.data_nascimento).toLocaleDateString("pt-BR")}, encontra-se frequentando regularmente as aulas na rede municipal de ensino no ano letivo de ${anoLetivo}.`;
  
  const splitText = doc.splitTextToSize(texto, 170);
  doc.text(splitText, 20, currentY);
  
  currentY += splitText.length * 7 + 20;
  
  // Quadro de frequência
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(40, currentY, 130, 40, 3, 3, "F");
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("TOTAL DE AULAS", 60, currentY + 12);
  doc.text("FALTAS", 110, currentY + 12);
  doc.text("FREQUÊNCIA", 150, currentY + 12);
  
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text(totalAulas.toString(), 60, currentY + 28);
  doc.text(totalFaltas.toString(), 110, currentY + 28);
  
  const freqColor = percentualFrequencia >= 75 ? [22, 163, 74] : [220, 38, 38];
  doc.setTextColor(freqColor[0], freqColor[1], freqColor[2]);
  doc.text(`${percentualFrequencia.toFixed(1)}%`, 150, currentY + 28);
  
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  
  currentY += 60;
  
  doc.setFontSize(12);
  doc.text("Esta declaração é válida por 30 (trinta) dias a partir da data de emissão.", 20, currentY);
  
  currentY += 50;
  
  // Data e local
  doc.text(`${aluno.escola ? aluno.escola.split(" - ")[0] : "Município"}, ${new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}`, doc.internal.pageSize.width / 2, currentY, { align: "center" });
  
  currentY += 40;
  
  // Assinatura
  doc.setDrawColor(0, 0, 0);
  doc.line(doc.internal.pageSize.width / 2 - 50, currentY, doc.internal.pageSize.width / 2 + 50, currentY);
  doc.setFontSize(10);
  doc.text("Secretário(a) de Educação", doc.internal.pageSize.width / 2, currentY + 8, { align: "center" });
  
  addFooter(doc);
  
  return doc;
}
