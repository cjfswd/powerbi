# Story Cards, Task Cards & CRC Cards - HealthMais Dashboard

---

## 🎴 STORY CARDS (Kanban Format)

### Story Card Template

```
┌────────────────────────────────────────┐
│ US-001: Login com Email/Senha          │ (Back)
├────────────────────────────────────────┤
│ Epic: Autenticação                     │
│ Priority: P1                           │
│ Points: 8                              │
│ Sprint: 0                              │
├────────────────────────────────────────┤
│ As a: Usuário                          │
│ I want: Fazer login com email/senha    │
│ So that: Acessar o dashboard           │
├────────────────────────────────────────┤
│ Acceptance Criteria:                   │
│ ✓ Email validation (RFC5322)           │
│ ✓ Password validation (min 8 chars)    │
│ ✓ Error handling (wrong credentials)   │
│ ✓ Rate limiting (5 attempts/15min)     │
│ ✓ JWT generation (15 min expiry)       │
│ ✓ Audit logging                        │
│                                        │
│ Definition of Done:                    │
│ ☐ Code written & tested               │
│ ☐ Code reviewed (2 approvals)         │
│ ☐ Tests: 80%+ coverage                │
│ ☐ Performance: < 500ms response       │
│ ☐ Merged to main                      │
├────────────────────────────────────────┤
│ Kanban Status: TO DO | IN PROGRESS    │
│                        | CODE REVIEW   │
│                        | TESTING       │
│                        | DONE          │
│                                        │
│ Assigned to: Developer A               │
│ Created: 2026-02-27                    │
│ Updated: 2026-02-27                    │
└────────────────────────────────────────┘
```

---

### Story Cards Sprint 0

#### SC-001: Setup Inicial

```
┌────────────────────────────────────────┐
│ Setup: Inicializar Repositório         │
├────────────────────────────────────────┤
│ Epic: Infraestrutura                   │
│ Points: 5                              │
│ Sprint: 0 (Setup)                      │
├────────────────────────────────────────┤
│ Tasks:                                 │
│ ☐ Criar repo GitHub                   │
│ ☐ Setup branch protection (main)       │
│ ☐ Configurar GitHub Actions (CI/CD)    │
│ ☐ Criar file structure                │
│ ☐ Documentação inicial                │
│ ☐ Configurar pre-commit hooks          │
│                                        │
│ DoD:                                   │
│ ☐ Developers conseguem fazer PR       │
│ ☐ CI/CD pipeline rodando             │
└────────────────────────────────────────┘
```

#### SC-002: Setup Backend

```
┌────────────────────────────────────────┐
│ Setup: Projeto Backend                 │
├────────────────────────────────────────┤
│ Epic: Infraestrutura                   │
│ Points: 8                              │
│ Sprint: 0                              │
├────────────────────────────────────────┤
│ Tasks:                                 │
│ ☐ npm init (Node.js)                  │
│ ☐ Instalar Express                    │
│ ☐ Configurar TypeScript                │
│ ☐ Configurar ESLint + Prettier         │
│ ☐ Setup environment variables          │
│ ☐ Conexão PostgreSQL                  │
│ ☐ Seed data inicial                   │
│ ☐ Testes com Jest                      │
│                                        │
│ DoD:                                   │
│ ☐ Server roda em localhost:3000       │
│ ☐ DB conecta com seed data            │
│ ☐ Testes passam (0 errors)            │
└────────────────────────────────────────┘
```

#### SC-003: Setup Frontend

```
┌────────────────────────────────────────┐
│ Setup: Projeto Frontend                │
├────────────────────────────────────────┤
│ Epic: Infraestrutura                   │
│ Points: 8                              │
│ Sprint: 0                              │
├────────────────────────────────────────┤
│ Tasks:                                 │
│ ☐ Create React App (ou Next.js)       │
│ ☐ TypeScript setup                    │
│ ☐ Tailwind CSS config                │
│ ☐ ESLint + Prettier                   │
│ ☐ Folder structure                    │
│ ☐ Axios instance                      │
│ ☐ Basic routing                       │
│ ☐ Testing library setup                │
│                                        │
│ DoD:                                   │
│ ☐ App roda em localhost:3000          │
│ ☐ Can call backend API                │
│ ☐ Tests passam                        │
└────────────────────────────────────────┘
```

