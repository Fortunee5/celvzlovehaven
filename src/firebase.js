import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";



const firebaseConfig = {
    apiKey: "AIzaSyCvzuikRxP0NV-shZXj6YRM_Psd_Tit37A",
  authDomain: "fortune-303fd.firebaseapp.com",
  projectId: "fortune-303fd",
  storageBucket: "fortune-303fd.firebasestorage.app",
  messagingSenderId: "818190227089",
  appId: "1:818190227089:web:ef1d028ea49875004a5130",
  measurementId: "G-83CDQ0KJCC"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
const analytics = getAnalytics(app);
