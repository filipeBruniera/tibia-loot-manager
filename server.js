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
app.use(express.static('public'));
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

  // Modifique esta linha:
app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});

// Para:
const server = app.listen(3000, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://0.0.0.0:3000`);
});

// Adicione tratamento de erros:
server.on('error', (error) => {
  console.error('Erro no servidor:', error);
  process.exit(1);
});

});
