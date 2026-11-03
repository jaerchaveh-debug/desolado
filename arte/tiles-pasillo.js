// Tileset de pasillo industrial de la megaestructura. Tiles de 16x16.
// Índices (usar en mapas de Phaser / Tiled):
//   0 piso metálico     1 muro de relleno    2 viga de celosía    3 panel con luz cian
//   4 rejilla           5 tubería            6 panel oxidado      7 cables colgando (decoración)
// Fondo (capa "fondo", sin colisión; más oscuros para no competir con el plano de juego):
//   8 concreto metálico  9 concreto con placa  10 agujero con cables  11 lámpara cian  12 lámpara roja
//   Las lámparas son la carcasa; GameScene coloca encima el sprite 'luz-fondo' que parpadea (propiedad luz).
// Almacén (sala del jefe):
//   13-16 caja metálica grande 2x2 (sólida): 13 sup. izq. · 14 sup. der. · 15 inf. izq. · 16 inf. der.
//   17 plataforma colgante (soloArriba) con abrazadera de cable · 18 plataforma colgante sin abrazadera
//   19 cable de suspensión (decoración, sin colisión; sube de la abrazadera al techo)
// Fondo del almacén (capa "fondo"):
//   20-23 caja de fondo 2x2 (20 sup. izq. · 21 sup. der. · 22 inf. izq. · 23 inf. der.)
//   24 balda de estantería · 25 poste de estantería · 26 hueco oscuro de estantería · 27 caja pequeña de fondo
// Variantes:
//   28 cables colgando sin conector (decoración; alternar con el 7)

import { Lienzo, ruido } from '../tools/pixel/lienzo.js';

const T = 16;

function piso() {
    const l = new Lienzo(T, T).rect(0, 0, T, T, '3');
    l.lineaH(0, 0, T, '6').lineaH(0, 1, T, '5').lineaH(0, 2, T, '4');
    l.lineaV(7, 3, 13, '2').lineaV(8, 3, 13, '4');           // junta entre placas
    l.lineaH(0, 15, T, '1');
    l.punto(2, 5, '7').punto(13, 5, '7');                      // remaches
    l.punto(2, 6, '1').punto(13, 6, '1');
    return l.patron(0, 3, T, 12, (x, y) => ruido(x, y, 1) > 0.93 ? '2' : null);
}

function muro() {
    const l = new Lienzo(T, T).rect(0, 0, T, T, '2');
    l.lineaH(0, 0, T, '1').lineaV(0, 0, T, '1');               // juntas de panel
    l.lineaH(1, 1, 15, '3').lineaV(1, 1, 15, '3');             // bisel iluminado
    return l.patron(2, 2, 14, 14, (x, y) => ruido(x, y, 2) > 0.9 ? '1' : null);
}

function viga() {
    const l = new Lienzo(T, T).rect(0, 2, T, 12, '1');
    l.lineaH(0, 0, T, '6').lineaH(0, 1, T, '4');               // ala superior
    l.lineaH(0, 14, T, '4').lineaH(0, 15, T, '2');             // ala inferior
    for (let i = 0; i < 12; i++) {                             // celosía en X
        l.punto(i + 2, 2 + i, '3').punto(13 - i, 2 + i, '3');
    }
    l.punto(0, 7, '5').punto(15, 7, '5');
    return l;
}

function panelLuz() {
    const l = muro();
    l.rect(4, 5, 8, 6, '0');                                   // hueco
    l.rect(5, 6, 6, 4, 'e');
    l.lineaH(5, 7, 6, 'f').lineaH(5, 8, 6, 'g');
    l.lineaH(6, 8, 4, 'h');                                    // núcleo de luz
    l.lineaH(4, 11, 8, '3');                                   // reflejo bajo el hueco
    return l;
}

function rejilla() {
    const l = new Lienzo(T, T);
    l.lineaH(0, 0, T, '6').lineaH(0, 1, T, '4');
    for (let x = 1; x < T; x += 3) l.lineaV(x, 2, 3, '2');     // barrotes
    l.lineaH(0, 5, T, '2');
    return l;
}

function tuberia() {
    const l = new Lienzo(T, T);
    const tonos = ['1', '3', '4', '5', '6', '5', '4', '4', '3', '3', '2', '1'];
    tonos.forEach((c, i) => l.lineaH(0, 2 + i, T, c));
    l.rect(10, 1, 3, 14, 'b');                                 // abrazadera
    l.lineaV(10, 1, 14, 'c').lineaV(12, 1, 14, 'a');
    l.punto(11, 1, 'd').punto(11, 14, 'a');
    return l;
}

function panelOxido() {
    const l = muro();
    return l.patron(2, 2, 14, 14, (x, y) => {
        const n = ruido(x, y, 7);
        const chorreo = ruido(x, 0, 8) > 0.6 && y > 4;         // manchas que caen
        if (chorreo && n > 0.35) return n > 0.8 ? 'c' : 'b';
        if (n > 0.95) return 'a';
        return null;
    });
}