---

### Story Cards Sprint 1-2 (MVP)

#### SC-004: Implementar Login

```
┌────────────────────────────────────────┐
│ Feature: Login com Email/Senha         │
├────────────────────────────────────────┤
│ Epic: Autenticação                     │
│ Points: 8                              │
│ Sprint: 1                              │
│ Assign to: Full-stack Dev              │
├────────────────────────────────────────┤
│ Components:                            │
│ - LoginForm.jsx                        │
│ - authController.js                    │
│ - authService.js                       │
│ - POST /auth/login endpoint            │
│                                        │
│ Tests:                                 │
│ - Valid credentials → 200 + token      │
│ - Invalid credentials → 401            │
│ - Rate limiting works                  │
│ - Password hashing verified            │
│                                        │
│ Dependencies:                          │
│ - SC-002 (Backend setup)              │
│ - SC-003 (Frontend setup)             │
│                                        │
│ DoD:                                   │
│ ☐ Login form renders                  │
│ ☐ API endpoint works                  │
│ ☐ JWT generated & stored              │
│ ☐ Tests 80%+ coverage                 │
│ ☐ Code reviewed                       │
│ ☐ Merged to main                      │
└────────────────────────────────────────┘
```

#### SC-005: PBAC Core

```
┌────────────────────────────────────────┐
│ Feature: PBAC Middleware               │
├────────────────────────────────────────┤
│ Epic: PBAC                             │
│ Points: 13                             │
│ Sprint: 1-2                            │
├────────────────────────────────────────┤
│ Components:                            │
│ - pbacService.js                       │
│ - pbacMiddleware.js                    │
│ - PBAC database schema                 │
│                                        │
│ Key Functions:                         │
│ - evaluatePolicy(user, policy)         │
│ - buildQuery(pbacRules)               │
│ - hasPermission(user, resource)        │
│                                        │
│ DoD:                                   │
│ ☐ Middleware aplica PBAC              │
│ ☐ Query filtrada no backend           │
│ ☐ 90%+ test coverage                  │
│ ☐ Auditoria integrada                 │
│ ☐ Performance < 100ms                 │
└────────────────────────────────────────┘
```

#### SC-006: Dashboard com 5 Gráficos

```
┌────────────────────────────────────────┐
│ Feature: Dashboard Principal           │
├────────────────────────────────────────┤
│ Epic: Dashboard                        │
│ Points: 21                             │
│ Sprint: 1-2                            │
├────────────────────────────────────────┤
│ Gráficos:                              │
│ 1. Taxa de Ocupação (Gauge)           │
│ 2. Faturamento Mensal (Line Chart)    │
│ 3. Pacientes por Depto (Bar Chart)    │
│ 4. Tipo de Atendimento (Pie)          │
│ 5. Total Pacientes Ativos (Card)      │
│                                        │
│ Components:                            │
│ - DashboardGrid.jsx                    │
│ - OccupancyGauge.jsx                  │
│ - RevenueLineChart.jsx                │
│ - DepartmentBarChart.jsx              │
│ - TypesPieChart.jsx                   │
│ - MetricsCard.jsx                     │
│                                        │
│ DataFlow:                              │
│ UI → REST API → Backend Query         │
│ Backend applies PBAC → SQL Query       │
│ Database → Cached → UI Render         │
│                                        │
│ DoD:                                   │
│ ☐ 5 gráficos renderizam               │
│ ☐ Load < 2 segundos                   │
│ ☐ Responsivo mobile                   │
│ ☐ PBAC aplicado                       │
│ ☐ Testes de integração                │
└────────────────────────────────────────┘
```

---

## 🎯 TASK CARDS (Detailed Implementation)

### Task Card Template

