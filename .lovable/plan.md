# Plano: Expandir Secretaria de Desenvolvimento Social

Como você pediu para eu decidir, vou seguir o padrão já usado em Saúde, Educação e Meio Ambiente (papéis administrativos por secretaria) e adicionar o módulo mais crítico que falta hoje: **Benefícios Eventuais**. Nada existente será alterado ou removido.

---

## 1. Papéis Administrativos (novo)

### Banco de dados
Enum `social_role`:
- `secretario_assistencia_social`
- `coordenador_cras`
- `coordenador_creas`
- `assistente_social`
- `psicologo_social`
- `tecnico_nivel_medio`
- `agente_social`
- `gestor_beneficios`

Tabela `user_social_roles`:
- `user_id` (FK profiles), `role` (enum), `unidade_id` (FK unidades_socioassistenciais, opcional), `secretaria_id`
- UNIQUE (user_id, role, unidade_id)
- Funções `has_social_role(uuid, social_role)` e `is_secretario_assistencia_social(uuid)` (SECURITY DEFINER)

### RLS — regras
- Secretário e admin_municipal: acesso total à secretaria
- Coordenador CRAS/CREAS: acesso completo dentro da(s) unidade(s) vinculada(s)
- Assistente social / psicólogo: acesso a famílias, atendimentos e visitas da sua unidade
- Técnico / agente social: leitura + criação de atendimentos/visitas na sua unidade
- Gestor de benefícios: acesso exclusivo ao módulo de benefícios eventuais

Aplicar/ajustar policies em: `familias_cadunico`, `membros_familia`, `atendimentos_sociais`, `visitas_domiciliares`, `unidades_socioassistenciais` (mantendo policies existentes; adicionando novas — nada removido).

### UI
- Novo componente `src/components/social/EquipeSocial.tsx` (espelho de `EquipeAmbiental`) com:
  - Lista de membros com nome, cargo RH, papel social, unidade, data de vínculo
  - Filtros por papel, unidade e status
  - Dialog de atribuição/edição de papel usando `VincularUsuarioRH` (RH central — sem criar usuários)
  - Remoção de vínculo
- `src/hooks/useEquipeSocial.ts` — CRUD de vínculos
- Em `GestaoDeProgamasSociais.tsx`: substituir `EquipeSecretaria` pela nova `EquipeSocial` na aba "Equipe"

---

## 2. Benefícios Eventuais (novo módulo)

### Banco
Tabela `beneficios_eventuais`:
- `familia_id` (FK), `membro_id` (FK opcional), `tipo_beneficio` (enum: `auxilio_funeral`, `auxilio_natalidade`, `cesta_basica`, `aluguel_social`, `passagem`, `documentacao`, `outros`)
- `valor`, `quantidade`, `data_concessao`, `data_validade`, `parcela_atual`, `total_parcelas`
- `justificativa`, `parecer_tecnico`, `documentos_anexos` (jsonb)
- `status` (`solicitado`, `em_analise`, `aprovado`, `concedido`, `indeferido`, `cancelado`)
- `tecnico_responsavel_id`, `aprovado_por`, `unidade_id`, `secretaria_id`

Tabela `beneficios_eventuais_historico` (log de mudanças de status).

RLS: secretário/coordenador aprovam; assistente social e gestor de benefícios criam/editam; auditor visualiza.

### UI
- `src/components/social/BeneficiosEventuais.tsx` — lista com filtros (tipo, status, unidade, período)
- `src/components/social/BeneficioEventualDialog.tsx` — cadastro/edição com seleção de família e tipo
- `src/hooks/useBeneficiosEventuais.ts` — CRUD + mudança de status com histórico
- Nova aba **"Benefícios"** em `GestaoDeProgamasSociais.tsx` (posicionada após "Programas")

### Dashboard
Atualizar `DashboardSocial.tsx` adicionando KPIs:
- Benefícios concedidos no mês
- Valor total distribuído
- Aluguéis sociais ativos
- Distribuição por tipo (gráfico)

---

## 3. Detalhes técnicos

| Arquivo | Ação |
|---|---|
| `supabase/migrations/<timestamp>_social_roles_beneficios.sql` | Novo — enum, tabelas, funções, RLS, GRANTs, triggers de updated_at |
| `src/hooks/useEquipeSocial.ts` | Novo |
| `src/hooks/useBeneficiosEventuais.ts` | Novo |
| `src/components/social/EquipeSocial.tsx` | Novo |
| `src/components/social/BeneficiosEventuais.tsx` | Novo |
| `src/components/social/BeneficioEventualDialog.tsx` | Novo |
| `src/components/social/DashboardSocial.tsx` | Editar (adicionar KPIs) |
| `src/pages/GestaoDeProgamasSociais.tsx` | Editar (nova aba + trocar Equipe) |

**Garantias:**
- Nenhuma tabela ou componente existente é removida
- Todo vínculo de pessoa continua via `VincularUsuarioRH` (RH central)
- Padrão de auditoria SHA-256 (`auditoria_global`) mantido automaticamente pelos triggers já existentes
- Campos-padrão (`id`, `created_at`, `updated_at`, `created_by`) em todas as novas tabelas

Se preferir focar só em papéis, só em benefícios, ou incluir também PAIF/PAEFI ou SCFV, é só me dizer antes de aprovar.
