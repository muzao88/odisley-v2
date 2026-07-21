/**
 * DIAGNÓSTICO DE PROGRESSO — executa direto no banco MongoDB
 * 
 * Uso: node scripts/diagnose-progresso.mjs
 * 
 * O script:
 * 1. Lista todos os documentos em ProgressoModel para qualquer usuário
 * 2. Mostra os aula_ids salvos e testa o match com o prefixo mock
 * 3. Mostra se há aulas reais no AulaModel
 */

import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://devmurilloo_db_user:ljFrVnFBHnY3c4wK@muza88.fhljgkc.mongodb.net/odisley?retryWrites=true&w=majority&appName=muza88';

// Replica EXATAMENTE o que mockAulas() gera em ConteudoPage.tsx:
// _id: `aula-${nome.replace(/\s/g, "-").toLowerCase()}-${i}`
function mockAulaPrefix(nome) {
  return `aula-${nome.replace(/\s/g, '-').toLowerCase()}-`;
}

async function main() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  console.log('✅ Conectado ao MongoDB\n');

  const db = client.db('odisley');

  // ── 1. Todos os progressos no banco ─────────────────────────────────────────
  const allProgressos = await db.collection('progressos').find({}).toArray();
  console.log(`📊 Total de documentos em "progressos": ${allProgressos.length}`);

  if (allProgressos.length === 0) {
    console.log('\n❌ PROBLEMA ENCONTRADO: Nenhum registro de progresso no banco!');
    console.log('   → A aula NÃO está sendo salva via POST /api/progresso ao ser concluída.');
    console.log('   → Verifique a função marcarConcluida() em ConteudoPage.tsx.');
    await client.close();
    return;
  }

  // Agrupa por usuário
  const byUser = {};
  for (const p of allProgressos) {
    const uid = p.user_id?.toString();
    if (!byUser[uid]) byUser[uid] = [];
    byUser[uid].push(p);
  }

  console.log(`\n👥 Usuários com progresso: ${Object.keys(byUser).length}`);
  for (const [uid, progs] of Object.entries(byUser)) {
    const concluidas = progs.filter(p => p.concluido);
    console.log(`\n  User: ${uid}`);
    console.log(`  Total registros: ${progs.length} | Concluídas: ${concluidas.length}`);
    if (concluidas.length > 0) {
      console.log('  aula_ids concluídos:');
      for (const p of concluidas) {
        console.log(`    → "${p.aula_id}"`);
      }
    }
  }

  // ── 2. Conteúdos no banco ────────────────────────────────────────────────────
  const conteudos = await db.collection('conteudos').find({}).toArray();
  console.log(`\n📚 Total de conteúdos: ${conteudos.length}`);

  // ── 3. Aulas reais no banco ──────────────────────────────────────────────────
  const aulas = await db.collection('aulas').find({}).toArray();
  console.log(`🎬 Total de aulas reais (AulaModel): ${aulas.length}`);

  if (aulas.length === 0) {
    console.log('   → Nenhuma aula real cadastrada. Usando modo MOCK (esperado em dev).');
  }

  // ── 4. Testa o match entre progressos e prefixos mock ───────────────────────
  console.log('\n🔍 Testando match de IDs mock vs. progressos salvos:');

  // Pega todos os aula_ids concluídos de todos os usuários
  const allConcluidas = allProgressos.filter(p => p.concluido).map(p => p.aula_id?.toString());
  
  if (allConcluidas.length === 0) {
    console.log('  ⚠️  Nenhuma aula com concluido=true encontrada.');
  }

  for (const c of conteudos) {
    const prefix = mockAulaPrefix(c.nome);
    const matched = allConcluidas.filter(id => id && id.startsWith(prefix));
    if (matched.length > 0) {
      console.log(`  ✅ "${c.nome}" → prefix="${prefix}" → ${matched.length} aulas concluídas: ${matched.join(', ')}`);
    } else {
      // Mostra o prefixo esperado para comparação manual
      if (allConcluidas.length > 0) {
        console.log(`  ❌ "${c.nome}" → prefix="${prefix}" → 0 matches`);
        // Tenta detectar aula_ids que PARECEM ser desse conteúdo
        const nome_lower = c.nome.toLowerCase();
        const similar = allConcluidas.filter(id => id && id.includes(nome_lower.split(' ')[0]));
        if (similar.length > 0) {
          console.log(`     ⚠️  IDs similares encontrados (possível mismatch): ${similar.join(', ')}`);
        }
      }
    }
  }

  // ── 5. Mostra TODOS os aula_ids salvos (para comparação manual) ─────────────
  if (allConcluidas.length > 0) {
    console.log('\n📋 TODOS os aula_ids com concluido=true no banco:');
    for (const id of [...new Set(allConcluidas)]) {
      console.log(`  → "${id}"`);
    }
  }

  // ── 6. Prefixos esperados para todos os conteúdos ───────────────────────────
  console.log('\n📋 Prefixos esperados por conteúdo (o que a API busca):');
  for (const c of conteudos) {
    console.log(`  "${c.nome}" → "${mockAulaPrefix(c.nome)}"`);
  }

  await client.close();
  console.log('\n✅ Diagnóstico concluído.');
}

main().catch(err => {
  console.error('❌ Erro:', err.message);
  process.exit(1);
});
