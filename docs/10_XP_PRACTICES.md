# Extreme Programming (XP) Practices - HealthMais Dashboard

---

## 🔄 The 12 Practices of XP

```
┌──────────────────────────────────────────┐
│  EXTREME PROGRAMMING PRACTICES            │
│  (Kent Beck - 1999)                      │
└──────────────────────────────────────────┘

PLANNING:
├─ 1️⃣ Planning Game (Sprint Planning)
└─ 2️⃣ Small Releases (2 semanas)

DESIGN:
├─ 3️⃣ System Metaphor
├─ 4️⃣ Simple Design (KISS)
└─ 5️⃣ Refactoring

CODING:
├─ 6️⃣ Pair Programming
├─ 7️⃣ Coding Standards
└─ 8️⃣ Test-Driven Development (TDD)

FEEDBACK:
├─ 9️⃣ Collective Ownership
├─ 🔟 Continuous Integration (CI)
├─ 1️⃣1️⃣ On-Site Customer (PO)
└─ 1️⃣2️⃣ Sustainable Pace
```

---

## 1️⃣ Planning Game

### Objetivo
Equilibrar necessidades de negócio com capacidade técnica.

### Metodologia

```
PLANNING GAME (ITERATIVO)

Phase 1: WRITING (Escrita de User Stories)
─────────────────────────────────────
- Product Owner escreve histórias
- Time técnico questiona/clarifica
- PO prioriza com valores de negócio

Exemplo:
  "Como gestor, quero ver faturamento do mês
   para justificar custos ao financeiro"
   Value: $50K
   Risk: Medium
   Priority: 1

Phase 2: ESTIMATION (Estimativa)
─────────────────────────────────
- Time estima cada história
- Usa Fibonacci (1, 2, 3, 5, 8, 13, 21...)
- Planning Poker (votação)

Exemplo Votação:
  Dev A: 8 pontos
  Dev B: 8 pontos
  Dev C: 5 pontos
  Dev D: 8 pontos
  Vote 5: Explica e revota
  Consenso: 8 pontos

Phase 3: COMMITMENT (Comprometimento)
──────────────────────────────────────
- Time compara com velocity anterior
- Team diz: "Podemos fazer 40 pontos"
- PO seleciona histórias nessa quantidade
- Time se compromete

Exemplo Sprint 1:
  Velocity esperada: 40 pts
  PO quer: 60 pts
  Team diz: "NÃO dá"
  PO prioriza: Login + PBAC (50 pts)
  Team: "OK, vamos fazer"
```

### Aplicação no HealthMais

```
PLANNING GAME - HealthMais Sprint 1

Fase 1: WRITING (Dia 1 - Manhã)
┌─────────────────────────────────┐
│ PO apresenta histórias:         │
│ • Login (auth)                  │
│ • Password reset                │
│ • Disable users (admin)         │
│ • Define roles                  │
│ • Create policies (PBAC)        │
│ • View with PBAC filtering      │
└─────────────────────────────────┘

Time questiona:
Q: "Qual é o tempo de expiração do token?"
A: "15 minutos para access, 7 dias para refresh"

Q: "Como admin deleta um usuário ativo?"
A: "Desativa, nunca deleta (auditoria)"

Q: "Quantos roles diferentes?"
A: "3 inicialmente: Admin, Manager, User"

Fase 2: ESTIMATION (Dia 1 - Tarde)
Planning Poker:

Story: "Login com Email/Senha"
  Dev A: 8
  Dev B: 8
  Dev C: 5
  Dev D: 8
  → Vote 5 (Dev C explica)
  Dev C: "Esqueci do email validation"
  → Revota: todos 8 ✅

Story: "PBAC Policy Creation"
  Dev A: 13
  Dev B: 13
  Dev C: 21 (acha muito complexo)
  Dev D: 8
  → Vote 8 (Dev D explica)
  Dev D: "Policy é só uma tabela JSON"
  → Revota: 13, 13, 13, 13 ✅

Fase 3: COMMITMENT (Dia 2)
┌───────────────────────────────┐
│ Histórias para Sprint 1:       │
│ • Login: 8 pt ✅              │
│ • Reset: 5 pt ✅              │
│ • Disable Users: 5 pt ✅      │
│ • Define Roles: 8 pt ✅       │
│ • PBAC Policies: 13 pt ✅     │
│ • View PBAC: 13 pt ✅         │
│ ─────────────────────────      │
│ TOTAL: 52 pontos             │
│ Velocity Target: 40          │
│ Status: OVERBOOKED (Remover!) │
│                               │
│ PO CHOOSE (prioridade):       │
│ • Login (MUST)                │
│ • Reset (MUST)                │
│ • Disable Users (MUST)        │
│ • Define Roles (MUST)         │
│ • PBAC Policies (SHOULD)      │
│ ─────────────────────────      │
│ TOTAL: 39 pontos ✅           │
│ Status: COMMITTED!            │
└───────────────────────────────┘
```

