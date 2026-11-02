// Estela del tajo de la espada: media luna de energía que nace en la mano y se extiende hacia delante.
// Orientada a la derecha; el borde izquierdo (centro vertical) es la mano. Frames de 80x32:
//   0 tajo (filo blanco y estela cian)   1 desvaneciéndose   2 restos
// Su tamaño coincide con el área de daño del ataque (alcance 80 × ancho 32).

import { Lienzo, ruido } from '../tools/pixel/lienzo.js';

const ANCHO = 80;
const ALTO = 32;
const CY = 16;

// Media elipse exterior e interior: el espacio entre ambas es la media luna
const EXT = { a: 76, b: 15 };
const INT = { a: 58, b: 10 };

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
        return g > 0.85 ? '9' : g > 0.6 ? 'h' : g > 0.3 ? 'g' : ruido(x, y, 4) > 0.4 ? 'f' : null;
    });
}

function desvaneciendo() {
    return new Lienzo(ANCHO, ALTO).patron(0, 0, ANCHO, ALTO, (x, y) => {
        const g = grosor(x, y);
        if (g === null || g < 0.5) return null;
        return g > 0.85 ? 'h' : ruido(x, y, 6) > 0.35 ? 'g' : null;
    });
}

function restos() {
    return new Lienzo(ANCHO, ALTO).patron(0, 0, ANCHO, ALTO, (x, y) => {
        const g = grosor(x, y);
        return g !== null && g > 0.7 && ruido(x, y, 8) > 0.75 ? 'f' : null;
    });
}

export default {
    nombre: 'tajo-espada',
    ancho: ANCHO,
    alto: ALTO,
    frames: () => [tajo(), desvaneciendo(), restos()],
    animaciones: {
        disparo: { frames: [0, 1, 2], fps: 24, repetir: 0 }
    }
};
