// firebase.js
import firebase from 'firebase';

// Initialize Firebase
// USE YOUR CONFIG OBJECT
const config = {
    apiKey: "AIzaSyB7a0KxGkiPKfJmFCe5rqGo8gr4BDu5lbk",
    authDomain: "speed21-e8e5e.firebaseapp.com",
    databaseURL: "https://speed21-e8e5e.firebaseio.com",
    projectId: "speed21-e8e5e",
    storageBucket: "",
    messagingSenderId: "115481071811",
    appId: "1:115481071811:web:1ab533efc606a713061276"

};
firebase.initializeApp(config);

// this exports the CONFIGURED version of firebase
export default firebase;