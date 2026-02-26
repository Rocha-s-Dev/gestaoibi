

## Cargos por Secretaria e Padronizacao da Equipe

### Resumo
Criar tabela `cargos_secretaria` com cargos descritivos por secretaria (nao sao roles), seed com todos os cargos listados, atualizar o componente `EquipeSecretaria` para permitir selecao de cargo ao vincular, e adicionar aba Equipe nas secretarias que ainda nao tem (Transportes, Saude, Educacao).

### 1. Migracao SQL

**Tabela `cargos_secretaria`:**
- `id` uuid PK
- `nome` text NOT NULL
- `secretaria_id` uuid FK -> secretarias NOT NULL
- `nivel` text (estrategico, gerencial, operacional, apoio)
- `ativo` boolean default true
- `created_at` timestamp
- UNIQUE(nome, secretaria_id)
- RLS: authenticated pode SELECT; admin/secretario pode INSERT/UPDATE/DELETE

**Seed com INSERT:** ~130 registros cobrindo:
- 12 cargos de apoio padrao em TODAS as 10 secretarias (120 registros)
- Cargos especificos por secretaria conforme listado pelo usuario
- Saude: apenas cargos de apoio (tecnicos ja existem em `profissionais_saude`)

**Adicionar coluna `cargo_secretaria_id` em `vinculos_funcionais`:**
- FK para `cargos_secretaria(id)`, nullable
- Permite vincular um cargo descritivo ao vinculo funcional

### 2. Hook `useCargosSecretaria`
- Query cargos filtrados por `secretaria_id` e `ativo = true`
- Ordenado por nivel e nome

### 3. Atualizar `EquipeSecretaria`
- Ao vincular funcionario, apos selecionar usuario do RH, exibir dialog intermediario para escolher cargo da lista `cargos_secretaria` filtrada pela secretaria
- Salvar `cargo_secretaria_id` no `vinculos_funcionais`
- Exibir nome do cargo na coluna "Cargo" da tabela (em vez do `cargos_publicos`)

### 4. Adicionar aba Equipe nas paginas faltantes

**GestaoTransportes.tsx:** Adicionar tab "Equipe" com `<EquipeSecretaria>`
**GestaoSaudePublica.tsx:** Adicionar tab "Equipe" com `<EquipeSecretaria>` (separado dos Profissionais tecnicos)
**GestaoEducacao.tsx:** Adicionar tab "Equipe" com `<EquipeSecretaria>` (separado do cadastro de Professores)

### Arquivos afetados
- Migracao SQL (tabela + seed + coluna)
- `src/hooks/useCargosSecretaria.ts` (novo)
- `src/components/shared/EquipeSecretaria.tsx` (atualizar com selecao de cargo)
- `src/pages/GestaoTransportes.tsx` (adicionar aba Equipe)
- `src/pages/GestaoSaudePublica.tsx` (adicionar aba Equipe)
- `src/pages/GestaoEducacao.tsx` (adicionar aba Equipe)

### Regras mantidas
- Roles NAO sao alteradas
- Cargos sao apenas descritivos (organizacao, relatorios, organograma)
- Permissoes continuam baseadas exclusivamente nas roles existentes
- Fluxo: RH cria usuario -> Secretario vincula na aba Equipe -> Escolhe cargo da lista

