// Luz de las lámparas del fondo (tiles 11 y 12 de tiles-pasillo). Frames de 8x8:
//   0 apagada   1 cian encendida   2 roja encendida
// GameScene la coloca centrada sobre la carcasa y la hace parpadear con ritmos al azar.

import { Lienzo } from '../tools/pixel/lienzo.js';

const T = 8;

const APAGADA = [
    '........',
    '........',
    '..1221..',
    '..2332..',
    '..2332..',
    '..1221..',
    '........',
    '........'
];

const encendida = (nucleo, medio, halo) => [
    '...' + halo + halo + '...',
    '..' + halo + medio + medio + halo + '..',
    '.' + halo + medio + nucleo + nucleo + medio + halo + '.',
    halo + medio + nucleo + '99' + nucleo + medio + halo,
    halo + medio + nucleo + '99' + nucleo + medio + halo,
    '.' + halo + medio + nucleo + nucleo + medio + halo + '.',
    '..' + halo + medio + medio + halo + '..',
    '...' + halo + halo + '...'
];

export default {
    nombre: 'luz-fondo',
    ancho: T,
    alto: T,
    frames: () => [APAGADA, encendida('h', 'g', 'e'), encendida('j', 'i', 'a')]
        .map((f, i) => Lienzo.desdeTexto(f, T, T, `luz-fondo.${i}`))
};
