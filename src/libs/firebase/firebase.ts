import admin from "firebase-admin";
import { ServiceAccount } from "firebase-admin";
import credentialsJson from "./credentials.json";

export const firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(credentialsJson as ServiceAccount),
});

export const firebaseAuth = firebaseApp.auth();