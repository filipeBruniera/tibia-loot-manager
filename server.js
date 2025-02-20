const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const JSON_PATH = path.join(__dirname, 'lootBlackWhitelist.json');

// Configurações básicas
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Rotas essenciais
app.get('/list', (req, res) => {
    fs.readFile(JSON_PATH, (err, data) => {
        if (err) return res.status(500).send(err);
        res.json(JSON.parse(data));
    });
});

app.post('/add', async (req, res) => {
  try {
      const input = req.body.input;
      let id = Number(input);

      if (isNaN(id)) {
          const apiResponse = await fetch(`https://tibiawiki.dev/api/items?name=${input}`);
          const data = await apiResponse.json();
          
          if (!data.items || data.items.length === 0) {
              throw new Error('Item não encontrado');
          }
          
          // Correção crucial: acessando itemid corretamente
          id = data.items[0].itemid; // Removido [0] desnecessário
      }

      const fileData = JSON.parse(fs.readFileSync(JSON_PATH));
      if (!fileData.blacklistTypes.includes(id)) {
          fileData.blacklistTypes.push(id);
          fs.writeFileSync(JSON_PATH, JSON.stringify(fileData, null, 2));
      }

      res.json({ success: true, id });
  } catch (error) {
      res.status(400).json({ error: error.message });
  }
});

app.post('/remove', (req, res) => {
    const id = Number(req.body.id);
    const fileData = JSON.parse(fs.readFileSync(JSON_PATH));
    fileData.blacklistTypes = fileData.blacklistTypes.filter(itemId => itemId !== id);
    fs.writeFileSync(JSON_PATH, JSON.stringify(fileData, null, 2));
    res.json({ success: true });
});

app.get('/item-name/:id', async (req, res) => {
    try {
        const response = await fetch(`https://tibiawiki.dev/api/items/${req.params.id}`);
        const data = await response.json();
        res.json({ name: data.name || 'Nome desconhecido' });
    } catch {
        res.json({ name: 'Erro na consulta' });
    }
});

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});