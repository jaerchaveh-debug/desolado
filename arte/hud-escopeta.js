// Icono de carga de la escopeta (esquina inferior derecha). Cartucho de energía de 16x16:
//   0 cargado (cian brillante)   1 descargado (apagado)
// GameScene superpone el frame 0 recortado desde abajo según el progreso de recarga.

import { Lienzo } from '../tools/pixel/lienzo.js';

const T = 16;

const CARGADO = [
    '................',
    '.....000000.....',
    '....0hhhhhh0....',
    '....0h9999g0....',
    '....0hggggf0....',
    '....0hggggf0....',
    '....0gggggf0....',
    '....0gggggf0....',
    '....0gffffe0....',
    '....0gffffe0....',
    '....0feeeee0....',
    '...0000000000...',
    '...0dddddddc0...',
    '...0cccccccb0...',
    '....00000000....',
    '................'
];

const DESCARGADO = [
    '................',
    '.....000000.....',
    '....04444440....',
    '....04333320....',
    '....03222210....',
    '....03222210....',
    '....03222210....',
    '....03222210....',
    '....02111110....',
    '....02111110....',
    '....02111110....',
    '...0000000000...',
    '...0555555540...',
    '...0444444430...',
    '....00000000....',
    '................'
];

export default {
    nombre: 'hud-escopeta',
    ancho: T,
    alto: T,
    frames: () => [CARGADO, DESCARGADO].map((f, i) => Lienzo.desdeTexto(f, T, T, `hud-escopeta.${i}`))
};