---

## 2️⃣ Small Releases

### Estratégia
Lançar versões pequenas e frequentes.

```
RELEASE PLAN (HealthMais)

Release 1.0 (MVP)
├─ Sprint 0: Infra + Setup (1 semana)
├─ Sprint 1-2: Auth + PBAC (2 semanas)
├─ Sprint 3: Dashboard (1 semana)
└─ Total: 4 semanas

Release 1.1
├─ Sprint 4: Perfis customizáveis
├─ Sprint 5: Exportação de dados
└─ Total: 2 semanas

Release 1.2
├─ Sprint 6: Alertas em tempo real
├─ Sprint 7: Compartilhamento
└─ Total: 2 semanas

Release 2.0 (Expansion)
├─ Sprint 8-10: 20+ gráficos
├─ Sprint 11-12: Mobile app
└─ Total: 6 semanas

Deployment:
v1.0 (beta) → 2026-04-15 (internal testing)
v1.0.1 (hotfix) → 2026-04-25 (production)
v1.1 (features) → 2026-05-15 (all users)
v1.2 (features) → 2026-06-15
v2.0 (major) → 2026-09-15
```

### Benefícios

```
✅ Feedback rápido
✅ Detecta problemas cedo
✅ Time fica motivado (vê progresso)
✅ Usuários veem valor incrementalmente
✅ Menos risco (revert uma feature, não projeto inteiro)
```

---

## 3️⃣ System Metaphor

### HealthMais Metaphor
"Cockpit de Avião" (já documentado em 04_SYSTEM_METAPHOR.md)

```
BENEFÍCIOS:
✅ Linguagem comum do time
✅ Arquitetura clara
✅ Nomes de classes intuitivos

EXEMPLOS DE NOMES (Metaphor-driven):

Classes:
- AuthService = Tower (controladora)
- PBACService = Traffic Control (direciona)
- DashboardService = Cockpit (visualização)
- WebSocketManager = Radar (updates)
- NotificationService = Alarm System

Methods:
- evaluatePolicy() = clearForTakeoff()
- checkPermission() = verifyFlight Plan()
- buildDataFilter() = setPracticeRoute()
- broadcastMetrics() = radarSweep()

Variables:
- userRoles = flightCrew
- policies = navigationRules
- dashboard = instrumentPanel
- realTimeMetrics = radarSignal
```

---

## 4️⃣ Simple Design (KISS)

### Princípios

```
"Simple Design" não significa "trivial"
Significa: Mais simples que puder ser SEM comprometer funcionalidade

REGRAS DE PRIORIDADE:
1️⃣ Passa em todos os testes
2️⃣ Explica a intenção (legível)
3️⃣ Sem duplicação de código (DRY)
4️⃣ Mínimo de classes/métodos

Exemplo: Validação de Email

❌ COMPLEX (Over-engineering)
────────────────────────────
class EmailValidator {
  private patterns: Map<string, string> = ...
  public validate(email: string, strict: boolean = false): ValidationResult {
    if (strict) { ... }
    const regex = patterns.get(...) || ...
    return new ValidationResult(email, ...)
  }
  public async validateWithDNS(email: string): Promise<boolean> { ... }
}

❌ TOO SIMPLE (Não funciona)
─────────────────────────────
function validateEmail(e: string): boolean {
  return e.includes('@')
}

✅ JUST RIGHT (Simple + Effective)
──────────────────────────────────
import { validate } from 'email-validator'

export function validateEmail(email: string): boolean {
  return validate(email)
}

Benefícios:
✅ 3 linhas vs 30 linhas
✅ Reutiliza biblioteca testada
✅ Fácil de entender
✅ Fácil de testar
✅ Manutenível
```

### Padrões XP de Design Simples

