// Espada de energía (arma 2). Se dibuja aparte del jugador y GameScene la coloca en su mano y la rota.
// Apunta a la derecha con la empuñadura a la izquierda; el agarre está en (4, 7). Frames de 40x14:
//   0 en reposo (hoja cian)   1 cargando (hoja sobreexpuesta y halo)

import { Lienzo } from '../tools/pixel/lienzo.js';

const ANCHO = 40;
const ALTO = 14;
const INICIO_HOJA = 12;

function reposo() {
    const l = new Lienzo(ANCHO, ALTO);
    // Hoja: tinta, cuerpo cian, filo blanco y lomo apagado
    l.poligono([[10, 3], [33, 3], [39, 7], [33, 10], [10, 10]], '0');
    l.poligono([[11, 4], [33, 4], [37, 7], [33, 9], [11, 9]], 'g');
    l.lineaH(11, 4, 22, 'h').rect(11, 5, 24, 3, '9').lineaH(34, 6, 3, 'h').lineaH(11, 8, 23, 'g').lineaH(11, 9, 22, 'f');
    // Guarda de metal
    l.rect(7, 0, 5, ALTO, '0').rect(8, 1, 3, 12, '5').lineaV(8, 1, 12, '7').lineaV(10, 1, 12, '3');
    // Empuñadura con vendaje de óxido y pomo
    l.rect(1, 4, 6, 6, '0').rect(2, 5, 5, 4, '3');
    for (const x of [3, 5]) l.lineaV(x, 5, 4, 'c');
    return l.rect(0, 5, 2, 4, '6').lineaV(0, 5, 4, '0');
}

// Cargando: la hoja se aclara y su contorno se vuelve halo cian
function cargando() {
    const l = reposo();
    return l.patron(INICIO_HOJA, 0, ANCHO - INICIO_HOJA, ALTO, (x, y) => {
        const c = l.color(x + INICIO_HOJA, y);
        return c === '0' ? 'g' : { h: '9', g: 'h', f: 'g' }[c] ?? null;
    });
}

export default {
    nombre: 'espada',
    hd: true,
    ancho: ANCHO,
    alto: ALTO,
    frames: () => [reposo(), cargando()]
};
