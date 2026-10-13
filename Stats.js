import React from 'react';
import { View } from 'react-native';
import { useStore } from './store';
import { Txt, Card, Row } from './ui';
import { nowL } from './utils';
import { Sec } from './parts';

export default function Stats() {
  const { S } = useStore();
  const cnt = (a, f) => { const o = {}; a.forEach((x) => { const k = f(x); if (k) o[k] = (o[k] || 0) + 1; }); return o; };
  const mo = nowL().slice(0, 7);
  const comp = S.b.filter((b) => b.tipo == 'Comprado');
  const rows = (o) => {
    const e = Object.entries(o).sort((a, b) => b[1] - a[1]);
    return e.length ? e.map(([k, v]) => <Row key={k} style={{ flexWrap: 'nowrap' }}><Txt style={{ flex: 1 }}>{k}</Txt><Txt v="b">{v}</Txt></Row>) : <Txt v="s">Sin datos</Txt>;
  };
  const K = ({ n, l }) => (
    <Card style={{ flex: 1, alignItems: 'center', marginBottom: 0 }}><Txt v="big">{n}</Txt><Txt v="s" style={{ textAlign: 'center' }}>{l}</Txt></Card>
  );
  return (
    <View>
      <Row style={{ flexWrap: 'nowrap' }}>
        <K n={comp.filter((b) => (b.fecha || '').startsWith(mo)).reduce((a, b) => a + (+b.cant || 0), 0)} l="Uds. este mes" />
        <K n={S.h.filter((h) => (h.fecha || '').startsWith(mo)).length} l="Conversaciones" />
        <K n={S.t.filter((t) => t.estado == 'Realizada').length} l="Hechas" />
      </Row>
      <Sec title="Contactos por estado" /><Card>{rows(cnt(S.c, (c) => c.estado))}</Card>
      <Sec title="Contactos por tipo" /><Card>{rows(cnt(S.c, (c) => c.tipo))}</Card>
      <Sec title="Productos más vendidos" /><Card>{rows(comp.reduce((o, b) => { o[b.prod] = (o[b.prod] || 0) + (+b.cant || 0); return o; }, {}))}</Card>
    </View>
  );
}
