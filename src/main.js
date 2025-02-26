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
// addDefaultPresents();


// FUNÇÕES FIREBASE

async function addDefaultPresents() {
    const colectionName = 'presents';
    const defaultPresentsList = ['presente 1', 'presente 2', 'presente 3'];

    await db.collection(colectionName).get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            db.collection(colectionName).doc(doc.id).delete()
            .catch(error => console.error("Erro ao apagar documento: ", error));
        });
    }).catch(error => console.error("Erro ao buscar documentos para apagar: ", error));

    defaultPresentsList.forEach(presentName => addPresent(presentName));
}

function addPresent(name, isPromised = false, promisedBy = '') {
    db.collection('presents').doc(name).set({
        'name': name,
        'isPromised': isPromised,
        'promisedBy': promisedBy,
    }).catch(error => console.error('Erro ao adicionar presente: ', error));
}

async function updatePresent(name, isPromised, promisedBy) {
    await db.collection('presents').doc(name).update({
        'name': name,
        'isPromised': isPromised,
        'promisedBy': promisedBy,
    }).catch(error => console.error('Erro ao atualizar presente: ', error));
}

async function getPresents(isPromised) {
    let presents = [];
    await db.collection('presents').where('isPromised', '==', isPromised).get()
        .then((querySnapshot) => {
            if (!querySnapshot.empty) 
                querySnapshot.forEach((doc) => presents.push(doc.data().name));
        }).catch(error => console.error("Erro ao buscar presentes:", error));
    return presents;
}

async function promisePresent() {
    const checkedPresent = document.querySelector('.availablePresentCheck:checked');
    if (checkedPresent) {
        const presentName = checkedPresent.value;
        updatePresent(presentName, true, '');
        setListValues();
    }
}



// CÓDIGO PRINCIPAL

let availableList = [];
let promisedList = [];

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
        });
    });

    document.getElementById('choosePresentButton').addEventListener('click', promisePresent);
}

async function setListValues() {
    availableList = await getPresents(false);
    document.getElementById('availableList').innerHTML = '';
    availableList.forEach(present => {
        document.getElementById('availableList').innerHTML += `
            <li>
                <input type="checkbox" value="${present}" id="${present}" class="availablePresentCheck">
                <label for="${present}">${present}</label>
            </li>
        `;
    });

    
    promisedList = await getPresents(true);
    document.getElementById('promisedList').innerHTML = '';
    promisedList.forEach(present => {
        document.getElementById('promisedList').innerHTML += `
            <li>
                <input type="checkbox" value="${present}" id="${present}" checked disabled>
                <label for="${present}">${present}</label>
            </li>
        `;
    });

}