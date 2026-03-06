# Documentação: Reestruturação de Referências e Enums

**Data:** 05 de Março de 2026

## 1. Objetivo
Separar e organizar os dados de referência do projeto entre valores imutáveis (Enums) e referências dinâmicas (Referências Aprimoradas). Essa mudança visa garantir um melhor controle de histórico, rastreabilidade e integridade dos dados ao longo do tempo.

---

## 2. Enums (Valores Estáticos / Imutáveis)
O conceito de **Enum** será introduzido para dados de referência que **não sofrem alterações ao longo do tempo**. Esses valores são fixos, padronizados e garantem a base estrutural do sistema.

**Exemplos de Enums:**
- **Sexo:** (ex: Masculino, Feminino, Não Informado)
- **Meses:** (ex: Janeiro, Fevereiro, Março...)
- **Municípios:** (Lista fixa de municípios onde há atuação)

**Características dos Enums:**
- Estrutura mais leve e simples (geralmente contendo apenas ID e Valor/Nome).
- Não requerem controle de data de modificação ou histórico.
- Podem ser mocados diretamente no código (frontend/backend) ou em tabelas/abas exclusivas e protegidas.

---

## 3. Referências Aprimoradas (Valores Dinâmicos)
Os demais itens de referência, que estão sujeitos a alterações (como nomes de procedimentos, operadores de saúde, categorias, etc.), continuarão sendo tratados como "Referências". No entanto, receberão uma estrutura mais robusta e auditável.

Para cada tabela/aba de referência dinâmica, serão adicionadas as seguintes colunas de controle:

* **Data de Inserção (`data_insercao` ou `created_at`):** Registra a data e hora exatas em que o item foi criado.
* **Status (`status`):** Indicador se a referência está **Ativa** ou **Inativa**. Isso permite a exclusão lógica (_soft delete_), ocultando o item de novas seleções, mas preservando o histórico de quem já o utilizou no passado.
* **Data da Última Modificação (`data_ultima_modificacao` ou `updated_at`):** Timestamp atualizado sempre que houver qualquer edição na linha.
* **Valores Anteriores (`valores_anteriores` ou `history`):** Uma coluna destinada a guardar os valores antes da edição, permitindo consultar qual era o nome ou valor de um item antes da sua última alteração (pode ser estruturado em JSON ou texto descritivo).

## 4. Benefícios Esperados
1. **Preservação de Histórico:** Evita que alterações em referências impactem relatórios e o dashboard de dados antigos.
2. **Segurança de Dados:** O _soft delete_ (via status) previne a quebra de relacionamentos no Google Sheets ou no banco de dados.
3. **Auditoria:** Facilita saber quando um dado foi incluído e quando deixou de ser vigente.
