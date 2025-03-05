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
const colectionName = 'chaCaldeirao';

// FUNÇÕES FIREBASE

async function updatePresent(name, isPromised, promisedBy) {
    await db.collection(colectionName).doc(name).update({
        'name': name,
        'isPromised': isPromised,
        'promisedBy': promisedBy,
    }).catch(error => console.error('Erro ao atualizar presente: ', error));
}

async function getPresents(isPromised) {
    let presents = [];
    await db.collection(colectionName).where('isPromised', '==', isPromised)
        .orderBy('createdAt', 'asc')
        .get()
        .then((querySnapshot) => {
            if (!querySnapshot.empty) 
                querySnapshot.forEach((doc) => presents.push(doc.data().name));
        }).catch(error => console.error("Erro ao buscar presentes:", error));
    return presents;
}


// CÓDIGO PRINCIPAL

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

async function openPromissePresentModal() {
    const hasChecked = document.querySelector(`#availableList .availablePresentCheck:checked`) !== null;
    if(hasChecked) {
        document.getElementById("promissePresentModal").style.display = "flex";
        document.getElementById("promissedPresent").innerHTML = choosedPresent;
    } else {
        document.getElementById("errorModal").style.display = "flex";
    }
}

function confirmPromissedPresent() {
    let promisedBy = document.getElementById("promissedByInput").value;
    console.log(promisedBy)
    document.getElementById("promissePresentModal").style.display = "none";
    updatePresent(choosedPresent, true, promisedBy);
    setListValues();
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = "none";
}