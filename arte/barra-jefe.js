// Barra de vida del jefe (arriba, centrada). 320x12. Frames: 0 llena · 1 vacía
// GameScene superpone la llena recortada desde la derecha según la vida que queda.
import { Lienzo } from '../tools/pixel/lienzo.js';

const ANCHO = 320;
const ALTO = 12;

function barra(llena) {
    const l = new Lienzo(ANCHO, ALTO).rect(0, 0, ANCHO, ALTO, '0');
    const filas = llena ? ['9', 'j', 'j', 'j', 'j', 'j', 'i', 'i', 'i', 'i'] : ['3', '3', '2', '2', '2', '2', '1', '1', '1', '1'];
    filas.forEach((c, i) => l.lineaH(2, 1 + i, ANCHO - 4, c));
    for (let x = 40; x < ANCHO; x += 40) l.rect(x, 1, 2, ALTO - 2, '0');   // marcas cada 12,5 % de vida
    // Esquinas achaflanadas
    for (const [x, y] of [[0, 0], [1, 0], [0, 1], [ANCHO - 1, 0], [ANCHO - 2, 0], [ANCHO - 1, 1],
        [0, ALTO - 1], [1, ALTO - 1], [0, ALTO - 2], [ANCHO - 1, ALTO - 1], [ANCHO - 2, ALTO - 1], [ANCHO - 1, ALTO - 2]]) l.px[y][x] = '.';
    return l;
}

export default {
    nombre: 'barra-jefe',
    hd: true,
    ancho: ANCHO,
    alto: ALTO,
    frames: () => [barra(true), barra(false)]
};
