// Icono de carga del ataque especial de la espada (esquina inferior derecha). 32x32:
//   0 cargado (onda cian)   1 descargado (apagado)
// GameScene superpone el frame 0 recortado desde abajo según el progreso de recarga.

import { Lienzo } from '../tools/pixel/lienzo.js';

const T = 32;
const CY = 15.5;

// Media luna abombada hacia la derecha, con el filo claro por fuera
function onda(colores) {
    const l = new Lienzo(T, T).patron(0, 0, T, T, (x, y) => {
        const dy = y - CY;
        const ext = Math.hypot(x - 8, dy), int = Math.hypot(x - 3, dy);
        if (ext > 13.5 || int < 15) return null;
        const borde = 13.5 - ext;
        return borde < 2 ? colores[0] : borde < 4 ? colores[1] : colores[2];
    });
    return l.contorno('0');
}

export default {
    nombre: 'hud-espada',
    hd: true,
    ancho: T,
    alto: T,
    frames: () => [onda(['9', 'h', 'g']), onda(['4', '3', '2'])]
};
