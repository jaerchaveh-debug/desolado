// Figura de cuerpo entero del errante (skill `ilustracion`), 160x256, de pie y girado
// un poco a la derecha. Se muestra en la pantalla de equipamiento, bajo los espacios
// de armas. Mismo diseño que el retrato (arte/retrato-jugador.js): rostro oculto
// bajo la capucha, visor cian bajado (el único foco de luz), mechones blancos,
// bufanda de óxido con la cola al viento y abrigo largo de tela sintética con cuello
// de placas, cinturón de cable y bajo desgarrado (tecno-gótico).
//
// Animación 'quieto' (16 frames a 8 fps, 2 s en bucle): respira (cabeza, bufanda y
// torso bajan hasta 2 px, en dos pasos), la cola de la bufanda se balancea (más cuanto más cerca de la
// punta) y las luces del visor parpadean una vez.

import { Lienzo } from '../tools/pixel/lienzo.js';

const ANCHO = 160;
const ALTO = 256;

const FRAMES = 16;
// Filas que bajan al respirar: todo el torso, hasta el cinturón; el faldón y las piernas no se mueven
const ALTO_RESPIRO = 122;
// Mechones sobre el visor, sin tapar sus luces (los de los lados bajan más): [base izquierda, base derecha, codo, punta]
const MECHONES = [
    [[64, 26], [69, 24], [67, 40], [65, 50]],
    [[68, 24], [73, 23], [72, 30], [70, 33]],
    [[73, 23], [78, 22], [77, 31], [75, 35]],
    [[78, 22], [83, 22], [82, 29], [81, 32]],
    [[83, 22], [88, 23], [88, 31], [86, 35]],
    [[88, 23], [93, 24], [92, 30], [91, 33]],
    [[93, 24], [98, 27], [98, 42], [97, 50]]
];

// Cola de la bufanda, detrás del cuerpo. cola: px que se desplaza la punta (la raíz no se mueve)
function colaBufanda(cola) {
    const l = new Lienzo(ANCHO, ALTO);
    const ondea = (x, y) => [x + Math.round(cola * Math.max(0, y - 72) / 60), y];
    const lineaCola = (x0, y0, x1, y1, c) => l.linea(...ondea(x0, y0), ...ondea(x1, y1), c);

    l.poligono([[62, 62], [48, 72], [34, 86], [26, 104], [24, 120], [20, 132], [28, 126], [34, 110], [42, 92], [56, 80], [66, 74]]
        .map(([x, y]) => ondea(x, y)), 'c');
    lineaCola(32, 100, 54, 76, 'b'); lineaCola(33, 101, 55, 77, 'a'); lineaCola(24, 124, 30, 104, 'd');
    lineaCola(38, 88, 46, 80, 'd'); lineaCola(28, 112, 40, 90, 'b');
    // Flecos deshilachados al final de la cola
    lineaCola(20, 132, 19, 136, 'c'); lineaCola(23, 130, 23, 135, 'b'); lineaCola(26, 128, 27, 132, 'c');
    return l.entintar('0', { lados: ['abajo', 'derecha'], irregular: 0.25, semilla: 6 });
}

