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

### 3. Configure as Variáveis de Ambiente

Para que a aplicação se conecte ao Firebase e ao Stripe, você precisa fornecer suas chaves de API.

1.  Crie um novo arquivo na raiz do projeto chamado `.env.local`.
2.  Copie o conteúdo do arquivo `.env` para o seu novo arquivo `.env.local`.
3.  Preencha os valores para as chaves do Firebase e do Stripe. Você pode encontrar esses valores nos painéis de cada serviço.

Seu arquivo `.env.local` deve ficar assim:

```
# Chaves do Firebase (Encontre em Configurações do Projeto > Geral > Seus apps)
NEXT_PUBLIC_FIREBASE_API_KEY=SUA_CHAVE_DE_API_AQUI
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=SEU_AUTH_DOMAIN_AQUI
NEXT_PUBLIC_FIREBASE_PROJECT_ID=SEU_PROJECT_ID_AQUI
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=SEU_STORAGE_BUCKET_AQUI
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=SEU_MESSAGING_SENDER_ID_AQUI
NEXT_PUBLIC_FIREBASE_APP_ID=SEU_APP_ID_AQUI

# Chaves do Stripe (Encontre em Desenvolvedores > Chaves de API)
STRIPE_SECRET_KEY=SUA_CHAVE_SECRETA_AQUI
STRIPE_WEBHOOK_SECRET=SEU_SEGREDO_DE_WEBHOOK_AQUI

# URL da sua aplicação (para desenvolvimento local)
NEXT_PUBLIC_APP_URL=http://localhost:9002
```

### 4. Rode o Servidor de Desenvolvimento

Agora, execute o seguinte comando para iniciar a aplicação:

```bash
npm run dev
```

A aplicação estará disponível em [http://localhost:9002](http://localhost:9002).

## Funcionalidades Principais

- **Dashboard:** Visão geral com estatísticas.
- **Gestão de Alunos:** Adicione, edite e visualize alunos (conectado ao Firestore).
- **Controle de Acesso:** Gerencie funcionários e suas permissões.
- **Financeiro:** Registre pagamentos e visualize o fluxo de caixa.
- **Assinatura:** Sistema de assinatura com integração Stripe e controle de acesso baseado no status do pagamento.
- **Recomendação de Treino IA:** Use Genkit para gerar treinos personalizados.
