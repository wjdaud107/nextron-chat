// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyCpueOz84cTXhF63-8tMd0CTahUfDK31Oc',
  authDomain: 'next-messenger-38352.firebaseapp.com',
  databaseURL: 'http://next-messenger-38352.firebaseio.com',
  projectId: 'next-messenger-38352',
  storageBucket: 'next-messenger-38352.appspot.com',
  messagingSenderId: '504557851226',
  appId: '1:504557851226:web:ac36495c3e1f1ef5793e63',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
export { auth, db };
