

# Analise Completa de Funcionalidades por Secretaria

## Visao Geral do Estado Atual vs. Funcionalidades Esperadas

---

## 1. SMF - Secretaria Municipal de Financas

### Implementado
| Funcionalidade | Pagina | Componentes |
|---|---|---|
| Receitas e Despesas (CRUD) | /financeiro | TransactionForm, TransactionList |
| Contratos (CRUD + aditivos) | /financeiro | ContractManagement, ContractForm, ContractList |
| Compras e Licitacoes | /compras/licitacoes | BidDialog, BidForm, BidList |
| Fornecedores (CRUD) | /financeiro | SupplierRegistration, SupplierList |
| Pagamentos de Contratos | /contratos/pagamentos | PaymentTracking, ContractGoals |
| Relatorios Financeiros | /financeiro/relatorios | Graficos Recharts, Metas Financeiras |
| Gestao Financeira Publica | /gestao-financeira-publica | Empenho, Liquidacao, Convenios |
| PPA / LDO / LOA | /gestao-financeira-publica | Planejamento orcamentario |
| Classificacoes Orcamentarias | /gestao-financeira-publica | Naturezas de despesa, fontes, funcoes |
| Restos a Pagar | /gestao-financeira-publica | Controle de inscritos |
| Arrecadacao Tributaria | /arrecadacao-tributaria | Dashboard, IPTU, ISS, Divida Ativa |
| IPTU Completo | /arrecadacao-tributaria | Cadastro imobiliario, lancamento, cobr., revisoes, relatorios, portal |
| ISS/NFS-e Completo | /arrecadacao-tributaria | Declaracoes, NFS-e, fiscalizacao, lista servicos, relatorios |
| Divida Ativa | /arrecadacao-tributaria | Inscricao e gestao |
| Parcelamentos/REFIS | /arrecadacao-tributaria | Programas de regularizacao |
| Fiscalizacao Tributaria | /arrecadacao-tributaria | Ordens de servico |
| Contribuintes | /arrecadacao-tributaria | Cadastro PF/PJ |

### Faltando
| Funcionalidade | Prioridade | Descricao |
|---|---|---|
| Ordens de Pagamento | Alta | Modulo dedicado para emissao e aprovacao de OPs |
| Exportacao PDF/Excel funcional | Media | Botoes existem mas exibem alert() placeholder |
| Integracao Folha-Orcamento | Media | Vincular despesas de pessoal ao empenho automaticamente |
| Conciliacao bancaria automatizada | Media | Leitura de extratos e conciliacao |
| Prestacao de Contas TCE | Alta | Relatorios formatados para o Tribunal de Contas |
| Boleto/PIX real | Baixa | Integracao com gateway (atualmente informativo) |

**Nivel de completude: ~85%**

---

## 2. SMMA - Secretaria de Meio Ambiente

### Implementado
| Funcionalidade | Pagina | Componentes |
|---|---|---|
| Gestao de Empreendimentos | /desenvolvimento/empresas | BusinessRegistration, BusinessList |
| Projetos de Desenvolvimento | /desenvolvimento/empresas | DevelopmentProjectList |
| Metas Economicas | /desenvolvimento/empresas | EconomicGoalsList |
| Programas de Sustentabilidade | /desenvolvimento/ambiental | ProgramasSustentabilidade (CRUD) |
| Metas Ambientais | /desenvolvimento/ambiental | MetasAmbientais (CRUD) |

### Faltando
| Funcionalidade | Prioridade | Descricao |
|---|---|---|
| Licenciamento Ambiental | Critica | Fluxo de solicitacao, analise e emissao de licencas (LP, LI, LO) |
| Fiscalizacao Ambiental | Alta | Autos de infracao, multas, embargo |
| Denuncias Ambientais | Alta | Canal de denuncias com protocolo e acompanhamento |
| Areas de Preservacao | Media | Cadastro de APPs, reservas legais, unidades de conservacao |
| Monitoramento de Qualidade | Media | Ar, agua, solo - indicadores ambientais |
| Educacao Ambiental | Baixa | Campanhas e acoes educativas |
| Arvores Urbanas / Podas | Media | Cadastro e solicitacoes de poda/supressao |
| Coleta Seletiva | Media | Gestao de pontos de coleta, reciclagem |
| Dashboard Ambiental | Alta | Painel com indicadores consolidados |

