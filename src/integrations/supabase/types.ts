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
      auditoria_global: {
        Row: {
          alteracoes: Json | null
          categoria: Database["public"]["Enums"]["categoria_auditoria"]
          created_at: string
          entidade: string
          entidade_id: string | null
          estado_anterior: Json | null
          estado_posterior: Json | null
          hash_anterior: string | null
          hash_registro: string
          id: string
          ip_address: unknown
          metadata: Json | null
          modulo: string
          secretaria_id: string | null
          secretaria_nome: string | null
          tipo_acao: Database["public"]["Enums"]["tipo_acao_auditoria"]
          user_agent: string | null
          user_email: string | null
          user_id: string | null
          user_nome: string | null
          versao: number | null
        }
        Insert: {
          alteracoes?: Json | null
          categoria?: Database["public"]["Enums"]["categoria_auditoria"]
          created_at?: string
          entidade: string
          entidade_id?: string | null
          estado_anterior?: Json | null
          estado_posterior?: Json | null
          hash_anterior?: string | null
          hash_registro: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          modulo: string
          secretaria_id?: string | null
          secretaria_nome?: string | null
          tipo_acao: Database["public"]["Enums"]["tipo_acao_auditoria"]
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_nome?: string | null
          versao?: number | null
        }
        Update: {
          alteracoes?: Json | null
          categoria?: Database["public"]["Enums"]["categoria_auditoria"]
          created_at?: string
          entidade?: string
          entidade_id?: string | null
          estado_anterior?: Json | null
          estado_posterior?: Json | null
          hash_anterior?: string | null
          hash_registro?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          modulo?: string
          secretaria_id?: string | null
          secretaria_nome?: string | null
          tipo_acao?: Database["public"]["Enums"]["tipo_acao_auditoria"]
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_nome?: string | null
          versao?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "auditoria_global_secretaria_id_fkey"
            columns: ["secretaria_id"]
            isOneToOne: false
            referencedRelation: "secretarias"
            referencedColumns: ["id"]
          },
        ]
      }
      banco_horas: {
        Row: {
          competencia: string
          created_at: string | null
          horas_creditadas: number | null
          horas_debitadas: number | null
          id: string
          limite_acumulado: number | null
          observacoes: string | null
          saldo_anterior: number | null
          saldo_atual: number | null
          servidor_id: string
          updated_at: string | null
        }
        Insert: {
          competencia: string
          created_at?: string | null
          horas_creditadas?: number | null
          horas_debitadas?: number | null
          id?: string
          limite_acumulado?: number | null
          observacoes?: string | null
          saldo_anterior?: number | null
          saldo_atual?: number | null
          servidor_id: string
          updated_at?: string | null
        }
        Update: {
          competencia?: string
          created_at?: string | null
          horas_creditadas?: number | null
          horas_debitadas?: number | null
          id?: string
          limite_acumulado?: number | null
          observacoes?: string | null
          saldo_anterior?: number | null
          saldo_atual?: number | null
          servidor_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "banco_horas_servidor_id_fkey"
            columns: ["servidor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      banco_horas_movimentos: {
        Row: {
          banco_horas_id: string
          created_at: string | null
          data: string
          horas: number
          id: string
          motivo: string
          ponto_id: string | null
          tipo: string
        }
        Insert: {
          banco_horas_id: string
          created_at?: string | null
          data: string
          horas: number
          id?: string
          motivo: string
          ponto_id?: string | null
          tipo: string
        }
        Update: {
          banco_horas_id?: string
          created_at?: string | null
          data?: string
          horas?: number
          id?: string
          motivo?: string
          ponto_id?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "banco_horas_movimentos_banco_horas_id_fkey"
            columns: ["banco_horas_id"]
            isOneToOne: false
            referencedRelation: "banco_horas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "banco_horas_movimentos_ponto_id_fkey"
            columns: ["ponto_id"]
            isOneToOne: false
            referencedRelation: "ponto_servidor"
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
      cargos_publicos: {
        Row: {
          classe: string | null
          codigo: string
          created_at: string
          criterios_progressao: Json | null
          data_criacao: string | null
          descricao: string | null
          escolaridade_minima: string | null
          formacao_especifica: string | null
          id: string
          intersticio_progressao_meses: number | null
          jornada_diaria: number | null
          jornada_semanal: number
          lei_criacao: string | null
          municipio_id: string | null
          nivel: string | null
          nome: string
          padrao: string | null
          permite_progressao_horizontal: boolean | null
          permite_progressao_vertical: boolean | null
          regime: Database["public"]["Enums"]["regime_trabalho"]
          requisitos_adicionais: Json | null
          status: string | null
          teto_remuneratorio: number | null
          tipo: Database["public"]["Enums"]["tipo_cargo"]
          updated_at: string
          vagas_criadas: number | null
          vagas_disponiveis: number | null
          vagas_ocupadas: number | null
          vencimento_base: number | null
        }
        Insert: {
          classe?: string | null
          codigo: string
          created_at?: string
          criterios_progressao?: Json | null
          data_criacao?: string | null
          descricao?: string | null
          escolaridade_minima?: string | null
          formacao_especifica?: string | null
          id?: string
          intersticio_progressao_meses?: number | null
          jornada_diaria?: number | null
          jornada_semanal?: number
          lei_criacao?: string | null
          municipio_id?: string | null
          nivel?: string | null
          nome: string
          padrao?: string | null
          permite_progressao_horizontal?: boolean | null
          permite_progressao_vertical?: boolean | null
          regime?: Database["public"]["Enums"]["regime_trabalho"]
          requisitos_adicionais?: Json | null
          status?: string | null
          teto_remuneratorio?: number | null
          tipo?: Database["public"]["Enums"]["tipo_cargo"]
          updated_at?: string
          vagas_criadas?: number | null
          vagas_disponiveis?: number | null
          vagas_ocupadas?: number | null
          vencimento_base?: number | null
        }
        Update: {
          classe?: string | null
          codigo?: string
          created_at?: string
          criterios_progressao?: Json | null
          data_criacao?: string | null
          descricao?: string | null
          escolaridade_minima?: string | null
          formacao_especifica?: string | null
          id?: string
          intersticio_progressao_meses?: number | null
          jornada_diaria?: number | null
          jornada_semanal?: number
          lei_criacao?: string | null
          municipio_id?: string | null
          nivel?: string | null
          nome?: string
          padrao?: string | null
          permite_progressao_horizontal?: boolean | null
          permite_progressao_vertical?: boolean | null
          regime?: Database["public"]["Enums"]["regime_trabalho"]
          requisitos_adicionais?: Json | null
          status?: string | null
          teto_remuneratorio?: number | null
          tipo?: Database["public"]["Enums"]["tipo_cargo"]
          updated_at?: string
          vagas_criadas?: number | null
          vagas_disponiveis?: number | null
          vagas_ocupadas?: number | null
          vencimento_base?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cargos_publicos_municipio_id_fkey"
            columns: ["municipio_id"]
            isOneToOne: false
            referencedRelation: "municipios"
            referencedColumns: ["id"]
          },
        ]
      }
      conciliacao_pendencias: {
        Row: {
          conciliacao_id: string | null
          created_at: string | null
          descricao: string | null
          id: string
          movimentacao_id: string | null
          resolvido: boolean | null
          tipo: string | null
          valor: number
        }
        Insert: {
          conciliacao_id?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          movimentacao_id?: string | null
          resolvido?: boolean | null
          tipo?: string | null
          valor: number
        }
        Update: {
          conciliacao_id?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          movimentacao_id?: string | null
          resolvido?: boolean | null
          tipo?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "conciliacao_pendencias_conciliacao_id_fkey"
            columns: ["conciliacao_id"]
            isOneToOne: false
            referencedRelation: "conciliacoes_bancarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conciliacao_pendencias_movimentacao_id_fkey"
            columns: ["movimentacao_id"]
            isOneToOne: false
            referencedRelation: "movimentacoes_bancarias"
            referencedColumns: ["id"]
          },
        ]
      }
      conciliacoes_bancarias: {
        Row: {
          competencia: string
          conciliado_por: string | null
          conta_id: string | null
          created_at: string | null
          data_conciliacao: string | null
          diferenca: number | null
          id: string
          observacoes: string | null
          saldo_extrato: number
          saldo_sistema: number
          status: string | null
        }
        Insert: {
          competencia: string
          conciliado_por?: string | null
          conta_id?: string | null
          created_at?: string | null
          data_conciliacao?: string | null
          diferenca?: number | null
          id?: string
          observacoes?: string | null
          saldo_extrato: number
          saldo_sistema: number
          status?: string | null
        }
        Update: {
          competencia?: string
          conciliado_por?: string | null
          conta_id?: string | null
          created_at?: string | null
          data_conciliacao?: string | null
          diferenca?: number | null
          id?: string
          observacoes?: string | null
          saldo_extrato?: number
          saldo_sistema?: number
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conciliacoes_bancarias_conciliado_por_fkey"
            columns: ["conciliado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conciliacoes_bancarias_conta_id_fkey"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "contas_bancarias"
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
      contas_bancarias: {
        Row: {
          agencia: string
          agencia_digito: string | null
          ativa: boolean | null
          banco_codigo: string
          banco_nome: string
          conta: string
          conta_digito: string | null
          created_at: string | null
          finalidade: string | null
          fonte_recurso_id: string | null
          id: string
          municipio_id: string | null
          saldo_atual: number | null
          secretaria_id: string | null
          tipo: string | null
          updated_at: string | null
        }
        Insert: {
          agencia: string
          agencia_digito?: string | null
          ativa?: boolean | null
          banco_codigo: string
          banco_nome: string
          conta: string
          conta_digito?: string | null
          created_at?: string | null
          finalidade?: string | null
          fonte_recurso_id?: string | null
          id?: string
          municipio_id?: string | null
          saldo_atual?: number | null
          secretaria_id?: string | null
          tipo?: string | null
          updated_at?: string | null
        }
        Update: {
          agencia?: string
          agencia_digito?: string | null
          ativa?: boolean | null
          banco_codigo?: string
          banco_nome?: string
          conta?: string
          conta_digito?: string | null
          created_at?: string | null
          finalidade?: string | null
          fonte_recurso_id?: string | null
          id?: string
          municipio_id?: string | null
          saldo_atual?: number | null
          secretaria_id?: string | null
          tipo?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contas_bancarias_fonte_recurso_id_fkey"
            columns: ["fonte_recurso_id"]
            isOneToOne: false
            referencedRelation: "fonte_recursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_bancarias_municipio_id_fkey"
            columns: ["municipio_id"]
            isOneToOne: false
            referencedRelation: "municipios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_bancarias_secretaria_id_fkey"
            columns: ["secretaria_id"]
            isOneToOne: false
            referencedRelation: "secretarias"
            referencedColumns: ["id"]
          },
        ]
      }
      contracheques: {
        Row: {
          arquivo_url: string | null
          competencia: string
          created_at: string | null
          data_envio: string | null
          enviado_email: boolean | null
          folha_servidor_id: string
          hash_documento: string | null
          id: string
          servidor_id: string
        }
        Insert: {
          arquivo_url?: string | null
          competencia: string
          created_at?: string | null
          data_envio?: string | null
          enviado_email?: boolean | null
          folha_servidor_id: string
          hash_documento?: string | null
          id?: string
          servidor_id: string
        }
        Update: {
          arquivo_url?: string | null
          competencia?: string
          created_at?: string | null
          data_envio?: string | null
          enviado_email?: boolean | null
          folha_servidor_id?: string
          hash_documento?: string | null
          id?: string
          servidor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracheques_folha_servidor_id_fkey"
            columns: ["folha_servidor_id"]
            isOneToOne: false
            referencedRelation: "folha_servidor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracheques_servidor_id_fkey"
            columns: ["servidor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          dotacao_id: string | null
          end_date: string
          fonte_recursos_id: string | null
          id: string
          modalidade_licitacao: string | null
          numero_licitacao: string | null
          object: string | null
          payment_terms: string | null
          programa_trabalho: string | null
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
          dotacao_id?: string | null
          end_date: string
          fonte_recursos_id?: string | null
          id?: string
          modalidade_licitacao?: string | null
          numero_licitacao?: string | null
          object?: string | null
          payment_terms?: string | null
          programa_trabalho?: string | null
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
          dotacao_id?: string | null
          end_date?: string
          fonte_recursos_id?: string | null
          id?: string
          modalidade_licitacao?: string | null
          numero_licitacao?: string | null
          object?: string | null
          payment_terms?: string | null
          programa_trabalho?: string | null
          secretaria_id?: string | null
          start_date?: string
          status?: string
          title?: string
          updated_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "contracts_dotacao_id_fkey"
            columns: ["dotacao_id"]
            isOneToOne: false
            referencedRelation: "dotacoes_orcamentarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_fonte_recursos_id_fkey"
            columns: ["fonte_recursos_id"]
            isOneToOne: false
            referencedRelation: "fonte_recursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_secretaria_id_fkey"
            columns: ["secretaria_id"]
            isOneToOne: false
            referencedRelation: "secretarias"
            referencedColumns: ["id"]
          },
        ]
      }
      contratos_aditivos: {
        Row: {
          contrato_id: string | null
          created_at: string | null
          data_assinatura: string
          id: string
          justificativa: string | null
          nova_data_termino: string | null
          numero_aditivo: number
          prazo_adicional_dias: number | null
          tipo: string | null
          valor_adicional: number | null
        }
        Insert: {
          contrato_id?: string | null
          created_at?: string | null
          data_assinatura: string
          id?: string
          justificativa?: string | null
          nova_data_termino?: string | null
          numero_aditivo: number
          prazo_adicional_dias?: number | null
          tipo?: string | null
          valor_adicional?: number | null
        }
        Update: {
          contrato_id?: string | null
          created_at?: string | null
          data_assinatura?: string
          id?: string
          justificativa?: string | null
          nova_data_termino?: string | null
          numero_aditivo?: number
          prazo_adicional_dias?: number | null
          tipo?: string | null
          valor_adicional?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contratos_aditivos_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      convenios: {
        Row: {
          agencia: string | null
          ano: number
          banco: string | null
          concedente: string
          conta_bancaria_especifica: string | null
          convenente: string
          created_at: string | null
          data_assinatura: string
          data_fim: string
          data_inicio: string
          data_prestacao_contas: string | null
          id: string
          numero: string
          objeto: string
          observacoes: string | null
          secretaria_id: string | null
          status: Database["public"]["Enums"]["status_convenio"] | null
          tipo: Database["public"]["Enums"]["tipo_convenio"]
          updated_at: string | null
          valor_contrapartida: number | null
          valor_repasse: number
          valor_total: number
        }
        Insert: {
          agencia?: string | null
          ano: number
          banco?: string | null
          concedente: string
          conta_bancaria_especifica?: string | null
          convenente: string
          created_at?: string | null
          data_assinatura: string
          data_fim: string
          data_inicio: string
          data_prestacao_contas?: string | null
          id?: string
          numero: string
          objeto: string
          observacoes?: string | null
          secretaria_id?: string | null
          status?: Database["public"]["Enums"]["status_convenio"] | null
          tipo: Database["public"]["Enums"]["tipo_convenio"]
          updated_at?: string | null
          valor_contrapartida?: number | null
          valor_repasse: number
          valor_total: number
        }
        Update: {
          agencia?: string | null
          ano?: number
          banco?: string | null
          concedente?: string
          conta_bancaria_especifica?: string | null
          convenente?: string
          created_at?: string | null
          data_assinatura?: string
          data_fim?: string
          data_inicio?: string
          data_prestacao_contas?: string | null
          id?: string
          numero?: string
          objeto?: string
          observacoes?: string | null
          secretaria_id?: string | null
          status?: Database["public"]["Enums"]["status_convenio"] | null
          tipo?: Database["public"]["Enums"]["tipo_convenio"]
          updated_at?: string | null
          valor_contrapartida?: number | null
          valor_repasse?: number
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "convenios_secretaria_id_fkey"
            columns: ["secretaria_id"]
            isOneToOne: false
            referencedRelation: "secretarias"
            referencedColumns: ["id"]
          },
        ]
      }
      convenios_parcelas: {
        Row: {
          comprovante: string | null
          convenio_id: string | null
          created_at: string | null
          data_prevista: string
          data_recebimento: string | null
          id: string
          numero_parcela: number
          status: string | null
          valor: number
        }
        Insert: {
          comprovante?: string | null
          convenio_id?: string | null
          created_at?: string | null
          data_prevista: string
          data_recebimento?: string | null
          id?: string
          numero_parcela: number
          status?: string | null
          valor: number
        }
        Update: {
          comprovante?: string | null
          convenio_id?: string | null
          created_at?: string | null
          data_prevista?: string
          data_recebimento?: string | null
          id?: string
          numero_parcela?: number
          status?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "convenios_parcelas_convenio_id_fkey"
            columns: ["convenio_id"]
            isOneToOne: false
            referencedRelation: "convenios"
            referencedColumns: ["id"]
          },
        ]
      }
      convenios_prestacao_contas: {
        Row: {
          convenio_id: string | null
          created_at: string | null
          data_prestacao: string
          documentos: Json | null
          id: string
          parecer: string | null
          status: string | null
          tipo: string | null
          valor_prestado: number
        }
        Insert: {
          convenio_id?: string | null
          created_at?: string | null
          data_prestacao: string
          documentos?: Json | null
          id?: string
          parecer?: string | null
          status?: string | null
          tipo?: string | null
          valor_prestado: number
        }
        Update: {
          convenio_id?: string | null
          created_at?: string | null
          data_prestacao?: string
          documentos?: Json | null
          id?: string
          parecer?: string | null
          status?: string | null
          tipo?: string | null
          valor_prestado?: number
        }
        Relationships: [
          {
            foreignKeyName: "convenios_prestacao_contas_convenio_id_fkey"
            columns: ["convenio_id"]
            isOneToOne: false
            referencedRelation: "convenios"
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
      dados_bancarios: {
        Row: {
          agencia: string
          agencia_digito: string | null
          ativo: boolean | null
          banco_codigo: string
          banco_nome: string
          conta: string
          conta_digito: string | null
          conta_principal: boolean | null
          created_at: string
          data_fim: string | null
          data_inicio: string | null
          id: string
          pix_chave: string | null
          pix_tipo: string | null
          servidor_id: string
          tipo_conta: string
          updated_at: string
        }
        Insert: {
          agencia: string
          agencia_digito?: string | null
          ativo?: boolean | null
          banco_codigo: string
          banco_nome: string
          conta: string
          conta_digito?: string | null
          conta_principal?: boolean | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          pix_chave?: string | null
          pix_tipo?: string | null
          servidor_id: string
          tipo_conta: string
          updated_at?: string
        }
        Update: {
          agencia?: string
          agencia_digito?: string | null
          ativo?: boolean | null
          banco_codigo?: string
          banco_nome?: string
          conta?: string
          conta_digito?: string | null
          conta_principal?: boolean | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          pix_chave?: string | null
          pix_tipo?: string | null
          servidor_id?: string
          tipo_conta?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dados_bancarios_servidor_id_fkey"
            columns: ["servidor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      dependentes: {
        Row: {
          ativo: boolean | null
          certidao_cartorio: string | null
          certidao_folha: string | null
          certidao_livro: string | null
          certidao_numero: string | null
          certidao_tipo: string | null
          cpf: string | null
          created_at: string
          data_fim_dependencia: string | null
          data_inicio_dependencia: string | null
          data_nascimento: string
          descricao_deficiencia: string | null
          id: string
          ir_dependente: boolean | null
          nome: string
          observacoes: string | null
          parentesco: string
          plano_saude_dependente: boolean | null
          possui_deficiencia: boolean | null
          salario_familia_dependente: boolean | null
          servidor_id: string
          sexo: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          certidao_cartorio?: string | null
          certidao_folha?: string | null
          certidao_livro?: string | null
          certidao_numero?: string | null
          certidao_tipo?: string | null
          cpf?: string | null
          created_at?: string
          data_fim_dependencia?: string | null
          data_inicio_dependencia?: string | null
          data_nascimento: string
          descricao_deficiencia?: string | null
          id?: string
          ir_dependente?: boolean | null
          nome: string
          observacoes?: string | null
          parentesco: string
          plano_saude_dependente?: boolean | null
          possui_deficiencia?: boolean | null
          salario_familia_dependente?: boolean | null
          servidor_id: string
          sexo?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          certidao_cartorio?: string | null
          certidao_folha?: string | null
          certidao_livro?: string | null
          certidao_numero?: string | null
          certidao_tipo?: string | null
          cpf?: string | null
          created_at?: string
          data_fim_dependencia?: string | null
          data_inicio_dependencia?: string | null
          data_nascimento?: string
          descricao_deficiencia?: string | null
          id?: string
          ir_dependente?: boolean | null
          nome?: string
          observacoes?: string | null
          parentesco?: string
          plano_saude_dependente?: boolean | null
          possui_deficiencia?: boolean | null
          salario_familia_dependente?: boolean | null
          servidor_id?: string
          sexo?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dependentes_servidor_id_fkey"
            columns: ["servidor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      dotacoes_orcamentarias: {
        Row: {
          acao_id: string | null
          codigo_reduzido: string | null
          created_at: string | null
          fonte_recursos_id: string | null
          funcao_subfuncao_id: string | null
          id: string
          loa_id: string | null
          natureza_despesa_id: string | null
          programa_id: string | null
          secretaria_id: string | null
          unidade_id: string | null
          updated_at: string | null
          valor_anulado: number | null
          valor_disponivel: number | null
          valor_empenhado: number | null
          valor_inicial: number | null
          valor_liquidado: number | null
          valor_pago: number | null
          valor_suplementado: number | null
        }
        Insert: {
          acao_id?: string | null
          codigo_reduzido?: string | null
          created_at?: string | null
          fonte_recursos_id?: string | null
          funcao_subfuncao_id?: string | null
          id?: string
          loa_id?: string | null
          natureza_despesa_id?: string | null
          programa_id?: string | null
          secretaria_id?: string | null
          unidade_id?: string | null
          updated_at?: string | null
          valor_anulado?: number | null
          valor_disponivel?: number | null
          valor_empenhado?: number | null
          valor_inicial?: number | null
          valor_liquidado?: number | null
          valor_pago?: number | null
          valor_suplementado?: number | null
        }
        Update: {
          acao_id?: string | null
          codigo_reduzido?: string | null
          created_at?: string | null
          fonte_recursos_id?: string | null
          funcao_subfuncao_id?: string | null
          id?: string
          loa_id?: string | null
          natureza_despesa_id?: string | null
          programa_id?: string | null
          secretaria_id?: string | null
          unidade_id?: string | null
          updated_at?: string | null
          valor_anulado?: number | null
          valor_disponivel?: number | null
          valor_empenhado?: number | null
          valor_inicial?: number | null
          valor_liquidado?: number | null
          valor_pago?: number | null
          valor_suplementado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dotacoes_orcamentarias_acao_id_fkey"
            columns: ["acao_id"]
            isOneToOne: false
            referencedRelation: "ppa_acoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dotacoes_orcamentarias_fonte_recursos_id_fkey"
            columns: ["fonte_recursos_id"]
            isOneToOne: false
            referencedRelation: "fonte_recursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dotacoes_orcamentarias_funcao_subfuncao_id_fkey"
            columns: ["funcao_subfuncao_id"]
            isOneToOne: false
            referencedRelation: "funcao_subfuncao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dotacoes_orcamentarias_loa_id_fkey"
            columns: ["loa_id"]
            isOneToOne: false
            referencedRelation: "loa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dotacoes_orcamentarias_natureza_despesa_id_fkey"
            columns: ["natureza_despesa_id"]
            isOneToOne: false
            referencedRelation: "natureza_despesa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dotacoes_orcamentarias_programa_id_fkey"
            columns: ["programa_id"]
            isOneToOne: false
            referencedRelation: "ppa_programas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dotacoes_orcamentarias_secretaria_id_fkey"
            columns: ["secretaria_id"]
            isOneToOne: false
            referencedRelation: "secretarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dotacoes_orcamentarias_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades_administrativas"
            referencedColumns: ["id"]
          },
        ]
      }
      empenhos: {
        Row: {
          contrato_id: string | null
          created_at: string | null
          created_by: string | null
          credor_id: string | null
          data_empenho: string
          descricao: string
          dotacao_id: string | null
          exercicio_id: string | null
          id: string
          numero: string
          processo_licitatorio: string | null
          saldo_empenho: number | null
          status: Database["public"]["Enums"]["status_empenho"] | null
          tipo: Database["public"]["Enums"]["tipo_empenho"]
          updated_at: string | null
          valor_anulado: number | null
          valor_empenhado: number
          valor_liquidado: number | null
          valor_pago: number | null
        }
        Insert: {
          contrato_id?: string | null
          created_at?: string | null
          created_by?: string | null
          credor_id?: string | null
          data_empenho: string
          descricao: string
          dotacao_id?: string | null
          exercicio_id?: string | null
          id?: string
          numero: string
          processo_licitatorio?: string | null
          saldo_empenho?: number | null
          status?: Database["public"]["Enums"]["status_empenho"] | null
          tipo?: Database["public"]["Enums"]["tipo_empenho"]
          updated_at?: string | null
          valor_anulado?: number | null
          valor_empenhado: number
          valor_liquidado?: number | null
          valor_pago?: number | null
        }
        Update: {
          contrato_id?: string | null
          created_at?: string | null
          created_by?: string | null
          credor_id?: string | null
          data_empenho?: string
          descricao?: string
          dotacao_id?: string | null
          exercicio_id?: string | null
          id?: string
          numero?: string
          processo_licitatorio?: string | null
          saldo_empenho?: number | null
          status?: Database["public"]["Enums"]["status_empenho"] | null
          tipo?: Database["public"]["Enums"]["tipo_empenho"]
          updated_at?: string | null
          valor_anulado?: number | null
          valor_empenhado?: number
          valor_liquidado?: number | null
          valor_pago?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "empenhos_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "empenhos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "empenhos_credor_id_fkey"
            columns: ["credor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "empenhos_dotacao_id_fkey"
            columns: ["dotacao_id"]
            isOneToOne: false
            referencedRelation: "dotacoes_orcamentarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "empenhos_exercicio_id_fkey"
            columns: ["exercicio_id"]
            isOneToOne: false
            referencedRelation: "exercicios_financeiros"
            referencedColumns: ["id"]
          },
        ]
      }
      empenhos_anulacoes: {
        Row: {
          created_at: string | null
          created_by: string | null
          data_anulacao: string
          empenho_id: string | null
          id: string
          motivo: string | null
          valor_anulado: number
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          data_anulacao: string
          empenho_id?: string | null
          id?: string
          motivo?: string | null
          valor_anulado: number
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          data_anulacao?: string
          empenho_id?: string | null
          id?: string
          motivo?: string | null
          valor_anulado?: number
        }
        Relationships: [
          {
            foreignKeyName: "empenhos_anulacoes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "empenhos_anulacoes_empenho_id_fkey"
            columns: ["empenho_id"]
            isOneToOne: false
            referencedRelation: "empenhos"
            referencedColumns: ["id"]
          },
        ]
      }
      entidade_versoes: {
        Row: {
          aprovado_em: string | null
          aprovado_por: string | null
          created_at: string
          dados: Json
          entidade: string
          entidade_id: string
          hash_anterior: string | null
          hash_dados: string
          id: string
          motivo: string | null
          revertido: boolean | null
          revertido_para_versao: number | null
          user_id: string | null
          versao: number
        }
        Insert: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          created_at?: string
          dados: Json
          entidade: string
          entidade_id: string
          hash_anterior?: string | null
          hash_dados: string
          id?: string
          motivo?: string | null
          revertido?: boolean | null
          revertido_para_versao?: number | null
          user_id?: string | null
          versao: number
        }
        Update: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          created_at?: string
          dados?: Json
          entidade?: string
          entidade_id?: string
          hash_anterior?: string | null
          hash_dados?: string
          id?: string
          motivo?: string | null
          revertido?: boolean | null
          revertido_para_versao?: number | null
          user_id?: string | null
          versao?: number
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
      eventos_folha: {
        Row: {
          aplica_clt: boolean | null
          aplica_estatutario: boolean | null
          aplica_temporario: boolean | null
          ativo: boolean | null
          codigo: string
          created_at: string | null
          descricao: string | null
          formula: string | null
          id: string
          incide_base_13: boolean | null
          incide_base_ferias: boolean | null
          incide_fgts: boolean | null
          incide_inss: boolean | null
          incide_irrf: boolean | null
          natureza: string
          nome: string
          obrigatorio: boolean | null
          percentual: number | null
          permite_edicao_valor: boolean | null
          referencia_horas: boolean | null
          tipo: Database["public"]["Enums"]["tipo_evento_folha"]
          updated_at: string | null
          valor_fixo: number | null
        }
        Insert: {
          aplica_clt?: boolean | null
          aplica_estatutario?: boolean | null
          aplica_temporario?: boolean | null
          ativo?: boolean | null
          codigo: string
          created_at?: string | null
          descricao?: string | null
          formula?: string | null
          id?: string
          incide_base_13?: boolean | null
          incide_base_ferias?: boolean | null
          incide_fgts?: boolean | null
          incide_inss?: boolean | null
          incide_irrf?: boolean | null
          natureza: string
          nome: string
          obrigatorio?: boolean | null
          percentual?: number | null
          permite_edicao_valor?: boolean | null
          referencia_horas?: boolean | null
          tipo: Database["public"]["Enums"]["tipo_evento_folha"]
          updated_at?: string | null
          valor_fixo?: number | null
        }
        Update: {
          aplica_clt?: boolean | null
          aplica_estatutario?: boolean | null
          aplica_temporario?: boolean | null
          ativo?: boolean | null
          codigo?: string
          created_at?: string | null
          descricao?: string | null
          formula?: string | null
          id?: string
          incide_base_13?: boolean | null
          incide_base_ferias?: boolean | null
          incide_fgts?: boolean | null
          incide_inss?: boolean | null
          incide_irrf?: boolean | null
          natureza?: string
          nome?: string
          obrigatorio?: boolean | null
          percentual?: number | null
          permite_edicao_valor?: boolean | null
          referencia_horas?: boolean | null
          tipo?: Database["public"]["Enums"]["tipo_evento_folha"]
          updated_at?: string | null
          valor_fixo?: number | null
        }
        Relationships: []
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
      ferias_periodos_aquisitivos: {
        Row: {
          created_at: string | null
          data_vencimento: string | null
          dias_direito: number | null
          dias_saldo: number | null
          dias_usufruidos: number | null
          dias_vendidos: number | null
          fim: string
          id: string
          inicio: string
          observacoes: string | null
          servidor_id: string
          updated_at: string | null
          vencido: boolean | null
        }
        Insert: {
          created_at?: string | null
          data_vencimento?: string | null
          dias_direito?: number | null
          dias_saldo?: number | null
          dias_usufruidos?: number | null
          dias_vendidos?: number | null
          fim: string
          id?: string
          inicio: string
          observacoes?: string | null
          servidor_id: string
          updated_at?: string | null
          vencido?: boolean | null
        }
        Update: {
          created_at?: string | null
          data_vencimento?: string | null
          dias_direito?: number | null
          dias_saldo?: number | null
          dias_usufruidos?: number | null
          dias_vendidos?: number | null
          fim?: string
          id?: string
          inicio?: string
          observacoes?: string | null
          servidor_id?: string
          updated_at?: string | null
          vencido?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "ferias_periodos_aquisitivos_servidor_id_fkey"
            columns: ["servidor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ferias_solicitacoes: {
        Row: {
          abono_pecuniario: boolean | null
          antecipacao_13: boolean | null
          aprovado_chefia_por: string | null
          aprovado_rh_por: string | null
          created_at: string | null
          data_aprovacao_chefia: string | null
          data_aprovacao_rh: string | null
          data_fim: string
          data_inicio: string
          dias_abono: number | null
          dias_solicitados: number
          id: string
          motivo_rejeicao: string | null
          observacoes: string | null
          periodo_aquisitivo_id: string | null
          servidor_id: string
          status: Database["public"]["Enums"]["status_solicitacao"] | null
          updated_at: string | null
          valor_13_antecipado: number | null
          valor_abono: number | null
          valor_ferias: number | null
          valor_terco_constitucional: number | null
          valor_total: number | null
        }
        Insert: {
          abono_pecuniario?: boolean | null
          antecipacao_13?: boolean | null
          aprovado_chefia_por?: string | null
          aprovado_rh_por?: string | null
          created_at?: string | null
          data_aprovacao_chefia?: string | null
          data_aprovacao_rh?: string | null
          data_fim: string
          data_inicio: string
          dias_abono?: number | null
          dias_solicitados: number
          id?: string
          motivo_rejeicao?: string | null
          observacoes?: string | null
          periodo_aquisitivo_id?: string | null
          servidor_id: string
          status?: Database["public"]["Enums"]["status_solicitacao"] | null
          updated_at?: string | null
          valor_13_antecipado?: number | null
          valor_abono?: number | null
          valor_ferias?: number | null
          valor_terco_constitucional?: number | null
          valor_total?: number | null
        }
        Update: {
          abono_pecuniario?: boolean | null
          antecipacao_13?: boolean | null
          aprovado_chefia_por?: string | null
          aprovado_rh_por?: string | null
          created_at?: string | null
          data_aprovacao_chefia?: string | null
          data_aprovacao_rh?: string | null
          data_fim?: string
          data_inicio?: string
          dias_abono?: number | null
          dias_solicitados?: number
          id?: string
          motivo_rejeicao?: string | null
          observacoes?: string | null
          periodo_aquisitivo_id?: string | null
          servidor_id?: string
          status?: Database["public"]["Enums"]["status_solicitacao"] | null
          updated_at?: string | null
          valor_13_antecipado?: number | null
          valor_abono?: number | null
          valor_ferias?: number | null
          valor_terco_constitucional?: number | null
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ferias_solicitacoes_periodo_aquisitivo_id_fkey"
            columns: ["periodo_aquisitivo_id"]
            isOneToOne: false
            referencedRelation: "ferias_periodos_aquisitivos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ferias_solicitacoes_servidor_id_fkey"
            columns: ["servidor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      folha_itens: {
        Row: {
          codigo_evento: string
          created_at: string | null
          evento_id: string | null
          folha_servidor_id: string
          id: string
          incide_fgts: boolean | null
          incide_inss: boolean | null
          incide_irrf: boolean | null
          justificativa: string | null
          lancamento_manual: boolean | null
          natureza: string
          nome_evento: string
          referencia: number | null
          valor: number
        }
        Insert: {
          codigo_evento: string
          created_at?: string | null
          evento_id?: string | null
          folha_servidor_id: string
          id?: string
          incide_fgts?: boolean | null
          incide_inss?: boolean | null
          incide_irrf?: boolean | null
          justificativa?: string | null
          lancamento_manual?: boolean | null
          natureza: string
          nome_evento: string
          referencia?: number | null
          valor: number
        }
        Update: {
          codigo_evento?: string
          created_at?: string | null
          evento_id?: string | null
          folha_servidor_id?: string
          id?: string
          incide_fgts?: boolean | null
          incide_inss?: boolean | null
          incide_irrf?: boolean | null
          justificativa?: string | null
          lancamento_manual?: boolean | null
          natureza?: string
          nome_evento?: string
          referencia?: number | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "folha_itens_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos_folha"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "folha_itens_folha_servidor_id_fkey"
            columns: ["folha_servidor_id"]
            isOneToOne: false
            referencedRelation: "folha_servidor"
            referencedColumns: ["id"]
          },
        ]
      }
      folha_pagamento: {
        Row: {
          calculado_por: string | null
          competencia: string
          conferido_por: string | null
          created_at: string | null
          data_abertura: string | null
          data_calculo: string | null
          data_conferencia: string | null
          data_fechamento: string | null
          dotacao_id: string | null
          empenho_id: string | null
          fechado_por: string | null
          id: string
          observacoes: string | null
          quantidade_servidores: number | null
          secretaria_id: string | null
          status: Database["public"]["Enums"]["status_folha"] | null
          total_bruto: number | null
          total_descontos: number | null
          total_fgts: number | null
          total_inss_patronal: number | null
          total_liquido: number | null
          updated_at: string | null
        }
        Insert: {
          calculado_por?: string | null
          competencia: string
          conferido_por?: string | null
          created_at?: string | null
          data_abertura?: string | null
          data_calculo?: string | null
          data_conferencia?: string | null
          data_fechamento?: string | null
          dotacao_id?: string | null
          empenho_id?: string | null
          fechado_por?: string | null
          id?: string
          observacoes?: string | null
          quantidade_servidores?: number | null
          secretaria_id?: string | null
          status?: Database["public"]["Enums"]["status_folha"] | null
          total_bruto?: number | null
          total_descontos?: number | null
          total_fgts?: number | null
          total_inss_patronal?: number | null
          total_liquido?: number | null
          updated_at?: string | null
        }
        Update: {
          calculado_por?: string | null
          competencia?: string
          conferido_por?: string | null
          created_at?: string | null
          data_abertura?: string | null
          data_calculo?: string | null
          data_conferencia?: string | null
          data_fechamento?: string | null
          dotacao_id?: string | null
          empenho_id?: string | null
          fechado_por?: string | null
          id?: string
          observacoes?: string | null
          quantidade_servidores?: number | null
          secretaria_id?: string | null
          status?: Database["public"]["Enums"]["status_folha"] | null
          total_bruto?: number | null
          total_descontos?: number | null
          total_fgts?: number | null
          total_inss_patronal?: number | null
          total_liquido?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "folha_pagamento_dotacao_id_fkey"
            columns: ["dotacao_id"]
            isOneToOne: false
            referencedRelation: "dotacoes_orcamentarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "folha_pagamento_empenho_id_fkey"
            columns: ["empenho_id"]
            isOneToOne: false
            referencedRelation: "empenhos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "folha_pagamento_secretaria_id_fkey"
            columns: ["secretaria_id"]
            isOneToOne: false
            referencedRelation: "secretarias"
            referencedColumns: ["id"]
          },
        ]
      }
      folha_reprocessamentos: {
        Row: {
          created_at: string | null
          estado_anterior: Json | null
          estado_posterior: Json | null
          folha_id: string
          id: string
          motivo: string
          reprocessado_por: string | null
        }
        Insert: {
          created_at?: string | null
          estado_anterior?: Json | null
          estado_posterior?: Json | null
          folha_id: string
          id?: string
          motivo: string
          reprocessado_por?: string | null
        }
        Update: {
          created_at?: string | null
          estado_anterior?: Json | null
          estado_posterior?: Json | null
          folha_id?: string
          id?: string
          motivo?: string
          reprocessado_por?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "folha_reprocessamentos_folha_id_fkey"
            columns: ["folha_id"]
            isOneToOne: false
            referencedRelation: "folha_pagamento"
            referencedColumns: ["id"]
          },
        ]
      }
      folha_servidor: {
        Row: {
          agencia: string | null
          banco_codigo: string | null
          banco_nome: string | null
          base_fgts: number | null
          base_inss: number | null
          base_irrf: number | null
          cargo_nome: string | null
          conta: string | null
          created_at: string | null
          folha_id: string
          funcao_nome: string | null
          id: string
          jornada_mensal: number | null
          observacoes: string | null
          processado: boolean | null
          salario_base: number
          salario_liquido: number | null
          servidor_id: string
          total_descontos: number | null
          total_proventos: number | null
          updated_at: string | null
          valor_fgts: number | null
          valor_inss: number | null
          valor_irrf: number | null
          vinculo_id: string | null
        }
        Insert: {
          agencia?: string | null
          banco_codigo?: string | null
          banco_nome?: string | null
          base_fgts?: number | null
          base_inss?: number | null
          base_irrf?: number | null
          cargo_nome?: string | null
          conta?: string | null
          created_at?: string | null
          folha_id: string
          funcao_nome?: string | null
          id?: string
          jornada_mensal?: number | null
          observacoes?: string | null
          processado?: boolean | null
          salario_base: number
          salario_liquido?: number | null
          servidor_id: string
          total_descontos?: number | null
          total_proventos?: number | null
          updated_at?: string | null
          valor_fgts?: number | null
          valor_inss?: number | null
          valor_irrf?: number | null
          vinculo_id?: string | null
        }
        Update: {
          agencia?: string | null
          banco_codigo?: string | null
          banco_nome?: string | null
          base_fgts?: number | null
          base_inss?: number | null
          base_irrf?: number | null
          cargo_nome?: string | null
          conta?: string | null
          created_at?: string | null
          folha_id?: string
          funcao_nome?: string | null
          id?: string
          jornada_mensal?: number | null
          observacoes?: string | null
          processado?: boolean | null
          salario_base?: number
          salario_liquido?: number | null
          servidor_id?: string
          total_descontos?: number | null
          total_proventos?: number | null
          updated_at?: string | null
          valor_fgts?: number | null
          valor_inss?: number | null
          valor_irrf?: number | null
          vinculo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "folha_servidor_folha_id_fkey"
            columns: ["folha_id"]
            isOneToOne: false
            referencedRelation: "folha_pagamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "folha_servidor_servidor_id_fkey"
            columns: ["servidor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "folha_servidor_vinculo_id_fkey"
            columns: ["vinculo_id"]
            isOneToOne: false
            referencedRelation: "vinculos_funcionais"
            referencedColumns: ["id"]
          },
        ]
      }
      fonte_recursos: {
        Row: {
          ativo: boolean | null
          codigo: string
          created_at: string | null
          descricao: string
          id: string
          tipo: string | null
          vinculacao: string | null
        }
        Insert: {
          ativo?: boolean | null
          codigo: string
          created_at?: string | null
          descricao: string
          id?: string
          tipo?: string | null
          vinculacao?: string | null
        }
        Update: {
          ativo?: boolean | null
          codigo?: string
          created_at?: string | null
          descricao?: string
          id?: string
          tipo?: string | null
          vinculacao?: string | null
        }
        Relationships: []
      }
      fornecedores: {
        Row: {
          agencia: string | null
          ativo: boolean | null
          banco_codigo: string | null
          banco_nome: string | null
          cep: string | null
          cidade: string | null
          conta: string | null
          cpf_cnpj: string
          created_at: string | null
          email: string | null
          endereco: string | null
          id: string
          inscricao_estadual: string | null
          inscricao_municipal: string | null
          nome_fantasia: string | null
          observacoes: string | null
          pix_chave: string | null
          pix_tipo: string | null
          razao_social: string
          telefone: string | null
          tipo_conta: string | null
          tipo_pessoa: string
          uf: string | null
          updated_at: string | null
        }
        Insert: {
          agencia?: string | null
          ativo?: boolean | null
          banco_codigo?: string | null
          banco_nome?: string | null
          cep?: string | null
          cidade?: string | null
          conta?: string | null
          cpf_cnpj: string
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          inscricao_estadual?: string | null
          inscricao_municipal?: string | null
          nome_fantasia?: string | null
          observacoes?: string | null
          pix_chave?: string | null
          pix_tipo?: string | null
          razao_social: string
          telefone?: string | null
          tipo_conta?: string | null
          tipo_pessoa: string
          uf?: string | null
          updated_at?: string | null
        }
        Update: {
          agencia?: string | null
          ativo?: boolean | null
          banco_codigo?: string | null
          banco_nome?: string | null
          cep?: string | null
          cidade?: string | null
          conta?: string | null
          cpf_cnpj?: string
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          inscricao_estadual?: string | null
          inscricao_municipal?: string | null
          nome_fantasia?: string | null
          observacoes?: string | null
          pix_chave?: string | null
          pix_tipo?: string | null
          razao_social?: string
          telefone?: string | null
          tipo_conta?: string | null
          tipo_pessoa?: string
          uf?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      funcao_subfuncao: {
        Row: {
          ativo: boolean | null
          codigo_funcao: string
          codigo_subfuncao: string | null
          created_at: string | null
          id: string
          nome_funcao: string
          nome_subfuncao: string | null
        }
        Insert: {
          ativo?: boolean | null
          codigo_funcao: string
          codigo_subfuncao?: string | null
          created_at?: string | null
          id?: string
          nome_funcao: string
          nome_subfuncao?: string | null
        }
        Update: {
          ativo?: boolean | null
          codigo_funcao?: string
          codigo_subfuncao?: string | null
          created_at?: string | null
          id?: string
          nome_funcao?: string
          nome_subfuncao?: string | null
        }
        Relationships: []
      }
      funcoes_administrativas: {
        Row: {
          atribuicoes: string | null
          cargo_vinculado_id: string | null
          codigo: string
          competencias: Json | null
          created_at: string
          descricao: string | null
          exclusivo_efetivo: boolean | null
          funcao_superior_id: string | null
          id: string
          nivel_hierarquico: number | null
          nome: string
          percentual_gratificacao: number | null
          requisitos_ocupacao: string | null
          secretaria_id: string | null
          status: string | null
          tempo_minimo_servico_meses: number | null
          tipo: Database["public"]["Enums"]["tipo_funcao"]
          updated_at: string
          valor_gratificacao: number | null
        }
        Insert: {
          atribuicoes?: string | null
          cargo_vinculado_id?: string | null
          codigo: string
          competencias?: Json | null
          created_at?: string
          descricao?: string | null
          exclusivo_efetivo?: boolean | null
          funcao_superior_id?: string | null
          id?: string
          nivel_hierarquico?: number | null
          nome: string
          percentual_gratificacao?: number | null
          requisitos_ocupacao?: string | null
          secretaria_id?: string | null
          status?: string | null
          tempo_minimo_servico_meses?: number | null
          tipo: Database["public"]["Enums"]["tipo_funcao"]
          updated_at?: string
          valor_gratificacao?: number | null
        }
        Update: {
          atribuicoes?: string | null
          cargo_vinculado_id?: string | null
          codigo?: string
          competencias?: Json | null
          created_at?: string
          descricao?: string | null
          exclusivo_efetivo?: boolean | null
          funcao_superior_id?: string | null
          id?: string
          nivel_hierarquico?: number | null
          nome?: string
          percentual_gratificacao?: number | null
          requisitos_ocupacao?: string | null
          secretaria_id?: string | null
          status?: string | null
          tempo_minimo_servico_meses?: number | null
          tipo?: Database["public"]["Enums"]["tipo_funcao"]
          updated_at?: string
          valor_gratificacao?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "funcoes_administrativas_cargo_vinculado_id_fkey"
            columns: ["cargo_vinculado_id"]
            isOneToOne: false
            referencedRelation: "cargos_publicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funcoes_administrativas_funcao_superior_id_fkey"
            columns: ["funcao_superior_id"]
            isOneToOne: false
            referencedRelation: "funcoes_administrativas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funcoes_administrativas_secretaria_id_fkey"
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
      historico_lotacoes: {
        Row: {
          created_at: string
          created_by: string | null
          data_fim: string | null
          data_inicio: string
          funcao_id: string | null
          id: string
          motivo: string | null
          observacoes: string | null
          portaria_data: string | null
          portaria_numero: string | null
          secretaria_id: string | null
          tipo_movimentacao: string
          unidade_id: string | null
          vinculo_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_fim?: string | null
          data_inicio: string
          funcao_id?: string | null
          id?: string
          motivo?: string | null
          observacoes?: string | null
          portaria_data?: string | null
          portaria_numero?: string | null
          secretaria_id?: string | null
          tipo_movimentacao: string
          unidade_id?: string | null
          vinculo_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_fim?: string | null
          data_inicio?: string
          funcao_id?: string | null
          id?: string
          motivo?: string | null
          observacoes?: string | null
          portaria_data?: string | null
          portaria_numero?: string | null
          secretaria_id?: string | null
          tipo_movimentacao?: string
          unidade_id?: string | null
          vinculo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "historico_lotacoes_funcao_id_fkey"
            columns: ["funcao_id"]
            isOneToOne: false
            referencedRelation: "funcoes_administrativas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historico_lotacoes_secretaria_id_fkey"
            columns: ["secretaria_id"]
            isOneToOne: false
            referencedRelation: "secretarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historico_lotacoes_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades_administrativas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historico_lotacoes_vinculo_id_fkey"
            columns: ["vinculo_id"]
            isOneToOne: false
            referencedRelation: "vinculos_funcionais"
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
      justificativas_ponto: {
        Row: {
          aprovado_por: string | null
          created_at: string | null
          data: string
          data_aprovacao: string | null
          documento_url: string | null
          id: string
          motivo: string
          motivo_rejeicao: string | null
          ponto_id: string | null
          servidor_id: string
          status: Database["public"]["Enums"]["status_justificativa"] | null
          tipo: string
          updated_at: string | null
        }
        Insert: {
          aprovado_por?: string | null
          created_at?: string | null
          data: string
          data_aprovacao?: string | null
          documento_url?: string | null
          id?: string
          motivo: string
          motivo_rejeicao?: string | null
          ponto_id?: string | null
          servidor_id: string
          status?: Database["public"]["Enums"]["status_justificativa"] | null
          tipo: string
          updated_at?: string | null
        }
        Update: {
          aprovado_por?: string | null
          created_at?: string | null
          data?: string
          data_aprovacao?: string | null
          documento_url?: string | null
          id?: string
          motivo?: string
          motivo_rejeicao?: string | null
          ponto_id?: string | null
          servidor_id?: string
          status?: Database["public"]["Enums"]["status_justificativa"] | null
          tipo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "justificativas_ponto_ponto_id_fkey"
            columns: ["ponto_id"]
            isOneToOne: false
            referencedRelation: "ponto_servidor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "justificativas_ponto_servidor_id_fkey"
            columns: ["servidor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ldo: {
        Row: {
          created_at: string | null
          exercicio: number
          id: string
          lei_data: string | null
          lei_numero: string | null
          limite_despesa_pessoal: number | null
          limite_divida: number | null
          meta_resultado_nominal: number | null
          meta_resultado_primario: number | null
          municipio_id: string | null
          ppa_id: string | null
          prioridades: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          exercicio: number
          id?: string
          lei_data?: string | null
          lei_numero?: string | null
          limite_despesa_pessoal?: number | null
          limite_divida?: number | null
          meta_resultado_nominal?: number | null
          meta_resultado_primario?: number | null
          municipio_id?: string | null
          ppa_id?: string | null
          prioridades?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          exercicio?: number
          id?: string
          lei_data?: string | null
          lei_numero?: string | null
          limite_despesa_pessoal?: number | null
          limite_divida?: number | null
          meta_resultado_nominal?: number | null
          meta_resultado_primario?: number | null
          municipio_id?: string | null
          ppa_id?: string | null
          prioridades?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ldo_municipio_id_fkey"
            columns: ["municipio_id"]
            isOneToOne: false
            referencedRelation: "municipios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ldo_ppa_id_fkey"
            columns: ["ppa_id"]
            isOneToOne: false
            referencedRelation: "ppa"
            referencedColumns: ["id"]
          },
        ]
      }
      ldo_metas_fiscais: {
        Row: {
          created_at: string | null
          descricao: string | null
          id: string
          ldo_id: string | null
          tipo: string
          valor_previsto: number | null
          valor_realizado: number | null
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          ldo_id?: string | null
          tipo: string
          valor_previsto?: number | null
          valor_realizado?: number | null
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          ldo_id?: string | null
          tipo?: string
          valor_previsto?: number | null
          valor_realizado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ldo_metas_fiscais_ldo_id_fkey"
            columns: ["ldo_id"]
            isOneToOne: false
            referencedRelation: "ldo"
            referencedColumns: ["id"]
          },
        ]
      }
      licencas: {
        Row: {
          aprovado_por: string | null
          atestado_pericia: boolean | null
          cid: string | null
          created_at: string | null
          data_aprovacao: string | null
          data_fim: string
          data_inicio: string
          dias_totais: number
          documento_url: string | null
          id: string
          motivo_rejeicao: string | null
          observacoes: string | null
          percentual_remuneracao: number | null
          remunerada: boolean | null
          servidor_id: string
          status: Database["public"]["Enums"]["status_solicitacao"] | null
          tipo: Database["public"]["Enums"]["tipo_licenca"]
          updated_at: string | null
        }
        Insert: {
          aprovado_por?: string | null
          atestado_pericia?: boolean | null
          cid?: string | null
          created_at?: string | null
          data_aprovacao?: string | null
          data_fim: string
          data_inicio: string
          dias_totais: number
          documento_url?: string | null
          id?: string
          motivo_rejeicao?: string | null
          observacoes?: string | null
          percentual_remuneracao?: number | null
          remunerada?: boolean | null
          servidor_id: string
          status?: Database["public"]["Enums"]["status_solicitacao"] | null
          tipo: Database["public"]["Enums"]["tipo_licenca"]
          updated_at?: string | null
        }
        Update: {
          aprovado_por?: string | null
          atestado_pericia?: boolean | null
          cid?: string | null
          created_at?: string | null
          data_aprovacao?: string | null
          data_fim?: string
          data_inicio?: string
          dias_totais?: number
          documento_url?: string | null
          id?: string
          motivo_rejeicao?: string | null
          observacoes?: string | null
          percentual_remuneracao?: number | null
          remunerada?: boolean | null
          servidor_id?: string
          status?: Database["public"]["Enums"]["status_solicitacao"] | null
          tipo?: Database["public"]["Enums"]["tipo_licenca"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "licencas_servidor_id_fkey"
            columns: ["servidor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      liquidacoes: {
        Row: {
          atesto: string | null
          created_at: string | null
          created_by: string | null
          data_atesto: string | null
          data_documento: string | null
          data_liquidacao: string
          documento_fiscal: string | null
          empenho_id: string | null
          id: string
          numero: string
          responsavel_atesto: string | null
          status: string | null
          tipo_documento: string | null
          valor_liquidado: number
        }
        Insert: {
          atesto?: string | null
          created_at?: string | null
          created_by?: string | null
          data_atesto?: string | null
          data_documento?: string | null
          data_liquidacao: string
          documento_fiscal?: string | null
          empenho_id?: string | null
          id?: string
          numero: string
          responsavel_atesto?: string | null
          status?: string | null
          tipo_documento?: string | null
          valor_liquidado: number
        }
        Update: {
          atesto?: string | null
          created_at?: string | null
          created_by?: string | null
          data_atesto?: string | null
          data_documento?: string | null
          data_liquidacao?: string
          documento_fiscal?: string | null
          empenho_id?: string | null
          id?: string
          numero?: string
          responsavel_atesto?: string | null
          status?: string | null
          tipo_documento?: string | null
          valor_liquidado?: number
        }
        Relationships: [
          {
            foreignKeyName: "liquidacoes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "liquidacoes_empenho_id_fkey"
            columns: ["empenho_id"]
            isOneToOne: false
            referencedRelation: "empenhos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "liquidacoes_responsavel_atesto_fkey"
            columns: ["responsavel_atesto"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      loa: {
        Row: {
          created_at: string | null
          exercicio_id: string | null
          id: string
          ldo_id: string | null
          lei_data: string | null
          lei_numero: string | null
          municipio_id: string | null
          status: string | null
          updated_at: string | null
          valor_orcamento_fiscal: number | null
          valor_orcamento_investimento: number | null
          valor_orcamento_seguridade: number | null
          valor_total: number | null
        }
        Insert: {
          created_at?: string | null
          exercicio_id?: string | null
          id?: string
          ldo_id?: string | null
          lei_data?: string | null
          lei_numero?: string | null
          municipio_id?: string | null
          status?: string | null
          updated_at?: string | null
          valor_orcamento_fiscal?: number | null
          valor_orcamento_investimento?: number | null
          valor_orcamento_seguridade?: number | null
          valor_total?: number | null
        }
        Update: {
          created_at?: string | null
          exercicio_id?: string | null
          id?: string
          ldo_id?: string | null
          lei_data?: string | null
          lei_numero?: string | null
          municipio_id?: string | null
          status?: string | null
          updated_at?: string | null
          valor_orcamento_fiscal?: number | null
          valor_orcamento_investimento?: number | null
          valor_orcamento_seguridade?: number | null
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "loa_exercicio_id_fkey"
            columns: ["exercicio_id"]
            isOneToOne: false
            referencedRelation: "exercicios_financeiros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loa_ldo_id_fkey"
            columns: ["ldo_id"]
            isOneToOne: false
            referencedRelation: "ldo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loa_municipio_id_fkey"
            columns: ["municipio_id"]
            isOneToOne: false
            referencedRelation: "municipios"
            referencedColumns: ["id"]
          },
        ]
      }
      log_acessos: {
        Row: {
          acao: string
          created_at: string
          dados_anteriores: Json | null
          dados_novos: Json | null
          dispositivo: string | null
          id: string
          ip_address: unknown
          localizacao: Json | null
          modulo: string | null
          motivo_negacao: string | null
          permitido: boolean
          recurso: string | null
          recurso_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          acao: string
          created_at?: string
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          dispositivo?: string | null
          id?: string
          ip_address?: unknown
          localizacao?: Json | null
          modulo?: string | null
          motivo_negacao?: string | null
          permitido: boolean
          recurso?: string | null
          recurso_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          acao?: string
          created_at?: string
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          dispositivo?: string | null
          id?: string
          ip_address?: unknown
          localizacao?: Json | null
          modulo?: string | null
          motivo_negacao?: string | null
          permitido?: boolean
          recurso?: string | null
          recurso_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          attachment: Json | null
          content: string
          conversation_id: string
          created_at: string
          id: string
          read: boolean
          read_at: string | null
          sender_id: string
        }
        Insert: {
          attachment?: Json | null
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          read?: boolean
          read_at?: string | null
          sender_id: string
        }
        Update: {
          attachment?: Json | null
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read?: boolean
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
      modulos_sistema: {
        Row: {
          ativo: boolean | null
          codigo: string
          created_at: string
          descricao: string | null
          icone: string | null
          id: string
          nome: string
          ordem: number | null
          rota_base: string | null
        }
        Insert: {
          ativo?: boolean | null
          codigo: string
          created_at?: string
          descricao?: string | null
          icone?: string | null
          id?: string
          nome: string
          ordem?: number | null
          rota_base?: string | null
        }
        Update: {
          ativo?: boolean | null
          codigo?: string
          created_at?: string
          descricao?: string | null
          icone?: string | null
          id?: string
          nome?: string
          ordem?: number | null
          rota_base?: string | null
        }
        Relationships: []
      }
      movimentacoes_bancarias: {
        Row: {
          conciliado: boolean | null
          conta_id: string | null
          created_at: string | null
          data_conciliacao: string | null
          data_movimento: string
          descricao: string
          documento: string | null
          id: string
          ordem_pagamento_id: string | null
          origem: string | null
          tipo: string | null
          valor: number
        }
        Insert: {
          conciliado?: boolean | null
          conta_id?: string | null
          created_at?: string | null
          data_conciliacao?: string | null
          data_movimento: string
          descricao: string
          documento?: string | null
          id?: string
          ordem_pagamento_id?: string | null
          origem?: string | null
          tipo?: string | null
          valor: number
        }
        Update: {
          conciliado?: boolean | null
          conta_id?: string | null
          created_at?: string | null
          data_conciliacao?: string | null
          data_movimento?: string
          descricao?: string
          documento?: string | null
          id?: string
          ordem_pagamento_id?: string | null
          origem?: string | null
          tipo?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "movimentacoes_bancarias_conta_id_fkey"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "contas_bancarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentacoes_bancarias_ordem_pagamento_id_fkey"
            columns: ["ordem_pagamento_id"]
            isOneToOne: false
            referencedRelation: "ordens_pagamento"
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
      natureza_despesa: {
        Row: {
          ativo: boolean | null
          categoria_economica: string
          codigo: string
          created_at: string | null
          descricao: string
          elemento: string
          grupo: string
          id: string
          modalidade: string
          subelemento: string | null
        }
        Insert: {
          ativo?: boolean | null
          categoria_economica: string
          codigo: string
          created_at?: string | null
          descricao: string
          elemento: string
          grupo: string
          id?: string
          modalidade: string
          subelemento?: string | null
        }
        Update: {
          ativo?: boolean | null
          categoria_economica?: string
          codigo?: string
          created_at?: string | null
          descricao?: string
          elemento?: string
          grupo?: string
          id?: string
          modalidade?: string
          subelemento?: string | null
        }
        Relationships: []
      }
      natureza_receita: {
        Row: {
          ativo: boolean | null
          categoria_economica: string
          codigo: string
          created_at: string | null
          descricao: string
          desdobramento: string | null
          especie: string | null
          id: string
          origem: string
          tipo: string | null
        }
        Insert: {
          ativo?: boolean | null
          categoria_economica: string
          codigo: string
          created_at?: string | null
          descricao: string
          desdobramento?: string | null
          especie?: string | null
          id?: string
          origem: string
          tipo?: string | null
        }
        Update: {
          ativo?: boolean | null
          categoria_economica?: string
          codigo?: string
          created_at?: string | null
          descricao?: string
          desdobramento?: string | null
          especie?: string | null
          id?: string
          origem?: string
          tipo?: string | null
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
      ordens_pagamento: {
        Row: {
          autorizado_por: string | null
          comprovante_pagamento: string | null
          conta_bancaria_id: string | null
          created_at: string | null
          created_by: string | null
          data_autorizacao: string | null
          data_ordem: string
          data_pagamento: string | null
          id: string
          liquidacao_id: string | null
          numero: string
          status: string | null
          valor_bruto: number
          valor_liquido: number
          valor_retencoes: number | null
        }
        Insert: {
          autorizado_por?: string | null
          comprovante_pagamento?: string | null
          conta_bancaria_id?: string | null
          created_at?: string | null
          created_by?: string | null
          data_autorizacao?: string | null
          data_ordem: string
          data_pagamento?: string | null
          id?: string
          liquidacao_id?: string | null
          numero: string
          status?: string | null
          valor_bruto: number
          valor_liquido: number
          valor_retencoes?: number | null
        }
        Update: {
          autorizado_por?: string | null
          comprovante_pagamento?: string | null
          conta_bancaria_id?: string | null
          created_at?: string | null
          created_by?: string | null
          data_autorizacao?: string | null
          data_ordem?: string
          data_pagamento?: string | null
          id?: string
          liquidacao_id?: string | null
          numero?: string
          status?: string | null
          valor_bruto?: number
          valor_liquido?: number
          valor_retencoes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ordens_pagamento_autorizado_por_fkey"
            columns: ["autorizado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_pagamento_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_pagamento_liquidacao_id_fkey"
            columns: ["liquidacao_id"]
            isOneToOne: false
            referencedRelation: "liquidacoes"
            referencedColumns: ["id"]
          },
        ]
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
      papeis_usuario: {
        Row: {
          created_at: string
          data_fim: string | null
          data_inicio: string | null
          delegado_por: string | null
          id: string
          is_active: boolean | null
          modulo_codigo: string | null
          motivo_delegacao: string | null
          papel: Database["public"]["Enums"]["papel_sistemico"]
          secretaria_id: string | null
          unidade_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          delegado_por?: string | null
          id?: string
          is_active?: boolean | null
          modulo_codigo?: string | null
          motivo_delegacao?: string | null
          papel: Database["public"]["Enums"]["papel_sistemico"]
          secretaria_id?: string | null
          unidade_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          delegado_por?: string | null
          id?: string
          is_active?: boolean | null
          modulo_codigo?: string | null
          motivo_delegacao?: string | null
          papel?: Database["public"]["Enums"]["papel_sistemico"]
          secretaria_id?: string | null
          unidade_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "papeis_usuario_secretaria_id_fkey"
            columns: ["secretaria_id"]
            isOneToOne: false
            referencedRelation: "secretarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "papeis_usuario_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades_administrativas"
            referencedColumns: ["id"]
          },
        ]
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
      permissoes_papel: {
        Row: {
          condicao_editar:
            | Database["public"]["Enums"]["condicao_permissao"]
            | null
          condicao_excluir:
            | Database["public"]["Enums"]["condicao_permissao"]
            | null
          condicao_ver: Database["public"]["Enums"]["condicao_permissao"] | null
          created_at: string
          id: string
          modulo_id: string | null
          nivel_hierarquico_minimo: number | null
          papel: Database["public"]["Enums"]["papel_sistemico"]
          pode_aprovar: boolean | null
          pode_criar: boolean | null
          pode_editar: boolean | null
          pode_excluir: boolean | null
          pode_publicar: boolean | null
          pode_ver: boolean | null
          updated_at: string
        }
        Insert: {
          condicao_editar?:
            | Database["public"]["Enums"]["condicao_permissao"]
            | null
          condicao_excluir?:
            | Database["public"]["Enums"]["condicao_permissao"]
            | null
          condicao_ver?:
            | Database["public"]["Enums"]["condicao_permissao"]
            | null
          created_at?: string
          id?: string
          modulo_id?: string | null
          nivel_hierarquico_minimo?: number | null
          papel: Database["public"]["Enums"]["papel_sistemico"]
          pode_aprovar?: boolean | null
          pode_criar?: boolean | null
          pode_editar?: boolean | null
          pode_excluir?: boolean | null
          pode_publicar?: boolean | null
          pode_ver?: boolean | null
          updated_at?: string
        }
        Update: {
          condicao_editar?:
            | Database["public"]["Enums"]["condicao_permissao"]
            | null
          condicao_excluir?:
            | Database["public"]["Enums"]["condicao_permissao"]
            | null
          condicao_ver?:
            | Database["public"]["Enums"]["condicao_permissao"]
            | null
          created_at?: string
          id?: string
          modulo_id?: string | null
          nivel_hierarquico_minimo?: number | null
          papel?: Database["public"]["Enums"]["papel_sistemico"]
          pode_aprovar?: boolean | null
          pode_criar?: boolean | null
          pode_editar?: boolean | null
          pode_excluir?: boolean | null
          pode_publicar?: boolean | null
          pode_ver?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "permissoes_papel_modulo_id_fkey"
            columns: ["modulo_id"]
            isOneToOne: false
            referencedRelation: "modulos_sistema"
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
      ponto_servidor: {
        Row: {
          abono: boolean | null
          created_at: string | null
          data: string
          entrada: string | null
          falta: boolean | null
          horas_extras: number | null
          horas_faltantes: number | null
          horas_noturnas: number | null
          horas_trabalhadas: number | null
          id: string
          jornada_esperada: number | null
          observacoes: string | null
          retorno_intervalo: string | null
          saida: string | null
          saida_intervalo: string | null
          servidor_id: string
          tipo_jornada: Database["public"]["Enums"]["tipo_jornada"] | null
          updated_at: string | null
        }
        Insert: {
          abono?: boolean | null
          created_at?: string | null
          data: string
          entrada?: string | null
          falta?: boolean | null
          horas_extras?: number | null
          horas_faltantes?: number | null
          horas_noturnas?: number | null
          horas_trabalhadas?: number | null
          id?: string
          jornada_esperada?: number | null
          observacoes?: string | null
          retorno_intervalo?: string | null
          saida?: string | null
          saida_intervalo?: string | null
          servidor_id: string
          tipo_jornada?: Database["public"]["Enums"]["tipo_jornada"] | null
          updated_at?: string | null
        }
        Update: {
          abono?: boolean | null
          created_at?: string | null
          data?: string
          entrada?: string | null
          falta?: boolean | null
          horas_extras?: number | null
          horas_faltantes?: number | null
          horas_noturnas?: number | null
          horas_trabalhadas?: number | null
          id?: string
          jornada_esperada?: number | null
          observacoes?: string | null
          retorno_intervalo?: string | null
          saida?: string | null
          saida_intervalo?: string | null
          servidor_id?: string
          tipo_jornada?: Database["public"]["Enums"]["tipo_jornada"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ponto_servidor_servidor_id_fkey"
            columns: ["servidor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ppa: {
        Row: {
          ano_fim: number
          ano_inicio: number
          created_at: string | null
          descricao: string | null
          id: string
          lei_data: string | null
          lei_numero: string | null
          municipio_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          ano_fim: number
          ano_inicio: number
          created_at?: string | null
          descricao?: string | null
          id?: string
          lei_data?: string | null
          lei_numero?: string | null
          municipio_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          ano_fim?: number
          ano_inicio?: number
          created_at?: string | null
          descricao?: string | null
          id?: string
          lei_data?: string | null
          lei_numero?: string | null
          municipio_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ppa_municipio_id_fkey"
            columns: ["municipio_id"]
            isOneToOne: false
            referencedRelation: "municipios"
            referencedColumns: ["id"]
          },
        ]
      }
      ppa_acoes: {
        Row: {
          codigo: string
          created_at: string | null
          descricao: string | null
          id: string
          meta_financeira: number | null
          meta_fisica: number | null
          nome: string
          produto: string | null
          programa_id: string | null
          tipo: string
          unidade_medida: string | null
        }
        Insert: {
          codigo: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          meta_financeira?: number | null
          meta_fisica?: number | null
          nome: string
          produto?: string | null
          programa_id?: string | null
          tipo: string
          unidade_medida?: string | null
        }
        Update: {
          codigo?: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          meta_financeira?: number | null
          meta_fisica?: number | null
          nome?: string
          produto?: string | null
          programa_id?: string | null
          tipo?: string
          unidade_medida?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ppa_acoes_programa_id_fkey"
            columns: ["programa_id"]
            isOneToOne: false
            referencedRelation: "ppa_programas"
            referencedColumns: ["id"]
          },
        ]
      }
      ppa_programas: {
        Row: {
          codigo: string
          created_at: string | null
          id: string
          indicador: string | null
          meta_financeira_total: number | null
          meta_fisica_total: number | null
          nome: string
          objetivo: string | null
          ppa_id: string | null
          publico_alvo: string | null
          secretaria_id: string | null
          status: string | null
          unidade_medida: string | null
        }
        Insert: {
          codigo: string
          created_at?: string | null
          id?: string
          indicador?: string | null
          meta_financeira_total?: number | null
          meta_fisica_total?: number | null
          nome: string
          objetivo?: string | null
          ppa_id?: string | null
          publico_alvo?: string | null
          secretaria_id?: string | null
          status?: string | null
          unidade_medida?: string | null
        }
        Update: {
          codigo?: string
          created_at?: string | null
          id?: string
          indicador?: string | null
          meta_financeira_total?: number | null
          meta_fisica_total?: number | null
          nome?: string
          objetivo?: string | null
          ppa_id?: string | null
          publico_alvo?: string | null
          secretaria_id?: string | null
          status?: string | null
          unidade_medida?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ppa_programas_ppa_id_fkey"
            columns: ["ppa_id"]
            isOneToOne: false
            referencedRelation: "ppa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ppa_programas_secretaria_id_fkey"
            columns: ["secretaria_id"]
            isOneToOne: false
            referencedRelation: "secretarias"
            referencedColumns: ["id"]
          },
        ]
      }
      processos_audiencias: {
        Row: {
          created_at: string | null
          data_hora: string
          houve_acordo: boolean | null
          id: string
          local: string | null
          observacoes: string | null
          prazo: string | null
          processo_id: string
          proxima_audiencia: string | null
          realizada: boolean | null
          resultado: string | null
          tipo: string
          valor_acordo: number | null
        }
        Insert: {
          created_at?: string | null
          data_hora: string
          houve_acordo?: boolean | null
          id?: string
          local?: string | null
          observacoes?: string | null
          prazo?: string | null
          processo_id: string
          proxima_audiencia?: string | null
          realizada?: boolean | null
          resultado?: string | null
          tipo: string
          valor_acordo?: number | null
        }
        Update: {
          created_at?: string | null
          data_hora?: string
          houve_acordo?: boolean | null
          id?: string
          local?: string | null
          observacoes?: string | null
          prazo?: string | null
          processo_id?: string
          proxima_audiencia?: string | null
          realizada?: boolean | null
          resultado?: string | null
          tipo?: string
          valor_acordo?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "processos_audiencias_processo_id_fkey"
            columns: ["processo_id"]
            isOneToOne: false
            referencedRelation: "processos_trabalhistas"
            referencedColumns: ["id"]
          },
        ]
      }
      processos_movimentacoes: {
        Row: {
          created_at: string | null
          data: string
          data_prazo: string | null
          descricao: string
          documento_url: string | null
          id: string
          prazo_cumprido: boolean | null
          processo_id: string
          tem_prazo: boolean | null
        }
        Insert: {
          created_at?: string | null
          data: string
          data_prazo?: string | null
          descricao: string
          documento_url?: string | null
          id?: string
          prazo_cumprido?: boolean | null
          processo_id: string
          tem_prazo?: boolean | null
        }
        Update: {
          created_at?: string | null
          data?: string
          data_prazo?: string | null
          descricao?: string
          documento_url?: string | null
          id?: string
          prazo_cumprido?: boolean | null
          processo_id?: string
          tem_prazo?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "processos_movimentacoes_processo_id_fkey"
            columns: ["processo_id"]
            isOneToOne: false
            referencedRelation: "processos_trabalhistas"
            referencedColumns: ["id"]
          },
        ]
      }
      processos_provisionamentos: {
        Row: {
          created_at: string | null
          data: string
          exercicio_id: string | null
          id: string
          motivo: string
          processo_id: string
          tipo: string
          valor: number
        }
        Insert: {
          created_at?: string | null
          data: string
          exercicio_id?: string | null
          id?: string
          motivo: string
          processo_id: string
          tipo: string
          valor: number
        }
        Update: {
          created_at?: string | null
          data?: string
          exercicio_id?: string | null
          id?: string
          motivo?: string
          processo_id?: string
          tipo?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "processos_provisionamentos_exercicio_id_fkey"
            columns: ["exercicio_id"]
            isOneToOne: false
            referencedRelation: "exercicios_financeiros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "processos_provisionamentos_processo_id_fkey"
            columns: ["processo_id"]
            isOneToOne: false
            referencedRelation: "processos_trabalhistas"
            referencedColumns: ["id"]
          },
        ]
      }
      processos_trabalhistas: {
        Row: {
          advogado_responsavel: string | null
          comarca: string | null
          cpf_reclamante: string | null
          created_at: string | null
          data_citacao: string | null
          data_distribuicao: string | null
          data_sentenca: string | null
          data_transito_julgado: string | null
          fase: Database["public"]["Enums"]["fase_processual"] | null
          id: string
          nome_reclamante: string
          numero_processo: string
          oab_advogado: string | null
          observacoes: string | null
          secretaria_id: string | null
          servidor_id: string | null
          status:
            | Database["public"]["Enums"]["status_processo_trabalhista"]
            | null
          tribunal: string | null
          updated_at: string | null
          valor_acordo: number | null
          valor_causa: number | null
          valor_condenacao: number | null
          valor_provisionado: number | null
          vara: string | null
        }
        Insert: {
          advogado_responsavel?: string | null
          comarca?: string | null
          cpf_reclamante?: string | null
          created_at?: string | null
          data_citacao?: string | null
          data_distribuicao?: string | null
          data_sentenca?: string | null
          data_transito_julgado?: string | null
          fase?: Database["public"]["Enums"]["fase_processual"] | null
          id?: string
          nome_reclamante: string
          numero_processo: string
          oab_advogado?: string | null
          observacoes?: string | null
          secretaria_id?: string | null
          servidor_id?: string | null
          status?:
            | Database["public"]["Enums"]["status_processo_trabalhista"]
            | null
          tribunal?: string | null
          updated_at?: string | null
          valor_acordo?: number | null
          valor_causa?: number | null
          valor_condenacao?: number | null
          valor_provisionado?: number | null
          vara?: string | null
        }
        Update: {
          advogado_responsavel?: string | null
          comarca?: string | null
          cpf_reclamante?: string | null
          created_at?: string | null
          data_citacao?: string | null
          data_distribuicao?: string | null
          data_sentenca?: string | null
          data_transito_julgado?: string | null
          fase?: Database["public"]["Enums"]["fase_processual"] | null
          id?: string
          nome_reclamante?: string
          numero_processo?: string
          oab_advogado?: string | null
          observacoes?: string | null
          secretaria_id?: string | null
          servidor_id?: string | null
          status?:
            | Database["public"]["Enums"]["status_processo_trabalhista"]
            | null
          tribunal?: string | null
          updated_at?: string | null
          valor_acordo?: number | null
          valor_causa?: number | null
          valor_condenacao?: number | null
          valor_provisionado?: number | null
          vara?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "processos_trabalhistas_secretaria_id_fkey"
            columns: ["secretaria_id"]
            isOneToOne: false
            referencedRelation: "secretarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "processos_trabalhistas_servidor_id_fkey"
            columns: ["servidor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          cnh_categoria: string | null
          cnh_numero: string | null
          cnh_validade: string | null
          cpf: string | null
          created_at: string
          ctps_numero: string | null
          ctps_serie: string | null
          ctps_uf: string | null
          data_nascimento: string | null
          department: string | null
          email: string | null
          endereco_bairro: string | null
          endereco_cep: string | null
          endereco_cidade: string | null
          endereco_complemento: string | null
          endereco_logradouro: string | null
          endereco_numero: string | null
          endereco_uf: string | null
          estado_civil: string | null
          foto_url: string | null
          id: string
          nacionalidade: string | null
          name: string | null
          naturalidade: string | null
          nome_mae: string | null
          nome_pai: string | null
          observacoes: string | null
          pis_pasep: string | null
          rg: string | null
          rg_orgao_emissor: string | null
          rg_uf: string | null
          role: string | null
          secao_eleitoral: string | null
          sexo: string | null
          telefone_celular: string | null
          telefone_residencial: string | null
          titulo_eleitor: string | null
          updated_at: string
          user_id: string
          zona_eleitoral: string | null
        }
        Insert: {
          cnh_categoria?: string | null
          cnh_numero?: string | null
          cnh_validade?: string | null
          cpf?: string | null
          created_at?: string
          ctps_numero?: string | null
          ctps_serie?: string | null
          ctps_uf?: string | null
          data_nascimento?: string | null
          department?: string | null
          email?: string | null
          endereco_bairro?: string | null
          endereco_cep?: string | null
          endereco_cidade?: string | null
          endereco_complemento?: string | null
          endereco_logradouro?: string | null
          endereco_numero?: string | null
          endereco_uf?: string | null
          estado_civil?: string | null
          foto_url?: string | null
          id?: string
          nacionalidade?: string | null
          name?: string | null
          naturalidade?: string | null
          nome_mae?: string | null
          nome_pai?: string | null
          observacoes?: string | null
          pis_pasep?: string | null
          rg?: string | null
          rg_orgao_emissor?: string | null
          rg_uf?: string | null
          role?: string | null
          secao_eleitoral?: string | null
          sexo?: string | null
          telefone_celular?: string | null
          telefone_residencial?: string | null
          titulo_eleitor?: string | null
          updated_at?: string
          user_id: string
          zona_eleitoral?: string | null
        }
        Update: {
          cnh_categoria?: string | null
          cnh_numero?: string | null
          cnh_validade?: string | null
          cpf?: string | null
          created_at?: string
          ctps_numero?: string | null
          ctps_serie?: string | null
          ctps_uf?: string | null
          data_nascimento?: string | null
          department?: string | null
          email?: string | null
          endereco_bairro?: string | null
          endereco_cep?: string | null
          endereco_cidade?: string | null
          endereco_complemento?: string | null
          endereco_logradouro?: string | null
          endereco_numero?: string | null
          endereco_uf?: string | null
          estado_civil?: string | null
          foto_url?: string | null
          id?: string
          nacionalidade?: string | null
          name?: string | null
          naturalidade?: string | null
          nome_mae?: string | null
          nome_pai?: string | null
          observacoes?: string | null
          pis_pasep?: string | null
          rg?: string | null
          rg_orgao_emissor?: string | null
          rg_uf?: string | null
          role?: string | null
          secao_eleitoral?: string | null
          sexo?: string | null
          telefone_celular?: string | null
          telefone_residencial?: string | null
          titulo_eleitor?: string | null
          updated_at?: string
          user_id?: string
          zona_eleitoral?: string | null
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
      relatorios_legais: {
        Row: {
          arquivo_url: string | null
          competencia: string
          created_at: string | null
          dados: Json | null
          data_transmissao: string | null
          gerado_por: string | null
          hash_arquivo: string | null
          id: string
          observacoes: string | null
          protocolo: string | null
          secretaria_id: string | null
          tipo: string
          transmitido: boolean | null
          updated_at: string | null
        }
        Insert: {
          arquivo_url?: string | null
          competencia: string
          created_at?: string | null
          dados?: Json | null
          data_transmissao?: string | null
          gerado_por?: string | null
          hash_arquivo?: string | null
          id?: string
          observacoes?: string | null
          protocolo?: string | null
          secretaria_id?: string | null
          tipo: string
          transmitido?: boolean | null
          updated_at?: string | null
        }
        Update: {
          arquivo_url?: string | null
          competencia?: string
          created_at?: string | null
          dados?: Json | null
          data_transmissao?: string | null
          gerado_por?: string | null
          hash_arquivo?: string | null
          id?: string
          observacoes?: string | null
          protocolo?: string | null
          secretaria_id?: string | null
          tipo?: string
          transmitido?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "relatorios_legais_secretaria_id_fkey"
            columns: ["secretaria_id"]
            isOneToOne: false
            referencedRelation: "secretarias"
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
      restos_a_pagar: {
        Row: {
          created_at: string | null
          data_cancelamento: string | null
          data_inscricao: string
          data_pagamento: string | null
          empenho_id: string | null
          exercicio_origem: number
          id: string
          motivo_cancelamento: string | null
          saldo: number | null
          status: Database["public"]["Enums"]["status_resto_pagar"] | null
          tipo: Database["public"]["Enums"]["tipo_resto_pagar"]
          updated_at: string | null
          valor_cancelado: number | null
          valor_inscrito: number
          valor_pago: number | null
        }
        Insert: {
          created_at?: string | null
          data_cancelamento?: string | null
          data_inscricao: string
          data_pagamento?: string | null
          empenho_id?: string | null
          exercicio_origem: number
          id?: string
          motivo_cancelamento?: string | null
          saldo?: number | null
          status?: Database["public"]["Enums"]["status_resto_pagar"] | null
          tipo: Database["public"]["Enums"]["tipo_resto_pagar"]
          updated_at?: string | null
          valor_cancelado?: number | null
          valor_inscrito: number
          valor_pago?: number | null
        }
        Update: {
          created_at?: string | null
          data_cancelamento?: string | null
          data_inscricao?: string
          data_pagamento?: string | null
          empenho_id?: string | null
          exercicio_origem?: number
          id?: string
          motivo_cancelamento?: string | null
          saldo?: number | null
          status?: Database["public"]["Enums"]["status_resto_pagar"] | null
          tipo?: Database["public"]["Enums"]["tipo_resto_pagar"]
          updated_at?: string | null
          valor_cancelado?: number | null
          valor_inscrito?: number
          valor_pago?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "restos_a_pagar_empenho_id_fkey"
            columns: ["empenho_id"]
            isOneToOne: false
            referencedRelation: "empenhos"
            referencedColumns: ["id"]
          },
        ]
      }
      restricoes_acesso: {
        Row: {
          apenas_rede_interna: boolean | null
          ativo: boolean | null
          created_at: string
          delegacao_automatica_ausencia: boolean | null
          delegado_substituto_id: string | null
          dias_semana: number[] | null
          dispositivos_permitidos: string[] | null
          horario_fim: string | null
          horario_inicio: string | null
          id: string
          ips_permitidos: string[] | null
          limite_aprovacao_financeira: number | null
          limite_diario: number | null
          limite_mensal: number | null
          localizacoes_permitidas: Json | null
          papel_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          apenas_rede_interna?: boolean | null
          ativo?: boolean | null
          created_at?: string
          delegacao_automatica_ausencia?: boolean | null
          delegado_substituto_id?: string | null
          dias_semana?: number[] | null
          dispositivos_permitidos?: string[] | null
          horario_fim?: string | null
          horario_inicio?: string | null
          id?: string
          ips_permitidos?: string[] | null
          limite_aprovacao_financeira?: number | null
          limite_diario?: number | null
          limite_mensal?: number | null
          localizacoes_permitidas?: Json | null
          papel_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          apenas_rede_interna?: boolean | null
          ativo?: boolean | null
          created_at?: string
          delegacao_automatica_ausencia?: boolean | null
          delegado_substituto_id?: string | null
          dias_semana?: number[] | null
          dispositivos_permitidos?: string[] | null
          horario_fim?: string | null
          horario_inicio?: string | null
          id?: string
          ips_permitidos?: string[] | null
          limite_aprovacao_financeira?: number | null
          limite_diario?: number | null
          limite_mensal?: number | null
          localizacoes_permitidas?: Json | null
          papel_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restricoes_acesso_papel_id_fkey"
            columns: ["papel_id"]
            isOneToOne: false
            referencedRelation: "papeis_usuario"
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
      retencoes_legais: {
        Row: {
          aliquota: number | null
          base_calculo: number | null
          codigo_receita: string | null
          created_at: string | null
          id: string
          liquidacao_id: string | null
          observacao: string | null
          tipo: string
          valor_retido: number
        }
        Insert: {
          aliquota?: number | null
          base_calculo?: number | null
          codigo_receita?: string | null
          created_at?: string | null
          id?: string
          liquidacao_id?: string | null
          observacao?: string | null
          tipo: string
          valor_retido: number
        }
        Update: {
          aliquota?: number | null
          base_calculo?: number | null
          codigo_receita?: string | null
          created_at?: string | null
          id?: string
          liquidacao_id?: string | null
          observacao?: string | null
          tipo?: string
          valor_retido?: number
        }
        Relationships: [
          {
            foreignKeyName: "retencoes_legais_liquidacao_id_fkey"
            columns: ["liquidacao_id"]
            isOneToOne: false
            referencedRelation: "liquidacoes"
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
      solicitacoes_reversao: {
        Row: {
          aprovado_em: string | null
          aprovador_id: string | null
          created_at: string
          entidade: string
          entidade_id: string
          id: string
          motivo: string
          motivo_rejeicao: string | null
          solicitante_id: string
          status: string | null
          versao_atual: number
          versao_destino: number
        }
        Insert: {
          aprovado_em?: string | null
          aprovador_id?: string | null
          created_at?: string
          entidade: string
          entidade_id: string
          id?: string
          motivo: string
          motivo_rejeicao?: string | null
          solicitante_id: string
          status?: string | null
          versao_atual: number
          versao_destino: number
        }
        Update: {
          aprovado_em?: string | null
          aprovador_id?: string | null
          created_at?: string
          entidade?: string
          entidade_id?: string
          id?: string
          motivo?: string
          motivo_rejeicao?: string | null
          solicitante_id?: string
          status?: string | null
          versao_atual?: number
          versao_destino?: number
        }
        Relationships: []
      }
      tabela_inss: {
        Row: {
          aliquota: number
          ativo: boolean | null
          created_at: string | null
          faixa: number
          id: string
          parcela_deduzir: number | null
          teto_contribuicao: number | null
          valor_final: number | null
          valor_inicial: number
          vigencia_fim: string | null
          vigencia_inicio: string
        }
        Insert: {
          aliquota: number
          ativo?: boolean | null
          created_at?: string | null
          faixa: number
          id?: string
          parcela_deduzir?: number | null
          teto_contribuicao?: number | null
          valor_final?: number | null
          valor_inicial: number
          vigencia_fim?: string | null
          vigencia_inicio: string
        }
        Update: {
          aliquota?: number
          ativo?: boolean | null
          created_at?: string | null
          faixa?: number
          id?: string
          parcela_deduzir?: number | null
          teto_contribuicao?: number | null
          valor_final?: number | null
          valor_inicial?: number
          vigencia_fim?: string | null
          vigencia_inicio?: string
        }
        Relationships: []
      }
      tabela_irrf: {
        Row: {
          aliquota: number
          ativo: boolean | null
          created_at: string | null
          deducao_dependente: number | null
          faixa: number
          id: string
          parcela_deduzir: number
          valor_final: number | null
          valor_inicial: number
          vigencia_fim: string | null
          vigencia_inicio: string
        }
        Insert: {
          aliquota: number
          ativo?: boolean | null
          created_at?: string | null
          deducao_dependente?: number | null
          faixa: number
          id?: string
          parcela_deduzir?: number
          valor_final?: number | null
          valor_inicial: number
          vigencia_fim?: string | null
          vigencia_inicio: string
        }
        Update: {
          aliquota?: number
          ativo?: boolean | null
          created_at?: string | null
          deducao_dependente?: number | null
          faixa?: number
          id?: string
          parcela_deduzir?: number
          valor_final?: number | null
          valor_inicial?: number
          vigencia_fim?: string | null
          vigencia_inicio?: string
        }
        Relationships: []
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
      vinculos_funcionais: {
        Row: {
          cargo_id: string | null
          classe_atual: string | null
          created_at: string
          data_admissao: string
          data_afastamento: string | null
          data_exercicio: string | null
          data_posse: string | null
          data_ultima_progressao: string | null
          funcao_id: string | null
          horario_entrada: string | null
          horario_saida: string | null
          id: string
          is_primary: boolean | null
          jornada_semanal: number | null
          matricula: string | null
          motivo_afastamento: string | null
          nivel_atual: string | null
          padrao_atual: string | null
          previsao_retorno: string | null
          proxima_progressao: string | null
          regime: Database["public"]["Enums"]["regime_trabalho"]
          secretaria_id: string | null
          situacao: string | null
          unidade_id: string | null
          updated_at: string
          user_id: string
          vencimento_atual: number | null
        }
        Insert: {
          cargo_id?: string | null
          classe_atual?: string | null
          created_at?: string
          data_admissao: string
          data_afastamento?: string | null
          data_exercicio?: string | null
          data_posse?: string | null
          data_ultima_progressao?: string | null
          funcao_id?: string | null
          horario_entrada?: string | null
          horario_saida?: string | null
          id?: string
          is_primary?: boolean | null
          jornada_semanal?: number | null
          matricula?: string | null
          motivo_afastamento?: string | null
          nivel_atual?: string | null
          padrao_atual?: string | null
          previsao_retorno?: string | null
          proxima_progressao?: string | null
          regime?: Database["public"]["Enums"]["regime_trabalho"]
          secretaria_id?: string | null
          situacao?: string | null
          unidade_id?: string | null
          updated_at?: string
          user_id: string
          vencimento_atual?: number | null
        }
        Update: {
          cargo_id?: string | null
          classe_atual?: string | null
          created_at?: string
          data_admissao?: string
          data_afastamento?: string | null
          data_exercicio?: string | null
          data_posse?: string | null
          data_ultima_progressao?: string | null
          funcao_id?: string | null
          horario_entrada?: string | null
          horario_saida?: string | null
          id?: string
          is_primary?: boolean | null
          jornada_semanal?: number | null
          matricula?: string | null
          motivo_afastamento?: string | null
          nivel_atual?: string | null
          padrao_atual?: string | null
          previsao_retorno?: string | null
          proxima_progressao?: string | null
          regime?: Database["public"]["Enums"]["regime_trabalho"]
          secretaria_id?: string | null
          situacao?: string | null
          unidade_id?: string | null
          updated_at?: string
          user_id?: string
          vencimento_atual?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vinculos_funcionais_cargo_id_fkey"
            columns: ["cargo_id"]
            isOneToOne: false
            referencedRelation: "cargos_publicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vinculos_funcionais_funcao_id_fkey"
            columns: ["funcao_id"]
            isOneToOne: false
            referencedRelation: "funcoes_administrativas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vinculos_funcionais_secretaria_id_fkey"
            columns: ["secretaria_id"]
            isOneToOne: false
            referencedRelation: "secretarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vinculos_funcionais_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades_administrativas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calcular_alteracoes: {
        Args: { estado_anterior: Json; estado_posterior: Json }
        Returns: Json
      }
      criar_versao_entidade: {
        Args: {
          p_dados: Json
          p_entidade: string
          p_entidade_id: string
          p_motivo?: string
          p_user_id: string
        }
        Returns: number
      }
      gerar_hash_auditoria: { Args: { dados: Json }; Returns: string }
      get_user_school_ids: { Args: { _user_id: string }; Returns: string[] }
      get_user_secretaria_ids: { Args: { _user_id: string }; Returns: string[] }
      get_user_unidade_ids: { Args: { _user_id: string }; Returns: string[] }
      get_vinculo_funcional: {
        Args: { _user_id: string }
        Returns: {
          cargo_nome: string
          funcao_nome: string
          secretaria_nome: string
          unidade_nome: string
          vinculo_id: string
        }[]
      }
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
      has_papel_em_secretaria: {
        Args: {
          _papel: Database["public"]["Enums"]["papel_sistemico"]
          _secretaria_id: string
          _user_id: string
        }
        Returns: boolean
      }
      has_papel_sistemico: {
        Args: {
          _papel: Database["public"]["Enums"]["papel_sistemico"]
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
      registrar_auditoria: {
        Args: {
          p_categoria: Database["public"]["Enums"]["categoria_auditoria"]
          p_entidade: string
          p_entidade_id: string
          p_estado_anterior: Json
          p_estado_posterior: Json
          p_ip?: string
          p_metadata?: Json
          p_modulo: string
          p_secretaria_id: string
          p_tipo_acao: Database["public"]["Enums"]["tipo_acao_auditoria"]
          p_user_agent?: string
          p_user_id: string
        }
        Returns: string
      }
      tem_permissao: {
        Args: {
          _acao: Database["public"]["Enums"]["tipo_permissao"]
          _modulo: string
          _user_id: string
        }
        Returns: boolean
      }
      verifica_restricoes_abac: {
        Args: {
          _dia_semana?: number
          _hora?: string
          _ip?: string
          _user_id: string
          _valor_financeiro?: number
        }
        Returns: boolean
      }
    }
    Enums: {
      categoria_auditoria: "seguranca" | "dados" | "financeiro" | "documental"
      condicao_permissao:
        | "todos"
        | "proprios"
        | "subordinados"
        | "mesma_unidade"
        | "mesma_secretaria"
        | "hierarquia_inferior"
      education_role: "secretaria" | "diretor" | "professor" | "responsavel"
      exercicio_status: "aberto" | "bloqueado" | "encerrado"
      fase_processual:
        | "inicial"
        | "instrucao"
        | "julgamento"
        | "recursos"
        | "execucao"
        | "encerrado"
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
      papel_sistemico:
        | "admin_municipal"
        | "secretario"
        | "secretario_adjunto"
        | "diretor"
        | "coordenador"
        | "tecnico"
        | "operador"
        | "auditor"
      periodo_tipo: "bimestre" | "trimestre" | "quadrimestre" | "semestre"
      regime_trabalho:
        | "estatutario"
        | "celetista"
        | "temporario"
        | "comissionado"
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
      status_convenio: "vigente" | "encerrado" | "rescindido" | "em_prestacao"
      status_empenho:
        | "ativo"
        | "anulado"
        | "liquidado"
        | "pago"
        | "inscrito_rap"
      status_folha:
        | "aberta"
        | "calculada"
        | "conferida"
        | "fechada"
        | "reprocessada"
      status_justificativa: "pendente" | "aprovada" | "rejeitada"
      status_processo_trabalhista:
        | "ativo"
        | "suspenso"
        | "arquivado"
        | "transitado_julgado"
        | "acordo"
        | "extinto"
      status_resto_pagar: "inscrito" | "pago" | "cancelado" | "prescrito"
      status_solicitacao:
        | "rascunho"
        | "enviada"
        | "aprovada_chefia"
        | "aprovada_rh"
        | "rejeitada"
        | "cancelada"
        | "em_gozo"
        | "concluida"
      task_priority: "low" | "medium" | "high" | "urgent"
      task_status: "pending" | "in_progress" | "completed" | "cancelled"
      tipo_acao_auditoria:
        | "criar"
        | "editar"
        | "excluir"
        | "visualizar"
        | "aprovar"
        | "rejeitar"
        | "login"
        | "logout"
        | "exportar"
        | "importar"
        | "reverter"
      tipo_cargo: "efetivo" | "comissionado" | "temporario" | "emprego_publico"
      tipo_convenio: "recebido" | "concedido"
      tipo_empenho: "ordinario" | "estimativo" | "global"
      tipo_evento_folha:
        | "vencimento"
        | "gratificacao"
        | "adicional"
        | "beneficio"
        | "desconto_obrigatorio"
        | "desconto_facultativo"
        | "outros"
      tipo_funcao: "comissionada" | "gratificada" | "cargo_em_comissao"
      tipo_incidencia:
        | "inss"
        | "irrf"
        | "fgts"
        | "base_ferias"
        | "base_13"
        | "nenhuma"
      tipo_jornada:
        | "presencial"
        | "teletrabalho"
        | "hibrido"
        | "sobreaviso"
        | "plantao"
      tipo_licenca:
        | "saude"
        | "maternidade"
        | "paternidade"
        | "casamento"
        | "luto"
        | "capacitacao"
        | "interesse_particular"
        | "premio"
        | "outros"
      tipo_permissao:
        | "ver"
        | "criar"
        | "editar"
        | "excluir"
        | "aprovar"
        | "publicar"
      tipo_registro_ponto:
        | "entrada"
        | "saida_intervalo"
        | "retorno_intervalo"
        | "saida"
      tipo_resto_pagar: "processado" | "nao_processado"
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
      categoria_auditoria: ["seguranca", "dados", "financeiro", "documental"],
      condicao_permissao: [
        "todos",
        "proprios",
        "subordinados",
        "mesma_unidade",
        "mesma_secretaria",
        "hierarquia_inferior",
      ],
      education_role: ["secretaria", "diretor", "professor", "responsavel"],
      exercicio_status: ["aberto", "bloqueado", "encerrado"],
      fase_processual: [
        "inicial",
        "instrucao",
        "julgamento",
        "recursos",
        "execucao",
        "encerrado",
      ],
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
      papel_sistemico: [
        "admin_municipal",
        "secretario",
        "secretario_adjunto",
        "diretor",
        "coordenador",
        "tecnico",
        "operador",
        "auditor",
      ],
      periodo_tipo: ["bimestre", "trimestre", "quadrimestre", "semestre"],
      regime_trabalho: [
        "estatutario",
        "celetista",
        "temporario",
        "comissionado",
      ],
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
      status_convenio: ["vigente", "encerrado", "rescindido", "em_prestacao"],
      status_empenho: ["ativo", "anulado", "liquidado", "pago", "inscrito_rap"],
      status_folha: [
        "aberta",
        "calculada",
        "conferida",
        "fechada",
        "reprocessada",
      ],
      status_justificativa: ["pendente", "aprovada", "rejeitada"],
      status_processo_trabalhista: [
        "ativo",
        "suspenso",
        "arquivado",
        "transitado_julgado",
        "acordo",
        "extinto",
      ],
      status_resto_pagar: ["inscrito", "pago", "cancelado", "prescrito"],
      status_solicitacao: [
        "rascunho",
        "enviada",
        "aprovada_chefia",
        "aprovada_rh",
        "rejeitada",
        "cancelada",
        "em_gozo",
        "concluida",
      ],
      task_priority: ["low", "medium", "high", "urgent"],
      task_status: ["pending", "in_progress", "completed", "cancelled"],
      tipo_acao_auditoria: [
        "criar",
        "editar",
        "excluir",
        "visualizar",
        "aprovar",
        "rejeitar",
        "login",
        "logout",
        "exportar",
        "importar",
        "reverter",
      ],
      tipo_cargo: ["efetivo", "comissionado", "temporario", "emprego_publico"],
      tipo_convenio: ["recebido", "concedido"],
      tipo_empenho: ["ordinario", "estimativo", "global"],
      tipo_evento_folha: [
        "vencimento",
        "gratificacao",
        "adicional",
        "beneficio",
        "desconto_obrigatorio",
        "desconto_facultativo",
        "outros",
      ],
      tipo_funcao: ["comissionada", "gratificada", "cargo_em_comissao"],
      tipo_incidencia: [
        "inss",
        "irrf",
        "fgts",
        "base_ferias",
        "base_13",
        "nenhuma",
      ],
      tipo_jornada: [
        "presencial",
        "teletrabalho",
        "hibrido",
        "sobreaviso",
        "plantao",
      ],
      tipo_licenca: [
        "saude",
        "maternidade",
        "paternidade",
        "casamento",
        "luto",
        "capacitacao",
        "interesse_particular",
        "premio",
        "outros",
      ],
      tipo_permissao: [
        "ver",
        "criar",
        "editar",
        "excluir",
        "aprovar",
        "publicar",
      ],
      tipo_registro_ponto: [
        "entrada",
        "saida_intervalo",
        "retorno_intervalo",
        "saida",
      ],
      tipo_resto_pagar: ["processado", "nao_processado"],
      unidade_tipo: ["administrativa", "operacional", "tecnica"],
    },
  },
} as const
