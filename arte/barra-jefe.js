// Barra de vida del jefe (arriba, centrada). 160x6. Frames: 0 llena · 1 vacía
// GameScene superpone la llena recortada desde la derecha según la vida que queda.
import { Lienzo } from '../tools/pixel/lienzo.js';

const ANCHO = 160;
const ALTO = 6;

function barra(llena) {
    const l = new Lienzo(ANCHO, ALTO).rect(0, 0, ANCHO, ALTO, '0');
    if (llena) l.lineaH(1, 1, ANCHO - 2, '9').rect(1, 2, ANCHO - 2, 2, 'j').lineaH(1, 4, ANCHO - 2, 'i');
    else l.lineaH(1, 1, ANCHO - 2, '3').rect(1, 2, ANCHO - 2, 3, '2');
    for (let x = 20; x < ANCHO; x += 20) l.lineaV(x, 1, 4, '0');   // marcas cada 12,5 % de vida
    for (const [x, y] of [[0, 0], [ANCHO - 1, 0], [0, ALTO - 1], [ANCHO - 1, ALTO - 1]]) l.px[y][x] = '.';   // esquinas redondeadas
    return l;
}

export default {
    nombre: 'barra-jefe',
    ancho: ANCHO,
    alto: ALTO,
    frames: () => [barra(true), barra(false)]
};
