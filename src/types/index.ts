// ── Usuário ──────────────────────────────────────────────────
export interface User {
  _id: string;
  nome: string;
  email: string;
  plano: 'free' | 'premium';
  progresso_total: number;
  createdAt: string;
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

// ── UI ───────────────────────────────────────────────────────
export type Page = 'home' | 'cursos' | 'planos' | 'sobre' | 'dashboard';
export type AuthTab = 'login' | 'register';
export type PayMethod = 'pix' | 'card' | 'boleto';
export type PlanType = 'anual' | 'mensal';
