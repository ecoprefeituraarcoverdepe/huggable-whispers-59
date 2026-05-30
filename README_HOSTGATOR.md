# Guia de Hospedagem - HostGator

Este guia explica como hospedar este projeto na HostGator (Hospedagem Compartilhada ou VPS).

## Requisitos Prévios

1.  Ter uma conta na HostGator ativa.
2.  Acesso ao cPanel.

## Opção 1: Hospedagem Estática (Recomendado para Shared Hosting)

Como este projeto utiliza **TanStack Start** (que é focado em SSR), a forma mais simples de hospedar na HostGator compartilhada é como um **SPA (Single Page Application)**.

### Passos:

1.  **Gerar o Build:**
    No seu computador local, execute:
    ```bash
    npm install
    npm run build
    ```
2.  **Preparar os Arquivos:**
    A pasta que você deve subir é a `dist/client`.
3.  **Configurar o .htaccess (Já incluído):**
    O arquivo `public/.htaccess` será copiado para `dist/client/.htaccess`. Ele é essencial para que as rotas (ex: `/admin`, `/consulta`) funcionem corretamente.
4.  **Configurar Variáveis de Ambiente:**
    Como você não terá um painel de "Secrets" na HostGator compartilhada, as variáveis do Supabase devem estar no arquivo `.env` no momento do build. Elas serão embutidas no código JavaScript.
    *   `VITE_SUPABASE_URL`
    *   `VITE_SUPABASE_ANON_KEY`

## Opção 2: Hospedagem com Node.js (cPanel)

Se o seu plano da HostGator suportar o "Node.js Selector" no cPanel:

1.  Suba o projeto inteiro (exceto `node_modules`).
2.  No cPanel, vá em **Setup Node.js App**.
3.  Crie uma nova aplicação apontando para a pasta do projeto.
4.  Defina o arquivo de inicialização como `dist/server/index.js`.
5.  Adicione as Variáveis de Ambiente no painel do Node.js App no cPanel.

## Arquivos de Configuração Incluídos

*   `public/.htaccess`: Configurado para forçar HTTPS e gerenciar rotas de SPA.
*   `vite.config.ts`: Configurado com `base: "./"` para suportar subpastas (ex: `meusite.com/vagas`).

## Suporte ao Supabase

Certifique-se de que as permissões de RLS no seu banco de dados Supabase estão corretas para o domínio final da HostGator.
