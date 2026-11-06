// Retrato de diálogo del protagonista (skill `ilustracion`), busto de 128x128 mirando
// un poco a la derecha, como el sprite `jugador`.
//
// El errante: hombre joven, callado y estoico. Está perdido en la megaestructura y
// no sabe qué busca: camina porque detenerse sería peor. Su emoción de fondo es el
// desconcierto, más que el miedo o la ira.
//
// Su rostro siempre está oculto: visor cian bajado sobre los ojos, bufanda de óxido
// subida hasta la nariz y la cara en la sombra de la capucha. Solo asoman mechones
// de pelo blanco grisáceo (grises 6-9, reflejos lavanda `s`/`t`). Capucha y abrigo
// de tela sintética gris azulada, cuello alto de placas remachadas y un cable
// trenzado como cordón (tecno-gótico). Las emociones se leen en las luces del
// visor, que hacen de ojos.
//
// Frames (expresiones): 0 neutro, 1 sorpresa, 2 dolor, 3 perdido.

import { Lienzo } from '../tools/pixel/lienzo.js';

const LADO = 128;

// Mechones que caen sobre el visor y por los lados: [base izquierda, base derecha, codo, punta]
const MECHONES = [
    [[32, 44], [42, 40], [38, 60], [34, 80]],
    [[40, 40], [50, 36], [48, 48], [44, 54]],
    [[48, 36], [60, 34], [58, 42], [54, 46]],
    [[58, 34], [68, 32], [66, 50], [63, 58]],
    [[66, 32], [76, 34], [74, 42], [70, 46]],
    [[74, 34], [86, 36], [85, 48], [82, 52]],
    [[84, 38], [94, 44], [94, 56], [92, 78]]
];

// Luces del visor (los "ojos"), en la fila 56 del cristal
const OJOS = [[48, 56], [72, 56]];
const LUCES = {
    // Raya horizontal tranquila
    raya: (l, x, y) => l.rect(x, y, 8, 2, 'g').rect(x + 2, y, 4, 2, 'h'),
    // Abierta y redonda, más brillante
    abierta: (l, x, y) => l.rect(x, y - 4, 8, 6, 'g').rect(x + 1, y - 5, 6, 1, 'g').rect(x + 2, y - 4, 4, 4, 'h'),
    // Apagándose
    tenue: (l, x, y) => l.rect(x, y, 8, 2, 'f').rect(x + 2, y, 2, 2, 'g'),
    // Fallo: luz roja de error
    error: (l, x, y) => l.rect(x, y, 8, 2, 'i').rect(x + 2, y, 4, 2, 'j')
};

