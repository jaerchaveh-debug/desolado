// Onda de energía del ataque especial de la espada: media luna vertical que viaja hacia delante
// atravesando enemigos. Orientada a la derecha. Frames de 32x64 (dos tonos que alternan al viajar).

import { Lienzo, ruido } from '../tools/pixel/lienzo.js';

const ANCHO = 32;
const ALTO = 64;
const CY = 31.5;

// Media luna entre dos círculos desplazados: abombada hacia la derecha
function onda(colores, semilla) {
    return new Lienzo(ANCHO, ALTO).patron(0, 0, ANCHO, ALTO, (x, y) => {
        const dy = y - CY;
        const ext = Math.hypot(x + 8, dy * 1.2);    // círculo exterior, centro a la izquierda del frame
        const int = Math.hypot(x + 22, dy * 1.08);   // círculo interior, más a la izquierda
        if (ext > 36 || int < 36) return null;
        const borde = 36 - ext;                      // 0 en el filo exterior
        if (borde < 2.4) return colores[0];
        if (borde < 5.2) return colores[1];
        if (borde < 8) return colores[2];
        return ruido(x, y, semilla) > 0.35 ? colores[3] : null;   // cola que se deshace
    });
}

export default {
    nombre: 'onda-espada',
    hd: true,
    ancho: ANCHO,
    alto: ALTO,
    frames: () => [onda(['9', 'h', 'g', 'f'], 1), onda(['h', '9', 'h', 'g'], 2)],
    animaciones: {
        viajar: { frames: [0, 1], fps: 16, repetir: -1 }
    }
};
