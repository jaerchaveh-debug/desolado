// Rayo de los ojos del jefe: tramo de 16x8 que se repite a lo largo (TileSprite rotado). Frames:
//   0 marca (línea fina discontinua: avisa dónde caerá) · 1 rayo (hace daño) · 2 disipándose
import { Lienzo, ruido } from '../tools/pixel/lienzo.js';

const ANCHO = 16;
const ALTO = 8;

function marca() {
    const l = new Lienzo(ANCHO, ALTO);
    for (let x = 0; x < ANCHO; x++) if (x % 8 < 5) l.punto(x, 3, 'j').punto(x, 4, 'i');
    return l;
}

function rayo() {
    const l = new Lienzo(ANCHO, ALTO);
    l.lineaH(0, 1, ANCHO, 'i').lineaH(0, 2, ANCHO, 'j').rect(0, 3, ANCHO, 2, '9').lineaH(0, 5, ANCHO, 'j').lineaH(0, 6, ANCHO, 'i');
    return l.patron(0, 0, ANCHO, ALTO, (x, y) => ((y === 0 || y === 7) && ruido(x, y, 71) > 0.7 ? 'i' : null));
}

function disipando() {
    const l = new Lienzo(ANCHO, ALTO);
    return l.patron(0, 2, ANCHO, 4, (x, y) => (ruido(x, y, 72) > 0.45 ? (y === 1 || y === 2 ? 'j' : 'i') : null));
}

export default {
    nombre: 'rayo-jefe',
    ancho: ANCHO,
    alto: ALTO,
    frames: () => [marca(), rayo(), disipando()]
};
