// Efectos de la pistola. Frames de 16x16, orientados a la derecha:
//   0 bala de energía cian   1 destello en la boca del cañón   2 impacto

import { Lienzo, ruido } from '../tools/pixel/lienzo.js';

const T = 16;

function bala() {
    const l = new Lienzo(T, T);
    l.rect(1, 7, 4, 2, 'e').rect(4, 7, 3, 2, 'f').rect(5, 6, 6, 4, 'g').rect(8, 6, 5, 4, 'h');
    l.rect(10, 7, 4, 2, '9').lineaV(13, 6, 4, 'h').lineaV(14, 7, 2, '9');
    return l;
}

function destello() {
    const l = new Lienzo(T, T);
    l.linea(6, 2, 9, 6, 'h').linea(6, 13, 9, 9, 'h').linea(5, 3, 8, 6, 'g').linea(5, 12, 8, 9, 'g');
    l.rect(0, 7, 3, 2, 'g').rect(2, 6, 3, 4, 'h').rect(4, 6, 8, 4, '9').rect(11, 7, 3, 2, 'h').punto(14, 7, 'g').punto(14, 8, 'g');
    return l;
}

function impacto() {
    const l = new Lienzo(T, T);
    for (let i = 0; i < 9; i++) {
        const a = i / 9 * Math.PI * 2 + ruido(i, 1, 3), desde = 3 + ruido(i, 2, 3) * 2, hasta = 6 + ruido(i, 3, 3) * 2;
        const x0 = 8 + Math.cos(a) * desde, y0 = 8 + Math.sin(a) * desde;
        l.linea(x0, y0, 8 + Math.cos(a) * hasta, 8 + Math.sin(a) * hasta, i % 2 ? 'g' : 'h');
    }
    return l.rect(7, 6, 2, 4, '9').rect(6, 7, 4, 2, '9');
}

export default {
    nombre: 'proyectil',
    hd: true,
    ancho: T,
    alto: T,
    frames: () => [bala(), destello(), impacto()]
};
