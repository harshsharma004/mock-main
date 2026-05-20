/**
 * config/firebase.js
 * Initializes Firebase Admin SDK once using a service account.
 */

const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId:    process.env.FIREBASE_PROJECT_ID,
      clientEmail:  process.env.FIREBASE_CLIENT_EMAIL,
      // Newlines in .env must be escaped as \n — this restores them
      privateKey:   process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

module.exports = admin;