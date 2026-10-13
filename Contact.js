import React, { useEffect } from 'react';
import { View, Linking } from 'react-native';
import { useStore } from './store';
import { Txt, Btn, Card, Row, Tag, useNav } from './ui';
import { useActions } from './actions';
import { fd } from './utils';
import { TaskRow, Empty, Sec } from './parts';

export default function Contact() {
  const { S } = useStore();
  const { V, go } = useNav();
  const A = useActions();
  const c = S.c.find((x) => x.id == V.id);
  useEffect(() => { if (!c) go('contacts'); }, [c]);
  if (!c) return null;
  const wa = (c.tel || '').replace(/\D/g, '');
  const H = S.h.filter((x) => x.cid == c.id).sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
  const T = S.t.filter((x) => x.cid == c.id).sort((a, b) => (a.when > b.when ? 1 : -1));
  const B = S.b.filter((x) => x.cid == c.id);
  const biz = c.tipo != 'cliente';
  return (
    <View>
      <Txt v="h1" style={{ marginBottom: 10 }}>{c.nombre}</Txt>
      <Card>
        <Row style={{ gap: 0 }}>
          <Tag>{c.tipo}</Tag><Tag>{c.estado}</Tag>
          {(c.etiquetas || '').split(',').filter((x) => x.trim()).map((e, i) => <Tag key={i}>#{e.trim()}</Tag>)}
        </Row>
        <Txt v="s" style={{ marginTop: 6 }}>{[c.tel, c.email, c.red].filter(Boolean).join(' · ')}</Txt>
        <Txt v="s">{c.como ? 'Lo conocí: ' + c.como + ' · ' : ''}Primer contacto: {c.fecha || '—'}</Txt>
        {!!c.notas && <Txt style={{ marginTop: 6 }}>{c.notas}</Txt>}
        <Row style={{ marginTop: 10 }}>
          {!!wa && <Btn p onPress={() => Linking.openURL('https://wa.me/' + wa)}>WhatsApp</Btn>}
          {!!wa && <Btn onPress={() => Linking.openURL('tel:' + c.tel)}>Llamar</Btn>}
          <Btn onPress={() => A.useScript(c)}>📝 Guion</Btn>
          <Btn onPress={() => A.editC(c.id)}>Editar</Btn>
          <Btn d onPress={() => A.del('c', c.id, 'contacts')}>Borrar</Btn>
        </Row>
      </Card>

      <Sec title="Qué toca" btn="+ Seguimiento" onPress={() => A.addT(c.id)} />
      {T.map((t) => <TaskRow key={t.id} t={t} />)}
      {!T.length && <Empty>Sin seguimientos. Programa el siguiente paso.</Empty>}

      <Sec title="Historial de conversaciones" btn="+ Registrar" onPress={() => A.addH(c.id)} />
      {H.map((h) => (
        <Card key={h.id}>
          <Row style={{ flexWrap: 'nowrap' }}>
            <Txt v="b" style={{ flex: 1 }}>{h.canal}</Txt>
            <Txt v="s">{fd(h.fecha)}</Txt>
            <Btn d onPress={() => A.del('h', h.id)}>×</Btn>
          </Row>
          {[['Le conté', h.conte], ['Recibió', h.recibio], ['Le interesó', h.interes], ['Dudas', h.dudas], ['Documentos', h.docs]]
            .filter((x) => x[1]).map((x) => <Txt key={x[0]} v="s"><Txt v="s" style={{ fontWeight: '700' }}>{x[0]}: </Txt>{x[1]}</Txt>)}
        </Card>
      ))}
      {!H.length && <Empty>Aún no hay conversaciones registradas.</Empty>}

      <Sec title="Productos y compras" btn="+ Producto" onPress={() => A.addP(c.id)} />
      {B.map((b) => (
        <Card key={b.id}>
          <Row style={{ flexWrap: 'nowrap' }}>
            <Txt v="b" style={{ flex: 1 }}>{b.prod} ×{b.cant}</Txt>
            <Tag>{b.tipo}</Tag>
            <Btn d onPress={() => A.del('b', b.id)}>×</Btn>
          </Row>
          <Txt v="s">{b.fecha}{b.pref ? ' · ' + b.pref : ''}{b.rev ? ' · Revisar: ' + b.rev : ''}</Txt>
        </Card>
      ))}
      {!B.length && <Empty>Sin productos recomendados ni comprados.</Empty>}

      {biz && (
        <>
          <Sec title="Contacto de negocio" btn="Editar" onPress={() => A.bizC(c.id)} />
          <Card>
            <Txt v="s">Explicado: {c.parte || '—'}</Txt>
            <Txt v="s">Interés: {c.nivel || '—'} · Próximo paso: {c.paso || '—'}</Txt>
          </Card>
        </>
      )}
    </View>
  );
}
