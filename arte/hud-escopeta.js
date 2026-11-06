// Icono de carga del estallido de la pistola (esquina inferior derecha). Cartucho de energía de 32x32:
//   0 cargado (cian brillante)   1 descargado (apagado)
// GameScene superpone el frame 0 recortado desde abajo según el progreso de recarga.

import { Lienzo } from '../tools/pixel/lienzo.js';

const T = 32;

function cartucho(cargado) {
    const [rampa, brillo, canto, base, baseLuz, baseSombra] = cargado
        ? ['hhggfe', '9', 'f', 'c', 'd', 'b']
        : ['332211', '4', '1', '4', '5', '3'];
    const l = new Lienzo(T, T);
    // Cuerpo con punta achaflanada
    l.poligono([[12, 2], [20, 2], [24, 6], [24, 23], [8, 23], [8, 6]], '0');
    l.poligono([[13, 3], [19, 3], [23, 7], [23, 22], [9, 22], [9, 7]], rampa[0]);
    l.degradado(9, 3, 15, 20, rampa, { costura: 0, zona: (x, y) => l.color(x, y) !== '0' && l.color(x, y) !== '.' });
    l.rect(11, 6, 2, 13, brillo).rect(13, 4, 3, 1, brillo);    // reflejo
    l.rect(21, 7, 2, 15, canto);
    for (const y of [10, 15, 20]) l.lineaH(9, y, 14, canto);  // anillas del cartucho
    // Culote metálico
    l.rect(6, 23, 21, 7, '0').rect(7, 24, 19, 5, base).lineaH(7, 24, 19, baseLuz).lineaH(7, 28, 19, baseSombra);
    for (let x = 9; x < 24; x += 4) l.lineaV(x, 25, 3, baseSombra);
    return l;
}

export default {
    nombre: 'hud-escopeta',
    hd: true,
    ancho: T,
    alto: T,
    frames: () => [cartucho(true), cartucho(false)]
};
