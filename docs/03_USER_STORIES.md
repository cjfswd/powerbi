# User Stories Detalhadas - HealthMais Dashboard

---

## 🔐 Epic 1: Autenticação (PB-001 a PB-005)

### US-001: Login com Email/Senha

```gherkin
Feature: Autenticação de Usuário
  Scenario: Login bem-sucedido
    Given usuário está na página de login
    When insere email válido e senha correta
    Then redireciona para dashboard
    And token JWT é armazenado no localStorage
    And sessão dura 24 horas

  Scenario: Login com falha
    Given usuário está na página de login
    When insere email/senha incorretos
    Then exibe mensagem de erro
    And campo de senha é limpo
    And contador de tentativas incrementa

  Scenario: Limite de tentativas
    When usuário tenta login 5x sem sucesso
    Then conta é bloqueada por 15 minutos
    And email de alerta é enviado
```

**Critérios de Aceitação:**
- ✅ Campo email com validação RFC5322
- ✅ Campo senha com mínimo 8 caracteres
- ✅ Botão "Esqueci Minha Senha"
- ✅ Checkbox "Manter-me conectado"
- ✅ ReCAPTCHA após 3 tentativas falhadas
- ✅ Tempo de resposta < 500ms

**Pontos:** 8
**Sprint:** 0
**Responsável:** Backend Lead

---

### US-002: Recuperação de Senha

```gherkin
Scenario: Solicitar reset de senha
  When clico em "Esqueci Minha Senha"
  Then exibe campo de email
  And após submit, exibe "Email enviado"
  And email contém link com token (validade: 1h)

Scenario: Reset de senha
  When clico no link do email
  Then exibe formulário com nova senha
  And valida força da senha
  And após confirm, limpa sessions antigas
  And redireciona para login
```

**Critérios de Aceitação:**
- ✅ Email com link seguro (HTTPS only)
- ✅ Token com expiração
- ✅ Validação de força de senha (zxcvbn)
- ✅ Confirmação de nova senha
- ✅ Notificação de sucesso

**Pontos:** 5

---

## 🔐 Epic 2: PBAC - Policy Based Access Control

### US-006: Definir Roles

```gherkin
Feature: Gestão de Roles
  Scenario: Criar role básica
    Given sou admin logado
    When acesso "Gerenciar Roles"
    And defino:
      | Role | Descrição | Permissões |
      | ADMIN | Acesso total | * |
      | MANAGER | Gestor de Unidade | view_all, edit_reports |
      | USER | Visualizador | view_own |
    Then roles são salvos no banco
    And aparecem na dropdown de atribuição

  Scenario: Atualizar permissões de role
    When edito MANAGER role
    And adiciono permissão "delete_reports"
    Then atualiza imediatamente
    And 50 usuários com MANAGER recebem nova permissão
    And auditoria registra mudança
```

**Critérios de Aceitação:**
- ✅ 3 roles default: ADMIN, MANAGER, USER
- ✅ Criar/editar roles customizadas
- ✅ Herança de permissões
- ✅ Auditoria completa de mudanças
- ✅ Backups automáticos

**Pontos:** 8

---

### US-007: Atribuir Permissões por Atributo

```gherkin
Feature: PBAC Dinâmico
  Scenario: Criar política PBAC
    Given estou na seção "Políticas"
    When defino uma política:
      | Campo | Operador | Valor |
      | department | = | Cardiologia |
      | hospital_id | in | [1,2,3] |
      | role | = | MANAGER |
    Then política é aplicada
    And usuário com esses atributos tem acesso

  Scenario: Visualizar dados filtrados
    Given usuário logado com departamento=Cardiologia
    When acessa dashboard
    Then visualiza APENAS dados de Cardiologia
    And não vê dados de outros departamentos
```

**Critérios de Aceitação:**
- ✅ Interface visual de construção de políticas
- ✅ Operadores: =, !=, in, not_in, contains
- ✅ Suporte a até 10 atributos por política
- ✅ Teste de política antes de deploy
- ✅ Versionamento de políticas

**Pontos:** 13

---

### US-008: Visualizar Dados Conforme PBAC

```gherkin
Feature: Aplicação de PBAC nos Dados
  Scenario: Filtro automático de dados
    Given usuário com PBAC department=Pediatria
    When carrega dashboard
    Then gráficos mostram APENAS dados de Pediatria
    And relatórios filtrados automaticamente
    And filtros não podem ser alterados

  Scenario: Acesso negado
    When usuário tenta acessar dados fora seu PBAC
    Then retorna 403 Forbidden
    And loga tentativa de acesso
    And notifica admin
```

**Critérios de Aceitação:**
- ✅ Filtro aplicado na query do banco (server-side)
- ✅ Sem permissão = sem dados (nunca cliente faz filtro)
- ✅ Auditoria de tentativas de acesso negado
- ✅ Cache respeitando PBAC

**Pontos:** 13

---

## 📊 Epic 3: Dashboard Principal

### US-011: KPIs Principais (5 Gráficos)

```gherkin
Feature: Dashboard Principal
  Scenario: Visualizar 5 KPIs
    Given usuário logado
    When acessa dashboard
    Then exibe:
      | Gráfico | Tipo | Métrica |
      | 1 | Gauge | Taxa de Ocupação (%) |
      | 2 | LineChart | Faturamento Mensal (R$) |
      | 3 | BarChart | Pacientes por Departamento |
      | 4 | Pie | Distribuição de Atendimentos |
      | 5 | Number | Total de Pacientes Ativos |
    And cada gráfico mostra período selecionado
    And dados atualizam a cada 30 segundos
```

