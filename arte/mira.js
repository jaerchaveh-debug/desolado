// Mira del ratón: sustituye al cursor del sistema durante la partida. 19x19, centro en (9, 9).
// Lleva contorno para leerse también sobre enemigos blancos y efectos cian.

import { Lienzo } from '../tools/pixel/lienzo.js';

const T = 19;
const C = 9;

function mira() {
    const l = new Lienzo(T, T);
    // Cuatro brazos de 5 px con la punta clara, separados del centro
    l.lineaV(C, 1, 2, 'h').lineaV(C, 3, 3, 'g').lineaV(C, 16, 2, 'h').lineaV(C, 13, 3, 'g');
    l.lineaH(1, C, 2, 'h').lineaH(3, C, 3, 'g').lineaH(16, C, 2, 'h').lineaH(13, C, 3, 'g');
    return l.punto(C, C, '9').contorno('0');
}

export default {
    nombre: 'mira',
    hd: true,
    ancho: T,
    alto: T,
    frames: () => [mira()]
};
