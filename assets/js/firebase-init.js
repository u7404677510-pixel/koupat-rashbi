/* ============================================================
   FIREBASE — Initialisation partagée par toutes les pages
   Config publique : ces clés sont conçues pour être visibles
   côté client. La sécurité est assurée par les Firestore Rules.
============================================================ */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js';
import { getAuth }      from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js';

const firebaseConfig = {
  apiKey:            'AIzaSyDHbuKucbylgKEm_rYSMys9c5AH99ipZDg',
  authDomain:        'koupat-rashbi.firebaseapp.com',
  projectId:         'koupat-rashbi',
  storageBucket:     'koupat-rashbi.firebasestorage.app',
  messagingSenderId: '837566183327',
  appId:             '1:837566183327:web:b3a387a5e0cc647e9a6faa',
  measurementId:     'G-418H3DVJBV',
};

export const app  = initializeApp(firebaseConfig);
export const db   = getFirestore(app);
export const auth = getAuth(app);
