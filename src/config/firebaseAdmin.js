const admin = require("firebase-admin");

const firebaseConfig = {
  type: process.env.FIREBASE_CONFIG_TYPE,
  project_id: process.env.FIREBASE_CONFIG_PROJECT_ID,
  private_key_id: process.env.FIREBASE_CONFIG_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_CONFIG_PRIVATE_KEY.replace(/\\n/g, "\n"),
  client_email: process.env.FIREBASE_CONFIG_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CONFIG_CLIENT_ID,
  auth_uri: process.env.FIREBASE_CONFIG_AUTH_URI,
  token_uri: process.env.FIREBASE_CONFIG_TOKEN_URI,
  auth_provider_x509_cert_url:
    process.env.FIREBASE_CONFIG_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CONFIG_CLIENT_X509_CERT_URL,
  universe_domain: process.env.FIREBASE_CONFIG_UNIVERSE_DOMAIN,
};

let firebaseApp = null;

try {
  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig),
  });
  console.log("Firebase Admin initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase Admin:", error);
  throw new Error("Failed to initialize Firebase Admin");
}

module.exports = {
  firebaseApp,
  admin,
};