```
1. Use Frameworks + Bibliotecas (não reinvente)
2. Evite "gold-plating" (extras não pedidos)
3. Faça refactor contínuo (não deixe código piorar)
4. Delete código morto
5. Extract Method se função > 10 linhas
6. Nomes claros (não comentários!)
```

---

## 5️⃣ Refactoring

### Quando Fazer Refactor?

```
"If it's a pain to use, it's a pain to change"
                          — Martin Fowler

INDICADORES (Code Smell):
🔴 Duplicação de código
🔴 Função muito grande (> 20 linhas)
🔴 Muitos parâmetros (> 3)
🔴 Class muito grande (> 200 linhas)
🔴 Nomes pouco claros
🔴 Comentários explicando lógica (deve ser código)
🔴 Long conditionals (if-else aninhado)
🔴 Switch statements (use polimorfismo)
🔴 Mutations (variáveis mutáveis desnecessárias)
🔴 Deep nesting (> 2 níveis)

Exemplo: Refactor de Email Validation

ANTES (Code Smell):
──────────────────
function login(email, password) {
  if (!email || email.length === 0) {
    throw new Error('Email required')
  }
  // Validação manual
  if (email.indexOf('@') === -1) {
    throw new Error('Invalid email')
  }
  if (email.split('@').length !== 2) {
    throw new Error('Invalid email')
  }
  const parts = email.split('@')
  if (parts[1].indexOf('.') === -1) {
    throw new Error('Invalid email')
  }
  // ... mais validação
  // ... password validation (duplicado em outro lugar)
  // ... hash password (duplicado em outro lugar)
}

DEPOIS (Refactored):
────────────────────
function login(email: string, password: string) {
  validateEmail(email)      // Extract: email validation
  validatePassword(password) // Extract: password validation

  const user = findByEmail(email)
  verifyPassword(password, user.passwordHash)

  return generateTokens(user)
}

function validateEmail(email: string): void {
  if (!email?.trim()) throw new ValidationError('Email required')
  if (!isValidEmail(email)) throw new ValidationError('Invalid email')
}

function validatePassword(password: string): void {
  if (password?.length < 8) throw new ValidationError('Min 8 chars')
}

function isValidEmail(email: string): boolean {
  return validate(email)
}

BENEFÍCIOS:
✅ 3x mais curto
✅ Reutilizável
✅ Testável
✅ Legível
```

### Refactoring Schedule no HealthMais

```
TIME ALLOCATION PER SPRINT:
- 60%: Implementar novas features
- 25%: Testes + Bug fixes
- 15%: Refactoring + Tech Debt

REFACTORING TASKS:
Sprint 1:
- Extract validation methods (email, password)
- Create utility functions
- Remove duplicated SQL queries

Sprint 2:
- Extract PBAC logic into service
- Simplify dashboard controller
- Consolidate chart rendering

Sprint 3:
- Refactor profile builder (too complex)
- Extract WebSocket handlers
- Simplify notification service

Regra:
- Never refactor in prod without tests (80%+)
- Pair programming para refactoring complexo
- Code review antes de merge
```

---

## 6️⃣ Pair Programming

### Modelo

```
DRIVER (Escreve código) + NAVIGATOR (Revisa)

       DRIVER                         NAVIGATOR
       ──────                         ──────────
  Teclado e Mouse              Lê o código, acha bugs
  Digita o código              Pensa na próxima etapa
  Foca em detalhes             Foca na arquitetura
  Implementa                   Guia

  └─ Trocar a cada 15-20 minutos (context switch)
  └─ Ambos em 1 monitor + 1 teclado
  └─ Ou: Tele-pair (Tuple.app, VS Live Share)
```

### Schedules de Pair Programming

```
HEALTHMAIS PAIR PROGRAMMING POLICY:

100% Pair em:
✅ Auth (segurança crítica)
✅ PBAC (complexo lógica)
✅ WebSocket (real-time)
✅ Database migrations
✅ Refactoring de classes grandes
✅ Implementação de APIs novas

50% Pair em:
🔹 Testes unitários
🔹 Features simples (validação, etc)
🔹 Bug fixes rotineiros
🔹 Documentação

Solo OK em:
🟢 CSS styling
🟢 UI tweaks
🟢 Documentation updates
🟢 Non-critical bug fixes

EXEMPLO SPRINT 1:
Monday-Wednesday (3 dias):
- Pair: Auth Service (Dev A + Dev B)
- Pair: PBAC Middleware (Dev C + Dev D)
- Solo: API Tests (Dev A)
- Solo: UI Components (Dev E)

Thursday-Friday:
- Solo work
- Code reviews
- Refactoring
```

