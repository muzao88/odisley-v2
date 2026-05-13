import type { Categoria } from "@/types";

export interface ConteudoSeed {
  nome: string;
  categoria: Categoria;
  descricao: string;
  icone: string;
  totalAulas: number;
  aulasGratuitas: number;
  // Se true, TODAS as aulas são gratuitas — sem login necessário
  totalmenteGratuito?: boolean;
}

export const CONTEUDOS_SEED: ConteudoSeed[] = [
  // FUNDAMENTOS
  {
    nome: "Matemática Básica",
    categoria: "Fundamentos",
    descricao: "Operações fundamentais, frações, decimais e números inteiros.",
    icone: "🔢",
    totalAulas: 8,
    aulasGratuitas: 8,
    totalmenteGratuito: true,
  },
  {
    nome: "Razão e Proporção",
    categoria: "Fundamentos",
    descricao: "Grandezas proporcionais, razões e aplicações práticas.",
    icone: "⚖️",
    totalAulas: 6,
    aulasGratuitas: 2,
  },
  {
    nome: "Porcentagem",
    categoria: "Fundamentos",
    descricao: "Cálculo de porcentagem, acréscimos, descontos e juros.",
    icone: "%",
    totalAulas: 7,
    aulasGratuitas: 2,
  },
  {
    nome: "Regra de Três",
    categoria: "Fundamentos",
    descricao: "Simples e composta, direta e inversamente proporcional.",
    icone: "3️⃣",
    totalAulas: 5,
    aulasGratuitas: 2,
  },
  {
    nome: "Potenciação e Radiciação",
    categoria: "Fundamentos",
    descricao: "Propriedades das potências, raízes e operações com radicais.",
    icone: "√",
    totalAulas: 7,
    aulasGratuitas: 2,
  },
  // ÁLGEBRA
  {
    nome: "Expressões Algébricas",
    categoria: "Álgebra",
    descricao: "Monômios, polinômios, operações e simplificações.",
    icone: "🔡",
    totalAulas: 6,
    aulasGratuitas: 2,
  },
  {
    nome: "Produtos Notáveis",
    categoria: "Álgebra",
    descricao: "Quadrado da soma, diferença e produto da soma pela diferença.",
    icone: "✖️",
    totalAulas: 5,
    aulasGratuitas: 2,
  },
  {
    nome: "Fatoração",
    categoria: "Álgebra",
    descricao: "Fator comum, agrupamento, diferença de quadrados e trinômios.",
    icone: "🧩",
    totalAulas: 7,
    aulasGratuitas: 2,
  },
  {
    nome: "Equações do 1º Grau",
    categoria: "Álgebra",
    descricao: "Resolução, problemas e aplicações de equações lineares.",
    icone: "1️⃣",
    totalAulas: 6,
    aulasGratuitas: 2,
  },
  {
    nome: "Equações do 2º Grau",
    categoria: "Álgebra",
    descricao: "Fórmula de Bhaskara, discriminante e relações de Girard.",
    icone: "2️⃣",
    totalAulas: 8,
    aulasGratuitas: 2,
  },
  {
    nome: "Inequações",
    categoria: "Álgebra",
    descricao: "Inequações do 1º e 2º grau, representação e resolução.",
    icone: "↔️",
    totalAulas: 6,
    aulasGratuitas: 2,
  },
  {
    nome: "Sistemas Lineares",
    categoria: "Álgebra",
    descricao: "Métodos de substituição, adição e gráfico.",
    icone: "📐",
    totalAulas: 7,
    aulasGratuitas: 2,
  },
  // FUNÇÕES
  {
    nome: "Função Afim",
    categoria: "Funções",
    descricao: "Lei de formação, gráfico, zeros e crescimento.",
    icone: "📈",
    totalAulas: 8,
    aulasGratuitas: 2,
  },
  {
    nome: "Função Quadrática",
    categoria: "Funções",
    descricao: "Parábola, vértice, domínio e aplicações no ENEM.",
    icone: "🔄",
    totalAulas: 9,
    aulasGratuitas: 2,
  },
  {
    nome: "Função Exponencial",
    categoria: "Funções",
    descricao: "Crescimento e decaimento exponencial, gráficos e aplicações.",
    icone: "📊",
    totalAulas: 7,
    aulasGratuitas: 2,
  },
  {
    nome: "Função Logarítmica",
    categoria: "Funções",
    descricao: "Logaritmos, propriedades e equações logarítmicas.",
    icone: "log",
    totalAulas: 8,
    aulasGratuitas: 2,
  },
  {
    nome: "Função Modular",
    categoria: "Funções",
    descricao: "Conceito de módulo, equações, inequações e gráficos modulares.",
    icone: "｜x｜",
    totalAulas: 6,
    aulasGratuitas: 1,
  },
  {
    nome: "Função Trigonométrica",
    categoria: "Funções",
    descricao: "Seno, cosseno, tangente e gráficos das funções circulares.",
    icone: "〰️",
    totalAulas: 6,
    aulasGratuitas: 1,
  },
  // GEOMETRIA
  {
    nome: "Geometria Plana",
    categoria: "Geometria",
    descricao: "Área e perímetro de figuras planas, teorema de Tales.",
    icone: "📏",
    totalAulas: 10,
    aulasGratuitas: 2,
  },
  {
    nome: "Geometria Espacial",
    categoria: "Geometria",
    descricao: "Sólidos geométricos, volume e área total.",
    icone: "🎲",
    totalAulas: 9,
    aulasGratuitas: 2,
  },
  {
    nome: "Geometria Analítica",
    categoria: "Geometria",
    descricao: "Ponto, reta e circunferência no plano cartesiano.",
    icone: "📍",
    totalAulas: 10,
    aulasGratuitas: 2,
  },
  {
    nome: "Trigonometria",
    categoria: "Geometria",
    descricao: "Seno, cosseno, tangente, lei dos senos e cossenos.",
    icone: "📐",
    totalAulas: 10,
    aulasGratuitas: 2,
  },
  // ESTATÍSTICA E PROBABILIDADE
  {
    nome: "Estatística",
    categoria: "Estatística e Probabilidade",
    descricao: "Média, mediana, moda, desvio padrão e gráficos.",
    icone: "📉",
    totalAulas: 8,
    aulasGratuitas: 2,
  },
  {
    nome: "Probabilidade",
    categoria: "Estatística e Probabilidade",
    descricao: "Espaço amostral, eventos e cálculo de probabilidades.",
    icone: "🎲",
    totalAulas: 7,
    aulasGratuitas: 2,
  },
  // MATEMÁTICA DISCRETA
  {
    nome: "Análise Combinatória",
    categoria: "Matemática Discreta",
    descricao: "Fatorial, arranjos, combinações e permutações.",
    icone: "🔢",
    totalAulas: 9,
    aulasGratuitas: 2,
  },
  {
    nome: "Progressões (PA e PG)",
    categoria: "Matemática Discreta",
    descricao: "Progressão aritmética e geométrica, termos e somas.",
    icone: "🔁",
    totalAulas: 8,
    aulasGratuitas: 2,
  },
];

export const CATEGORIAS_ORDER: Categoria[] = [
  "Fundamentos",
  "Álgebra",
  "Funções",
  "Geometria",
  "Estatística e Probabilidade",
  "Matemática Discreta",
];

export const CATEGORIA_CORES: Record<Categoria, string> = {
  Fundamentos: "#378ADD",
  Álgebra: "#185FA5",
  Funções: "#3fcf8e",
  Geometria: "#f7934f",
  "Estatística e Probabilidade": "#f7c94f",
  "Matemática Discreta": "#f74f4f",
};

export const CATEGORIA_ICONES: Record<Categoria, string> = {
  Fundamentos: "🔢",
  Álgebra: "🔡",
  Funções: "📈",
  Geometria: "📐",
  "Estatística e Probabilidade": "📊",
  "Matemática Discreta": "🔁",
};
