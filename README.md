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

### 5. Testando como Aplicativo no Celular (PWA)

O FitCore é um Progressive Web App (PWA), o que significa que você pode "instalá-lo" no seu celular para ter uma experiência de aplicativo. Para testar:

1.  **Conecte seu celular na mesma rede Wi-Fi** que o seu computador.
2.  **Descubra o endereço IP do seu computador** na rede local:
    *   **No Windows:** Abra o `Prompt de Comando` e digite `ipconfig`. Procure pelo "Endereço IPv4". Geralmente começa com `192.168...`.
    *   **No macOS ou Linux:** Abra o `Terminal` e digite `ifconfig` ou `ip a`. Procure por `inet` na sua conexão de rede (ex: `wlo1` ou `en0`).
3.  **Acesse no celular:** Abra o navegador do seu celular e digite a URL `http://<SEU_ENDERECO_IP>:9002`. Substitua `<SEU_ENDERECO_IP>` pelo IP que você encontrou.
4.  **Adicione à Tela Inicial:**
    *   **No Android (Chrome):** Toque nos três pontos no canto superior direito e selecione a opção **"Instalar aplicativo"** ou **"Adicionar à tela inicial"**.
    *   **No iPhone (Safari):** Toque no ícone de compartilhamento (um quadrado com uma seta para cima) na barra inferior e selecione **"Adicionar à Tela de Início"**.

Pronto! Um ícone do FitCore aparecerá na sua tela inicial.

### 6. Solução de Problemas de Acesso na Rede Local

Se você seguiu os passos para testar no celular, mas a página não carrega (erro de "timeout" ou "demorou demais para responder"), o problema mais comum é o **firewall do seu computador** bloqueando a conexão.

Siga os passos abaixo para permitir o acesso:

#### No Windows (Firewall do Windows Defender)

1.  Pressione a tecla **Windows** e digite "Firewall". Selecione **"Firewall do Windows Defender"**.
2.  Clique em **"Permitir um aplicativo ou recurso através do Firewall do Windows Defender"** no menu à esquerda.
3.  Clique em **"Alterar configurações"** (você precisará de permissão de administrador).
4.  Procure na lista por itens relacionados a **"Node.js"** ou **"Node.js JavaScript Runtime"**.
5.  Certifique-se de que as caixas de seleção **"Privada"** e **"Pública"** estejam marcadas para o Node.js.
6.  Se o Node.js não estiver na lista, clique em **"Permitir outro aplicativo..."**, navegue até o local de instalação do Node.js (geralmente `C:\Program Files\nodejs\node.exe`) e adicione-o.
7.  Clique em **OK** e tente acessar novamente pelo celular.

#### No macOS

1.  Abra as **"Preferências do Sistema"** (ou "Ajustes do Sistema").
2.  Vá para **"Rede"** e depois **"Firewall"**.
3.  Clique no cadeado para fazer alterações e digite sua senha.
4.  Clique em **"Opções do Firewall..."**.
5.  Clique no botão **"+"**.
6.  Procure e adicione o aplicativo **"node"**. Ele pode estar em `/usr/local/bin/node`.
7.  Certifique-se de que a opção ao lado de "node" esteja configurada como **"Permitir conexões de entrada"**.
8.  Clique em **OK** e tente acessar novamente pelo celular.

#### No Linux (usando ufw)

Muitas distribuições Linux, como o Ubuntu, usam o `ufw` (Uncomplicated Firewall) como uma interface amigável para gerenciar as regras de firewall.

1.  Abra o **Terminal**.
2.  Primeiro, verifique se o `ufw` está ativo, digitando:
    ```bash
    sudo ufw status
    ```
3.  Se ele estiver `inativo`, você pode ativá-lo. **Cuidado:** Ativar o firewall pode bloquear o acesso SSH se você não tiver uma regra para permiti-lo. Se estiver em um computador local, é seguro prosseguir. Digite `sudo ufw enable`.
4.  Adicione uma regra para permitir conexões na porta da aplicação (`9002`):
    ```bash
    sudo ufw allow 9002/tcp
    ```
5.  Você verá uma mensagem como "Rule added" ou "Regra adicionada".
6.  Tente acessar novamente pelo celular.

Se mesmo após configurar o firewall o problema persistir, verifique se seu celular e computador estão conectados **exatamente na mesma rede Wi-Fi**. Algumas redes (especialmente corporativas ou públicas) possuem um "Isolamento de Clientes" que impede a comunicação entre dispositivos.

