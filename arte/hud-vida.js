// Indicador de vida del jugador: celdas de energía de 16x16.
//   0 celda llena (cian)   1 celda vacía

import { Lienzo } from '../tools/pixel/lienzo.js';

const T = 16;

function celda(llena) {
    const [rampa, brillo, sombra] = llena ? ['hgfe', '9', 'e'] : ['3211', '4', '1'];
    const l = new Lienzo(T, T).rect(4, 0, 8, T, '0').rect(2, 1, 12, 14, '0').rect(1, 3, 14, 10, '0');
    l.degradado(3, 2, 10, 12, rampa, { costura: 0.4 });
    l.rect(2, 4, 12, 8, llena ? 'f' : '2').degradado(2, 4, 12, 8, rampa.slice(1), { costura: 0.4 });
    l.lineaV(4, 3, 7, brillo).lineaV(5, 3, 3, brillo).lineaH(5, 2, 5, llena ? 'h' : '4');   // reflejo
    l.lineaV(12, 5, 7, sombra).lineaH(4, 13, 8, sombra);
    return l;
}

export default {
    nombre: 'hud-vida',
    hd: true,
    ancho: T,
    alto: T,
    frames: () => [celda(true), celda(false)]
};
