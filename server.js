process.on('uncaughtException', (err) => {
  console.error('Erro não tratado:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Rejeição não tratada em:', promise, 'motivo:', reason);
});

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const jsonPath = process.env.JSON_PATH || '/workspaces/tibia-loot-manager/lootBlackWhitelist.json';
const CACHE_FILE = 'item_cache.json';

// Configurações iniciais
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
let itemsCache = {};

try {
  itemsCache = JSON.parse(fs.readFileSync(CACHE_FILE));
} catch (err) {
  fs.writeFileSync(CACHE_FILE, '{}');
}

// Rotas atualizadas
app.get('/item-name/:id', async (req, res) => {
  const itemId = req.params.id;
  
  if (itemsCache[itemId]) {
    return res.json({ name: itemsCache[itemId] });
  }

  try {
    const response = await fetch(`https://tibiawiki.dev/api/v2/items/${itemId}`);
    if (!response.ok) throw new Error();
    
    const data = await response.json();
    const itemName = data.name || 'Item desconhecido';
    
    itemsCache[itemId] = itemName;
    fs.writeFileSync(CACHE_FILE, JSON.stringify(itemsCache));
    res.json({ name: itemName });
  } catch {
    res.json({ name: 'Item não encontrado' });
  }
});

// Corrigindo a rota /item-search
app.get('/item-search/:query', async (req, res) => {
  const query = req.params.query;
  
  try {
    const response = await fetch(`https://tibiawiki.dev/api/v2/items?name=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error();
    
    const data = await response.json();
    const results = data.items.map(item => ({
      id: item.itemid,
      name: item.name
    })).slice(0, 10);

    res.json({ results });
  } catch {
    res.json({ results: [] });
  }
}); // ← Faltava este fechamento

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Substitua o app.listen por:
const startServer = () => {
  try {
    const server = app.listen(3000, '0.0.0.0', () => {
      console.log(`✅ Servidor rodando em http://0.0.0.0:3000`);
    });
    
    server.on('error', (error) => {
      console.error('❌ Erro no servidor:', error);
      setTimeout(startServer, 5000); // Reinicia após 5 segundos
    });
    
  } catch (error) {
    console.error('⛔ Erro crítico:', error);
    process.exit(1);
  }
}

console.log('📂 Diretório Público:', path.join(__dirname, 'public'));
console.log('🔄 Verificando arquivos estáticos:');
console.log(fs.readdirSync(path.join(__dirname, 'public')));

startServer();