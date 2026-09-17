// Firebase web config for project `aiwd-training` (owner: xdrkzx@gmail.com).
//
// These values are NOT secrets. Firebase web API keys are public identifiers and are
// meant to ship in client code — they identify the project, they do not authorise
// anything. Access is controlled by the Firestore security rules in firestore.rules
// and by the authorised-domains list in the Firebase console.
//
// Regenerate with:
//   firebase apps:sdkconfig WEB --project aiwd-training

export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyC4ZXqMD91PQ8AMLOX6kEjAcaf9Wf3C7FE",
  authDomain: "aiwd-training.firebaseapp.com",
  projectId: "aiwd-training",
  storageBucket: "aiwd-training.firebasestorage.app",
  messagingSenderId: "249602187453",
  appId: "1:249602187453:web:1b6223ddb16820690f17d4"
};

export const isConfigured = c =>
  !!c && typeof c.apiKey === 'string' && !c.apiKey.includes('REPLACE_ME') && c.apiKey.length > 10;
