// Icono de inventario de la espada de energía (skill `ilustracion`), 32x32, en
// diagonal con la empuñadura abajo a la izquierda. Hoja de luz cian (el único foco),
// guarda de placas, mango forrado con cordón de óxido y pomo remachado, como la
// espada del juego (arte/espada.js).

import { Lienzo } from '../tools/pixel/lienzo.js';

const LADO = 32;

export default {
    nombre: 'icono-espada',
    tipo: 'sprite',
    ancho: LADO, alto: LADO,
    frames: () => {
        const l = new Lienzo(LADO, LADO);
        // Hoja: banda diagonal de 3 px con núcleo blanco y filo claro arriba
        l.poligono([[11, 18], [26, 3], [29, 3], [29, 6], [14, 21]], 'g');
        l.linea(13, 19, 27, 5, 'h').linea(14, 19, 28, 5, '9');
        l.linea(14, 21, 29, 6, 'f');
        // Guarda perpendicular a la hoja
        l.poligono([[7, 16], [10, 13], [18, 21], [15, 24]], '5');
        l.linea(8, 15, 10, 13, '7').punto(16, 22, '3');
        // Mango con cordón de óxido y pomo
        l.poligono([[9, 20], [11, 22], [5, 28], [3, 26]], '3');
        [[8, 22], [6, 24], [4, 26]].forEach(([x, y]) => l.punto(x, y, 'c').punto(x + 1, y + 1, 'c'));
        l.rect(1, 27, 4, 4, '4').punto(2, 28, '7');
        l.trazos((x, y) => '35'.includes(l.color(x, y)) && x + y > 32, '2', { separacion: 2, inclinacion: -1, rotura: 0.2, semilla: 2 });
        l.entintar('0', { lados: ['abajo', 'derecha'], irregular: 0.2, semilla: 5 });
        // Brillo de la punta
        l.punto(29, 3, '9');
        return [l];
    }
};