**Nivel de completude: ~25%**

---

## 3. SMDS - Secretaria de Desenvolvimento Social

### Implementado
| Funcionalidade | Pagina | Componentes |
|---|---|---|
| Cadastro de Beneficiarios | /social/programas | BeneficiariosList, BeneficiarioDialog |
| Acompanhamento de Programas | /social/programas | AcompanhamentoProgramas |
| Metas de Beneficiarios | /social/programas | MetasBeneficiarios |

### Faltando
| Funcionalidade | Prioridade | Descricao |
|---|---|---|
| CadUnico Municipal | Critica | Integracao/espelhamento do Cadastro Unico federal |
| CRAS/CREAS | Critica | Cadastro de unidades e servicos socioassistenciais |
| Atendimento Social | Alta | Registro de atendimentos individuais e familiares |
| Visitas Domiciliares | Alta | Agendamento e registro de visitas |
| Encaminhamentos | Alta | Rede de encaminhamento entre servicos |
| Bolsa Familia / Aux. Brasil | Alta | Acompanhamento de condicionalidades |
| Conselho Tutelar | Media | Integracao com demandas do conselho |
| Acolhimento Institucional | Media | Gestao de abrigos e casas de passagem |
| Servico de Convivencia | Media | SCFV - Grupos e oficinas |
| Dashboard Social | Alta | Indicadores de vulnerabilidade e cobertura |
| Relatorios MDS | Alta | Relatorios para o Ministerio (RMA, PMA) |

**Nivel de completude: ~20%**

---

## 4. SMCEL - Cultura, Esporte e Lazer

### Implementado
| Funcionalidade | Pagina | Componentes |
|---|---|---|
| Projetos Culturais/Esportivos | /cultura/projetos | ProjetosList, ProjetoDialog, CalendarioEventos |
| Metas de Projetos | /cultura/projetos | MetasProjetos |
| Editais de Incentivo | /cultura/incentivos | GestaoEditais, EditalDialog |
| Metas de Incentivo | /cultura/incentivos | MetasIncentivo |
| Espacos Culturais/Esportivos | /cultura/infraestrutura | EspacosCulturais, EspacoCulturalDialog |
| Reservas e Agendamentos | /cultura/infraestrutura | ReservasAgendamentos, ReservaDialog |
| Turismo - Pontos Turisticos | /turismo-cultura | Listagem (sem CRUD completo) |
| Turismo - Roteiros | /turismo-cultura | Listagem (sem CRUD completo) |
| Turismo - Parceiros | /turismo-cultura | Listagem (sem CRUD completo) |
| Turismo - Indicadores | /turismo-cultura | Listagem (sem CRUD completo) |

### Faltando
| Funcionalidade | Prioridade | Descricao |
|---|---|---|
| Turismo CRUD completo | Alta | Pontos turisticos, roteiros e parceiros so exibem contagem, sem formularios |
| Patrimonio Cultural | Media | Cadastro de bens tombados e patrimonio imaterial |
| Calendario Unificado | Media | Agenda publica de eventos culturais e esportivos |
| Competicoes Esportivas | Media | Cadastro de campeonatos, chaves, resultados |
| Biblioteca Municipal | Baixa | Acervo, emprestimos, devolucoes |
| Artistas e Grupos Culturais | Media | Cadastro de artistas e coletivos |
| Lei de Incentivo (Aldir Blanc, etc.) | Media | Gestao de editais federais |
| Dashboard Cultural | Alta | Indicadores de acesso e participacao |

**Nivel de completude: ~55%**

---

