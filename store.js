import React, { createContext, useContext, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Alert, ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebase';

const KEY = 'amiflow_v1';
const SKIP = 'amiflow_skip';
const ARR = ['c', 'h', 't', 'p', 'b', 'g']; // contactos, historial, tareas, productos, compras, guiones
export const EMPTY = {
  c: [], h: [], t: [], p: [], b: [], g: [],
  cfg: { accent: 'Verde', mode: 'auto', font: 'Sistema', size: 'Normal' },
  updatedAt: 0,
};
export const norm = (x) => {
  const o = { ...EMPTY, ...(x || {}), cfg: { ...EMPTY.cfg, ...((x || {}).cfg || {}) } };
  ARR.forEach((k) => { if (!Array.isArray(o[k])) o[k] = []; });
  o.updatedAt = Number(o.updatedAt) || 0;
  return o;
};
const hasData = (s) => ARR.some((k) => s[k].length > 0);
export const body = (s) => { const { updatedAt, ...r } = s; return JSON.stringify(r); };

export const authMsg = (e) => ({
  'auth/invalid-email': 'El correo no es válido',
  'auth/missing-email': 'Escribe tu correo',
  'auth/missing-password': 'Escribe la contraseña',
  'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
  'auth/email-already-in-use': 'Ese correo ya tiene cuenta. Pulsa Entrar',
  'auth/invalid-credential': 'Correo o contraseña incorrectos',
  'auth/user-not-found': 'No existe una cuenta con ese correo',
  'auth/wrong-password': 'Contraseña incorrecta',
  'auth/network-request-failed': 'Sin conexión a internet',
  'auth/too-many-requests': 'Demasiados intentos, espera un rato',
  'auth/operation-not-allowed': 'Activa "Correo/contraseña" en Firebase > Authentication',
}[e && e.code] || 'Error: ' + ((e && (e.code || e.message)) || 'desconocido'));

const Ctx = createContext(null);
export const useStore = () => useContext(Ctx);

export function StoreProvider({ children }) {
  const [S, setS] = useState(EMPTY);
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [sync, setSync] = useState('local'); // local | saving | ok | offline | error
  const [skipped, setSkipped] = useState(false); // eligió usar la app sin cuenta
  const Sref = useRef(S); Sref.current = S;
  const skip = useRef(false);
  const timer = useRef(null);
  const justLogged = useRef(false);

  // 1) cargar datos locales
  useEffect(() => {
    Promise.all([AsyncStorage.getItem(KEY), AsyncStorage.getItem(SKIP)])
      .then(([r, sk]) => {
        if (r) { try { setS(norm(JSON.parse(r))); } catch (e) {} }
        if (sk === '1') setSkipped(true);
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  // 2) sesión
  useEffect(() => onAuthStateChanged(auth, (u) => { setUser(u); setAuthReady(true); if (!u) setSync('local'); }), []);

  const push = useCallback(async (uid, s) => {
    if (!s.updatedAt) return; // nunca subir un estado vacío
    try {
      await Promise.race([
        setDoc(doc(db, 'usuarios', uid), { data: body(s), updatedAt: s.updatedAt }),
        new Promise((_, rj) => setTimeout(() => rj(new Error('timeout')), 10000)),
      ]);
      if (Sref.current.updatedAt === s.updatedAt) setSync('ok');
    } catch (e) {
      setSync('offline');
    }
  }, []);

  // 3) autoguardado: local siempre, nube con 1,2 s de espera tras el último cambio
  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(KEY, JSON.stringify(S)).catch(() => {});
    if (skip.current) { skip.current = false; return; }
    if (!user) return;
    setSync('saving');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => push(user.uid, Sref.current), 1200);
  }, [S, ready]);

  // 4) escuchar la nube (sincroniza entre móviles)
  useEffect(() => {
    if (!user || !ready) return;
    let first = true;
    setSync('saving');
    const unsub = onSnapshot(doc(db, 'usuarios', user.uid), (snap) => {
      const local = Sref.current;
      const isFirst = first; first = false;
      if (!snap.exists()) {
        if (snap.metadata.fromCache) { setSync('offline'); return; }
        if (hasData(local)) push(user.uid, local); else setSync('ok');
        return;
      }
      if (snap.metadata.hasPendingWrites) return;
      const d = snap.data();
      let r;
      try { r = norm(JSON.parse(d.data)); r.updatedAt = d.updatedAt; } catch (e) { setSync('error'); return; }
      const useRemote = () => { skip.current = true; setS(r); setSync('ok'); };
      if (isFirst) {
        const jl = justLogged.current; justLogged.current = false;
        if (jl && hasData(local) && hasData(r) && d.updatedAt !== local.updatedAt) {
          Alert.alert('Esta cuenta ya tiene datos', 'Los de este móvil y los de la nube son distintos. ¿Cuáles conservas? (los otros se pierden)', [
            { text: 'Los de la nube', onPress: useRemote },
            { text: 'Los de este móvil', onPress: () => setS((p) => ({ ...p, updatedAt: Date.now() })) },
          ], { cancelable: false });
          return;
        }
      }
      if (d.updatedAt > local.updatedAt) useRemote();
      else if (d.updatedAt < local.updatedAt) push(user.uid, local);
      else setSync('ok');
    }, () => setSync('offline'));
    return unsub;
  }, [user && user.uid, ready]);

  const upd = useCallback((fn) => setS((p) => ({ ...p, ...fn(p), updatedAt: Date.now() })), []);
  const replaceAll = useCallback((obj) => { const n = norm(obj); upd(() => ({ c: n.c, h: n.h, t: n.t, p: n.p, b: n.b, g: n.g })); }, [upd]);

  const signIn = (e, p) => { justLogged.current = true; return signInWithEmailAndPassword(auth, e.trim(), p).catch((x) => { justLogged.current = false; throw x; }); };
  const signUp = (e, p) => { justLogged.current = true; return createUserWithEmailAndPassword(auth, e.trim(), p).catch((x) => { justLogged.current = false; throw x; }); };
  const resetPw = (e) => sendPasswordResetEmail(auth, e.trim());
  const logout = async () => {
    clearTimeout(timer.current);
    await signOut(auth);
    skip.current = true;
    setS(EMPTY);
    setSync('local');
    AsyncStorage.removeItem(KEY).catch(() => {});
    AsyncStorage.removeItem(SKIP).catch(() => {});
    setSkipped(false);
  };
  const skipLogin = () => { setSkipped(true); AsyncStorage.setItem(SKIP, '1').catch(() => {}); };

  const api = useMemo(() => ({ S, upd, replaceAll, ready, user, sync, signIn, signUp, resetPw, logout, skipped, skipLogin }), [S, ready, user, sync, skipped]);

  if (!ready || !authReady) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size="large" /></View>;
  }
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}
