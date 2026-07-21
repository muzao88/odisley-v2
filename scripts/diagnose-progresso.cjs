/**
 * DIAGNÓSTICO DE PROGRESSO — executa direto no banco MongoDB
 * Uso: node scripts/diagnose-progresso.cjs
 */
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://devmurilloo_db_user:ljFrVnFBHnY3c4wK@muza88.fhljgkc.mongodb.net/odisley?retryWrites=true&w=majority&appName=muza88';

// Schemas mínimos para a consulta
const ProgressoSchema = new mongoose.Schema({
  user_id: mongoose.Schema.Types.Mixed,
  aula_id: String,
  concluido: Boolean,
  data_conclusao: Date,
}, { timestamps: true });

const AulaSchema = new mongoose.Schema({
  titulo: String,
  conteudo_id: mongoose.Schema.Types.ObjectId,
  ordem: Number,
}, { timestamps: true });

const ConteudoSchema = new mongoose.Schema({
  nome: String,
  categoria: String,
  totalAulas: Number,
}, { timestamps: true });

const Progresso = mongoose.models.Progresso || mongoose.model('Progresso', ProgressoSchema);
const Aula = mongoose.models.Aula || mongoose.model('Aula', AulaSchema);
const Conteudo = mongoose.models.Conteudo || mongoose.model('Conteudo', ConteudoSchema);

// Replica EXATAMENTE mockAulas() em ConteudoPage.tsx linha 268:
// _id: `aula-${nome.replace(/\s/g, "-").toLowerCase()}-${i}`
function mockAulaPrefix(nome) {
  return `aula-${nome.replace(/\s/g, '-').toLowerCase()}-`;
}

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Conectado ao MongoDB\n');

  // ── 1. Todos os progressos ───────────────────────────────────────────────────
  const allProgressos = await Progresso.find({}).lean();
  console.log(`📊 Total de documentos em "progressos": ${allProgressos.length}`);

  if (allProgressos.length === 0) {
    console.log('\n❌ DIAGNÓSTICO: Nenhum registro de progresso no banco!');
    console.log('   → A aula NÃO está sendo salva via POST /api/progresso ao ser marcada como concluída.');
    console.log('   → Problema está na GRAVAÇÃO, não na leitura.');
    await mongoose.disconnect();
    return;
  }

  // Agrupa por usuário
  const byUser = {};
  for (const p of allProgressos) {
    const uid = p.user_id?.toString();
    if (!byUser[uid]) byUser[uid] = [];
    byUser[uid].push(p);
  }

  console.log(`\n👥 Usuários com progresso registrado: ${Object.keys(byUser).length}`);
  for (const [uid, progs] of Object.entries(byUser)) {
    const concluidas = progs.filter(p => p.concluido);
    console.log(`\n  User ID: ${uid}`);
    console.log(`  Total registros: ${progs.length} | com concluido=true: ${concluidas.length}`);
    if (concluidas.length > 0) {
      console.log('  aula_ids com concluido=true:');
      for (const p of concluidas) {
        console.log(`    → "${p.aula_id}"`);
      }
    } else {
      console.log('  ⚠️  Todos os registros têm concluido=false!');
    }
  }

  // ── 2. Aulas reais no AulaModel ──────────────────────────────────────────────
  const aulasCount = await Aula.countDocuments();
  console.log(`\n🎬 Total de aulas reais no AulaModel: ${aulasCount}`);
  if (aulasCount === 0) {
    console.log('   → MODO MOCK ativo (nenhuma aula real cadastrada no banco).');
    console.log('   → A API vai usar o fallback por prefixo.');
  }

  // ── 3. Conteúdos e match de prefixo ─────────────────────────────────────────
  const conteudos = await Conteudo.find({}).lean();
  console.log(`\n📚 Total de conteúdos: ${conteudos.length}`);

  const allConcluidas = allProgressos.filter(p => p.concluido).map(p => p.aula_id?.toString()).filter(Boolean);
  console.log(`\n🔍 Testando match de prefixo (total de aula_ids concluídos: ${allConcluidas.length}):`);

  let totalMatches = 0;
  for (const c of conteudos) {
    const prefix = mockAulaPrefix(c.nome);
    const matched = allConcluidas.filter(id => id.startsWith(prefix));
    totalMatches += matched.length;
    if (matched.length > 0) {
      console.log(`  ✅ "${c.nome}"`);
      console.log(`     prefix: "${prefix}"`);
      console.log(`     matches: [${matched.join(', ')}]`);
    }
  }

  if (totalMatches === 0 && allConcluidas.length > 0) {
    console.log('\n  ❌ NENHUM match encontrado entre aula_ids salvos e prefixos esperados!');
    console.log('  📋 aula_ids salvos vs. prefixos esperados:');
    console.log('\n  IDs salvos no banco:');
    for (const id of [...new Set(allConcluidas)]) {
      console.log(`    → "${id}"`);
    }
    console.log('\n  Prefixos esperados pela API (primeiros 5 conteúdos):');
    for (const c of conteudos.slice(0, 5)) {
      console.log(`    → "${mockAulaPrefix(c.nome)}"  (conteúdo: "${c.nome}")`);
    }
  }

  // ── 4. Verificar se há aulas_ids que usam outro padrão ───────────────────────
  if (allConcluidas.length > 0) {
    console.log(`\n📋 TODOS os aula_ids concluídos no banco:`);
    for (const id of [...new Set(allConcluidas)]) {
      console.log(`  → "${id}"`);
    }
  }

  await mongoose.disconnect();
  console.log('\n✅ Diagnóstico concluído.');
}

main().catch(err => {
  console.error('❌ Erro:', err.message);
  process.exit(1);
});
