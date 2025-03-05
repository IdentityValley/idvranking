// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAPOjCha1qQGw1pqSCpos2WGB-6dvDKqrk",
  authDomain: "idv-ranking-a3678.firebaseapp.com",
  projectId: "idv-ranking-a3678",
  storageBucket: "idv-ranking-a3678.firebasestorage.app",
  messagingSenderId: "43813437593",
  appId: "1:43813437593:web:4ad2acb05e474cc2173808",
  databaseURL: "https://idv-ranking-a3678-default-rtdb.europe-west1.firebasedatabase.app"
};

let database;

// Initialize Firebase
try {
    if (typeof firebase === 'undefined') {
        throw new Error('Firebase SDK not loaded');
    }
    firebase.initializeApp(firebaseConfig);
    database = firebase.database();
    console.log('Firebase initialized successfully');
} catch (error) {
    console.error('Error initializing Firebase:', error);
    throw error;
}

// Export database reference
export { database }; 