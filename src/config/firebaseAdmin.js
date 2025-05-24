const admin = require('firebase-admin');
const path = require('path');

const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

let firebaseApp = null;

try {
    const serviceAccount = require(serviceAccountPath);
    firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount), 
    });
    console.log('Firebase Admin initialized successfully');
}catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    throw new Error('Failed to initialize Firebase Admin');
}

module.exports = {
    firebaseApp,
    admin,
};