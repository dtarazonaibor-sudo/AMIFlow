export const ESTC = ['Activo', 'Inactivo', 'Ocasional', 'VIP'];
export const ESTN = ['Nuevo', 'En conversación', 'Formación', 'En equipo', 'No interesado'];
export const TIPOS = ['cliente', 'prospecto de negocio', 'ambos'];
export const CANAL = ['WhatsApp', 'Llamada', 'Instagram', 'Presencial', 'Email', 'Otro'];
export const TT = ['Llamar', 'WhatsApp', 'Enviar información', 'Invitar a evento', 'Reunión', 'Recordatorio'];
export const PRI = ['Alta', 'Media', 'Baja'];
export const NIV = ['Alto', 'Medio', 'Bajo'];
export const CAT = ['Nutrición', 'Skincare', 'Hogar', 'Otro'];
export const GCAT = ['Primer contacto', 'Seguimiento', 'Invitación', 'Objeciones', 'Cierre', 'Otro'];

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
const p2 = (n) => String(n).padStart(2, '0');
export const fmtD = (d, time) =>
  `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}` + (time ? `T${p2(d.getHours())}:${p2(d.getMinutes())}` : '');
export const nowL = () => fmtD(new Date(), true);
export const toD = (s) => (s ? new Date(s.length > 10 ? s : s + 'T00:00') : new Date());
export const fd = (s) => {
  if (!s) return '';
  try {
    const dt = s.length > 10;
    return toD(s).toLocaleString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', ...(dt ? { hour: '2-digit', minute: '2-digit' } : {}) });
  } catch (e) {
    return s;
  }
};

export const optN = (o) => (typeof o === 'string' ? { v: o, l: o } : o);

export const pend = (S) => S.t.filter((t) => t.estado != 'Realizada').sort((a, b) => ((a.when || '') > (b.when || '') ? 1 : -1));
export const isLate = (t) => t.estado != 'Realizada' && (t.when || '') < nowL();
export const isToday = (t) => (t.when || '').slice(0, 10) == nowL().slice(0, 10);
export const nextT = (S, id) => {
  const p = pend(S);
  return p.find((t) => t.cid == id && t.estado != 'Pospuesta') || p.find((t) => t.cid == id);
};

// Sustituye {nombre} y {nombre_completo} en un guion
export const fill = (txt, c) => {
  const full = (c && c.nombre) || '';
  const first = full.trim().split(/\s+/)[0] || '';
  return String(txt || '').replace(/\{nombre_completo\}/gi, full).replace(/\{nombre\}/gi, first);
};
