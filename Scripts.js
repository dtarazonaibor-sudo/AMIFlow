import React, { useState } from 'react';
import { View, Pressable, ScrollView, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useStore } from './store';
import { useT } from './theme';
import { Txt, Btn, Card, Row, Tag, Inp, useNav, useUI } from './ui';
import { useActions } from './actions';
import { GCAT } from './utils';
import { Empty } from './parts';

export default function Scripts() {
  const { S } = useStore();
  const { F, setF } = useNav();
  const { toast } = useUI();
  const A = useActions();
  const t = useT();
  const [open, setOpen] = useState(null);
  const q = F.sq.trim().toLowerCase();
  const L = S.g
    .filter((g) => (!F.sc || g.cat === F.sc) && (!q || ((g.titulo || '') + ' ' + (g.texto || '') + ' ' + (g.cat || '')).toLowerCase().includes(q)))
    .sort((a, b) => (a.titulo || '').localeCompare(b.titulo || ''));
  const copy = async (txt) => { try { await Clipboard.setStringAsync(txt); toast('Copiado ✓'); } catch (e) { toast('No se pudo copiar'); } };
  return (
    <View>
      <Inp placeholder="Buscar guion" value={F.sq} onChangeText={(x) => setF({ sq: x })} autoCorrect={false} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" style={{ marginVertical: 10, flexGrow: 0 }} contentContainerStyle={{ gap: 8 }}>
        <Btn p={!F.sc} onPress={() => setF({ sc: '' })}>Todos</Btn>
        {GCAT.map((c) => <Btn key={c} p={F.sc === c} onPress={() => setF({ sc: F.sc === c ? '' : c })}>{c}</Btn>)}
      </ScrollView>
      {L.map((g) => {
        const on = open === g.id;
        return (
          <Card key={g.id}>
            <Pressable onPress={() => setOpen(on ? null : g.id)}>
              <Row style={{ flexWrap: 'nowrap', justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  <Txt v="b">{g.titulo}</Txt>
                  <Row style={{ gap: 0 }}><Tag>{g.cat}</Tag></Row>
                </View>
                <Txt color={t.mut}>{on ? '▴' : '▾'}</Txt>
              </Row>
            </Pressable>
            {on && (
              <View style={{ marginTop: 10 }}>
                <Txt selectable>{g.texto}</Txt>
                <Row style={{ marginTop: 12 }}>
                  <Btn p onPress={() => copy(g.texto)}>Copiar</Btn>
                  <Btn onPress={() => Share.share({ message: g.texto })}>Compartir</Btn>
                  <Btn onPress={() => A.editScript(g.id)}>Editar</Btn>
                  <Btn d onPress={() => A.del('g', g.id)}>Eliminar</Btn>
                </Row>
              </View>
            )}
          </Card>
        );
      })}
      {!L.length && <Empty>{S.g.length ? 'Ningún guion coincide.' : 'Aún no tienes guiones. Pulsa + para crear el primero. Escribe {nombre} donde quieras que aparezca el nombre del contacto.'}</Empty>}
    </View>
  );
}