### Pair Programming in Real Life

```
CENÁRIO 1: Complex Feature
─────────────────────────
Dev A (knows DB) + Dev B (knows Frontend)
→ Implementam AuthService juntos
→ Dev A: Escreve service (driver)
→ Dev B: Questiona edge cases (navigator)
→ Revezam a cada 20 min
→ Resultado: Código melhor + 2 devs entendem código

CENÁRIO 2: Junior + Senior
──────────────────────────
Junior (Dev C) + Senior (Dev A)
→ Junior é driver (escreve)
→ Senior é navigator (ensina)
→ Junior aprende enquanto implementa
→ Senior valida conhecimento
→ Resultado: Conhecimento transferido, código OK

CENÁRIO 3: Spike/Research
──────────────────────────
Dev D + Dev E: "Como integrar Socket.io?"
→ Ambos pesquisam juntos
→ Dev D: Digita código de exemplo
→ Dev E: Lê documentação
→ Discutem pattern melhor
→ Criam spike de prova de conceito
→ Resultado: Conhecimento compartilhado, decisão rápida

Remote Pair Programming Setup:
Zoom + VS Code Live Share
├─ Dev A: localhost:3000 (backend)
├─ Dev B: live share session
└─ Screen share quando necessário
```

---

## 7️⃣ Coding Standards

### HealthMais Coding Guidelines

```
Configuração Automática:
├─ ESLint (linting)
├─ Prettier (formatting)
├─ TypeScript (type safety)
├─ Pre-commit hooks (enforced)
└─ GitHub Actions (CI checks)

JAVASCRIPT/TYPESCRIPT STANDARDS:
────────────────────────────────
✅ Use const por default, let se precisa reassign
✅ Arrow functions para callbacks
✅ Destructuring para parâmetros
✅ Template literals para strings
✅ Async/await em vez de .then()
✅ Const assertions para types

Exemplo GOOD:
───────────────
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

Exemplo BAD:
──────────────
var validateEmail = function(email) {
  return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
}

REACT STANDARDS:
────────────────
✅ Functional components
✅ Hooks (useState, useEffect, useContext)
✅ Props destructuring
✅ Custom hooks para lógica reutilizável
✅ Memoization para componentes pesados

Exemplo GOOD:
──────────────
interface LoginFormProps {
  onSubmit: (data: LoginData) => void
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
  const [email, setEmail] = useState('')
  const { isLoading } = useAuth()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit({ email })
  }

  return <form onSubmit={handleSubmit}>...</form>
}

SQL STANDARDS:
──────────────
✅ Parameterized queries (prevent SQL injection)
✅ Indexes em colunas frequently queried
✅ Comments em queries complexas
✅ Avoid N+1 queries
✅ Use transactions para multi-step operations

Exemplo GOOD:
──────────────
const query = `
  SELECT u.*, r.name
  FROM users u
  LEFT JOIN user_roles ur ON u.id = ur.user_id
  LEFT JOIN roles r ON ur.role_id = r.id
  WHERE u.email = $1
`
const result = await db.query(query, [email])

Exemplo BAD:
──────────────
const query = `
  SELECT * FROM users WHERE email = '${email}'
` // SQL Injection!

API STANDARDS:
──────────────
✅ RESTful naming (GET /users, POST /users, etc)
✅ HTTP status codes corretos
✅ JSON request/response
✅ Error responses com mensagens claras
✅ API versioning (/api/v1/...)
✅ Rate limiting headers

Exemplo GOOD:
──────────────
GET /api/v1/users/:id
Response:
{
  "status": 200,
  "data": { "id": 1, "email": "..." },
  "timestamp": "2026-02-27T14:25:00Z"
}

ERROR:
{
  "status": 400,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": { "field": "email" }
  },
  "timestamp": "2026-02-27T14:25:00Z"
}
```

### Pre-commit Hooks (Enforced)

```
# .husky/pre-commit
npm run lint     # ESLint
npm run format   # Prettier
npm run test     # Unit tests
npm run type-check # TypeScript

Se algum falhar: NÃO deixa fazer commit!
Força developer a corrigir antes.
```

