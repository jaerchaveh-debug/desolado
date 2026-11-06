// Luz de las lámparas del fondo (tiles 11 y 12 de tiles-pasillo). Frames de 16x16:
//   0 apagada   1 cian encendida   2 roja encendida
// GameScene la coloca centrada sobre la carcasa y la hace parpadear con ritmos al azar.

import { Lienzo } from '../tools/pixel/lienzo.js';

const T = 16;
const C = 7.5;

function apagada() {
    const l = new Lienzo(T, T).circulo(C, C, 4, '1').circulo(C, C, 3, '2').circulo(C, C, 2, '3');
    return l.rect(6, 6, 2, 1, '4');
}

function encendida(nucleo, medio, halo) {
    const l = new Lienzo(T, T).patron(0, 0, T, T, (x, y) => {
        const d = Math.hypot(x - C, y - C);
        return d < 7.8 ? (d < 6.2 || (x + y) % 2 === 0 ? halo : null) : null;
    });
    return l.circulo(C, C, 5, medio).circulo(C, C, 3, nucleo).circulo(C, C, 1, '9');
}

export default {
    nombre: 'luz-fondo',
    hd: true,
    ancho: T,
    alto: T,
    frames: () => [apagada(), encendida('h', 'g', 'e'), encendida('j', 'j', 'i')]
};
