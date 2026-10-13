import React from 'react';
import { View } from 'react-native';
import { useStore } from './store';
import { useT } from './theme';
import { Txt, Btn, Card, Row, Inp, Select, useNav } from './ui';
import { ESTC, ESTN, TIPOS, fd, isLate, isToday, nextT } from './utils';
import { Empty } from './parts';

export default function Contacts() {
  const { S } = useStore();
  const { F, setF, go } = useNav();
  const t = useT();
  const q = F.q.toLowerCase();
  const L = S.c.filter((c) => {
    if (q && !((c.nombre || '') + ' ' + (c.tel || '') + ' ' + (c.red || '') + ' ' + (c.etiquetas || '')).toLowerCase().includes(q)) return false;
    if (F.ft && c.tipo != F.ft) return false;
    if (F.fe && c.estado != F.fe) return false;
    const n = nextT(S, c.id);
    if (F.qf == 'hoy' && !(n && (isToday(n) || isLate(n)))) return false;
    if (F.qf == 'late' && !(n && isLate(n))) return false;
    return true;
  }).sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
  return (
    <View>
      <Inp placeholder="Buscar por nombre, teléfono o red social" value={F.q} onChangeText={(x) => setF({ q: x })} autoCorrect={false} />
      <Row style={{ marginTop: 8, flexWrap: 'nowrap' }}>
        <View style={{ flex: 1 }}><Select value={F.ft} title="Tipo" options={[{ v: '', l: 'Todos los tipos' }, ...TIPOS]} onChange={(x) => setF({ ft: x })} /></View>
        <View style={{ flex: 1 }}><Select value={F.fe} title="Estado" options={[{ v: '', l: 'Todos los estados' }, ...ESTC, ...ESTN]} onChange={(x) => setF({ fe: x })} /></View>
      </Row>
      <Row style={{ marginVertical: 10 }}>
        <Btn p={F.qf == 'hoy'} onPress={() => setF({ qf: F.qf == 'hoy' ? '' : 'hoy' })}>Contactar hoy</Btn>
        <Btn p={F.qf == 'late'} onPress={() => setF({ qf: F.qf == 'late' ? '' : 'late' })}>Seguimientos atrasados</Btn>
      </Row>
      {L.map((c) => {
        const n = nextT(S, c.id);
        return (
          <Card key={c.id} onPress={() => go('contact', c.id)}>
            <Row style={{ flexWrap: 'nowrap' }}>
              <View style={{ flex: 1 }}>
                <Txt v="b">{c.nombre}</Txt>
                <Txt v="s">{c.tipo} · {c.estado}</Txt>
                {!!n && <Txt v="s" color={isLate(n) ? t.red : isToday(n) ? t.amb : undefined}>{n.tipo} · {fd(n.when)}</Txt>}
              </View>
              <Txt color={t.mut}>›</Txt>
            </Row>
          </Card>
        );
      })}
      {!L.length && <Empty>No hay contactos con estos filtros. Pulsa + para añadir uno.</Empty>}
    </View>
  );
}
