const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, doc, setDoc } = require('firebase/firestore');

// Configuracion quemada directo del proyecto
const firebaseConfig = {
    apiKey: "TU_API_KEY", // Will use fallback or require hardcoding if .env not working, but let's try reading dot env directly without 'dotenv' package if possible, or we will just use the known config from the env file.
};
