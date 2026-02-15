
# Resumo Completo do Sistema de Gestao Municipal

## 10 Secretarias Cadastradas

| # | Sigla | Secretaria | Status |
|---|-------|-----------|--------|
| 1 | SMF | Sec. Municipal de Financas | Implementada |
| 2 | SME | Sec. Municipal de Educacao | Implementada |
| 3 | SMS | Sec. Municipal de Saude | Implementada |
| 4 | SMISP | Sec. Municipal de Infraestrutura e Servicos Publicos | Implementada |
| 5 | SMDS | Sec. Municipal de Desenvolvimento Social | Implementada |
| 6 | SMMA | Sec. Municipal de Meio Ambiente | Implementada |
| 7 | SMCEL | Sec. Municipal de Cultura, Esporte e Lazer | Implementada |
| 8 | SMTT | Sec. Municipal de Transportes e Transito | Implementada |
| 9 | SMAPA | Sec. Municipal de Agricultura, Pecuaria e Abastecimento | Implementada |
| 10 | SMG | Sec. Municipal de Governo | Implementada |

---

## Modulos Administrativos (Acesso Admin/Prefeito)

| Modulo | Rota | Funcionalidades |
|--------|------|-----------------|
| RH e Permissoes | /admin/rh | 10 abas: Central RH, Servidores, Cargos, Funcoes, Folha de Pagamento, Frequencia/Ponto, Ferias/Licencas, Processos Trabalhistas, Relatorios Legais, Permissoes |
| Auditoria | /admin/auditoria | Timeline imutavel com hash SHA-256, comparacao de versoes, reversoes controladas |
| Controladoria/Juridico | /controladoria | Processos Administrativos, Analise de Contratos, Consultoria Juridica |
| Gabinete do Prefeito | /gabinete-prefeito | Dashboard Estrategico, Agenda Governamental, Metas do Plano de Governo, Obras Prioritarias, Atos Administrativos, Comunicacao Institucional, Relatorios Executivos |

---

## Funcionalidades por Secretaria

### 1. SMF - Financas
**Rotas:** /gestao-financeira-publica, /arrecadacao-tributaria, /financeiro, /financeiro/relatorios, /contratos/pagamentos, /compras/licitacoes

| Aba/Modulo | Descricao |
|------------|-----------|
| Execucao Orcamentaria | Empenhos, Liquidacoes, Ordens de Pagamento |
| PPA/LDO/LOA | Planejamento orcamentario completo |
| Convenios | Gestao de convenios |
| Classificacoes | Naturezas de despesa, fontes de recursos, funcoes/subfuncoes |
| IPTU | Cadastro imobiliario, lancamento anual, cobranca, revisoes, portal cidadao, relatorios |
| ISS | Declaracoes, fiscalizacao, lista de servicos, NFS-e, relatorios |
| Divida Ativa | Gestao de dividas |
| Parcelamentos | Controle de parcelamentos |
| Contribuintes | Cadastro de contribuintes |
| Contratos | Formulario, listagem, metas, pagamentos |
| Compras/Licitacoes | Licitacoes, fornecedores |
| Dashboard | Sim |
| Vinculacao RH | NAO IMPLEMENTADA |

### 2. SME - Educacao
**Rota:** /educacao/gestao

| Aba/Modulo | Descricao |
|------------|-----------|
| Dashboard Educacional | KPIs consolidados |
| Sistema Academico | Escolas, turmas, alunos, professores |
| Matriculas | Solicitacoes online + gestao interna |
| Transferencias | Entre escolas |
| Historico Escolar | Visualizacao e emissao |
| Notas | Lancamento avancado e em lote |
| Faltas | Gestao e alertas |
| Cadastro | Escolas, professores, funcionarios |
| Alertas | Sistema automatizado de alertas educacionais |
| Transporte Escolar | Rotas, veiculos, alunos vinculados |
| Merenda | Cardapios, estoque, restricoes alimentares |
| Relatorios | Diversos relatorios |
| Planejamento | Estrategico educacional |
| Indicadores | Indicadores educacionais |
| Papeis | Administracao de papeis educacionais |
| Portal do Responsavel | Login separado, notas, faltas, cardapio (/portal-responsavel) |
| Matricula Online Publica | Formulario publico (/matricula-online) |
| Vinculacao RH | SIM (Professores e Funcionarios via VincularUsuarioRH) |

### 3. SMS - Saude
**Rotas:** /saude/gestao, /saude/atendimento

