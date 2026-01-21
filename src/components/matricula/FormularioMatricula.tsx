import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Loader2, Upload, User, Users, School, FileText } from "lucide-react";
import { toast } from "sonner";
import { useEscolas } from "@/hooks/useEscolas";
import { useSolicitacoesMatricula } from "@/hooks/useSolicitacoesMatricula";
import { UploadDocumentos } from "./UploadDocumentos";

const formSchema = z.object({
  // Dados do Aluno
  aluno_nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  aluno_data_nascimento: z.string().min(1, "Data de nascimento é obrigatória"),
  aluno_cpf: z.string().optional(),
  aluno_rg: z.string().optional(),
  aluno_genero: z.string().optional(),
  aluno_endereco: z.string().min(1, "Endereço é obrigatório"),
  aluno_numero: z.string().optional(),
  aluno_bairro: z.string().min(1, "Bairro é obrigatório"),
  aluno_cidade: z.string().min(1, "Cidade é obrigatória"),
  aluno_estado: z.string().min(1, "Estado é obrigatório"),
  aluno_cep: z.string().optional(),
  aluno_necessidades_especiais: z.string().optional(),
  
  // Dados do Responsável
  responsavel_nome: z.string().min(3, "Nome do responsável é obrigatório"),
  responsavel_cpf: z.string().min(11, "CPF do responsável é obrigatório"),
  responsavel_rg: z.string().optional(),
  responsavel_telefone: z.string().min(10, "Telefone é obrigatório"),
  responsavel_email: z.string().email("Email inválido").optional().or(z.literal("")),
  responsavel_grau_parentesco: z.string().min(1, "Grau de parentesco é obrigatório"),
  responsavel_profissao: z.string().optional(),
  
  // Dados da Matrícula
  escola_preferida_id: z.string().optional(),
  serie_pretendida: z.string().min(1, "Série pretendida é obrigatória"),
  ano_letivo: z.number().min(2024, "Ano letivo inválido"),
  observacoes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface FormularioMatriculaProps {
  onSuccess?: () => void;
}

const SERIES = [
  { value: "creche", label: "Creche" },
  { value: "pre1", label: "Pré-escola I (4 anos)" },
  { value: "pre2", label: "Pré-escola II (5 anos)" },
  { value: "1ano", label: "1º Ano - Ensino Fundamental" },
  { value: "2ano", label: "2º Ano - Ensino Fundamental" },
  { value: "3ano", label: "3º Ano - Ensino Fundamental" },
  { value: "4ano", label: "4º Ano - Ensino Fundamental" },
  { value: "5ano", label: "5º Ano - Ensino Fundamental" },
  { value: "6ano", label: "6º Ano - Ensino Fundamental" },
  { value: "7ano", label: "7º Ano - Ensino Fundamental" },
  { value: "8ano", label: "8º Ano - Ensino Fundamental" },
  { value: "9ano", label: "9º Ano - Ensino Fundamental" },
];

const GRAUS_PARENTESCO = [
  { value: "mae", label: "Mãe" },
  { value: "pai", label: "Pai" },
  { value: "avo", label: "Avô/Avó" },
  { value: "tio", label: "Tio/Tia" },
  { value: "irmao", label: "Irmão/Irmã" },
  { value: "tutor", label: "Tutor Legal" },
  { value: "outro", label: "Outro" },
];

export function FormularioMatricula({ onSuccess }: FormularioMatriculaProps) {
  const [step, setStep] = useState(1);
  const [protocoloGerado, setProtocoloGerado] = useState<string | null>(null);
  const [documentosUpload, setDocumentosUpload] = useState<{ tipo: string; url: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { escolas } = useEscolas();
  const { criarSolicitacao } = useSolicitacoesMatricula();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      aluno_nome: "",
      aluno_data_nascimento: "",
      aluno_endereco: "",
      aluno_bairro: "",
      aluno_cidade: "",
      aluno_estado: "SP",
      responsavel_nome: "",
      responsavel_cpf: "",
      responsavel_telefone: "",
      responsavel_grau_parentesco: "",
      serie_pretendida: "",
      ano_letivo: new Date().getFullYear(),
      observacoes: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      const solicitacao = await criarSolicitacao({
        dados_aluno: {
          nome: data.aluno_nome,
          data_nascimento: data.aluno_data_nascimento,
          cpf: data.aluno_cpf,
          rg: data.aluno_rg,
          genero: data.aluno_genero,
          endereco: data.aluno_endereco,
          numero_endereco: data.aluno_numero,
          bairro: data.aluno_bairro,
          cidade: data.aluno_cidade,
          estado: data.aluno_estado,
          cep: data.aluno_cep,
          necessidades_especiais: data.aluno_necessidades_especiais,
        },
        dados_responsavel: {
          nome: data.responsavel_nome,
          cpf: data.responsavel_cpf,
          rg: data.responsavel_rg,
          telefone: data.responsavel_telefone,
          email: data.responsavel_email,
          grau_parentesco: data.responsavel_grau_parentesco,
          profissao: data.responsavel_profissao,
        },
        escola_preferida_id: data.escola_preferida_id || undefined,
        serie_pretendida: data.serie_pretendida,
        ano_letivo: data.ano_letivo,
        observacoes: data.observacoes,
      });
      
      if (solicitacao) {
        setProtocoloGerado(solicitacao.protocolo);
        setStep(4);
        toast.success("Solicitação enviada com sucesso!");
        onSuccess?.();
      }
    } catch (error) {
      console.error("Erro ao enviar solicitação:", error);
      toast.error("Erro ao enviar solicitação. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = async () => {
    const fieldsToValidate: (keyof FormData)[][] = [
      ["aluno_nome", "aluno_data_nascimento", "aluno_endereco", "aluno_bairro", "aluno_cidade", "aluno_estado"],
      ["responsavel_nome", "responsavel_cpf", "responsavel_telefone", "responsavel_grau_parentesco"],
      ["serie_pretendida", "ano_letivo"],
    ];
    
    const isValid = await form.trigger(fieldsToValidate[step - 1]);
    if (isValid) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const renderStepIndicator = () => (
    <div className="mb-6 flex items-center justify-center gap-2">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex items-center">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
              step >= s
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {step > s ? <CheckCircle2 className="h-5 w-5" /> : s}
          </div>
          {s < 3 && (
            <div
              className={`mx-2 h-1 w-12 rounded transition-colors ${
                step > s ? "bg-primary" : "bg-muted"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  if (step === 4 && protocoloGerado) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="mb-4 rounded-full bg-green-100 p-4">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-green-700">Solicitação Enviada!</h3>
        <p className="mt-2 text-muted-foreground">
          Sua solicitação de matrícula foi recebida com sucesso.
        </p>
        <div className="mt-6 rounded-lg border-2 border-dashed border-primary/50 bg-primary/5 p-6">
          <p className="text-sm text-muted-foreground">Número do Protocolo</p>
          <p className="mt-1 text-3xl font-bold text-primary">{protocoloGerado}</p>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Guarde este número para acompanhar o status da sua solicitação
        </p>
        <Button
          onClick={() => {
            setStep(1);
            setProtocoloGerado(null);
            form.reset();
          }}
          variant="outline"
          className="mt-6"
        >
          Fazer Nova Solicitação
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {renderStepIndicator()}

        <div className="mb-4 flex items-center gap-2">
          <Badge variant={step === 1 ? "default" : "secondary"}>
            <User className="mr-1 h-3 w-3" />
            Aluno
          </Badge>
          <Badge variant={step === 2 ? "default" : "secondary"}>
            <Users className="mr-1 h-3 w-3" />
            Responsável
          </Badge>
          <Badge variant={step === 3 ? "default" : "secondary"}>
            <School className="mr-1 h-3 w-3" />
            Escola
          </Badge>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 font-semibold">
              <User className="h-5 w-5" />
              Dados do Aluno
            </h3>
            <Separator />
            
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="aluno_nome"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Nome Completo *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome completo do aluno" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="aluno_data_nascimento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Nascimento *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="aluno_genero"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gênero</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="masculino">Masculino</SelectItem>
                        <SelectItem value="feminino">Feminino</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="aluno_cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input placeholder="000.000.000-00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="aluno_rg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RG</FormLabel>
                    <FormControl>
                      <Input placeholder="00.000.000-0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Separator />
            <h4 className="font-medium">Endereço</h4>
            
            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="aluno_cep"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CEP</FormLabel>
                    <FormControl>
                      <Input placeholder="00000-000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="aluno_endereco"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Endereço *</FormLabel>
                    <FormControl>
                      <Input placeholder="Rua, Avenida..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="aluno_numero"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número</FormLabel>
                    <FormControl>
                      <Input placeholder="Nº" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="aluno_bairro"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bairro *</FormLabel>
                    <FormControl>
                      <Input placeholder="Bairro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="aluno_cidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade *</FormLabel>
                    <FormControl>
                      <Input placeholder="Cidade" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="aluno_estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="SP">São Paulo</SelectItem>
                        <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                        <SelectItem value="MG">Minas Gerais</SelectItem>
                        <SelectItem value="ES">Espírito Santo</SelectItem>
                        <SelectItem value="PR">Paraná</SelectItem>
                        <SelectItem value="SC">Santa Catarina</SelectItem>
                        <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="aluno_necessidades_especiais"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Necessidades Especiais</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva se o aluno possui alguma necessidade especial que a escola deva conhecer"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 font-semibold">
              <Users className="h-5 w-5" />
              Dados do Responsável
            </h3>
            <Separator />
            
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="responsavel_nome"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Nome Completo *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome completo do responsável" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="responsavel_cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF *</FormLabel>
                    <FormControl>
                      <Input placeholder="000.000.000-00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="responsavel_rg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RG</FormLabel>
                    <FormControl>
                      <Input placeholder="00.000.000-0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="responsavel_telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone *</FormLabel>
                    <FormControl>
                      <Input placeholder="(00) 00000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="responsavel_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="responsavel_grau_parentesco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grau de Parentesco *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {GRAUS_PARENTESCO.map((grau) => (
                          <SelectItem key={grau.value} value={grau.value}>
                            {grau.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="responsavel_profissao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profissão</FormLabel>
                    <FormControl>
                      <Input placeholder="Profissão" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 font-semibold">
              <School className="h-5 w-5" />
              Dados da Matrícula
            </h3>
            <Separator />
            
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="serie_pretendida"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Série Pretendida *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a série" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SERIES.map((serie) => (
                          <SelectItem key={serie.value} value={serie.value}>
                            {serie.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="ano_letivo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ano Letivo *</FormLabel>
                    <Select 
                      onValueChange={(v) => field.onChange(parseInt(v))} 
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o ano" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={new Date().getFullYear().toString()}>
                          {new Date().getFullYear()}
                        </SelectItem>
                        <SelectItem value={(new Date().getFullYear() + 1).toString()}>
                          {new Date().getFullYear() + 1}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="escola_preferida_id"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Escola de Preferência</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma escola (opcional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {escolas
                          .filter((e) => e.status === "ativa")
                          .map((escola) => (
                            <SelectItem key={escola.id} value={escola.id}>
                              {escola.nome}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="observacoes"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Informações adicionais relevantes para a matrícula"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />
            
            <div>
              <h4 className="mb-4 flex items-center gap-2 font-medium">
                <FileText className="h-4 w-4" />
                Documentos (opcional)
              </h4>
              <UploadDocumentos
                documentos={documentosUpload}
                onChange={setDocumentosUpload}
              />
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4">
          {step > 1 && (
            <Button type="button" variant="outline" onClick={prevStep}>
              Voltar
            </Button>
          )}
          {step < 3 ? (
            <Button type="button" onClick={nextStep} className="ml-auto">
              Próximo
            </Button>
          ) : (
            <Button type="submit" className="ml-auto" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar Solicitação"
              )}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
