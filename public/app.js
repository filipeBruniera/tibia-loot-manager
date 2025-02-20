async function loadList() {
    try {
        const response = await fetch('/list');
        const data = await response.json();
        displayItems(data.blacklistTypes);
    } catch (error) {
        alert('Erro ao carregar lista');
    }
}

async function displayItems(ids) {
    const listDiv = document.getElementById('itemList');
    listDiv.innerHTML = await Promise.all(ids.map(async id => 
        `<div class="item">
            <span>${id} - ${await getName(id)}</span>
            <button onclick="removeItem(${id})">Remover</button>
        </div>`
    )).then(html => html.join(''));
}

async function getName(id) {
    try {
        const response = await fetch(`/item-name/${id}`);
        const data = await response.json();
        return data.name;
    } catch {
        return 'Nome não encontrado';
    }
}

async function addItem() {
    const input = document.getElementById('itemInput').value.trim();
    if (!input) return;

    try {
        const response = await fetch('/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ input })
        });

        const result = await response.json();
        
        if (!response.ok) throw new Error(result.error);
        
        // Atualização automática e feedback
        const newItem = document.createElement('div');
        newItem.className = 'item';
        newItem.innerHTML = `
            <span>${result.id} - ${await getName(result.id)}</span>
            <button onclick="removeItem(${result.id})">Remover</button>
        `;
        document.getElementById('itemList').appendChild(newItem);
        
        document.getElementById('itemInput').value = '';
    } catch (error) {
        alert(error.message || 'Erro ao adicionar item');
    }
}

async function removeItem(id) {
    if (!confirm(`Remover item ${id}?`)) return;
    
    try {
        await fetch('/remove', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        loadList();
    } catch {
        alert('Erro ao remover item');
    }
}

// Inicialização
loadList();