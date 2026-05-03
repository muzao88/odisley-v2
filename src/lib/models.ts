import mongoose, { Schema, model, models } from 'mongoose';

// ── User ─────────────────────────────────────────────────────
const UserSchema = new Schema(
  {
    nome: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    // senha opcional — usuários OAuth não têm senha local
    senha: { type: String, default: null },
    plano: { type: String, enum: ['free', 'premium'], default: 'free' },
    progresso_total: { type: Number, default: 0 },
    // OAuth providers
    provider: { type: String, enum: ['local', 'google', 'apple'], default: 'local' },
    providerId: { type: String, default: null },
    avatar: { type: String, default: null },
    // Pagamento
    stripeCustomerId: { type: String, default: null },
    mercadopagoId: { type: String, default: null },
    assinaturaStatus: { type: String, enum: ['ativa', 'cancelada', 'expirada', null], default: null },
    assinaturaExpira: { type: Date, default: null },
  },
  { timestamps: true }
);

export const UserModel = models.User || model('User', UserSchema);

// ── Conteúdo ─────────────────────────────────────────────────
const ConteudoSchema = new Schema(
  {
    nome: { type: String, required: true },
    categoria: {
      type: String,
      enum: ['Fundamentos', 'Álgebra', 'Funções', 'Geometria', 'Estatística e Probabilidade', 'Matemática Discreta'],
      required: true,
    },
    descricao: { type: String, default: '' },
    icone: { type: String, default: '📚' },
    totalAulas: { type: Number, default: 0 },
    aulasGratuitas: { type: Number, default: 2 },
  },
  { timestamps: true }
);

export const ConteudoModel = models.Conteudo || model('Conteudo', ConteudoSchema);

// ── Aula ─────────────────────────────────────────────────────
const AulaSchema = new Schema(
  {
    titulo: { type: String, required: true },
    descricao: { type: String, default: '' },
    video_url: { type: String, default: '' },
    duracao: { type: String, default: '0:00' },
    conteudo_id: { type: Schema.Types.ObjectId, ref: 'Conteudo', required: true },
    ordem: { type: Number, required: true },
    tipo: { type: String, enum: ['free', 'premium'], default: 'premium' },
    materialPdf: { type: String, default: '' },
  },
  { timestamps: true }
);

export const AulaModel = models.Aula || model('Aula', AulaSchema);

// ── Progresso ─────────────────────────────────────────────────
const ProgressoSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    aula_id: { type: Schema.Types.ObjectId, ref: 'Aula', required: true },
    concluido: { type: Boolean, default: false },
    data_conclusao: { type: Date },
  },
  { timestamps: true }
);

ProgressoSchema.index({ user_id: 1, aula_id: 1 }, { unique: true });

export const ProgressoModel = models.Progresso || model('Progresso', ProgressoSchema);

// ── Assinatura ────────────────────────────────────────────────
const AssinaturaSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    plano: { type: String, enum: ['mensal', 'anual'], required: true },
    status: { type: String, enum: ['ativa', 'cancelada', 'expirada'], default: 'ativa' },
    gateway: { type: String, enum: ['stripe', 'mercadopago'], required: true },
    gatewaySubscriptionId: { type: String },
    valor: { type: Number, required: true },
    inicio: { type: Date, default: Date.now },
    expira: { type: Date, required: true },
    canceladaEm: { type: Date, default: null },
  },
  { timestamps: true }
);

export const AssinaturaModel = models.Assinatura || model('Assinatura', AssinaturaSchema);