// Cables combados colgando del techo. Cuelgan sobre el negro o el concreto del fondo,
// así que van en tonos '2'-'4' (canto superior iluminado, inferior en sombra), por
// debajo del '5'/'6' de los bordes pisables para no confundirse con una plataforma.
// Con conector = false (tile 28) solo quedan los lazos: alternar 7 y 28 en el mapa
// para que la luz del conector no se repita en toda la fila.
function cables(conector = true) {
    const l = new Lienzo(T, T);
    const combado = (x0, x1, caida, luz, sombra) =>
        l.cable(x0, 1, x1, 1, sombra, caida).cable(x0, 0, x1, 0, luz, caida);
    combado(4, 9, 3, '3', '2');                                // lazo corto, detrás
    combado(0, 11, 6, '4', '2');                               // lazo largo, delante
    l.punto(1, 0, '2').punto(12, 0, '2');                      // abrazaderas
    if (!conector) return l;
    l.lineaV(13, 0, 10, '4').lineaV(14, 0, 10, '3');           // cable suelto
    l.rect(12, 10, 4, 2, '4').lineaH(12, 10, 4, '5').lineaH(12, 12, 4, '2');   // conector
    l.punto(13, 11, 'f');                                      // luz del conector
    return l;
}

// ---- Fondo de concreto metálico. Mucho más oscuro que la roca sólida (tonos '0'-'2', detalles en '3')
// para que se lea claramente como fondo y no como pared.

function concreto(semilla = 10) {
    const l = new Lienzo(T, T).rect(0, 0, T, T, '1');
    l.lineaH(0, 0, T, '2').lineaH(0, 1, T, '0');               // canto metálico del panel
    l.lineaV(0, 0, T, '0');
    // grano del concreto
    l.patron(1, 2, 15, 14, (x, y) => {
        const n = ruido(x, y, semilla);
        return n > 0.94 ? '2' : n < 0.1 ? '0' : null;
    });
    l.punto(2, 3, '3').punto(13, 3, '3');                      // pernos
    return l;
}

function concretoPlaca() {
    const l = concreto(11);
    l.rect(3, 5, 10, 8, '0');
    l.marco(3, 5, 10, 8, '2');
    l.lineaH(4, 5, 8, '3');                                    // luz desde arriba en la placa
    l.punto(4, 7, '3').punto(11, 7, '3');
    return l;
}

function agujeroCables() {
    const l = concreto(12);
    // agujero irregular
    l.patron(2, 3, 12, 11, (x, y) => {
        const dx = (x - 5.5) / 6, dy = (y - 5) / 5.5;
        const d = dx * dx + dy * dy + ruido(x, y, 13) * 0.25;
        return d < 0.8 ? '0' : null;
    });
    // cables dentro del agujero
    l.linea(4, 4, 6, 12, '2').linea(7, 4, 8, 12, '3').linea(10, 5, 9, 12, '2');
    l.linea(5, 7, 11, 9, 'a');
    l.punto(8, 8, 'b').punto(9, 10, 'f');                      // cobre y chispa
    return l;
}

function lampara() {
    const l = concreto(14);
    l.rect(4, 4, 8, 8, '0');                                   // carcasa
    l.marco(4, 4, 8, 8, '2');
    l.lineaH(5, 4, 6, '3');
    return l;
}

// ---- Almacén

// Recorta un tile de 16x16 de un lienzo mayor
const trozo = (l, col, fila) => new Lienzo(T, T).pegar(l, -col * T, -fila * T);

// Caja metálica de 32x32 en primer plano: contorno, tapa iluminada, refuerzos en las esquinas,
// costillas verticales, una placa de inventario y óxido en las juntas
function cajaGrande() {
    const N = 2 * T;
    const l = new Lienzo(N, N).rect(0, 0, N, N, '4');
    l.patron(1, 1, N - 2, N - 2, (x, y) => (y > 18 ? '3' : null));          // mitad inferior en sombra
    for (const x of [8, 15, 16, 23]) l.lineaV(x, 3, N - 6, x === 16 || x === 23 ? '2' : '5'); // costillas
    l.marco(0, 0, N, N, '0');
    l.lineaH(1, 1, N - 2, '6').lineaH(1, 2, N - 2, '5');                    // tapa iluminada
    l.lineaH(1, N - 2, N - 2, '2');
    // refuerzos de esquina
    for (const [x, y] of [[1, 1], [N - 6, 1], [1, N - 6], [N - 6, N - 6]]) {
        l.rect(x, y, 5, 5, '5').lineaH(x, y, 5, '7').punto(x + 2, y + 2, '8').punto(x + 2, y + 3, '2');
    }
    l.lineaH(1, 1, N - 2, '6');
    // placa de inventario (rótulo sin texto legible) y marca de peligro en óxido
    l.rect(10, 11, 12, 7, '2').marco(10, 11, 12, 7, '1');
    l.lineaH(12, 13, 6, '6').lineaH(12, 15, 4, '5');
    l.rect(19, 13, 2, 3, 'c');
    // óxido y suciedad bajando de las juntas
    return l.patron(1, 6, N - 2, N - 8, (x, y) => {
        const n = ruido(x, y, 31);
        if (ruido(x, 0, 32) > 0.75 && n > 0.45 && y > 12) return n > 0.85 ? 'c' : 'b';
        return n > 0.97 ? '2' : null;
    });
}

