// Onda de energía del ataque especial de la espada: media luna vertical que viaja hacia delante
// atravesando enemigos. Orientada a la derecha. Frames de 16x32 (dos tonos que alternan al viajar).

import { Lienzo } from '../tools/pixel/lienzo.js';

const ANCHO = 16;
const ALTO = 32;
const CY = 15.5;

// Media luna entre dos círculos desplazados: abombada hacia la derecha
function onda(colores) {
    return new Lienzo(ANCHO, ALTO).patron(0, 0, ANCHO, ALTO, (x, y) => {
        const dy = y - CY;
        const ext = Math.hypot(x + 4, dy * 1.05);    // círculo exterior, centro a la izquierda del frame
        const int = Math.hypot(x + 11, dy * 0.95);   // círculo interior, más a la izquierda
        if (ext > 18 || int < 18) return null;
        const borde = 18 - ext;                      // 0 en el filo exterior
        return borde < 1.2 ? colores[0] : borde < 2.6 ? colores[1] : borde < 4 ? colores[2] : colores[3];
    });
}

export default {
    nombre: 'onda-espada',
    ancho: ANCHO,
    alto: ALTO,
    frames: () => [onda(['9', 'h', 'g', 'f']), onda(['h', '9', 'h', 'g'])],
    animaciones: {
        viajar: { frames: [0, 1], fps: 16, repetir: -1 }
    }
};
