import React, { createContext, useContext, useState, useRef, useCallback, useMemo } from 'react';
import { View, Text, TextInput, Pressable, Modal, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useT } from './theme';
import { fd, fmtD, toD, optN } from './utils';

export const NavCtx = createContext(null);
export const useNav = () => useContext(NavCtx);
const UICtx = createContext(null);
export const useUI = () => useContext(UICtx);

export function Txt({ v, style, color, children, ...p }) {
  const t = useT(), k = t.scale;
  const base = { color: color || t.ink, fontFamily: t.font, fontSize: 15 * k, lineHeight: 21 * k };
  const V = {
    h1: { fontFamily: t.fontH, fontWeight: '700', fontSize: 22 * k, lineHeight: 28 * k },
    h2: { fontFamily: t.fontH, fontWeight: '700', fontSize: 16 * k, lineHeight: 22 * k },
    s: { color: color || t.mut, fontSize: 13 * k, lineHeight: 18 * k },
    b: { fontWeight: '700' },
    big: { fontWeight: '700', fontSize: 24 * k, lineHeight: 30 * k },
  }[v];
  return <Text {...p} style={[base, V, style]}>{children}</Text>;
}

export function Btn({ p, d, onPress, children, style, tx, grow, disabled }) {
  const t = useT();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        { minHeight: 40, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 9, borderWidth: 1, borderColor: p ? t.ac : t.line, backgroundColor: p ? t.ac : t.card, alignItems: 'center', justifyContent: 'center', opacity: pressed || disabled ? 0.6 : 1 },
        grow && { flex: 1 }, style,
      ]}>
      {typeof children === 'string'
        ? <Txt color={p ? t.onAc : d ? t.red : t.ink} style={[p && { fontWeight: '600' }, tx]}>{children}</Txt>
        : children}
    </Pressable>
  );
}

export function Card({ children, onPress, style }) {
  const t = useT();
  const s = [{ backgroundColor: t.card, borderWidth: 1, borderColor: t.line, borderRadius: 12, padding: 12, marginBottom: 8 }, style];
  return onPress ? <Pressable onPress={onPress} style={s}>{children}</Pressable> : <View style={s}>{children}</View>;
}

export const Row = ({ children, style }) => (
  <View style={[{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 }, style]}>{children}</View>
);

export function Tag({ children }) {
  const t = useT();
  return (
    <View style={{ backgroundColor: t.ac2, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 1, marginRight: 4, marginTop: 2 }}>
      <Txt color={t.ac} style={{ fontSize: 12 * t.scale }}>{children}</Txt>
    </View>
  );
}

export function Inp({ style, ...p }) {
  const t = useT();
  return (
    <TextInput
      placeholderTextColor={t.mut}
      {...p}
      style={[{ borderWidth: 1, borderColor: t.line, borderRadius: 9, backgroundColor: t.bg, color: t.ink, fontFamily: t.font, fontSize: 16 * t.scale, paddingHorizontal: 10, paddingVertical: 9, marginTop: 3 },
        p.multiline && { minHeight: 90, textAlignVertical: 'top' }, style]}
    />
  );
}

export function Sheet({ visible, onClose, children }) {
  const t = useT();
  const ins = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: '#0007' }}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <View style={{ backgroundColor: t.card, borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '88%', padding: 16, paddingBottom: 16 + ins.bottom }}>
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function PickSheet({ title, options, onPick, search, selected, close }) {
  const t = useT();
  const [q, setQ] = useState('');
  const opts = options.map(optN);
  const L = opts.filter((o) => !q || o.l.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <Txt v="h2" style={{ marginBottom: 8 }}>{title}</Txt>
      {(search || opts.length > 8) && <Inp placeholder="Buscar…" value={q} onChangeText={setQ} autoCorrect={false} />}
      <ScrollView keyboardShouldPersistTaps="handled" style={{ flexGrow: 0, flexShrink: 1, marginTop: 8 }}>
        {L.map((o) => (
          <Pressable key={o.v} onPress={() => { close(); onPick(o.v); }}
            style={{ paddingVertical: 12, paddingHorizontal: 6, borderBottomWidth: 1, borderBottomColor: t.line }}>
            <Txt style={o.v === selected && { fontWeight: '700', color: t.ac }}>{o.l}</Txt>
          </Pressable>
        ))}
        {!L.length && <Txt v="s" style={{ padding: 8 }}>Sin resultados</Txt>}
      </ScrollView>
      <Btn onPress={close} style={{ marginTop: 10 }}>Cancelar</Btn>
    </>
  );
}

