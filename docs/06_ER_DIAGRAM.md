# Entity-Relationship Diagram (ER) - HealthMais Dashboard

## 📊 ER Diagram ASCII

```
┌─────────────────────────────────────────────────────────────────────┐
│                      HEALTHMAIS ER MODEL                             │
└─────────────────────────────────────────────────────────────────────┘


                         ┌──────────────┐
                         │    USERS     │
                         ├──────────────┤
                         │ PK id        │───┐
                         │ email        │   │
                         │ password_h   │   │
                         │ first_name   │   │
                         │ last_name    │   │
                         │ active       │   │
                         │ created_at   │   │
                         │ updated_at   │   │
                         │ last_login   │   │
                         └──────────────┘   │
                                │          │
                    ┌───────────┼──────────┼────────────┐
                    │           │          │            │
        N:M         │  N:M      │          │            │  1:N
                    ↓           ↓          ↓            ↓
        ┌───────────────────┐   │    ┌──────────────────┐
        │  USER_ROLES       │   │    │ USER_ATTRIBUTES  │
        ├───────────────────┤   │    ├──────────────────┤
        │ FK user_id        │◄──┘    │ FK user_id       │◄──┐
        │ FK role_id        │        │ attribute_key    │   │
        │ assigned_at       │        │ attribute_value  │   │
        └─────────┬─────────┘        │ data_type        │   │
                  │                  │ created_at       │   │
                  │                  └──────────────────┘   │
                  │                                         │
                  │ N:M                                     │ 1:N
                  ↓                                         │
        ┌──────────────┐                                   │
        │    ROLES     │                                   │
        ├──────────────┤                                   │
        │ PK id        │──────────────────────────────────┘
        │ name         │     (Roles define quem é quem)
        │ description  │
        │ is_system    │
        │ created_at   │
        └──────┬───────┘
               │
               │ N:M
               ↓
        ┌─────────────────────┐
        │  ROLE_PERMISSIONS   │
        ├─────────────────────┤
        │ FK role_id          │
        │ FK permission_id    │
        │ granted_at          │
        └──────────┬──────────┘
                   │
                   │ N:M
                   ↓
        ┌──────────────────┐
        │  PERMISSIONS     │
        ├──────────────────┤
        │ PK id            │
        │ code             │
        │ description      │
        │ resource         │
        │ action           │
        └──────────────────┘


        ┌──────────────┐
        │   POLICIES   │◄────────────────────────────────┐
        ├──────────────┤                                 │
        │ PK id        │                                 │
        │ name         │                                 │
        │ description  │                                 │
        │ rules        │ (JSON)                          │
        │ is_active    │                                 │
        │ created_by   │ (FK users.id)                   │
        │ version      │                                 │
        │ created_at   │                                 │
        │ updated_at   │                                 │
        └──────┬───────┘                                 │
               │                                         │
               │ 1:N                                     │
               ↓                                         │
        ┌──────────────────────┐                        │
        │  POLICY_VERSIONS     │                        │
        ├──────────────────────┤                        │
        │ PK id                │                        │
        │ FK policy_id         │                        │
        │ version_number       │                        │
        │ rules                │ (JSON)                 │
        │ created_at           │                        │
        │ changed_by           │ (FK users.id)          │
        │ notes                │                        │
        └──────────────────────┘                        │
                                                        │
        ┌──────────────────────────────────────────────┘
        │ (Policies são regras de PBAC)
        │
        ↓
  USER_POLICIES (Assignment)
  ┌──────────────────────┐
  │ FK user_id           │
  │ FK policy_id         │
  │ assigned_at          │
  │ assigned_by          │
  └──────────────────────┘


        ┌──────────────────────────────────────────┐
        │          DASHBOARDS (Perfis)             │
        ├──────────────────────────────────────────┤
        │ PK id                                    │
        │ FK user_id                               │
        │ name                                     │
        │ description                              │
        │ layout_config                 (JSON)     │
        │ widgets                       (JSON)     │
        │ is_default                               │
        │ is_shared                                │
        │ shared_code                              │
        │ created_at                               │
        │ updated_at                               │
        └──────────────────────────────────────────┘
               │ 1:N (Um usuário tem N dashboards)
               │
               ├─────────────────────┐
               │                     │
               ↓                     ↓
         ┌──────────┐         ┌─────────────┐
         │ WIDGETS  │         │ DASHBOARD_  │
         │          │         │ SHARING     │
         ├──────────┤         ├─────────────┤
         │ PK id    │         │ PK id       │
         │ FK dash  │         │ FK dash_id  │
         │ type     │         │ shared_with │
         │ config   │         │ (email/id)  │
         │ order    │         │ permission  │
         └──────────┘         │ shared_at   │
                              └─────────────┘


        ┌────────────────────────────────────────┐
        │        AUDIT_LOGS (Auditoria)          │
        ├────────────────────────────────────────┤
        │ PK id                                  │
        │ FK user_id (quem fez)                  │
        │ action (view/edit/delete/create)       │
        │ resource_type (users/policies/etc)     │
        │ resource_id                            │
        │ status (SUCCESS/FAILED)                │
        │ details                    (JSON)      │
        │ ip_address                             │
        │ user_agent                             │
        │ timestamp                              │
        └────────────────────────────────────────┘


        ┌────────────────────────────────────────┐
        │      NOTIFICATIONS (Alertas)           │
        ├────────────────────────────────────────┤
        │ PK id                                  │
        │ FK user_id                             │
        │ type (alert/info/warning)              │
        │ title                                  │
        │ message                                │
        │ data                       (JSON)      │
        │ is_read                                │
        │ created_at                             │
        │ read_at                                │
        └────────────────────────────────────────┘


        ┌────────────────────────────────────────┐
        │      REFRESH_TOKENS (Sessões)          │
        ├────────────────────────────────────────┤
        │ PK id                                  │
        │ FK user_id                             │
        │ token_hash                             │
        │ expires_at                             │
        │ created_at                             │
        │ revoked_at                             │
        │ ip_address                             │
        │ device_info                (JSON)      │
        └────────────────────────────────────────┘
```

