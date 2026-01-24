
# Plano: Sistema de Gestao Municipal - Arquitetura Fundamental

## Resumo Executivo

Este plano estabelece a base estrutural completa para um sistema de gestao municipal modular e escalavel, com foco na criacao de uma entidade central "Secretarias" que servira como fundacao para todo o sistema. A arquitetura sera preparada para multi-tenancy (multiplos municipios) desde o inicio.

---

## Fase 1: Entidades Centrais do Municipio

### 1.1 Tabela `municipios` (Multi-tenancy Ready)

Registro central do municipio, preparado para expansao futura:

| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | UUID | Identificador unico |
| nome | TEXT | Nome oficial do municipio |
| uf | CHAR(2) | Unidade federativa |
| cnpj | TEXT | CNPJ do municipio |
| codigo_ibge | TEXT | Codigo IBGE (7 digitos) |
| prefeito | TEXT | Nome do prefeito atual |
| vice_prefeito | TEXT | Nome do vice-prefeito |
| email_institucional | TEXT | Email oficial |
| telefone_principal | TEXT | Telefone principal |
| endereco_sede | TEXT | Endereco da prefeitura |
| brasao_url | TEXT | URL do brasao |
| bandeira_url | TEXT | URL da bandeira |
| data_fundacao | DATE | Data de fundacao |
| populacao_estimada | INTEGER | Populacao estimada |
| area_km2 | DECIMAL | Area em km2 |
| site_oficial | TEXT | Website oficial |
| status | TEXT | ativo/inativo |
| created_at | TIMESTAMPTZ | Data de criacao |
| updated_at | TIMESTAMPTZ | Data de atualizacao |

### 1.2 Tabela `exercicios_financeiros`

Controle de anos fiscais e periodos:

| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | UUID | Identificador unico |
| municipio_id | UUID | FK para municipios |
| ano | INTEGER | Ano do exercicio (ex: 2026) |
| data_inicio | DATE | Inicio do exercicio |
| data_fim | DATE | Fim do exercicio |
| status | TEXT | aberto/bloqueado/encerrado |
| loa_aprovada | BOOLEAN | LOA aprovada? |
| valor_orcamento | DECIMAL | Valor total do orcamento |
| observacoes | TEXT | Observacoes gerais |
| encerrado_por | UUID | Usuario que encerrou |
| encerrado_em | TIMESTAMPTZ | Data de encerramento |
| created_at | TIMESTAMPTZ | Data de criacao |
| updated_at | TIMESTAMPTZ | Data de atualizacao |

### 1.3 Tabela `periodos_fiscais`

Divisao do exercicio em periodos (bimestres/trimestres):

| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | UUID | Identificador unico |
| exercicio_id | UUID | FK para exercicios_financeiros |
| tipo | TEXT | bimestre/trimestre/quadrimestre |
| numero | INTEGER | Numero do periodo (1-6) |
| data_inicio | DATE | Inicio do periodo |
| data_fim | DATE | Fim do periodo |
| status | TEXT | aberto/bloqueado/encerrado |
| bloqueado_por | UUID | Usuario que bloqueou |
| bloqueado_em | TIMESTAMPTZ | Data de bloqueio |
| created_at | TIMESTAMPTZ | Data de criacao |

### 1.4 Tabela `feriados`

Cadastro global de feriados:

| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | UUID | Identificador unico |
| municipio_id | UUID | FK para municipios (null = nacional) |
| nome | TEXT | Nome do feriado |
| data | DATE | Data do feriado |
| tipo | TEXT | nacional/estadual/municipal/ponto_facultativo |
| recorrente | BOOLEAN | Repete todo ano? |
| uf | CHAR(2) | UF (para estaduais) |
| observacoes | TEXT | Observacoes |
| ativo | BOOLEAN | Feriado ativo? |
| created_at | TIMESTAMPTZ | Data de criacao |

---