---

## 8️⃣ Test-Driven Development (TDD)

### O Ciclo Red-Green-Refactor

```
TDD CYCLE:
───────────

1. RED 🔴
   Write a test that FAILS
   (Before implementing the feature)

   Example:
   test('validates email format', () => {
     expect(validateEmail('invalid')).toBe(false)
   })

   RUN TEST → ❌ FAIL (função não existe)

2. GREEN 🟢
   Write minimum code to make test PASS

   Example:
   function validateEmail(email) {
     return email.includes('@')
   }

   RUN TEST → ✅ PASS

3. REFACTOR 🔵
   Improve code without breaking test

   Example:
   function validateEmail(email) {
     return validate(email) // Use library
   }

   RUN TEST → ✅ PASS (ainda passa!)

   └─ Volta para 1 se precisa mais funcionalidade

REPEAT para cada feature!
```

### TDD Benefits

```
✅ Better design (interface first)
✅ Better coverage (80%+)
✅ Fewer bugs in production
✅ Safer refactoring
✅ Documentation via tests
✅ Confidence in changes
```

### TDD na HealthMais

```
EXEMPLO: Implementar Login Service

STEP 1: RED 🔴
─────────────
// authService.test.ts
describe('AuthService', () => {
  describe('login', () => {
    test('returns token for valid credentials', async () => {
      const service = new AuthService(db)
      const result = await service.login('user@example.com', 'password123')

      expect(result).toHaveProperty('accessToken')
      expect(result).toHaveProperty('refreshToken')
      expect(result.accessToken).toBeDefined()
    })

    test('throws error for invalid email', async () => {
      const service = new AuthService(db)

      await expect(
        service.login('invalid-email', 'password')
      ).rejects.toThrow('Invalid email')
    })

    test('throws error for wrong password', async () => {
      const service = new AuthService(db)

      await expect(
        service.login('user@example.com', 'wrong-password')
      ).rejects.toThrow('Invalid credentials')
    })
  })
})

$ npm test
× 3 tests failing (AuthService doesn't exist)

STEP 2: GREEN 🟢
────────────────
// authService.ts
export class AuthService {
  constructor(private db: Database) {}

  async login(email: string, password: string) {
    if (!validate(email)) throw new Error('Invalid email')

    const user = await this.db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    )

    if (!user) throw new Error('Invalid credentials')

    const passwordMatch = await bcrypt.compare(password, user.password_hash)
    if (!passwordMatch) throw new Error('Invalid credentials')

    return {
      accessToken: generateJWT(user, '15m'),
      refreshToken: generateJWT(user, '7d')
    }
  }
}

$ npm test
✓ 3 tests passing

STEP 3: REFACTOR 🔵
────────────────────
// Extract methods
async login(email: string, password: string) {
  this.validateEmail(email)
  const user = await this.findUserByEmail(email)
  this.verifyPassword(password, user.passwordHash)
  return this.generateTokens(user)
}

private validateEmail(email: string): void {
  if (!validate(email)) throw new Error('Invalid email')
}

private async findUserByEmail(email: string) {
  const user = await this.db.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  )
  if (!user) throw new Error('Invalid credentials')
  return user
}

private verifyPassword(password: string, hash: string): void {
  const match = bcrypt.compareSync(password, hash)
  if (!match) throw new Error('Invalid credentials')
}

private generateTokens(user: User) {
  return {
    accessToken: generateJWT(user, '15m'),
    refreshToken: generateJWT(user, '7d')
  }
}

$ npm test
✓ 3 tests passing (ainda passa!)

NEXT: Add more tests para edge cases
────────────────────────────────────
test('rate limits login attempts', async () => { ... })
test('logs failed attempts', async () => { ... })
test('blocks IP after 5 attempts', async () => { ... })

Cada test novo → RED → GREEN → REFACTOR
```

### TDD Coverage Target

```
HealthMais Target: 80%+ Code Coverage

Per Sprint:
Sprint 0: 70% (setup, não crítico)
Sprint 1+: 80%+ (auth/PBAC crítico)

Tools:
- Jest (coverage reports)
- Coverage.io (tracking)
- SonarQube (analysis)

Target Files:
✅ All services (auth, pbac, dashboard) = 90%+
✅ Controllers = 80%+
✅ Utilities = 85%+
🟡 UI Components = 70% (visual testing manual)
🟢 Styles = N/A (ignore)
```

