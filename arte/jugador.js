// Jugador: errante encapuchado con abrigo largo, visor cian, bufanda de óxido y pistola.
// Mira a la derecha (en el juego se usa flipX para la izquierda).
// Frame de 16x32: torso común (filas 0-21) + piernas/faldón por frame (filas 22-31).

import { Lienzo } from '../tools/pixel/lienzo.js';

const ANCHO = 16;
const ALTO = 32;

const TORSO = [
    '................',
    '................',
    '......0000......',
    '.....033440.....',
    '....03344440....',
    '....033411110...',
    '....03341ghh0...',
    '....033411110...',
    '....03334110....',
    '.....0cddd0.....',
    '...0bcdddc00....',
    '...0c03445430...',
    '..0dc034454430..',
    '..0c0234454430..',
    '...0023445430...',
    '...0234455430...',
    '...0234455430...',
    '...0234445330...',
    '...0233445330...',
    '...0g33444330...',
    '...0233444330...',
    '...02334443330..'
];

const PIERNAS = {
    quieto: [
        '..023344433330..',
        '..023344433330..',
        '..0233444333330.',
        '..0223344333320.',
        '...00000000000..',
        '.....0330330....',
        '.....0330330....',
        '.....0330330....',
        '.....0550550....',
        '.....05550555...'
    ],
    // Zancada: faldón hacia atrás, piernas abiertas
    correrA: [
        '..023344433330..',
        '.0233344433330..',
        '0223334443330...',
        '0002223333200...',
        '...00000000.....',
        '....033..0330...',
        '...033....0330..',
        '...033.....0330.',
        '..055......0550.',
        '..00.......05550'
    ],
    // Paso: pierna delantera levantada
    correrB: [
        '..023344433330..',
        '..0233444333330.',
        '.02233444333330.',
        '.0022233333200..',
        '...0000000000...',
        '.....0330330....',
        '.....0330330....',
        '.....033.0550...',
        '.....055..00....',
        '.....0555.......'
    ],
    correrC: [
        '..023344433330..',
        '.0233344433330..',
        '0223334443330...',
        '0002223333200...',
        '...00000000.....',
        '.....033.0330...',
        '....033...0330..',
        '...0330....0330.',
        '...0550....0550.',
        '..0555.....0555.'
    ],
    // Paso: pierna trasera levantada
    correrD: [
        '..023344433330..',
        '..0233444333330.',
        '.02233444333330.',
        '.0022233333200..',
        '...0000000000...',
        '.....0330330....',
        '.....0330330....',
        '....0550.0330...',
        '....000..0550...',
        '.........05550..'
    ],
    saltar: [
        '.023344433330...',
        '.0233444333330..',
        '.0223344433330..',
        '..002233332200..',
        '...0330003300...',
        '...0550..0550...',
        '....00....00....',
        '................',
        '................',
        '................'
    ]
};

// Brazo extendido con pistola, superpuesto al torso. La boca del cañón está en (15, 14):
// GameScene la usa como origen del disparo (BOCA_CANON).
const BRAZO = [
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '..........00....',
    '.........034000.',
    '.........0436670',
    '..........03000.',
    '...........020..',
    '...........00...'
];

// Retroceso al disparar: brazo 1 px atrás y cañón levantado 1 px por el culatazo
const BRAZO_RETROCESO = [
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '.........00.....',
    '........034000..',
    '........0436670.',
    '.........03000..',
    '..........020...',
    '..........00....',
    '................'
];

// Brazo apuntando hacia arriba: pistola vertical delante de la capucha. Boca del cañón en (13, 1).
const BRAZO_ARRIBA = [
    '................',
    '.............00.',
    '............0670',
    '............0660',
    '............0560',
    '............0360',
    '............0330',
    '...........03430',
    '...........0430.',
    '..........0430..',
    '..........040...',
    '.........040....',
    '.........00.....',
    '................',
    '................',
    '................',
    '................',
    '................'
];

// Brazo apuntando en diagonal hacia arriba y adelante. Boca del cañón en (15, 4).
const BRAZO_DIAGONAL = [
    '................',
    '................',
    '................',
    '................',
    '..............00',
    '.............070',
    '............0760',
    '...........0660.',
    '..........0360..',
    '.........04330..',
    '.........0430...',
    '.........040....',
    '.........00.....',
    '................',
    '................',
    '................',
    '................',
    '................'
];

// Manos vacías (sin pistola) para armas que se dibujan aparte, como la espada: el puño queda en
// (12, 14) al frente, (12, 6) arriba y (12, 8) en diagonal. GameScene coloca ahí el arma (MANO).
const vacio = n => Array(n).fill('................');
const MANO_FRENTE = [
    ...vacio(12),
    '..........00....',
    '.........0340...',
    '.........04330..',
    '..........000...',
    ...vacio(2)
];
const MANO_ARRIBA = [
    ...vacio(5),
    '............00..',
    '...........0330.',
    '...........0340.',
    '...........0430.',
    '..........0430..',
    '..........040...',
    '.........040....',
    '.........00.....',
    ...vacio(5)
];
const MANO_DIAGONAL = [
    ...vacio(7),
    '...........00...',
    '..........0330..',
    '.........04330..',
    '.........0430...',
    '.........040....',
    '.........00.....',
    ...vacio(5)
];

