import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { User, FileText, MapPin, CreditCard, Users, Star } from "lucide-react";
import { format } from "date-fns";

interface Profile {
  id: string;
  user_id: string;
  name: string | null;
  email: string | null;
  department: string | null;
  role: string;
  cpf?: string | null;
  rg?: string | null;
  rg_orgao_emissor?: string | null;
  rg_uf?: string | null;
  data_nascimento?: string | null;
  sexo?: string | null;
  estado_civil?: string | null;
  nacionalidade?: string | null;
  naturalidade?: string | null;
  nome_mae?: string | null;
  nome_pai?: string | null;
  pis_pasep?: string | null;
  titulo_eleitor?: string | null;
  zona_eleitoral?: string | null;
  secao_eleitoral?: string | null;
  ctps_numero?: string | null;
  ctps_serie?: string | null;
  ctps_uf?: string | null;
  cnh_numero?: string | null;
  cnh_categoria?: string | null;
  cnh_validade?: string | null;
  telefone_residencial?: string | null;
  telefone_celular?: string | null;
  endereco_logradouro?: string | null;
  endereco_numero?: string | null;
  endereco_complemento?: string | null;
  endereco_bairro?: string | null;
  endereco_cidade?: string | null;
  endereco_uf?: string | null;
  endereco_cep?: string | null;
  observacoes?: string | null;
  created_at: string;
  updated_at: string;
}

interface ViewServidorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  servidor?: Profile;
}

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  mayor: "Prefeito",
  secretary: "Secretário",
  employee: "Funcionário",
};

const estadoCivilLabels: Record<string, string> = {
  solteiro: "Solteiro(a)",
  casado: "Casado(a)",
  divorciado: "Divorciado(a)",
  viuvo: "Viúvo(a)",
  uniao_estavel: "União Estável",
};

const sexoLabels: Record<string, string> = {
  M: "Masculino",
  F: "Feminino",
  O: "Outro",
};

function InfoItem({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <h4 className="text-xs font-medium text-muted-foreground mb-0.5">{label}</h4>
      <p className="text-sm">{value || "-"}</p>
    </div>
  );
}

