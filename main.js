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

function addPresent(colectionName, name, isPromised = false, promisedBy = '') {
    db.collection(colectionName).doc(name).set({
        'name': name,
        'isPromised': isPromised,
        'promisedBy': promisedBy,
        'createdAt': firebase.firestore.FieldValue.serverTimestamp(),
    }).catch(error => console.error('Erro ao adicionar presente: ', error));
}

async function addDefaultPresents(colectionName) {
    const defaultPresentsList = window[colectionName];
    defaultPresentsList.forEach(presentName => addPresent(colectionName, presentName));
}