// CONFIGURAÇÕES FIREBASE

const firebaseConfig = {
    apiKey: "AIzaSyCt09Sn0on20h4B9uByhU30Y04BQELdCqQ",
    authDomain: "listapresentescasamentojr.firebaseapp.com",
    projectId: "listapresentescasamentojr",
    storageBucket: "listapresentescasamentojr.firebasestorage.app",
    messagingSenderId: "986437344914",
    appId: "1:986437344914:web:ca10243c3eb60fbb7b904b"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();


// FUNÇÕES FIREBASE

async function getPresents(colectionName) {
    let presents = [];
    await db.collection(colectionName).where('isPromised', '==', true)
        .orderBy('createdAt', 'asc')
        .get()
        .then((querySnapshot) => {
            if (!querySnapshot.empty)
                querySnapshot.forEach((doc) => presents.push({
                    name: doc.data().name,
                    giver: doc.data().promisedBy,
                }));
        }).catch(error => console.error("Erro ao buscar presentes:", error));
    return presents;
}

async function getLuaDeMelData() {
    let presents = [];
    await db.collection('luaDeMel')
        .orderBy('createdAt', 'asc')
        .get()
        .then((querySnapshot) => {
            if (!querySnapshot.empty)
                querySnapshot.forEach((doc) => presents.push({
                    name: doc.data().amount,
                    giver: doc.data().promisedBy,
                }));
        }).catch(error => console.error("Erro ao buscar presentes:", error));
    return presents;
}

async function getAmountTravelHelp() {
    let totalAmount = 0;
    await db.collection('luaDeMel')
        .get()
        .then(querySnapshot => {
            querySnapshot.forEach(doc => {
                let amountStr = doc.data().amount;
                let amount = parseFloat(amountStr.replace('R$', '').replace(',', '.')); 
                totalAmount += amount; 
            });
        })
        .catch(error => console.error('Erro ao obter o total arrecadado: ', error));
    return totalAmount.toFixed(2);
}


// CÓDIGO PRINCIPAL

const TRAVEL_TOTAL_VALUE = 2600;
const giftsData = {};

init();

async function init() {
    giftsData.casamento = await getPresents('presentesCasamento');
    giftsData.chaPanela = await getPresents('chaPanela');
    giftsData.chaCaldeirao = await getPresents('chaCaldeirao');
    
    showGifts('casamento', document.querySelector('.tab'));
}

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

    if(category == 'casamento') showLuaDeMelSection();
    else document.getElementById('luaDeMelContainer').style.display = "none";
}

async function showLuaDeMelSection() {
    document.getElementById('luaDeMelContainer').style.display = "block";
    
    const amountTravelHelp = await getAmountTravelHelp();
    const progressPercentage = (amountTravelHelp / TRAVEL_TOTAL_VALUE) * 100;
    document.getElementById("progressBar").style.width = progressPercentage + "%";
    document.getElementById("progressBarLabel").innerHTML = `R$${amountTravelHelp} de R$${TRAVEL_TOTAL_VALUE}`;

    const luaDeMelData = await getLuaDeMelData();
    const luaDeMelList = document.getElementById('luaDeMelList');
    luaDeMelList.innerHTML = luaDeMelData.map(gift => `
            <div class="gift-item">
                <span>${gift.name}</span>
                <strong>${gift.giver}</strong>
            </div>`
    ).join('');
}