```
┌──────────────────────────────────────────┐
│ TASK: Implementar validação de email    │
├──────────────────────────────────────────┤
│ Story: US-001 (Login)                   │
│ Status: TO DO | IN PROGRESS | DONE     │
│ Priority: P1                            │
│ Points: 3                               │
├──────────────────────────────────────────┤
│ Description:                            │
│ Adicionar validação RFC5322 para email  │
│ no backend (POST /auth/login)          │
│                                        │
│ Acceptance Criteria:                   │
│ ✓ Rejeita emails inválidos            │
│ ✓ Aceita emails válidos               │
│ ✓ Teste unitário >= 95% coverage      │
│ ✓ Integrado ao LoginForm              │
│                                        │
│ Implementation:                        │
│ 1. Usar lib: 'email-validator'        │
│ 2. Adicionar middleware de validação   │
│ 3. Testar com diferentes formatos      │
│ 4. Retornar erro 400 se inválido      │
│                                        │
│ Files to Change:                       │
│ - src/middleware/validators.js        │
│ - src/routes/auth.routes.js           │
│ - tests/auth.validation.test.js       │
│                                        │
│ QA Checklist:                          │
│ ☐ Valid: user@example.com            │
│ ☐ Invalid: user@.com                 │
│ ☐ Invalid: @example.com              │
│ ☐ Invalid: user example.com          │
│                                        │
│ Estimated Time: 2 hours                │
│ Actual Time: [to be filled]            │
│                                        │
│ Assigned to: Dev Name                  │
│ Reviewer: Lead Dev                     │
│ Created: 2026-02-27                    │
│ Due: 2026-03-02                        │
└──────────────────────────────────────────┘
```

---

### Task Cards Sprint 1 (Exemplo)

#### TC-001: Backend Setup

```
┌──────────────────────────────────────┐
│ TASK: npm init + dependencies         │
├──────────────────────────────────────┤
│ Story: SC-002 (Backend Setup)        │
│ Points: 2                             │
│ Assigned: Lead Dev                    │
├──────────────────────────────────────┤
│ Checklist:                            │
│ ☐ npm init                            │
│ ☐ npm install express typescript      │
│ ☐ npm install -D jest ts-node        │
│ ☐ package.json scripts configured    │
│ ☐ tsconfig.json created              │
│                                      │
│ Commands:                             │
│ $ npm init -y                         │
│ $ npm install express cors dotenv     │
│ $ npm install -D typescript @types    │
│ $ npx tsc --init                      │
│                                      │
│ Acceptance:                           │
│ ✓ npm start works                    │
│ ✓ TypeScript compiles clean          │
└──────────────────────────────────────┘
```

#### TC-002: Criar Users Table

```
┌──────────────────────────────────────┐
│ TASK: Criar migration: users table    │
├──────────────────────────────────────┤
│ Story: SC-005 (PBAC Setup)           │
│ Points: 3                             │
│ Assigned: DB Lead                     │
├──────────────────────────────────────┤
│ SQL Script:                           │
│ CREATE TABLE users (                 │
│   id SERIAL PRIMARY KEY,             │
│   email VARCHAR(255) UNIQUE,         │
│   password_hash VARCHAR(255),        │
│   active BOOLEAN DEFAULT TRUE,       │
│   created_at TIMESTAMP DEFAULT NOW() │
│ );                                    │
│                                      │
│ Migrations:                           │
│ ☐ 001_create_users_table.sql         │
│ ☐ 002_create_users_index.sql         │
│ ☐ Migration runner working           │
│                                      │
│ Tests:                                │
│ ☐ Table exists                       │
│ ☐ Inserts work                       │
│ ☐ Constraints enforced               │
└──────────────────────────────────────┘
```

#### TC-003: Implementar Login UI

