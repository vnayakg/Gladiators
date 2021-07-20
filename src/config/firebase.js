import firebase from "firebase/app";
import 'firebase/storage'
import 'firebase/firestore'
// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.DOMAIN_AUTH,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.BUCKET_ID,
  messagingSenderId: process.env.SENDER_ID,
  appId: process.env.APP_ID
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore()
const storage = firebase.storage()
export { db, storage, firebase as default }
