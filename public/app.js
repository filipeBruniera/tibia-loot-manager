// Funções principais
async function loadList() {
    try {
        const response = await fetch('/list');
        const data = await response.json();
        updateList(data.blacklistTypes);
    } catch (error) {
        showError('Erro ao carregar lista');
    }
}

async function updateList(items) {
    const listDiv = document.getElementById('itemList');
    listDiv.innerHTML = await Promise.all(items.map(async id => 
        `<div class="item">
            <span class="item-id">${id}</span>
            <span class="item-name">${await getItemName(id)}</span>
            <button class="remove-btn" onclick="confirmRemove(${id})">×</button>
        </div>`
    )).then(html => html.join(''));
}