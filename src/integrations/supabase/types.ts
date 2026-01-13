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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      alertas_educacionais: {
        Row: {
          aluno_id: string
          created_at: string | null
          dados_adicionais: Json | null
          data_resolucao: string | null
          id: string
          lido: boolean | null
          mensagem: string
          nivel: Database["public"]["Enums"]["nivel_alerta"]
          resolvido: boolean | null
          tipo: Database["public"]["Enums"]["tipo_alerta_educacional"]
          updated_at: string | null
        }
        Insert: {
          aluno_id: string
          created_at?: string | null
          dados_adicionais?: Json | null
          data_resolucao?: string | null
          id?: string
          lido?: boolean | null
          mensagem: string
          nivel?: Database["public"]["Enums"]["nivel_alerta"]
          resolvido?: boolean | null
          tipo: Database["public"]["Enums"]["tipo_alerta_educacional"]
          updated_at?: string | null
        }
        Update: {
          aluno_id?: string
          created_at?: string | null
          dados_adicionais?: Json | null
          data_resolucao?: string | null
          id?: string
          lido?: boolean | null
          mensagem?: string
          nivel?: Database["public"]["Enums"]["nivel_alerta"]
          resolvido?: boolean | null
          tipo?: Database["public"]["Enums"]["tipo_alerta_educacional"]
          updated_at?: string | null
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
      alunos: {
        Row: {
          bairro: string | null
          cep: string | null
          cidade: string | null
          cpf: string | null
          created_at: string | null
          data_matricula: string
          data_nascimento: string
          email: string | null
          endereco: string | null
          escola_id: string
          estado: string | null
          genero: string | null
          id: string
          necessidades_especiais: string | null
          nome: string
          numero_endereco: string | null
          numero_matricula: string
          observacoes: string | null
          rg: string | null
          status: Database["public"]["Enums"]["status_aluno"] | null
          telefone: string | null
          turma_atual_id: string | null
          updated_at: string | null
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cpf?: string | null
          created_at?: string | null
          data_matricula?: string
          data_nascimento: string
          email?: string | null
          endereco?: string | null
          escola_id: string
          estado?: string | null
          genero?: string | null
          id?: string
          necessidades_especiais?: string | null
          nome: string
          numero_endereco?: string | null
          numero_matricula: string
          observacoes?: string | null
          rg?: string | null
          status?: Database["public"]["Enums"]["status_aluno"] | null
          telefone?: string | null
          turma_atual_id?: string | null
          updated_at?: string | null
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cpf?: string | null
          created_at?: string | null
          data_matricula?: string
          data_nascimento?: string
          email?: string | null
          endereco?: string | null
          escola_id?: string
          estado?: string | null
          genero?: string | null
          id?: string
          necessidades_especiais?: string | null
          nome?: string
          numero_endereco?: string | null
          numero_matricula?: string
          observacoes?: string | null
          rg?: string | null
          status?: Database["public"]["Enums"]["status_aluno"] | null
          telefone?: string | null
          turma_atual_id?: string | null
          updated_at?: string | null
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
            foreignKeyName: "alunos_turma_atual_id_fkey"
            columns: ["turma_atual_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      alunos_responsaveis: {
        Row: {
          aluno_id: string
          autorizado_buscar: boolean | null
          created_at: string | null
          id: string
          responsavel_id: string
          responsavel_principal: boolean | null
        }
        Insert: {
          aluno_id: string
          autorizado_buscar?: boolean | null
          created_at?: string | null
          id?: string
          responsavel_id: string
          responsavel_principal?: boolean | null
        }
        Update: {
          aluno_id?: string
          autorizado_buscar?: boolean | null
          created_at?: string | null
          id?: string
          responsavel_id?: string
          responsavel_principal?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "alunos_responsaveis_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alunos_responsaveis_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "responsaveis"
            referencedColumns: ["id"]
          },
        ]
      }
      alunos_rotas: {
        Row: {
          aluno_id: string
          ativo: boolean | null
          created_at: string | null
          horario_embarque: string | null
          id: string
          ponto_desembarque: string | null
          ponto_embarque: string | null
          rota_id: string
          turno: string | null
          updated_at: string | null
          veiculo_id: string | null
        }
        Insert: {
          aluno_id: string
          ativo?: boolean | null
          created_at?: string | null
          horario_embarque?: string | null
          id?: string
          ponto_desembarque?: string | null
          ponto_embarque?: string | null
          rota_id: string
          turno?: string | null
          updated_at?: string | null
          veiculo_id?: string | null
        }
        Update: {
          aluno_id?: string
          ativo?: boolean | null
          created_at?: string | null
          horario_embarque?: string | null
          id?: string
          ponto_desembarque?: string | null
          ponto_embarque?: string | null
          rota_id?: string
          turno?: string | null
          updated_at?: string | null
          veiculo_id?: string | null
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
          {
            foreignKeyName: "alunos_rotas_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      calendario_escolar: {
        Row: {
          created_at: string | null
          data_fim: string | null
          data_inicio: string
          descricao: string | null
          escola_id: string | null
          id: string
          tipo_evento: string
          titulo: string
          turmas_especificas: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_fim?: string | null
          data_inicio: string
          descricao?: string | null
          escola_id?: string | null
          id?: string
          tipo_evento: string
          titulo: string
          turmas_especificas?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string
          descricao?: string | null
          escola_id?: string | null
          id?: string
          tipo_evento?: string
          titulo?: string
          turmas_especificas?: string[] | null
          updated_at?: string | null
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
          created_at: string | null
          data: string
          escola_id: string | null
          id: string
          itens: Json
          observacoes: string | null
          refeicao: Database["public"]["Enums"]["tipo_refeicao"]
          updated_at: string | null
        }
        Insert: {
          calorias_estimadas?: number | null
          created_at?: string | null
          data: string
          escola_id?: string | null
          id?: string
          itens: Json
          observacoes?: string | null
          refeicao: Database["public"]["Enums"]["tipo_refeicao"]
          updated_at?: string | null
        }
        Update: {
          calorias_estimadas?: number | null
          created_at?: string | null
          data?: string
          escola_id?: string | null
          id?: string
          itens?: Json
          observacoes?: string | null
          refeicao?: Database["public"]["Enums"]["tipo_refeicao"]
          updated_at?: string | null
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
      chamados_manutencao: {
        Row: {
          created_at: string | null
          data_abertura: string | null
          data_resolucao: string | null
          descricao: string
          escola_id: string
          id: string
          local_problema: string | null
          observacoes_resolucao: string | null
          prioridade: Database["public"]["Enums"]["prioridade_chamado"] | null
          responsavel_abertura: string | null
          responsavel_resolucao: string | null
          status: Database["public"]["Enums"]["status_chamado"] | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_abertura?: string | null
          data_resolucao?: string | null
          descricao: string
          escola_id: string
          id?: string
          local_problema?: string | null
          observacoes_resolucao?: string | null
          prioridade?: Database["public"]["Enums"]["prioridade_chamado"] | null
          responsavel_abertura?: string | null
          responsavel_resolucao?: string | null
          status?: Database["public"]["Enums"]["status_chamado"] | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_abertura?: string | null
          data_resolucao?: string | null
          descricao?: string
          escola_id?: string
          id?: string
          local_problema?: string | null
          observacoes_resolucao?: string | null
          prioridade?: Database["public"]["Enums"]["prioridade_chamado"] | null
          responsavel_abertura?: string | null
          responsavel_resolucao?: string | null
          status?: Database["public"]["Enums"]["status_chamado"] | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chamados_manutencao_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracoes_alertas: {
        Row: {
          created_at: string | null
          dias_sem_frequencia_evasao: number
          id: string
          nota_minima: number
          percentual_faltas_critical: number
          percentual_faltas_warning: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          dias_sem_frequencia_evasao?: number
          id?: string
          nota_minima?: number
          percentual_faltas_critical?: number
          percentual_faltas_warning?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          dias_sem_frequencia_evasao?: number
          id?: string
          nota_minima?: number
          percentual_faltas_critical?: number
          percentual_faltas_warning?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      contract_payments: {
        Row: {
          amount: number
          contract_id: string
          created_at: string
          description: string
          due_date: string
          id: string
          payment_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount?: number
          contract_id: string
          created_at?: string
          description: string
          due_date: string
          id?: string
          payment_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          contract_id?: string
          created_at?: string
          description?: string
          due_date?: string
          id?: string
          payment_date?: string | null
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
          contracted: string
          contractor: string
          created_at: string
          description: string
          document_urls: Json | null
          end_date: string
          id: string
          notes: string | null
          start_date: string
          status: string
          updated_at: string
          value: number
        }
        Insert: {
          contract_number: string
          contracted: string
          contractor: string
          created_at?: string
          description: string
          document_urls?: Json | null
          end_date: string
          id?: string
          notes?: string | null
          start_date: string
          status?: string
          updated_at?: string
          value?: number
        }
        Update: {
          contract_number?: string
          contracted?: string
          contractor?: string
          created_at?: string
          description?: string
          document_urls?: Json | null
          end_date?: string
          id?: string
          notes?: string | null
          start_date?: string
          status?: string
          updated_at?: string
          value?: number
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message: string | null
          receiver_id: string
          sender_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message?: string | null
          receiver_id: string
          sender_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message?: string | null
          receiver_id?: string
          sender_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      departments: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      disciplinas: {
        Row: {
          carga_horaria: number | null
          codigo: string | null
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
        }
        Insert: {
          carga_horaria?: number | null
          codigo?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
        }
        Update: {
          carga_horaria?: number | null
          codigo?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      documentos_matricula: {
        Row: {
          arquivo_url: string
          created_at: string | null
          id: string
          nome_arquivo: string
          observacao: string | null
          solicitacao_id: string
          tipo_documento: string
          validado: boolean | null
        }
        Insert: {
          arquivo_url: string
          created_at?: string | null
          id?: string
          nome_arquivo: string
          observacao?: string | null
          solicitacao_id: string
          tipo_documento: string
          validado?: boolean | null
        }
        Update: {
          arquivo_url?: string
          created_at?: string | null
          id?: string
          nome_arquivo?: string
          observacao?: string | null
          solicitacao_id?: string
          tipo_documento?: string
          validado?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "documentos_matricula_solicitacao_id_fkey"
            columns: ["solicitacao_id"]
            isOneToOne: false
            referencedRelation: "solicitacoes_matricula"
            referencedColumns: ["id"]
          },
        ]
      }
      escolas: {
        Row: {
          acessibilidade_cadeirante: boolean | null
          agua_potavel: boolean | null
          bairro: string | null
          capacidade_total: number | null
          cep: string | null
          cidade: string | null
          cnpj: string | null
          codigo_mec: string | null
          created_at: string | null
          diretor: string | null
          email: string | null
          endereco: string | null
          energia_eletrica: boolean | null
          esgoto_sanitario: boolean | null
          estado: string | null
          id: string
          internet_banda_larga: boolean | null
          nome: string
          status: string | null
          telefone: string | null
          tem_biblioteca: boolean | null
          tem_cozinha: boolean | null
          tem_laboratorio_informatica: boolean | null
          tem_quadra_esportes: boolean | null
          tem_refeitorio: boolean | null
          tem_sala_diretoria: boolean | null
          tem_sala_professores: boolean | null
          tem_secretaria: boolean | null
          updated_at: string | null
        }
        Insert: {
          acessibilidade_cadeirante?: boolean | null
          agua_potavel?: boolean | null
          bairro?: string | null
          capacidade_total?: number | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          codigo_mec?: string | null
          created_at?: string | null
          diretor?: string | null
          email?: string | null
          endereco?: string | null
          energia_eletrica?: boolean | null
          esgoto_sanitario?: boolean | null
          estado?: string | null
          id?: string
          internet_banda_larga?: boolean | null
          nome: string
          status?: string | null
          telefone?: string | null
          tem_biblioteca?: boolean | null
          tem_cozinha?: boolean | null
          tem_laboratorio_informatica?: boolean | null
          tem_quadra_esportes?: boolean | null
          tem_refeitorio?: boolean | null
          tem_sala_diretoria?: boolean | null
          tem_sala_professores?: boolean | null
          tem_secretaria?: boolean | null
          updated_at?: string | null
        }
        Update: {
          acessibilidade_cadeirante?: boolean | null
          agua_potavel?: boolean | null
          bairro?: string | null
          capacidade_total?: number | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          codigo_mec?: string | null
          created_at?: string | null
          diretor?: string | null
          email?: string | null
          endereco?: string | null
          energia_eletrica?: boolean | null
          esgoto_sanitario?: boolean | null
          estado?: string | null
          id?: string
          internet_banda_larga?: boolean | null
          nome?: string
          status?: string | null
          telefone?: string | null
          tem_biblioteca?: boolean | null
          tem_cozinha?: boolean | null
          tem_laboratorio_informatica?: boolean | null
          tem_quadra_esportes?: boolean | null
          tem_refeitorio?: boolean | null
          tem_sala_diretoria?: boolean | null
          tem_sala_professores?: boolean | null
          tem_secretaria?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      estoque_alimentos: {
        Row: {
          created_at: string | null
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
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_validade?: string | null
          escola_id?: string | null
          estoque_minimo?: number | null
          fornecedor?: string | null
          id?: string
          item: string
          lote?: string | null
          preco_unitario?: number | null
          quantidade: number
          unidade: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
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
          updated_at?: string | null
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
      faltas: {
        Row: {
          aluno_id: string
          created_at: string | null
          data_falta: string
          disciplina_id: string
          id: string
          justificativa: string | null
          professor_id: string
          tipo: Database["public"]["Enums"]["tipo_falta"] | null
          turma_id: string
        }
        Insert: {
          aluno_id: string
          created_at?: string | null
          data_falta: string
          disciplina_id: string
          id?: string
          justificativa?: string | null
          professor_id: string
          tipo?: Database["public"]["Enums"]["tipo_falta"] | null
          turma_id: string
        }
        Update: {
          aluno_id?: string
          created_at?: string | null
          data_falta?: string
          disciplina_id?: string
          id?: string
          justificativa?: string | null
          professor_id?: string
          tipo?: Database["public"]["Enums"]["tipo_falta"] | null
          turma_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "faltas_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faltas_disciplina_id_fkey"
            columns: ["disciplina_id"]
            isOneToOne: false
            referencedRelation: "disciplinas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faltas_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faltas_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      financial_goals: {
        Row: {
          alert_threshold: number
          created_at: string
          current_value: number | null
          description: string
          enable_alerts: boolean
          id: string
          percentage_increase: number
          status: string
          target_value: number
          type: string
          updated_at: string
        }
        Insert: {
          alert_threshold?: number
          created_at?: string
          current_value?: number | null
          description: string
          enable_alerts?: boolean
          id?: string
          percentage_increase?: number
          status?: string
          target_value?: number
          type: string
          updated_at?: string
        }
        Update: {
          alert_threshold?: number
          created_at?: string
          current_value?: number | null
          description?: string
          enable_alerts?: boolean
          id?: string
          percentage_increase?: number
          status?: string
          target_value?: number
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      financial_transactions: {
        Row: {
          amount: number
          category_id: string
          created_at: string
          created_by: string
          department_id: string | null
          description: string
          documents: Json | null
          id: string
          transaction_date: string
          type: string
          updated_at: string
        }
        Insert: {
          amount: number
          category_id: string
          created_at?: string
          created_by: string
          department_id?: string | null
          description: string
          documents?: Json | null
          id?: string
          transaction_date: string
          type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category_id?: string
          created_at?: string
          created_by?: string
          department_id?: string | null
          description?: string
          documents?: Json | null
          id?: string
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
        ]
      }
      goal_departments: {
        Row: {
          created_at: string
          department_id: string
          goal_id: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department_id: string
          goal_id: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department_id?: string
          goal_id?: string
          id?: string
          updated_at?: string
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
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          status: Database["public"]["Enums"]["goal_status"]
          term: Database["public"]["Enums"]["goal_term"]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          status?: Database["public"]["Enums"]["goal_status"]
          term: Database["public"]["Enums"]["goal_term"]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          status?: Database["public"]["Enums"]["goal_status"]
          term?: Database["public"]["Enums"]["goal_term"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      historico_escolar: {
        Row: {
          aluno_id: string
          ano_letivo: number
          created_at: string | null
          escola_id: string | null
          escola_nome: string
          id: string
          media_geral: number | null
          notas_finais: Json | null
          observacoes: string | null
          percentual_frequencia: number | null
          serie: string
          situacao: Database["public"]["Enums"]["situacao_ano_letivo"]
          total_faltas: number | null
          turma_nome: string | null
          updated_at: string | null
        }
        Insert: {
          aluno_id: string
          ano_letivo: number
          created_at?: string | null
          escola_id?: string | null
          escola_nome: string
          id?: string
          media_geral?: number | null
          notas_finais?: Json | null
          observacoes?: string | null
          percentual_frequencia?: number | null
          serie: string
          situacao: Database["public"]["Enums"]["situacao_ano_letivo"]
          total_faltas?: number | null
          turma_nome?: string | null
          updated_at?: string | null
        }
        Update: {
          aluno_id?: string
          ano_letivo?: number
          created_at?: string | null
          escola_id?: string | null
          escola_nome?: string
          id?: string
          media_geral?: number | null
          notas_finais?: Json | null
          observacoes?: string | null
          percentual_frequencia?: number | null
          serie?: string
          situacao?: Database["public"]["Enums"]["situacao_ano_letivo"]
          total_faltas?: number | null
          turma_nome?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "historico_escolar_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historico_escolar_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
        ]
      }
      justificativas_faltas: {
        Row: {
          created_at: string | null
          data_analise: string | null
          documento_url: string | null
          falta_id: string
          id: string
          motivo: string
          observacao_analise: string | null
          responsavel_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_analise?: string | null
          documento_url?: string | null
          falta_id: string
          id?: string
          motivo: string
          observacao_analise?: string | null
          responsavel_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_analise?: string | null
          documento_url?: string | null
          falta_id?: string
          id?: string
          motivo?: string
          observacao_analise?: string | null
          responsavel_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "justificativas_faltas_falta_id_fkey"
            columns: ["falta_id"]
            isOneToOne: false
            referencedRelation: "faltas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "justificativas_faltas_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "responsaveis"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachment: Json | null
          content: string
          conversation_id: string
          created_at: string
          id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          attachment?: Json | null
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          attachment?: Json | null
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read_at?: string | null
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
      notas: {
        Row: {
          aluno_id: string
          ano_letivo: number
          bimestre: number
          created_at: string | null
          data_avaliacao: string | null
          disciplina_id: string
          id: string
          nota: number | null
          observacoes: string | null
          professor_id: string
          tipo_avaliacao: string | null
          turma_id: string
          updated_at: string | null
        }
        Insert: {
          aluno_id: string
          ano_letivo: number
          bimestre: number
          created_at?: string | null
          data_avaliacao?: string | null
          disciplina_id: string
          id?: string
          nota?: number | null
          observacoes?: string | null
          professor_id: string
          tipo_avaliacao?: string | null
          turma_id: string
          updated_at?: string | null
        }
        Update: {
          aluno_id?: string
          ano_letivo?: number
          bimestre?: number
          created_at?: string | null
          data_avaliacao?: string | null
          disciplina_id?: string
          id?: string
          nota?: number | null
          observacoes?: string | null
          professor_id?: string
          tipo_avaliacao?: string | null
          turma_id?: string
          updated_at?: string | null
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
            foreignKeyName: "notas_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "professores"
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
          content: string
          created_at: string
          id: string
          link: string | null
          read_at: string | null
          related_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          related_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          related_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      professores: {
        Row: {
          cpf: string
          created_at: string | null
          data_admissao: string
          data_nascimento: string | null
          email: string | null
          endereco: string | null
          escola_principal_id: string | null
          especializacao: string | null
          formacao: string | null
          id: string
          nome: string
          registro_profissional: string | null
          rg: string | null
          status: string | null
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          cpf: string
          created_at?: string | null
          data_admissao: string
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          escola_principal_id?: string | null
          especializacao?: string | null
          formacao?: string | null
          id?: string
          nome: string
          registro_profissional?: string | null
          rg?: string | null
          status?: string | null
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          cpf?: string
          created_at?: string | null
          data_admissao?: string
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          escola_principal_id?: string | null
          especializacao?: string | null
          formacao?: string | null
          id?: string
          nome?: string
          registro_profissional?: string | null
          rg?: string | null
          status?: string | null
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "professores_escola_principal_id_fkey"
            columns: ["escola_principal_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
        ]
      }
      professores_disciplinas: {
        Row: {
          created_at: string | null
          disciplina_id: string
          id: string
          professor_id: string
        }
        Insert: {
          created_at?: string | null
          disciplina_id: string
          id?: string
          professor_id: string
        }
        Update: {
          created_at?: string | null
          disciplina_id?: string
          id?: string
          professor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "professores_disciplinas_disciplina_id_fkey"
            columns: ["disciplina_id"]
            isOneToOne: false
            referencedRelation: "disciplinas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professores_disciplinas_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bairro: string | null
          cidade: string | null
          cpf: string | null
          created_at: string
          data_nascimento: string | null
          department_id: string | null
          email: string | null
          endereco: string | null
          estado: string | null
          first_name: string | null
          id: string
          last_name: string | null
          numero_endereco: string | null
          pais: string | null
          rg: string | null
          role: string
          updated_at: string
        }
        Insert: {
          bairro?: string | null
          cidade?: string | null
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          department_id?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          numero_endereco?: string | null
          pais?: string | null
          rg?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          bairro?: string | null
          cidade?: string | null
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          department_id?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          numero_endereco?: string | null
          pais?: string | null
          rg?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      responsaveis: {
        Row: {
          bairro: string | null
          cep: string | null
          cidade: string | null
          cpf: string
          created_at: string | null
          data_nascimento: string | null
          email: string | null
          endereco: string | null
          estado: string | null
          genero: string | null
          grau_parentesco: string
          id: string
          local_trabalho: string | null
          nome: string
          numero_endereco: string | null
          profissao: string | null
          rg: string | null
          telefone: string
          telefone_trabalho: string | null
          updated_at: string | null
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cpf: string
          created_at?: string | null
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          genero?: string | null
          grau_parentesco: string
          id?: string
          local_trabalho?: string | null
          nome: string
          numero_endereco?: string | null
          profissao?: string | null
          rg?: string | null
          telefone: string
          telefone_trabalho?: string | null
          updated_at?: string | null
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cpf?: string
          created_at?: string | null
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          genero?: string | null
          grau_parentesco?: string
          id?: string
          local_trabalho?: string | null
          nome?: string
          numero_endereco?: string | null
          profissao?: string | null
          rg?: string | null
          telefone?: string
          telefone_trabalho?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      restricoes_alimentares: {
        Row: {
          alimentos_proibidos: Json | null
          aluno_id: string
          created_at: string | null
          descricao: string | null
          documento_medico_url: string | null
          id: string
          orientacoes_medicas: string | null
          tipo_restricao: string
          updated_at: string | null
        }
        Insert: {
          alimentos_proibidos?: Json | null
          aluno_id: string
          created_at?: string | null
          descricao?: string | null
          documento_medico_url?: string | null
          id?: string
          orientacoes_medicas?: string | null
          tipo_restricao: string
          updated_at?: string | null
        }
        Update: {
          alimentos_proibidos?: Json | null
          aluno_id?: string
          created_at?: string | null
          descricao?: string | null
          documento_medico_url?: string | null
          id?: string
          orientacoes_medicas?: string | null
          tipo_restricao?: string
          updated_at?: string | null
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
          created_at: string | null
          descricao: string | null
          horario_fim: string | null
          horario_inicio: string | null
          id: string
          km_estimado: number | null
          nome: string
          pontos_parada: Json | null
          status: Database["public"]["Enums"]["status_rota"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          horario_fim?: string | null
          horario_inicio?: string | null
          id?: string
          km_estimado?: number | null
          nome: string
          pontos_parada?: Json | null
          status?: Database["public"]["Enums"]["status_rota"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          horario_fim?: string | null
          horario_inicio?: string | null
          id?: string
          km_estimado?: number | null
          nome?: string
          pontos_parada?: Json | null
          status?: Database["public"]["Enums"]["status_rota"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      solicitacoes_matricula: {
        Row: {
          aluno_criado_id: string | null
          ano_letivo: number
          created_at: string | null
          dados_aluno: Json
          dados_responsavel: Json
          data_processamento: string | null
          documentos: Json | null
          escola_preferida_id: string | null
          id: string
          motivo_rejeicao: string | null
          observacoes: string | null
          processado_por: string | null
          protocolo: string
          serie_pretendida: string
          status:
            | Database["public"]["Enums"]["status_solicitacao_matricula"]
            | null
          turma_sugerida_id: string | null
          updated_at: string | null
        }
        Insert: {
          aluno_criado_id?: string | null
          ano_letivo: number
          created_at?: string | null
          dados_aluno: Json
          dados_responsavel: Json
          data_processamento?: string | null
          documentos?: Json | null
          escola_preferida_id?: string | null
          id?: string
          motivo_rejeicao?: string | null
          observacoes?: string | null
          processado_por?: string | null
          protocolo: string
          serie_pretendida: string
          status?:
            | Database["public"]["Enums"]["status_solicitacao_matricula"]
            | null
          turma_sugerida_id?: string | null
          updated_at?: string | null
        }
        Update: {
          aluno_criado_id?: string | null
          ano_letivo?: number
          created_at?: string | null
          dados_aluno?: Json
          dados_responsavel?: Json
          data_processamento?: string | null
          documentos?: Json | null
          escola_preferida_id?: string | null
          id?: string
          motivo_rejeicao?: string | null
          observacoes?: string | null
          processado_por?: string | null
          protocolo?: string
          serie_pretendida?: string
          status?:
            | Database["public"]["Enums"]["status_solicitacao_matricula"]
            | null
          turma_sugerida_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "solicitacoes_matricula_aluno_criado_id_fkey"
            columns: ["aluno_criado_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitacoes_matricula_escola_preferida_id_fkey"
            columns: ["escola_preferida_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitacoes_matricula_turma_sugerida_id_fkey"
            columns: ["turma_sugerida_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      task_assignments: {
        Row: {
          assigned_at: string
          task_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          task_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string
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
          completed: boolean | null
          created_at: string
          description: string | null
          due_date: string | null
          goal_id: string
          id: string
          priority: Database["public"]["Enums"]["task_priority"]
          title: string
          updated_at: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          goal_id: string
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          title: string
          updated_at?: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          goal_id?: string
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
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
        ]
      }
      transferencias: {
        Row: {
          aluno_id: string
          aprovado_por: string | null
          created_at: string | null
          data_efetivacao: string | null
          data_solicitacao: string | null
          documentos_gerados: Json | null
          escola_destino_id: string | null
          escola_externa_destino: string | null
          escola_externa_origem: string | null
          escola_origem_id: string | null
          id: string
          motivo: string | null
          observacoes: string | null
          solicitado_por: string | null
          status: Database["public"]["Enums"]["status_transferencia"] | null
          tipo: Database["public"]["Enums"]["tipo_transferencia"]
          turma_destino_id: string | null
          turma_origem_id: string | null
          updated_at: string | null
        }
        Insert: {
          aluno_id: string
          aprovado_por?: string | null
          created_at?: string | null
          data_efetivacao?: string | null
          data_solicitacao?: string | null
          documentos_gerados?: Json | null
          escola_destino_id?: string | null
          escola_externa_destino?: string | null
          escola_externa_origem?: string | null
          escola_origem_id?: string | null
          id?: string
          motivo?: string | null
          observacoes?: string | null
          solicitado_por?: string | null
          status?: Database["public"]["Enums"]["status_transferencia"] | null
          tipo: Database["public"]["Enums"]["tipo_transferencia"]
          turma_destino_id?: string | null
          turma_origem_id?: string | null
          updated_at?: string | null
        }
        Update: {
          aluno_id?: string
          aprovado_por?: string | null
          created_at?: string | null
          data_efetivacao?: string | null
          data_solicitacao?: string | null
          documentos_gerados?: Json | null
          escola_destino_id?: string | null
          escola_externa_destino?: string | null
          escola_externa_origem?: string | null
          escola_origem_id?: string | null
          id?: string
          motivo?: string | null
          observacoes?: string | null
          solicitado_por?: string | null
          status?: Database["public"]["Enums"]["status_transferencia"] | null
          tipo?: Database["public"]["Enums"]["tipo_transferencia"]
          turma_destino_id?: string | null
          turma_origem_id?: string | null
          updated_at?: string | null
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
          {
            foreignKeyName: "transferencias_turma_origem_id_fkey"
            columns: ["turma_origem_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      turmas: {
        Row: {
          ano_letivo: number
          capacidade: number | null
          created_at: string | null
          escola_id: string
          id: string
          modalidade: Database["public"]["Enums"]["modalidade_ensino"]
          nome: string
          professor_responsavel_id: string | null
          sala: string | null
          serie: string
          status: string | null
          turno: Database["public"]["Enums"]["turno_escolar"]
          updated_at: string | null
        }
        Insert: {
          ano_letivo: number
          capacidade?: number | null
          created_at?: string | null
          escola_id: string
          id?: string
          modalidade: Database["public"]["Enums"]["modalidade_ensino"]
          nome: string
          professor_responsavel_id?: string | null
          sala?: string | null
          serie: string
          status?: string | null
          turno: Database["public"]["Enums"]["turno_escolar"]
          updated_at?: string | null
        }
        Update: {
          ano_letivo?: number
          capacidade?: number | null
          created_at?: string | null
          escola_id?: string
          id?: string
          modalidade?: Database["public"]["Enums"]["modalidade_ensino"]
          nome?: string
          professor_responsavel_id?: string | null
          sala?: string | null
          serie?: string
          status?: string | null
          turno?: Database["public"]["Enums"]["turno_escolar"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "turmas_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "turmas_professor_responsavel_id_fkey"
            columns: ["professor_responsavel_id"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios_responsaveis: {
        Row: {
          created_at: string | null
          id: string
          responsavel_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          responsavel_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          responsavel_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_responsaveis_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "responsaveis"
            referencedColumns: ["id"]
          },
        ]
      }
      veiculos: {
        Row: {
          ano: number | null
          capacidade: number
          created_at: string | null
          id: string
          modelo: string
          motorista_cnh: string | null
          motorista_nome: string | null
          motorista_telefone: string | null
          observacoes: string | null
          placa: string
          status: Database["public"]["Enums"]["status_veiculo"] | null
          updated_at: string | null
        }
        Insert: {
          ano?: number | null
          capacidade: number
          created_at?: string | null
          id?: string
          modelo: string
          motorista_cnh?: string | null
          motorista_nome?: string | null
          motorista_telefone?: string | null
          observacoes?: string | null
          placa: string
          status?: Database["public"]["Enums"]["status_veiculo"] | null
          updated_at?: string | null
        }
        Update: {
          ano?: number | null
          capacidade?: number
          created_at?: string | null
          id?: string
          modelo?: string
          motorista_cnh?: string | null
          motorista_nome?: string | null
          motorista_telefone?: string | null
          observacoes?: string | null
          placa?: string
          status?: Database["public"]["Enums"]["status_veiculo"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      gerar_numero_matricula: { Args: never; Returns: string }
      gerar_protocolo_matricula: { Args: never; Returns: string }
    }
    Enums: {
      goal_status:
        | "pending"
        | "in_progress"
        | "delayed"
        | "completed"
        | "cancelled"
      goal_term: "short" | "medium" | "long"
      modalidade_ensino:
        | "infantil"
        | "fundamental_i"
        | "fundamental_ii"
        | "eja"
        | "creche"
      nivel_alerta: "info" | "warning" | "critical"
      perfil_usuario:
        | "admin_secretaria"
        | "gestor_escolar"
        | "professor"
        | "aluno"
        | "responsavel"
      prioridade_chamado: "baixa" | "media" | "alta" | "urgente"
      situacao_ano_letivo:
        | "aprovado"
        | "reprovado"
        | "transferido"
        | "em_curso"
        | "evadido"
      status_aluno: "matriculado" | "transferido" | "evadido" | "concluido"
      status_chamado: "aberto" | "em_andamento" | "resolvido" | "cancelado"
      status_escola: "ativa" | "inativa" | "em_reforma" | "em_construcao"
      status_rota: "ativa" | "inativa" | "em_manutencao"
      status_solicitacao_matricula:
        | "pendente"
        | "em_analise"
        | "aprovada"
        | "rejeitada"
        | "lista_espera"
      status_transferencia:
        | "solicitada"
        | "em_analise"
        | "aprovada"
        | "rejeitada"
        | "cancelada"
        | "concluida"
      status_veiculo: "disponivel" | "em_uso" | "manutencao" | "inativo"
      task_priority: "low" | "medium" | "high"
      tipo_alerta_educacional:
        | "faltas_excessivas"
        | "nota_baixa"
        | "risco_reprovacao"
        | "evasao"
      tipo_falta: "justificada" | "injustificada"
      tipo_refeicao:
        | "cafe_manha"
        | "lanche_manha"
        | "almoco"
        | "lanche_tarde"
        | "jantar"
      tipo_transferencia:
        | "interna_turma"
        | "interna_escola"
        | "externa_entrada"
        | "externa_saida"
      turno_escolar: "matutino" | "vespertino" | "noturno" | "integral"
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
      goal_status: [
        "pending",
        "in_progress",
        "delayed",
        "completed",
        "cancelled",
      ],
      goal_term: ["short", "medium", "long"],
      modalidade_ensino: [
        "infantil",
        "fundamental_i",
        "fundamental_ii",
        "eja",
        "creche",
      ],
      nivel_alerta: ["info", "warning", "critical"],
      perfil_usuario: [
        "admin_secretaria",
        "gestor_escolar",
        "professor",
        "aluno",
        "responsavel",
      ],
      prioridade_chamado: ["baixa", "media", "alta", "urgente"],
      situacao_ano_letivo: [
        "aprovado",
        "reprovado",
        "transferido",
        "em_curso",
        "evadido",
      ],
      status_aluno: ["matriculado", "transferido", "evadido", "concluido"],
      status_chamado: ["aberto", "em_andamento", "resolvido", "cancelado"],
      status_escola: ["ativa", "inativa", "em_reforma", "em_construcao"],
      status_rota: ["ativa", "inativa", "em_manutencao"],
      status_solicitacao_matricula: [
        "pendente",
        "em_analise",
        "aprovada",
        "rejeitada",
        "lista_espera",
      ],
      status_transferencia: [
        "solicitada",
        "em_analise",
        "aprovada",
        "rejeitada",
        "cancelada",
        "concluida",
      ],
      status_veiculo: ["disponivel", "em_uso", "manutencao", "inativo"],
      task_priority: ["low", "medium", "high"],
      tipo_alerta_educacional: [
        "faltas_excessivas",
        "nota_baixa",
        "risco_reprovacao",
        "evasao",
      ],
      tipo_falta: ["justificada", "injustificada"],
      tipo_refeicao: [
        "cafe_manha",
        "lanche_manha",
        "almoco",
        "lanche_tarde",
        "jantar",
      ],
      tipo_transferencia: [
        "interna_turma",
        "interna_escola",
        "externa_entrada",
        "externa_saida",
      ],
      turno_escolar: ["matutino", "vespertino", "noturno", "integral"],
    },
  },
} as const