## Fase 2: Entidade Central - Secretarias

### 2.1 Tabela `secretarias`

Estrutura completa conforme especificado:

| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | UUID | Identificador unico |
| municipio_id | UUID | FK para municipios |
| nome | TEXT | Nome oficial completo |
| sigla | TEXT | Sigla institucional (SME, SMS, SMF) |
| tipo | TEXT | finalistico/administrativo |
| codigo_orcamentario | TEXT | Codigo para LOA |
| nivel_hierarquico | INTEGER | Nivel na estrutura (1=principal) |
| responsavel_id | UUID | FK para servidor responsavel |
| email_institucional | TEXT | Email oficial |
| telefone_principal | TEXT | Telefone principal |
| telefone_secundario | TEXT | Telefone secundario |
| endereco | TEXT | Endereco fisico |
| cep | TEXT | CEP |
| bairro | TEXT | Bairro |
| missao | TEXT | Missao institucional |
| competencias | TEXT | Competencias legais |
| base_legal | TEXT | Lei de criacao |
| data_criacao | DATE | Data de criacao oficial |
| status | TEXT | ativa/inativa |
| icone | TEXT | Nome do icone (lucide) |
| cor_tema | TEXT | Cor hexadecimal do tema |
| ordem_exibicao | INTEGER | Ordem no menu |
| created_at | TIMESTAMPTZ | Data de criacao |
| updated_at | TIMESTAMPTZ | Data de atualizacao |

### 2.2 Tabela `secretarias_historico`

Historico de ativacoes/inativacoes:

| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | UUID | Identificador unico |
| secretaria_id | UUID | FK para secretarias |
| acao | TEXT | ativacao/inativacao/alteracao |
| motivo | TEXT | Motivo da alteracao |
| responsavel_id | UUID | Usuario responsavel |
| data_vigencia | DATE | Data de inicio da vigencia |
| dados_anteriores | JSONB | Snapshot antes da alteracao |
| created_at | TIMESTAMPTZ | Data do registro |

### 2.3 Tabela `unidades_administrativas`

Estrutura hierarquica em arvore:

| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | UUID | Identificador unico |
| secretaria_id | UUID | FK para secretarias (obrigatorio) |
| unidade_superior_id | UUID | FK para unidade pai (opcional) |
| nome | TEXT | Nome da unidade |
| sigla | TEXT | Sigla da unidade |
| tipo | TEXT | administrativa/operacional/tecnica |
| nivel | INTEGER | Nivel na hierarquia |
| codigo | TEXT | Codigo interno |
| missao | TEXT | Missao institucional |
| atribuicoes | TEXT | Atribuicoes detalhadas |
| qtd_cargos_previstos | INTEGER | Quantidade de cargos |
| qtd_cargos_ocupados | INTEGER | Cargos atualmente ocupados |
| responsavel_id | UUID | Servidor responsavel |
| email | TEXT | Email da unidade |
| telefone | TEXT | Telefone |
| localizacao | TEXT | Localizacao fisica |
| status | TEXT | ativa/inativa |
| created_at | TIMESTAMPTZ | Data de criacao |
| updated_at | TIMESTAMPTZ | Data de atualizacao |

---

## Fase 3: Sistema de Permissoes por Secretaria

### 3.1 Tabela `user_secretaria_roles`

Vinculo usuario-secretaria com papel:

| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | UUID | Identificador unico |
| user_id | UUID | FK para auth.users |
| secretaria_id | UUID | FK para secretarias |
| unidade_id | UUID | FK para unidades (opcional) |
| role | ENUM | Papel do usuario |
| is_primary | BOOLEAN | Secretaria principal? |
| created_at | TIMESTAMPTZ | Data de criacao |

### 3.2 Enum `secretaria_role`