export function Select({ value, options, onChange, search, placeholder, title }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const cur = options.map(optN).find((o) => o.v === value);
  return (
    <>
      <Pressable onPress={() => setOpen(true)}
        style={{ borderWidth: 1, borderColor: t.line, borderRadius: 9, backgroundColor: t.bg, paddingHorizontal: 10, paddingVertical: 11, marginTop: 3, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Txt numberOfLines={1} style={{ flex: 1 }}>{cur ? cur.l : placeholder || 'Elegir…'}</Txt>
        <Txt color={t.mut}>▾</Txt>
      </Pressable>
      <Sheet visible={open} onClose={() => setOpen(false)}>
        <PickSheet title={title || 'Elegir'} options={options} search={search} selected={value} close={() => setOpen(false)} onPick={onChange} />
      </Sheet>
    </>
  );
}

export function DateField({ value, onChange, mode, clearable }) {
  const t = useT();
  const dt = mode === 'datetime';
  const [show, setShow] = useState(false);
  const open = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: toD(value), mode: 'date',
        onChange: (e, d) => {
          if (e.type !== 'set' || !d) return;
          if (!dt) return onChange(fmtD(d, false));
          DateTimePickerAndroid.open({
            value: d, mode: 'time', is24Hour: true,
            onChange: (e2, d2) => { if (e2.type === 'set' && d2) onChange(fmtD(d2, true)); },
          });
        },
      });
    } else {
      if (!value) onChange(fmtD(new Date(), dt));
      setShow(true);
    }
  };
  return (
    <View>
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
        <Pressable onPress={open}
          style={{ flex: 1, borderWidth: 1, borderColor: t.line, borderRadius: 9, backgroundColor: t.bg, paddingHorizontal: 10, paddingVertical: 11, marginTop: 3 }}>
          <Txt color={value ? t.ink : t.mut}>{value ? fd(value) : 'Elegir…'}</Txt>
        </Pressable>
        {clearable && !!value && <Btn onPress={() => onChange('')} style={{ marginTop: 3 }}>✕</Btn>}
      </View>
      {Platform.OS === 'ios' && show && (
        <View>
          <DateTimePicker value={toD(value)} mode={dt ? 'datetime' : 'date'} display="spinner" locale="es-ES"
            themeVariant={t.dark ? 'dark' : 'light'} onChange={(e, d) => d && onChange(fmtD(d, dt))} />
          <Btn onPress={() => setShow(false)}>Listo</Btn>
        </View>
      )}
    </View>
  );
}

function FormSheet({ title, fields, init, cb, close }) {
  const t = useT();
  const [err, setErr] = useState('');
  const [v, setV] = useState(() => {
    const o = {};
    fields.forEach((f) => {
      let x = init[f.k] ?? (typeof f.d === 'function' ? f.d() : f.d) ?? '';
      if (f.t === 'select' && x === '' && f.o.length) x = optN(f.o[0]).v;
      o[f.k] = String(x);
    });
    return o;
  });
  const set = (k, x) => setV((o) => ({ ...o, [k]: x }));
  const ok = () => {
    const f0 = fields[0];
    if (f0.req && !v[f0.k].trim()) return setErr('Falta: ' + f0.l);
    close();
    cb({ ...init, ...v });
  };
  const kb = { tel: 'phone-pad', email: 'email-address', number: 'decimal-pad' };
  return (
    <>
      <Txt v="h2" style={{ marginBottom: 8 }}>{title}</Txt>
      <ScrollView keyboardShouldPersistTaps="handled" style={{ flexGrow: 0, flexShrink: 1 }}>
        {fields.map((f) => (
          <View key={f.k} style={{ marginBottom: 10 }}>
            <Txt v="s">{f.l}</Txt>
            {f.t === 'select' ? (
              <Select value={v[f.k]} options={f.o} search={f.search} title={f.l} onChange={(x) => set(f.k, x)} />
            ) : f.t === 'date' || f.t === 'datetime' ? (
              <DateField value={v[f.k]} mode={f.t} clearable={f.clear} onChange={(x) => set(f.k, x)} />
            ) : (
              <Inp value={v[f.k]} onChangeText={(x) => set(f.k, x)} multiline={f.t === 'textarea'}
                style={f.t === 'textarea' && { minHeight: (f.rows || 3) * 24 }}
                keyboardType={kb[f.t]} autoCapitalize={f.t === 'email' ? 'none' : 'sentences'} />
            )}
          </View>
        ))}
      </ScrollView>
      {!!err && <Txt color={t.red} style={{ marginTop: 4 }}>{err}</Txt>}
      <Row style={{ marginTop: 8, flexWrap: 'nowrap' }}>
        <Btn grow onPress={close}>Cancelar</Btn>
        <Btn p grow onPress={ok}>Guardar</Btn>
      </Row>
    </>
  );
}

export function UIProvider({ children }) {
  const t = useT();
  const [dlg, setDlg] = useState(null);
  const [msg, setMsg] = useState('');
  const last = useRef(null);
  const idr = useRef(0);
  const tm = useRef(null);
  const close = useCallback(() => setDlg(null), []);
  const form = useCallback((title, fields, init, cb) => setDlg({ k: 'form', id: ++idr.current, title, fields, init: init || {}, cb }), []);
  const pick = useCallback((title, options, onPick, o = {}) => setDlg({ k: 'pick', id: ++idr.current, title, options, onPick, ...o }), []);
  const ask = useCallback((title, yes, no, text) => Alert.alert(title, text, [{ text: 'No', style: 'cancel', onPress: no }, { text: 'Sí', onPress: yes }]), []);
  const toast = useCallback((m) => { setMsg(m); clearTimeout(tm.current); tm.current = setTimeout(() => setMsg(''), 2600); }, []);
  const api = useMemo(() => ({ form, pick, ask, toast }), [form, pick, ask, toast]);
  if (dlg) last.current = dlg;
  const D = dlg || last.current;
  return (
    <UICtx.Provider value={api}>
      {children}
      <Sheet visible={!!dlg} onClose={close}>
        {D && D.k === 'form' && <FormSheet key={D.id} {...D} close={close} />}
        {D && D.k === 'pick' && <PickSheet key={D.id} {...D} close={close} />}
      </Sheet>
      {!!msg && (
        <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 130, alignItems: 'center' }}>
          <View style={{ backgroundColor: t.ink, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 99 }}>
            <Txt color={t.bg}>{msg}</Txt>
          </View>
        </View>
      )}
    </UICtx.Provider>
  );
}