### 7. Acessando de Fora da Rede Local (Avançado)

Se você precisa que alguém fora da sua rede Wi-Fi acesse a aplicação rodando no seu computador, a forma mais robusta (porém mais complexa) é o **redirecionamento de portas** (port forwarding) no seu roteador.

**Aviso de Segurança:** Abrir portas no seu roteador expõe um serviço da sua rede interna à internet. Faça isso apenas para testes temporários e desative a regra quando não precisar mais. Ferramentas como o `ngrok` são geralmente mais seguras para este fim.

#### Passo a Passo para Redirecionamento de Portas

1.  **Acesse seu Roteador:** Abra um navegador e digite o endereço de IP do seu roteador. Os mais comuns são `192.168.0.1` ou `192.168.1.1`. Você precisará do usuário e senha de administrador (geralmente encontrados na etiqueta do aparelho).

2.  **Encontre a Seção Correta:** Procure por uma seção chamada **"Port Forwarding"**, "Redirecionamento de Portas", "Virtual Servers" ou algo semelhante. A localização varia muito entre os fabricantes.

3.  **Crie uma Nova Regra:** Você precisará preencher os seguintes campos:
    *   **Nome da Regra/Aplicação:** `FitCore Dev` (ou qualquer nome que preferir).
    *   **Porta Externa (ou WAN Port):** `9002`.
    *   **Porta Interna (ou LAN Port):** `9002`.
    *   **Endereço IP Interno (ou LAN IP Address):** O endereço IP do seu computador na rede local (ex: `192.168.1.6`).
    *   **Protocolo:** `TCP` (ou `TCP/UDP`).

4.  **Salve e Aplique:** Salve a nova regra. O roteador pode precisar reiniciar.

5.  **Descubra seu IP Público:** No seu computador, pesquise no Google por "qual meu IP". Anote o endereço que aparecer.

6.  **Acesse de Fora:** Agora, qualquer pessoa (ou você mesmo, usando a rede 4G/5G do seu celular) pode acessar a aplicação digitando no navegador:
    `http://<SEU_IP_PÚBLICO>:9002` (substitua `<SEU_IP_PÚBLICO>` pelo IP que você encontrou no passo 5).

Se não funcionar, é provável que seu provedor de internet utilize uma tecnologia chamada **CGNAT**, que impede o redirecionamento de portas. Nesse caso, ferramentas como `ngrok` ou `Tailscale` são as únicas alternativas.

## Banco de Dados e Persistência de Dados

**Importante:** Este projeto utiliza um **banco de dados em memória** para simplificar a demonstração e o desenvolvimento local. Isso significa que toda a informação (alunos, pagamentos, treinos, etc.) é carregada a partir de arquivos internos e **qualquer alteração feita durante o uso será perdida quando o servidor de desenvolvimento for reiniciado**.

### Onde os Dados Estão Armazenados?

Os dados iniciais da aplicação estão localizados diretamente no código-fonte, dentro da pasta `src/services/`. Cada arquivo corresponde a uma "tabela" do nosso banco de dados simulado:

-   `src/services/members.ts`: Contém a lista inicial de alunos.
-   `src/services/employees.ts`: Lista de funcionários e seus perfis.
-   `src/services/payments.ts`: Histórico de pagamentos.
-   `src/services/workouts.ts`: Modelos de planos de treino.
-   `src/services/exercises.ts`: O banco de exercícios.
-   E assim por diante para os demais arquivos na pasta.

### Como Fazer um "Backup"?

Como os dados são parte do código, fazer um backup do estado inicial é simples:

1.  **Backup da Estrutura Inicial:** Simplesmente copie toda a pasta `src/services/` para um local seguro. Se você personalizou os dados iniciais nesses arquivos, este será o seu backup.
2.  **Restaurando o Backup:** Para restaurar, basta substituir a pasta `src/services/` do projeto pela sua cópia de backup.

Este método garante que você possa experimentar, fazer alterações e, se necessário, retornar facilmente ao estado original que você configurou.

## Logins de Teste

-   **Superadmin:** `superadmin@fitcore.com` / senha: `superadminpass`
-   **Admin (Academia Exemplo):** `admin@admin` / senha: `uUmope5Z`
-   **Gestor:** `carla` / senha: `123`
-   **Professor:** `marcos` / senha: `123`
-   **Recepção:** `juliana` / senha: `123`
-   **Aluno:** `joao.silva@example.com` / senha: `123`
