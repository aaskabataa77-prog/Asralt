import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Credentials from firebase-applet-config.json
const firebaseConfig = {
  apiKey: "AIzaSyD7LKR04qLM5-fK8FxVfnJryfUilxP_WZk",
  authDomain: "gen-lang-client-0276587344.firebaseapp.com",
  projectId: "gen-lang-client-0276587344",
  storageBucket: "gen-lang-client-0276587344.firebasestorage.app",
  messagingSenderId: "437492681286",
  appId: "1:437492681286:web:4d35e162131f75e6959847"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
