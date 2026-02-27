# Sprint Planning & Execution - HealthMais Dashboard

---

## 🏃 Sprint Structure (2 semanas)

```
SPRINT CALENDAR (14 dias)
┌───────────────────────────────────────┐
│  Dia 1-2: Sprint Planning (6h)        │
│  Dia 3-10: Desenvolvimento (64h)      │
│  Dia 11: Sprint Review (2h)           │
│  Dia 12: Retrospectiva (1.5h)         │
│  Dia 13-14: Buffer/Planejamento       │
└───────────────────────────────────────┘

HORÁRIO (Exemplo: PT-BR, 8h/dia)
├─ 08:00-09:00: Daily Standup
├─ 09:00-12:00: Pair Programming
├─ 12:00-13:00: Pausa
├─ 13:00-17:00: Desenvolvimento
└─ 17:00-18:00: Possível Code Review/Refactor
```

---

## 📋 Sprint Planning Meeting

### Duração: 4 horas (dividido)

#### Primeira Hora: Refinement

```
Participantes:
- Product Owner
- Scrum Master
- Development Team (5-6 pessoas)

Agenda:
1. Apresentação do Sprint Goal (15 min)
   "Implementar login e PBAC básico"

2. Review do Backlog priorizado (15 min)
   - Quais user stories vamos pegar?
   - Alguém questiona a ordem?

3. Discussão de dependências (15 min)
   - Precisa de setup antes? (Sprint 0)
   - Pode ser feito em paralelo?

4. Q&A com PO (15 min)
   - Esclarecimentos sobre requirements
```

#### Horas 2-4: Planning & Decomposition

```
1. Seleção de User Stories (30 min)
   - Time estima pontos
   - PO prioriza
   - Team commita com velocidade = 40 pontos

   Exemplo Sprint 1:
   - US-001: Login (8 pt)
   - US-002: Password Reset (5 pt)
   - US-003: Disable Users (5 pt)
   - US-006: Define Roles (8 pt)
   - US-007: PBAC Policies (13 pt)
   - US-008: View with PBAC (13 pt)
   ────────────────────────────
   TOTAL: 52 pontos (com buffer)

2. Task Breakdown (60 min)
   Para cada US:
   - Breaking into technical tasks
   - Estimativa em horas
   - Dependências entre tasks

   Exemplo US-001 (Login):
   Task 1: Criar LoginForm.jsx (4h)
   Task 2: Email validation backend (3h)
   Task 3: Password hashing + verify (4h)
   Task 4: JWT generation (5h)
   Task 5: Integration tests (5h)
   Task 6: End-to-end tests (3h)
   ────────────────────────────
   Total: 24 horas

3. Identificar Bloqueadores (15 min)
   - Sprint 0 precisa estar 100% done
   - Database migrations precisam estar pronta
   - Environment variables configuradas

4. Alinhamento de Prioridades (15 min)
   - Por que essa ordem?
   - Qual é o MVP mínimo para validar?

5. Sprint Goal & Success Criteria (15 min)
   Goal: "Usuários conseguem fazer login com PBAC básico"

   Success:
   ✓ Login funciona (auth + JWT)
   ✓ PBAC middleware bloqueia acesso indevido
   ✓ 80%+ test coverage
   ✓ Integrado a staging
   ✓ Code reviewed e merged
```

---

## 🎯 Sprint Goal Examples

### Sprint 0: Setup & Infrastructure
```
GOAL: "Ter ambiente de desenvolvimento completo e pipeline de CI/CD funcionando"

Definition of Done:
✅ Developers conseguem fazer push e PR
✅ GitHub Actions rodando testes automaticamente
✅ Backend roda localmente com seed data
✅ Frontend roda com hot reload
✅ Docker images buildando
✅ Pre-commit hooks configurados
```

### Sprint 1: Authentication MVP
```
GOAL: "Usuários conseguem fazer login seguro e sessões funcionam"

Definition of Done:
✅ Login form validado (frontend)
✅ Password hashing implementado (backend)
✅ JWT generation com 15min expiry
✅ Refresh token com 7 dias
✅ Redireciona para dashboard após login
✅ Rate limiting (5 tentativas/15min)
✅ Auditoria registra todos logins
✅ 80%+ test coverage
✅ Merged to main
```

