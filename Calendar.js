import React from 'react';
import { View } from 'react-native';
import { useStore } from './store';
import { fd, pend } from './utils';
import { TaskRow, Empty, Sec } from './parts';

export default function Calendar() {
  const { S } = useStore();
  const g = {};
  pend(S).forEach((t) => { const d = (t.when || '').slice(0, 10); (g[d] = g[d] || []).push(t); });
  const days = Object.keys(g).sort();
  return (
    <View>
      {days.map((d) => (
        <View key={d}>
          <Sec title={fd(d)} />
          {g[d].map((t) => <TaskRow key={t.id} t={t} name />)}
        </View>
      ))}
      {!days.length && <Empty>No hay acciones pendientes. Pulsa + para programar una.</Empty>}
    </View>
  );
}