Papeis disponiveis:
- `secretario` - Secretario titular
- `secretario_adjunto` - Secretario adjunto
- `diretor` - Diretor de departamento
- `coordenador` - Coordenador de area
- `supervisor` - Supervisor
- `servidor` - Servidor comum
- `estagiario` - Estagiario

### 3.3 Funcoes de Validacao (SECURITY DEFINER)

```text
+------------------------------------------+
|     Funcoes de Controle de Acesso        |
+------------------------------------------+
| get_user_secretaria_ids(user_id)         |
| has_secretaria_access(user_id, sec_id)   |
| has_secretaria_role(user_id, role)       |
| is_secretario(user_id, sec_id)           |
| get_current_secretaria_context()         |
+------------------------------------------+
```

---

## Fase 4: Contexto de Secretaria na UI

### 4.1 SecretariaContext (React Context)

Gerenciamento do contexto ativo:

```text
+-----------------------------------------+
|          SecretariaContext              |
+-----------------------------------------+
| - secretariaAtiva: Secretaria | null    |
| - secretariasDisponiveis: Secretaria[]  |
| - setSecretariaAtiva(id)                |
| - loading: boolean                       |
| - userRoles: SecretariaRole[]           |
+-----------------------------------------+
```

### 4.2 Componente SecretariaSelector (Header)

Seletor visivel no header para troca de contexto:

```text
+--------------------------------------------------+
| [Logo] Sistema Municipal    [SME v] [User] [Sair]|
+--------------------------------------------------+
|                                                   |
| Dropdown mostra:                                  |
| - Sigla e nome da secretaria ativa               |
| - Lista de secretarias disponiveis               |
| - Indicador visual do papel do usuario           |
|                                                   |
+--------------------------------------------------+
```

### 4.3 Componente SecretariaBadge

Indicador visual da secretaria ativa em cada pagina:

```text
+------------------------------------------+
| Dashboard                                 |
| [SME] Secretaria Municipal de Educacao   |
+------------------------------------------+
```

---

## Fase 5: Migracao de Dados Existentes

### 5.1 Mapeamento de Secretarias Atuais

| Modulo Atual | Nova Secretaria | Sigla |
|--------------|-----------------|-------|
| Financeiro | Secretaria de Administracao e Financas | SMAF |
| Meio Ambiente | Secretaria de Desenvolvimento e Meio Ambiente | SMDMA |
| Desenvolvimento Social | Secretaria de Assistencia Social | SMAS |
| Cultura, Esporte e Lazer | Secretaria de Cultura, Esporte e Lazer | SMCEL |
| Infraestrutura e Servicos | Secretaria de Infraestrutura | SMINF |
| Saude | Secretaria Municipal de Saude | SMS |
| Educacao | Secretaria Municipal de Educacao | SME |
| Governo | Gabinete do Prefeito | GAB |

### 5.2 Atualizacao de Tabelas Existentes

Tabelas que receberao `secretaria_id`:

```text
Educacao:
  - escolas (ja tem escola_id, vincular via secretaria)
  - metas_educacao -> secretaria_id

Saude:
  - unidades_saude -> secretaria_id
  - metas_saude -> secretaria_id

Financeiro:
  - financial_goals -> secretaria_id

Geral:
  - profiles -> secretaria_id (principal)
  - notifications -> secretaria_id (contexto)
```

### 5.3 Migracao de Roles Existentes

```text
user_education_roles -> user_secretaria_roles
  - role: 'secretaria' -> 'secretario' + secretaria_id = SME
  - role: 'diretor' -> 'diretor' + unidade_id = escola

user_health_roles -> user_secretaria_roles
  - role: 'secretaria_saude' -> 'secretario' + secretaria_id = SMS
  - role: 'diretor_unidade' -> 'diretor' + unidade_id = unidade
```

---

## Fase 6: Estrutura de Arquivos

### 6.1 Novos Arquivos a Criar