## 5. SMTT - Transportes e Transito

### Implementado
| Funcionalidade | Pagina | Componentes |
|---|---|---|
| Gestao de Frota | /transportes | GestaoFrota |
| Gestao de Motoristas | /transportes | GestaoMotoristas |
| Transporte Publico | /transportes | TransportePublicoTab |
| Transito | /transportes | TransitoTab |

### Faltando
| Funcionalidade | Prioridade | Descricao |
|---|---|---|
| Manutencao de Veiculos | Alta | Agendamento, historico de manutencoes, custos por veiculo |
| Abastecimento | Alta | Controle de combustivel por veiculo |
| Sinalizacao Viaria | Media | Cadastro de placas, semaforos, faixas |
| Autorizacoes de Transporte | Media | Alvaras de taxi, mototaxi, escolar privado |
| Acidentes de Transito | Media | Registro e estatisticas de acidentes |
| Dashboard de Frota | Alta | KPIs de consumo, km rodados, custos |
| Multas e Infracoes | Media | Registro e gestao de multas municipais |
| Itinerarios de Onibus | Media | Gestao de linhas e horarios |

**Nivel de completude: ~45%**

---

## 6. SMAPA - Agricultura, Pecuaria e Abastecimento

### Implementado
| Funcionalidade | Pagina | Componentes |
|---|---|---|
| Produtores Rurais | /agricultura | ProdutoresRurais |
| Propriedades Rurais | /agricultura | PropriedadesRurais |
| Assistencia Tecnica | /agricultura | AssistenciaTecnica |
| Programas de Incentivo Rural | /agricultura | ProgramasIncentivoRural |
| Feiras Livres | /agricultura | FeirasLivres |

### Faltando
| Funcionalidade | Prioridade | Descricao |
|---|---|---|
| Defesa Animal/Sanitaria | Media | Cadastro de rebanho, vacinacao, GTA |
| Maquinario Agricola | Alta | Cadastro e agendamento de uso de maquinas |
| Abastecimento/CEASA | Media | Controle de abastecimento municipal |
| DAP/CAF | Media | Declaracao de Aptidao ao Pronaf |
| Producao e Safra | Media | Registro de producao por cultura/safra |
| Dashboard Agricola | Alta | Indicadores de producao, area plantada |
| Credito Rural | Baixa | Orientacao sobre linhas de credito |

**Nivel de completude: ~55%**

---

## 7. SMISP - Infraestrutura e Servicos Publicos

### Implementado
| Funcionalidade | Pagina | Componentes |
|---|---|---|
| Cadastro de Obras | /infraestrutura/obras | CadastroObras, ObraDialog |
| Acompanhamento de Obras | /infraestrutura/obras | AcompanhamentoObras, AcompanhamentoDialog |
| Metas de Obras | /infraestrutura/obras | MetasObras, MetaObraDialog |
| Sistema de Chamadas | /infraestrutura/manutencao | SistemaChamadas, ChamadaDialog |
| Metas de Manutencao | /infraestrutura/manutencao | MetasManutencao, MetaManutencaoDialog |

### Faltando
| Funcionalidade | Prioridade | Descricao |
|---|---|---|
| Iluminacao Publica | Alta | Cadastro de pontos, solicitacoes de reparo, COSIP |
| Limpeza Urbana | Alta | Roteiros de coleta, varrimento, capina |
| Pavimentacao | Media | Cadastro de vias, condicao, recapeamento |
| Drenagem e Saneamento | Media | Galerias, bocas de lobo, pontos de alagamento |
| Cemiterios | Baixa | Cadastro de sepulturas, concessoes |
| Predios Publicos | Media | Cadastro de imoveis, manutencao predial |
| Medicoes de Obras | Alta | Boletins de medicao vinculados a contratos |
| Fiscalizacao de Obras | Alta | Diario de obra, laudos, acompanhamento fotografico |
| Dashboard de Infraestrutura | Alta | Indicadores de servicos e obras |