function cuerpo() {
    const l = new Lienzo(ANCHO, ALTO);

    // Piernas y botas
    l.poligono([[62, 208], [76, 208], [74, 240], [62, 240]], '2');
    l.poligono([[84, 208], [98, 208], [100, 240], [86, 240]], '2');
    l.linea(64, 212, 64, 238, '3').linea(87, 212, 88, 238, '3');
    l.poligono([[58, 238], [76, 238], [78, 248], [54, 248]], '3');
    l.poligono([[84, 238], [102, 238], [110, 248], [84, 248]], '3');
    l.lineaH(56, 238, 20, '5').lineaH(86, 238, 16, '5');

    // Abrigo largo, más ancho hacia el bajo, con el borde desgarrado
    l.poligono([[60, 66], [100, 66], [114, 76], [112, 104], [108, 124], [116, 160], [124, 216], [114, 212], [108, 220], [100, 212], [88, 212],
        [76, 222], [64, 212], [50, 220], [36, 212], [44, 160], [52, 124], [48, 104], [46, 76]], '3');
    // Abertura delantera y faldón interior más oscuro
    l.poligono([[80, 128], [88, 128], [96, 212], [88, 212], [76, 222], [72, 212]], '2');
    l.linea(80, 128, 72, 212, '1').linea(88, 128, 96, 212, '1');
    // Brazos caídos a los lados, con guantes
    l.poligono([[46, 76], [58, 80], [56, 112], [52, 148], [42, 148], [42, 112]], '4');
    l.poligono([[114, 76], [102, 80], [104, 112], [110, 148], [118, 148], [118, 112]], '3');
    // Tinta entre los brazos y el abrigo, que se corta antes de la mano
    l.linea(58, 82, 54, 140, '1').linea(59, 82, 55, 140, '0').linea(102, 82, 108, 140, '1').linea(103, 82, 109, 140, '0');
    l.linea(44, 100, 44, 108, '3').linea(114, 100, 116, 112, '2');
    l.poligono([[40, 148], [52, 148], [51, 162], [46, 167], [42, 162]], '3');
    l.poligono([[108, 148], [120, 148], [119, 162], [115, 167], [110, 162]], '4');
    l.lineaV(45, 158, 7, '0').lineaV(48, 158, 6, '0').lineaV(113, 158, 7, '0').lineaV(116, 158, 6, '0');

    // Cinturón de cable trenzado con hebilla
    l.linea(50, 124, 110, 128, '1').linea(50, 125, 110, 129, '2').linea(50, 126, 110, 130, '1');
    for (let x = 52; x <= 108; x += 5) l.rect(x, 124 + Math.round((x - 50) * 4 / 60), 2, 2, '6');
    l.rect(76, 124, 8, 6, '6').marco(76, 124, 8, 6, '3').rect(78, 126, 3, 2, '9');

    // Cuello alto de placas remachadas
    l.poligono([[54, 60], [66, 54], [70, 74], [56, 80]], '5');
    l.poligono([[106, 60], [94, 54], [90, 74], [104, 80]], '5');
    l.linea(54, 60, 66, 54, '7').linea(94, 54, 106, 60, '6');
    for (const [x, y] of [[60, 66], [100, 66]]) l.rect(x, y, 2, 2, '8').punto(x + 1, y + 1, '3');

    // Capucha y cara en sombra
    l.elipse(80, 36, 24, 28, '4');
    l.poligono([[56, 40], [104, 40], [108, 64], [52, 64]], '4');
    l.elipse(82, 40, 16, 20, '1');
    // Visor bajado con sus dos luces
    l.poligono([[66, 34], [100, 34], [98, 42], [68, 42]], '2');
    l.poligono([[70, 36], [96, 36], [94, 40], [70, 40]], 'e');
    l.lineaH(72, 36, 10, 'f');
    l.rect(74, 38, 6, 2, 'g').rect(76, 38, 2, 2, 'h').rect(88, 38, 6, 2, 'g').rect(90, 38, 2, 2, 'h');
    // Mechones blancos por encima del visor, como en el retrato, con la tinta rota por su lado derecho
    l.poligono([[64, 28], [70, 23], [80, 21], [90, 22], [98, 28], [94, 28], [80, 26], [68, 29]], '7');
    MECHONES.forEach(([a, b, codo, punta], i) => {
        l.poligono([a, b, codo, punta], '8');
        l.linea(a[0] + 1, a[1] + 1, punta[0], punta[1] - 3, '9');
        if (i % 2) l.linea(b[0], b[1] + 3, codo[0], codo[1] - 2, '1');
    });
    l.linea(70, 25, 71, 28, 's').punto(72, 29, 't').linea(92, 26, 94, 30, 's').punto(95, 32, 't');

    // Bufanda envuelta hasta la nariz, con pliegues curvos
    l.poligono([[66, 44], [98, 44], [104, 56], [100, 68], [60, 68], [58, 56]], 'c');
    l.cable(60, 50, 102, 48, 'd', 3).cable(59, 58, 103, 58, 'b', 4).cable(59, 59, 103, 59, 'a', 4).cable(62, 64, 98, 64, 'b', 2);
    for (const [x, y] of [[66, 54], [76, 54], [86, 53], [96, 52]]) l.lineaH(x, y, 4, 'd');

    // --- Detalles ---------------------------------------------------------------
    // Tubo que baja de la nuca por la espalda (asoma por detrás del hombro derecho)
    l.linea(106, 60, 118, 88, '2').linea(107, 60, 119, 88, '2').linea(108, 60, 120, 88, '1');
    for (const [x, y] of [[110, 68], [114, 76], [118, 84]]) l.rect(x, y, 2, 2, '6');
    // Costura de la capucha y ribete de la abertura
    l.linea(80, 10, 84, 22, '3').linea(60, 28, 61, 43, '5').linea(61, 28, 62, 43, '3');
    // Hombreras de placas superpuestas, remachadas
    l.poligono([[40, 84], [58, 80], [58, 92], [40, 98]], '5');
    l.poligono([[42, 72], [60, 66], [62, 80], [42, 86]], '6');
    l.poligono([[120, 84], [102, 80], [102, 92], [120, 98]], '4');
    l.poligono([[118, 72], [100, 66], [98, 80], [118, 86]], '5');
    // Borde inferior de cada placa en tinta y filo superior iluminado
    l.linea(42, 86, 62, 80, '1').linea(40, 98, 58, 92, '1').linea(118, 86, 98, 80, '1').linea(120, 98, 102, 92, '1');
    l.linea(44, 72, 58, 68, '8').linea(42, 84, 56, 80, '7').linea(102, 68, 116, 72, '6');
    for (const [x, y] of [[48, 78], [56, 74], [46, 90], [54, 88], [112, 78], [104, 74], [114, 90], [106, 88]]) l.rect(x, y, 2, 2, '8').punto(x + 1, y + 1, '3');
    // La bufanda baja por el hombro hasta la cola, que sale por detrás
    l.poligono([[58, 66], [68, 70], [52, 86], [43, 80]], 'c');
    l.linea(59, 68, 45, 81, 'd').linea(64, 71, 50, 84, 'b').linea(62, 72, 48, 85, 'b');

    // Cordón de cable que cierra el pecho en zigzag, sobre la costura central
    l.rect(79, 80, 2, 42, '2');
    for (let y = 84; y <= 116; y += 8) {
        l.linea(74, y, 86, y + 4, '2').linea(86, y, 74, y + 4, '2');
        l.rect(79, y + 1, 2, 2, '6');
    }
    // Bolsas colgadas del cinturón, con solapa y broche
    l.poligono([[54, 128], [66, 128], [66, 142], [54, 142]], '2');
    l.poligono([[54, 128], [66, 128], [66, 132], [54, 132]], '4');
    l.rect(59, 133, 2, 2, '6').lineaH(54, 141, 13, '1');
    l.poligono([[94, 130], [104, 130], [104, 140], [94, 140]], '2');
    l.lineaH(94, 130, 11, '4').lineaH(94, 131, 11, '3').punto(99, 133, '6');
    // Parche cosido en el faldón, con puntadas
    l.poligono([[46, 168], [60, 166], [60, 184], [48, 186]], '4');
    for (let y = 168; y <= 184; y += 3) l.punto(46, y, '6').punto(60, y - 2, '6');
    // Chorreones de óxido que suben desde el bajo del abrigo, y desgarros
    for (const [x, y, largo] of [[42, 196, 16], [56, 200, 12], [68, 192, 20], [92, 198, 14], [110, 194, 18]]) {
        l.rect(x, y, 2, largo, 'b').punto(x, y, 'a').punto(x + 1, y, 'a').punto(x + 2, y + largo - 6, 'b');
    }
    l.linea(50, 208, 52, 220, '4').linea(100, 208, 100, 220, '2').linea(76, 212, 76, 222, '4');
    // Guantes con placas en los nudillos y puño
    l.rect(40, 148, 14, 2, '4').rect(108, 148, 14, 2, '3');
    l.rect(42, 156, 10, 2, '5').rect(110, 156, 8, 2, '4');
    for (const x of [44, 48]) l.punto(x, 152, '6');
    // Rodillera en la pierna cercana y botas con correas, puntera y suela
    l.poligono([[62, 212], [74, 212], [74, 222], [62, 222]], '4');
    l.rect(64, 214, 8, 2, '6').punto(64, 219, '3').punto(71, 219, '3');
    l.rect(62, 230, 14, 2, '4').rect(86, 230, 14, 2, '3');
    l.rect(54, 248, 24, 2, '1').rect(84, 248, 26, 2, '1');
    l.rect(54, 242, 6, 6, '5').rect(104, 242, 6, 6, '4');

    // Luz desde arriba a la izquierda; sombra con trazos a la derecha
    l.aclarar((x, y) => l.color(x, y) === '3' && x < 72 - Math.max(0, y - 136) / 18);
    l.aclarar((x, y) => l.color(x, y) === '4' && x + y < 100);
    l.trazos((x, y) => '34'.includes(l.color(x, y)) && x > 94, '2', { separacion: 3, inclinacion: 1, rotura: 0.2, semilla: 3 });
    l.trazos((x, y) => l.color(x, y) === 'c' && x > 88, 'b', { separacion: 3, inclinacion: -1, rotura: 0.2, semilla: 4 });
    // Pliegues verticales del abrigo
    l.linea(60, 140, 54, 208, '3').linea(61, 140, 55, 208, '5').linea(104, 140, 112, 208, '2').linea(72, 136, 68, 208, '3');

    l.entintar('0', { lados: ['abajo', 'derecha'], irregular: 0.25, semilla: 6 });
    return l;
}

