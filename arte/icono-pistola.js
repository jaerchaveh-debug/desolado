// Icono de inventario de la pistola (skill `ilustracion`), 64x64, vista de lado con
// el cañón a la derecha. Pistola de energía tecno-gótica: corredera de placas
// remachadas, cañón con aletas de disipación, célula cian en la culata (único foco
// de luz) y empuñadura forrada con cordón de óxido.

import { Lienzo } from '../tools/pixel/lienzo.js';

const LADO = 64;

export default {
    nombre: 'icono-pistola',
    tipo: 'sprite',
    hd: true,
    ancho: LADO, alto: LADO,
    frames: () => {
        const l = new Lienzo(LADO, LADO);
        // Empuñadura inclinada hacia atrás y guardamonte
        l.poligono([[14, 30], [30, 30], [26, 54], [10, 54]], '3');
        l.poligono([[28, 30], [38, 30], [38, 38], [34, 42], [28, 42]], '2');
        l.rect(30, 31, 6, 7, '.').rect(30, 38, 4, 2, '.');
        l.linea(32, 31, 31, 36, '5').linea(33, 31, 32, 36, '4');   // gatillo
        l.linea(14, 30, 10, 54, '5').linea(15, 30, 11, 54, '4');
        // Corredera y cañón
        l.poligono([[10, 18], [54, 18], [56, 22], [56, 30], [10, 30]], '5');
        l.rect(54, 22, 6, 6, '4').lineaH(54, 22, 6, '6').rect(58, 23, 2, 4, '1');
        l.lineaH(12, 18, 42, '8').lineaH(12, 19, 42, '7').lineaH(12, 20, 40, '6');
        // Aletas de disipación sobre el cañón
        for (let x = 36; x <= 52; x += 4) l.rect(x, 14, 2, 4, '4').punto(x, 14, '6');
        // Ranura, placas y remaches de la corredera
        l.lineaH(16, 26, 36, '3').lineaH(16, 27, 36, '2');
        l.lineaV(30, 21, 5, '3').lineaV(44, 21, 5, '3');
        for (const [x, y] of [[14, 22], [26, 22], [48, 22]]) l.rect(x, y, 2, 2, '8').punto(x + 1, y + 1, '3');
        // Cordón de óxido en la empuñadura
        for (let y = 34; y <= 50; y += 5) {
            const x = 12 + Math.round((54 - y) / 6);
            l.linea(x, y, x + 13, y - 2, 'c').linea(x, y + 1, x + 13, y - 1, 'b');
        }
        // Célula de energía en la culata
        l.rect(12, 44, 8, 6, 'f').marco(11, 43, 10, 8, '1').rect(14, 44, 4, 1, 'h').rect(14, 46, 3, 2, 'g');
        // Sombra con trazos en la parte baja
        l.trazos((x, y) => l.color(x, y) === '5' && y >= 24, '4', { separacion: 3, inclinacion: 1, rotura: 0.2, semilla: 2 });
        l.trazos((x, y) => l.color(x, y) === '3' && x >= 20, '2', { separacion: 3, inclinacion: 1, rotura: 0.2, semilla: 3 });
        l.entintar('0', { lados: ['abajo', 'derecha'], irregular: 0.1, semilla: 4 });
        return [l];
    }
};