export function ViewServidorDialog({
  open,
  onOpenChange,
  servidor,
}: ViewServidorDialogProps) {
  const { data: dependentes } = useQuery({
    queryKey: ["dependentes", servidor?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dependentes")
        .select("*")
        .eq("servidor_id", servidor!.id)
        .eq("ativo", true);
      if (error) throw error;
      return data;
    },
    enabled: !!servidor?.id && open,
  });

  const { data: dadosBancarios } = useQuery({
    queryKey: ["dados_bancarios", servidor?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dados_bancarios")
        .select("*")
        .eq("servidor_id", servidor!.id)
        .eq("ativo", true);
      if (error) throw error;
      return data;
    },
    enabled: !!servidor?.id && open,
  });

  if (!servidor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Servidor</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="pessoais" className="mt-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="pessoais" className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span className="hidden sm:inline">Pessoais</span>
            </TabsTrigger>
            <TabsTrigger value="documentos" className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span className="hidden sm:inline">Documentos</span>
            </TabsTrigger>
            <TabsTrigger value="endereco" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span className="hidden sm:inline">Endereço</span>
            </TabsTrigger>
            <TabsTrigger value="bancarios" className="flex items-center gap-1">
              <CreditCard className="h-3 w-3" />
              <span className="hidden sm:inline">Bancários</span>
            </TabsTrigger>
            <TabsTrigger value="dependentes" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span className="hidden sm:inline">Dependentes</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pessoais" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <InfoItem label="Nome Completo" value={servidor.name} />
              <InfoItem label="CPF" value={servidor.cpf} />
              <InfoItem
                label="Data de Nascimento"
                value={servidor.data_nascimento ? format(new Date(servidor.data_nascimento), "dd/MM/yyyy") : null}
              />
              <InfoItem label="Sexo" value={servidor.sexo ? sexoLabels[servidor.sexo] : null} />
              <InfoItem label="Estado Civil" value={servidor.estado_civil ? estadoCivilLabels[servidor.estado_civil] : null} />
              <InfoItem label="Nacionalidade" value={servidor.nacionalidade} />
              <InfoItem label="Naturalidade" value={servidor.naturalidade} />
              <InfoItem label="Nome da Mãe" value={servidor.nome_mae} />
              <InfoItem label="Nome do Pai" value={servidor.nome_pai} />
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold mb-3">Contato</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <InfoItem label="E-mail" value={servidor.email} />
                <InfoItem label="Celular" value={servidor.telefone_celular} />
                <InfoItem label="Telefone Residencial" value={servidor.telefone_residencial} />
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold mb-3">Informações Profissionais</h4>
              <div className="grid grid-cols-2 gap-4">
                <InfoItem label="Departamento" value={servidor.department} />
                <InfoItem label="Cargo no Sistema" value={roleLabels[servidor.role] || servidor.role} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="documentos" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <InfoItem label="RG" value={servidor.rg} />
              <InfoItem label="Órgão Emissor" value={servidor.rg_orgao_emissor} />
              <InfoItem label="UF RG" value={servidor.rg_uf} />
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold mb-3">PIS/Título Eleitor</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <InfoItem label="PIS/PASEP" value={servidor.pis_pasep} />
                <InfoItem label="Título de Eleitor" value={servidor.titulo_eleitor} />
                <InfoItem label="Zona Eleitoral" value={servidor.zona_eleitoral} />
                <InfoItem label="Seção Eleitoral" value={servidor.secao_eleitoral} />
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold mb-3">CTPS</h4>
              <div className="grid grid-cols-3 gap-4">
                <InfoItem label="Número" value={servidor.ctps_numero} />
                <InfoItem label="Série" value={servidor.ctps_serie} />
                <InfoItem label="UF" value={servidor.ctps_uf} />
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold mb-3">CNH</h4>
              <div className="grid grid-cols-3 gap-4">
                <InfoItem label="Número" value={servidor.cnh_numero} />
                <InfoItem label="Categoria" value={servidor.cnh_categoria} />
                <InfoItem
                  label="Validade"
                  value={servidor.cnh_validade ? format(new Date(servidor.cnh_validade), "dd/MM/yyyy") : null}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="endereco" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <InfoItem label="CEP" value={servidor.endereco_cep} />
              <InfoItem label="Logradouro" value={servidor.endereco_logradouro} />
              <InfoItem label="Número" value={servidor.endereco_numero} />
              <InfoItem label="Complemento" value={servidor.endereco_complemento} />
              <InfoItem label="Bairro" value={servidor.endereco_bairro} />
              <InfoItem label="Cidade" value={servidor.endereco_cidade} />
              <InfoItem label="UF" value={servidor.endereco_uf} />
            </div>

            {servidor.observacoes && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold mb-2">Observações</h4>
                <p className="text-sm text-muted-foreground">{servidor.observacoes}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="bancarios" className="mt-4">
            {dadosBancarios?.length === 0 ? (
              <p className="text-muted-foreground text-center py-6">Nenhum dado bancário cadastrado.</p>
            ) : (
              <div className="space-y-3">
                {dadosBancarios?.map((conta: any) => (
                  <div key={conta.id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {conta.conta_principal && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                      <h4 className="font-medium">{conta.banco_nome}</h4>
                      <Badge variant="outline">
                        {conta.tipo_conta === "corrente" ? "Corrente" : conta.tipo_conta === "poupanca" ? "Poupança" : "Salário"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Agência: </span>
                        {conta.agencia}{conta.agencia_digito ? `-${conta.agencia_digito}` : ""}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Conta: </span>
                        {conta.conta}{conta.conta_digito ? `-${conta.conta_digito}` : ""}
                      </div>
                      {conta.pix_chave && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">PIX ({conta.pix_tipo}): </span>
                          {conta.pix_chave}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="dependentes" className="mt-4">
            {dependentes?.length === 0 ? (
              <p className="text-muted-foreground text-center py-6">Nenhum dependente cadastrado.</p>
            ) : (
              <div className="space-y-3">
                {dependentes?.map((dep: any) => (
                  <div key={dep.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{dep.nome}</h4>
                      <div className="flex gap-1">
                        {dep.ir_dependente && <Badge variant="outline">IR</Badge>}
                        {dep.plano_saude_dependente && <Badge variant="outline">Plano</Badge>}
                        {dep.salario_familia_dependente && <Badge variant="outline">Sal. Família</Badge>}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Parentesco: </span>
                        {dep.parentesco}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Nascimento: </span>
                        {format(new Date(dep.data_nascimento), "dd/MM/yyyy")}
                      </div>
                      {dep.cpf && (
                        <div>
                          <span className="text-muted-foreground">CPF: </span>
                          {dep.cpf}
                        </div>
                      )}
                      {dep.possui_deficiencia && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Deficiência: </span>
                          {dep.descricao_deficiencia || "Sim"}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
