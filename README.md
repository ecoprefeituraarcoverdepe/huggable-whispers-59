# São João Sustentável - Arcoverde

Este é o repositório do projeto **São João Sustentável**, um sistema web desenvolvido para a gestão e registo de participantes no evento promovido pela Eco Prefeitura de Arcoverde, PE.

A aplicação oferece uma interface pública para a inscrição de participantes no evento e um painel de administração reservado para a gestão de inscrições, monitorização de estatísticas e organização dos dias do evento.

## 🚀 Funcionalidades

### Área Pública (Inscrições)
* **Página de Destino (Landing Page):** Informações sobre o evento sustentável.
* **Formulário de Registo:** Permite aos utilizadores inscreverem-se nos dias do evento.
* **Consulta e Confirmação:** Ecrãs de sucesso e vista de consulta das inscrições.

### Painel de Administração
* **Autenticação Segura:** Acesso restrito via login de administrador.
* **Dashboard (Estatísticas):** Cartões de estatísticas (`StatsCards`) com a visão geral do evento.
* **Gestão de Inscrições:** Tabela de registos (`RegistrationsTable`) para visualizar e gerir os participantes inscritos.
* **Gestão de Calendário:** Grelha de dias do evento (`EventDaysGrid`) e diálogos de configuração de dias (`DayDialog`).

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído utilizando um ecossistema moderno de desenvolvimento web:

* **Frontend:** [React](https://reactjs.org/) (com [Vite](https://vitejs.dev/))
* **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
* **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
* **Componentes de UI:** [shadcn/ui](https://ui.shadcn.com/)
* **Backend as a Service (BaaS):** [Supabase](https://supabase.com/) (Autenticação e Base de Dados PostgreSQL)
* **Gestor de Pacotes:** [Bun](https://bun.sh/) (também compatível com npm/yarn)

## 📁 Estrutura de Diretórios Principal

├── src/
│   ├── assets/               # Imagens e recursos estáticos (logos, fundos)
│   ├── components/           # Componentes React
│   │   ├── admin/            # Componentes do painel de administração
│   │   ├── registration/     # Componentes da área pública de inscrições
│   │   └── ui/               # Componentes base reutilizáveis (shadcn/ui)
│   ├── hooks/                # Custom React Hooks
│   ├── integrations/         # Integrações de serviços externos
│   │   └── supabase/         # Configurações, tipos e clientes do Supabase
│   ├── lib/                  # Utilitários e funções auxiliares
│   ├── routes/               # Definição das rotas da aplicação
│   └── store/                # Gestão de estado global (Zustand/Context)
├── supabase/
│   └── migrations/           # Ficheiros SQL de migração da base de dados
├── .env                      # Variáveis de ambiente
├── bun.lock / package.json   # Dependências e scripts do projeto
├── tailwind.config.js        # Configuração do Tailwind (embutida noutros configs)
├── tsconfig.json             # Configuração do TypeScript
└── vite.config.ts            # Configuração do bundler Vite

```

## ⚙️ Como Executar o Projeto Localmente

### Pré-requisitos

* Ter o [Bun](https://bun.sh/) ou [Node.js](https://nodejs.org/) instalado.
* Uma conta no [Supabase](https://supabase.com/) (ou uma instância local do Supabase configurada).

### Passo a passo

1. **Clonar o repositório:**
```bash
git clone <url-do-repositorio>
cd sao-joao-sustentavel

```


2. **Instalar as dependências:**
Usando o Bun:
```bash
bun install

```


*Ou usando npm:* `npm install`
3. **Configurar as Variáveis de Ambiente:**
Copie o ficheiro de exemplo (se existir) ou crie um ficheiro `.env` na raiz do projeto com as seguintes chaves do seu projeto Supabase:
```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase

```


4. **Executar as Migrações da Base de Dados (Opcional, mas recomendado):**
Se estiver a configurar um novo projeto no Supabase, execute os scripts SQL presentes na pasta `supabase/migrations/` no SQL Editor do painel do Supabase.
5. **Iniciar o servidor de desenvolvimento:**
```bash
bun run dev

```


*Ou usando npm:* `npm run dev`
6. **Aceder à aplicação:**
Abra o navegador e aceda a `http://localhost:5173` (ou a porta indicada no terminal).

## 📝 Scripts Disponíveis

No diretório do projeto, pode executar os seguintes comandos:

* `bun run dev` - Inicia o servidor de desenvolvimento.
* `bun run build` - Compila a aplicação para produção.
* `bun run preview` - Inicia um servidor local para visualizar a build de produção.
* `bun run lint` - Executa a análise estática do código com o ESLint.

## 🤝 Contribuição

1. Faça um Fork do projeto.
2. Crie uma Branch para a sua funcionalidade (`git checkout -b feature/NovaFuncionalidade`).
3. Faça Commit das suas alterações (`git commit -m 'Adiciona uma nova funcionalidade'`).
4. Faça Push para a Branch (`git push origin feature/NovaFuncionalidade`).
5. Abra um Pull Request.
"""
