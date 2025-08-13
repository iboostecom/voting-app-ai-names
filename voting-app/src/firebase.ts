// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyClRMQUx1O6NyM42zVFqNi5dSoF17zE53g",
  authDomain: "voting-app-ai-names.firebaseapp.com",
  databaseURL: "https://voting-app-ai-names-default-rtdb.firebaseio.com",
  projectId: "voting-app-ai-names",
  storageBucket: "voting-app-ai-names.firebasestorage.app",
  messagingSenderId: "1037191401272",
  appId: "1:1037191401272:web:455c145dad73662f6abbcd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app);

// Database paths
export const DB_PATHS = {
  votes: 'votes',
  userSubmissions: 'userSubmissions', 
  activeUsers: 'activeUsers',
  notifications: 'notifications'
} as const;