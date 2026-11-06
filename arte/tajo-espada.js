// Estela del tajo de la espada: media luna de energía que nace en la mano y se extiende hacia delante.
// Orientada a la derecha; el borde izquierdo (centro vertical) es la mano. Frames de 160x64:
//   0 tajo (filo blanco y estela cian)   1 desvaneciéndose   2 restos
// Su tamaño coincide con el área de daño del ataque (alcance 160 × ancho 64).

import { Lienzo, ruido } from '../tools/pixel/lienzo.js';

const ANCHO = 160;
const ALTO = 64;
const CY = 32;

// Media elipse exterior e interior: el espacio entre ambas es la media luna
const EXT = { a: 158, b: 30 };
const INT = { a: 116, b: 30 };

// 0 en el borde interior, 1 en el exterior; null fuera de la media luna
function grosor(x, y) {
    const dy = y - CY;
    const ext = (x / EXT.a) ** 2 + (dy / EXT.b) ** 2;
    const int = (x / INT.a) ** 2 + (dy / INT.b) ** 2;
    if (ext > 1 || int < 1) return null;
    return Math.min(1, (int - 1) / Math.max(0.0001, int - ext));
}

function tajo() {
    return new Lienzo(ANCHO, ALTO).patron(0, 0, ANCHO, ALTO, (x, y) => {
        const g = grosor(x, y);
        if (g === null) return null;
        return g > 0.88 ? '9' : g > 0.65 ? 'h' : g > 0.35 ? 'g' : ruido(x >> 1, y, 4) > 0.4 ? 'f' : ruido(x, y, 5) > 0.7 ? 'e' : null;
    });
}

function desvaneciendo() {
    return new Lienzo(ANCHO, ALTO).patron(0, 0, ANCHO, ALTO, (x, y) => {
        const g = grosor(x, y);
        if (g === null || g < 0.5) return null;
        return g > 0.88 ? 'h' : ruido(x >> 1, y, 6) > 0.35 ? 'g' : ruido(x, y, 7) > 0.6 ? 'f' : null;
    });
}

function restos() {
    return new Lienzo(ANCHO, ALTO).patron(0, 0, ANCHO, ALTO, (x, y) => {
        const g = grosor(x, y);
        return g !== null && g > 0.7 && ruido(x >> 1, y, 8) > 0.72 ? 'f' : null;
    });
}

export default {
    nombre: 'tajo-espada',
    hd: true,
    ancho: ANCHO,
    alto: ALTO,
    frames: () => [tajo(), desvaneciendo(), restos()],
    animaciones: {
        disparo: { frames: [0, 1, 2], fps: 24, repetir: 0 }
    }
};
