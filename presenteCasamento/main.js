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


// CÓDIGO PRINCIPAL

let pixList = [];
let availableList = [];
let promisedList = [];
let choosedPresent = ''

init();

async function init() {
    await setListValues();
    listenEvents();
}

function listenEvents() {
    const checkboxes = document.querySelectorAll(".availablePresentCheck");
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener("change", function () {
            checkboxes.forEach(cb => cb.checked = false); 
            this.checked = true;
            choosedPresent = this.value;
        });
    });

    document.getElementById('choosePresentButton').addEventListener('click', openPromissePresentModal);
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
}

async function openPromissePresentModal() {
    const hasChecked = document.querySelector(`#availablePresents .availablePresentCheck:checked`) !== null;
    if(hasChecked) {
        document.getElementById("promissePresentModal").style.display = "flex";
        document.getElementById("promissedPresent").innerHTML = choosedPresent;
        
        console.log(choosedPresent)
    } else {
        document.getElementById("errorModal").style.display = "flex";
    }
}

function confirmPromissedPresent() {
    let promisedBy = document.getElementById("promissedByInput").value;
    document.getElementById("promissePresentModal").style.display = "none";
    updatePresent(choosedPresent, true, promisedBy);
    setListValues();
    sendEmail(promisedBy, choosedPresent, 'Casamento');
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = "none";
}