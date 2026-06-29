// ── Usuário ──────────────────────────────────────────────────
export interface User {
  _id: string;
  nome: string;
  email: string;
  plano: 'free' | 'premium';
  progresso_total: number;
  createdAt: string;
  avatar?: string | null;
  // Auth provider
  provider?: 'local' | 'google' | 'apple';
  // Pagamento
  assinaturaStatus?: 'ativa' | 'cancelada' | 'expirada' | null;
  assinaturaExpira?: string | null;
  dataCompra?: string | null;
  kiwifyId?: string | null;
  plan?: 'free' | 'mensal' | 'anual';
  planActive?: boolean;
  planExpiresAt?: string | null;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}

// ── Conteúdo / Matéria ───────────────────────────────────────
export type Categoria =
  | 'Fundamentos'
  | 'Álgebra'
  | 'Funções'
  | 'Geometria'
  | 'Estatística e Probabilidade'
  | 'Matemática Discreta';

export interface Conteudo {
  _id: string;
  nome: string;
  categoria: Categoria;
  descricao: string;
  icone: string;
  totalAulas: number;
  aulasGratuitas: number;
}

export interface ConteudoComProgresso extends Conteudo {
  aulasConcluidasCount: number;
  percentual: number;
}

// ── Aulas ────────────────────────────────────────────────────
export interface Aula {
  _id: string;
  titulo: string;
  descricao: string;
  video_url: string;
  duracao: string;
  conteudo_id: string;
  ordem: number;
  tipo: 'free' | 'premium';
  materialPdf?: string;
}

export interface AulaComStatus extends Aula {
  concluida: boolean;
  bloqueada: boolean;
}

// ── Progresso ────────────────────────────────────────────────
export interface Progresso {
  user_id: string;
  aula_id: string;
  concluido: boolean;
  data_conclusao?: string;
}

// ── Plano ────────────────────────────────────────────────────
export interface Plano {
  id: string;
  nome: string;
  preco: number;
  beneficios: string[];
}

// ── Exercícios ──────────────────────────────────────────────
export interface Questao {
  _id?: string;
  enunciado: string;
  alternativas: {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
  };
  respostaCorreta: string;
}

export interface Exercicio {
  _id: string;
  titulo: string;
  conteudo_id: string;
  dificuldade: 'Fácil' | 'Médio' | 'Difícil';
  totalQuestoes: number;
  premium: boolean;
  questoes?: Questao[];
}

export interface ExercicioComProgresso extends Exercicio {
  questoesRespondidas: number;
  status: 'Não iniciado' | 'Em andamento' | 'Concluído';
  percentual: number;
}

// ── UI ───────────────────────────────────────────────────────
export type Page = 'home' | 'cursos' | 'exercicios' | 'planos' | 'sobre' | 'dashboard' | 'resolucao' | 'configuracoes';
export type AuthTab = 'login' | 'register' | 'update_name';
export type PayMethod = 'pix' | 'card' | 'boleto';
export type PlanType = 'anual' | 'mensal';
