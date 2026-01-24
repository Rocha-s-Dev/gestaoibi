export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      agendamentos: {
        Row: {
          created_at: string
          data_hora: string
          especialidade: string | null
          id: string
          motivo_cancelamento: string | null
          observacoes: string | null
          paciente_id: string
          prioridade: string | null
          profissional_id: string | null
          status: string | null
          tipo: string
          unidade_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_hora: string
          especialidade?: string | null
          id?: string
          motivo_cancelamento?: string | null
          observacoes?: string | null
          paciente_id: string
          prioridade?: string | null
          profissional_id?: string | null
          status?: string | null
          tipo: string
          unidade_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_hora?: string
          especialidade?: string | null
          id?: string
          motivo_cancelamento?: string | null
          observacoes?: string | null
          paciente_id?: string
          prioridade?: string | null
          profissional_id?: string | null
          status?: string | null
          tipo?: string
          unidade_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais_saude"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades_saude"
            referencedColumns: ["id"]
          },
        ]
      }
      alertas_educacionais: {
        Row: {
          aluno_id: string
          created_at: string
          id: string
          mensagem: string
          nivel: string | null
          resolvido: boolean | null
          tipo: string
        }
        Insert: {
          aluno_id: string
          created_at?: string
          id?: string
          mensagem: string
          nivel?: string | null
          resolvido?: boolean | null
          tipo: string
        }
        Update: {
          aluno_id?: string
          created_at?: string
          id?: string
          mensagem?: string
          nivel?: string | null
          resolvido?: boolean | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "alertas_educacionais_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
        ]
      }
      alertas_saude: {
        Row: {
          ativo: boolean | null
          created_at: string
          data_fim: string | null
          data_inicio: string
          descricao: string
          id: string
          nivel: string
          tipo: string
          titulo: string
          unidade_id: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          descricao: string
          id?: string
          nivel: string
          tipo: string
          titulo: string
          unidade_id?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          descricao?: string
          id?: string
          nivel?: string
          tipo?: string
          titulo?: string
          unidade_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alertas_saude_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades_saude"
            referencedColumns: ["id"]
          },
        ]
      }
      alunos: {
        Row: {
          cpf: string | null
          created_at: string
          data_matricula: string | null
          data_nascimento: string | null
          endereco: string | null
          escola_id: string | null
          id: string
          nome: string
          numero_matricula: string
          responsavel_email: string | null
          responsavel_nome: string | null
          responsavel_telefone: string | null
          situacao: string | null
          turma_id: string | null
          updated_at: string
        }
        Insert: {
          cpf?: string | null
          created_at?: string
          data_matricula?: string | null
          data_nascimento?: string | null
          endereco?: string | null
          escola_id?: string | null
          id?: string
          nome: string
          numero_matricula: string
          responsavel_email?: string | null
          responsavel_nome?: string | null
          responsavel_telefone?: string | null
          situacao?: string | null
          turma_id?: string | null
          updated_at?: string
        }
        Update: {
          cpf?: string | null
          created_at?: string
          data_matricula?: string | null
          data_nascimento?: string | null
          endereco?: string | null
          escola_id?: string | null
          id?: string
          nome?: string
          numero_matricula?: string
          responsavel_email?: string | null
          responsavel_nome?: string | null
          responsavel_telefone?: string | null
          situacao?: string | null
          turma_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alunos_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alunos_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      alunos_rotas: {
        Row: {
          aluno_id: string
          created_at: string
          horario_embarque: string | null
          id: string
          ponto_embarque: string | null
          rota_id: string
        }
        Insert: {
          aluno_id: string
          created_at?: string
          horario_embarque?: string | null
          id?: string
          ponto_embarque?: string | null
          rota_id: string
        }
        Update: {
          aluno_id?: string
          created_at?: string
          horario_embarque?: string | null
          id?: string
          ponto_embarque?: string | null
          rota_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alunos_rotas_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alunos_rotas_rota_id_fkey"
            columns: ["rota_id"]
            isOneToOne: false
            referencedRelation: "rotas_transporte"
            referencedColumns: ["id"]
          },
        ]
      }
      calendario_escolar: {
        Row: {
          ano_letivo: number | null
          created_at: string
          data_fim: string | null
          data_inicio: string
          descricao: string | null
          escola_id: string | null
          id: string
          tipo: string | null
          titulo: string
        }
        Insert: {
          ano_letivo?: number | null
          created_at?: string
          data_fim?: string | null
          data_inicio: string
          descricao?: string | null
          escola_id?: string | null
          id?: string
          tipo?: string | null
          titulo: string
        }
        Update: {
          ano_letivo?: number | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          descricao?: string | null
          escola_id?: string | null
          id?: string
          tipo?: string | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendario_escolar_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
        ]
      }
      cardapios: {
        Row: {
          calorias_estimadas: number | null
          created_at: string
          data: string
          escola_id: string | null
          id: string
          itens: Json
          observacoes: string | null
          refeicao: string
          updated_at: string
        }
        Insert: {
          calorias_estimadas?: number | null
          created_at?: string
          data: string
          escola_id?: string | null
          id?: string
          itens?: Json
          observacoes?: string | null
          refeicao: string
          updated_at?: string
        }
        Update: {
          calorias_estimadas?: number | null
          created_at?: string
          data?: string
          escola_id?: string | null
          id?: string
          itens?: Json
          observacoes?: string | null
          refeicao?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cardapios_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracoes_alertas: {
        Row: {
          created_at: string
          dias_sem_frequencia_evasao: number
          id: string
          nota_minima: number
          percentual_faltas_critical: number
          percentual_faltas_warning: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          dias_sem_frequencia_evasao?: number
          id?: string
          nota_minima?: number
          percentual_faltas_critical?: number
          percentual_faltas_warning?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          dias_sem_frequencia_evasao?: number
          id?: string
          nota_minima?: number
          percentual_faltas_critical?: number
          percentual_faltas_warning?: number
          updated_at?: string
        }
        Relationships: []
      }
      consumo_merenda: {
        Row: {
          cardapio_id: string | null
          created_at: string
          data: string
          escola_id: string
          id: string
          observacoes: string | null
          porcoes_planejadas: number | null
          porcoes_servidas: number
          refeicao: string
          updated_at: string
        }
        Insert: {
          cardapio_id?: string | null
          created_at?: string
          data?: string
          escola_id: string
          id?: string
          observacoes?: string | null
          porcoes_planejadas?: number | null
          porcoes_servidas?: number
          refeicao: string
          updated_at?: string
        }
        Update: {
          cardapio_id?: string | null
          created_at?: string
          data?: string
          escola_id?: string
          id?: string
          observacoes?: string | null
          porcoes_planejadas?: number | null
          porcoes_servidas?: number
          refeicao?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consumo_merenda_cardapio_id_fkey"
            columns: ["cardapio_id"]
            isOneToOne: false
            referencedRelation: "cardapios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consumo_merenda_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_payments: {
        Row: {
          amount: number
          contract_id: string
          created_at: string
          due_date: string
          id: string
          installment_number: number
          notes: string | null
          paid_amount: number | null
          paid_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          contract_id: string
          created_at?: string
          due_date: string
          id?: string
          installment_number: number
          notes?: string | null
          paid_amount?: number | null
          paid_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          contract_id?: string
          created_at?: string
          due_date?: string
          id?: string
          installment_number?: number
          notes?: string | null
          paid_amount?: number | null
          paid_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          contract_number: string
          contractor_cnpj: string | null
          contractor_name: string
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string
          id: string
          object: string | null
          payment_terms: string | null
          secretaria_id: string | null
          start_date: string
          status: string
          title: string
          updated_at: string
          value: number
        }
        Insert: {
          contract_number: string
          contractor_cnpj?: string | null
          contractor_name: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date: string
          id?: string
          object?: string | null
          payment_terms?: string | null
          secretaria_id?: string | null
          start_date: string
          status?: string
          title: string
          updated_at?: string
          value: number
        }
        Update: {
          contract_number?: string
          contractor_cnpj?: string | null
          contractor_name?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string
          id?: string
          object?: string | null
          payment_terms?: string | null
          secretaria_id?: string | null
          start_date?: string
          status?: string
          title?: string
          updated_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "contracts_secretaria_id_fkey"
            columns: ["secretaria_id"]
            isOneToOne: false
            referencedRelation: "secretarias"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message: string | null
          receiver_id: string
          sender_id: string
          unread_count: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message?: string | null
          receiver_id: string
          sender_id: string
          unread_count?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message?: string | null
          receiver_id?: string
          sender_id?: string
          unread_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      departments: {
        Row: {
          code: string | null
          created_at: string
          description: string | null
          id: string
          manager_id: string | null
          name: string
          secretaria_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          manager_id?: string | null
          name: string
          secretaria_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          manager_id?: string | null
          name?: string
          secretaria_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_secretaria_id_fkey"
            columns: ["secretaria_id"]
            isOneToOne: false
            referencedRelation: "secretarias"
            referencedColumns: ["id"]
          },
        ]
      }
      disciplinas: {
        Row: {
          carga_horaria: number | null
          codigo: string | null
          created_at: string
          id: string
          nome: string
        }
        Insert: {
          carga_horaria?: number | null
          codigo?: string | null
          created_at?: string
          id?: string
          nome: string
        }
        Update: {
          carga_horaria?: number | null
          codigo?: string | null
          created_at?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      escolas: {
        Row: {
          capacidade: number | null
          created_at: string
          diretor: string | null
          email: string | null
          endereco: string | null
          id: string
          nome: string
          telefone: string | null
          tipo: string | null
          updated_at: string
        }
        Insert: {
          capacidade?: number | null
          created_at?: string
          diretor?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nome: string
          telefone?: string | null
          tipo?: string | null
          updated_at?: string
        }
        Update: {
          capacidade?: number | null
          created_at?: string
          diretor?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nome?: string
          telefone?: string | null
          tipo?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      estoque_alimentos: {
        Row: {
          created_at: string
          data_validade: string | null
          escola_id: string | null
          estoque_minimo: number | null
          fornecedor: string | null
          id: string
          item: string
          lote: string | null
          preco_unitario: number | null
          quantidade: number
          unidade: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_validade?: string | null
          escola_id?: string | null
          estoque_minimo?: number | null
          fornecedor?: string | null
          id?: string
          item: string
          lote?: string | null
          preco_unitario?: number | null
          quantidade?: number
          unidade: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_validade?: string | null
          escola_id?: string | null
          estoque_minimo?: number | null
          fornecedor?: string | null
          id?: string
          item?: string
          lote?: string | null
          preco_unitario?: number | null
          quantidade?: number
          unidade?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "estoque_alimentos_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
        ]
      }
      evolucoes_tratamento: {
        Row: {
          created_at: string
          data_evolucao: string
          descricao: string
          id: string
          medicamentos_ajustados: Json | null
          profissional_id: string | null
          proxima_avaliacao: string | null
          resultado_exames: string | null
          sinais_vitais: Json | null
          tratamento_id: string
        }
        Insert: {
          created_at?: string
          data_evolucao?: string
          descricao: string
          id?: string
          medicamentos_ajustados?: Json | null
          profissional_id?: string | null
          proxima_avaliacao?: string | null
          resultado_exames?: string | null
          sinais_vitais?: Json | null
          tratamento_id: string
        }
        Update: {
          created_at?: string
          data_evolucao?: string
          descricao?: string
          id?: string
          medicamentos_ajustados?: Json | null
          profissional_id?: string | null
          proxima_avaliacao?: string | null
          resultado_exames?: string | null
          sinais_vitais?: Json | null
          tratamento_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "evolucoes_tratamento_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais_saude"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evolucoes_tratamento_tratamento_id_fkey"
            columns: ["tratamento_id"]
            isOneToOne: false
            referencedRelation: "tratamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      exercicios_financeiros: {
        Row: {
          ano: number
          created_at: string
          data_fim: string
          data_inicio: string
          encerrado_em: string | null
          encerrado_por: string | null
          id: string
          loa_aprovada: boolean | null
          municipio_id: string
          observacoes: string | null
          status: Database["public"]["Enums"]["exercicio_status"]
          updated_at: string
          valor_orcamento: number | null
        }
        Insert: {
          ano: number
          created_at?: string
          data_fim: string
          data_inicio: string
          encerrado_em?: string | null
          encerrado_por?: string | null
          id?: string
          loa_aprovada?: boolean | null
          municipio_id: string
          observacoes?: string | null
          status?: Database["public"]["Enums"]["exercicio_status"]
          updated_at?: string
          valor_orcamento?: number | null
        }
        Update: {
          ano?: number
          created_at?: string
          data_fim?: string
          data_inicio?: string
          encerrado_em?: string | null
          encerrado_por?: string | null
          id?: string
          loa_aprovada?: boolean | null
          municipio_id?: string
          observacoes?: string | null
          status?: Database["public"]["Enums"]["exercicio_status"]
          updated_at?: string
          valor_orcamento?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exercicios_financeiros_municipio_id_fkey"
            columns: ["municipio_id"]
            isOneToOne: false
            referencedRelation: "municipios"
            referencedColumns: ["id"]
          },
        ]
      }
      faltas: {
        Row: {
          aluno_id: string
          created_at: string
          data: string
          id: string
          justificada: boolean | null
          motivo: string | null
        }
        Insert: {
          aluno_id: string
          created_at?: string
          data: string
          id?: string
          justificada?: boolean | null
          motivo?: string | null
        }
        Update: {
          aluno_id?: string
          created_at?: string
          data?: string
          id?: string
          justificada?: boolean | null
          motivo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "faltas_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
        ]
      }
      feriados: {
        Row: {
          ativo: boolean
          created_at: string
          data: string
          id: string
          municipio_id: string | null
          nome: string
          observacoes: string | null
          recorrente: boolean
          tipo: Database["public"]["Enums"]["feriado_tipo"]
          uf: string | null
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          data: string
          id?: string
          municipio_id?: string | null
          nome: string
          observacoes?: string | null
          recorrente?: boolean
          tipo: Database["public"]["Enums"]["feriado_tipo"]
          uf?: string | null
        }
        Update: {
          ativo?: boolean
          created_at?: string
          data?: string
          id?: string
          municipio_id?: string | null
          nome?: string
          observacoes?: string | null
          recorrente?: boolean
          tipo?: Database["public"]["Enums"]["feriado_tipo"]
          uf?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feriados_municipio_id_fkey"
            columns: ["municipio_id"]
            isOneToOne: false
            referencedRelation: "municipios"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_categories: {
        Row: {
          code: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          parent_id: string | null
          secretaria_id: string | null
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          parent_id?: string | null
          secretaria_id?: string | null
          status?: string
          type?: string
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          secretaria_id?: string | null
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "financial_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_categories_secretaria_id_fkey"
            columns: ["secretaria_id"]
            isOneToOne: false
            referencedRelation: "secretarias"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_goals: {
        Row: {
          alert_threshold: number | null
          created_at: string
          current_value: number | null
          description: string
          enable_alerts: boolean | null
          id: string
          percentage_increase: number | null
          secretaria_id: string | null
          status: string | null
          target_value: number
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_threshold?: number | null
          created_at?: string
          current_value?: number | null
          description: string
          enable_alerts?: boolean | null
          id?: string
          percentage_increase?: number | null
          secretaria_id?: string | null
          status?: string | null
          target_value?: number
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_threshold?: number | null
          created_at?: string
          current_value?: number | null
          description?: string
          enable_alerts?: boolean | null
          id?: string
          percentage_increase?: number | null
          secretaria_id?: string | null
          status?: string | null
          target_value?: number
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_goals_secretaria_id_fkey"
            columns: ["secretaria_id"]
            isOneToOne: false
            referencedRelation: "secretarias"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_transactions: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          category_id: string | null
          created_at: string
          created_by: string | null
          department_id: string | null
          description: string
          id: string
          notes: string | null
          reference_number: string | null
          secretaria_id: string | null
          status: string
          transaction_date: string
          type: string
          updated_at: string
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          description: string
          id?: string
          notes?: string | null
          reference_number?: string | null
          secretaria_id?: string | null
          status?: string
          transaction_date?: string
          type?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          description?: string
          id?: string
          notes?: string | null
          reference_number?: string | null
          secretaria_id?: string | null
          status?: string
          transaction_date?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "financial_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_secretaria_id_fkey"
            columns: ["secretaria_id"]
            isOneToOne: false
            referencedRelation: "secretarias"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_departments: {
        Row: {
          created_at: string
          department_id: string
          goal_id: string
          id: string
        }
        Insert: {
          created_at?: string
          department_id: string
          goal_id: string
          id?: string
        }
        Update: {
          created_at?: string
          department_id?: string
          goal_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_departments_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_departments_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          progress: number | null
          secretaria_id: string | null
          status: Database["public"]["Enums"]["goal_status"]
          term: Database["public"]["Enums"]["goal_term"]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          progress?: number | null
          secretaria_id?: string | null
          status?: Database["public"]["Enums"]["goal_status"]
          term?: Database["public"]["Enums"]["goal_term"]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          progress?: number | null
          secretaria_id?: string | null
          status?: Database["public"]["Enums"]["goal_status"]
          term?: Database["public"]["Enums"]["goal_term"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_secretaria_id_fkey"
            columns: ["secretaria_id"]
            isOneToOne: false
            referencedRelation: "secretarias"
            referencedColumns: ["id"]
          },
        ]
      }
      indicadores_saude: {
        Row: {
          categoria: string
          created_at: string
          id: string
          meta: number | null
          nome: string
          observacoes: string | null
          periodo: string
          status: string | null
          tendencia: string | null
          unidade_id: string | null
          unidade_medida: string
          updated_at: string
          valor: number
        }
        Insert: {
          categoria: string
          created_at?: string
          id?: string
          meta?: number | null
          nome: string
          observacoes?: string | null
          periodo: string
          status?: string | null
          tendencia?: string | null
          unidade_id?: string | null
          unidade_medida: string
          updated_at?: string
          valor: number
        }
        Update: {
          categoria?: string
          created_at?: string
          id?: string
          meta?: number | null
          nome?: string
          observacoes?: string | null
          periodo?: string
          status?: string | null
          tendencia?: string | null
          unidade_id?: string | null
          unidade_medida?: string
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "indicadores_saude_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades_saude"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          read: boolean
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          read?: boolean
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read?: boolean
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      metas_educacao: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          meta_valor: number | null
          prazo: string | null
          status: string | null
          titulo: string
          unidade: string | null
          updated_at: string
          valor_atual: number | null
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          meta_valor?: number | null
          prazo?: string | null
          status?: string | null
          titulo: string
          unidade?: string | null
          updated_at?: string
          valor_atual?: number | null
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          meta_valor?: number | null
          prazo?: string | null
          status?: string | null
          titulo?: string
          unidade?: string | null
          updated_at?: string
          valor_atual?: number | null
        }
        Relationships: []
      }
      metas_saude: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          prazo: string | null
          responsavel: string | null
          status: string | null
          tipo: string
          titulo: string
          unidade_id: string | null
          unidade_medida: string
          updated_at: string
          valor_atual: number | null
          valor_meta: number
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          prazo?: string | null
          responsavel?: string | null
          status?: string | null
          tipo: string
          titulo: string
          unidade_id?: string | null
          unidade_medida: string
          updated_at?: string
          valor_atual?: number | null
          valor_meta: number
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          prazo?: string | null
          responsavel?: string | null
          status?: string | null
          tipo?: string
          titulo?: string
          unidade_id?: string | null
          unidade_medida?: string
          updated_at?: string
          valor_atual?: number | null
          valor_meta?: number
        }
        Relationships: [
          {
            foreignKeyName: "metas_saude_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades_saude"
            referencedColumns: ["id"]
          },
        ]
      }
      municipios: {
        Row: {
          area_km2: number | null
          bandeira_url: string | null
          brasao_url: string | null
          cep: string | null
          cnpj: string | null
          codigo_ibge: string | null
          created_at: string
          data_fundacao: string | null
          email_institucional: string | null
          endereco_sede: string | null
          id: string
          nome: string
          populacao_estimada: number | null
          prefeito: string | null
          site_oficial: string | null
          status: string
          telefone_principal: string | null
          telefone_secundario: string | null
          uf: string
          updated_at: string
          vice_prefeito: string | null
        }
        Insert: {
          area_km2?: number | null
          bandeira_url?: string | null
          brasao_url?: string | null
          cep?: string | null
          cnpj?: string | null
          codigo_ibge?: string | null
          created_at?: string
          data_fundacao?: string | null
          email_institucional?: string | null
          endereco_sede?: string | null
          id?: string
          nome: string
          populacao_estimada?: number | null
          prefeito?: string | null
          site_oficial?: string | null
          status?: string
          telefone_principal?: string | null
          telefone_secundario?: string | null
          uf: string
          updated_at?: string
          vice_prefeito?: string | null
        }
        Update: {
          area_km2?: number | null
          bandeira_url?: string | null
          brasao_url?: string | null
          cep?: string | null
          cnpj?: string | null
          codigo_ibge?: string | null
          created_at?: string
          data_fundacao?: string | null
          email_institucional?: string | null
          endereco_sede?: string | null
          id?: string
          nome?: string
          populacao_estimada?: number | null
          prefeito?: string | null
          site_oficial?: string | null
          status?: string
          telefone_principal?: string | null
          telefone_secundario?: string | null
          uf?: string
          updated_at?: string
          vice_prefeito?: string | null
        }
        Relationships: []
      }
      notas: {
        Row: {
          aluno_id: string
          ano_letivo: number | null
          bimestre: number
          created_at: string
          disciplina_id: string
          fechada: boolean | null
          id: string
          nota: number | null
          observacoes: string | null
          turma_id: string | null
          updated_at: string
        }
        Insert: {
          aluno_id: string
          ano_letivo?: number | null
          bimestre: number
          created_at?: string
          disciplina_id: string
          fechada?: boolean | null
          id?: string
          nota?: number | null
          observacoes?: string | null
          turma_id?: string | null
          updated_at?: string
        }
        Update: {
          aluno_id?: string
          ano_letivo?: number | null
          bimestre?: number
          created_at?: string
          disciplina_id?: string
          fechada?: boolean | null
          id?: string
          nota?: number | null
          observacoes?: string | null
          turma_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notas_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_disciplina_id_fkey"
            columns: ["disciplina_id"]
            isOneToOne: false
            referencedRelation: "disciplinas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      pacientes: {
        Row: {
          alergias: string[] | null
          bairro: string | null
          cartao_sus: string | null
          cidade: string | null
          condicoes_cronicas: string[] | null
          cpf: string | null
          created_at: string
          data_nascimento: string | null
          email: string | null
          endereco: string | null
          id: string
          medicamentos_uso_continuo: string[] | null
          nome: string
          nome_mae: string | null
          nome_responsavel: string | null
          observacoes: string | null
          sexo: string | null
          status: string | null
          telefone: string | null
          telefone_responsavel: string | null
          tipo_sanguineo: string | null
          updated_at: string
        }
        Insert: {
          alergias?: string[] | null
          bairro?: string | null
          cartao_sus?: string | null
          cidade?: string | null
          condicoes_cronicas?: string[] | null
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          medicamentos_uso_continuo?: string[] | null
          nome: string
          nome_mae?: string | null
          nome_responsavel?: string | null
          observacoes?: string | null
          sexo?: string | null
          status?: string | null
          telefone?: string | null
          telefone_responsavel?: string | null
          tipo_sanguineo?: string | null
          updated_at?: string
        }
        Update: {
          alergias?: string[] | null
          bairro?: string | null
          cartao_sus?: string | null
          cidade?: string | null
          condicoes_cronicas?: string[] | null
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          medicamentos_uso_continuo?: string[] | null
          nome?: string
          nome_mae?: string | null
          nome_responsavel?: string | null
          observacoes?: string | null
          sexo?: string | null
          status?: string | null
          telefone?: string | null
          telefone_responsavel?: string | null
          tipo_sanguineo?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      periodos_fiscais: {
        Row: {
          bloqueado_em: string | null
          bloqueado_por: string | null
          created_at: string
          data_fim: string
          data_inicio: string
          exercicio_id: string
          id: string
          numero: number
          status: Database["public"]["Enums"]["exercicio_status"]
          tipo: Database["public"]["Enums"]["periodo_tipo"]
        }
        Insert: {
          bloqueado_em?: string | null
          bloqueado_por?: string | null
          created_at?: string
          data_fim: string
          data_inicio: string
          exercicio_id: string
          id?: string
          numero: number
          status?: Database["public"]["Enums"]["exercicio_status"]
          tipo: Database["public"]["Enums"]["periodo_tipo"]
        }
        Update: {
          bloqueado_em?: string | null
          bloqueado_por?: string | null
          created_at?: string
          data_fim?: string
          data_inicio?: string
          exercicio_id?: string
          id?: string
          numero?: number
          status?: Database["public"]["Enums"]["exercicio_status"]
          tipo?: Database["public"]["Enums"]["periodo_tipo"]
        }
        Relationships: [
          {
            foreignKeyName: "periodos_fiscais_exercicio_id_fkey"
            columns: ["exercicio_id"]
            isOneToOne: false
            referencedRelation: "exercicios_financeiros"
            referencedColumns: ["id"]
          },
        ]
      }
      pesquisas_satisfacao: {
        Row: {
          categoria: string | null
          created_at: string
          data_fim: string | null
          data_inicio: string
          id: string
          nota_media: number | null
          status: string | null
          titulo: string
          total_respostas: number | null
          unidade_id: string | null
          updated_at: string
        }
        Insert: {
          categoria?: string | null
          created_at?: string
          data_fim?: string | null
          data_inicio: string
          id?: string
          nota_media?: number | null
          status?: string | null
          titulo: string
          total_respostas?: number | null
          unidade_id?: string | null
          updated_at?: string
        }
        Update: {
          categoria?: string | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          id?: string
          nota_media?: number | null
          status?: string | null
          titulo?: string
          total_respostas?: number | null
          unidade_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pesquisas_satisfacao_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades_saude"
            referencedColumns: ["id"]
          },
        ]
      }
      professores: {
        Row: {
          cpf: string | null
          created_at: string
          email: string | null
          escola_id: string | null
          especialidade: string | null
          id: string
          nome: string
          telefone: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          cpf?: string | null
          created_at?: string
          email?: string | null
          escola_id?: string | null
          especialidade?: string | null
          id?: string
          nome: string
          telefone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          cpf?: string | null
          created_at?: string
          email?: string | null
          escola_id?: string | null
          especialidade?: string | null
          id?: string
          nome?: string
          telefone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "professores_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          department: string | null
          email: string | null
          id: string
          name: string | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          email?: string | null
          id?: string
          name?: string | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          department?: string | null
          email?: string | null
          id?: string
          name?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profissionais_saude: {
        Row: {
          carga_horaria_semanal: number | null
          cpf: string | null
          created_at: string
          email: string | null
          especialidade: string | null
          id: string
          nome: string
          registro_conselho: string | null
          status: string | null
          telefone: string | null
          tipo_conselho: string | null
          unidade_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          carga_horaria_semanal?: number | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          especialidade?: string | null
          id?: string
          nome: string
          registro_conselho?: string | null
          status?: string | null
          telefone?: string | null
          tipo_conselho?: string | null
          unidade_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          carga_horaria_semanal?: number | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          especialidade?: string | null
          id?: string
          nome?: string
          registro_conselho?: string | null
          status?: string | null
          telefone?: string | null
          tipo_conselho?: string | null
          unidade_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profissionais_saude_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades_saude"
            referencedColumns: ["id"]
          },
        ]
      }
      prontuarios: {
        Row: {
          agendamento_id: string | null
          assinatura_digital: string | null
          cid_principal: string | null
          cid_secundarios: string[] | null
          conduta: string | null
          created_at: string
          data_atendimento: string
          encaminhamentos: string[] | null
          exame_fisico: Json | null
          hipotese_diagnostica: string | null
          historia_doenca_atual: string | null
          id: string
          observacoes: string | null
          paciente_id: string
          prescricao_medicamentos: Json | null
          profissional_id: string | null
          queixa_principal: string | null
          sinais_vitais: Json | null
          solicitacao_exames: Json | null
          tipo_atendimento: string
          unidade_id: string | null
          updated_at: string
        }
        Insert: {
          agendamento_id?: string | null
          assinatura_digital?: string | null
          cid_principal?: string | null
          cid_secundarios?: string[] | null
          conduta?: string | null
          created_at?: string
          data_atendimento?: string
          encaminhamentos?: string[] | null
          exame_fisico?: Json | null
          hipotese_diagnostica?: string | null
          historia_doenca_atual?: string | null
          id?: string
          observacoes?: string | null
          paciente_id: string
          prescricao_medicamentos?: Json | null
          profissional_id?: string | null
          queixa_principal?: string | null
          sinais_vitais?: Json | null
          solicitacao_exames?: Json | null
          tipo_atendimento: string
          unidade_id?: string | null
          updated_at?: string
        }
        Update: {
          agendamento_id?: string | null
          assinatura_digital?: string | null
          cid_principal?: string | null
          cid_secundarios?: string[] | null
          conduta?: string | null
          created_at?: string
          data_atendimento?: string
          encaminhamentos?: string[] | null
          exame_fisico?: Json | null
          hipotese_diagnostica?: string | null
          historia_doenca_atual?: string | null
          id?: string
          observacoes?: string | null
          paciente_id?: string
          prescricao_medicamentos?: Json | null
          profissional_id?: string | null
          queixa_principal?: string | null
          sinais_vitais?: Json | null
          solicitacao_exames?: Json | null
          tipo_atendimento?: string
          unidade_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prontuarios_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prontuarios_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prontuarios_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais_saude"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prontuarios_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades_saude"
            referencedColumns: ["id"]
          },
        ]
      }
      responsaveis_alunos: {
        Row: {
          aluno_id: string
          created_at: string
          id: string
          parentesco: string | null
          responsavel_id: string
        }
        Insert: {
          aluno_id: string
          created_at?: string
          id?: string
          parentesco?: string | null
          responsavel_id: string
        }
        Update: {
          aluno_id?: string
          created_at?: string
          id?: string
          parentesco?: string | null
          responsavel_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "responsaveis_alunos_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
        ]
      }
      respostas_pesquisa: {
        Row: {
          comentario: string | null
          created_at: string
          id: string
          nota_atendimento: number | null
          nota_comunicacao: number | null
          nota_infraestrutura: number | null
          nota_tempo_espera: number | null
          paciente_id: string | null
          pesquisa_id: string
        }
        Insert: {
          comentario?: string | null
          created_at?: string
          id?: string
          nota_atendimento?: number | null
          nota_comunicacao?: number | null
          nota_infraestrutura?: number | null
          nota_tempo_espera?: number | null
          paciente_id?: string | null
          pesquisa_id: string
        }
        Update: {
          comentario?: string | null
          created_at?: string
          id?: string
          nota_atendimento?: number | null
          nota_comunicacao?: number | null
          nota_infraestrutura?: number | null
          nota_tempo_espera?: number | null
          paciente_id?: string | null
          pesquisa_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "respostas_pesquisa_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "respostas_pesquisa_pesquisa_id_fkey"
            columns: ["pesquisa_id"]
            isOneToOne: false
            referencedRelation: "pesquisas_satisfacao"
            referencedColumns: ["id"]
          },
        ]
      }
      restricoes_alimentares: {
        Row: {
          alimentos_proibidos: string[] | null
          aluno_id: string
          created_at: string
          descricao: string | null
          documento_medico_url: string | null
          id: string
          orientacoes_medicas: string | null
          tipo_restricao: string
          updated_at: string
        }
        Insert: {
          alimentos_proibidos?: string[] | null
          aluno_id: string
          created_at?: string
          descricao?: string | null
          documento_medico_url?: string | null
          id?: string
          orientacoes_medicas?: string | null
          tipo_restricao: string
          updated_at?: string
        }
        Update: {
          alimentos_proibidos?: string[] | null
          aluno_id?: string
          created_at?: string
          descricao?: string | null
          documento_medico_url?: string | null
          id?: string
          orientacoes_medicas?: string | null
          tipo_restricao?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "restricoes_alimentares_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
        ]
      }
      rotas_transporte: {
        Row: {
          created_at: string
          distancia_km: number | null
          escola_id: string | null
          horario_chegada: string | null
          horario_saida: string | null
          id: string
          nome: string
          pontos_parada: Json | null
          status: string | null
          updated_at: string
          veiculo_id: string | null
        }
        Insert: {
          created_at?: string
          distancia_km?: number | null
          escola_id?: string | null
          horario_chegada?: string | null
          horario_saida?: string | null
          id?: string
          nome: string
          pontos_parada?: Json | null
          status?: string | null
          updated_at?: string
          veiculo_id?: string | null
        }
        Update: {
          created_at?: string
          distancia_km?: number | null
          escola_id?: string | null
          horario_chegada?: string | null
          horario_saida?: string | null
          id?: string
          nome?: string
          pontos_parada?: Json | null
          status?: string | null
          updated_at?: string
          veiculo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rotas_transporte_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rotas_transporte_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos_transporte"
            referencedColumns: ["id"]
          },
        ]
      }
      secretarias: {
        Row: {
          bairro: string | null
          base_legal: string | null
          cep: string | null
          codigo_orcamentario: string | null
          competencias: string | null
          cor_tema: string | null
          created_at: string
          data_criacao: string | null
          email_institucional: string | null
          endereco: string | null
          icone: string | null
          id: string
          missao: string | null
          municipio_id: string
          nivel_hierarquico: number
          nome: string
          ordem_exibicao: number
          responsavel_id: string | null
          sigla: string
          status: string
          telefone_principal: string | null
          telefone_secundario: string | null
          tipo: Database["public"]["Enums"]["secretaria_tipo"]
          updated_at: string
        }
        Insert: {
          bairro?: string | null
          base_legal?: string | null
          cep?: string | null
          codigo_orcamentario?: string | null
          competencias?: string | null
          cor_tema?: string | null
          created_at?: string
          data_criacao?: string | null
          email_institucional?: string | null
          endereco?: string | null
          icone?: string | null
          id?: string
          missao?: string | null
          municipio_id: string
          nivel_hierarquico?: number
          nome: string
          ordem_exibicao?: number
          responsavel_id?: string | null
          sigla: string
          status?: string
          telefone_principal?: string | null
          telefone_secundario?: string | null
          tipo?: Database["public"]["Enums"]["secretaria_tipo"]
          updated_at?: string
        }
        Update: {
          bairro?: string | null
          base_legal?: string | null
          cep?: string | null
          codigo_orcamentario?: string | null
          competencias?: string | null
          cor_tema?: string | null
          created_at?: string
          data_criacao?: string | null
          email_institucional?: string | null
          endereco?: string | null
          icone?: string | null
          id?: string
          missao?: string | null
          municipio_id?: string
          nivel_hierarquico?: number
          nome?: string
          ordem_exibicao?: number
          responsavel_id?: string | null
          sigla?: string
          status?: string
          telefone_principal?: string | null
          telefone_secundario?: string | null
          tipo?: Database["public"]["Enums"]["secretaria_tipo"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "secretarias_municipio_id_fkey"
            columns: ["municipio_id"]
            isOneToOne: false
            referencedRelation: "municipios"
            referencedColumns: ["id"]
          },
        ]
      }
      secretarias_historico: {
        Row: {
          acao: string
          created_at: string
          dados_anteriores: Json | null
          data_vigencia: string
          id: string
          motivo: string | null
          responsavel_id: string | null
          secretaria_id: string
        }
        Insert: {
          acao: string
          created_at?: string
          dados_anteriores?: Json | null
          data_vigencia?: string
          id?: string
          motivo?: string | null
          responsavel_id?: string | null
          secretaria_id: string
        }
        Update: {
          acao?: string
          created_at?: string
          dados_anteriores?: Json | null
          data_vigencia?: string
          id?: string
          motivo?: string | null
          responsavel_id?: string | null
          secretaria_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "secretarias_historico_secretaria_id_fkey"
            columns: ["secretaria_id"]
            isOneToOne: false
            referencedRelation: "secretarias"
            referencedColumns: ["id"]
          },
        ]
      }
      solicitacoes_matricula: {
        Row: {
          cpf_aluno: string | null
          cpf_responsavel: string | null
          created_at: string
          data_nascimento: string | null
          documentos: Json | null
          email_responsavel: string | null
          endereco: string | null
          escola_desejada_id: string | null
          id: string
          motivo_recusa: string | null
          nome_aluno: string
          nome_responsavel: string
          observacoes: string | null
          protocolo: string
          serie_desejada: string | null
          status: string | null
          telefone_responsavel: string | null
          turno_desejado: string | null
          updated_at: string
        }
        Insert: {
          cpf_aluno?: string | null
          cpf_responsavel?: string | null
          created_at?: string
          data_nascimento?: string | null
          documentos?: Json | null
          email_responsavel?: string | null
          endereco?: string | null
          escola_desejada_id?: string | null
          id?: string
          motivo_recusa?: string | null
          nome_aluno: string
          nome_responsavel: string
          observacoes?: string | null
          protocolo: string
          serie_desejada?: string | null
          status?: string | null
          telefone_responsavel?: string | null
          turno_desejado?: string | null
          updated_at?: string
        }
        Update: {
          cpf_aluno?: string | null
          cpf_responsavel?: string | null
          created_at?: string
          data_nascimento?: string | null
          documentos?: Json | null
          email_responsavel?: string | null
          endereco?: string | null
          escola_desejada_id?: string | null
          id?: string
          motivo_recusa?: string | null
          nome_aluno?: string
          nome_responsavel?: string
          observacoes?: string | null
          protocolo?: string
          serie_desejada?: string | null
          status?: string | null
          telefone_responsavel?: string | null
          turno_desejado?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "solicitacoes_matricula_escola_desejada_id_fkey"
            columns: ["escola_desejada_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
        ]
      }
      task_assignments: {
        Row: {
          assigned_at: string
          id: string
          task_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          id?: string
          task_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          id?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_assignments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          goal_id: string | null
          id: string
          priority: Database["public"]["Enums"]["task_priority"]
          secretaria_id: string | null
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          goal_id?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          secretaria_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          goal_id?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          secretaria_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_secretaria_id_fkey"
            columns: ["secretaria_id"]
            isOneToOne: false
            referencedRelation: "secretarias"
            referencedColumns: ["id"]
          },
        ]
      }
      transferencias: {
        Row: {
          aluno_id: string
          created_at: string
          data_efetivacao: string | null
          data_solicitacao: string | null
          escola_destino_id: string | null
          escola_origem_id: string | null
          id: string
          motivo: string | null
          observacoes: string | null
          status: string | null
          turma_destino_id: string | null
          updated_at: string
        }
        Insert: {
          aluno_id: string
          created_at?: string
          data_efetivacao?: string | null
          data_solicitacao?: string | null
          escola_destino_id?: string | null
          escola_origem_id?: string | null
          id?: string
          motivo?: string | null
          observacoes?: string | null
          status?: string | null
          turma_destino_id?: string | null
          updated_at?: string
        }
        Update: {
          aluno_id?: string
          created_at?: string
          data_efetivacao?: string | null
          data_solicitacao?: string | null
          escola_destino_id?: string | null
          escola_origem_id?: string | null
          id?: string
          motivo?: string | null
          observacoes?: string | null
          status?: string | null
          turma_destino_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transferencias_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transferencias_escola_destino_id_fkey"
            columns: ["escola_destino_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transferencias_escola_origem_id_fkey"
            columns: ["escola_origem_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transferencias_turma_destino_id_fkey"
            columns: ["turma_destino_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      tratamentos: {
        Row: {
          cid: string | null
          created_at: string
          data_fim: string | null
          data_inicio: string
          data_prevista_fim: string | null
          id: string
          medicamentos: Json | null
          nome_tratamento: string
          observacoes: string | null
          orientacoes: string | null
          paciente_id: string
          profissional_id: string | null
          progresso: number | null
          status: string | null
          unidade_id: string | null
          updated_at: string
        }
        Insert: {
          cid?: string | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          data_prevista_fim?: string | null
          id?: string
          medicamentos?: Json | null
          nome_tratamento: string
          observacoes?: string | null
          orientacoes?: string | null
          paciente_id: string
          profissional_id?: string | null
          progresso?: number | null
          status?: string | null
          unidade_id?: string | null
          updated_at?: string
        }
        Update: {
          cid?: string | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          data_prevista_fim?: string | null
          id?: string
          medicamentos?: Json | null
          nome_tratamento?: string
          observacoes?: string | null
          orientacoes?: string | null
          paciente_id?: string
          profissional_id?: string | null
          progresso?: number | null
          status?: string | null
          unidade_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tratamentos_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tratamentos_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais_saude"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tratamentos_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades_saude"
            referencedColumns: ["id"]
          },
        ]
      }
      turmas: {
        Row: {
          ano_letivo: number
          capacidade: number | null
          created_at: string
          escola_id: string
          id: string
          nome: string
          professor_responsavel: string | null
          sala: string | null
          serie: string | null
          turno: string | null
          updated_at: string
        }
        Insert: {
          ano_letivo?: number
          capacidade?: number | null
          created_at?: string
          escola_id: string
          id?: string
          nome: string
          professor_responsavel?: string | null
          sala?: string | null
          serie?: string | null
          turno?: string | null
          updated_at?: string
        }
        Update: {
          ano_letivo?: number
          capacidade?: number | null
          created_at?: string
          escola_id?: string
          id?: string
          nome?: string
          professor_responsavel?: string | null
          sala?: string | null
          serie?: string | null
          turno?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "turmas_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
        ]
      }
      unidades_administrativas: {
        Row: {
          atribuicoes: string | null
          codigo: string | null
          created_at: string
          email: string | null
          id: string
          localizacao: string | null
          missao: string | null
          nivel: number
          nome: string
          qtd_cargos_ocupados: number | null
          qtd_cargos_previstos: number | null
          responsavel_id: string | null
          secretaria_id: string
          sigla: string | null
          status: string
          telefone: string | null
          tipo: Database["public"]["Enums"]["unidade_tipo"]
          unidade_superior_id: string | null
          updated_at: string
        }
        Insert: {
          atribuicoes?: string | null
          codigo?: string | null
          created_at?: string
          email?: string | null
          id?: string
          localizacao?: string | null
          missao?: string | null
          nivel?: number
          nome: string
          qtd_cargos_ocupados?: number | null
          qtd_cargos_previstos?: number | null
          responsavel_id?: string | null
          secretaria_id: string
          sigla?: string | null
          status?: string
          telefone?: string | null
          tipo?: Database["public"]["Enums"]["unidade_tipo"]
          unidade_superior_id?: string | null
          updated_at?: string
        }
        Update: {
          atribuicoes?: string | null
          codigo?: string | null
          created_at?: string
          email?: string | null
          id?: string
          localizacao?: string | null
          missao?: string | null
          nivel?: number
          nome?: string
          qtd_cargos_ocupados?: number | null
          qtd_cargos_previstos?: number | null
          responsavel_id?: string | null
          secretaria_id?: string
          sigla?: string | null
          status?: string
          telefone?: string | null
          tipo?: Database["public"]["Enums"]["unidade_tipo"]
          unidade_superior_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "unidades_administrativas_secretaria_id_fkey"
            columns: ["secretaria_id"]
            isOneToOne: false
            referencedRelation: "secretarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unidades_administrativas_unidade_superior_id_fkey"
            columns: ["unidade_superior_id"]
            isOneToOne: false
            referencedRelation: "unidades_administrativas"
            referencedColumns: ["id"]
          },
        ]
      }
      unidades_saude: {
        Row: {
          capacidade_diaria: number | null
          created_at: string
          email: string | null
          endereco: string | null
          especialidades: string[] | null
          horario_funcionamento: Json | null
          id: string
          nome: string
          observacoes: string | null
          responsavel: string | null
          status: string | null
          telefone: string | null
          tipo: string
          updated_at: string
        }
        Insert: {
          capacidade_diaria?: number | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          especialidades?: string[] | null
          horario_funcionamento?: Json | null
          id?: string
          nome: string
          observacoes?: string | null
          responsavel?: string | null
          status?: string | null
          telefone?: string | null
          tipo: string
          updated_at?: string
        }
        Update: {
          capacidade_diaria?: number | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          especialidades?: string[] | null
          horario_funcionamento?: Json | null
          id?: string
          nome?: string
          observacoes?: string | null
          responsavel?: string | null
          status?: string | null
          telefone?: string | null
          tipo?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_education_roles: {
        Row: {
          created_at: string
          escola_id: string | null
          id: string
          role: Database["public"]["Enums"]["education_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          escola_id?: string | null
          id?: string
          role: Database["public"]["Enums"]["education_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          escola_id?: string | null
          id?: string
          role?: Database["public"]["Enums"]["education_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_education_roles_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
        ]
      }
      user_health_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["health_role"]
          unidade_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["health_role"]
          unidade_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["health_role"]
          unidade_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_secretaria_roles: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean
          role: Database["public"]["Enums"]["secretaria_role"]
          secretaria_id: string | null
          unidade_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean
          role: Database["public"]["Enums"]["secretaria_role"]
          secretaria_id?: string | null
          unidade_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean
          role?: Database["public"]["Enums"]["secretaria_role"]
          secretaria_id?: string | null
          unidade_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_secretaria_roles_secretaria_id_fkey"
            columns: ["secretaria_id"]
            isOneToOne: false
            referencedRelation: "secretarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_secretaria_roles_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades_administrativas"
            referencedColumns: ["id"]
          },
        ]
      }
      vacinas: {
        Row: {
          created_at: string
          data_aplicacao: string
          data_proxima_dose: string | null
          dose: string | null
          fabricante: string | null
          id: string
          local_aplicacao: string | null
          lote: string | null
          nome_vacina: string
          observacoes: string | null
          paciente_id: string
          profissional_id: string | null
          unidade_id: string | null
        }
        Insert: {
          created_at?: string
          data_aplicacao?: string
          data_proxima_dose?: string | null
          dose?: string | null
          fabricante?: string | null
          id?: string
          local_aplicacao?: string | null
          lote?: string | null
          nome_vacina: string
          observacoes?: string | null
          paciente_id: string
          profissional_id?: string | null
          unidade_id?: string | null
        }
        Update: {
          created_at?: string
          data_aplicacao?: string
          data_proxima_dose?: string | null
          dose?: string | null
          fabricante?: string | null
          id?: string
          local_aplicacao?: string | null
          lote?: string | null
          nome_vacina?: string
          observacoes?: string | null
          paciente_id?: string
          profissional_id?: string | null
          unidade_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vacinas_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vacinas_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais_saude"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vacinas_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades_saude"
            referencedColumns: ["id"]
          },
        ]
      }
      veiculos_transporte: {
        Row: {
          ano: number | null
          capacidade: number | null
          created_at: string
          id: string
          modelo: string | null
          motorista: string | null
          placa: string
          status: string | null
          telefone_motorista: string | null
          updated_at: string
        }
        Insert: {
          ano?: number | null
          capacidade?: number | null
          created_at?: string
          id?: string
          modelo?: string | null
          motorista?: string | null
          placa: string
          status?: string | null
          telefone_motorista?: string | null
          updated_at?: string
        }
        Update: {
          ano?: number | null
          capacidade?: number | null
          created_at?: string
          id?: string
          modelo?: string | null
          motorista?: string | null
          placa?: string
          status?: string | null
          telefone_motorista?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_school_ids: { Args: { _user_id: string }; Returns: string[] }
      get_user_secretaria_ids: { Args: { _user_id: string }; Returns: string[] }
      get_user_unidade_ids: { Args: { _user_id: string }; Returns: string[] }
      has_education_role: {
        Args: {
          _role: Database["public"]["Enums"]["education_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_education_role_in_school: {
        Args: {
          _escola_id: string
          _role: Database["public"]["Enums"]["education_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_health_role: {
        Args: {
          _role: Database["public"]["Enums"]["health_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_health_role_in_unidade: {
        Args: {
          _role: Database["public"]["Enums"]["health_role"]
          _unidade_id: string
          _user_id: string
        }
        Returns: boolean
      }
      has_secretaria_access: {
        Args: { _secretaria_id: string; _user_id: string }
        Returns: boolean
      }
      has_secretaria_role: {
        Args: {
          _role: Database["public"]["Enums"]["secretaria_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_municipal: { Args: { _user_id: string }; Returns: boolean }
      is_responsavel_of_student: {
        Args: { _aluno_id: string; _user_id: string }
        Returns: boolean
      }
      is_secretaria: { Args: { _user_id: string }; Returns: boolean }
      is_secretaria_saude: { Args: { _user_id: string }; Returns: boolean }
      is_secretario_of: {
        Args: { _secretaria_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      education_role: "secretaria" | "diretor" | "professor" | "responsavel"
      exercicio_status: "aberto" | "bloqueado" | "encerrado"
      feriado_tipo: "nacional" | "estadual" | "municipal" | "ponto_facultativo"
      goal_status:
        | "pending"
        | "in_progress"
        | "delayed"
        | "completed"
        | "cancelled"
      goal_term: "short" | "medium" | "long"
      health_role:
        | "secretaria_saude"
        | "diretor_unidade"
        | "medico"
        | "enfermeiro"
        | "recepcionista"
        | "agente_saude"
      periodo_tipo: "bimestre" | "trimestre" | "quadrimestre" | "semestre"
      secretaria_role:
        | "admin_municipal"
        | "secretario"
        | "secretario_adjunto"
        | "diretor"
        | "coordenador"
        | "supervisor"
        | "servidor"
        | "estagiario"
      secretaria_tipo: "finalistico" | "administrativo"
      task_priority: "low" | "medium" | "high" | "urgent"
      task_status: "pending" | "in_progress" | "completed" | "cancelled"
      unidade_tipo: "administrativa" | "operacional" | "tecnica"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      education_role: ["secretaria", "diretor", "professor", "responsavel"],
      exercicio_status: ["aberto", "bloqueado", "encerrado"],
      feriado_tipo: ["nacional", "estadual", "municipal", "ponto_facultativo"],
      goal_status: [
        "pending",
        "in_progress",
        "delayed",
        "completed",
        "cancelled",
      ],
      goal_term: ["short", "medium", "long"],
      health_role: [
        "secretaria_saude",
        "diretor_unidade",
        "medico",
        "enfermeiro",
        "recepcionista",
        "agente_saude",
      ],
      periodo_tipo: ["bimestre", "trimestre", "quadrimestre", "semestre"],
      secretaria_role: [
        "admin_municipal",
        "secretario",
        "secretario_adjunto",
        "diretor",
        "coordenador",
        "supervisor",
        "servidor",
        "estagiario",
      ],
      secretaria_tipo: ["finalistico", "administrativo"],
      task_priority: ["low", "medium", "high", "urgent"],
      task_status: ["pending", "in_progress", "completed", "cancelled"],
      unidade_tipo: ["administrativa", "operacional", "tecnica"],
    },
  },
} as const
