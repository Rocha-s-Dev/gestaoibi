

# Plano de Correção: Usuário Admin + Erros de Build

## Visão Geral

Existem dois problemas a resolver:
1. **Login impossível** - O banco está vazio (nenhum usuário existe)
2. **Erros de build** - Componentes educacionais referenciam campos inexistentes no schema

## Parte 1: Criar Usuário Administrador

### O que será feito
Criar o usuário `gabrielrocha725@gmail.com` com role `admin_municipal` (nível mais alto do sistema, acima de prefeito).

### Processo
1. Criar usuário no sistema de autenticação via SQL (não pela interface pois você não consegue logar)
2. Criar registro na tabela `profiles` com dados básicos
3. Atribuir role `admin_municipal` na tabela `user_secretaria_roles`

### SQL de Migração (Resumo)
```sql
-- O usuário será criado diretamente nas tabelas de auth
-- Senha: rocha290307 (hash bcrypt)
-- Role: admin_municipal (acesso total ao sistema)
```

## Parte 2: Corrigir Erros de Build

Os componentes estão usando campos que existem na UI mas não no banco. A estratégia será **simplificar os componentes** para usar apenas os campos que existem.

### Arquivos a Corrigir

| Arquivo | Problema | Solução |
|---------|----------|---------|
| `AlunoDialog.tsx` | Usa `rg`, `genero`, `telefone`, `email`, `turma_atual_id`, `status` | Simplificar formulário para usar apenas campos existentes (`turma_id`, `situacao`) |
| `NovaEscolaDialog.tsx` | Usa `status`, `codigo_mec`, `cnpj`, `capacidade_total`, `tem_*` | Simplificar para usar apenas `capacidade` e campos existentes |
| `CadastroEducacao.tsx` | Usa `status` em Escola e `telefone`/`status` em Aluno | Mudar para campos corretos (`situacao`) |
| `CalendarioEscolar.tsx` | Usa `tipo_evento` | Mudar para usar `tipo` |
| `EventoCalendarioDialog.tsx` | Usa `tipo_evento`, `turmas_especificas` | Simplificar formulário |
| `useHistoricoTransferencias.ts` | Query para tabela `historico_escolar` que não existe, usa `tipo` em transferencias | Usar dados simulados/locais ou remover queries inválidas |
| `BoletimEscolar.tsx` | Usa `turma_atual_id` | Mudar para `turma_id` |
| `DiarioClasse.tsx` | Usa `turma_atual_id` | Mudar para `turma_id` |
| `GestaoNotasAvancada.tsx` | Usa `turma_atual_id` | Mudar para `turma_id` |
| `LancamentoNotasLote.tsx` | Usa `turma_atual_id` | Mudar para `turma_id` |
| `NotaDialog.tsx` | Usa `turma_atual_id` | Mudar para `turma_id` |
| `TransferenciaDialog.tsx` | Usa `turma_atual_id`, `status` | Mudar para `turma_id`, `situacao` |
| `HistoricoEscolarView.tsx` | Usa `status` em Aluno | Mudar para `situacao` |
| `FormularioMatricula.tsx` | Usa `status` em Escola | Remover referência ou usar campo alternativo |
| `DashboardEducacional.tsx` | Usa `capacidade_total` | Mudar para `capacidade` |
| `RelatoriosEducacao.tsx` | Usa `capacidade_total` | Mudar para `capacidade` |

### Mapeamento de Campos

| Campo Antigo (UI) | Campo Correto (DB) |
|-------------------|--------------------|
| `turma_atual_id` | `turma_id` |
| `status` (Aluno) | `situacao` |
| `status` (Escola) | Não existe - remover |
| `capacidade_total` | `capacidade` |
| `tipo_evento` | `tipo` |
| `rg`, `genero`, `telefone`, `email` (Aluno) | Não existem - remover campos do formulário |
| `codigo_mec`, `cnpj`, `cep`, `bairro`, etc (Escola) | Não existem - simplificar formulário |

## Sequência de Execução

1. **Migração SQL** - Criar usuário admin com senha e role
2. **Corrigir hooks** - `useHistoricoTransferencias.ts` (remover queries para tabelas inexistentes)
3. **Corrigir componentes** - Atualizar referências de campos em ordem:
   - Hooks primeiro (`useEducacaoStats` se ainda tiver erros)
   - Diálogos (`AlunoDialog`, `NovaEscolaDialog`, `EventoCalendarioDialog`)
   - Componentes de visualização

## Detalhes Técnicos

### Migração para Criar Admin

```sql
-- Inserir usuário na auth.users (simulando signup)
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data
) VALUES (
  gen_random_uuid(),
  'gabrielrocha725@gmail.com',
  crypt('rocha290307', gen_salt('bf')),
  now(),
  '{"first_name": "Gabriel", "last_name": "Rocha"}'::jsonb
);

-- Criar profile correspondente
INSERT INTO public.profiles (id, email, first_name, last_name, role)
SELECT id, email, 'Gabriel', 'Rocha', 'admin'
FROM auth.users WHERE email = 'gabrielrocha725@gmail.com';

-- Atribuir role admin_municipal
INSERT INTO public.user_secretaria_roles (user_id, role)
SELECT id, 'admin_municipal'::secretaria_role
FROM auth.users WHERE email = 'gabrielrocha725@gmail.com';
```

### Simplificação do AlunoDialog

O formulário será reduzido para usar apenas campos existentes:
- Nome, CPF, Data Nascimento, Endereço
- Número Matrícula, Data Matrícula
- Escola, Turma (usando `turma_id`)
- Situação (usando `situacao`: ativo, transferido, etc.)
- Responsável (nome, telefone, email)

### Simplificação do NovaEscolaDialog

O formulário será reduzido para:
- Nome, Endereço, Telefone, Email
- Diretor, Tipo, Capacidade

## Resultado Esperado

Após a implementação:
1. Você poderá fazer login com `gabrielrocha725@gmail.com` / `rocha290307`
2. Terá acesso como **Admin Municipal** (nível mais alto)
3. Todos os erros de build serão resolvidos
4. A aplicação funcionará com o schema atual do banco

