# Use Cases - HealthMais Dashboard

## 🎯 Diagrama de Use Cases

```
                              ┌─────────────────────┐
                              │  HealthMais System  │
                              └─────────────────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    │                   │                   │
              ┌─────────────┐   ┌───────────────┐   ┌─────────────┐
              │ Gestor      │   │ Médico/       │   │ Admin       │
              │ Hospitalar  │   │ Enfermeiro    │   │ Sistema     │
              └─────────────┘   └───────────────┘   └─────────────┘
                    │                   │                   │
        ┌───────────┼───────────┐       │       ┌───────────┼───────┐
        │           │           │       │       │           │       │
        ↓           ↓           ↓       ↓       ↓           ↓       ↓
    ┌────────┐ ┌──────────┐ ┌────────┐ ┌─────────┐ ┌──────────┐ ┌────────┐
    │ Login  │ │ Ver      │ │Filtrar │ │ Ver     │ │ Gerenciar│ │Definir │
    │        │ │ Metrics  │ │ Dados  │ │ Seu     │ │ Usuários │ │ Acesso │
    │        │ │          │ │ por    │ │ Perfil  │ │          │ │ PBAC   │
    └────────┘ │          │ │Período │ └─────────┘ └──────────┘ └────────┘
               └──────────┘ └────────┘
                    │           │
                    └───┬───────┘
                        │
                    ┌───────────┐
                    │ Exportar  │
                    │ Dados     │
                    └───────────┘
```

---

## 📋 Use Case 1: Autenticação de Usuário

### Descrição
Usuário realiza login no sistema de forma segura.

### Atores
- **Primary:** Usuário
- **Secondary:** Sistema de Autenticação (JWT)

### Precondições
- Usuário está na página de login
- Sistema está operacional
- Banco de dados de usuários acessível

### Fluxo Principal

```
1. Usuário acessa https://healthmais.com/login
2. Sistema exibe formulário de login (email + senha)
3. Usuário insere credenciais
4. Usuário clica "Entrar"
5. Sistema valida email (formato RFC5322)
6. Sistema valida senha (não vazia)
7. Sistema faz query: SELECT * FROM users WHERE email = ?
8. Se usuário não existe: EXCEÇÃO 1
9. Sistema compara senha com hash (bcrypt)
10. Se senha incorreta: EXCEÇÃO 2
11. Sistema gera JWT token (15 min expiry)
12. Sistema gera refresh token (7 dias)
13. Sistema retorna tokens ao cliente
14. Cliente armazena em localStorage
15. Cliente redireciona para /dashboard
16. Sistema carrega PBAC do usuário
```

### Fluxos Alternativos

**Exceção 1: Usuário não existe**
- Sistema incrementa contador de tentativas (key: IP+email)
- Se >= 5 tentativas em 15 min: bloqueia conta por 15 min
- Sistema exibe: "Email ou senha incorretos"
- Usuário recebe email de tentativa suspeita

**Exceção 2: Senha incorreta**
- Similar à Exceção 1

**Exceção 3: Conta desativada**
- Sistema verifica campo `users.active`
- Se FALSE: exibe "Conta desativada, contate admin"

**Exceção 4: ReCAPTCHA necessário**
- Após 3 tentativas falhas: exibe ReCAPTCHA
- Valida ReCAPTCHA antes de processar

### Critérios de Sucesso
- ✅ Redirecionado para dashboard
- ✅ Token válido no localStorage
- ✅ Sessão dura 24h (com refresh automático)
- ✅ Auditado em audit_logs

### Critérios de Falha
- ❌ Email/Senha inválidos
- ❌ Conta desativada
- ❌ IP bloqueado

---

## 📋 Use Case 2: Visualizar Dashboard

### Descrição
Usuário logado visualiza seu dashboard personalizado com KPIs em tempo real.

### Atores
- **Primary:** Usuário logado
- **Secondary:** Servidor Dashboard, WebSocket, Cache (Redis)

### Precondições
- Usuário autenticado
- Token JWT válido
- PBAC políticas carregadas

### Fluxo Principal

```
1. Usuário acessa /dashboard
2. Frontend valida token JWT
3. Se expirado: EXCEÇÃO 1 (redireciona para login)
4. Frontend faz GET /api/dashboard/my-profile
5. Backend verifica PBAC do usuário (middleware)
6. Backend retorna dashboard default do usuário
7. Frontend renderiza 5 gráficos
8. Frontend inicializa WebSocket connection (ws://server:3001)
9. WebSocket autenticado com token JWT
10. Frontend faz GET /api/dashboard/metrics?period=today
11. Backend aplica PBAC filters na query SQL
12. Backend retorna metrics (cache hit ou DB)
13. Frontend renderiza gráficos (< 2s)
14. WebSocket envia update a cada 30s
15. Frontend renderiza updates com animação suave
16. Usuário vê dados em tempo real
```

### Fluxos Alternativos

