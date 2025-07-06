# FitCore - Sistema de Gestão para Academias

FitCore é um sistema SaaS (Software as a Service) completo, projetado para simplificar e automatizar a gestão de academias, estúdios e centros de fitness.

## Funcionalidades Principais

### Para Gestores e Administradores

-   **Dashboard Analítico:** Visão geral da saúde do negócio com métricas de alunos ativos, receita, retenção e check-ins.
-   **Gestão Financeira Completa:**
    -   Controle de fluxo de caixa (diário, semanal, mensal).
    -   Ponto de Venda (PDV) para registro de pagamentos de planos e produtos.
    -   Relatório de fechamento de caixa diário por funcionário.
    -   Geração de faturas para alunos.
-   **Gestão de Alunos 360°:**
    -   Cadastro completo com dados pessoais, contato, endereço e ficha de emergência.
    -   Histórico de pagamentos, avaliações físicas e treinos.
-   **Controle de Acesso Físico:**
    -   Página de configuração para integração com catracas e leitores biométricos.
    -   Cadastro de PIN e biometria por aluno e funcionário.
-   **Gestão de Planos e Produtos:**
    -   Crie e gerencie os planos de matrícula da academia.
    -   Cadastre produtos para venda no PDV com controle de estoque.
-   **CRM e Funil de Vendas:**
    -   Gerencie leads em um funil Kanban, desde o primeiro contato até a matrícula.
-   **Agenda de Aulas Coletivas:**
    -   Crie e visualize um calendário de aulas em grupo (ex: Fit Dance, Muay Thai).
-   **Gerenciamento de Funcionários:**
    -   Cadastre funcionários com diferentes perfis de acesso (Gestor, Professor, Recepção).
-   **Gestão Multi-Unidades:**
    -   Administre múltiplas filiais a partir de um único painel.
-   **Notificações e Suporte:**
    -   Receba notificações importantes do sistema.
    -   Acesse uma central de ajuda com FAQ e formulário para abrir chamados.

### Para Professores e Instrutores

-   **Visão Focada nos Alunos:** Dashboard com acesso rápido aos alunos sob sua responsabilidade.
-   **Criação de Planos de Treino:**
    -   Crie modelos de treino (A, B, C) com exercícios, séries, repetições e descanso.
    -   Atribua planos de treino aos alunos (funcionalidade em desenvolvimento).
-   **Registro de Avaliações Físicas:**
    -   Registre medidas antropométricas detalhadas e acompanhe a evolução dos alunos.

### Painel Superadmin (Controle da Plataforma)

-   **Dashboard Global:** Métricas de toda a plataforma (Total de academias, alunos e MRR).
-   **Gerenciamento de Clientes (Academias):**
    -   Visualize, cadastre, suspenda ou exclua academias da plataforma.
    -   Crie o usuário administrador ao cadastrar uma nova academia.
-   **Análise de Faturamento:**
    -   Acompanhe o MRR (Receita Mensal Recorrente) e ARPA (Receita Média por Conta).
-   **Comunicação Centralizada:**
    -   Envie mensagens (broadcast ou direcionadas) para os painéis de seus clientes.
-   **Automação de Assinaturas:**
    -   Integração com Stripe para permitir que novas academias assinem e sejam criadas automaticamente via webhook.

## Rodando o Projeto Localmente

Você pode rodar este projeto no seu próprio computador. Siga os passos abaixo:

### 1. Pré-requisitos

-   **Node.js:** Certifique-se de que você tem o Node.js (versão 18 ou superior) instalado. Você pode baixá-lo em [nodejs.org](https://nodejs.org/).

### 2. Instale as Dependências

Abra o terminal na pasta raiz do projeto e execute o seguinte comando para instalar todos os pacotes necessários:

```bash
npm install
```

### 3. Configure as Variáveis de Ambiente

Para testar a integração de pagamentos com o Stripe, você precisa fornecer suas chaves de API.

1.  Crie um novo arquivo na raiz do projeto chamado `.env.local`.
2.  Copie o conteúdo do arquivo `.env` para o seu novo arquivo `.env.local`.
3.  Preencha os valores para as chaves do Stripe. Você pode encontrar esses valores no painel do Stripe.

Seu arquivo `.env.local` deve ficar assim:

```
# Chaves do Stripe (Encontre em Desenvolvedores > Chaves de API)
STRIPE_SECRET_KEY=sua_chave_secreta_aqui
STRIPE_WEBHOOK_SECRET=seu_segredo_de_webhook_aqui

# URL da sua aplicação (para desenvolvimento local)
NEXT_PUBLIC_APP_URL=http://localhost:9002
```

### 4. Rode o Servidor de Desenvolvimento

Agora, execute o seguinte comando para iniciar a aplicação:

```bash
npm run dev
```

A aplicação estará disponível em [http://localhost:9002](http://localhost:9002).

**Logins de Teste:**
-   **Superadmin:** `superadmin@fitcore.com` / senha: `superadminpass`
-   **Admin (Academia Exemplo):** `admin@admin` / senha: `uUmope5Z`
-   **Gestor:** `carla` / senha: `123`
-   **Professor:** `marcos` / senha: `123`
-   **Recepção:** `juliana` / senha: `123`