// Mano caída a un costado sujetando el arma en reposo (la espada cuelga hacia abajo). Puño en (9, 17).
const MANO_REPOSO = [
    ...vacio(11),
    '.........00.....',
    '........0450....',
    '........0540....',
    '........0450....',
    '........0540....',
    '........0450....',
    '........0330....',
    '.........00.....'
];

// Brazo apuntando en diagonal hacia abajo y adelante (solo con el ratón): la diagonal reflejada
// en vertical respecto al hombro (fila 12). Boca del cañón en (15, 20).
const HOMBRO = 12;
const BRAZO_DIAGONAL_ABAJO = Array.from({ length: TORSO.length },
    (_, y) => BRAZO_DIAGONAL[2 * HOMBRO - y] ?? '................');

const capa = (filas, nombre) => Lienzo.desdeTexto(filas, ANCHO, filas.length, `jugador.${nombre}`);
// Retroceso de las poses nuevas: el arma se desplaza en sentido contrario al disparo
const retroceso = (l, dx, dy) => new Lienzo(l.ancho, l.alto).pegar(l, dx, dy);

// Poses del brazo en orden de bloque de frames (ver cabecera de frames más abajo)
const POSES = [
    capa(BRAZO, 'brazo'),
    capa(BRAZO_RETROCESO, 'brazo-retroceso'),
    capa(BRAZO_ARRIBA, 'brazo-arriba'),
    retroceso(capa(BRAZO_ARRIBA, 'brazo-arriba'), 0, 1),
    capa(BRAZO_DIAGONAL, 'brazo-diagonal'),
    retroceso(capa(BRAZO_DIAGONAL, 'brazo-diagonal'), -1, 1),
    capa(MANO_FRENTE, 'mano-frente'),
    capa(MANO_ARRIBA, 'mano-arriba'),
    capa(MANO_DIAGONAL, 'mano-diagonal'),
    capa(MANO_REPOSO, 'mano-reposo'),
    capa(BRAZO_DIAGONAL_ABAJO, 'brazo-diagonal-abajo'),
    retroceso(capa(BRAZO_DIAGONAL_ABAJO, 'brazo-diagonal-abajo'), -1, -1)
];

// Cola de la bufanda por fuera del abrigo (píxeles [x, y, color]); se mueve con la animación:
// cuelga en reposo, ondea hacia atrás al correr y sube al saltar.
const COLA_BUFANDA = {
    quieto: [[2, 14, 'c'], [2, 15, 'b'], [2, 16, 'b']],
    correrA: [[2, 11, 'c'], [1, 11, 'b']],
    correrB: [[2, 11, 'c'], [1, 12, 'b']],
    correrC: [[2, 11, 'c'], [1, 10, 'b']],
    correrD: [[2, 12, 'c'], [1, 12, 'b']],
    saltar: [[3, 10, 'c'], [2, 9, 'c'], [1, 8, 'b']]
};

// Detalle del torso, por debajo del brazo: cinturón, bolsa y cola de la bufanda
function detalles(torso, piernas) {
    torso.patron(4, 18, 8, 1, (x, y) => (torso.color(x + 4, 18) !== '0' ? '1' : null));   // cinturón
    torso.punto(8, 18, '5');                                                                // hebilla
    torso.punto(10, 19, 'b').punto(10, 20, 'a');                                            // bolsa del cinturón
    const cola = new Lienzo(ANCHO, TORSO.length);
    COLA_BUFANDA[piernas].forEach(([x, y, c]) => cola.punto(x, y, c));
    return cola.contorno('0').pegar(torso, 0, 0);
}

// rebote: desplaza el torso 1 px hacia abajo (contacto con el suelo / respiración)
function frame(piernas, rebote, brazo) {
    const base = Lienzo.desdeTexto(TORSO, ANCHO, TORSO.length, 'jugador.torso');
    const torso = detalles(base, piernas).pegar(brazo, 0, 0);
    const abajo = Lienzo.desdeTexto(PIERNAS[piernas], ANCHO, PIERNAS[piernas].length, `jugador.${piernas}`);
    return new Lienzo(ANCHO, ALTO)
        .pegar(abajo, 0, TORSO.length)
        .pegar(torso, 0, rebote);
}

export default {
    nombre: 'jugador',
    ancho: ANCHO,
    alto: ALTO,
    // 12 bloques de 7 frames (quieto ×2, correr ×4, saltar), uno por pose del brazo:
    //   pistola: 0 frente · 1 frente con retroceso · 2 arriba · 3 arriba con retroceso · 4 diagonal · 5 diagonal con retroceso
    //   mano vacía (espada): 6 frente · 7 arriba · 8 diagonal · 9 reposo (brazo caído)
    //   pistola (solo con el ratón): 10 diagonal abajo · 11 diagonal abajo con retroceso
    // Las animaciones usan el bloque 0; GameScene suma 7 × bloque según hacia dónde apunta y si acaba de disparar.
    frames: () => POSES.flatMap(brazo => [
        frame('quieto', 0, brazo),
        frame('quieto', 1, brazo),
        frame('correrA', 1, brazo),
        frame('correrB', 0, brazo),
        frame('correrC', 1, brazo),
        frame('correrD', 0, brazo),
        frame('saltar', 0, brazo)
    ]),
    animaciones: {
        quieto: { frames: [0, 1], fps: 2, repetir: -1 },
        correr: { frames: [2, 3, 4, 5], fps: 10, repetir: -1 },
        saltar: { frames: [6], fps: 1, repetir: 0 }
    }
};
