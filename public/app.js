window.addEventListener('load', () => {
    loadList();
    console.log('Página carregada - Lista atualizada');
  });

  async function loadList() {
    try {
      const response = await fetch('/list');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      console.log('Dados recebidos:', data); // Debug
      updateList(data.blacklistTypes);
      
    } catch (error) {
      console.error('Falha ao carregar lista:', error);
      showError('Erro de conexão com o servidor');
    }
  }

// Função de busca aprimorada
async function searchItems(query) {
    try {
        const response = await fetch(`https://tibiawiki.dev/api/v2/items?name=${encodeURIComponent(query)}`);
        const data = await response.json();
        return data.items.map(item => ({ 
            id: item.itemid, 
            name: item.name 
        }));
    } catch {
        return [];
    }
}

// Adição com verificação
// app.js - Atualize a função addItem()
async function addItem() {
    const input = document.getElementById('itemId').value.trim();
    if (!input) return;

    try {
        // Busca via API
        const results = await searchItems(input);
        if (results.length === 0) throw new Error('Item não encontrado!');

        // Seleciona o primeiro resultado válido
        const { id, name } = results[0];
        
        // Adiciona via POST
        await fetch('/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });

        // Atualização e feedback
        alert(`${name} (ID: ${id}) adicionado!`);
        loadList();
        
    } catch (error) {
        alert(error.message);
    }
}

    // Verificação final do ID
    try {
        const details = await fetch(`/item-details/${id}`).then(res => res.json());
        if (!details || details.error) throw new Error();
    } catch {
        alert('ID inválido!');
        return;
    }

    try {
        await fetch('/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        loadList();
    } catch {
        alert('Erro ao adicionar item');
    }


// Remoção com confirmação
async function confirmRemove(id) {
    if (!confirm(`Confirmar remoção do item ${id}?`)) return;
    
    try {
        await fetch('/remove', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        
        // Atualização imediata
        const response = await fetch('/list');
        const { blacklistTypes } = await response.json();
        updateList(blacklistTypes);
        
    } catch {
        alert('Falha na remoção');
    }
}

// Atualização da exibição de nomes
async function getItemName(id) {
    try {
        const response = await fetch(`https://tibiawiki.dev/api/v2/items/${id}`);
        const data = await response.json();
        return data.name || 'Sem nome';
    } catch {
        return 'Erro na API';
    }
}

