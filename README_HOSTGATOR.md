# Guia de Hospedagem - Hostinger / HostGator

Este guia explica como hospedar este projeto na Hostinger ou HostGator (Hospedagem Compartilhada).

## Configuração de Arquivo Único (Single File)

O projeto foi configurado para gerar um **único arquivo `index.html`** contendo todo o CSS e JavaScript. Isso facilita muito a hospedagem em servidores como Hostinger, pois você só precisa subir este arquivo e o `.htaccess`.

## Passos para Hospedar:

1.  **Gerar o Build:**
    No seu computador local (após baixar o código), execute:
    ```bash
    npm install
    npm run build
    ```
2.  **Preparar os Arquivos:**
    Após o build, você terá uma pasta chamada `dist`.
3.  **Subir para o Servidor:**
    Usando o Gerenciador de Arquivos da Hostinger ou um cliente FTP (FileZilla):
    *   Suba o conteúdo da pasta `dist` (incluindo o `index.html` e o `.htaccess`) para a pasta `public_html`.
4.  **Configurar Variáveis de Ambiente:**
    As variáveis do Supabase devem estar no arquivo `.env` no seu computador no momento em que você rodar o `npm run build`. Elas serão embutidas automaticamente no arquivo `index.html`.

## Arquivos de Configuração Incluídos

*   `public/.htaccess`: Garante que as rotas internas (como `/admin`) funcionem corretamente e força o uso de HTTPS.
*   `vite.config.ts`: Configurado com o plugin `vite-plugin-singlefile` para gerar o arquivo unificado.

## Dicas de Segurança

*   Certifique-se de que o seu banco de dados Supabase tenha as regras de RLS (Row Level Security) ativas para proteger seus dados.
