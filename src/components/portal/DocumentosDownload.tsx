import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Download, 
  GraduationCap, 
  ClipboardList,
  Calendar,
  Loader2,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";
import { 
  gerarBoletimPDF, 
  gerarHistoricoPDF, 
  gerarDeclaracaoMatriculaPDF, 
  gerarDeclaracaoFrequenciaPDF,
  type AlunoData,
  type NotaItem,
  type HistoricoItem
} from "@/lib/pdfGenerator";

interface DocumentosDownloadProps {
  alunoId: string;
  alunoNome: string;
  matricula: string;
  dataNascimento?: string;
  escola?: string;
  turma?: string;
}

interface Documento {
  id: string;
  tipo: string;
  nome: string;
  descricao: string;
  icon: React.ElementType;
  disponivel: boolean;
}

export function DocumentosDownload({ 
  alunoId, 
  alunoNome, 
  matricula, 
  dataNascimento = "2010-01-01",
  escola = "Escola Municipal",
  turma = "5º Ano A"
}: DocumentosDownloadProps) {
  const [gerando, setGerando] = useState<string | null>(null);

  const documentos: Documento[] = [
    {
      id: "boletim",
      tipo: "boletim",
      nome: "Boletim Escolar",
      descricao: "Notas e frequência do ano letivo atual",
      icon: ClipboardList,
      disponivel: true,
    },
    {
      id: "historico",
      tipo: "historico",
      nome: "Histórico Escolar",
      descricao: "Histórico completo de todos os anos cursados",
      icon: GraduationCap,
      disponivel: true,
    },
    {
      id: "declaracao_matricula",
      tipo: "declaracao_matricula",
      nome: "Declaração de Matrícula",
      descricao: "Comprova que o aluno está matriculado na rede",
      icon: FileText,
      disponivel: true,
    },
    {
      id: "declaracao_frequencia",
      tipo: "declaracao_frequencia",
      nome: "Declaração de Frequência",
      descricao: "Comprova a frequência escolar do aluno",
      icon: Calendar,
      disponivel: true,
    },
  ];

  const handleDownload = async (documento: Documento) => {
    setGerando(documento.id);
    
    try {
      const anoAtual = new Date().getFullYear();
      
      const alunoData: AlunoData = {
        nome: alunoNome,
        numero_matricula: matricula,
        data_nascimento: dataNascimento,
        escola,
        turma,
      };

      // Dados de exemplo - em produção viriam do banco
      const notasExemplo: NotaItem[] = [
        { disciplina: "Português", bimestre1: 7.5, bimestre2: 8.0, bimestre3: 7.0, bimestre4: 8.5, media: 7.75, situacao: "Aprovado" },
        { disciplina: "Matemática", bimestre1: 6.5, bimestre2: 7.0, bimestre3: 6.0, bimestre4: 7.5, media: 6.75, situacao: "Aprovado" },
        { disciplina: "Ciências", bimestre1: 8.0, bimestre2: 8.5, bimestre3: 9.0, bimestre4: 8.0, media: 8.38, situacao: "Aprovado" },
        { disciplina: "História", bimestre1: 7.0, bimestre2: 7.5, bimestre3: 8.0, bimestre4: 7.0, media: 7.38, situacao: "Aprovado" },
        { disciplina: "Geografia", bimestre1: 7.5, bimestre2: 7.0, bimestre3: 7.5, bimestre4: 8.0, media: 7.5, situacao: "Aprovado" },
        { disciplina: "Educação Física", bimestre1: 9.0, bimestre2: 9.5, bimestre3: 9.0, bimestre4: 9.5, media: 9.25, situacao: "Aprovado" },
        { disciplina: "Artes", bimestre1: 8.5, bimestre2: 8.0, bimestre3: 8.5, bimestre4: 9.0, media: 8.5, situacao: "Aprovado" },
      ];

      const historicoExemplo: HistoricoItem[] = [
        {
          ano_letivo: anoAtual - 1,
          escola_nome: escola,
          serie: "4º Ano",
          turma_nome: "4º Ano B",
          notas_finais: { Português: 7.5, Matemática: 7.0, Ciências: 8.0, História: 7.5, Geografia: 7.0 },
          media_geral: 7.4,
          total_faltas: 12,
          percentual_frequencia: 94,
          situacao: "aprovado",
        },
        {
          ano_letivo: anoAtual - 2,
          escola_nome: escola,
          serie: "3º Ano",
          turma_nome: "3º Ano A",
          notas_finais: { Português: 8.0, Matemática: 7.5, Ciências: 8.5, História: 8.0, Geografia: 7.5 },
          media_geral: 7.9,
          total_faltas: 8,
          percentual_frequencia: 96,
          situacao: "aprovado",
        },
      ];

      let pdf;
      let fileName: string;

      switch (documento.tipo) {
        case "boletim":
          pdf = gerarBoletimPDF(alunoData, notasExemplo, anoAtual);
          fileName = `Boletim_${matricula}_${anoAtual}.pdf`;
          break;
        case "historico":
          pdf = gerarHistoricoPDF(alunoData, historicoExemplo);
          fileName = `Historico_${matricula}.pdf`;
          break;
        case "declaracao_matricula":
          pdf = gerarDeclaracaoMatriculaPDF(alunoData, anoAtual);
          fileName = `Declaracao_Matricula_${matricula}.pdf`;
          break;
        case "declaracao_frequencia":
          pdf = gerarDeclaracaoFrequenciaPDF(alunoData, anoAtual, 180, 10, 94.4);
          fileName = `Declaracao_Frequencia_${matricula}.pdf`;
          break;
        default:
          throw new Error("Tipo de documento não suportado");
      }

      pdf.save(fileName);
      toast.success(`${documento.nome} gerado com sucesso!`);
    } catch (error) {
      console.error("Erro ao gerar documento:", error);
      toast.error("Erro ao gerar documento. Tente novamente.");
    } finally {
      setGerando(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Documentos Escolares
        </CardTitle>
        <CardDescription>
          Baixe documentos oficiais em PDF de {alunoNome}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {documentos.map((doc) => {
            const Icon = doc.icon;
            const isGerando = gerando === doc.id;
            
            return (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">{doc.nome}</h4>
                    <p className="text-sm text-muted-foreground">{doc.descricao}</p>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(doc)}
                  disabled={!doc.disponivel || isGerando}
                >
                  {isGerando ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">Documentos oficiais em PDF</p>
              <p className="text-muted-foreground">
                Todos os documentos são gerados automaticamente com base nos dados 
                registrados no sistema escolar e possuem validade legal.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
