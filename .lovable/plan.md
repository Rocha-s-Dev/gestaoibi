

## Dashboard Principal Dinamico

### Problema Atual
A pagina `/dashboard` (Dashboard.tsx) exibe dados estaticos e ficticios (12 projetos, 148 funcionarios, etc.) sem conexao com o banco de dados e sem considerar o tipo de usuario logado.

### Abordagem
Transformar o Dashboard para ser contextual, exibindo informacoes reais do banco de dados e adaptando o conteudo ao perfil do usuario:

**1. Prefeito / Admin Municipal** - Visao executiva consolidada:
- Total de servidores ativos (tabela `profiles`)
- Total de secretarias ativas (tabela `secretarias`)
- Metas do plano de governo com progresso (tabela `metas_plano_governo`)
- Obras prioritarias em andamento (tabela `obras_prioritarias`)
- Alertas criticos pendentes (tabela `alertas_executivos`)
- Notificacoes recentes (tabela `notifications`)
- Mensagens nao lidas (tabelas `conversations`/`messages`)
- Graficos: metas por status, distribuicao por secretaria

**2. Gestor RH** - Visao de recursos humanos:
- Total de servidores ativos
- Servidores pendentes de regularizacao
- Folhas de pagamento do mes (tabela `folha_pagamento`)
- Notificacoes recentes

**3. Servidor / Secretario** - Visao setorial:
- Dados resumidos da secretaria ativa (usando o `SecretariaContext`)
- Metas da secretaria
- Notificacoes e mensagens recentes

### Detalhes Tecnicos

**Novo hook `src/hooks/useDashboardData.ts`**:
- Consulta ao banco condicionada pelo tipo de usuario (via `useSecretariaContext` e `useAuth`)
- Usa `@tanstack/react-query` para cache e loading states
- Queries separadas para cada bloco de dados (servidores, metas, alertas, etc.)

**Reescrita de `src/pages/Dashboard.tsx`**:
- Importa `useSecretariaContext` para `isAdmin`, `isPrefeito`, `isGestorRH`, `municipio`
- Importa `useAuth` para `userProfile`
- Exibe saudacao personalizada com nome do municipio
- Renderiza cards e graficos diferentes conforme o papel:
  - `isPrefeito || isAdmin`: painel executivo com KPIs consolidados, alertas criticos, progresso de metas de governo, e atalhos rapidos para modulos
  - `isGestorRH`: painel focado em RH com servidores, folha de pagamento
  - Demais: painel da secretaria ativa com resumo setorial
- Reutiliza o componente `DashboardCard` existente e `DashboardSecretaria` para graficos
- Secao de "Acoes Rapidas" com links para os modulos mais usados pelo tipo de usuario
- Secao de atividade recente baseada em `notifications` reais

**Sem alteracoes no banco de dados** - todas as tabelas necessarias ja existem.

### Componentes Afetados
- `src/pages/Dashboard.tsx` - reescrita completa
- `src/hooks/useDashboardData.ts` - novo arquivo
- `src/components/dashboard/DashboardCard.tsx` - sem alteracao (reutilizado)