### Sprint 2: PBAC & Dashboard
```
GOAL: "Cada usuário vê apenas dados permitidos e dashboards com 5 KPIs"

Definition of Done:
✅ PBAC middleware bloqueia requisições
✅ Dashboard renderiza 5 gráficos em <2s
✅ Real-time updates via WebSocket
✅ Filtro por período funciona
✅ Responsivo em mobile
✅ PBAC aplicado ao nível de query (server-side)
✅ 80%+ test coverage
✅ Performance benchmarks OK
✅ Merged to main
```

---

## 📊 Daily Standup (15 minutos)

### Horário: 8:00-8:15

### Agenda Fixa
```
Cada dev fala ~2 minutos:

1. O que fiz ontem?
   "Implementei validação de email e testes unitários"

2. O que vou fazer hoje?
   "Vou fazer JWT generation e começar testes de integração"

3. Tenho algum impedimento?
   "Preciso que o DB admin suba o ambiente de staging"

Blocker Board:
┌─────────────────────────────────────┐
│ BLOQUEADORES (Red List)             │
├─────────────────────────────────────┤
│ 🔴 Staging DB não está disponível   │
│    Owner: DevOps - Due: hoje        │
│                                     │
│ 🟡 Design não confirmou colors     │
│    Owner: PO - Due: amanhã          │
└─────────────────────────────────────┘

Resolution:
- Se bloqueador: assina owner + prazo
- Se técnico: resolver em pair programming
- Se design: escalar para PO
```

### Anti-patterns

```
❌ Standup é status report (monólogo)
✅ Standup é sincronização de problemas

❌ "Estou em um bug há 3 dias"
✅ "Estou em um bug, já tentei X,Y,Z, preciso de ajuda"

❌ Standup dura 30 minutos
✅ Standup dura 15 minutos (problemas = reunião à parte)

❌ Todos com pior face
✅ Energético, positivo, colaborativo
```

---

## 🔄 Fluxo Kanban Diário

```
┌─────────────┬──────────────┬────────────┬────────────┬─────────┐
│   TO DO     │ IN PROGRESS  │CODE REVIEW │  TESTING   │  DONE   │
│   (12)      │     (5)      │    (2)     │    (1)     │   (28)  │
├─────────────┼──────────────┼────────────┼────────────┼─────────┤
│ Task A      │ Task K       │ Task L     │ Task M     │Task Z   │
│ (5 pt)      │ (3 pt)Dev A  │ (8 pt)Dev B│ (5 pt)QA1  │(8 pt) ✅│
│             │              │            │            │Task Y   │
│ Task B      │ Task N       │            │            │(3 pt) ✅│
│ (8 pt)      │ (5 pt)Dev C  │            │            │         │
│             │              │            │            │...      │
│             │ Task O       │            │            │         │
│             │ (2 pt)Dev D  │            │            │         │
│             │              │            │            │         │
└─────────────┴──────────────┴────────────┴────────────┴─────────┘

WIP Limits:
- TO DO: Ilimitado (backlog)
- IN PROGRESS: 5 tasks (1 por dev)
- CODE REVIEW: 3 tasks
- TESTING: 2 tasks
- DONE: Histórico (pode arquivar semanal)

Fluxo:
Dev pega task em TO DO
  ↓
Move para IN PROGRESS (quando começa)
  ↓
Implementa + escreve testes
  ↓
Cria PR (Pull Request no GitHub)
  ↓
Move para CODE REVIEW (waiting for review)
  ↓
Lead Dev + 1 outro dev fazem code review
  ↓
Aprovado? SIM → Merge to main
       NÃO → Volta para IN PROGRESS (com feedback)
  ↓
Integração contínua roda (GitHub Actions)
  ↓
Testes automatizados passam?
  ↓
Move para TESTING (QA manual se necessário)
  ↓
QA aprova → Move para DONE ✅
QA rejeita → Volta para IN PROGRESS
```

---

## 📈 Métricas do Sprint

### Burndown Chart (Ideal vs Real)

```
Pontos
50  │ ╱ Ideal (linear)
    │╱╲
40  │  ╲  Real (sawtooth = normal)
    │   ╲╱╲
30  │      ╲
    │       ╲╱╲
20  │          ╲
    │           ╲╱
10  │              ╲
    │               ╲───
 0  └────────────────────── Dias
    1  2  3  4  5  6  7  8

Green zone: Realista, mantém ritmo
Orange zone: Atrasado, pode recuperar
Red zone: Sprint em risco de failure

Ação:
- Se red: chamar reunião de re-escopo
- Pode fazer scope adjustment (remover tasks)
- Ou pedir hora extra (cuidado com burnout)
```

