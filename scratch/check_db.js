const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://devmurilloo_db_user:UFu0jo0DitaW8epJ@muza88.fhljgkc.mongodb.net/odisley?retryWrites=true&w=majority&appName=muza88";

const ConteudoSchema = new mongoose.Schema({
  nome: String,
  categoria: String,
}, { timestamps: true });

const Conteudo = mongoose.models.Conteudo || mongoose.model('Conteudo', ConteudoSchema);

async function run() {
  await mongoose.connect(MONGODB_URI);
  const conteudos = await Conteudo.find({ categoria: 'Funções' }).select('nome').lean();
  console.log(JSON.stringify(conteudos, null, 2));
  await mongoose.disconnect();
}

run().catch(console.error);
