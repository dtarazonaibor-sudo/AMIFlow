import { createContext, useContext } from 'react';
import { Platform } from 'react-native';

const P = (ios, android) => Platform.select({ ios, android });

export const ACCENTS = [
  { n: 'Verde', l: '#1f6f5c', d: '#4fc3a1' },
  { n: 'Azul', l: '#2457a6', d: '#6ea8ff' },
  { n: 'Morado', l: '#6b3fa0', d: '#b68cf0' },
  { n: 'Rosa', l: '#b83b6e', d: '#ff8fb8' },
  { n: 'Naranja', l: '#bf5b10', d: '#ffb066' },
  { n: 'Grafito', l: '#37474f', d: '#b0bec5' },
];
export const FONTS = {
  Sistema: undefined,
  Serif: P('Georgia', 'serif'),
  Monoespaciada: P('Menlo', 'monospace'),
  Compacta: P('Avenir Next Condensed', 'sans-serif-condensed'),
  Redondeada: P('Avenir Next', 'sans-serif-medium'),
  Manuscrita: P('Noteworthy', 'cursive'),
};
export const SIZES = { Pequeño: 0.9, Normal: 1, Grande: 1.15, 'Muy grande': 1.3 };
export const MODES = [['auto', 'Automático'], ['claro', 'Claro'], ['oscuro', 'Oscuro']];

export function makeTheme(cfg, scheme) {
  const dark = cfg.mode === 'oscuro' || (cfg.mode === 'auto' && scheme === 'dark');
  const a = ACCENTS.find((x) => x.n === cfg.accent) || ACCENTS[0];
  const ac = dark ? a.d : a.l;
  const font = FONTS[cfg.font];
  const common = { dark, ac, font, fontH: font || FONTS.Serif, scale: SIZES[cfg.size] || 1 };
  return dark
    ? { ...common, bg: '#121a24', card: '#1b2633', ink: '#e8edf2', mut: '#93a1b1', line: '#2c3a4a', red: '#ff8a7e', amb: '#e8b04a', ac2: ac + '2b', onAc: '#0f1d2a' }
    : { ...common, bg: '#f5f3ee', card: '#ffffff', ink: '#1a2b3f', mut: '#6b7684', line: '#dfdcd3', red: '#b3392f', amb: '#a8700f', ac2: ac + '1f', onAc: '#ffffff' };
}

export const ThemeCtx = createContext(makeTheme({ accent: 'Verde', mode: 'claro', font: 'Sistema', size: 'Normal' }, 'light'));
export const useT = () => useContext(ThemeCtx);
