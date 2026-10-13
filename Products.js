import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import { useStore } from './store';
import { useT } from './theme';
import { Txt, Btn, Card, Row, Tag, Inp, useNav } from './ui';
import { useActions } from './actions';
import { Empty } from './parts';

export default function Products() {
  const { S } = useStore();
  const { F, setF } = useNav();
  const A = useActions();
  const t = useT();
  const [open, setOpen] = useState(null);
  const q = F.pq.trim().toLowerCase();
  const L = S.p
    .filter((p) => !q || ((p.nombre || '') + ' ' + (p.cat || '') + ' ' + (p.desc || '')).toLowerCase().includes(q))
    .sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
  return (
    <View>
      <Inp placeholder="Buscar producto" value={F.pq} onChangeText={(x) => setF({ pq: x })} autoCorrect={false} style={{ marginBottom: 10 }} />
      {L.map((p) => {
        const on = open === p.id;
        return (
          <Card key={p.id}>
            <Pressable onPress={() => setOpen(on ? null : p.id)}>
              <Row style={{ flexWrap: 'nowrap', justifyContent: 'space-between' }}>
                <Txt v="b" style={{ flex: 1 }}>{p.nombre}</Txt>
                <Txt color={t.mut}>{on ? '▴' : '▾'}</Txt>
              </Row>
            </Pressable>
            {on && (
              <View style={{ marginTop: 8 }}>
                <Row style={{ gap: 0 }}><Tag>{p.cat}</Tag></Row>
                {!!p.desc && <Txt style={{ marginTop: 6 }}>{p.desc}</Txt>}
                <Txt v="s" style={{ marginTop: 6 }}>Precio: {p.precio ? p.precio + ' €' : '—'}</Txt>
                <Row style={{ marginTop: 10 }}>
                  <Btn onPress={() => A.editProd(p.id)}>Editar</Btn>
                  <Btn d onPress={() => A.del('p', p.id)}>Eliminar</Btn>
                </Row>
              </View>
            )}
          </Card>
        );
      })}
      {!L.length && <Empty>{S.p.length ? 'Ningún producto coincide con la búsqueda.' : 'Tu catálogo está vacío. Pulsa + para añadir el primer producto.'}</Empty>}
    </View>
  );
}