### Velocity Tracking (Por Sprint)

```
Sprint  Points  Completed  % Realized
────────────────────────────────────
Sp-0       30       28        93%
Sp-1       40       38        95%
Sp-2       45       40        89%
Sp-3       50       47        94%
────────────────────────────────────
Média:     41       38        92%

Prognóstico:
- Se velocity = 38, próximo sprint estimar 38 pontos
- Considerar variação de ±5 pontos
- Trend crescente = time está melhorando
- Spike up pode indicar mudança de skill
```

### Quality Metrics

```
Por Sprint:
├─ Test Coverage: 80%+ de código
├─ Bug Escape Rate: 0-1 bugs/sprint
├─ Code Review Time: < 24h
├─ Deployment Success: 100%
└─ Performance: API < 200ms

Por Release:
├─ Critical bugs: 0
├─ Production incidents: < 1
├─ User satisfaction (NPS): > 50
└─ Uptime: 99.5%+
```

---

## 🎭 Sprint Review (60 minutos)

### Participantes
- Produto Owner
- Stakeholders
- Team
- Eventual: Clientes

### Agenda

```
0-5 min: Introdução
"Bem-vindo ao Sprint 1 Review. Vamos mostrar o que entregamos"

5-45 min: Demo (40 min)
"Vamos mostrar o produto funcionando"

Demo Checklist:
✅ Login com email/senha funciona
✅ Validação de email no frontend
✅ Password hashing no backend
✅ JWT gerado e armazenado
✅ Dashboard carrega com dados PBAC-filtrados
✅ Gráficos renderizam correto
✅ Real-time updates via WebSocket
✅ Responsivo em mobile
✅ Performance: 1.8s load time

45-55 min: Feedback
"Que acham? Sugestões?"

55-60 min: Próximas Prioridades
"Para o Sprint 2, estamos pensando em..."
- Perfis customizáveis
- Exportação de dados
- Alertas

Product Owner:
- Aceita ou rejeita trabalho
- Se aceita: vai para produção
- Se rejeita: volta para backlog (com motivo)
```

### Acceptance Criteria para Demo

```
Para cada User Story demonstrada:
✅ Funcionalidade implementada 100%
✅ Testes passando
✅ Code reviewed e merged
✅ Deployed em staging
✅ Performance OK
✅ Sem regressões conhecidas
✅ Documentação atualizada

Se algum falhar: Não inclui no review
→ Volta para backlog com feedback
```

---

## 🔍 Sprint Retrospective (90 minutos)

### Formato: "Start, Stop, Continue"

```
┌────────────────┬────────────────┬────────────────┐
│ START          │ STOP           │ CONTINUE       │
│ (Inovar)       │ (Parar)        │ (Manter)       │
├────────────────┼────────────────┼────────────────┤
│ ✅ Pair prog   │ ❌ Reuniões    │ ✅ CI/CD       │
│   2x/semana    │    demais      │    automático  │
│                │    (daily)     │                │
│ ✅ API docs    │                │ ✅ Code       │
│    em OpenAPI  │ ❌ TDD não      │    reviews    │
│                │    100% (70%)   │                │
│ ✅ Pair reviews│                │ ✅ Sprints    │
│    (dev+dev    │ ❌ Testing     │    de 2 sem    │
│    +QA)        │    manual      │                │
│                │    (let QA     │ ✅ Slack      │
│ ✅ Demos      │    automatize)  │    notifications
│    mais cedo   │                │                │
│    (Quinta)    │                │                │
└────────────────┴────────────────┴────────────────┘

Action Items (SMART):
🎯 Implementar API docs
   Owner: Dev Lead
   Due: Sprint 2 Day 1
   Acceptance: 100% endpoints documented

🎯 Reduzir reuniões
   Owner: Scrum Master
   Due: Sprint 2
   Acceptance: Daily standup 15min max, 1x/week refinement

🎯 Aumentar TDD coverage
   Owner: Team
   Due: Sprint 2
   Acceptance: 85%+ coverage (from 70%)
```

### Saúde do Time (Temperatura Check)