---

## 📋 Detalhamento das Tabelas

### 1. **USERS**

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_email (email),
  INDEX idx_active (active)
);
```

**Relacionamentos:**
- 1:N com USER_ROLES (um usuário tem muitos roles)
- 1:N com USER_ATTRIBUTES (um usuário tem muitos atributos)
- 1:N com DASHBOARDS (um usuário tem muitos dashboards)
- 1:N com AUDIT_LOGS (auditoria das ações)

---

### 2. **USER_ATTRIBUTES**

```sql
CREATE TABLE user_attributes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  attribute_key VARCHAR(100) NOT NULL,
  attribute_value VARCHAR(500),
  data_type VARCHAR(20), -- 'string', 'number', 'boolean', 'json'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(user_id, attribute_key),
  INDEX idx_user_attributes (user_id, attribute_key)
);
```

**Exemplos:**
- `department: 'Cardiologia'`
- `hospital_id: '1'`
- `team: 'Cirurgia'`
- `region: 'Sul'`
- `cost_center: 'CC-001'`

---

### 3. **ROLES**

```sql
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  is_system BOOLEAN DEFAULT FALSE, -- Roles padrão não podem ser deletadas
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_name (name)
);

-- Roles padrão:
INSERT INTO roles (name, description, is_system) VALUES
('ADMIN', 'Administrador do sistema', TRUE),
('MANAGER', 'Gerente de unidade/departamento', TRUE),
('USER', 'Visualizador/Analista', TRUE);
```

---

### 4. **PERMISSIONS**

```sql
CREATE TABLE permissions (
  id SERIAL PRIMARY KEY,
  code VARCHAR(100) UNIQUE NOT NULL,
  resource VARCHAR(50), -- 'dashboards', 'users', 'policies', 'reports'
  action VARCHAR(50),   -- 'view', 'create', 'edit', 'delete'
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(resource, action),
  INDEX idx_code (code)
);

-- Exemplos:
INSERT INTO permissions (code, resource, action, description) VALUES
('dashboard:view', 'dashboards', 'view', 'Ver dashboards'),
('dashboard:create', 'dashboards', 'create', 'Criar dashboards'),
('dashboard:edit', 'dashboards', 'edit', 'Editar dashboards'),
('dashboard:delete', 'dashboards', 'delete', 'Deletar dashboards'),
('users:manage', 'users', 'manage', 'Gerenciar usuários'),
('policies:manage', 'policies', 'manage', 'Gerenciar políticas PBAC'),
('audit:view', 'audit', 'view', 'Ver logs de auditoria');
```

---

### 5. **ROLE_PERMISSIONS**

```sql
CREATE TABLE role_permissions (
  role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (role_id, permission_id),
  INDEX idx_role_permissions (role_id)
);

