// Mira del ratón: sustituye al cursor del sistema durante la partida. 9x9, centro en (4, 4).

import { Lienzo } from '../tools/pixel/lienzo.js';

const T = 9;

const MIRA = [
    '....h....',
    '....g....',
    '.........',
    '.........',
    'hg..9..gh',
    '.........',
    '.........',
    '....g....',
    '....h....'
];

export default {
    nombre: 'mira',
    ancho: T,
    alto: T,
    frames: () => [Lienzo.desdeTexto(MIRA, T, T, 'mira')]
};
