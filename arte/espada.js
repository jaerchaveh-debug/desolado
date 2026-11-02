// Espada de energía (arma 2). Se dibuja aparte del jugador y GameScene la coloca en su mano y la rota.
// Apunta a la derecha con la empuñadura a la izquierda; el agarre está en (2, 3). Frames de 20x7:
//   0 en reposo (hoja cian)   1 cargando (hoja sobreexpuesta y halo)

import { Lienzo } from '../tools/pixel/lienzo.js';

const ANCHO = 20;
const ALTO = 7;

const REPOSO = [
    '....000.............',
    '...05600000000000...',
    '00056hhhhhhhhhhh990.',
    '0230g9999999999999h0',
    '00056ggggggggggfff0.',
    '...05600000000000...',
    '....000.............'
];

// Cargando: la hoja se aclara y el contorno de la hoja se vuelve halo cian
function cargando() {
    return REPOSO.map((fila, y) => [...fila].map((c, x) => {
        if (x < 5) return c;                                   // empuñadura y guarda sin cambios
        if (c === '0') return 'g';
        return { h: '9', g: 'h', f: 'g' }[c] ?? c;
    }).join(''));
}

export default {
    nombre: 'espada',
    ancho: ANCHO,
    alto: ALTO,
    frames: () => [REPOSO, cargando()].map((f, i) => Lienzo.desdeTexto(f, ANCHO, ALTO, `espada.${i}`))
};