**Nivel de completude: ~40%**

---

## 8. SMS - Secretaria Municipal de Saude

### Implementado
| Funcionalidade | Pagina | Componentes |
|---|---|---|
| Unidades de Saude (CRUD) | /saude/gestao | CadastroUnidadesSaude, UnidadeSaudeDialog |
| Profissionais de Saude (vinculo RH) | /saude/gestao | VincularUsuarioRH + formulario complementar |
| Indicadores de Saude | /saude/gestao | MonitoramentoIndicadores |
| Metas de Saude Publica | /saude/gestao | MetasSaudePublica, MetaSaudeDialog |
| Satisfacao do Paciente | /saude/atendimento | SatisfacaoPaciente, PesquisaSatisfacaoDialog |
| Acompanhamento de Tratamentos | /saude/atendimento | AcompanhamentoTratamentos, TratamentoDialog |

### Faltando
| Funcionalidade | Prioridade | Descricao |
|---|---|---|
| Prontuario Eletronico (PEP) | Critica | Registro clinico de pacientes, historico medico |
| Agendamento de Consultas | Critica | Fila de espera, marcacao online, confirmacao |
| Estoque de Medicamentos | Alta | Farmacia basica, controle de lotes e validade |
| Vacinacao | Alta | Caderneta de vacinacao, campanhas, cobertura |
| Vigilancia Epidemiologica | Alta | Notificacoes compulsorias, surtos, indicadores |
| Vigilancia Sanitaria | Alta | Alvaras, fiscalizacao de estabelecimentos |
| SAMU / Urgencia | Media | Registro de ocorrencias, despacho |
| ESF / ACS | Alta | Estrategia Saude da Familia, visitas domiciliares |
| Regulacao | Alta | Central de regulacao de leitos, exames, consultas especializadas |
| Cadastro de Pacientes | Critica | Base de pacientes com CNS (Cartao SUS) |
| Dashboard de Saude | Alta | Indicadores e-SUS, cobertura vacinal, mortalidade |
| Relatorios SUS | Alta | BPA, FPO, RAAS para faturamento SUS |

**Nivel de completude: ~25%**

---

## 9. SME - Secretaria Municipal de Educacao

### Implementado
| Funcionalidade | Pagina | Componentes |
|---|---|---|
| Dashboard Educacional | /educacao/gestao | DashboardEducacional |
| Sistema Academico | /educacao/gestao | SistemaAcademico, DiarioClasse, BoletimEscolar |
| Matriculas Online | /educacao/gestao + /matricula | GestaoSolicitacoesMatricula, FormularioMatricula |
| Transferencias | /educacao/gestao | GestaoTransferencias |
| Historico Escolar | /educacao/gestao | HistoricoEscolarView |
| Notas Avancadas | /educacao/gestao | GestaoNotasAvancada, LancamentoNotasLote |
| Faltas | /educacao/gestao | GestaoFaltas |
| Cadastro (Escolas, Turmas, Alunos, Prof.) | /educacao/gestao | CadastroEducacao |
| Alertas Educacionais | /educacao/gestao | AlertasEducacionais + Edge Function |
| Transporte Escolar | /educacao/gestao | GestaoTransporte, RotaDialog, VeiculoDialog |
| Merenda Escolar | /educacao/gestao | GestaoMerenda, CardapioDialog, EstoqueDialog |
| Relatorios | /educacao/gestao | RelatoriosEducacao |
| Planejamento Estrategico | /educacao/gestao | PlanejamentoEducacao |
| Indicadores (IDEB, etc.) | /educacao/gestao | IndicadoresEducacionais |
| Papeis Administrativos | /educacao/gestao | AdminPapeisEducacionais |
| Portal do Responsavel | /portal-responsavel | Notas, Faltas, Cardapio, Documentos |
| Calendario Escolar | incluso | CalendarioEscolar, Feriados |

