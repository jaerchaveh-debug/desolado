// Icono de inventario de la pistola (skill `ilustracion`), 32x32, vista de lado con
// el cañón a la derecha. Pistola de energía tecno-gótica: corredera de placas
// remachadas, cañón con aletas de disipación, célula cian en la culata (único foco
// de luz) y empuñadura forrada con cordón de óxido.

import { Lienzo } from '../tools/pixel/lienzo.js';

const LADO = 32;

export default {
    nombre: 'icono-pistola',
    tipo: 'sprite',
    ancho: LADO, alto: LADO,
    frames: () => {
        const l = new Lienzo(LADO, LADO);
        // Empuñadura inclinada hacia atrás y guardamonte
        l.poligono([[7, 15], [15, 15], [13, 27], [5, 27]], '3');
        l.poligono([[14, 15], [19, 15], [19, 20], [14, 20]], '2');
        l.rect(15, 16, 3, 3, '1');
        // Corredera y cañón
        l.poligono([[5, 9], [27, 9], [28, 11], [28, 15], [5, 15]], '5');
        l.rect(27, 11, 3, 3, '4');
        l.lineaH(6, 9, 21, '7').lineaH(6, 10, 20, '6');
        // Aletas de disipación sobre el cañón
        for (let x = 18; x <= 26; x += 2) l.lineaV(x, 7, 2, '4');
        // Ranura y remaches de la corredera
        l.lineaH(8, 13, 18, '3');
        [[7, 11], [13, 11], [24, 11]].forEach(([x, y]) => l.punto(x, y, '8'));
        // Cordón de óxido en la empuñadura
        for (let y = 17; y <= 25; y += 3) l.linea(6 + Math.round((27 - y) / 6), y, 12 + Math.round((27 - y) / 6), y - 1, 'c');
        // Célula de energía en la culata
        l.rect(6, 22, 4, 3, 'f').lineaH(7, 22, 2, 'h').punto(7, 23, 'g');
        // Sombra con trazos en la parte baja
        l.trazos((x, y) => l.color(x, y) === '5' && y >= 13, '4', { separacion: 2, inclinacion: 1, rotura: 0.2, semilla: 2 });
        l.trazos((x, y) => l.color(x, y) === '3' && x >= 10, '2', { separacion: 3, inclinacion: 1, rotura: 0.2, semilla: 3 });
        l.entintar('0', { lados: ['abajo', 'derecha'], irregular: 0.2, semilla: 4 });
        // Destello en la boca del cañón
        l.punto(29, 12, 'g');
        return [l];
    }
};
