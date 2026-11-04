// Retrato de diálogo del protagonista (skill `ilustracion`), busto de 64x64 mirando
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

const LADO = 64;
const PELO = '6789st';

// Mechones que caen sobre el visor y por los lados: [base izquierda, base derecha, codo, punta]
const MECHONES = [
    [[16, 22], [21, 20], [19, 30], [17, 40]],
    [[20, 20], [25, 18], [24, 22], [22, 24]],
    [[24, 18], [30, 17], [29, 21], [27, 23]],
    [[29, 17], [34, 16], [33, 22], [32, 24]],
    [[33, 16], [38, 17], [37, 21], [35, 23]],
    [[37, 17], [43, 18], [43, 22], [42, 24]],
    [[42, 19], [47, 22], [47, 28], [46, 39]]
];

// Luces del visor (los "ojos"), en la fila 28 del cristal
const OJOS = [[24, 28], [36, 28]];
const LUCES = {
    // Raya horizontal tranquila
    raya: (l, x, y) => l.lineaH(x, y, 4, 'g').lineaH(x + 1, y, 2, 'h'),
    // Abierta y redonda, más brillante
    abierta: (l, x, y) => l.rect(x, y - 2, 4, 3, 'g').rect(x + 1, y - 2, 2, 2, 'h'),
    // Apagándose
    tenue: (l, x, y) => l.lineaH(x, y, 4, 'f').punto(x + 1, y, 'g'),
    // Fallo: luz roja de error
    error: (l, x, y) => l.lineaH(x, y, 4, 'i').lineaH(x + 1, y, 2, 'j')
};

function base() {
    const l = new Lienzo(LADO, LADO);

    // Abrigo y hombros
    l.poligono([[1, 63], [5, 54], [13, 48], [22, 46], [42, 46], [51, 48], [59, 54], [63, 63]], '3');
    // Capucha: cabeza y caída sobre los hombros
    l.elipse(32, 25, 20, 22, '4');
    l.poligono([[12, 28], [52, 28], [56, 51], [8, 51]], '4');
    // Interior de la capucha y cara en sombra
    l.elipse(32, 28, 14, 17, '1');
    l.poligono([[20, 18], [44, 18], [45, 28], [43, 35], [38, 40], [34, 42], [30, 41], [25, 37], [21, 30]], '2');
    // Apenas un filo de piel bajo el visor, del lado de la luz
    l.lineaH(23, 31, 7, 'l').lineaH(24, 32, 4, 'l');

    // Cuello alto de placas
    l.poligono([[9, 52], [16, 44], [20, 54], [13, 61]], '5');
    l.poligono([[55, 52], [48, 44], [44, 54], [51, 61]], '5');
    [[14, 50], [15, 55], [49, 50], [48, 55]].forEach(([x, y]) => l.punto(x, y, '7'));

    // Visor bajado: montura y cristal cian, más estrecho del lado lejano
    l.poligono([[19, 25], [46, 25], [45, 30], [20, 31]], '2');
    l.poligono([[21, 26], [44, 26], [43, 29], [22, 29]], 'e');
    l.lineaH(22, 26, 9, 'f').punto(22, 26, 'g');
    l.rect(17, 26, 2, 3, '5').rect(46, 26, 2, 3, '5');

    // Pelo: masa bajo la capucha y mechones sobre el visor
    l.poligono([[17, 23], [20, 19], [25, 17], [32, 16], [39, 17], [44, 19], [47, 23]], '8');
    MECHONES.forEach(([a, b, codo, punta]) => l.poligono([a, b, codo, punta], '8'));
    MECHONES.forEach(([a, b, codo, punta], i) => {
        const medio = [Math.round((a[0] + punta[0]) / 2) + 1, Math.round((a[1] + punta[1]) / 2)];
        if (i % 2) l.linea(a[0] + 1, a[1] + 1, a[0] + 1, a[1] + 3, '9');
        else l.linea(a[0] + 1, a[1] + 1, medio[0], medio[1], '9');
        // Tinta rota por el borde derecho, que acaba en punta
        l.linea(b[0], b[1] + 2, codo[0], codo[1] - 2, '1');
        l.punto(codo[0], codo[1] - 1, '2');
    });
    // Sombra del borde de la capucha sobre el pelo
    for (let x = 16; x <= 47; x++) {
        const y = [...Array(LADO).keys()].find(y => PELO.includes(l.color(x, y)));
        if (y !== undefined) l.punto(x, y, '6');
    }
    l.punto(21, 19, 's').punto(22, 20, 't');
    l.punto(34, 19, 's').punto(35, 20, 's');
    l.punto(44, 20, 's').punto(44, 21, 's').punto(45, 22, 't');

    // Bufanda de óxido subida hasta la nariz, con el borde doblado y la cola a la izquierda
    l.poligono([[19, 33], [45, 32], [48, 38], [49, 46], [45, 53], [19, 53], [15, 46], [17, 38]], 'c');
    l.poligono([[17, 50], [23, 51], [21, 63], [14, 63]], 'c');
    l.linea(19, 34, 44, 33, 'd').linea(19, 35, 44, 34, 'b');
    l.linea(18, 41, 46, 43, 'b').linea(19, 47, 45, 48, 'b').linea(17, 54, 16, 62, 'b');
    l.linea(20, 39, 38, 40, 'd').lineaV(19, 52, 3, 'd');

    // Cordón de cable trenzado sobre el pecho
    l.linea(24, 56, 41, 59, '2');
    for (let x = 25; x <= 40; x += 3) l.punto(x, 56 + Math.round((x - 24) * 3 / 17), '6');
    l.circulo(41, 59, 1, '6');

    // Luz de la capucha (borde superior izquierdo) y sombra con trazos a la derecha
    l.aclarar((x, y) => l.color(x, y) === '4' && x + y < 36);
    l.trazos((x, y) => '34'.includes(l.color(x, y)) && x > 44, '2', { separacion: 3, inclinacion: 1, rotura: 0.2, semilla: 3 });
    l.trazos((x, y) => l.color(x, y) === '3' && x > 36 && y > 55, '2', { separacion: 4, inclinacion: 1, rotura: 0.2, semilla: 4 });
    l.trazos((x, y) => l.color(x, y) === 'c' && x > 38, 'b', { separacion: 3, inclinacion: -1, rotura: 0.2, semilla: 5 });
    // Pliegues de la capucha
    l.linea(14, 30, 11, 46, '3').linea(50, 30, 53, 46, '2');

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
        l.patron(20, 26, 25, 4, (x, y) => (l.color(x + 20, y + 26) === 'e' ? 'f' : null));
        ojos(l, 'abierta');
    },
    // Cristal rajado y una luz en rojo de fallo
    dolor(l) {
        LUCES.error(l, ...OJOS[0]);
        LUCES.tenue(l, ...OJOS[1]);
        l.linea(30, 26, 33, 29, '0').punto(34, 29, '1').punto(29, 26, '1');
    },
    // Luces tenues que miran abajo, a un lado
    perdido(l) {
        ojos(l, 'tenue', -1, 1);
    }
};

export default {
    nombre: 'retrato-jugador',
    tipo: 'sprite',
    ancho: LADO, alto: LADO,
    frames: () => Object.values(EXPRESIONES).map(expresion => {
        const l = base();
        expresion(l);
        return l;
    })
};
