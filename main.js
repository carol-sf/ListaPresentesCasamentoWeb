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

function addPresent(name, isPromised = false, promisedBy = '') {
    db.collection(colectionName).doc(name).set({
        'name': name,
        'isPromised': isPromised,
        'promisedBy': promisedBy,
    }).catch(error => console.error('Erro ao adicionar presente: ', error));
}

async function addDefaultPresents() {
    const defaultPresentsList = window.presentesCasamento;

    await db.collection(colectionName).get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            db.collection(colectionName).doc(doc.id).delete()
            .catch(error => console.error("Erro ao apagar documento: ", error));
        });
    }).catch(error => console.error("Erro ao buscar documentos para apagar: ", error));

    defaultPresentsList.forEach(presentName => addPresent(presentName));
}