---

## 9️⃣ Collective Code Ownership

### Princípio
"Não é código DO Dev A, é código DO TEAM"

```
COLLECTIVE OWNERSHIP:
────────────────────
❌ "Isso é código do Dev A, não toco"
✅ "Precisamos de uma mudança, quem vai fazer?"

BENEFÍCIOS:
✅ Código melhor (múltiplos olhares)
✅ Conhecimento distribuído
✅ Menos dependência de pessoas
✅ Refactoring seguro
✅ Onboarding mais fácil

IMPLEMENTAÇÃO:
──────────────
1. Pair Programming (2 pessoas aprendem)
2. Code Review obrigatório (outro olhar)
3. Documentação (repositório de conhecimento)
4. Talks técnicos (compartilhar aprendizados)
5. Refactoring coletivo (todos melhoram)
```

### Prática no HealthMais

```
ANTES (Silos):
──────────────
Dev A: Auth + JWT (só ele mexe)
Dev B: PBAC (só ele mexe)
Dev C: Dashboard (só ele mexe)

Problema:
- Dev A sai de férias → Auth congelado
- Dev B fica sick → PBAC parado
- Código fica ruim → ninguém quer mexer
- Conhecimento siloed

DEPOIS (Collective Ownership):
──────────────────────────────
Pair Programming:
- Dev A + Dev B implementam Auth
- Dev C + Dev D implementam PBAC
- Dev A + Dev E implementam Dashboard

Code Review:
- Toda PR revisada por 2+ devs
- Não é "approve Dev B", é "team aprova"
- Leitura obrigatória de PRs de colegas

Conhecimento Sharing:
- Weekly Tech Talk (30 min)
  "Auth Security Best Practices"
  "PBAC Evaluation Engine Deep-Dive"
  "WebSocket Connection Lifecycle"

- Documentation Wiki
  - Architecture decisions
  - Code patterns
  - Common gotchas

Resultado:
✅ Qualquer dev pode mexer em qualquer código
✅ Onboarding novo dev: "pair com someone"
✅ Férias: "team pode cover"
✅ Refactoring: "team melhora junto"
```

---

## 🔟 Continuous Integration (CI)

### Pipeline Automático

```
PUSH CÓDIGO → CI PIPELINE → FEEDBACK EM 5 MIN

┌─────────────────────────────────────────┐
│ GitHub Actions (CI/CD)                  │
├─────────────────────────────────────────┤
│                                         │
│ Trigger: git push origin branch-name    │
│ ↓                                       │
│ 1. Install dependencies (2 min)        │
│    $ npm ci                             │
│ ↓                                       │
│ 2. Run linter (1 min)                  │
│    $ npm run lint                       │
│    ✅ Pass or ❌ Fail                   │
│ ↓                                       │
│ 3. Run type check (1 min)              │
│    $ npm run type-check                │
│    ✅ Pass or ❌ Fail                   │
│ ↓                                       │
│ 4. Run tests (3 min)                   │
│    $ npm test --coverage               │
│    ✅ Pass or ❌ Fail                   │
│ ↓                                       │
│ 5. Build (2 min)                       │
│    $ npm run build                      │
│    ✅ Pass or ❌ Fail                   │
│ ↓                                       │
│ 6. Security check (1 min)              │
│    $ npm audit                          │
│    ✅ No vulnerabilities               │
│ ↓                                       │
│ RESULT:                                 │
│ ✅ All checks passed                   │
│    → Ready for code review             │
│    → Can merge to main                 │
│ ❌ Any check failed                    │
│    → Block PR                          │
│    → Dev fixes locally                 │
│    → Re-push                           │
│                                         │
└─────────────────────────────────────────┘
```

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop, 'feature/**']
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Type check
        run: npm run type-check

      - name: Run tests
        run: npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3

      - name: Build
        run: npm run build

      - name: Security audit
        run: npm audit --audit-level=moderate
```

---

## 1️⃣1️⃣ On-Site Customer (Product Owner)

### Papel do PO

```
PO RESPONSIBILITIES:
─────────────────────
✅ Defini requirements
✅ Escreve user stories
✅ Prioriza backlog
✅ Aceita ou rejeita trabalho
✅ Disponível para dúvidas (< 1h resposta)
✅ Validação com usuários reais
✅ Feedback contínuo
✅ Roadmap comunicado

