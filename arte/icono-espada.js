// Icono de inventario de la espada de energía (skill `ilustracion`), 64x64, en
// diagonal con la empuñadura abajo a la izquierda. Hoja de luz cian (el único foco),
// guarda de placas, mango forrado con cordón de óxido y pomo remachado, como la
// espada del juego (arte/espada.js).

import { Lienzo } from '../tools/pixel/lienzo.js';

const LADO = 64;

export default {
    nombre: 'icono-espada',
    tipo: 'sprite',
    hd: true,
    ancho: LADO, alto: LADO,
    frames: () => {
        const l = new Lienzo(LADO, LADO);
        // Hoja: banda diagonal con núcleo blanco, filo claro arriba y lomo apagado
        l.poligono([[22, 35], [50, 7], [60, 2], [56, 13], [28, 41]], 'g');
        l.linea(24, 35, 52, 7, 'h').linea(25, 35, 53, 7, 'h');
        l.linea(26, 37, 54, 9, '9').linea(27, 37, 55, 9, '9').linea(26, 38, 54, 10, '9');
        l.linea(28, 41, 55, 14, 'f').linea(28, 40, 55, 13, 'f');
        // Guarda perpendicular a la hoja
        l.poligono([[14, 32], [20, 26], [36, 42], [30, 48]], '5');
        l.linea(16, 30, 20, 26, '8').linea(15, 31, 19, 27, '7').linea(31, 47, 35, 43, '3');
        for (const [x, y] of [[20, 32], [28, 40]]) l.rect(x, y, 2, 2, '8').punto(x + 1, y + 1, '3');
        // Mango con cordón de óxido y pomo
        l.poligono([[20, 38], [24, 42], [10, 56], [6, 52]], '3');
        for (const [x, y] of [[16, 44], [13, 47], [10, 50]]) l.linea(x, y, x + 4, y + 4, 'c').linea(x - 1, y, x + 3, y + 4, 'b');
        l.poligono([[6, 51], [11, 56], [6, 61], [1, 56]], '4').linea(1, 56, 6, 51, '6').rect(5, 55, 2, 2, '7');
        l.trazos((x, y) => '35'.includes(l.color(x, y)) && x + y > 70, '4', { separacion: 3, inclinacion: -1, rotura: 0.2, semilla: 2 });
        l.entintar('0', { lados: ['abajo', 'derecha'], irregular: 0.1, semilla: 5 });
        // Brillo de la punta
        return [l.rect(58, 3, 2, 2, '9')];
    }
};
