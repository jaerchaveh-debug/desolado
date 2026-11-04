// Figura de cuerpo entero del errante (skill `ilustracion`), 80x128, de pie y girado
// un poco a la derecha. Se muestra en la pantalla de equipamiento, bajo los espacios
// de armas. Mismo diseño que el retrato (arte/retrato-jugador.js): rostro oculto
// bajo la capucha, visor cian bajado (el único foco de luz), mechones blancos,
// bufanda de óxido con la cola al viento y abrigo largo de tela sintética con cuello
// de placas, cinturón de cable y bajo desgarrado (tecno-gótico).
//
// Animación 'quieto' (16 frames a 8 fps, 2 s en bucle): respira (cabeza, bufanda y
// hombros bajan 1 px), la cola de la bufanda se balancea (más cuanto más cerca de la
// punta) y las luces del visor parpadean una vez.

import { Lienzo } from '../tools/pixel/lienzo.js';

const ANCHO = 80;
const ALTO = 128;

const FRAMES = 16;
// Filas que bajan 1 px al respirar (capucha, bufanda y hombreras); el abrigo de debajo no se mueve
const ALTO_RESPIRO = 48;

// cola: px que se desplaza la punta de la bufanda (la raíz, en el cuello, no se mueve)
function figura({ cola = 0 } = {}) {
        const l = new Lienzo(ANCHO, ALTO);
        const ondea = (x, y) => [x + Math.round(cola * Math.max(0, y - 31) / 35), y];
        const lineaCola = (x0, y0, x1, y1, c) => l.linea(...ondea(x0, y0), ...ondea(x1, y1), c);

        // Cola de la bufanda ondeando hacia atrás (detrás del cuerpo)
        l.poligono([[31, 31], [24, 36], [17, 43], [13, 52], [12, 60], [10, 66], [14, 63], [17, 55], [21, 46], [28, 40], [33, 37]]
            .map(([x, y]) => ondea(x, y)), 'c');
        lineaCola(16, 50, 27, 38, 'b'); lineaCola(12, 62, 15, 52, 'd'); lineaCola(19, 44, 23, 40, 'd');

        // Piernas y botas
        l.poligono([[31, 104], [38, 104], [37, 120], [31, 120]], '2');
        l.poligono([[42, 104], [49, 104], [50, 120], [43, 120]], '2');
        l.poligono([[29, 119], [38, 119], [39, 124], [27, 124]], '3');
        l.poligono([[42, 119], [51, 119], [55, 124], [42, 124]], '3');
        l.lineaH(28, 119, 10, '5').lineaH(43, 119, 8, '5');

        // Abrigo largo, más ancho hacia el bajo, con el borde desgarrado
        l.poligono([[30, 33], [50, 33], [57, 38], [56, 52], [54, 62], [58, 80], [62, 108], [55, 106], [50, 110], [44, 106],
            [38, 111], [32, 106], [25, 110], [18, 106], [22, 80], [26, 62], [24, 52], [23, 38]], '3');
        // Abertura delantera y faldón interior más oscuro
        l.poligono([[40, 64], [44, 64], [48, 106], [44, 106], [38, 111], [36, 106]], '2');
        // Brazos caídos a los lados, con guantes
        l.poligono([[23, 38], [29, 40], [28, 56], [26, 74], [21, 74], [21, 56]], '4');
        l.poligono([[57, 38], [51, 40], [52, 56], [55, 74], [59, 74], [59, 56]], '3');
        // Tinta entre los brazos y el abrigo, que se corta antes de la mano
        l.linea(29, 41, 27, 70, '1').linea(51, 41, 54, 70, '1');
        l.linea(22, 50, 22, 54, '3').linea(57, 50, 58, 56, '2');
        l.poligono([[20, 74], [26, 74], [26, 80], [21, 80]], '2');
        l.poligono([[54, 74], [60, 74], [59, 80], [55, 80]], '2');

        // Cinturón de cable trenzado con hebilla
        l.linea(25, 62, 55, 64, '2');
        for (let x = 26; x <= 54; x += 3) l.punto(x, 62 + Math.round((x - 25) * 2 / 30), '6');
        l.rect(38, 62, 4, 3, '6').punto(39, 63, '9');

        // Cuello alto de placas remachadas
        l.poligono([[27, 30], [33, 27], [35, 37], [28, 40]], '5');
        l.poligono([[53, 30], [47, 27], [45, 37], [52, 40]], '5');
        [[30, 33], [50, 33]].forEach(([x, y]) => l.punto(x, y, '7'));

        // Capucha y cara en sombra
        l.elipse(40, 18, 12, 14, '4');
        l.poligono([[28, 20], [52, 20], [54, 32], [26, 32]], '4');
        l.elipse(41, 20, 8, 10, '1');
        // Mechones blancos que asoman a los lados del visor
        l.poligono([[33, 12], [37, 11], [36, 22], [34, 26]], '8');
        l.poligono([[45, 11], [49, 13], [49, 24], [47, 21]], '8');
        l.poligono([[37, 12], [41, 12], [39, 18]], '8');
        l.poligono([[41, 12], [45, 12], [44, 17]], '8');
        l.linea(34, 13, 35, 22, '9').linea(38, 13, 39, 16, '9').punto(48, 17, 's').punto(35, 16, 't');
        l.linea(41, 13, 41, 15, '1');
        // Visor bajado con sus dos luces
        l.poligono([[33, 17], [50, 17], [49, 21], [34, 21]], '2');
        l.poligono([[35, 18], [48, 18], [47, 20], [35, 20]], 'e');
        l.lineaH(36, 18, 5, 'f');
        l.lineaH(37, 19, 3, 'g').punto(38, 19, 'h').lineaH(44, 19, 3, 'g').punto(45, 19, 'h');

        // Bufanda envuelta hasta la nariz
        l.poligono([[33, 22], [49, 22], [52, 28], [50, 34], [30, 34], [29, 28]], 'c');
        l.linea(31, 25, 50, 24, 'd').linea(30, 29, 51, 29, 'b').linea(31, 32, 49, 32, 'b');

        // --- Detalles ---------------------------------------------------------------
        // Tubo que baja de la nuca por la espalda (asoma por detrás del hombro derecho)
        l.linea(53, 30, 59, 44, '2').linea(54, 30, 60, 44, '2');
        [[55, 34], [57, 38], [59, 42]].forEach(([x, y]) => l.punto(x, y, '6'));
        // Costura de la capucha y ribete de la abertura
        l.linea(40, 5, 42, 12, '3');
        l.linea(30, 14, 31, 26, '5');
        // Hombreras de placas superpuestas, remachadas
        l.poligono([[20, 42], [29, 40], [29, 46], [20, 49]], '5');
        l.poligono([[21, 36], [30, 33], [31, 40], [21, 43]], '6');
        l.poligono([[60, 42], [51, 40], [51, 46], [60, 49]], '4');
        l.poligono([[59, 36], [50, 33], [49, 40], [59, 43]], '5');
        // Borde inferior de cada placa en tinta y filo superior iluminado
        l.linea(21, 43, 31, 40, '1').linea(20, 49, 29, 46, '1').linea(59, 43, 49, 40, '1').linea(60, 49, 51, 46, '1');
        l.linea(22, 36, 29, 34, '8').linea(21, 42, 28, 40, '7');
        [[24, 39], [28, 37], [23, 45], [27, 44], [56, 39], [52, 37], [57, 45], [53, 44]].forEach(([x, y]) => l.punto(x, y, '8'));
        // Cordón de cable que cierra el pecho en zigzag, sobre la costura central
        l.linea(40, 40, 40, 61, '2');
        for (let y = 42; y <= 58; y += 4) {
            l.linea(37, y, 43, y + 2, '2').linea(43, y, 37, y + 2, '2');
            l.punto(40, y + 1, '6');
        }
        // Bolsas colgadas del cinturón
        l.poligono([[27, 64], [33, 64], [33, 71], [27, 71]], '2');
        l.poligono([[27, 64], [33, 64], [33, 66], [27, 66]], '4');
        l.punto(30, 67, '6');
        l.poligono([[47, 65], [52, 65], [52, 70], [47, 70]], '2');
        l.lineaH(47, 65, 6, '4');
        // Parche cosido en el faldón, con puntadas
        l.poligono([[23, 84], [30, 83], [30, 92], [24, 93]], '4');
        for (let y = 84; y <= 92; y += 2) l.punto(23, y, '6').punto(30, y - 1, '6');
        // Chorreones de óxido que suben desde el bajo del abrigo, y desgarros
        [[21, 98, 8], [28, 100, 6], [34, 96, 10], [46, 99, 7], [55, 97, 9]].forEach(([x, y, largo]) => {
            l.lineaV(x, y, largo, 'b').punto(x, y, 'a').punto(x + 1, y + largo - 3, 'b');
        });
        l.linea(25, 104, 26, 110, '4').linea(50, 104, 50, 110, '2').linea(38, 106, 38, 111, '4');
        // Guantes con placas en los nudillos y puño
        l.lineaH(20, 74, 7, '4').lineaH(54, 74, 7, '3');
        l.lineaH(21, 78, 5, '5').lineaH(55, 78, 4, '4');
        // Rodillera en la pierna cercana y botas con correas, puntera y suela
        l.poligono([[31, 106], [37, 106], [37, 111], [31, 111]], '4');
        l.lineaH(32, 107, 4, '6');
        l.lineaH(31, 115, 7, '4').lineaH(43, 115, 7, '3');
        l.lineaH(27, 124, 12, '1').lineaH(42, 124, 13, '1');
        l.rect(27, 121, 3, 3, '5').rect(52, 121, 3, 3, '4');
        // Flecos deshilachados al final de la cola de la bufanda
        lineaCola(10, 66, 9, 70, 'c'); lineaCola(12, 65, 12, 69, 'b'); lineaCola(14, 63, 15, 67, 'c');
        // Franjas tejidas en la bufanda
        [[33, 27], [38, 27], [43, 26], [48, 26]].forEach(([x, y]) => l.lineaH(x, y, 2, 'd'));

        // Luz desde arriba a la izquierda; sombra con trazos a la derecha
        l.aclarar((x, y) => l.color(x, y) === '3' && x < 36 && y < 100);
        l.aclarar((x, y) => l.color(x, y) === '4' && x + y < 50);
        l.trazos((x, y) => '34'.includes(l.color(x, y)) && x > 47, '2', { separacion: 3, inclinacion: 1, rotura: 0.2, semilla: 3 });
        l.trazos((x, y) => l.color(x, y) === 'c' && x > 44, 'b', { separacion: 3, inclinacion: -1, rotura: 0.2, semilla: 4 });
        // Pliegues verticales del abrigo
        l.linea(30, 70, 27, 104, '3').linea(52, 70, 56, 104, '2').linea(36, 68, 34, 104, '3');

        l.entintar('0', { lados: ['abajo', 'derecha'], irregular: 0.25, semilla: 6 });
        return l;
}

// Baja 1 px las filas de arriba (respiración); la fila que queda libre arriba es transparente
function respirar(l) {
    for (let y = ALTO_RESPIRO; y > 0; y--) l.px[y] = [...l.px[y - 1]];
    l.px[0] = Array(ANCHO).fill('.');
    return l;
}

// Visor apagándose un instante: cada luz baja un tono de su rampa
function parpadear(l) {
    l.patron(33, 16, 18, 7, (x, y) => ({ h: 'g', g: 'f' })[l.color(x + 33, y + 16)] ?? null);
    return l;
}

export default {
    nombre: 'figura-jugador',
    tipo: 'sprite',
    ancho: ANCHO, alto: ALTO,
    frames: () => Array.from({ length: FRAMES }, (_, i) => {
        const l = figura({ cola: Math.round(2 * Math.sin((i / FRAMES) * Math.PI * 2)) });
        if (i >= 5 && i <= 11) respirar(l);   // inspira a mitad del ciclo
        if (i === 13) parpadear(l);
        return l;
    }),
    animaciones: {
        quieto: { frames: Array.from({ length: FRAMES }, (_, i) => i), fps: 8, repetir: -1 }
    }
};
