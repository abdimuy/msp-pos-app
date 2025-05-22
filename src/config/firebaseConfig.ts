// firebaseConfig.ts

import Constants from 'expo-constants';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth, Auth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { firebase } = Constants.expoConfig?.extra!;

export const firebaseConfig = {
  apiKey: firebase.apiKey,
  authDomain: firebase.authDomain,
  projectId: firebase.projectId,
  storageBucket: firebase.storageBucket,
  messagingSenderId: firebase.messagingSenderId,
  appId: firebase.appId,
};

// Solo inicializa la app si no ha sido inicializada
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Firebase Auth: usa `getAuth()` si ya está inicializado
let auth: Auth;
try {
  auth = getAuth(app);
} catch (e) {
  // Si no está inicializado, inicialízalo con persistencia
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

export { app, auth };
