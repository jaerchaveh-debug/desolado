// Aura de carga del ataque especial de la espada: chispas que convergen girando hacia el centro.
// Se superpone al jugador durante los 2 s de carga. Frames de 32x32 (bucle).

import { Lienzo } from '../tools/pixel/lienzo.js';

const T = 32;
const C = 15.5;
const CHISPAS = 10;

function anillo(fase) {
    const l = new Lienzo(T, T);
    const radio = 14 - fase * 3;                       // 14, 11, 8, 5: se cierran hacia el centro
    for (let i = 0; i < CHISPAS; i++) {
        const a = (i / CHISPAS) * Math.PI * 2 + fase * 0.45;
        const x = Math.round(C + Math.cos(a) * radio), y = Math.round(C + Math.sin(a) * radio);
        l.punto(x, y, fase < 2 ? 'g' : 'h');
        // estela corta hacia fuera
        const xs = Math.round(C + Math.cos(a) * (radio + 2)), ys = Math.round(C + Math.sin(a) * (radio + 2));
        l.punto(xs, ys, 'f');
    }
    return l;
}

export default {
    nombre: 'carga-espada',
    ancho: T,
    alto: T,
    frames: () => [0, 1, 2, 3].map(anillo),
    animaciones: {
        cargar: { frames: [0, 1, 2, 3], fps: 10, repetir: -1 }
    }
};
