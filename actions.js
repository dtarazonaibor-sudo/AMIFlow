import { Linking, Share } from 'react-native';
import { useStore } from './store';
import { useUI, useNav } from './ui';
import { ESTC, ESTN, TIPOS, CANAL, TT, PRI, NIV, CAT, GCAT, uid, nowL, fill } from './utils';

export function useActions() {
  const { S, upd } = useStore();
  const { form, ask, toast, pick } = useUI();
  const { go } = useNav();
  const A = {};

  A.cn = (id) => (S.c.find((x) => x.id == id) || { nombre: '(eliminado)' }).nombre;

  A.editC = (id) => {
    const c = S.c.find((x) => x.id == id);
    const FC = [
      { k: 'nombre', l: 'Nombre y apellidos', req: 1 },
      { k: 'tel', l: 'Teléfono / WhatsApp', t: 'tel' },
      { k: 'email', l: 'Email', t: 'email' },
      { k: 'red', l: 'Red social' },
      { k: 'como', l: 'Cómo lo conocí' },
      { k: 'fecha', l: 'Fecha de primer contacto', t: 'date', d: () => nowL().slice(0, 10) },
      { k: 'tipo', l: 'Tipo', t: 'select', o: TIPOS },
      { k: 'estado', l: 'Estado', t: 'select', o: [...ESTC, ...ESTN] },
      { k: 'etiquetas', l: 'Etiquetas (separadas por coma)' },
      { k: 'notas', l: 'Notas', t: 'textarea' },
    ];
    form(c ? 'Editar contacto' : 'Nuevo contacto', FC, c || { tipo: 'cliente', estado: 'Activo' }, (o) => {
      const isNew = !o.id;
      if (isNew) o.id = uid();
      upd((s) => ({ c: isNew ? [...s.c, o] : s.c.map((x) => (x.id == o.id ? o : x)) }));
      go('contact', o.id);
    });
  };

  A.bizC = (id) => {
    const c = S.c.find((x) => x.id == id);
    form('Negocio', [
      { k: 'parte', l: 'Qué parte del negocio se ha explicado' },
      { k: 'nivel', l: 'Nivel de interés', t: 'select', o: NIV },
      { k: 'paso', l: 'Próximo paso' },
    ], c, (o) => upd((s) => ({ c: s.c.map((x) => (x.id == id ? o : x)) })));
  };

  A.addT = (cid) => {
    form('Próxima acción', [
      { k: 'cid', l: 'Contacto', t: 'select', search: true, o: S.c.map((c) => ({ v: c.id, l: c.nombre })) },
      { k: 'tipo', l: 'Tipo', t: 'select', o: TT },
      { k: 'when', l: 'Fecha y hora', t: 'datetime', d: nowL },
      { k: 'prio', l: 'Prioridad', t: 'select', o: PRI, d: 'Media' },
      { k: 'desc', l: 'Descripción' },
    ], cid ? { cid } : {}, (o) => {
      o.estado = o.estado || 'Pendiente';
      o.id = uid();
      upd((s) => ({ t: [...s.t, o] }));
    });
  };

  A.selT = () => {
    if (!S.c.length) { toast('Primero crea un contacto'); return A.editC(); }
    A.addT();
  };

  A.addH = (cid) => {
    form('Registrar conversación', [
      { k: 'fecha', l: 'Fecha y hora', t: 'datetime', d: nowL },
      { k: 'canal', l: 'Canal', t: 'select', o: CANAL },
      { k: 'conte', l: 'Qué le conté', t: 'textarea' },
      { k: 'recibio', l: 'Información / productos que recibió' },
      { k: 'interes', l: 'Qué le interesó' },
      { k: 'dudas', l: 'Dudas / objeciones' },
      { k: 'docs', l: 'Documentos enviados' },
    ], {}, (o) => {
      o.id = uid(); o.cid = cid;
      upd((s) => ({ h: [...s.h, o] }));
      ask('¿Programar el siguiente seguimiento?', () => A.addT(cid));
    });
  };

  A.doneT = (id) => {
    const t = S.t.find((x) => x.id == id);
    upd((s) => ({ t: s.t.map((x) => (x.id == id ? { ...x, estado: 'Realizada' } : x)) }));
    ask('Hecho ✓ ¿Crear el siguiente seguimiento?', () => A.addT(t.cid));
  };

  A.postT = (id) => {
    const t = S.t.find((x) => x.id == id);
    form('Posponer', [{ k: 'when', l: 'Nueva fecha y hora', t: 'datetime' }], { when: t.when }, (o) =>
      upd((s) => ({ t: s.t.map((x) => (x.id == id ? { ...x, when: o.when, estado: 'Pospuesta' } : x)) })));
  };

  A.addP = (cid) => {
    if (!S.p.length) return toast('Añade primero productos en la pestaña Productos');
    form('Producto', [
      { k: 'prod', l: 'Producto', t: 'select', search: true, o: [...S.p].sort((a, b) => a.nombre.localeCompare(b.nombre)).map((p) => p.nombre) },
      { k: 'tipo', l: 'Tipo', t: 'select', o: ['Recomendado', 'Comprado'] },
      { k: 'fecha', l: 'Fecha', t: 'date', d: () => nowL().slice(0, 10) },
      { k: 'cant', l: 'Cantidad', t: 'number', d: 1 },
      { k: 'pref', l: 'Preferencias' },
      { k: 'rev', l: 'Próxima revisión', t: 'date', clear: true },
    ], {}, (o) => {
      o.id = uid(); o.cid = cid;
      upd((s) => ({ b: [...s.b, o] }));
    });
  };

  A.editProd = (id) => {
    const p = S.p.find((x) => x.id == id);
    form(p ? 'Editar producto' : 'Nuevo producto', [
      { k: 'nombre', l: 'Nombre', req: 1 },
      { k: 'cat', l: 'Categoría', t: 'select', o: CAT },
      { k: 'desc', l: 'Descripción breve', t: 'textarea', rows: 2 },
      { k: 'precio', l: 'Precio (opcional)', t: 'number' },
    ], p, (o) => {
      const isNew = !o.id;
      if (isNew) o.id = uid();
      upd((s) => ({ p: isNew ? [...s.p, o] : s.p.map((x) => (x.id == o.id ? o : x)) }));
    });
  };

  A.editScript = (id) => {
    const g = S.g.find((x) => x.id == id);
    form(g ? 'Editar guion' : 'Nuevo guion', [
      { k: 'titulo', l: 'Título', req: 1 },
      { k: 'cat', l: 'Categoría', t: 'select', o: GCAT },
      { k: 'texto', l: 'Texto (usa {nombre} para poner el nombre del contacto)', t: 'textarea', rows: 8 },
    ], g, (o) => {
      const isNew = !o.id;
      if (isNew) o.id = uid();
      upd((s) => ({ g: isNew ? [...s.g, o] : s.g.map((x) => (x.id == o.id ? o : x)) }));
    });
  };

  // Elegir un guion y mandarlo por WhatsApp al contacto (o compartirlo)
  A.useScript = (c) => {
    if (!S.g.length) return toast('Crea primero guiones en la pestaña Guiones');
    pick('Elige un guion', S.g.map((g) => ({ v: g.id, l: g.titulo + ' · ' + g.cat })), (gid) => {
      const g = S.g.find((x) => x.id == gid);
      const text = fill(g.texto, c);
      const wa = (c.tel || '').replace(/\D/g, '');
      if (wa) Linking.openURL(`https://wa.me/${wa}?text=${encodeURIComponent(text)}`);
      else Share.share({ message: text });
    }, { search: true });
  };

  A.del = (k, id, back) => {
    ask('¿Eliminar?', () => {
      upd((s) => {
        const n = { [k]: s[k].filter((x) => x.id != id) };
        if (k == 'c') ['h', 't', 'b'].forEach((z) => { n[z] = s[z].filter((x) => x.cid != id); });
        return n;
      });
      if (back) go(back);
    });
  };

  return A;
}