```text
src/
  contexts/
    SecretariaContext.tsx          # Contexto de secretaria
  
  hooks/
    useSecretarias.ts              # CRUD secretarias
    useUnidadesAdministrativas.ts  # CRUD unidades
    useMunicipios.ts               # CRUD municipios
    useExerciciosFinanceiros.ts    # CRUD exercicios
    useFeriados.ts                 # CRUD feriados
    useSecretariaContext.ts        # Acesso ao contexto
  
  components/
    secretaria/
      SecretariaSelector.tsx       # Seletor no header
      SecretariaBadge.tsx          # Badge de contexto
      SecretariaDialog.tsx         # Dialog CRUD
      UnidadeAdministrativaTree.tsx # Arvore hierarquica
    
    municipio/
      MunicipioForm.tsx            # Cadastro municipio
      ExercicioFinanceiroList.tsx  # Lista exercicios
      FeriadosCalendario.tsx       # Calendario feriados
  
  pages/
    Administracao.tsx              # Pagina administrativa
    SecretariasGestao.tsx          # Gestao de secretarias
    MunicipioConfig.tsx            # Configuracao municipio
```

### 6.2 Alteracoes em Arquivos Existentes

```text
src/components/layout/
  Sidebar.tsx                      # Sidebar dinamico por secretaria
  Layout.tsx                       # Adicionar SecretariaSelector

src/contexts/
  AuthContext.tsx                  # Integrar contexto de secretaria

src/App.tsx                        # Adicionar SecretariaProvider
```

---

## Fase 7: Politicas RLS

### 7.1 Estrategia de Seguranca

```text
+-------------------------------------------+
|        Hierarquia de Acesso               |
+-------------------------------------------+
| 1. Admin Municipal -> Acesso total        |
| 2. Secretario -> Acesso a sua secretaria  |
| 3. Diretor -> Acesso a sua unidade        |
| 4. Servidor -> Acesso limitado            |
+-------------------------------------------+
```

### 7.2 Funcoes de Validacao

- `is_admin_municipal(user_id)` - Verifica se e admin
- `has_secretaria_access(user_id, secretaria_id)` - Acesso a secretaria
- `get_user_secretarias(user_id)` - Lista secretarias do usuario
- `can_manage_unidade(user_id, unidade_id)` - Pode gerenciar unidade

---

## Secao Tecnica

### Migracao SQL Principal

A migracao criara:

1. **Enums**: `secretaria_tipo`, `secretaria_role`, `exercicio_status`, `periodo_tipo`, `feriado_tipo`, `unidade_tipo`

2. **Tabelas Base**:
   - `municipios` com constraint UNIQUE em codigo_ibge
   - `exercicios_financeiros` com constraint UNIQUE (municipio_id, ano)
   - `periodos_fiscais` vinculados ao exercicio
   - `feriados` com suporte a recorrencia

3. **Tabelas de Secretaria**:
   - `secretarias` com todos os campos especificados
   - `secretarias_historico` para auditoria
   - `unidades_administrativas` com auto-referencia hierarquica

4. **Sistema de Roles**:
   - `user_secretaria_roles` com constraints de unicidade
   - Funcoes SECURITY DEFINER para validacao

5. **Triggers**:
   - `updated_at` automatico em todas as tabelas
   - Trigger de historico para alteracoes em secretarias

6. **RLS Policies**:
   - Politicas baseadas em contexto de secretaria
   - Admin municipal com acesso total
   - Secretarios com acesso a sua secretaria
   - Servidores com acesso a sua unidade

### Integracao com Sistema Existente

- Manter compatibilidade com `user_education_roles` e `user_health_roles`
- Criar views de compatibilidade se necessario
- Migracao gradual dos dados existentes
- Seed inicial do municipio e secretarias padrao

### Consideracoes de Performance

- Indices em `secretaria_id` em todas as tabelas relacionadas
- Indice composto em `user_secretaria_roles (user_id, secretaria_id)`
- Materialized views para hierarquia de unidades se necessario
