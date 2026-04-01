import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Validate Connection to Firestore
async function testConnection() {
  try {
    // Try to get a non-existent document to test connection
    await getDocFromServer(doc(db, '_connection_test_', 'ping'));
    console.log("Firestore connection successful.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. The client is offline.");
    }
    // Skip logging for other errors (like permission denied), as this is simply a connection test.
  }
}

testConnection();
