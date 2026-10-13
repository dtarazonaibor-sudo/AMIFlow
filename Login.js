import React, { useState } from 'react';
import { View, Image, ScrollView, KeyboardAvoidingView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useStore, authMsg } from './store';
import { useT } from './theme';
import { Txt, Btn, Inp, Row } from './ui';

export default function Login() {
  const t = useT();
  const ins = useSafeAreaInsets();
  const { signIn, signUp, resetPw, skipLogin } = useStore();
  const [em, setEm] = useState('');
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const run = async (fn, okMsg) => {
    setBusy(true); setMsg('');
    try { await fn(); if (okMsg) setMsg(okMsg); } catch (e) { setMsg(authMsg(e)); } finally { setBusy(false); }
  };
  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1, backgroundColor: t.bg }}>
      <StatusBar style={t.dark ? 'light' : 'dark'} />
      <ScrollView keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 22, paddingTop: ins.top + 22, paddingBottom: ins.bottom + 22, maxWidth: 480, width: '100%', alignSelf: 'center' }}>
        <View style={{ alignItems: 'center', marginBottom: 18 }}>
          <View style={{ width: 110, height: 110, borderRadius: 26, overflow: 'hidden', backgroundColor: '#fff', borderWidth: 1, borderColor: t.line }}>
            <Image source={require('./icon-only.png')} style={{ width: 110, height: 110 }} resizeMode="cover" />
          </View>
          <Txt v="h1" style={{ marginTop: 14 }}>AMI Flow</Txt>
          <Txt v="s" style={{ textAlign: 'center', marginTop: 4 }}>Entra con tu correo y tus datos se guardan solos en la nube, en cualquier móvil.</Txt>
        </View>

        <Inp placeholder="Correo" value={em} onChangeText={setEm} autoCapitalize="none" keyboardType="email-address" autoCorrect={false} />
        <Inp placeholder="Contraseña (mín. 6 caracteres)" value={pw} onChangeText={setPw} secureTextEntry autoCapitalize="none" />
        {!!msg && <Txt color={t.red} style={{ marginTop: 8 }}>{msg}</Txt>}
        <Row style={{ marginTop: 14, flexWrap: 'nowrap' }}>
          <Btn p grow disabled={busy} onPress={() => run(() => signIn(em, pw))}>Entrar</Btn>
          <Btn grow disabled={busy} onPress={() => run(() => signUp(em, pw))}>Crear cuenta</Btn>
        </Row>
        <Btn disabled={busy} style={{ marginTop: 8, borderColor: 'transparent', backgroundColor: 'transparent' }} tx={{ color: t.ac }}
          onPress={() => run(async () => { if (!em.trim()) throw { code: 'auth/missing-email' }; await resetPw(em); }, 'Te hemos enviado un correo para cambiar la contraseña')}>
          Olvidé mi contraseña
        </Btn>
        <Btn disabled={busy} style={{ marginTop: 14 }} onPress={skipLogin}>Usar sin cuenta por ahora</Btn>
        <Txt v="s" style={{ textAlign: 'center', marginTop: 6 }}>Sin cuenta, los datos solo quedan en este móvil. Puedes crear la cuenta luego en Ajustes.</Txt>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
