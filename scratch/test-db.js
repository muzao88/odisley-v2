const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://devmurilloo_db_user:UEsxo9uBF2lXOWs2@muza88.fhljgkc.mongodb.net/odisley?retryWrites=true&w=majority&appName=muza88';

async function test() {
  console.log('Tentando conectar ao MongoDB...');
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conexão estabelecida com sucesso!');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Coleções disponíveis:', collections.map(c => c.name));
    await mongoose.disconnect();
    console.log('Desconectado com sucesso.');
  } catch (err) {
    console.error('❌ Falha na conexão:', err);
  }
}

test();