**Critérios de Aceitação:**
- ✅ 5 gráficos renderizados em < 2 segundos
- ✅ Responsive em mobile, tablet, desktop
- ✅ Cores acessíveis (WCAG AA)
- ✅ Tooltips com informações detalhadas
- ✅ Atualização real-time via WebSocket

**Pontos:** 21

---

### US-012: Filtro por Período

```gherkin
Feature: Filtros Temporais
  Scenario: Selecionar período
    When clico no seletor de datas
    Then exibe opcões:
      - Hoje
      - 7 últimos dias
      - Mês atual
      - Últimos 30 dias
      - Custom (date range picker)
    And após selecionar, dashboard atualiza
    And URL muda para refletir filtro
```

**Critérios de Aceitação:**
- ✅ Atalhos rápidos (hoje, 7d, 30d, 90d)
- ✅ Date range picker customizado
- ✅ Persistir filtro na URL e localStorage
- ✅ Validação de datas (não futuro)

**Pontos:** 8

---

### US-013: Atualização Real-time

```gherkin
Feature: Real-time Updates
  Scenario: WebSocket connection
    Given dashboard aberto
    When novo dado chega no backend
    Then gráfico atualiza sem reload
    And transição suave (1s animation)
    And header mostra "Atualizado em: 14:25"

  Scenario: Reconexão automática
    When conexão WebSocket cai
    Then tenta reconectar a cada 5s
    And após 10 tentativas falhas, exibe alerta
    And botão manual "Reconectar"
```

**Critérios de Aceitação:**
- ✅ WebSocket em vez de polling
- ✅ Reconexão automática com backoff
- ✅ Offline graceful (sem dados, mostra cache)
- ✅ Heartbeat a cada 30s

**Pontos:** 13

---

### US-014: Responsividade Mobile

```gherkin
Feature: Mobile First
  Scenario: Visualizar em mobile
    Given viewport 375x667 (iPhone SE)
    When acesso dashboard
    Then exibe layout:
      - Stack vertical (1 coluna)
      - Gráficos ocupam 100% da largura
      - Filtros acima dos gráficos
      - Menu colapsível
      - Sem scroll horizontal

  Scenario: Touch interactions
    When toco no gráfico
    Then exibe tooltip adaptado
    And pode fazer pinch to zoom
    And deslizar para próxima métrica
```

**Critérios de Aceitação:**
- ✅ CSS Media queries (mobile-first)
- ✅ Touch events (swipe, pinch)
- ✅ Fonte mínima 16px (acessibilidade)
- ✅ Testar em: iPhone, Android, iPad

**Pontos:** 13

---

## 👤 Epic 4: Gestão de Perfis

### US-015: Criar Perfil Personalizado

```gherkin
Feature: Perfis de Usuário
  Scenario: Criar novo perfil
    Given usuário logado
    When acessa "Meus Perfis"
    And clica "Novo Perfil"
    Then exibe formulário:
      - Nome do perfil
      - Seleção de gráficos (checkbox)
      - Ordem dos gráficos (drag-drop)
      - Cores (personalizadas)
      - Compartilhado? (sim/não)
    And após salvar, cria novo perfil
    And pode ativar como default

  Scenario: Carregar perfil
    When clico no nome do perfil na sidebar
    Then dashboard muda imediatamente
    And animação suave de transição
```

**Critérios de Aceitação:**
- ✅ Criar ilimitados perfis por usuário
- ✅ Drag-drop para ordenar gráficos
- ✅ Salvar e carregar perfis
- ✅ Compartilhamento de perfil (código/link)
- ✅ Sincronização em tempo real entre abas

**Pontos:** 13

---

### US-016: Salvar Preferências

```gherkin
Feature: Preferências de Dashboard
  Scenario: Persistir preferências
    Given dashboard customizado
    When mudo:
      - Tema (light/dark)
      - Idioma (PT/EN/ES)
      - Timezone
      - Notificações
    Then preferências salvam automaticamente
    And recuperadas ao recarregar página
    And sincronizadas entre abas
```

**Critérios de Aceitação:**
- ✅ Salvar no servidor + localStorage
- ✅ Sincronização em tempo real
- ✅ Dark mode (CSS variables)
- ✅ Tema por hora do dia (automático)

**Pontos:** 8

---

## 📋 Modelo de User Story Template

Para adicionar novas user stories, use:

```markdown
### US-XXX: [Título]

**Epic:** [Epic Name]

**Como** [tipo de usuário]
**Quero** [ação/funcionalidade]
**Para que** [benefício/valor]

**Critérios de Aceitação:**
- [ ] Critério 1
- [ ] Critério 2
- [ ] Critério 3

**Critérios de Rejeição:**
- [ ] Não aceitar sem...

**Dependências:**
- [ ] US-XXX

**Prioridade:** P1/P2/P3
**Pontos:** 5/8/13/21
**Sprint:** X
**Responsável:** [Pessoa/Time]
```

---

## 🎯 Métricas de Aceitação

- **Cobertura de Testes:** ≥ 80%
- **Code Review:** 2 aprovações
- **Integração:** ✅ Main branch
- **Performance:** ✅ Limites cumpridos
- **Acessibilidade:** ✅ Axe clean
