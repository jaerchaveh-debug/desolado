// Bola de energía que el jefe lanza desde la garra (8x8). Roja (peligro) para no confundirse con las
// balas cian del jugador. Frames: 0-1 pulso (animación 'viajar')
import { Lienzo } from '../tools/pixel/lienzo.js';

const T = 8;
const BOLA = [
    ['..iiii..', '.ijjjji.', 'ij9999ji', 'ij9999ji', 'ij9999ji', 'ij9999ji', '.ijjjji.', '..iiii..'],
    ['........', '..iiii..', '.ij99ji.', '.ij99ji.', '.ij99ji.', '.ij99ji.', '..iiii..', '........']
];

export default {
    nombre: 'bola-energia',
    ancho: T,
    alto: T,
    frames: () => BOLA.map((b, i) => Lienzo.desdeTexto(b, T, T, `bola-energia.${i}`)),
    animaciones: { viajar: { frames: [0, 1], fps: 10, repetir: -1 } }
};
