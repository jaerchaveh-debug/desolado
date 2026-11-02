// Efectos de la pistola. Frames de 8x8, orientados a la derecha:
//   0 bala de energía cian   1 destello en la boca del cañón   2 impacto

import { Lienzo } from '../tools/pixel/lienzo.js';

const T = 8;

const BALA = [
    '........',
    '........',
    '........',
    '.fgghh9.',
    '.fgghh9.',
    '........',
    '........',
    '........'
];

const DESTELLO = [
    '........',
    '...h....',
    '....h...',
    'gh99hh..',
    'gh99hhg.',
    '....h...',
    '...h....',
    '........'
];

const IMPACTO = [
    '.h...g..',
    '..g.h...',
    'g..9....',
    '..h9h.g.',
    '.g.9h...',
    '...h.g..',
    '..g...h.',
    '........'
];

export default {
    nombre: 'proyectil',
    ancho: T,
    alto: T,
    frames: () => [BALA, DESTELLO, IMPACTO].map((f, i) => Lienzo.desdeTexto(f, T, T, `proyectil.${i}`))
};
