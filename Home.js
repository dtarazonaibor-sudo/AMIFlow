import React from 'react';
import { View } from 'react-native';
import { useStore } from './store';
import { useT } from './theme';
import { Txt, Card, Row, useNav } from './ui';
import { pend, isLate, isToday } from './utils';
import { TaskRow, Empty, Sec } from './parts';

export default function Home() {
  const { S, user } = useStore();
  const { go } = useNav();
  const t = useT();
  const p = pend(S);
  const lt = p.filter(isLate), td = p.filter((x) => !isLate(x) && isToday(x)), up = p.filter((x) => !isLate(x) && !isToday(x)).slice(0, 8);
  const K = ({ n, l, c }) => (
    <Card style={{ flex: 1, alignItems: 'center', marginBottom: 0 }}>
      <Txt v="big" color={c}>{n}</Txt>
      <Txt v="s">{l}</Txt>
    </Card>
  );
  return (
    <View>
      {!user && (
        <Card onPress={() => go('settings')}>
          <Txt v="b">☁️ Guarda tus datos en la nube</Txt>
          <Txt v="s">Inicia sesión con tu correo y todo se guardará solo, y lo tendrás en cualquier móvil. Toca aquí.</Txt>
        </Card>
      )}
      <Row style={{ flexWrap: 'nowrap', marginBottom: 8 }}>
        <K n={lt.length} l="Atrasadas" c={lt.length ? t.red : undefined} />
        <K n={td.length} l="Hoy" />
        <K n={S.c.length} l="Contactos" />
      </Row>
      {!!lt.length && <><Sec title="Atrasadas" />{lt.map((x) => <TaskRow key={x.id} t={x} name />)}</>}
      <Sec title="Hoy" />
      {td.map((x) => <TaskRow key={x.id} t={x} name />)}
      {!td.length && <Empty>Nada pendiente para hoy.</Empty>}
      <Sec title="Próximas acciones" />
      {up.map((x) => <TaskRow key={x.id} t={x} name />)}
      {!up.length && <Empty>Sin acciones programadas. Pulsa + para crear una.</Empty>}
    </View>
  );
}