**Exceção 1: Token Expirado**
- Frontend detecta erro 401
- Tenta refresh com refresh_token
- Se refresh falhar: redireciona para login
- Mostra mensagem: "Sessão expirada, faça login novamente"

**Exceção 2: WebSocket Cai**
- Cliente detecta desconexão
- Tenta reconectar a cada 5s
- Mostra badge "Offline" no header
- Continua funcionando com último cache
- Auto-reconecta quando internet volta

**Exceção 3: Sem permissão de dados**
- PBAC middleware bloqueia request
- Retorna 403 Forbidden
- Sistema auditoria a tentativa
- Admin recebe alerta

### Critérios de Sucesso
- ✅ Dashboard carrega em < 2s
- ✅ 5 gráficos renderizados corretamente
- ✅ Dados filtrados por PBAC
- ✅ Atualização em tempo real visible
- ✅ Responsivo em mobile

---

## 📋 Use Case 3: Aplicar Filtros de Período

### Descrição
Usuário filtra dados do dashboard por período específico.

### Atores
- **Primary:** Usuário
- **Secondary:** Dashboard Service

### Precondições
- Dashboard carregado
- Dados iniciais visíveis

### Fluxo Principal

```
1. Usuário vê seletor de data no top do dashboard
2. Usuário clica "7 últimos dias" (exemplo)
3. Frontend calcula date range: hoje - 7 dias até hoje
4. Frontend atualiza URL: /dashboard?period=7d
5. Frontend faz GET /api/dashboard/metrics?period=7d
6. Backend aplica filtro: WHERE date >= TODAY() - 7 DAYS
7. Backend combina PBAC + período filter
8. Retorna novos dados
9. Frontend atualiza gráficos com transição (CSS fade + slide)
10. Novo período salvo em localStorage
11. Usuário vê dados do período selecionado
```

### Fluxos Alternativos

**Exceção 1: Custom Date Range**
- Usuário clica "Customizado"
- Sistema abre date range picker
- Usuário seleciona data inicial e final
- Validação: não permitir datas futuras
- Validação: data inicial < data final

### Critérios de Sucesso
- ✅ Gráficos atualizam imediatamente
- ✅ URL reflete filtro (bookmarkable)
- ✅ Período persiste entre sessões
- ✅ Transição suave de dados

---

## 📋 Use Case 4: Criar Perfil Personalizado

### Descrição
Usuário cria um novo perfil de dashboard com gráficos customizados.

### Atores
- **Primary:** Usuário
- **Secondary:** Profile Service, Database

### Precondições
- Dashboard carregado
- Usuário tem permissão para criar perfis

### Fluxo Principal

```
1. Usuário clica "Novo Perfil" na sidebar
2. Sistema exibe modal com formulário:
   - Nome do perfil (texto)
   - Seleção de gráficos (checkboxes)
   - Ordem dos gráficos (drag-drop)
   - Cores tema (color picker)
3. Usuário preenche formulário
4. Usuário clica "Salvar"
5. Frontend valida:
   - Nome não vazio e < 100 caracteres
   - Pelo menos 1 gráfico selecionado
6. Frontend faz POST /api/profiles
   Payload:
   {
     "name": "Dashboard Executivo",
     "widgets": [
       {id: "widget_1", order: 0},
       {id: "widget_2", order: 1}
     ],
     "theme": {
       "primaryColor": "#1e40af",
       "darkMode": true
     }
   }
7. Backend valida permissões
8. Backend cria registro em DASHBOARDS table
9. Backend salva widgets configuração em JSONB
10. Backend retorna novo perfil
11. Frontend adiciona perfil à lista de perfis
12. Novo perfil aparece na sidebar
13. Usuário pode ativar perfil
14. Dashboard renderiza com nova configuração
```

### Critérios de Sucesso
- ✅ Perfil criado no banco
- ✅ Aparece na lista de perfis
- ✅ Pode ser ativado/deletado
- ✅ Alterações salvam automaticamente

---

## 📋 Use Case 5: Gerenciar Controle de Acesso (Admin)

### Descrição
Administrador define políticas PBAC para controlar quem vê quais dados.

### Atores
- **Primary:** Administrador
- **Secondary:** PBAC Service, Policy Engine

### Precondições
- Usuário é Admin
- Acesso ao painel administrativo

### Fluxo Principal

```
1. Admin acessa /admin/policies
2. Sistema lista políticas existentes
3. Admin clica "Nova Política"
4. Sistema abre policy builder visual
5. Admin adiciona regras (exemplo):
   - Atributo: department
   - Operador: equals
   - Valor: Cardiologia
6. Admin clica "Adicionar outra regra"
7. Admin adiciona:
   - Atributo: hospital_id
   - Operador: in
   - Valores: [1, 2, 3]
8. Admin define lógica: AND (todas as regras devem passar)
9. Admin clica "Testar Política"
10. Sistema exibe modal de teste:
    - Selecionar usuário para simular
    - Simula aplicação da política
    - Mostra dados que usuário veria
11. Admin clica "Publicar"
12. Sistema salva política em POLICIES table
13. Sistema cria versão em POLICY_VERSIONS
14. Sistema invalida cache de políticas
15. Próximas requisições usam nova política
16. Admin pode atribuir política a usuários
```

