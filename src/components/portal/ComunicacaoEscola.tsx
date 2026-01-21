import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Send, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface Mensagem {
  id: string;
  assunto: string;
  conteudo: string;
  data: string;
  remetente: "responsavel" | "escola";
  lida: boolean;
}

interface ComunicacaoEscolaProps {
  alunoId: string;
  alunoNome: string;
  escolaNome?: string;
}

export function ComunicacaoEscola({ alunoId, alunoNome, escolaNome }: ComunicacaoEscolaProps) {
  const [assunto, setAssunto] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [tipo, setTipo] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Simulação de mensagens (em produção viria do banco)
  const [mensagens] = useState<Mensagem[]>([
    {
      id: "1",
      assunto: "Reunião de Pais",
      conteudo: "Informamos que haverá reunião de pais no dia 25/01 às 19h.",
      data: "2026-01-20",
      remetente: "escola",
      lida: true,
    },
    {
      id: "2",
      assunto: "Desempenho Escolar",
      conteudo: "O aluno teve excelente participação na última semana.",
      data: "2026-01-18",
      remetente: "escola",
      lida: true,
    },
  ]);

  const tiposMensagem = [
    { value: "duvida", label: "Dúvida" },
    { value: "solicitacao", label: "Solicitação" },
    { value: "sugestao", label: "Sugestão" },
    { value: "reclamacao", label: "Reclamação" },
    { value: "elogio", label: "Elogio" },
    { value: "outro", label: "Outro" },
  ];

  const handleEnviar = async () => {
    if (!tipo || !assunto || !mensagem) {
      toast.error("Preencha todos os campos");
      return;
    }

    setEnviando(true);
    
    // Simular envio (em produção, salvaria no banco)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Mensagem enviada com sucesso! A escola responderá em breve.");
    
    setAssunto("");
    setMensagem("");
    setTipo("");
    setEnviando(false);
  };

  return (
    <div className="space-y-6">
      {/* Formulário de Nova Mensagem */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Enviar Mensagem
          </CardTitle>
          <CardDescription>
            Entre em contato com a escola de {alunoNome}
            {escolaNome && ` - ${escolaNome}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tipo">Tipo de Mensagem *</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tiposMensagem.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="assunto">Assunto *</Label>
              <Input
                id="assunto"
                value={assunto}
                onChange={(e) => setAssunto(e.target.value)}
                placeholder="Assunto da mensagem"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="mensagem">Mensagem *</Label>
            <Textarea
              id="mensagem"
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              placeholder="Digite sua mensagem..."
              rows={4}
            />
          </div>

          <Button onClick={handleEnviar} disabled={enviando} className="w-full md:w-auto">
            <Send className="h-4 w-4 mr-2" />
            {enviando ? "Enviando..." : "Enviar Mensagem"}
          </Button>
        </CardContent>
      </Card>

      {/* Histórico de Mensagens */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Mensagens Recebidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mensagens.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma mensagem recebida ainda.
            </div>
          ) : (
            <div className="space-y-4">
              {mensagens.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-4 rounded-lg border ${
                    msg.remetente === "escola" ? "bg-muted" : "bg-primary/5"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">{msg.assunto}</h4>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(msg.data).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={msg.remetente === "escola" ? "secondary" : "outline"}>
                        {msg.remetente === "escola" ? "Escola" : "Você"}
                      </Badge>
                      {msg.lida && (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </div>
                  <p className="text-sm">{msg.conteudo}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
