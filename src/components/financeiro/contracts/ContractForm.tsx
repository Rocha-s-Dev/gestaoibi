
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { CalendarIcon, FileText, Upload } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const contractFormSchema = z.object({
  description: z.string().min(3, {
    message: "A descrição deve ter pelo menos 3 caracteres",
  }),
  contract_number: z.string().min(1, {
    message: "O número do contrato é obrigatório",
  }),
  contractor: z.string().min(3, {
    message: "Nome do contratante é obrigatório",
  }),
  contracted: z.string().min(3, {
    message: "Nome do contratado é obrigatório",
  }),
  value: z.string().refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    {
      message: "O valor deve ser um número positivo",
    }
  ),
  start_date: z.date({
    required_error: "A data de início é obrigatória",
  }),
  end_date: z.date({
    required_error: "A data de término é obrigatória",
  }).refine(
    (date, ctx) => {
      if (ctx.parent.start_date) {
        return date > ctx.parent.start_date;
      }
      return true;
    }, 
    {
      message: "A data de término deve ser posterior à data de início",
    }
  ),
  notes: z.string().optional(),
});

type ContractFormValues = z.infer<typeof contractFormSchema>;

export function ContractForm({ onContractAdded }: { onContractAdded: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractFormSchema),
    defaultValues: {
      description: "",
      contract_number: "",
      contractor: "",
      contracted: "",
      value: "",
      notes: "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files);
      setAttachments([...attachments, ...fileList]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ContractFormValues) => {
    setIsSubmitting(true);
    try {
      const contractData = {
        description: data.description,
        contract_number: data.contract_number,
        contractor: data.contractor,
        contracted: data.contracted,
        value: parseFloat(data.value),
        start_date: data.start_date.toISOString().split('T')[0],
        end_date: data.end_date.toISOString().split('T')[0],
        notes: data.notes || "",
        status: "active",
        document_urls: [],
      };

      // Store contract in database
      const { data: contract, error } = await supabase
        .from("contracts")
        .insert(contractData)
        .select()
        .single();

      if (error) throw error;

      // Handle file uploads if there are any
      if (attachments.length > 0 && contract?.id) {
        const documentUrls = [];
        
        for (const file of attachments) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${contract.id}/${Math.random().toString(36).substring(2)}.${fileExt}`;
          
          const { data: fileData, error: uploadError } = await supabase
            .storage
            .from('contract_documents')
            .upload(fileName, file);
            
          if (uploadError) {
            toast({
              title: "Erro ao fazer upload do arquivo",
              description: uploadError.message,
              variant: "destructive",
            });
            continue;
          }
          
          documentUrls.push({
            name: file.name,
            url: fileName,
            type: file.type,
            size: file.size,
            uploaded_at: new Date().toISOString(),
          });
        }
        
        // Update contract with document URLs
        if (documentUrls.length > 0) {
          await supabase
            .from("contracts")
            .update({ document_urls: documentUrls })
            .eq('id', contract.id);
        }
      }

      toast({
        title: "Contrato cadastrado com sucesso!",
        description: "O contrato foi registrado no sistema.",
      });

      // Reset form and state
      form.reset();
      setAttachments([]);
      onContractAdded();
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    } catch (error: any) {
      toast({
        title: "Erro ao cadastrar contrato",
        description: error.message || "Ocorreu um erro ao cadastrar o contrato.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Novo Contrato
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Descrição do contrato" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contract_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número do Contrato</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 2025/001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        placeholder="0,00" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contractor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contratante</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do contratante" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="contracted"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contratado</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do contratado" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Início</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy", { locale: ptBR })
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Término</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy", { locale: ptBR })
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => 
                            date < new Date("1900-01-01") || 
                            (form.getValues("start_date") && date <= form.getValues("start_date"))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Informações adicionais sobre o contrato" 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-2">
              <FormLabel>Anexos</FormLabel>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileChange}
                  multiple
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("file-upload")?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Anexar Documentos
                </Button>
              </div>
              
              {attachments.length > 0 && (
                <div className="mt-4 space-y-2">
                  <FormDescription>Arquivos anexados:</FormDescription>
                  <ul className="space-y-2">
                    {attachments.map((file, index) => (
                      <li 
                        key={index} 
                        className="flex items-center justify-between rounded-md border p-2 text-sm"
                      >
                        <span className="truncate max-w-[200px]">{file.name}</span>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeAttachment(index)}
                        >
                          Remover
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Cadastrando..." : "Cadastrar Contrato"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
