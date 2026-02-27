# HealthMais Dashboard - Documentação do Projeto

## 📊 Visão Geral

**HealthMais Dashboard** é uma plataforma web SPA (Single Page Application) que funciona como um PowerBI online, permitindo a visualização, análise e compartilhamento de dados de healthcare em tempo real.

### 🎯 Objetivos Principais
- Criar dashboards interativos com dados de healthcare (HEALTHMAIS)
- Implementar controle de acesso baseado em políticas (PBAC)
- Permitir criação e gerenciamento de perfis de usuários
- Visualizar métricas de atendimento, faturamento e gestão de saúde
- Gerar insights através de gráficos e relatórios customizáveis

### 📋 Stack Tecnológico (Proposto)
- **Frontend:** React 18+ / Next.js, TypeScript, Tailwind CSS
- **Backend:** Node.js/Express ou Python/Django
- **Database:** PostgreSQL, Redis (cache)
- **Visualização:** Chart.js, D3.js ou Recharts
- **Autenticação:** JWT + OAuth2.0
- **Deploy:** Docker, Kubernetes (opcional)

---

## 🏗️ Estrutura de Documentação

```
docs/
├── 01_PRODUCT_VISION.md          # Visão de Produto
├── 02_PRODUCT_BACKLOG.md         # Backlog Priorizado
├── 03_USER_STORIES.md            # User Stories Detalhadas
├── 04_SYSTEM_METAPHOR.md         # Metáfora do Sistema
├── 05_ARCHITECTURE.md            # Arquitetura do Sistema
├── 06_ER_DIAGRAM.md              # Diagrama Entidade-Relacionamento
├── 07_USE_CASES.md               # Casos de Uso
├── 08_SPRINT_PLANNING.md         # Planejamento de Sprints
├── 09_STORY_CARDS.md             # Story Cards (Formato Kanban)
├── 10_TASK_CARDS.md              # Task Cards
├── 11_CRC_CARDS.md               # CRC Cards (Class-Responsibility)
└── 12_XP_PRACTICES.md            # Práticas XP
```

---

## 🔄 Metodologias Aplicadas

### **Scrum**
- Sprints de 2 semanas
- Daily Standups
- Sprint Planning, Review e Retrospectiva
- Product Backlog priorizado

### **Kanban**
- Quadro de tarefas: To Do → In Progress → Code Review → Testing → Done
- WIP Limit: 5 tarefas por desenvolvedor
- Métricas de fluxo

### **Extreme Programming (XP)**
- Pair Programming (50% do tempo)
- Test-Driven Development (TDD)
- Refatoração contínua
- Integração contínua (CI/CD)
- Code Review obrigatório

---

## 📅 Timeline Estimado

| Fase | Duração | Sprints |
|------|---------|---------|
| Setup + Arquitetura | 1 semana | Sprint 0 |
| MVP (Auth + Dashboard Básico) | 2 semanas | Sprint 1-2 |
| PBAC + Perfis | 1.5 semanas | Sprint 3 |
| Gráficos Avançados | 2 semanas | Sprint 4-5 |
| Testes + QA | 1 semana | Sprint 6 |
| **Total** | **~8 semanas** | **6 Sprints** |

---

## 📞 Próximos Passos

1. ✅ Revisar documentação completa
2. ✅ Validar com stakeholders
3. ✅ Finalizar Sprint 0 (Setup)
4. ✅ Começar Sprint 1

---

*Documento vivo - atualizar conforme o projeto evolui*
