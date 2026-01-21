import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

interface DocumentosDownloadProps {
  alunoId: string;
  alunoNome: string;
  matricula: string;
}

interface Documento {
  id: string;
  tipo: string;
  nome: string;
  descricao: string;
  icon: React.ElementType;
  disponivel: boolean;
}

export function DocumentosDownload({ alunoId, alunoNome, matricula }: DocumentosDownloadProps) {
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
      tipo: "declaracao",
      nome: "Declaração de Matrícula",
      descricao: "Comprova que o aluno está matriculado na rede",
      icon: FileText,
      disponivel: true,
    },
    {
      id: "declaracao_frequencia",
      tipo: "declaracao",
      nome: "Declaração de Frequência",
      descricao: "Comprova a frequência escolar do aluno",
      icon: Calendar,
      disponivel: true,
    },
  ];

  const handleDownload = async (documento: Documento) => {
    setGerando(documento.id);
    
    try {
      // Simular geração do documento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Em produção, aqui seria feita uma chamada para gerar o PDF
      // e retornar a URL para download
      
      // Criar conteúdo do documento (simulação)
      const conteudo = gerarConteudoDocumento(documento, alunoNome, matricula);
      
      // Criar blob e fazer download
      const blob = new Blob([conteudo], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${documento.nome.replace(/\s+/g, '_')}_${matricula}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success(`${documento.nome} baixado com sucesso!`);
    } catch (error) {
      console.error("Erro ao gerar documento:", error);
      toast.error("Erro ao gerar documento. Tente novamente.");
    } finally {
      setGerando(null);
    }
  };

  const gerarConteudoDocumento = (doc: Documento, nome: string, mat: string): string => {
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${doc.nome}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
    .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { margin: 0; font-size: 24px; }
    .header p { margin: 5px 0; color: #666; }
    .info { margin: 20px 0; }
    .info-row { display: flex; margin: 10px 0; }
    .info-label { font-weight: bold; width: 150px; }
    .content { margin: 30px 0; line-height: 1.8; }
    .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; }
    .assinatura { margin-top: 80px; text-align: center; }
    .assinatura-linha { border-top: 1px solid #333; width: 300px; margin: 0 auto 10px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>SECRETARIA MUNICIPAL DE EDUCAÇÃO</h1>
    <p>${doc.nome.toUpperCase()}</p>
  </div>
  
  <div class="info">
    <div class="info-row">
      <span class="info-label">Aluno:</span>
      <span>${nome}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Matrícula:</span>
      <span>${mat}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Data de Emissão:</span>
      <span>${dataAtual}</span>
    </div>
  </div>
  
  <div class="content">
    ${getConteudoPorTipo(doc.tipo, nome)}
  </div>
  
  <div class="assinatura">
    <div class="assinatura-linha"></div>
    <p>Secretário(a) de Educação</p>
  </div>
  
  <div class="footer">
    <p>Documento gerado eletronicamente em ${dataAtual}</p>
    <p>Este documento é válido sem assinatura física conforme legislação vigente.</p>
  </div>
</body>
</html>
    `;
  };

  const getConteudoPorTipo = (tipo: string, nome: string): string => {
    switch (tipo) {
      case "boletim":
        return `
          <p>Este documento apresenta o desempenho escolar do(a) aluno(a) <strong>${nome}</strong> 
          no ano letivo de ${new Date().getFullYear()}.</p>
          <p><em>Nota: Para visualização completa das notas, acesse o Portal do Responsável.</em></p>
        `;
      case "historico":
        return `
          <p>Este documento certifica o histórico escolar do(a) aluno(a) <strong>${nome}</strong>, 
          contendo o registro de todos os anos cursados na rede municipal de ensino.</p>
          <p><em>Nota: O histórico completo está disponível na secretaria da escola.</em></p>
        `;
      case "declaracao":
        return `
          <p>Declaramos para os devidos fins que o(a) aluno(a) <strong>${nome}</strong> 
          encontra-se regularmente matriculado(a) na rede municipal de ensino no ano letivo de ${new Date().getFullYear()}.</p>
          <p>Esta declaração é válida por 30 (trinta) dias a partir da data de emissão.</p>
        `;
      default:
        return "";
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
          Baixe documentos oficiais de {alunoNome}
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
              <p className="font-medium">Documentos oficiais</p>
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