| Aba/Modulo | Descricao |
|------------|-----------|
| Pacientes | Cadastro completo |
| Unidades de Saude | Cadastro de UBS, hospitais, etc. |
| Profissionais | Vinculacao de medicos/enfermeiros com conselho |
| TFD | Solicitacao de viagens para tratamento fora do domicilio |
| Indicadores | Monitoramento de indicadores de saude |
| Metas | Metas de saude publica |
| Atendimento | Prontuario eletronico, agendamento, tratamentos, satisfacao |
| Dashboard | NAO implementado como aba separada |
| Vinculacao RH | SIM (Profissionais de Saude via VincularUsuarioRH) |

### 4. SMISP - Infraestrutura e Servicos
**Rotas:** /infraestrutura/obras, /infraestrutura/manutencao

| Aba/Modulo | Descricao |
|------------|-----------|
| Dashboard Infraestrutura | KPIs de obras e iluminacao |
| Cadastro de Obras | Registro e controle |
| Acompanhamento de Obras | Monitoramento e documentacao |
| Metas de Obras | Metas de conclusao |
| Sistema de Chamadas | Solicitacoes de manutencao |
| Iluminacao Publica | Pontos de luz e solicitacoes de reparo |
| Metas de Manutencao | Metas de servicos |
| Vinculacao RH | NAO IMPLEMENTADA |

### 5. SMDS - Desenvolvimento Social
**Rota:** /social/programas

| Aba/Modulo | Descricao |
|------------|-----------|
| Dashboard Social | KPIs do social |
| CRAS/CREAS | Cadastro de unidades socioassistenciais |
| CadUnico | Cadastro Unico de familias |
| Atendimentos | Registro de atendimentos sociais |
| Visitas Domiciliares | Controle de visitas |
| Beneficiarios | Cadastro e gestao |
| Programas | Acompanhamento de programas sociais |
| Metas | Metas de beneficiarios |
| Vinculacao RH | NAO IMPLEMENTADA |

### 6. SMMA - Meio Ambiente
**Rota:** /desenvolvimento/ambiental

| Aba/Modulo | Descricao |
|------------|-----------|
| Dashboard Ambiental | KPIs ambientais |
| Programas de Sustentabilidade | CRUD completo |
| Metas Ambientais | Acompanhamento quantitativo |
| Licenciamento Ambiental | LP, LI, LO com validade e pareceres |
| Denuncias | Fiscalizacao ambiental com protocolo |
| Empreendimentos | Gestao de empresas/empreendimentos |
| Vinculacao RH | NAO IMPLEMENTADA |

### 7. SMCEL - Cultura, Esporte e Lazer
**Rotas:** /cultura/projetos, /cultura/incentivos, /cultura/infraestrutura, /turismo-cultura

| Aba/Modulo | Descricao |
|------------|-----------|
| Projetos e Eventos | CRUD de projetos culturais, calendario de eventos |
| Editais | Gestao de editais culturais |
| Incentivos | Programas de incentivo, metas |
| Infraestrutura Cultural | Espacos culturais, reservas/agendamentos |
| Turismo - Dashboard | KPIs de turismo |
| Turismo - Pontos | Pontos turisticos |
| Turismo - Roteiros | Roteiros turisticos |
| Turismo - Parceiros | Parceiros do turismo |
| Turismo - Indicadores | Indicadores de visitacao |
| Vinculacao RH | NAO IMPLEMENTADA |

### 8. SMTT - Transportes e Transito
**Rota:** /transportes

| Aba/Modulo | Descricao |
|------------|-----------|
| Dashboard | KPIs de frota e motoristas |
| Frota | Gestao da frota municipal |
| Motoristas | Cadastro e vinculacao |
| TFD | Designacao de veiculos para viagens medicas |
| Transporte Publico | Gestao de transporte publico |
| Transito | Gestao de transito |
| Vinculacao RH | SIM (Motoristas via VincularUsuarioRH) |

### 9. SMAPA - Agricultura
**Rota:** /agricultura

| Aba/Modulo | Descricao |
|------------|-----------|
| Dashboard | KPIs rurais |
| Produtores Rurais | Cadastro |
| Propriedades Rurais | Registro |
| Assistencia Tecnica | Visitas e orientacoes |
| Programas de Incentivo Rural | Incentivos ao produtor |
| Feiras Livres | Gestao de feiras |
| Vinculacao RH | NAO IMPLEMENTADA |

### 10. SMG - Governo
**Rotas:** /governo/politicas, /governo/transparencia, /governo/ouvidoria

