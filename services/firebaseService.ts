// Firebase service — INDOMINE
// Menghubungkan data user & game state ke Firebase (project altomedia-indonesia).

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export const fbAuth = () => auth();
export const db = () => firestore();

// Cek ketersediaan native module (false di Expo Go)
export function isFirebaseAvailable(): boolean {
  try {
    return !!auth().app;
  } catch {
    return false;
  }
}

// Firebase Auth butuh email — nomor HP dipetakan ke email internal
export const phoneToEmail = (phone: string): string =>
  phone.replace(/[^0-9]/g, '') + '@indomine.app';

// Kredensial turunan deterministik (Firebase mensyaratkan >= 6 karakter)
export const derivePassword = (phone: string, password: string): string =>
  'IM#' + phone.replace(/[^0-9]/g, '') + '#' + password;
