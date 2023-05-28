// import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp } from 'firebase/app';
import { child, get, getDatabase, ref, set } from "firebase/database";
import { collection, doc, getFirestore, setDoc } from "firebase/firestore"; 


const firebaseConfig = {
    apiKey: "AIzaSyCmUzn06NSlQPBpVn9s-NT5uhpjdpbhV_w",
    authDomain: "writeup2-920fc.firebaseapp.com",
    databaseURL: "https://writeup2-920fc-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "writeup2-920fc",
    storageBucket: "writeup2-920fc.appspot.com",
    messagingSenderId: "61990585172",
    appId: "1:61990585172:web:10483ef694bd23ad453ec1"
};
  
export const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const citiesRef = collection(db, "cities");

export async function sendStats(obj: any) {
    await setDoc(doc(citiesRef, "SF"), obj);
}
// const dbRef = ref(getDatabase());
// get(child(dbRef, `users/}`)).then((snapshot) => {
//   if (snapshot.exists()) {
//     console.log(snapshot.val());
//   } else {
//     console.log("No data available");
//   }
// }).catch((error) => {
//   console.error(error);
// });