| Aba/Modulo | Descricao |
|------------|-----------|
| Cadastro de Politicas Publicas | CRUD |
| Acompanhamento de Politicas | Monitoramento |
| Metas de Politicas | Metas e indicadores |
| Transparencia | Portal de transparencia e publicacao de relatorios |
| Ouvidoria Municipal | Manifestacoes do cidadao com protocolo |
| Vinculacao RH | NAO IMPLEMENTADA |

---

## Integracoes Entre Secretarias

| Integracao | Secretarias Envolvidas | Status |
|-----------|----------------------|--------|
| TFD (Tratamento Fora do Domicilio) | SMS (Saude) cria solicitacao -> SMTT (Transportes) designa veiculos/motoristas | IMPLEMENTADA |
| Identidade Centralizada (RH) | RH -> Todas as secretarias (via VincularUsuarioRH) | PARCIAL (ver abaixo) |
| Transporte Escolar | SME (Educacao) gerencia rotas e veiculos escolares | IMPLEMENTADA (interno) |
| Gabinete do Prefeito | Consolida KPIs de todas as secretarias | IMPLEMENTADA |
| Auditoria Global | Registra acoes de todos os modulos | IMPLEMENTADA |

---

## Status da Vinculacao de Funcionarios (VincularUsuarioRH)

| Secretaria | Vinculacao Implementada? | Cargos/Funcoes Especificos |
|-----------|------------------------|---------------------------|
| SME - Educacao | SIM | Professores, Coordenadores, Funcionarios |
| SMS - Saude | SIM | Profissionais de Saude (CRM, COREN, etc.) |
| SMTT - Transportes | SIM | Motoristas (CNH, categoria) |
| SMF - Financas | NAO | Precisa criar |
| SMISP - Infraestrutura | NAO | Precisa criar (engenheiros, fiscais) |
| SMDS - Social | NAO | Precisa criar (assistentes sociais) |
| SMMA - Meio Ambiente | NAO | Precisa criar (fiscais ambientais) |
| SMCEL - Cultura | NAO | Precisa criar (produtores culturais) |
| SMAPA - Agricultura | NAO | Precisa criar (tecnicos agricolas) |
| SMG - Governo | NAO | Precisa criar (assessores) |

---

## O Que Falta Para Apresentar aos Secretarios

### Prioridade Alta (Bloqueante para uso)

1. **Regras de Acesso Prefeito/RH** -- Ainda nao implementada a restricao do RH (so acessa modulo RH), nem a regra de que Admin cadastra Prefeito mas Admin nao aparece no RH
2. **Vinculacao de Funcionarios nas 7 secretarias restantes** -- SMF, SMISP, SMDS, SMMA, SMCEL, SMAPA, SMG precisam da integracao com VincularUsuarioRH para que o secretario vincule sua equipe

### Prioridade Media (Melhoria importante)

3. **Dashboards faltantes** -- SMS (Saude) nao tem dashboard como aba dedicada com graficos (tem indicadores separados)
4. **Exportacao PDF/CSV** -- O sistema de exportacao foi criado (ExportButtons), mas precisa ser integrado em todos os modulos que ainda nao o tem
5. **Sistema de Mensagens entre secretarias** -- Existe a tela /mensagens mas precisa validar se funciona entre secretarios

### Prioridade Baixa (Refinamento)

6. **Diario Oficial / Publicacoes** -- Mencionado no roadmap mas nao implementado
7. **Notificacoes automaticas entre secretarias** -- Ex: quando Saude cria TFD, Transporte recebe notificacao
8. **Relatorios consolidados para o Prefeito** -- Dashboard do Gabinete puxa dados reais de todas as secretarias

---

## Secao Tecnica - Arquitetura de Vinculacao

O componente `VincularUsuarioRH` usa a RPC `buscar_usuarios_rh` para pesquisar identidades do RH por nome, CPF, matricula ou email. O fluxo e:

```text
RH cria usuario (Edge Function create-user-rh)
      |
      v
Secretario acessa seu painel
      |
      v
Clica "Vincular Funcionario"
      |
      v
VincularUsuarioRH busca no RH
      |
      v
Seleciona servidor -> preenche dados do cargo setorial
      |
      v
Registro criado na tabela setorial (ex: profissionais_saude, motoristas, professores)
```

Para implementar nas 7 secretarias restantes, cada uma precisa de:
- Uma tabela setorial (ou uso direto do vinculo funcional existente)
- Um hook de CRUD
- Integracao do botao "Vincular Funcionario" no painel da secretaria
