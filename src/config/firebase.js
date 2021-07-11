import firebase from "firebase/app";
import 'firebase/storage'
import 'firebase/firestore'
// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyAp20z2U9Y77X_I3gaicq2DQPv8b2_a2SU",
  authDomain: "quickcode-318508.firebaseapp.com",
  projectId: "quickcode-318508",
  storageBucket: "quickcode-318508-vision",
  messagingSenderId: "789096907790",
  appId: "1:789096907790:web:a6fa623d2ffc3e0144a85f"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore()
const storage = firebase.storage()
export { db, storage, firebase as default }
