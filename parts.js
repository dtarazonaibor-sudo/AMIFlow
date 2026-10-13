import React from 'react';
import { Pressable } from 'react-native';
import { useT } from './theme';
import { Txt, Btn, Card, Row, useNav } from './ui';
import { useActions } from './actions';
import { fd, isLate, isToday } from './utils';

export const Empty = ({ children }) => <Txt v="s" style={{ paddingVertical: 14, paddingHorizontal: 4 }}>{children}</Txt>;

export const Sec = ({ title, btn, onPress }) => (
  <Row style={{ justifyContent: 'space-between', marginTop: 18, marginBottom: 8, flexWrap: 'nowrap' }}>
    <Txt v="h2">{title}</Txt>
    {!!btn && <Btn onPress={onPress}>{btn}</Btn>}
  </Row>
);

export function TaskRow({ t, name }) {
  const th = useT();
  const A = useActions();
  const { go } = useNav();
  const late = isLate(t), td = isToday(t);
  return (
    <Card>
      <Row style={{ flexWrap: 'nowrap' }}>
        <Pressable style={{ flex: 1 }} onPress={() => go('contact', t.cid)}>
          <Txt v="b">{t.tipo}{name ? ' · ' + A.cn(t.cid) : ''}</Txt>
          <Txt v="s" color={late ? th.red : td ? th.amb : undefined} style={(late || td) && { fontWeight: '600' }}>
            {fd(t.when)}{late ? ' · atrasada' : ''} · {t.prio}{t.estado == 'Pospuesta' ? ' · pospuesta' : ''}
          </Txt>
          {!!t.desc && <Txt v="s">{t.desc}</Txt>}
        </Pressable>
        {t.estado != 'Realizada' ? (
          <>
            <Btn p onPress={() => A.doneT(t.id)}>✓</Btn>
            <Btn onPress={() => A.postT(t.id)}>⏰</Btn>
          </>
        ) : <Txt v="s">Hecha</Txt>}
      </Row>
    </Card>
  );
}
