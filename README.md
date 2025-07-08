# FitCore - Sistema de Gestão para Academias

FitCore é um sistema SaaS (Software as a Service) completo, projetado para simplificar e automatizar a gestão de academias, estúdios e centros de fitness.

## Funcionalidades Principais

### Para Gestores e Administradores

-   **Dashboard Analítico:**
    -   Visão geral da saúde do negócio com métricas de alunos ativos, inadimplentes e em grupo de risco (baixa frequência).
    -   Gráficos visuais para receita realizada vs. projetada, novos alunos por mês e check-ins na semana.
-   **Gestão Financeira Completa:**
    -   **Ponto de Venda (PDV):** Registro de pagamentos de planos e produtos com seleção de método (Dinheiro, Pix, Cartão, Boleto) e campo condicional para ID da transação.
    -   **Fluxo de Caixa:** Acompanhamento diário de todas as entradas e saídas.
    -   **Fechamento de Caixa:** Relatório diário de vendas consolidadas por funcionário.
    -   **Histórico de Pagamentos:** Busca inteligente por aluno, ID do recibo ou código da transação do cartão.
    -   **Geração de Faturas:** Emissão automática de recibos detalhados para impressão ou PDF.
-   **Gestão de Alunos 360°:**
    -   Cadastro completo com dados pessoais, contato, endereço e ficha de emergência.
    -   Ficha do aluno com histórico de pagamentos, treinos e avaliações físicas em abas organizadas (com pagamentos em primeiro lugar por padrão).
    -   **Status do Aluno Automatizado:** O sistema classifica alunos como 'Ativo', 'Atrasado' (até 3 dias de atraso) ou 'Inativo' automaticamente. A reativação é automática ao registrar um pagamento.
    -   **Importação Inteligente de Alunos:**
        -   Suporte para arquivos `.csv` e `.xlsx`.
        -   Mapeamento flexível de colunas que reconhece diferentes nomenclaturas (ex: "DOCUMENTO", "CPF").
        -   **Atualização de Cadastros (Upsert):** Atualiza alunos existentes (via e-mail) com dados novos sem criar duplicatas.
-   **Controle de Acesso Físico:**
    -   Página de configuração para integração com catracas e leitores biométricos.
    -   Cadastro de PIN e biometria por aluno e funcionário.
    -   API (`/api/access/validate`) para validação de acesso em tempo real, bloqueando inadimplentes.
-   **Integração com Parceiros (Gympass):**
    -   API (`/api/gympass/checkin`) para validação de check-ins de usuários de parceiros.
    -   Relatório dedicado para visualização e controle do histórico de check-ins de parceiros.
-   **Gestão de Planos e Produtos:**
    -   Crie e gerencie os planos de matrícula e produtos vendidos no PDV, com controle de estoque.
-   **CRM e Funil de Vendas:**
    -   Gerencie leads em um funil Kanban, desde o primeiro contato até a matrícula.
    -   **Módulo de Relacionamento:** Listas automáticas para contatar aniversariantes do dia, alunos faltantes e inadimplentes, com atalho para enviar mensagem via WhatsApp.
-   **Agenda de Aulas Coletivas:**
    -   Crie e visualize um calendário de aulas em grupo (ex: Fit Dance, Muay Thai).
-   **Gerenciamento de Funcionários:**
    -   Cadastre funcionários com diferentes perfis de acesso (Gestor, Professor, Recepção).
-   **Relatórios e Documentos:**
    -   Página centralizada para exportar relatórios essenciais.
    -   **Exportação de Frequência:** Gera uma planilha `.csv` com o status de presença de todos os alunos.
-   **Notificações e Suporte:**
    -   Receba notificações importantes da plataforma.
    -   Acesse uma central de ajuda com FAQ e formulário para abrir chamados.

### Para Professores e Instrutores

-   **Visão Focada nos Alunos:** Dashboard com acesso rápido aos alunos sob sua responsabilidade, mostrando faltantes e treinos pendentes.
-   **Criação de Planos de Treino:**
    -   **Banco de Exercícios:** Ampla lista de exercícios pré-cadastrados, organizados por grupo muscular, para seleção rápida.
    -   **Cadastro de Novos Exercícios:** Permite que o professor digite e adicione exercícios que não estão na lista.
    -   Crie modelos de treino (A, B, C) com exercícios, séries, repetições e descanso.
    -   Atribua planos de treino aos alunos (funcionalidade em desenvolvimento).
-   **Gerador de Treino com IA:**
    -   Ferramenta dedicada para gerar recomendações de treino personalizadas com base no histórico, metas e preferências do aluno.
-   **Registro de Avaliações Físicas:**
    -   Registre medidas detalhadas de antropometria e bioimpedância para acompanhar a evolução dos alunos.

### Painel Superadmin (Controle da Plataforma)

-   **Dashboard Global:** Métricas de toda a plataforma (Total de academias, alunos e MRR).
-   **Gerenciamento de Clientes (Academias):**
    -   Visualize, cadastre, suspenda ou exclua academias da plataforma.
    -   Crie o usuário administrador ao cadastrar uma nova academia.
-   **Análise de Faturamento:**
    -   Acompanhe o MRR (Receita Mensal Recorrente) e ARPA (Receita Média por Conta).
-   **Comunicação Centralizada:**
    -   Envie mensagens (broadcast ou direcionadas) para os painéis de seus clientes.
-   **Automação de Assinaturas (Stripe):**
    -   Integração com Stripe para permitir que novas academias assinem e sejam criadas automaticamente via webhook.
    -   Página para simular diferentes cenários de assinatura (ativa, vencida, bloqueada) para testes.

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
