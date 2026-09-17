// Firebase web config.
//
// These values are NOT secrets — Firebase web API keys are public identifiers and are
// meant to ship in client code. Access is controlled by Firestore security rules
// (see firestore.rules) and by the authorised-domains list in the Firebase console.
//
// To activate Google login, replace the placeholders below with the config from:
//   Firebase console -> Project settings -> Your apps -> Web app -> SDK setup
//
// Until that is done the site runs in LOCAL MODE: progress is saved in this browser
// only, exactly as before. Nothing breaks.

export const FIREBASE_CONFIG = {
  apiKey: "REPLACE_ME",
  authDomain: "REPLACE_ME.firebaseapp.com",
  projectId: "REPLACE_ME",
  storageBucket: "REPLACE_ME.appspot.com",
  messagingSenderId: "REPLACE_ME",
  appId: "REPLACE_ME"
};

export const isConfigured = c =>
  !!c && typeof c.apiKey === 'string' && !c.apiKey.includes('REPLACE_ME') && c.apiKey.length > 10;
