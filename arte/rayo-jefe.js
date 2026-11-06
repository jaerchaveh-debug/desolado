// Rayo de los ojos del jefe: tramo de 32x16 que se repite a lo largo (TileSprite rotado). Frames:
//   0 marca (línea fina discontinua: avisa dónde caerá) · 1 rayo (hace daño) · 2 disipándose
import { Lienzo, ruido } from '../tools/pixel/lienzo.js';

const ANCHO = 32;
const ALTO = 16;

function marca() {
    const l = new Lienzo(ANCHO, ALTO);
    for (let x = 0; x < ANCHO; x++) {
        if (x % 16 < 10) l.rect(x, 7, 1, 2, 'j').punto(x, 6, 'i').punto(x, 9, 'i');
    }
    return l;
}

function rayo() {
    const l = new Lienzo(ANCHO, ALTO);
    l.rect(0, 2, ANCHO, 12, 'i').rect(0, 4, ANCHO, 8, 'j').rect(0, 6, ANCHO, 4, '9');
    // Borde que chisporrotea: se calcula por columna para que el tramo case al repetirse
    return l.patron(0, 0, ANCHO, ALTO, (x, y) => {
        const n = ruido(x, y, 71);
        if (y < 2 || y > 13) return n > 0.72 ? 'i' : null;
        if (y === 5 || y === 10) return n > 0.8 ? '9' : null;
        return null;
    });
}

function disipando() {
    const l = new Lienzo(ANCHO, ALTO);
    return l.patron(0, 4, ANCHO, 8, (x, y) => (ruido(x, y, 72) > 0.5 ? (y === 3 || y === 4 ? 'j' : 'i') : null));
}

export default {
    nombre: 'rayo-jefe',
    hd: true,
    ancho: ANCHO,
    alto: ALTO,
    frames: () => [marca(), rayo(), disipando()]
};