COMUNICAÇÃO DAILY:
──────────────────
- Standup (15 min)
- Quick questions via Slack
- Sprint Review (1h)
- Backlog Refinement (1h)

EXEMPLO:
────────
Dev: "Qual timezone para relatórios?"
PO: "América/São_Paulo, mas permitir customizar"
Dev: "Entendi, vou implementar selector"
PO: "Perfeito, valida com 3 usuarios e me avisa"
```

---

## 1️⃣2️⃣ Sustainable Pace

### Objetivo
"Entregue valor consistente ao longo do tempo"

```
BURNOUT PREVENTION:
───────────────────
❌ Não fazer Sprint com 80 horas
❌ Não trabalhar fins de semana
❌ Não pular feriados
❌ Não aceitar scope ilimitado

✅ 8h/dia de desenvolvimento real
✅ Pausas regulares (15 min a cada 90 min)
✅ Horário flexível se precisa (compensar)
✅ Férias planejadas
✅ WFH (work from home) allowed

MEDIDAS:
────────
Team Velocity:
- Sprint 0: 30 pontos (ramp-up)
- Sprint 1-2: 40 pontos (steady)
- Sprint 3+: 45 pontos (experienced)

Se velocity cai de 45 → 30:
⚠️ Problema! Investigar:
  - Muito retrabalho?
  - Muitos bugs?
  - Team cansado?
  - Mudança de escopo?

Ação:
- Remover scope (reduzir pontos)
- Aumentar pair programming
- Reduzir meetings
- Considerar sprint de "tech debt"
```

---

## 🎯 XP Best Practices Summary

| Prática | O quê | Por quê |
|---------|-------|--------|
| **Planning Game** | Estimar + priorizar | Evitar surpresas |
| **Small Releases** | Release a cada 2-4 semanas | Feedback rápido |
| **System Metaphor** | Linguagem comum | Comunicação clara |
| **Simple Design** | KISS | Fácil manutenção |
| **Refactoring** | Melhorar continuo | Dívida técnica 0 |
| **Pair Programming** | 2 devs, 1 código | Qualidade + conhecimento |
| **Coding Standards** | ESLint + Prettier | Consistência |
| **TDD** | Test first | Confiança + cobertura |
| **Collective Ownership** | Código do team | Sem silos |
| **CI** | Automatizar tudo | Confiança em push |
| **On-Site PO** | Cliente disponível | Clareza de requirements |
| **Sustainable Pace** | 8h/dia | Sem burnout |

---

## 📈 XP Metrics

```
Medir XP Success:

Coverage: 80%+
├─ Target per sprint
├─ Tracked by codecov
└─ Must not regress

Build Success: 100%
├─ CI pipeline never broken
├─ If breaks: first priority
└─ Average time to fix: < 30 min

Code Review Time: < 24h
├─ PRs reviewed quickly
├─ Feedback same day
└─ Enable fast iteration

Pair Programming: 50%+
├─ Team time in pairs
├─ Tracked in calendar
└─ Especially on complex tasks

Defect Escape Rate: < 1 per sprint
├─ Bugs found in production
├─ If > 1: investigate quality
└─ Usually means test issue

Refactoring: 15% of time
├─ Time spent improving code
├─ No new features
├─ Tracked in sprint
└─ Critical for tech health
```

---

## 🚀 Implementação no HealthMais

### Semana 1

```
✅ Setup pre-commit hooks (linter + tests)
✅ Create GitHub Actions workflow
✅ Pair programming for critical features
✅ TDD for auth service
✅ Code review checklist
```

### Semana 2

```
✅ Refactoring session (code cleanup)
✅ Documentation wiki
✅ Team standards document
✅ Coverage measurement (codecov)
```

### Contínuo

```
✅ Daily standup
✅ Pair programming
✅ Sprint reviews
✅ Retrospectives
✅ Refactoring
✅ CI/CD monitoring
```

---

## 📚 Conclusão

XP Practices = Excelência Técnica + Velocidade Sustentável

**HealthMais usa XP para:**
- ✅ Entregar qualidade alta
- ✅ Velocidade consistente
- ✅ Equipe feliz
- ✅ Código mantível
- ✅ Risco mitigado

**Resultado: Produto melhor, entregue mais rápido, com confiança.** 🚀