function base() {
    const l = new Lienzo(LADO, LADO);

    // Abrigo y hombros
    l.poligono([[2, 127], [10, 108], [26, 96], [44, 92], [84, 92], [102, 96], [118, 108], [126, 127]], '3');
    // Capucha: cabeza y caída sobre los hombros
    l.elipse(64, 50, 40, 44, '4');
    l.poligono([[24, 56], [104, 56], [112, 102], [16, 102]], '4');
    // Interior de la capucha y cara en sombra
    l.elipse(64, 56, 28, 34, '1');
    l.poligono([[40, 36], [88, 36], [90, 56], [86, 70], [76, 80], [68, 84], [60, 82], [50, 74], [42, 60]], '2');
    // Apenas un filo de piel bajo el visor, del lado de la luz
    l.rect(47, 63, 10, 1, 'l');

    // Cuello alto de placas remachadas
    l.poligono([[18, 104], [32, 88], [40, 108], [26, 122]], '5');
    l.poligono([[110, 104], [96, 88], [88, 108], [102, 122]], '5');
    l.linea(18, 104, 32, 88, '7').linea(96, 88, 110, 104, '6').linea(24, 112, 38, 104, '3').linea(104, 112, 90, 104, '3');
    for (const [x, y] of [[28, 100], [30, 110], [98, 100], [96, 110]]) l.rect(x, y, 2, 2, '8').punto(x + 1, y + 1, '3');

    // Visor bajado: montura y cristal cian, más estrecho del lado lejano
    l.poligono([[38, 50], [92, 50], [90, 60], [40, 62]], '2');
    l.poligono([[42, 52], [88, 52], [86, 58], [44, 58]], 'e');
    l.lineaH(44, 52, 18, 'f').lineaH(44, 53, 12, 'f').rect(44, 52, 2, 1, 'g');
    l.linea(52, 58, 56, 52, 'f').linea(54, 58, 58, 52, 'f');   // reflejo del cristal
    l.rect(34, 52, 4, 6, '5').rect(92, 52, 4, 6, '5').lineaV(34, 52, 6, '7').rect(35, 54, 2, 2, '2');

    // Pelo: masa bajo la capucha y mechones sobre el visor
    l.poligono([[34, 46], [40, 38], [50, 34], [64, 32], [78, 34], [88, 38], [94, 46]], '8');
    MECHONES.forEach(([a, b, codo, punta]) => l.poligono([a, b, codo, punta], '8'));
    MECHONES.forEach(([a, b, codo, punta], i) => {
        const medio = [Math.round((a[0] + punta[0]) / 2) + 2, Math.round((a[1] + punta[1]) / 2)];
        // Brillos a lo largo del mechón y hebras finas
        l.linea(a[0] + 2, a[1] + 2, medio[0], medio[1], '9');
        l.linea(a[0] + 4, a[1] + 1, medio[0] + 1, medio[1] - 2, i % 2 ? '7' : '9');
        // Tinta rota por el borde derecho, que acaba en punta
        l.linea(b[0], b[1] + 4, codo[0], codo[1] - 4, '1');
        l.linea(codo[0], codo[1] - 3, codo[0] - 1, codo[1] - 1, '2');
        l.linea(a[0] + 5, a[1] + 3, medio[0] - 1, medio[1] + 1, '6');
    });
    // Sombra del borde de la capucha sobre el pelo
    for (let x = 32; x <= 94; x++) {
        const y = [...Array(LADO).keys()].find(y => '6789st'.includes(l.color(x, y)));
        if (y !== undefined) l.punto(x, y, '6').punto(x, y + 1, '7');
    }
    l.linea(42, 38, 44, 40, 's').punto(45, 41, 't');
    l.linea(68, 38, 70, 40, 's').linea(88, 40, 88, 42, 's').punto(90, 44, 't');

    // Bufanda de óxido subida hasta la nariz, con el borde doblado y la cola a la izquierda
    l.poligono([[38, 66], [90, 64], [96, 76], [98, 92], [90, 106], [38, 106], [30, 92], [34, 76]], 'c');
    l.poligono([[34, 100], [46, 102], [42, 127], [28, 127]], 'c');
    l.linea(38, 67, 88, 65, 'd').linea(38, 68, 88, 66, 'd').linea(38, 70, 88, 68, 'b').linea(38, 71, 88, 69, 'a');
    // Pliegues curvos que convergen hacia el cuello
    l.cable(34, 78, 94, 82, 'b', 9).cable(34, 79, 94, 83, 'a', 9).cable(34, 90, 94, 86, 'b', 12).cable(34, 91, 94, 87, 'a', 12);
    l.cable(38, 100, 90, 92, 'b', 8).cable(40, 74, 80, 76, 'd', 6).cable(42, 86, 76, 86, 'd', 7);
    l.linea(34, 108, 32, 124, 'b').lineaV(38, 104, 6, 'd');
    // Tinta donde la bufanda monta sobre la capucha
    l.linea(34, 78, 30, 92, '0').linea(30, 92, 38, 106, '0').linea(96, 76, 98, 92, '0').linea(98, 92, 90, 106, '0');
    // Costuras del tejido
    for (let x = 42; x < 88; x += 4) l.punto(x, 74 + (Math.floor(x / 4) % 2), 'b').punto(x + 2, 101, 'b');

    // Cordón de cable trenzado sobre el pecho
    l.linea(48, 112, 82, 118, '1').linea(48, 113, 82, 119, '2');
    for (let x = 50; x <= 80; x += 4) l.rect(x, 112 + Math.round((x - 48) * 6 / 34), 2, 2, '6');
    l.circulo(82, 118, 3, '2').circulo(82, 118, 2, '6').punto(81, 117, '8');

    // Luz de la capucha (borde superior izquierdo) y sombra con trazos a la derecha
    l.aclarar((x, y) => l.color(x, y) === '4' && x + y < 72);
    l.aclarar((x, y) => l.color(x, y) === '5' && x + y < 52 && y < 36);
    l.trazos((x, y) => '34'.includes(l.color(x, y)) && x > 88, '2', { separacion: 3, inclinacion: 1, rotura: 0.2, semilla: 3 });
    l.trazos((x, y) => l.color(x, y) === '3' && x > 72 && y > 110, '2', { separacion: 4, inclinacion: 1, rotura: 0.2, semilla: 4 });
    l.trazos((x, y) => l.color(x, y) === 'c' && x > 76, 'b', { separacion: 3, inclinacion: -1, rotura: 0.2, semilla: 5 });
    // Pliegues de la capucha
    l.linea(28, 60, 22, 92, '3').linea(29, 60, 23, 92, '5').linea(100, 60, 106, 92, '2').linea(36, 26, 30, 44, '5');

    l.entintar('0', { lados: ['abajo', 'derecha'], irregular: 0.25, semilla: 7 });
    return l;
}

const ojos = (l, forma, dx = 0, dy = 0) => OJOS.forEach(([x, y]) => LUCES[forma](l, x + dx, y + dy));

// El orden define el frame de cada expresión (ver PERSONAJES en src/config/personajes.js)
const EXPRESIONES = {
    neutro(l) {
        ojos(l, 'raya');
    },
    // Las luces se abren y el cristal entero se enciende
    sorpresa(l) {
        l.patron(40, 52, 50, 7, (x, y) => (l.color(x + 40, y + 52) === 'e' ? 'f' : null));
        ojos(l, 'abierta');
    },
    // Cristal rajado y una luz en rojo de fallo
    dolor(l) {
        LUCES.error(l, ...OJOS[0]);
        LUCES.tenue(l, ...OJOS[1]);
        l.linea(60, 52, 66, 58, '0').linea(63, 55, 68, 53, '0').punto(68, 58, '1').punto(59, 52, '1');
    },
    // Luces tenues que miran abajo, a un lado
    perdido(l) {
        LUCES.tenue(l, OJOS[0][0] - 2, OJOS[0][1] + 1);
        l.rect(OJOS[1][0] - 2, OJOS[1][1] + 1, 3, 1, 'f');
    }
};

export default {
    nombre: 'retrato-jugador',
    tipo: 'sprite',
    hd: true,
    ancho: LADO, alto: LADO,
    frames: () => Object.values(EXPRESIONES).map(expresion => {
        const l = base();
        expresion(l);
        return l;
    })
};
