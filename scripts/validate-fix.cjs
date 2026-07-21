/**
 * VALIDAÇÃO FINAL — simula exatamente o GET /api/conteudos APÓS a correção
 * (com conversão explícita de user_id para ObjectId)
 */
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://devmurilloo_db_user:ljFrVnFBHnY3c4wK@muza88.fhljgkc.mongodb.net/odisley?retryWrites=true&w=majority&appName=muza88';

const ProgressoSchema = new mongoose.Schema({ user_id: mongoose.Schema.Types.Mixed, aula_id: String, concluido: Boolean });
const AulaSchema = new mongoose.Schema({ titulo: String, conteudo_id: mongoose.Schema.Types.ObjectId, ordem: Number });
const ConteudoSchema = new mongoose.Schema({ nome: String, categoria: String, totalAulas: Number });

const Progresso = mongoose.model('Progresso', ProgressoSchema);
const Aula = mongoose.model('Aula', AulaSchema);
const Conteudo = mongoose.model('Conteudo', ConteudoSchema);

async function simulateGetConteudos(userIdString) {
  console.log(`\n=== Simulando GET /api/conteudos (CORRIGIDO) para user: ${userIdString} ===\n`);
  
  // CORREÇÃO: converte string → ObjectId
  const userObjectId = new mongoose.Types.ObjectId(userIdString);

  const progressos = await Progresso.find({
    user_id: userObjectId,  // ← aqui está a correção
    concluido: true,
  }).select('aula_id').lean();

  const aulasConcluidas = new Set(progressos.map(p => p.aula_id.toString()));
  console.log(`✅ Progressos encontrados: ${aulasConcluidas.size}`);
  if (aulasConcluidas.size > 0) {
    console.log('   IDs:', [...aulasConcluidas].slice(0, 5));
  }

  const conteudos = await Conteudo.find({}).lean();
  let totalProgresso = 0;

  console.log('\nProgresso por conteúdo:');
  for (const c of conteudos) {
    const aulas = await Aula.find({ conteudo_id: c._id }).select('_id').lean();
    if (aulas.length === 0) continue;

    const aulaIds = aulas.map(a => a._id.toString());
    const concluidas = aulaIds.filter(id => aulasConcluidas.has(id)).length;
    
    if (concluidas > 0) {
      totalProgresso += concluidas;
      const pct = Math.round((concluidas / c.totalAulas) * 100);
      console.log(`  ✅ "${c.nome}": ${concluidas}/${c.totalAulas} (${pct}%)`);
    }
  }

  if (totalProgresso === 0 && aulasConcluidas.size > 0) {
    console.log('  ❌ Ainda sem match — verificando cruzamento:');
    const primeiroId = [...aulasConcluidas][0];
    const aula = await mongoose.connection.db.collection('aulas').findOne({ _id: new mongoose.Types.ObjectId(primeiroId) });
    if (aula) {
      console.log(`     aula_id "${primeiroId}" existe no AulaModel ✅`);
      console.log(`     conteudo_id: ${aula.conteudo_id}`);
      
      const conteudo = await Conteudo.findById(aula.conteudo_id).lean();
      if (conteudo) {
        console.log(`     conteudo: "${conteudo.nome}"`);
        
        // Testa cruzamento manual
        const aulasDoConteudo = await Aula.find({ conteudo_id: aula.conteudo_id }).select('_id').lean();
        const ids = aulasDoConteudo.map(a => a._id.toString());
        const match = ids.filter(id => aulasConcluidas.has(id)).length;
        console.log(`     match manual: ${match}/${aulasDoConteudo.length}`);
      }
    }
  } else if (totalProgresso > 0) {
    console.log(`\n✅ CORREÇÃO FUNCIONOU! ${totalProgresso} aulas com progresso detectadas.`);
  }
}

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Conectado');

  // Testa com o usuário de maior volume de progresso
  await simulateGetConteudos('69fc2222a6cbed6893d64478');

  await mongoose.disconnect();
  console.log('\n✅ Validação concluída.');
}

main().catch(err => { console.error('❌', err.message); process.exit(1); });