```
Pergunta: "Como você se sente este sprint?" (1-5)

5 🟢 Ótimo    → Team happy, momentum
4 🟢 Bom      → Normal, tudo indo bem
3 🟡 OK       → Alguns issues, nada crítico
2 🔴 Ruim     → Problemas significativos
1 🔴 Péssimo  → Quer parar tudo

Se resposta < 3:
- Investigar o quê
- Planejar ações corretivas
- Possível mudança de scope

Exemplo Sprint X:
Developer A: 4 (Bom, mas cansado de parecer)
Developer B: 5 (Ótimo, produtivo)
Developer C: 3 (OK, waiting para staging)
QA Lead: 2 (Ruim, encontrou 5 regressões)
Scrum Master: 4 (Bom, mas team muito overloaded)

Action: Remover 1-2 tasks do sprint que vem, focus qualidade
```

### Saúde da Engenharia (Tech Health Check)

```
Código:
- Code coverage: 80%? ✅
- Linter clean? ✅
- No technical debt acumulando? 🟡 (precisa refactor)

Performance:
- API < 200ms? ✅
- Frontend < 2s? ✅
- Database queries otimizadas? 🟡 (1 query N+1)

DevOps:
- CI/CD pipeline reliable? ✅
- Deployment process smooth? ✅
- Monitoring alertas OK? ✅

Security:
- No vulnerabilities? ✅
- Auth working? ✅
- PBAC enforced? ✅

Testing:
- Unit tests: 85%? ✅
- Integration tests: OK? 🟡 (need more)
- E2E tests: flaky? 🔴 (fix ASAP)

Action items:
1. Fix N+1 query (Dev A + Dev B) - 1 task Sprint 2
2. Add integration tests (Dev C) - 2 tasks Sprint 2
3. Fix E2E flakiness (QA) - high priority
```

---

## 🎯 Sprint Metrics Report

### Template Semanal

```
┌─────────────────────────────────────────────┐
│ SPRINT 1 - SEMANA 1 REPORT                  │
│ Semana de 27/02 a 05/03/2026                │
├─────────────────────────────────────────────┤
│                                             │
│ PROGRESSO:                                  │
│ Pontos Planejado: 40                        │
│ Pontos Completado: 18 (45%)                │
│ Pontos In Progress: 15 (37%)                │
│ Pontos To Do: 7 (18%)                       │
│                                             │
│ QUEIMAÇÃO (Burndown):                       │
│ Esperado: 30 pontos restantes (dia 5)      │
│ Atual: 22 pontos restantes                 │
│ Status: 🟢 AHEAD of schedule               │
│                                             │
│ QUALIDADE:                                  │
│ Test Coverage: 82% ✅                       │
│ Code Review Avg: 4h ✅                      │
│ Bugs Found: 2 (ambos minor) ✅              │
│                                             │
│ DESEMPENHO:                                 │
│ API Latency: 95ms ✅                        │
│ Frontend Load: 1.5s ✅                      │
│ Deployment Success: 100% ✅                 │
│                                             │
│ TEAM VELOCITY:                              │
│ Semana 1: 18 pt (primeira semana, slower)  │
│ Expected Semana 2: 28-32 pt (normal pace)  │
│                                             │
│ ISSUES:                                     │
│ 🟡 QA ambiente intermitente                │
│   - Resolvendo com DevOps                  │
│   - Impact: minimal                        │
│                                             │
│ 🟢 No blockers críticos                    │
│                                             │
│ FORECAST:                                   │
│ Completion: 95% (38/40 pontos)             │
│ Risk: LOW                                   │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🚀 Sprint Conclusion Checklist

```
Antes de fechar o Sprint:

✅ Product Owner aceitou todas as user stories?
✅ Todos os commits feitos com sprint branch?
✅ Pull requests foram revertidas/merged?
✅ Código está em main/master?
✅ CI/CD pipeline passou?
✅ Tests passaram?
✅ Deployed em staging?
✅ Retrospective feita?
✅ Métricas documentadas?
✅ Next sprint planejado?
✅ Velocidade calculada?
✅ Backlog refined (top 10 stories ready)?

Se algum "❌": NÃO fecha o sprint
→ Investiga e corrige antes
```

---

## 📚 Conclusão

Um Sprint bem executado:
- ✅ Tem goal claro
- ✅ Planeja incrementalmente
- ✅ Sincroniza diariamente
- ✅ Monitora progresso
- ✅ Revisa com stakeholders
- ✅ Retro para melhorar
- ✅ Documentado e rastreável

**Meta:** Entregar valor consistente a cada 2 semanas! 🎯
