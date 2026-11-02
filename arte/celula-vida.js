// Célula de energía que suelta un enemigo al morir: recupera vida al recogerla (8x8).
// Frames: 0 brillo alto · 1 brillo bajo (animación 'brillar'). Cian = energía, como el HUD de vida.
import { Lienzo } from '../tools/pixel/lienzo.js';

const T = 8;
const CELULA = [
    '...00...',
    '..0790..',
    '.0ghhg0.',
    '.0ghhg0.',
    '.0fggf0.',
    '.0fggf0.',
    '.0effe0.',
    '..0000..'
];
// Pulso: todo un tono más apagado
const APAGADA = CELULA.map(f => [...f].map(c => ({ h: 'g', g: 'f', f: 'e', 9: '8' })[c] ?? c).join(''));

export default {
    nombre: 'celula-vida',
    ancho: T,
    alto: T,
    frames: () => [Lienzo.desdeTexto(CELULA, T, T, 'celula-vida'), Lienzo.desdeTexto(APAGADA, T, T, 'celula-vida.apagada')],
    animaciones: { brillar: { frames: [0, 1], fps: 4, repetir: -1 } }
};