### Critérios de Sucesso
- ✅ Política criada e versionada
- ✅ Teste mostra resultado esperado
- ✅ Aplicada apenas após confirmação
- ✅ Auditoria registra mudança

---

## 📋 Use Case 6: Exportar Dados

### Descrição
Usuário exporta dados do dashboard em PDF ou Excel.

### Atores
- **Primary:** Usuário
- **Secondary:** Export Service, File Storage

### Precondições
- Dashboard carregado
- Usuário tem permissão de exportação
- Dados filtrados conforme desejado

### Fluxo Principal

```
1. Usuário clica botão "Exportar"
2. Sistema exibe opcões:
   - PDF (com gráficos e tabelas)
   - Excel (dados brutos)
3. Usuário seleciona PDF
4. Frontend faz POST /api/export
   Payload:
   {
     "format": "pdf",
     "dashboardId": 123,
     "period": "7d",
     "includeCharts": true
   }
5. Backend valida permissões + PBAC
6. Backend busca dados (respeitando PBAC)
7. Backend gera PDF com gráficos
8. Backend salva em S3 com tempo expiração (24h)
9. Backend retorna URL de download
10. Frontend oferece download ao usuário
11. Browser baixa arquivo
12. Auditoria registra exportação
```

### Critérios de Sucesso
- ✅ Arquivo gerado corretamente
- ✅ Todos os dados filtrados por PBAC inclusos
- ✅ Download funciona
- ✅ Auditado

---

## 📋 Use Case 7: Receber Alertas em Tempo Real

### Descrição
Sistema envia notificações quando métricas críticas ultrapassam limites.

### Atores
- **Primary:** Sistema
- **Secondary:** Usuário (receptor), Notification Service

### Precondições
- WebSocket conectado
- Alertas configurados
- Métricas sendo monitoradas

### Fluxo Principal

```
1. Admin configura alerta:
   - Métrica: Taxa de Ocupação
   - Condição: > 90%
   - Ação: Notificar manager
2. Monitor background detecta mudança
3. Taxa de ocupação sobe para 92%
4. Monitor cria notificação
5. WebSocket emite evento: 'alert:critical'
6. Todos os managers conectados recebem em tempo real
7. Notificação visual aparece no top do dashboard
8. Som de alerta toca (se notificações habilitadas)
9. Email enviado também (assíncrono)
10. SMS enviado (opcional)
11. Notificação permanece no painel até usuário clicar
12. Sistema armazena em NOTIFICATIONS table
```

### Critérios de Sucesso
- ✅ Alerta entregue em < 1s
- ✅ Armazenado para histórico
- ✅ Multi-canal (Web, Email, SMS)

---

## 📊 Mapa de Use Cases × Usuários

| Use Case | Gestor | Médico | Analista | Admin |
|----------|--------|--------|----------|-------|
| 1. Login | ✅ | ✅ | ✅ | ✅ |
| 2. Ver Dashboard | ✅ | ✅ | ✅ | ✅ |
| 3. Filtrar Período | ✅ | ✅ | ✅ | ✅ |
| 4. Criar Perfil | ✅ | ✅ | ✅ | ✅ |
| 5. Gerenciar PBAC | ❌ | ❌ | ❌ | ✅ |
| 6. Exportar Dados | ✅ | ✅ | ✅ | ✅ |
| 7. Receber Alertas | ✅ | ✅ | ❌ | ✅ |

---

## 🎯 Conclusão

Os 7 use cases principais cobrem:
- ✅ Autenticação e segurança
- ✅ Visualização de dados
- ✅ Personalização
- ✅ Controle de acesso
- ✅ Exportação
- ✅ Alertas

Todos implementam:
- ✅ PBAC em todas as operações
- ✅ Auditoria completa
- ✅ Validação de entrada
- ✅ Tratamento de erros
- ✅ Testes de aceitação

---

## 📝 Template para Novos Use Cases

```markdown
## 📋 Use Case X: [Nome]

### Descrição
[Descrição breve do caso de uso]

### Atores
- **Primary:** [Ator principal]
- **Secondary:** [Atores secundários]

### Precondições
- [ ] Pré-condição 1
- [ ] Pré-condição 2

### Fluxo Principal
1. Passo 1
2. Passo 2
...

### Fluxos Alternativos
**Exceção 1: ...**
- Ação 1
- Ação 2

### Critérios de Sucesso
- ✅ Critério 1
- ✅ Critério 2

### Critérios de Falha
- ❌ Critério 1
- ❌ Critério 2
```
