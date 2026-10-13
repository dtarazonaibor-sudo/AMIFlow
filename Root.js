import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, ScrollView, Pressable, useColorScheme, BackHandler } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from './store';
import { ThemeCtx, makeTheme, useT } from './theme';
import { UIProvider, NavCtx, useNav, useUI, Txt, Btn } from './ui';
import { useActions } from './actions';
import Home from './Home';
import Contacts from './Contacts';
import Contact from './Contact';
import Calendar from './Calendar';
import Products from './Products';
import Scripts from './Scripts';
import Stats from './Stats';
import Settings from './Settings';
import Login from './Login';

const TABS = [['home', 'Inicio', '🏠'], ['contacts', 'Contactos', '👥'], ['cal', 'Calendario', '📅'], ['prods', 'Productos', '🛍️'], ['scripts', 'Guiones', '📝']];
const TITLES = { home: 'Inicio', contacts: 'Contactos', contact: 'Contacto', cal: 'Calendario', prods: 'Productos', scripts: 'Guiones', stats: 'Estadísticas', settings: 'Ajustes' };
const SCREENS = { home: Home, contacts: Contacts, contact: Contact, cal: Calendar, prods: Products, scripts: Scripts, stats: Stats, settings: Settings };

export default function Root() {
  const { S, user, skipped } = useStore();
  const scheme = useColorScheme();
  const theme = useMemo(() => makeTheme(S.cfg, scheme), [S.cfg, scheme]);
  return (
    <ThemeCtx.Provider value={theme}>
      <UIProvider>
        {user || skipped ? <Shell /> : <Login />}
      </UIProvider>
    </ThemeCtx.Provider>
  );
}

function Shell() {
  const [V, setV] = useState({ v: 'home', id: null });
  const [F, setFS] = useState({ q: '', ft: '', fe: '', qf: '', pq: '', sq: '', sc: '' });
  const setF = useCallback((p) => setFS((o) => ({ ...o, ...p })), []);
  const go = useCallback((v, id) => setV({ v, id: id || null }), []);
  const nav = useMemo(() => ({ V, go, F, setF }), [V, go, F, setF]);
  return (
    <NavCtx.Provider value={nav}>
      <Inner />
    </NavCtx.Provider>
  );
}

function Inner() {
  const t = useT();
  const ins = useSafeAreaInsets();
  const { user, sync } = useStore();
  const { V, go } = useNav();
  const { pick } = useUI();
  const A = useActions();
  const Screen = SCREENS[V.v];
  const sub = V.v === 'stats' || V.v === 'settings' || V.v === 'contact';

  useEffect(() => {
    const h = BackHandler.addEventListener('hardwareBackPress', () => {
      if (V.v === 'home') return false;
      go(V.v === 'contact' ? 'contacts' : 'home');
      return true;
    });
    return () => h.remove();
  }, [V.v]);

  const fab = () => {
    const m = {
      home: () => pick('¿Qué quieres añadir?', [{ v: 'c', l: 'Nuevo contacto' }, { v: 't', l: 'Nueva acción' }, { v: 'p', l: 'Nuevo producto' }, { v: 'g', l: 'Nuevo guion' }],
        (x) => ({ c: () => A.editC(), t: A.selT, p: () => A.editProd(), g: () => A.editScript() }[x]())),
      contacts: () => A.editC(),
      contact: () => A.addH(V.id),
      cal: A.selT,
      prods: () => A.editProd(),
      scripts: () => A.editScript(),
    }[V.v];
    m && m();
  };
  const showFab = !['stats', 'settings'].includes(V.v);
  const dot = !user ? t.mut : sync === 'ok' ? '#2e9e5b' : sync === 'saving' ? t.amb : t.red;
  const IconBtn = ({ children, onPress, label }) => (
    <Pressable onPress={onPress} accessibilityLabel={label} style={{ width: 42, height: 42, alignItems: 'center', justifyContent: 'center' }}>
      <Txt style={{ fontSize: 20 }}>{children}</Txt>
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <StatusBar style={t.dark ? 'light' : 'dark'} />
      <View style={{ paddingTop: ins.top + 4, paddingHorizontal: 10, paddingBottom: 4, flexDirection: 'row', alignItems: 'center' }}>
        {sub && <IconBtn label="Atrás" onPress={() => go(V.v === 'contact' ? 'contacts' : 'home')}>‹</IconBtn>}
        <Txt v="h1" style={{ flex: 1, marginLeft: sub ? 0 : 6 }}>{TITLES[V.v]}</Txt>
        <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: dot, marginRight: 4 }} />
        <IconBtn label="Estadísticas" onPress={() => go('stats')}>📊</IconBtn>
        <IconBtn label="Ajustes" onPress={() => go('settings')}>⚙️</IconBtn>
      </View>

      <ScrollView key={V.v + (V.id || '')} keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 14, paddingBottom: 160, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
        <Screen />
      </ScrollView>

      {showFab && (
        <Pressable onPress={fab} accessibilityLabel="Añadir"
          style={{ position: 'absolute', right: 16, bottom: 66 + ins.bottom, width: 56, height: 56, borderRadius: 28, backgroundColor: t.ac, alignItems: 'center', justifyContent: 'center', elevation: 6, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } }}>
          <Txt color={t.onAc} style={{ fontSize: 30, lineHeight: 34 }}>+</Txt>
        </Pressable>
      )}

      <View style={{ flexDirection: 'row', backgroundColor: t.card, borderTopWidth: 1, borderTopColor: t.line, paddingBottom: ins.bottom }}>
        {TABS.map(([k, l, ic]) => {
          const on = V.v === k || (V.v === 'contact' && k === 'contacts');
          return (
            <Pressable key={k} onPress={() => go(k)} style={{ flex: 1, alignItems: 'center', paddingVertical: 8 }}>
              <Txt style={{ fontSize: 18, lineHeight: 22, opacity: on ? 1 : 0.6 }}>{ic}</Txt>
              <Txt color={on ? t.ac : t.mut} style={{ fontSize: 11 * t.scale, lineHeight: 15 * t.scale, fontWeight: on ? '700' : '400' }}>{l}</Txt>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
