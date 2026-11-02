// Indicador de vida del jugador: celdas de energía de 8x8.
//   0 celda llena (cian)   1 celda vacía

import { Lienzo } from '../tools/pixel/lienzo.js';

const T = 8;

const LLENA = [
    '..0000..',
    '.0hhhh0.',
    '.0h99g0.',
    '.0gggf0.',
    '.0gggf0.',
    '.0ffff0.',
    '.0eeee0.',
    '..0000..'
];

const VACIA = [
    '..0000..',
    '.044440.',
    '.032220.',
    '.021110.',
    '.021110.',
    '.021110.',
    '.022220.',
    '..0000..'
];

export default {
    nombre: 'hud-vida',
    ancho: T,
    alto: T,
    frames: () => [LLENA, VACIA].map((f, i) => Lienzo.desdeTexto(f, T, T, `hud-vida.${i}`))
};
