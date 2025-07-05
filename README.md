# FitCore - Sistema de Gestão para Academias

Este é um projeto Next.js para o FitCore, um sistema completo para gerenciamento de academias.

## Para Começar

Dê uma olhada em `src/app/page.tsx` para ver a página inicial, e em `src/app/dashboard` para as telas do sistema.

## Rodando o Projeto Localmente

Você pode rodar este projeto no seu próprio computador. Siga os passos abaixo:

### 1. Pré-requisitos

- **Node.js:** Certifique-se de que você tem o Node.js (versão 18 ou superior) instalado. Você pode baixá-lo em [nodejs.org](https://nodejs.org/).

### 2. Instale as Dependências

Abra o terminal na pasta raiz do projeto e execute o seguinte comando para instalar todos os pacotes necessários:

```bash
npm install
```

### 3. Configure as Variáveis de Ambiente (Opcional - para Pagamentos)

Para testar a integração de pagamentos com o Stripe, você precisa fornecer suas chaves de API. Se você não for testar essa parte, pode pular esta etapa.

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
- **Admin:** `admin@admin` / senha: `uUmope5Z`
- **Gestor:** `carla` / senha: `123`
- **Professor:** `marcos` / senha: `123`
- **Recepção:** `juliana` / senha: `123`

## Funcionalidades Principais

- **Dashboard:** Visão geral com estatísticas.
- **Gestão de Alunos:** Adicione, edite e visualize alunos (com dados em memória).
- **Controle de Acesso:** Gerencie funcionários e suas permissões.
- **Financeiro:** Registre pagamentos e visualize o fluxo de caixa.
- **Assinatura:** Sistema de assinatura com simulação de status (ativo, vencido, etc.) e integração com Stripe.
- **Recomendação de Treino IA:** Use Genkit para gerar treinos personalizados.
