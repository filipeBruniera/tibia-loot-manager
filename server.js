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

const cors = require('cors');
app.use(cors());

// Configurações iniciais
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
let itemsCache = {};

try {
  itemsCache = JSON.parse(fs.readFileSync(CACHE_FILE));
} catch (err) {
  fs.writeFileSync(CACHE_FILE, '{}');
}

app.get('/item-details/:id', async (req, res) => {
  try {
      const response = await fetch(`https://tibiawiki.dev/api/v2/items/${req.params.id}`);
      if (!response.ok) throw new Error('Item não encontrado');
      const data = await response.json();
      res.json(data);
  } catch (error) {
      res.status(404).json({ error: error.message });
  }
});



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

//POOST
// server.js
app.post('/add', (req, res) => {
  const newId = Number(req.body.id);
  if (isNaN(newId)) return res.status(400).json({ error: 'ID inválido' });

  fs.readFile(jsonPath, (err, data) => {
    if (err) return res.status(500).json({ error: 'Erro interno' });
    
    const config = JSON.parse(data);
    if (!config.blacklistTypes.includes(newId)) {
      config.blacklistTypes.push(newId);
    }

    fs.writeFile(jsonPath, JSON.stringify(config, null, 2), (err) => {
      if (err) return res.status(500).json({ error: 'Erro ao salvar' });
      res.json({ success: true });
    });
  });
});

app.post('/remove', (req, res) => {
  const removeId = Number(req.body.id);
  if (isNaN(removeId)) return res.status(400).json({ error: 'ID inválido' });

  fs.readFile(jsonPath, (err, data) => {
    if (err) return res.status(500).json({ error: 'Erro interno' });
    
    const config = JSON.parse(data);
    config.blacklistTypes = config.blacklistTypes.filter(id => id !== removeId);

    fs.writeFile(jsonPath, JSON.stringify(config, null, 2), (err) => {
      if (err) return res.status(500).json({ error: 'Erro ao salvar' });
      res.json({ success: true });
    });
  });
});
//POST

// Rota de busca melhorada
app.get('/item-search/:query', async (req, res) => {
  try {
      const response = await fetch(`https://tibiawiki.dev/api/v2/items?name=${encodeURIComponent(req.params.query)}`);
      if (!response.ok) throw new Error('Erro na API');
      
      const data = await response.json();
      const results = data.items.map(item => ({
          id: item.itemid,
          name: item.name,
          verified: !!item.name // Verificação adicional
      }));
      
      res.json({ results });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// server.js
app.get('/list', (req, res) => {
  fs.readFile(jsonPath, (err, data) => {
    if (err) return res.status(500).json({ error: 'Erro ao ler arquivo' });
    res.json(JSON.parse(data));
  });
});

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


// Rota para listagem
app.get('/list', (req, res) => {
  fs.readFile(jsonPath, (err, data) => {
      if (err) return res.status(500).json({ error: 'Erro ao ler arquivo' });
      res.json(JSON.parse(data));
  });
});

// Rota para adicionar item
app.post('/add', (req, res) => {
  const newId = Number(req.body.id);
  if (isNaN(newId)) return res.status(400).json({ error: 'ID inválido' });

  fs.readFile(jsonPath, (err, data) => {
      if (err) return res.status(500).json({ error: 'Erro interno' });
      
      const config = JSON.parse(data);
      if (!config.blacklistTypes.includes(newId)) {
          config.blacklistTypes.push(newId);
      }

      fs.writeFile(jsonPath, JSON.stringify(config, null, 2), (err) => {
          if (err) return res.status(500).json({ error: 'Erro ao salvar' });
          res.json({ success: true });
      });
  });
});

// Rota para remover item
app.post('/remove', (req, res) => {
  const removeId = Number(req.body.id);
  if (isNaN(removeId)) return res.status(400).json({ error: 'ID inválido' });

  fs.readFile(jsonPath, (err, data) => {
      if (err) return res.status(500).json({ error: 'Erro interno' });
      
      const config = JSON.parse(data);
      config.blacklistTypes = config.blacklistTypes.filter(id => id !== removeId);

      fs.writeFile(jsonPath, JSON.stringify(config, null, 2), (err) => {
          if (err) return res.status(500).json({ error: 'Erro ao salvar' });
          res.json({ success: true });
      });
  });
});


app.get('/item-name/:id', async (req, res) => {
  const itemId = req.params.id;
  
  try {
    if (itemsCache[itemId]) {
      return res.json({ name: itemsCache[itemId] });
    }

    const response = await fetch(`https://tibiawiki.dev/api/v2/items/${itemId}`, {
      headers: {
        'User-Agent': 'TibiaLootManager/1.0.0',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) throw new Error(`Status: ${response.status}`);
    
    const data = await response.json();
    
    // Ajuste para estrutura correta da API
    const itemName = data?.name || data?.title || 'Item desconhecido';
    
    itemsCache[itemId] = itemName;
    fs.writeFileSync(CACHE_FILE, JSON.stringify(itemsCache));
    
    res.json({ name: itemName });
  } catch (error) {
    console.error('Erro na API:', error.message);
    res.status(500).json({ name: 'Erro na consulta' });
  }
});

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

console.log('📂 Diretório Público:', path.join(__dirname, 'public'));
console.log('🔄 Verificando arquivos estáticos:');
console.log(fs.readdirSync(path.join(__dirname, 'public')));

startServer();