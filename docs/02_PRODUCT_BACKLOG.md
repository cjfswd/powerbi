# Product Backlog - HealthMais Dashboard

**Priorização:** MoSCoW (Must, Should, Could, Won't)

---

## 🔴 MUST HAVE (Sprint 0-2)

### Epic 1: Autenticação e Segurança

| ID | User Story | Prioridade | Pontos | Status |
|-----|-----------|-----------|--------|--------|
| PB-001 | Como usuário, quero fazer login com email/senha | P1 | 8 | Backlog |
| PB-002 | Como usuário, quero recuperar minha senha | P1 | 5 | Backlog |
| PB-003 | Como admin, quero ativar/desativar usuários | P1 | 5 | Backlog |
| PB-004 | Como usuário, quero logout seguro | P1 | 3 | Backlog |
| PB-005 | Como admin, quero auditoria de logins | P2 | 8 | Backlog |

### Epic 2: PBAC (Policy-Based Access Control)

| ID | User Story | Prioridade | Pontos | Status |
|-----|-----------|-----------|--------|--------|
| PB-006 | Como admin, quero definir roles (Admin, Manager, User) | P1 | 8 | Backlog |
| PB-007 | Como admin, quero atribuir permissões por atributo | P1 | 13 | Backlog |
| PB-008 | Como usuário, visualizar dados conforme meu PBAC | P1 | 13 | Backlog |
| PB-009 | Como admin, quero criar políticas customizadas | P2 | 13 | Backlog |
| PB-010 | Como admin, quero testar políticas antes de deploy | P2 | 8 | Backlog |

### Epic 3: Dashboard Principal

| ID | User Story | Prioridade | Pontos | Status |
|-----|-----------|-----------|--------|--------|
| PB-011 | Como gestor, visualizar KPIs principais (5 gráficos) | P1 | 21 | Backlog |
| PB-012 | Como usuário, quero filtrar dados por período | P1 | 8 | Backlog |
| PB-013 | Como usuário, atualização em tempo real do dashboard | P1 | 13 | Backlog |
| PB-014 | Como usuário, quero responsividade mobile | P1 | 13 | Backlog |

### Epic 4: Gestão de Perfis

| ID | User Story | Prioridade | Pontos | Status |
|-----|-----------|-----------|--------|--------|
| PB-015 | Como usuário, quero criar meu perfil personalizado | P1 | 13 | Backlog |
| PB-016 | Como usuário, salvar minhas preferências de dashboard | P1 | 8 | Backlog |
| PB-017 | Como admin, quero gerenciar perfis de outros usuários | P1 | 8 | Backlog |

---

## 🟡 SHOULD HAVE (Sprint 3-4)

### Epic 5: Gráficos Avançados

| ID | User Story | Prioridade | Pontos | Status |
|-----|-----------|-----------|--------|--------|
| PB-018 | Como analista, quero 20+ tipos de gráficos | P2 | 21 | Backlog |
| PB-019 | Como usuário, customizar cores e layout do gráfico | P2 | 8 | Backlog |
| PB-020 | Como usuário, comparar dados de períodos diferentes | P2 | 13 | Backlog |

### Epic 6: Exportação de Dados

| ID | User Story | Prioridade | Pontos | Status |
|-----|-----------|-----------|--------|--------|
| PB-021 | Como usuário, exportar dashboard em PDF | P2 | 13 | Backlog |
| PB-022 | Como usuário, exportar dados em Excel | P2 | 8 | Backlog |
| PB-023 | Como usuário, agendar exportação automática | P3 | 13 | Backlog |

### Epic 7: Alertas e Notificações

| ID | User Story | Prioridade | Pontos | Status |
|-----|-----------|-----------|--------|--------|
| PB-024 | Como gestor, receber alerta quando métrica ultrapassa limite | P2 | 13 | Backlog |
| PB-025 | Como usuário, configurar alertas personalizados | P2 | 8 | Backlog |
| PB-026 | Como usuário, receber notificações por email/SMS | P3 | 8 | Backlog |

---

## 🟢 COULD HAVE (Sprint 5+)

| ID | User Story | Prioridade | Pontos | Status |
|-----|-----------|-----------|--------|--------|
| PB-027 | Como analista, usar IA para insights automáticos | P3 | 34 | Backlog |
| PB-028 | Como usuário, compartilhar dashboard com equipe | P3 | 13 | Backlog |
| PB-029 | Como usuário, versionar mudanças no dashboard | P4 | 13 | Backlog |
| PB-030 | Como usuário, integração com Power BI | P4 | 21 | Backlog |
| PB-031 | Como usuário, Mobile app nativo (iOS/Android) | P4 | 55 | Backlog |

---

## 🔵 WON'T HAVE (Future)

- Inteligência artificial preditiva (MVP 1)
- Suporte multilíngue (fase posterior)
- Integração com todos os ERPs do mercado
- Aplicativo desktop standalone

---

## 📊 Estatísticas do Backlog

- **Total de User Stories:** 31
- **Pontos Must Have:** 138
- **Pontos Should Have:** 106
- **Pontos Could Have:** 136
- **Pontos Totais:** ~380 pontos

---

## 🎯 Priorização por Sprint

### **Sprint 0** (Setup)
- PB-001, PB-002, PB-004 (Auth básica)

### **Sprint 1-2** (MVP)
- PB-003, PB-005 (Auth completa)
- PB-006, PB-007, PB-008 (PBAC)
- PB-011, PB-012, PB-013, PB-014 (Dashboard)

### **Sprint 3-4** (Expansão)
- PB-015, PB-016, PB-017 (Perfis)
- PB-009, PB-010 (PBAC avançado)
- PB-018, PB-019, PB-020 (Gráficos)

### **Sprint 5+** (Melhorias)
- PB-021, PB-022, PB-023 (Exportação)
- PB-024, PB-025, PB-026 (Alertas)
- PB-027+ (Nice to have)

---

## 📝 Notas

- Revisão quinzenal do backlog
- Ajustar prioridades conforme feedback
- Aceitar mudanças até 30% por sprint
- Manter buffer de 20% para bugs/dívida técnica
