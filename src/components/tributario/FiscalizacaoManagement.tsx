import { useState, useEffect } from "react";
import { useFiscalizacao, useContribuintes, useImoveis } from "@/hooks/useArrecadacao";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, MapPin, Play, CheckCircle, Camera, AlertTriangle, Smartphone } from "lucide-react";
import { format } from "date-fns";

export function FiscalizacaoManagement() {
  const { fiscalizacoes, isLoading, createFiscalizacao, iniciarFiscalizacao, concluirFiscalizacao } = useFiscalizacao();
  const { contribuintes } = useContribuintes();
  const { imoveis } = useImoveis();
  const [dialogAgendar, setDialogAgendar] = useState(false);
  const [dialogConcluir, setDialogConcluir] = useState(false);
  const [selectedFiscalizacao, setSelectedFiscalizacao] = useState<any>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

  const [agendarForm, setAgendarForm] = useState({
    tipo: "programada",
    contribuinte_id: "",
    imovel_id: "",
    data_agendada: "",
    hora_agendada: "",
    fiscal_nome: "",
  });

  const [concluirForm, setConcluirForm] = useState({
    situacao: "",
    irregularidades: "",
    autoInfracao: false,
    numeroAuto: "",
    valorMulta: "",
    observacoes: "",
  });

  // Obter localização atual
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => console.error("Erro ao obter localização:", error)
      );
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  const handleAgendar = () => {
    createFiscalizacao.mutate(agendarForm, {
      onSuccess: () => {
        setDialogAgendar(false);
        setAgendarForm({
          tipo: "programada",
          contribuinte_id: "",
          imovel_id: "",
          data_agendada: "",
          hora_agendada: "",
          fiscal_nome: "",
        });
      },
    });
  };

  const handleIniciar = (fiscalizacao: any) => {
    getLocation();
    iniciarFiscalizacao.mutate({
      id: fiscalizacao.id,
      latitude: currentLocation?.lat,
      longitude: currentLocation?.lng,
    });
  };

  const handleConcluir = () => {
    if (!selectedFiscalizacao) return;
    getLocation();
    concluirFiscalizacao.mutate({
      id: selectedFiscalizacao.id,
      resultado: {
        situacao: concluirForm.situacao,
        irregularidades: concluirForm.irregularidades.split(",").map((i) => i.trim()).filter(Boolean),
        autoInfracao: concluirForm.autoInfracao,
        numeroAuto: concluirForm.numeroAuto,
        valorMulta: parseFloat(concluirForm.valorMulta) || null,
        observacoes: concluirForm.observacoes,
      },
      latitude: currentLocation?.lat,
      longitude: currentLocation?.lng,
    }, {
      onSuccess: () => {
        setDialogConcluir(false);
        setSelectedFiscalizacao(null);
      },
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      agendada: "outline",
      em_andamento: "secondary",
      concluida: "default",
      cancelada: "destructive",
    };
    const icons: Record<string, any> = {
      agendada: null,
      em_andamento: <Play className="h-3 w-3 mr-1" />,
      concluida: <CheckCircle className="h-3 w-3 mr-1" />,
    };
    return (
      <Badge variant={variants[status] || "outline"} className="flex items-center w-fit">
        {icons[status]}
        {status?.replace("_", " ")}
      </Badge>
    );
  };

  const getTipoBadge = (tipo: string) => {
    const colors: Record<string, string> = {
      programada: "bg-blue-100 text-blue-800",
      denuncia: "bg-red-100 text-red-800",
      oficio: "bg-purple-100 text-purple-800",
      revisao: "bg-amber-100 text-amber-800",
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[tipo] || "bg-gray-100"}`}>
        {tipo}
      </span>
    );
  };

  // Estatísticas
  const agendadas = fiscalizacoes.filter((f: any) => f.status === "agendada").length;
  const emAndamento = fiscalizacoes.filter((f: any) => f.status === "em_andamento").length;
  const concluidas = fiscalizacoes.filter((f: any) => f.status === "concluida").length;
  const comInfracao = fiscalizacoes.filter((f: any) => f.auto_infracao).length;

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-600" />
              Agendadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agendadas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Play className="h-4 w-4 text-orange-600" />
              Em Andamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{emAndamento}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Concluídas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{concluidas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              Com Infração
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{comInfracao}</div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Info */}
      <Card className="border-dashed border-2">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Smartphone className="h-10 w-10 text-muted-foreground" />
            <div>
              <h3 className="font-semibold">Fiscalização Mobile</h3>
              <p className="text-sm text-muted-foreground">
                Este sistema é otimizado para uso em dispositivos móveis. Os fiscais podem iniciar e concluir
                fiscalizações em campo com captura automática de localização GPS.
              </p>
              {currentLocation && (
                <p className="text-xs text-muted-foreground mt-1">
                  📍 Localização atual: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex justify-end">
        <Dialog open={dialogAgendar} onOpenChange={setDialogAgendar}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Agendar Fiscalização
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agendar Fiscalização</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Tipo</Label>
                <Select
                  value={agendarForm.tipo}
                  onValueChange={(v) => setAgendarForm({ ...agendarForm, tipo: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="programada">Programada</SelectItem>
                    <SelectItem value="denuncia">Denúncia</SelectItem>
                    <SelectItem value="oficio">De Ofício</SelectItem>
                    <SelectItem value="revisao">Revisão</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Contribuinte (opcional)</Label>
                <Select
                  value={agendarForm.contribuinte_id}
                  onValueChange={(v) => setAgendarForm({ ...agendarForm, contribuinte_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar contribuinte" />
                  </SelectTrigger>
                  <SelectContent>
                    {contribuintes.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nome_razao_social}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Imóvel (opcional)</Label>
                <Select
                  value={agendarForm.imovel_id}
                  onValueChange={(v) => setAgendarForm({ ...agendarForm, imovel_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar imóvel" />
                  </SelectTrigger>
                  <SelectContent>
                    {imoveis.map((im: any) => (
                      <SelectItem key={im.id} value={im.id}>
                        {im.inscricao_imobiliaria} - {im.logradouro}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Data</Label>
                  <Input
                    type="date"
                    value={agendarForm.data_agendada}
                    onChange={(e) => setAgendarForm({ ...agendarForm, data_agendada: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Hora</Label>
                  <Input
                    type="time"
                    value={agendarForm.hora_agendada}
                    onChange={(e) => setAgendarForm({ ...agendarForm, hora_agendada: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Fiscal Responsável</Label>
                <Input
                  value={agendarForm.fiscal_nome}
                  onChange={(e) => setAgendarForm({ ...agendarForm, fiscal_nome: e.target.value })}
                />
              </div>

              <Button onClick={handleAgendar} className="w-full">
                Agendar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Dialog Concluir */}
      <Dialog open={dialogConcluir} onOpenChange={setDialogConcluir}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Concluir Fiscalização</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Situação Encontrada</Label>
              <Select
                value={concluirForm.situacao}
                onValueChange={(v) => setConcluirForm({ ...concluirForm, situacao: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar situação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="irregular">Irregular</SelectItem>
                  <SelectItem value="parcialmente_irregular">Parcialmente Irregular</SelectItem>
                  <SelectItem value="nao_localizado">Não Localizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Irregularidades (separar por vírgula)</Label>
              <Textarea
                value={concluirForm.irregularidades}
                onChange={(e) => setConcluirForm({ ...concluirForm, irregularidades: e.target.value })}
                placeholder="Área construída divergente, Uso diferente do declarado"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoInfracao"
                checked={concluirForm.autoInfracao}
                onChange={(e) => setConcluirForm({ ...concluirForm, autoInfracao: e.target.checked })}
              />
              <Label htmlFor="autoInfracao">Lavrar Auto de Infração</Label>
            </div>

            {concluirForm.autoInfracao && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nº Auto de Infração</Label>
                  <Input
                    value={concluirForm.numeroAuto}
                    onChange={(e) => setConcluirForm({ ...concluirForm, numeroAuto: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Valor da Multa (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={concluirForm.valorMulta}
                    onChange={(e) => setConcluirForm({ ...concluirForm, valorMulta: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div>
              <Label>Observações</Label>
              <Textarea
                value={concluirForm.observacoes}
                onChange={(e) => setConcluirForm({ ...concluirForm, observacoes: e.target.value })}
              />
            </div>

            <Button onClick={handleConcluir} className="w-full">
              Concluir Fiscalização
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Fiscalizações</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ordem de Serviço</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Contribuinte/Imóvel</TableHead>
                <TableHead>Fiscal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fiscalizacoes.map((f: any) => (
                <TableRow key={f.id}>
                  <TableCell className="font-mono">{f.numero_ordem_servico}</TableCell>
                  <TableCell>{getTipoBadge(f.tipo)}</TableCell>
                  <TableCell>
                    {f.data_agendada && format(new Date(f.data_agendada), "dd/MM/yyyy")}
                    {f.hora_agendada && ` ${f.hora_agendada}`}
                  </TableCell>
                  <TableCell>
                    {f.contribuintes?.nome_razao_social || f.imoveis?.logradouro || "-"}
                  </TableCell>
                  <TableCell>{f.fiscal_nome || "-"}</TableCell>
                  <TableCell>{getStatusBadge(f.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {f.status === "agendada" && (
                        <Button size="sm" variant="outline" onClick={() => handleIniciar(f)}>
                          <Play className="h-4 w-4 mr-1" />
                          Iniciar
                        </Button>
                      )}
                      {f.status === "em_andamento" && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedFiscalizacao(f);
                            setDialogConcluir(true);
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Concluir
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
