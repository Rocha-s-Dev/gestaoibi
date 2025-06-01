export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
      perfil_usuario:
        | "admin_secretaria"
        | "gestor_escolar"
        | "professor"
        | "aluno"
        | "responsavel"
      prioridade_chamado: "baixa" | "media" | "alta" | "urgente"
      status_aluno: "matriculado" | "transferido" | "evadido" | "concluido"
      status_chamado: "aberto" | "em_andamento" | "resolvido" | "cancelado"
      status_escola: "ativa" | "inativa" | "em_reforma" | "em_construcao"
      task_priority: "low" | "medium" | "high"
      tipo_falta: "justificada" | "injustificada"
      turno_escolar: "matutino" | "vespertino" | "noturno" | "integral"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
      perfil_usuario: [
        "admin_secretaria",
        "gestor_escolar",
        "professor",
        "aluno",
        "responsavel",
      ],
      prioridade_chamado: ["baixa", "media", "alta", "urgente"],
      status_aluno: ["matriculado", "transferido", "evadido", "concluido"],
      status_chamado: ["aberto", "em_andamento", "resolvido", "cancelado"],
      status_escola: ["ativa", "inativa", "em_reforma", "em_construcao"],
      task_priority: ["low", "medium", "high"],
      tipo_falta: ["justificada", "injustificada"],
      turno_escolar: ["matutino", "vespertino", "noturno", "integral"],
    },
  },
} as const
