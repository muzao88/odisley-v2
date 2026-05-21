# Odisley Matemática — Next.js 14 + MongoDB

Plataforma completa de matemática para vestibular e ENEM.

---

## 📁 Estrutura do projeto

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/route.ts   POST /api/auth/register
│   │   │   └── login/route.ts      POST /api/auth/login
│   │   ├── conteudos/
│   │   │   ├── route.ts            GET  /api/conteudos
│   │   │   └── [id]/aulas/route.ts GET  /api/conteudos/:id/aulas
│   │   └── progresso/
│   │       ├── route.ts            POST /api/progresso
│   │       └── [userId]/route.ts   GET  /api/progresso/:userId
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── App.tsx              Roteamento + estado global
│   ├── AuthContext.tsx      Contexto de autenticação (JWT + localStorage)
│   ├── AuthModal.tsx        Modal login / cadastro
│   ├── Navbar.tsx           Navbar com menu do usuário
│   ├── PaymentModal.tsx     Modal de pagamento
│   ├── Footer.tsx
│   └── pages/
│       ├── HomePage.tsx     Landing page
│       ├── CoursesPage.tsx  24 conteúdos por categoria
│       ├── ConteudoPage.tsx Player + lista de aulas + progresso
│       ├── PlansPage.tsx    Planos + FAQ
│       ├── AboutPage.tsx    Sobre o professor
│       └── DashboardPage.tsx Área do aluno
├── data/
│   └── conteudos.ts         Dados dos 24 conteúdos de matemática
├── lib/
│   ├── mongodb.ts           Conexão com MongoDB
│   ├── auth.ts              JWT helpers
│   └── models.ts            Schemas: User, Conteudo, Aula, Progresso
└── types/
    └── index.ts             Todos os tipos TypeScript
```

---

## 🚀 Como rodar localmente

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo de exemplo:
```bash
copy .env.example .env.local
```

Edite o `.env.local` com suas credenciais:
```
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/odisley
JWT_SECRET=coloque-uma-frase-secreta-aqui
```

### 3. Criar banco de dados (MongoDB Atlas — gratuito)

1. Acesse https://mongodb.com/atlas e crie uma conta gratuita
2. Crie um **cluster gratuito** (M0)
3. Em **Database Access**, crie um usuário com senha
4. Em **Network Access**, adicione `0.0.0.0/0` (acesso de qualquer IP)
5. Em **Connect → Drivers**, copie a connection string e cole no `MONGODB_URI`

### 4. Rodar o projeto

```bash
npm run dev
```

Acesse http://localhost:3000

---

## 🌐 Deploy na Vercel

1. Suba o código no GitHub
2. Em https://vercel.com, importe o repositório
3. Em **Environment Variables**, adicione:
   - `MONGODB_URI` → sua connection string do MongoDB
   - `JWT_SECRET` → sua frase secreta
4. Clique em Deploy

---

## 📌 Conteúdos de matemática incluídos (24 no total)

### Fundamentos (5)
- Matemática Básica, Razão e Proporção, Porcentagem, Regra de Três, Potenciação e Radiciação

### Álgebra (7)
- Expressões Algébricas, Produtos Notáveis, Fatoração, Equações do 1º Grau,
  Equações do 2º Grau, Inequações, Sistemas Lineares

### Funções (4)
- Função Afim, Função Quadrática, Função Exponencial, Função Logarítmica

### Geometria (4)
- Geometria Plana, Geometria Espacial, Geometria Analítica, Trigonometria

### Estatística e Probabilidade (2)
- Estatística, Probabilidade

### Matemática Discreta (2)
- Análise Combinatória, Progressões (PA e PG)

---

## 🔗 APIs disponíveis

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /api/auth/register | Cadastrar usuário |
| POST | /api/auth/login | Login |
| GET | /api/conteudos | Listar conteúdos (+ progresso se autenticado) |
| GET | /api/conteudos/:id/aulas | Listar aulas com status de bloqueio |
| POST | /api/progresso | Marcar aula como concluída |
| GET | /api/progresso/:userId | Progresso completo do usuário |

---

## 📋 Próximos passos sugeridos

- [ ] Integrar gateway de pagamento (Pagar.me ou MercadoPago)
- [ ] Painel admin para cadastrar aulas e vídeos
- [ ] Adicionar URLs de vídeo do YouTube nas aulas
- [ ] Exercícios e simulados por conteúdo
- [ ] E-mail de boas-vindas com Resend ou Nodemailer
- [ ] Webhook para ativar plano premium após pagamento
"# Projeto-Plataforma-de-Matematica-" 
