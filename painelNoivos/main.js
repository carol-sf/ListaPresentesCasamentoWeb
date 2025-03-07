const giftsData = {
    casamento: [
        { name: "Jogo de panelas", giver: "Maria Silva" },
        { name: "Aspirador de pó", giver: "Carlos Souza" }
    ],
    chaPanela: [
        { name: "Conjunto de talheres", giver: "Ana Lima" },
        { name: "Forma de bolo", giver: "João Oliveira" }
    ],
    chaCaldeirao: [
        { name: "Caldeirão de ferro", giver: "Fernanda Costa" },
        { name: "Colher de pau gigante", giver: "Rafael Mendes" }
    ]
};

function showGifts(category, btn) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    btn.classList.add('active');
    
    const giftList = document.getElementById('giftList');
    giftList.innerHTML = giftsData[category].map(gift => `
            <div class="gift-item">
                <span>${gift.name}</span>
                <strong>${gift.giver}</strong>
            </div>`
        ).join('');
}

showGifts('casamento', document.querySelector('.tab'));