// Plataforma colgante: viga plana con borde superior iluminado y perforaciones
function plataformaColgante(abrazadera) {
    const l = new Lienzo(T, T);
    l.lineaH(0, 0, T, '6').lineaH(0, 1, T, '5');
    l.rect(0, 2, T, 3, '3').lineaH(0, 5, T, '1');
    for (let x = 2; x < T; x += 4) l.punto(x, 3, '0');                    // perforaciones
    if (abrazadera) {
        l.rect(6, 0, 4, 3, '7').lineaH(6, 0, 4, '8').punto(7, 1, '2').punto(8, 1, '2');
        l.rect(5, 5, 6, 1, '2');                                          // pletina inferior
    }
    return l;
}

// Cable de acero trenzado, de arriba abajo, centrado sobre la abrazadera
function cableSuspension() {
    const l = new Lienzo(T, T);
    for (let y = 0; y < T; y++) {
        l.punto(7, y, y % 4 < 2 ? '5' : '3');
        l.punto(8, y, y % 4 < 2 ? '2' : '4');
    }
    return l;
}

// Caja de fondo de 32x32: misma forma que la grande pero plana, oscura y sin contorno
function cajaFondo() {
    const N = 2 * T;
    const l = new Lienzo(N, N).rect(0, 0, N, N, '2');
    l.lineaH(0, 0, N, '3').lineaH(0, N - 1, N, '1').lineaV(0, 0, N, '1').lineaV(N - 1, 0, N, '1');
    for (const x of [8, 23]) l.lineaV(x, 2, N - 4, '1');
    for (const [x, y] of [[1, 1], [N - 5, 1], [1, N - 5], [N - 5, N - 5]]) l.rect(x, y, 4, 4, '3');
    l.rect(11, 12, 10, 6, '1').lineaH(12, 14, 5, '3');
    return l.patron(1, 1, N - 2, N - 2, (x, y) => (ruido(x, y, 41) > 0.96 ? '1' : null));
}

// Estantería del fondo: balda horizontal (viga en el borde superior), poste y hueco oscuro entre baldas
function balda() {
    const l = new Lienzo(T, T).rect(0, 0, T, T, '0');
    // viga arriba: las cajas del fondo se apoyan sobre ella desde la fila de encima
    l.lineaH(0, 0, T, '3').rect(0, 1, T, 3, '2').lineaH(0, 4, T, '1');
    for (let x = 1; x < T; x += 5) l.punto(x, 2, '1');
    return l;
}

function poste() {
    const l = new Lienzo(T, T).rect(0, 0, T, T, '0');
    l.rect(5, 0, 6, T, '2').lineaV(5, 0, T, '3').lineaV(10, 0, T, '1');
    for (let y = 2; y < T; y += 5) l.punto(7, y, '0').punto(8, y, '0');   // agujeros del poste
    return l;
}

function huecoEstanteria() {
    const l = new Lienzo(T, T).rect(0, 0, T, T, '0');
    return l.patron(0, 0, T, T, (x, y) => (ruido(x, y, 43) > 0.95 ? '1' : null));
}

function cajaPequenaFondo() {
    const l = huecoEstanteria();
    l.rect(2, 4, 12, 12, '2').lineaH(2, 4, 12, '3').lineaV(13, 5, 11, '1');
    l.rect(5, 8, 6, 3, '1');
    return l;
}

export default {
    nombre: 'tiles-pasillo',
    tipo: 'tileset',
    ancho: T,
    alto: T,
    frames: () => [
        piso(), muro(), viga(), panelLuz(), rejilla(), tuberia(), panelOxido(), cables(),
        concreto(), concretoPlaca(), agujeroCables(), lampara(), lampara(),
        ...[[0, 0], [1, 0], [0, 1], [1, 1]].map(([c, f]) => trozo(cajaGrande(), c, f)),
        plataformaColgante(true), plataformaColgante(false), cableSuspension(),
        ...[[0, 0], [1, 0], [0, 1], [1, 1]].map(([c, f]) => trozo(cajaFondo(), c, f)),
        balda(), poste(), huecoEstanteria(), cajaPequenaFondo(),
        cables(false)
    ],
    // Propiedades por índice de tile. GameScene las aplica al cargar cualquier nivel:
    //   solido: colisiona por todos los lados; soloArriba: plataforma atravesable desde abajo
    propiedades: {
        0: { solido: true },
        1: { solido: true },
        2: { solido: true },
        3: { solido: true },
        4: { soloArriba: true },
        6: { solido: true },
        // luz: color del sprite 'luz-fondo' que GameScene coloca sobre la lámpara
        11: { luz: 'cian' },
        12: { luz: 'roja' },
        13: { solido: true },
        14: { solido: true },
        15: { solido: true },
        16: { solido: true },
        17: { soloArriba: true },
        18: { soloArriba: true }
    }
};