```
┌──────────────────────────────────────┐
│ TASK: Criar LoginForm.jsx            │
├──────────────────────────────────────┤
│ Story: SC-004 (Login)                │
│ Points: 5                             │
│ Assigned: Frontend Dev                │
├──────────────────────────────────────┤
│ Component:                            │
│ src/components/Auth/LoginForm.jsx    │
│                                      │
│ Requirements:                         │
│ ✓ Email input field                 │
│ ✓ Password input field               │
│ ✓ "Esqueci minha senha" link         │
│ ✓ "Entrar" button                    │
│ ✓ Loading state during submit        │
│ ✓ Error message display              │
│ ✓ Form validation                    │
│ ✓ Styled with Tailwind               │
│ ✓ Responsive design                  │
│                                      │
│ Tests:                                │
│ ☐ Renders correctly                  │
│ ☐ Form submission works              │
│ ☐ Validation messages show           │
│ ☐ Loading spinner shows              │
│ ☐ Mobile responsive                  │
│                                      │
│ Acceptance:                           │
│ $ npm test LoginForm.test.jsx         │
│ ✓ All tests pass                     │
└──────────────────────────────────────┘
```

#### TC-004: JWT Generation

```
┌──────────────────────────────────────┐
│ TASK: Implementar JWT geração        │
├──────────────────────────────────────┤
│ Story: SC-004 (Login)                │
│ Points: 5                             │
│ Assigned: Backend Dev                 │
├──────────────────────────────────────┤
│ Files:                                │
│ - src/services/authService.js        │
│ - src/config/jwt.js                  │
│                                      │
│ Requirements:                         │
│ ✓ RS256 algorithm (RSA key pair)     │
│ ✓ Payload: { user_id, email, role } │
│ ✓ Access token: 15 min expiry        │
│ ✓ Refresh token: 7 days expiry       │
│ ✓ Tokens signed properly             │
│ ✓ Error handling                     │
│                                      │
│ Implementation:                       │
│ npm install jsonwebtoken              │
│ Generate RSA keys (openssl)           │
│ Store in environment variables        │
│                                      │
│ Tests:                                │
│ ☐ Token generated                    │
│ ☐ Token verification works           │
│ ☐ Expired token detected             │
│ ☐ Invalid signature rejected         │
│                                      │
│ Validation:                           │
│ const token = generateToken(user)    │
│ const decoded = verifyToken(token)   │
│ assert(decoded.user_id === user.id)  │
└──────────────────────────────────────┘
```

---

## 🃏 CRC CARDS (Class-Responsibility-Collaboration)

### CRC Card Template

```
┌─────────────────────────────────────────┐
│ Class: AuthService                      │
├─────────────────────────────────────────┤
│                                         │
│ Responsibilities:                       │
│ • Validar credenciais de usuário       │
│ • Gerar JWT tokens                     │
│ • Hash de senha (bcrypt)               │
│ • Refresh token management             │
│                                         │
│ Collaborators:                          │
│ • User (model)                         │
│ • JWTConfig                            │
│ • AuditService                         │
│ • Logger                               │
│                                         │
│ Key Methods:                            │
│ + login(email, password): Token        │
│ + validateToken(token): Payload        │
│ + refreshToken(refreshToken): Token    │
│ + logout(userId): void                 │
│ + hashPassword(pwd): hash              │
│ + comparePassword(pwd, hash): bool     │
│                                         │
└─────────────────────────────────────────┘
```

---

### CRC Cards - Core Classes

#### CRC-001: AuthService

```
┌─────────────────────────────────────────┐
│ AuthService                             │
├─────────────────────────────────────────┤
│ Responsibilities:                       │
│ • login() - verify credentials         │
│ • validateToken() - check JWT validity │
│ • generateAccessToken()                │
│ • generateRefreshToken()               │
│ • revokeToken()                        │
│                                         │
│ Collaborators:                          │
│ ├─ User (database model)              │
│ ├─ JWTConfig (config)                 │
│ ├─ bcrypt (password hashing)          │
│ ├─ AuditService (logging)             │
│ └─ Logger (errors)                    │
│                                         │
│ Public Methods:                         │
│ + login(email: string, password: string)
│   → { accessToken, refreshToken }    │
│                                         │
│ + validateAccessToken(token: string)   │
│   → { userId, email, role } | null   │
│                                         │
│ + refreshAccessToken(refreshToken)    │
│   → { accessToken, refreshToken }    │
│                                         │
│ Private Methods:                        │
│ - hashPassword(pwd: string)             │
│ - comparePassword(pwd, hash)            │
│ - generateJWT(payload, expiresIn)       │
│                                         │
└─────────────────────────────────────────┘
```

