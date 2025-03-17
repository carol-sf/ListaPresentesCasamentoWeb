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
const colectionName = 'presentesCasamento';

// FUNÇÕES FIREBASE

async function updatePresent(name, isPromised, promisedBy) {
    const snapshot = await db.collection(colectionName)
        .where('name', '==', name) // Filtra pelo campo "name"
        .get();

    if (snapshot.empty) {
        console.error('Nenhum presente encontrado com esse nome.');
        return;
    }

    const docRef = snapshot.docs[0].ref;
    await docRef.update({
        isPromised: isPromised,
        promisedBy: promisedBy,
    }).catch(error => console.error('Erro ao atualizar presente: ', error));
}

async function getPresents(isPromised, isPix = null) {
    let presents = [];
    let query = db.collection(colectionName).where('isPromised', '==', isPromised);
    if(isPix != null) query = query.where('isPix', '==', isPix);
    await query
        .orderBy('createdAt', 'asc')
        .get()
        .then((querySnapshot) => {
            if (!querySnapshot.empty) 
                querySnapshot.forEach((doc) => presents.push(doc.data().name));
        }).catch(error => console.error("Erro ao buscar presentes:", error));
    return presents;
}

async function addTravelHelp(amount, promisedBy = '') {
    db.collection('luaDeMel').add({
        'amount': amount,
        'promisedBy': promisedBy,
        'createdAt': firebase.firestore.FieldValue.serverTimestamp(),
    }).catch(error => console.error('Erro ao adicionar valor para a lua de mel: ', error));
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

let pixList = [];
let availableList = [];
let promisedList = [];
let choosedPresent = [];
let travelHelp = '';
const TRAVEL_TOTAL_VALUE = 2600;
const PIX_KEY = '15731070776';

init();

async function init() {
    document.querySelectorAll('.pixKeyLabel').forEach(elemento => {
        elemento.innerHTML = PIX_KEY;
    });
    

    await setListValues();
    listenEvents();
}

function listenEvents() {
    const checkboxes = document.querySelectorAll(".availablePresentCheck");
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener("change", function () {
            if(checkbox.checked) {
                choosedPresent.push(this.value);
            } else {
                const index = choosedPresent.indexOf(this.value);
                if (index !== -1) {
                    choosedPresent.splice(index, 1);
                }
            }
        });
    });

    document.getElementById('choosePresentButton').addEventListener('click', openPromissePresentModal);
    document.querySelectorAll(".pixKeyContainer").forEach(elem => elem.addEventListener('click', copyPixKey));
}

async function setListValues() {
    pixList = await getPresents(false, true);
    document.getElementById('pixList').innerHTML = '';
    if(pixList.length > 0) {
        pixList.forEach(present => {
            document.getElementById('pixList').innerHTML += `
                <li>
                    <input type="checkbox" value="${present}" id="${present}" class="availablePresentCheck">
                    <label for="${present}">${present}</label>
                </li>
            `;
        });
    } else {
        document.getElementById('promisedList').innerHTML += `
            <p>Todas as sugestões de pix já foram escolhidas! 🎉🥳</p>
            <p>Mas fique a vontade pra nos ajudar com o que desejar.</p>
        `;      
    }
    
    availableList = await getPresents(false, false);
    document.getElementById('availableList').innerHTML = '';
    if(availableList.length > 0) {
        availableList.forEach(present => {
            document.getElementById('availableList').innerHTML += `
                <li>
                    <input type="checkbox" value="${present}" id="${present}" class="availablePresentCheck">
                    <label for="${present}">${present}</label>
                </li>
            `;
        });
    } else {
        document.getElementById('promisedList').innerHTML += `
            <p>Todos os presentes que sugerimos já foram escolhidos! 🎉🥳</p>
            <p>Mas fique a vontade pra nos ajudar com o que desejar.</p>
        `;      
    }
    
    promisedList = await getPresents(true);
    document.getElementById('promisedList').innerHTML = '';
    if(promisedList.length > 0) {
        promisedList.forEach(present => {
            document.getElementById('promisedList').innerHTML += `
                <li>
                    <input type="checkbox" value="${present}" id="${present}" checked disabled>
                    <label for="${present}">${present}</label>
                </li>
            `;
        });
    } else {
        document.getElementById('promisedList').innerHTML += `
            <p>Ainda não temos nenhum presente... Você pode ser o primeiro!</p>
        `;        
    }
    
    const amountTravelHelp = await getAmountTravelHelp();
    const progressPercentage = (amountTravelHelp / TRAVEL_TOTAL_VALUE) * 100;
    document.getElementById("progressBar").style.width = progressPercentage + "%";
    document.getElementById("progressBarLabel").innerHTML = `R$${amountTravelHelp} de R$${TRAVEL_TOTAL_VALUE}`;
}

async function openPromissePresentModal() {
    const hasChecked = document.querySelector(`#availablePresents .availablePresentCheck:checked`) !== null;
    const travelHelpText = document.getElementById('inputTravelHelp').value;
    if(hasChecked || travelHelpText != '') {
        document.getElementById("promissePresentModal").style.display = "flex";
        const presentsListEl = document.getElementById("promissedPresent");
        presentsListEl.innerHTML = '';
        choosedPresent.forEach(present => {
            presentsListEl.innerHTML += `<li><span class="icon"></span>${present}</li>`;
        });
        if(travelHelpText != '') {
            let travelHelpFloat = parseFloat(travelHelpText.replace(/[^\d.-]/g, '').replace(',', '.'));
            travelHelp = travelHelpFloat.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            presentsListEl.innerHTML += `<li><span class="icon"></span>${travelHelp}</li>`;
        }
    } else {
        document.getElementById("errorModal").style.display = "flex";
    }
}

async function confirmPromissedPresent() {
    let promisedBy = document.getElementById("promissedByInput").value;

    formatetPresents = [];
    choosedPresent.forEach(present => {
        updatePresent(present, true, promisedBy);
        formatetPresents.push(`🎁 ${present}\n`);
    });
    if(travelHelp != '') addTravelHelp(travelHelp, promisedBy);
    await setListValues();
    document.getElementById('inputTravelHelp').value = '';

    sendEmail(promisedBy, [...formatetPresents, travelHelp], 'Casamento');
    document.getElementById("promissePresentModal").style.display = "none";
    document.getElementById("successModal").style.display = "flex";
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = "none";
}

function copyPixKey() {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(PIX_KEY).then(() => {
            alert("Chave Pix copiada!");
        }).catch(err => {
            console.error("Erro ao copiar chave Pix:", err);
        });
    } else {
        const textArea = document.createElement("textarea");
        textArea.value = PIX_KEY;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand("copy");
            alert("Chave Pix copiada!");
        } catch (err) {
            console.error("Erro ao copiar chave Pix:", err);
        }
        document.body.removeChild(textArea);
    }
}
