// Aura de carga del ataque especial de la espada: chispas que convergen girando hacia el centro.
// Se superpone al jugador durante la carga. Frames de 64x64 (bucle).

import { Lienzo } from '../tools/pixel/lienzo.js';

const T = 64;
const C = 31.5;
const CHISPAS = 14;

function anillo(fase) {
    const l = new Lienzo(T, T);
    const radio = 26 - fase * 5;                       // 26, 21, 16, 11: se cierran hacia el centro
    for (let i = 0; i < CHISPAS; i++) {
        const a = (i / CHISPAS) * Math.PI * 2 + fase * 0.45;
        const punto = r => [Math.round(C + Math.cos(a) * r), Math.round(C + Math.sin(a) * r)];
        // Estela corta hacia fuera y chispa de 2 px
        l.linea(...punto(radio + 2), ...punto(radio + 5), 'f');
        const [x, y] = punto(radio);
        l.rect(x, y, 2, 2, fase < 2 ? 'g' : 'h');
    }
    return l;
}

export default {
    nombre: 'carga-espada',
    hd: true,
    ancho: T,
    alto: T,
    frames: () => [0, 1, 2, 3].map(anillo),
    animaciones: {
        cargar: { frames: [0, 1, 2, 3], fps: 10, repetir: -1 }
    }
};