#### CRC-002: PBACService

```
┌─────────────────────────────────────────┐
│ PBACService                             │
├─────────────────────────────────────────┤
│ Responsibilities:                       │
│ • evaluatePolicy(user, policy)         │
│ • checkPermission(user, action)        │
│ • buildDataFilter(pbacRules)          │
│ • cachePolicy()                        │
│ • invalidateCache()                    │
│                                         │
│ Collaborators:                          │
│ ├─ User (model)                        │
│ ├─ Policy (model)                      │
│ ├─ Role (model)                        │
│ ├─ Redis (caching)                     │
│ ├─ Logger (audit)                      │
│ └─ RuleEngine (evaluation)              │
│                                         │
│ Public Methods:                         │
│ + hasAccess(user, resource)             │
│   → boolean                             │
│                                         │
│ + buildSQL(user, baseQuery)             │
│   → { query, params }                   │
│                                         │
│ + testPolicy(policy, testUser)          │
│   → { passed, details }                 │
│                                         │
│ Private Methods:                        │
│ - evaluateRule(rule, userAttrs)         │
│ - getCachedPolicy(policyId)             │
│ - applyLogic(results, logic)            │
│                                         │
└─────────────────────────────────────────┘
```

#### CRC-003: DashboardService

```
┌──────────────────────────────────────────┐
│ DashboardService                        │
├──────────────────────────────────────────┤
│ Responsibilities:                        │
│ • getMetrics(user, period)              │
│ • applyPBACFilter(metrics, user)        │
│ • cacheResults()                        │
│ • generateExport(format)                │
│ • pushRealTimeUpdate()                  │
│                                          │
│ Collaborators:                           │
│ ├─ User (model)                         │
│ ├─ PBACService (filtering)              │
│ ├─ Database (queries)                   │
│ ├─ Redis (caching)                      │
│ ├─ WebSocket (real-time)                │
│ ├─ FileExporter (PDF/Excel)             │
│ └─ Logger (metrics)                     │
│                                          │
│ Public Methods:                          │
│ + getOccupancy(user, period)             │
│ + getRevenue(user, period)               │
│ + getDepartmentBreakdown(user)           │
│ + getMetricsWithPBAC(user, filters)      │
│ + scheduleRealTimeUpdates()              │
│                                          │
│ Private Methods:                         │
│ - applyPBACToQuery(sql, user)            │
│ - getCachedMetrics(cacheKey)             │
│ - invalidateCache(pattern)               │
│                                          │
└──────────────────────────────────────────┘
```

#### CRC-004: WebSocketManager

```
┌──────────────────────────────────────────┐
│ WebSocketManager                        │
├──────────────────────────────────────────┤
│ Responsibilities:                        │
│ • handleConnection()                    │
│ • broadcastMetrics()                    │
│ • emitAlert()                           │
│ • handleDisconnection()                 │
│ • authenticateConnection()              │
│                                          │
│ Collaborators:                           │
│ ├─ Socket.io                            │
│ ├─ AuthService (JWT verify)             │
│ ├─ PBACService (filtering)              │
│ ├─ MetricsEmitter (data source)         │
│ ├─ AlertService (notifications)         │
│ └─ Logger (debugging)                   │
│                                          │
│ Public Methods:                          │
│ + io.on('connection', socket)            │
│ + broadcastMetrics(data)                 │
│ + emitToUser(userId, event, data)        │
│ + emitToRole(role, event, data)          │
│                                          │
│ Events Handled:                          │
│ - 'connect': User joins                 │
│ - 'disconnect': User leaves             │
│ - 'dashboard:subscribe': Watch metric   │
│ - 'dashboard:unsubscribe': Stop watch   │
│                                          │
│ Events Emitted:                          │
│ - 'metrics:updated'                     │
│ - 'alert:critical'                      │
│ - 'dashboard:refresh'                   │
│                                          │
└──────────────────────────────────────────┘
```

#### CRC-005: ProfileService

