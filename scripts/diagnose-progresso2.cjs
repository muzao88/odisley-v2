/**
 * DIAGNÓSTICO 2 — verifica se o cruzamento de IDs está funcionando
 * O problema suspeito: ObjectId vs String no match
 */
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://devmurilloo_db_user:ljFrVnFBHnY3c4wK@muza88.fhljgkc.mongodb.net/odisley?retryWrites=true&w=majority&appName=muza88';

const ProgressoSchema = new mongoose.Schema({
  user_id: mongoose.Schema.Types.Mixed,
  aula_id: String,
  concluido: Boolean,
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

// Simula exatamente o que GET /api/conteudos faz para um usuário específico
async function simulateApiForUser(userId) {
  console.log(`\n=== Simulando GET /api/conteudos para user: ${userId} ===\n`);

  // Passo 1: busca progressos
  const progressos = await Progresso.find({
    user_id: userId,
    concluido: true,
  }).select('aula_id').lean();

  const aulasConcluidas = new Set(progressos.map(p => p.aula_id.toString()));
  console.log(`Progressos concluídos: ${aulasConcluidas.size}`);
  console.log('IDs:', [...aulasConcluidas]);

  // Passo 2: busca cada conteúdo e tenta cruzar
  const conteudos = await Conteudo.find({}).lean();
  let totalMatch = 0;

  for (const c of conteudos) {
    const aulas = await Aula.find({ conteudo_id: c._id }).select('_id').lean();
    
    if (aulas.length === 0) continue;

    const aulaIds = aulas.map(a => a._id.toString());
    const matched = aulaIds.filter(id => aulasConcluidas.has(id));

    if (matched.length > 0) {
      totalMatch += matched.length;
      const pct = Math.round((matched.length / c.totalAulas) * 100);
      console.log(`\n✅ "${c.nome}": ${matched.length}/${c.totalAulas} concluídas (${pct}%)`);
      console.log(`   Aulas concluídas: [${matched.join(', ')}]`);
    }
  }

  if (totalMatch === 0) {
    console.log('\n❌ Zero matches encontrados!');
    console.log('\nVerificando cruzamento manual:');
    
    // Pega o primeiro progresso e busca a aula correspondente
    const primeiroId = [...aulasConcluidas][0];
    console.log(`  Buscando aula com _id="${primeiroId}" no AulaModel...`);
    
    try {
      const aula = await Aula.findById(primeiroId).lean();
      if (aula) {
        console.log(`  ✅ Aula encontrada: "${aula.titulo}" | conteudo_id: ${aula.conteudo_id}`);
        
        // Busca o conteúdo dessa aula
        const conteudo = await Conteudo.findById(aula.conteudo_id).lean();
        if (conteudo) {
          console.log(`  ✅ Conteúdo: "${conteudo.nome}" (_id: ${conteudo._id})`);
        }
        
        // Re-busca as aulas desse conteúdo
        const aulasDoConteudo = await Aula.find({ conteudo_id: aula.conteudo_id }).select('_id').lean();
        console.log(`  📋 Aulas do conteúdo no banco: ${aulasDoConteudo.length}`);
        const ids = aulasDoConteudo.map(a => a._id.toString());
        console.log(`  IDs das aulas: [${ids.slice(0, 5).join(', ')}...]`);
        console.log(`  aulasConcluidas tem "${primeiroId}"? ${aulasConcluidas.has(primeiroId)}`);
        console.log(`  Match manual: ${ids.filter(id => aulasConcluidas.has(id)).length}`);
      } else {
        console.log(`  ❌ Aula NÃO encontrada com _id="${primeiroId}"`);
        console.log(`     Isso sugere que o aula_id salvo no Progresso não é um ObjectId válido de AulaModel`);
      }
    } catch (e) {
      console.log(`  ❌ Erro ao buscar por ObjectId: ${e.message}`);
      console.log(`     O aula_id "${primeiroId}" pode não ser um ObjectId válido`);
    }
  }
}

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Conectado\n');

  // Usuários com progressos de ObjectId (maioria)
  // Testa com o user que tem mais registros: 69fc2222a6cbed6893d64478
  await simulateApiForUser('69fc2222a6cbed6893d64478');

  // Testa também com o user que tem ID mock: 6a42f1878130e975c0ea6601
  await simulateApiForUser('6a42f1878130e975c0ea6601');

  await mongoose.disconnect();
  console.log('\n✅ Diagnóstico 2 concluído.');
}

main().catch(err => {
  console.error('❌ Erro:', err.message);
  process.exit(1);
});