### Faltando
| Funcionalidade | Prioridade | Descricao |
|---|---|---|
| Censo Escolar / Educacenso | Media | Exportacao de dados no formato MEC |
| Formacao Continuada | Media | Cursos e capacitacoes para professores |
| Biblioteca Escolar | Baixa | Acervo por escola |
| FUNDEB | Media | Acompanhamento de recursos do FUNDEB |

**Nivel de completude: ~90%**

---

## 10. SMG - Secretaria Municipal de Governo

### Implementado
| Funcionalidade | Pagina | Componentes |
|---|---|---|
| Cadastro de Politicas Publicas | /governo/politicas | CadastroPoliticas, PoliticaDialog |
| Acompanhamento de Politicas | /governo/politicas | AcompanhamentoPoliticas |
| Metas de Politicas Publicas | /governo/politicas | MetasPoliticasPublicas, MetaPoliticaDialog |
| Publicacao de Relatorios | /governo/transparencia | PublicacaoRelatorios, RelatorioDialog |
| Portal da Transparencia | /governo/transparencia | PortalTransparencia, InformacaoDialog |
| Gabinete do Prefeito | /gabinete-prefeito | Dashboard, Agenda, Metas, Obras, Atos, Comunicacao, Relatorios |

### Faltando
| Funcionalidade | Prioridade | Descricao |
|---|---|---|
| Diario Oficial Eletronico | Alta | Publicacao oficial de decretos, portarias, leis |
| Ouvidoria Municipal | Alta | Canal de reclamacoes, sugestoes, denuncias com protocolo |
| Protocolo Geral | Alta | Protocolo e tramitacao de documentos internos |
| Gestao de Convenios (governo) | Media | Convenios com estado e uniao |
| Relacoes Institucionais | Baixa | Gestao de agendas com outras esferas de governo |
| LAI - Lei de Acesso a Informacao | Alta | Pedidos e respostas de acesso a informacao |
| Legislacao Municipal | Media | Base de leis, decretos e portarias vigentes |

**Nivel de completude: ~50%**

---

## Resumo Comparativo

```text
+--------------------------------------+-------------+
| Secretaria                           | Completude  |
+--------------------------------------+-------------+
| SMF  - Financas                      |     85%     |
| SMMA - Meio Ambiente                 |     25%     |
| SMDS - Desenvolvimento Social        |     20%     |
| SMCEL - Cultura, Esporte e Lazer     |     55%     |
| SMTT - Transportes e Transito        |     45%     |
| SMAPA - Agricultura                  |     55%     |
| SMISP - Infraestrutura              |     40%     |
| SMS  - Saude                         |     25%     |
| SME  - Educacao                      |     90%     |
| SMG  - Governo                       |     50%     |
+--------------------------------------+-------------+
| MEDIA GERAL                          |     49%     |
+--------------------------------------+-------------+
```

## Prioridades Criticas (funcionalidades essenciais ausentes)

1. **Saude**: Prontuario eletronico, agendamento de consultas, cadastro de pacientes
2. **Social**: CadUnico, CRAS/CREAS, atendimento social
3. **Meio Ambiente**: Licenciamento ambiental, fiscalizacao
4. **Governo**: Diario Oficial, Ouvidoria, Protocolo Geral
5. **Infraestrutura**: Iluminacao publica, medicoes de obra
6. **Transportes**: Manutencao/abastecimento de veiculos

## Proximos Passos Sugeridos

A implementacao pode ser organizada em ondas de prioridade:

- **Onda 1** (Critica): Saude (PEP + Agendamento + Pacientes), Social (CRAS + CadUnico), Meio Ambiente (Licenciamento)
- **Onda 2** (Alta): Governo (Diario Oficial + Ouvidoria), Infraestrutura (Iluminacao + Medicoes), Transportes (Manutencao)
- **Onda 3** (Media): Completar CRUD de Turismo, Dashboard em todas as secretarias, Relatorios padronizados
- **Onda 4** (Refinamento): Integracoes entre modulos, exportacoes reais, dashboards consolidados

