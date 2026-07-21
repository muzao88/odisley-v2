/**
 * DIAGNÓSTICO 3 — inspeciona o tipo exato do campo user_id no ProgressoModel
 */
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://devmurilloo_db_user:ljFrVnFBHnY3c4wK@muza88.fhljgkc.mongodb.net/odisley?retryWrites=true&w=majority&appName=muza88';

async function main() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  // Acessa diretamente a coleção sem schema para ver o tipo real
  const progressos = await db.collection('progressos').find({}).limit(5).toArray();
  
  console.log('=== Primeiros 5 documentos da coleção progressos (raw) ===\n');
  for (const p of progressos) {
    console.log({
      _id: p._id?.toString(),
      user_id: p.user_id,
      user_id_type: typeof p.user_id,
      user_id_isObjectId: p.user_id instanceof mongoose.Types.ObjectId,
      user_id_toString: p.user_id?.toString(),
      aula_id: p.aula_id,
      aula_id_type: typeof p.aula_id,
      concluido: p.concluido,
    });
  }

  console.log('\n=== Query de teste — busca por user_id como string ===');
  const userId = progressos[0]?.user_id?.toString();
  console.log(`Buscando user_id = "${userId}" (como string)...`);
  const byString = await db.collection('progressos').find({ user_id: userId }).toArray();
  console.log(`Resultado (string): ${byString.length} documentos`);

  console.log('\n=== Query de teste — busca por user_id como ObjectId ===');
  try {
    const oid = new mongoose.Types.ObjectId(userId);
    const byOid = await db.collection('progressos').find({ user_id: oid }).toArray();
    console.log(`Resultado (ObjectId): ${byOid.length} documentos`);
  } catch(e) {
    console.log(`Erro ao converter para ObjectId: ${e.message}`);
  }

  console.log('\n=== Aulas reais — primeiros 5 ===');
  const aulas = await db.collection('aulas').find({}).limit(5).toArray();
  for (const a of aulas) {
    console.log({
      _id: a._id?.toString(),
      _id_type: typeof a._id,
      titulo: a.titulo,
      conteudo_id: a.conteudo_id?.toString(),
    });
  }

  console.log('\n=== Verificando match manual ===');
  // Pega o user com mais registros
  const userProg = await db.collection('progressos').find({}).toArray();
  const byUser = {};
  for (const p of userProg) {
    const k = p.user_id?.toString();
    byUser[k] = (byUser[k] || 0) + 1;
  }
  const topUser = Object.entries(byUser).sort((a,b) => b[1]-a[1])[0];
  console.log(`Top user: ${topUser[0]} com ${topUser[1]} registros`);

  // Busca progressos desse user como ObjectId
  const topOid = new mongoose.Types.ObjectId(topUser[0]);
  const progsByOid = await db.collection('progressos').find({
    user_id: topOid,
    concluido: true,
  }).toArray();
  console.log(`Progressos por ObjectId: ${progsByOid.length}`);
  
  // Busca progressos desse user como string
  const progsByStr = await db.collection('progressos').find({
    user_id: topUser[0],
    concluido: true,
  }).toArray();
  console.log(`Progressos por String: ${progsByStr.length}`);

  if (progsByOid.length > 0) {
    console.log('\n=== Testando cruzamento com AulaModel ===');
    const aulaIds = progsByOid.map(p => p.aula_id?.toString()).filter(Boolean);
    console.log(`aula_ids: [${aulaIds.join(', ')}]`);
    
    // Verifica se esses IDs existem no AulaModel
    for (const id of aulaIds.slice(0,3)) {
      try {
        const aula = await db.collection('aulas').findOne({ _id: new mongoose.Types.ObjectId(id) });
        if (aula) {
          console.log(`  ✅ aula_id "${id}" → título: "${aula.titulo}", conteudo_id: ${aula.conteudo_id}`);
        } else {
          console.log(`  ❌ aula_id "${id}" → NÃO encontrado no AulaModel`);
        }
      } catch(e) {
        console.log(`  ❌ aula_id "${id}" → não é ObjectId válido: ${e.message}`);
      }
    }
  }

  await mongoose.disconnect();
  console.log('\n✅ Diagnóstico 3 concluído.');
}

main().catch(err => {
  console.error('Erro:', err.message);
  process.exit(1);
});
