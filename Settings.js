import React, { useState } from 'react';
import { View, Pressable, Share } from 'react-native';
import { useStore, authMsg, body } from './store';
import { useT, ACCENTS, FONTS, SIZES, MODES } from './theme';
import { Txt, Btn, Card, Row, Inp, useUI } from './ui';
import { Sec } from './parts';

const SYNC = {
  local: 'Solo en este móvil',
  saving: 'Guardando…',
  ok: 'Guardado en la nube ✓',
  offline: 'Sin conexión · se guardará al reconectar',
  error: 'Error al sincronizar',
};

export default function Settings() {
  const { S, upd, user, sync, signIn, signUp, logout, resetPw, replaceAll } = useStore();
  const { form, ask, toast } = useUI();
  const t = useT();
  const [em, setEm] = useState('');
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  const run = async (fn) => { setBusy(true); try { await fn(); } catch (e) { toast(authMsg(e)); } finally { setBusy(false); } };
  const set = (p) => upd((s) => ({ cfg: { ...s.cfg, ...p } }));
  const cfg = S.cfg;

  const doLogout = () => {
    const pending = sync === 'saving' || sync === 'offline';
    ask('¿Cerrar sesión?', () => run(logout), undefined,
      (pending ? 'Hay cambios sin subir que se perderían. ' : '') + 'Se borrarán los datos de este móvil; en la nube siguen guardados.');
  };
  const expo = () => { const { updatedAt, ...r } = S; Share.share({ message: JSON.stringify(r) }); };
  const impo = () => form('Importar copia de seguridad', [{ k: 'd', l: 'Pega aquí el texto de la copia (también vale el de la app anterior)', t: 'textarea', rows: 6 }], {}, (o) => {
    try {
      const x = JSON.parse(o.d);
      if (!x || typeof x !== 'object') throw new Error('x');
      replaceAll(x);
      toast('Datos importados');
    } catch (e) { toast('Los datos no son válidos'); }
  });

  return (
    <View>
      <Sec title="Cuenta y autoguardado" />
      <Card>
        {user ? (
          <>
            <Txt v="b">{user.email}</Txt>
            <Txt v="s" style={{ marginTop: 2 }}>{SYNC[sync] || ''}</Txt>
            <Txt v="s" style={{ marginTop: 6 }}>Todo lo que cambies se guarda solo y se sincroniza en los móviles donde entres con este correo.</Txt>
            <Btn d onPress={doLogout} style={{ marginTop: 10 }} disabled={busy}>Cerrar sesión</Btn>
          </>
        ) : (
          <>
            <Txt v="s">Entra con tu correo para guardar los datos en la nube automáticamente. Si no tienes cuenta, pulsa "Crear cuenta".</Txt>
            <Inp placeholder="Correo" value={em} onChangeText={setEm} autoCapitalize="none" keyboardType="email-address" autoCorrect={false} />
            <Inp placeholder="Contraseña (mín. 6 caracteres)" value={pw} onChangeText={setPw} secureTextEntry autoCapitalize="none" />
            <Row style={{ marginTop: 10, flexWrap: 'nowrap' }}>
              <Btn p grow disabled={busy} onPress={() => run(() => signIn(em, pw))}>Entrar</Btn>
              <Btn grow disabled={busy} onPress={() => run(() => signUp(em, pw))}>Crear cuenta</Btn>
            </Row>
            <Btn disabled={busy} style={{ marginTop: 8 }} onPress={() => run(async () => { await resetPw(em); toast('Te hemos enviado un correo para cambiar la contraseña'); })}>Olvidé mi contraseña</Btn>
          </>
        )}
      </Card>

      <Sec title="Apariencia" />
      <Card>
        <Txt v="s">Tema</Txt>
        <Row style={{ marginVertical: 6 }}>{MODES.map(([k, l]) => <Btn key={k} p={cfg.mode === k} onPress={() => set({ mode: k })}>{l}</Btn>)}</Row>
        <Txt v="s" style={{ marginTop: 6 }}>Color</Txt>
        <Row style={{ marginVertical: 6, gap: 12 }}>
          {ACCENTS.map((a) => (
            <Pressable key={a.n} onPress={() => set({ accent: a.n })} accessibilityLabel={a.n}
              style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: t.dark ? a.d : a.l, borderWidth: 3, borderColor: cfg.accent === a.n ? t.ink : 'transparent' }} />
          ))}
        </Row>
        <Txt v="s" style={{ marginTop: 6 }}>Tipo de letra</Txt>
        <Row style={{ marginVertical: 6 }}>
          {Object.keys(FONTS).map((f) => <Btn key={f} p={cfg.font === f} tx={{ fontFamily: FONTS[f] }} onPress={() => set({ font: f })}>{f}</Btn>)}
        </Row>
        <Txt v="s" style={{ marginTop: 6 }}>Tamaño de letra</Txt>
        <Row style={{ marginVertical: 6 }}>{Object.keys(SIZES).map((s) => <Btn key={s} p={cfg.size === s} onPress={() => set({ size: s })}>{s}</Btn>)}</Row>
        <View style={{ marginTop: 8, padding: 12, borderRadius: 10, backgroundColor: t.ac2 }}>
          <Txt v="h2">Así se verá tu app</Txt>
          <Txt>Texto normal de ejemplo para ver la letra y el tamaño.</Txt>
          <Txt v="s">Texto secundario de ejemplo.</Txt>
        </View>
      </Card>

      <Sec title="Copia de seguridad manual" />
      <Row><Btn onPress={expo}>Exportar datos</Btn><Btn onPress={impo}>Importar</Btn></Row>
    </View>
  );
}