-- Exemplos:
-- ADMIN tem todas as permissões
-- MANAGER tem dashboard:view, dashboard:create, dashboard:edit (de suas unidades)
-- USER tem apenas dashboard:view
```

---

### 6. **USER_ROLES**

```sql
CREATE TABLE user_roles (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_by INTEGER REFERENCES users(id), -- Quem atribuiu

  PRIMARY KEY (user_id, role_id),
  INDEX idx_user_roles (user_id, role_id)
);
```

---

### 7. **POLICIES** (Regras PBAC)

```sql
CREATE TABLE policies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  rules JSONB NOT NULL, -- Estrutura abaixo
  is_active BOOLEAN DEFAULT TRUE,
  version INTEGER DEFAULT 1,
  created_by INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_name (name),
  INDEX idx_active (is_active)
);

-- Estrutura de RULES (JSONB):
{
  "name": "Cardiologia_Managers",
  "rules": [
    {
      "attribute": "department",
      "operator": "equals",
      "value": "Cardiologia"
    },
    {
      "attribute": "hospital_id",
      "operator": "in",
      "value": ["1", "2", "3"]
    },
    {
      "attribute": "role",
      "operator": "equals",
      "value": "MANAGER"
    }
  ],
  "logic": "AND" -- Todos os rules devem passar
}
```

---

### 8. **POLICY_VERSIONS** (Histórico)

```sql
CREATE TABLE policy_versions (
  id SERIAL PRIMARY KEY,
  policy_id INTEGER NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  rules JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  changed_by INTEGER REFERENCES users(id),
  notes TEXT,

  UNIQUE(policy_id, version_number),
  INDEX idx_policy_versions (policy_id, version_number)
);
```

---

### 9. **USER_POLICIES** (Atribuição)

```sql
CREATE TABLE user_policies (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  policy_id INTEGER NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_by INTEGER REFERENCES users(id),
  expires_at TIMESTAMP, -- Política temporária (opcional)

  PRIMARY KEY (user_id, policy_id),
  INDEX idx_user_policies (user_id, policy_id)
);
```

---

### 10. **DASHBOARDS** (Perfis de Dashboard)

```sql
CREATE TABLE dashboards (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  layout_config JSONB, -- Grid layout configuração
  widgets JSONB NOT NULL, -- Array de widgets
  is_default BOOLEAN DEFAULT FALSE,
  is_shared BOOLEAN DEFAULT FALSE,
  shared_code VARCHAR(50), -- Link único para compartilhamento
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_user_dashboards (user_id),
  UNIQUE(user_id, name)
);

-- Estrutura de WIDGETS (JSONB):
{
  "widgets": [
    {
      "id": "widget_1",
      "type": "gauge",
      "title": "Taxa de Ocupação",
      "metric": "occupancy",
      "position": { "x": 0, "y": 0, "w": 6, "h": 4 },
      "config": { "unit": "%", "min": 0, "max": 100 }
    },
    {
      "id": "widget_2",
      "type": "line_chart",
      "title": "Faturamento Mensal",
      "metric": "revenue",
      "position": { "x": 6, "y": 0, "w": 6, "h": 4 },
      "config": { "currency": "BRL" }
    }
  ],
  "layout": "grid",
  "gridSize": 12
}
```

---

### 11. **DASHBOARD_SHARING**

```sql
CREATE TABLE dashboard_sharing (
  id SERIAL PRIMARY KEY,
  dashboard_id INTEGER NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,
  shared_with_user_id INTEGER REFERENCES users(id),
  shared_with_email VARCHAR(255),
  permission VARCHAR(20), -- 'view', 'edit', 'admin'
  shared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_dashboard_sharing (dashboard_id)
);
```

---

### 12. **AUDIT_LOGS** (Auditoria Completa)

```sql
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(50) NOT NULL, -- 'login', 'view', 'create', 'edit', 'delete'
  resource_type VARCHAR(50) NOT NULL, -- 'users', 'policies', 'dashboards'
  resource_id INTEGER,
  status VARCHAR(20) NOT NULL, -- 'SUCCESS', 'FAILED', 'DENIED'
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_user_audit (user_id),
  INDEX idx_timestamp_audit (timestamp),
  INDEX idx_action_audit (action)
);
```

---

### 13. **NOTIFICATIONS**

```sql
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(30), -- 'alert', 'info', 'warning', 'error'
  title VARCHAR(100),
  message TEXT,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP,

  INDEX idx_user_notifications (user_id, is_read),
  INDEX idx_timestamp_notifications (created_at)
);
```

---

### 14. **REFRESH_TOKENS** (Sessões)

```sql
CREATE TABLE refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  revoked_at TIMESTAMP, -- NULL = ativo, filled = revogado
  ip_address VARCHAR(45),
  device_info JSONB,

  INDEX idx_user_tokens (user_id),
  INDEX idx_expires_tokens (expires_at)
);
```

---

## 🔑 Índices Recomendados

```sql
-- Performance Índices
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(active);