// Baja n px las filas de arriba (respiración); las filas que quedan libres arriba son transparentes
function respirar(l, n) {
    for (let y = ALTO_RESPIRO; y >= n; y--) l.px[y] = [...l.px[y - n]];
    for (let y = 0; y < n; y++) l.px[y] = Array(ANCHO).fill('.');
    return l;
}

// Visor apagándose un instante: cada luz baja un tono de su rampa
function parpadear(l) {
    l.patron(66, 32, 36, 14, (x, y) => ({ h: 'g', g: 'f' })[l.color(x + 66, y + 32)] ?? null);
    return l;
}

export default {
    nombre: 'figura-jugador',
    tipo: 'sprite',
    hd: true,
    ancho: ANCHO, alto: ALTO,
    frames: () => Array.from({ length: FRAMES }, (_, i) => {
        const l = cuerpo();
        respirar(l, i === 4 || i === 12 ? 1 : i >= 5 && i <= 11 ? 2 : 0);   // inspira a mitad del ciclo
        if (i === 13) parpadear(l);
        return colaBufanda(Math.round(4 * Math.sin((i / FRAMES) * Math.PI * 2))).pegar(l, 0, 0);
    }),
    animaciones: {
        quieto: { frames: Array.from({ length: FRAMES }, (_, i) => i), fps: 8, repetir: -1 }
    }
};