```
┌──────────────────────────────────────────┐
│ ProfileService                          │
├──────────────────────────────────────────┤
│ Responsibilities:                        │
│ • createProfile(user, config)           │
│ • updateProfile(profileId, config)      │
│ • getProfile(profileId)                 │
│ • setDefaultProfile(profileId)          │
│ • shareProfile(profileId, users)        │
│ • deleteProfile(profileId)              │
│                                          │
│ Collaborators:                           │
│ ├─ User (model)                         │
│ ├─ Dashboard (model)                    │
│ ├─ DashboardSharing (model)             │
│ ├─ NotificationService (email)          │
│ ├─ AuditService (logging)               │
│ └─ Logger (errors)                      │
│                                          │
│ Public Methods:                          │
│ + createUserProfile(user, name, config) │
│   → Profile                              │
│                                          │
│ + updateWidgetOrder(profileId, order)   │
│   → Profile                              │
│                                          │
│ + shareProfile(profileId, emails)       │
│   → SharedProfile[]                      │
│                                          │
│ + getUserProfiles(userId)                │
│   → Profile[]                            │
│                                          │
│ Private Methods:                         │
│ - validateConfig(config)                 │
│ - calculateGridPositions(widgets)        │
│                                          │
└──────────────────────────────────────────┘
```

---

### CRC Cards - Relationship Diagram

```
                  ┌──────────────┐
                  │ AuthService  │
                  └────┬─────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ↓              ↓              ↓
    ┌─────┐      ┌────────┐      ┌────────┐
    │User │      │  JWT   │      │ Audit  │
    └─────┘      │ Config │      │Service │
        │        └────────┘      └────────┘
        │
        └──────────┐
                   ↓
           ┌─────────────────┐
           │  PBACService    │
           └────────┬────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
        ↓           ↓           ↓
    ┌─────┐    ┌────────┐   ┌──────┐
    │Role │    │ Policy │   │ Redis│
    └─────┘    └────────┘   └──────┘
        │
        └──────────┐
                   ↓
        ┌────────────────────┐
        │ DashboardService   │
        └────────┬───────────┘
                 │
        ┌────────┴───────┐
        │                │
        ↓                ↓
 ┌────────────┐   ┌──────────────┐
 │ProfileServ │   │WebSocketMgr  │
 └────────────┘   └──────────────┘
```

---

### CRC Card Summary Table

| Class | Responsibilities | Collaborators | Key Method |
|-------|------------------|----------------|-----------|
| **AuthService** | Verify credentials, Generate JWT | User, JWT Config, Audit | login() |
| **PBACService** | Evaluate policies, Check access | Policy, Role, Redis | hasAccess() |
| **DashboardService** | Fetch metrics, Apply filters | PBAC, Database, Cache | getMetrics() |
| **WebSocketManager** | Manage connections, Broadcast | Socket.io, Auth, Metrics | broadcastMetrics() |
| **ProfileService** | Manage user dashboards | Dashboard, Sharing, Notify | createProfile() |
| **AuditService** | Log all activities | Logger, Database | logAction() |
| **NotificationService** | Send alerts/emails | Email, SMS, WebSocket | sendAlert() |
| **ExportService** | Generate PDF/Excel | ReportGenerator, S3 | exportToPDF() |

---

## 🎯 CRC Card Usage in Development

### Pair Programming Session

```
Developer A (Driver) + Developer B (Navigator)

1. Pick CRC card for class to implement
2. Read responsibilities together
3. Identify collaborators needed
4. Write test cases first (TDD)
5. Implement each method
6. Code review together
7. Move to next CRC card

Timeline:
- 45 min: 1 CRC class + tests
- 15 min: Code review + refactor
- Repeat
```

### Code Review Checklist

- [ ] All responsibilities in CRC implemented?
- [ ] All collaborators properly injected?
- [ ] Methods signatures match CRC?
- [ ] Tests cover all scenarios?
- [ ] Performance OK (see tech debt)?

---

## 📊 Conclusion

- **Story Cards** = O que fazer (visão do usuário)
- **Task Cards** = Como fazer (implementação detalhada)
- **CRC Cards** = Design detalhado (classes e responsabilidades)

Todos alinhados para entregar valor rápido e com qualidade! ✅