CREATE INDEX idx_user_attrs_lookup ON user_attributes(user_id, attribute_key);

CREATE INDEX idx_policies_active ON policies(is_active);

CREATE INDEX idx_audit_timeline ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_user_action ON audit_logs(user_id, action);

CREATE INDEX idx_dashboards_user ON dashboards(user_id);
CREATE INDEX idx_dashboards_default ON dashboards(user_id, is_default);

-- Full-text search (opcional)
CREATE INDEX idx_policies_search ON policies USING gin(to_tsvector('portuguese', name || ' ' || description));
```

---

## 🔄 Relacionamentos Resumidos

```
USERS
├── 1:N → USER_ROLES → ROLES → N:M → PERMISSIONS
├── 1:N → USER_ATTRIBUTES (atributos PBAC)
├── 1:N → USER_POLICIES → POLICIES (regras PBAC)
├── 1:N → DASHBOARDS
├── 1:N → AUDIT_LOGS
├── 1:N → NOTIFICATIONS
└── 1:N → REFRESH_TOKENS (sessões)

POLICIES
├── 1:N → POLICY_VERSIONS (histórico)
├── N:M → USER_POLICIES (assignment)
└── (Contém regras em JSONB)
```

---

## 📊 Migração SQL (Ordem Correta)

1. **Criar tabelas base:** users, roles, permissions
2. **Criar tabelas de relacionamento:** user_roles, role_permissions
3. **Criar atributos:** user_attributes
4. **Criar políticas:** policies, policy_versions, user_policies
5. **Criar dashboards:** dashboards, dashboard_sharing
6. **Criar auditorias:** audit_logs, notifications, refresh_tokens

---

## 🎯 Exemplo de Query com PBAC

```sql
-- Usuário quer ver metrics com PBAC
-- Usuário: id=5, department='Cardiologia', hospital_id=1, role='MANAGER'

-- 1. Pegar políticas do usuário
SELECT DISTINCT p.rules
FROM policies p
JOIN user_policies up ON p.id = up.policy_id
WHERE up.user_id = 5 AND p.is_active = TRUE;

-- 2. Aplicar regras na query (construído dinamicamente)
SELECT * FROM healthcare_metrics
WHERE department = 'Cardiologia'
  AND hospital_id = 1;
  -- E qualquer outra regra definida na política

-- 3. Resultado: Usuário vê APENAS dados de Cardiologia no hospital 1
```

---

## 📈 Considerações de Performance

- **Particionamento:** Considerar particionar `audit_logs` por data (monthly)
- **Archiving:** Mover audit_logs antigos para tabela archive (> 1 ano)
- **Caching:** Redis para policies (atualizar a cada 5 min ou on-change)
- **Replicas:** Read-heavy queries em replicas (audit_logs, dashboards)
- **JSONB Índices:** Usar GIN índices para queries em campos JSONB

---

## 🔐 Segurança no DB

- Row-Level Security (RLS) no PostgreSQL para adicionar camada extra
- Encryption de campos sensíveis em application layer
- Backup automático + point-in-time recovery
- Audit de DDL changes

---

## 📝 Próximos Passos

1. ✅ Criar migrations para cada tabela
2. ✅ Adicionar constraints de integridade referencial
3. ✅ Implementar RLS policies
4. ✅ Criar seed data para testes
5. ✅ Documentar queries críticas
