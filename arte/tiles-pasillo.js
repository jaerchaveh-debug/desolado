// Tileset de pasillo industrial de la megaestructura. Tiles de 32x32.
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
// Ventanales (capa "fondo"; transparentes salvo el marco: detrás se ve el fondo parallax):
//   29 marco sup. · 30 marco inf. · 31 marco izq. · 32 marco der.
//   33 esquina sup. izq. · 34 esquina sup. der. · 35 esquina inf. izq. · 36 esquina inf. der.
//   37 parteluz vertical · 38 parteluz con marco sup. · 39 parteluz con marco inf.
//   El interior del ventanal es un hueco sin tile (0 en el mapa).
// Variantes para romper la repetición (sólidas, se reparten por el mapa entre las del tile base):
//   40 muro con tornillo y junta · 41 muro con rejilla de aire · 42 muro con grieta · 43 piso liso

import { Lienzo, ruido } from '../tools/pixel/lienzo.js';

const T = 32;

// Tornillo de cabeza redonda con brillo arriba a la izquierda
function tornillo(l, x, y, luz = '6', sombra = '1') {
    return l.rect(x, y, 3, 3, '4').punto(x, y, luz).punto(x + 1, y, luz).punto(x + 2, y + 2, sombra).punto(x + 1, y + 1, '2');
}

// Desgaste fino: motas y arañazos cortos, deterministas
function desgaste(l, x, y, w, h, semilla, oscuro, claro, densidad = 0.05) {
    l.patron(x, y, w, h, (i, j) => {
        const n = ruido(i, j, semilla);
        return n > 1 - densidad ? oscuro : n < densidad / 3 ? claro : null;
    });
    for (let k = 0; k < 3; k++) {
        const ax = x + Math.floor(ruido(k, 1, semilla) * (w - 8)), ay = y + Math.floor(ruido(k, 2, semilla) * (h - 4));
        l.linea(ax, ay, ax + 3 + Math.floor(ruido(k, 3, semilla) * 5), ay + 1, claro);
    }
    return l;
}

// liso: variante sin tornillos ni ranuras (tile 43) para que el suelo no repita el mismo motivo
function piso(liso = false) {
    const l = new Lienzo(T, T).rect(0, 0, T, T, '3');
    l.lineaH(0, 0, T, '7').lineaH(0, 1, T, '6').lineaH(0, 2, T, '5').lineaH(0, 3, T, '5').lineaH(0, 4, T, '4').lineaH(0, 5, T, '2');
    l.lineaV(15, 6, 25, '1').lineaV(16, 6, 25, '4');          // junta entre placas
    desgaste(l, 1, 7, 13, 23, 1, '2', '4');
    desgaste(l, 18, 7, 13, 23, 2, '2', '4');
    if (!liso) {
        tornillo(l, 4, 9).lineaH(4, 12, 3, '2');
        tornillo(l, 25, 9).lineaH(25, 12, 3, '2');
        l.rect(6, 20, 5, 1, '1').rect(6, 22, 5, 1, '1').rect(21, 20, 5, 1, '1').rect(21, 22, 5, 1, '1');   // ranuras
    }
    return l.lineaH(0, 30, T, '2').lineaH(0, 31, T, '1');
}

// Roca metálica: juntas tenues para que las grandes masas no se lean como azulejos.
// Las variantes (tiles 40-42) rompen la repetición: GameScene no las distingue del muro.
function muro(variante = 0) {
    const l = new Lienzo(T, T).rect(0, 0, T, T, '2');
    l.lineaH(0, 0, T, '1').lineaV(0, 0, T, '1');               // juntas de panel
    desgaste(l, 1, 1, 30, 30, 3 + variante * 5, '1', '3', 0.07);
    if (variante === 1) tornillo(l, 5, 5, '4').lineaH(14, 22, 12, '1').lineaH(14, 23, 12, '3');
    if (variante === 2) l.rect(8, 10, 16, 1, '1').rect(8, 14, 16, 1, '1').rect(8, 18, 16, 1, '1');   // rejilla de aire
    if (variante === 3) l.linea(6, 4, 12, 16, '1').linea(12, 16, 9, 27, '1').linea(7, 4, 13, 16, '3');   // grieta
    return l;
}

function viga() {
    const l = new Lienzo(T, T).rect(0, 4, T, 24, '1');
    l.lineaH(0, 0, T, '7').lineaH(0, 1, T, '6').lineaH(0, 2, T, '4').lineaH(0, 3, T, '3');     // ala superior
    l.lineaH(0, 28, T, '4').lineaH(0, 29, T, '3').lineaH(0, 30, T, '2').lineaH(0, 31, T, '1'); // ala inferior
    for (let i = 0; i < 24; i++) {                             // celosía en X con cara iluminada
        l.rect(i + 4, 4 + i, 2, 1, '3').rect(26 - i, 4 + i, 2, 1, '3');
        l.punto(i + 4, 5 + i, '2').punto(27 - i, 5 + i, '2');
    }
    l.rect(13, 13, 6, 6, '2').marco(13, 13, 6, 6, '3').punto(15, 15, '5');   // cartela central
    tornillo(l, 0, 14).punto(1, 14, '5');
    return tornillo(l, 29, 14);
}

function panelLuz() {
    const l = muro();
    l.rect(7, 9, 18, 13, '0').marco(7, 9, 18, 13, '1');        // hueco
    l.rect(9, 11, 14, 9, 'e');
    l.rect(9, 13, 14, 2, 'f').rect(9, 15, 14, 2, 'g').rect(11, 15, 10, 1, 'h').rect(12, 16, 8, 1, 'h');
    for (let x = 11; x < 23; x += 3) l.lineaV(x, 11, 9, 'e');  // rejilla sobre la luz
    return l.lineaH(7, 22, 18, '3').lineaH(9, 23, 14, '2');
}

function rejilla() {
    const l = new Lienzo(T, T);
    l.lineaH(0, 0, T, '7').lineaH(0, 1, T, '6').lineaH(0, 2, T, '4').lineaH(0, 3, T, '3');
    for (let x = 2; x < T; x += 6) l.rect(x, 4, 2, 6, '2').lineaV(x, 4, 6, '3');   // barrotes
    return l.lineaH(0, 10, T, '3').lineaH(0, 11, T, '1');
}

function tuberia() {
    const l = new Lienzo(T, T);
    const tonos = ['1', '2', '2', '3', '3', '4', '4', '5', '5', '5', '4', '4', '4', '3', '3', '3', '3', '2', '2', '2', '2', '1', '1', '1'];
    tonos.forEach((c, i) => l.lineaH(0, 4 + i, T, c));
    l.patron(0, 4, T, 24, (x, y) => (ruido(x, y, 5) > 0.97 ? '2' : null));
    l.rect(20, 2, 6, 28, 'b').lineaV(20, 2, 28, 'c').lineaV(21, 2, 28, 'd').lineaV(25, 2, 28, 'a');   // abrazadera
    l.rect(22, 1, 2, 2, '5').rect(22, 29, 2, 2, '2');
    return l.lineaV(19, 3, 26, '1').lineaV(26, 3, 26, '1');
}

function panelOxido() {
    const l = muro();
    return l.patron(3, 3, 27, 27, (x, y) => {
        const n = ruido(x, y, 7);
        const chorreo = ruido(x >> 1, 0, 8) > 0.6 && y > 6 + ruido(x >> 1, 1, 8) * 8;   // manchas que caen
        if (chorreo && n > 0.3) return n > 0.82 ? 'c' : n > 0.55 ? 'b' : 'a';
        return n > 0.97 ? 'a' : null;
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
        l.cable(x0, 2, x1, 2, sombra, caida).cable(x0, 1, x1, 1, '3', caida).cable(x0, 0, x1, 0, luz, caida);
    combado(8, 18, 6, '3', '2');                               // lazo corto, detrás
    combado(0, 22, 12, '4', '2');                              // lazo largo, delante
    l.rect(1, 0, 3, 2, '2').rect(23, 0, 3, 2, '2');            // abrazaderas
    if (!conector) return l;
    l.rect(26, 0, 2, 20, '4').lineaV(28, 0, 20, '3');          // cable suelto
    l.rect(24, 20, 8, 4, '4').lineaH(24, 20, 8, '5').lineaH(24, 24, 8, '2');   // conector
    return l.rect(27, 22, 2, 1, 'f');                          // luz del conector
}

// ---- Fondo de concreto metálico. Mucho más oscuro que la roca sólida (tonos '0'-'2', detalles en '3')
// para que se lea claramente como fondo y no como pared.

function concreto(semilla = 10) {
    const l = new Lienzo(T, T).rect(0, 0, T, T, '1');
    l.lineaH(0, 0, T, '1').lineaH(0, 1, T, '1').lineaH(0, 2, T, '0');      // canto metálico del panel
    l.lineaV(0, 0, T, '0').lineaV(1, 3, T - 3, '0');
    // grano del concreto
    l.patron(2, 3, 30, 29, (x, y) => {
        const n = ruido(x, y, semilla);
        return n > 0.95 ? '2' : n < 0.09 ? '0' : null;
    });
    l.rect(4, 6, 2, 2, '2').rect(26, 6, 2, 2, '2');            // pernos
    return l;
}

function concretoPlaca() {
    const l = concreto(11);
    l.rect(6, 10, 20, 16, '0').marco(6, 10, 20, 16, '2');
    l.lineaH(7, 10, 18, '3');                                  // luz desde arriba en la placa
    for (let y = 14; y < 24; y += 3) l.lineaH(10, y, 12, '1'); // lamas
    return l.punto(8, 13, '3').punto(23, 13, '3');
}

function agujeroCables() {
    const l = concreto(12);
    // agujero irregular
    l.patron(4, 6, 24, 22, (x, y) => {
        const dx = (x - 11) / 12, dy = (y - 10) / 11;
        const d = dx * dx + dy * dy + ruido(x, y, 13) * 0.2;
        return d < 0.8 ? '0' : null;
    });
    // cables dentro del agujero
    l.linea(8, 8, 12, 24, '2').linea(9, 8, 13, 24, '1').linea(14, 8, 16, 24, '3').linea(20, 10, 18, 24, '2');
    l.linea(10, 14, 22, 18, 'a').linea(10, 15, 22, 19, 'b');
    return l.punto(16, 16, 'c').rect(18, 20, 2, 1, 'f');       // cobre y chispa
}

function lampara() {
    const l = concreto(14);
    l.rect(8, 8, 16, 16, '0').marco(8, 8, 16, 16, '2');        // carcasa
    return l.lineaH(10, 8, 12, '3').lineaH(9, 9, 14, '1').punto(10, 22, '1').punto(21, 22, '1');
}

// ---- Almacén

// Recorta un tile de 32x32 de un lienzo mayor
const trozo = (l, col, fila) => new Lienzo(T, T).pegar(l, -col * T, -fila * T);

// Caja metálica de 64x64 en primer plano: contorno, tapa iluminada, refuerzos en las esquinas,
// costillas verticales, una placa de inventario y óxido en las juntas
function cajaGrande() {
    const N = 2 * T;
    const l = new Lienzo(N, N).rect(0, 0, N, N, '4');
    l.patron(2, 2, N - 4, N - 4, (x, y) => (y > 36 ? '3' : null));          // mitad inferior en sombra
    l.tramado(2, 32, N - 4, 8, '3', 0.5);
    for (const x of [16, 30, 33, 47]) {                                     // costillas
        l.rect(x, 6, 2, N - 12, x < 32 ? '5' : '2').lineaV(x + 2, 6, N - 12, x < 32 ? '3' : '1');
    }
    l.marco(0, 0, N, N, '0').marco(1, 1, N - 2, N - 2, '1');
    l.lineaH(2, 2, N - 4, '7').lineaH(2, 3, N - 4, '6').lineaH(2, 4, N - 4, '5');   // tapa iluminada
    l.lineaH(2, N - 3, N - 4, '2');
    // refuerzos de esquina
    for (const [x, y] of [[2, 2], [N - 12, 2], [2, N - 12], [N - 12, N - 12]]) {
        l.rect(x, y, 10, 10, '5').lineaH(x, y, 10, '7').lineaV(x, y, 10, '6').lineaH(x, y + 9, 10, '3').lineaV(x + 9, y, 10, '3');
        l.rect(x + 3, y + 3, 4, 4, '8').rect(x + 4, y + 4, 3, 3, '4').punto(x + 5, y + 5, '2');
    }
    // placa de inventario (rótulo sin texto legible) y marca de peligro en óxido
    l.rect(20, 22, 24, 14, '2').marco(20, 22, 24, 14, '1').lineaH(21, 23, 22, '3');
    l.rect(24, 26, 12, 1, '6').rect(24, 28, 9, 1, '5').rect(24, 30, 11, 1, '5');
    l.rect(38, 26, 3, 6, 'c').lineaV(38, 26, 6, 'd');
    // óxido y suciedad bajando de las juntas
    return l.patron(2, 12, N - 4, N - 16, (x, y) => {
        const n = ruido(x, y, 31);
        if (ruido(x >> 1, 0, 32) > 0.78 && n > 0.45 && y > 20) return n > 0.85 ? 'c' : 'b';
        return n > 0.985 ? '2' : null;
    });
}

// Plataforma colgante: viga plana con borde superior iluminado y perforaciones
function plataformaColgante(abrazadera) {
    const l = new Lienzo(T, T);
    l.lineaH(0, 0, T, '7').lineaH(0, 1, T, '6').lineaH(0, 2, T, '5').lineaH(0, 3, T, '4');
    l.rect(0, 4, T, 6, '3').lineaH(0, 10, T, '2').lineaH(0, 11, T, '1');
    for (let x = 4; x < T; x += 8) l.rect(x, 6, 3, 2, '0').lineaH(x, 8, 3, '4');    // perforaciones
    if (abrazadera) {
        l.rect(12, 0, 8, 6, '7').lineaH(12, 0, 8, '8').rect(14, 2, 4, 2, '2');
        l.rect(10, 10, 12, 2, '2').lineaH(10, 10, 12, '4');                          // pletina inferior
    }
    return l;
}

// Cable de acero trenzado, de arriba abajo, centrado sobre la abrazadera
function cableSuspension() {
    const l = new Lienzo(T, T);
    for (let y = 0; y < T; y++) {
        const tramo = y % 6 < 3;
        l.punto(14, y, tramo ? '5' : '3').punto(15, y, tramo ? '6' : '3');
        l.punto(16, y, tramo ? '2' : '4').punto(17, y, tramo ? '2' : '4');
    }
    return l;
}

// Caja de fondo de 64x64: misma forma que la grande pero plana, oscura y sin contorno
function cajaFondo() {
    const N = 2 * T;
    const l = new Lienzo(N, N).rect(0, 0, N, N, '1');
    l.lineaH(0, 0, N, '2').lineaH(0, 1, N, '2').lineaH(0, N - 1, N, '0').lineaV(0, 0, N, '0').lineaV(N - 1, 0, N, '0');
    for (const x of [16, 46]) l.rect(x, 4, 2, N - 8, '0');
    for (const [x, y] of [[2, 2], [N - 10, 2], [2, N - 10], [N - 10, N - 10]]) l.rect(x, y, 8, 8, '2').punto(x + 3, y + 3, '0');
    l.rect(22, 24, 20, 12, '0').lineaH(24, 28, 10, '2').lineaH(24, 31, 7, '2');
    return l.patron(2, 2, N - 4, N - 4, (x, y) => (ruido(x, y, 41) > 0.97 ? '0' : null));
}

// Estantería del fondo: balda horizontal (viga en el borde superior), poste y hueco oscuro entre baldas
function balda() {
    const l = new Lienzo(T, T).rect(0, 0, T, T, '0');
    // viga arriba: las cajas del fondo se apoyan sobre ella desde la fila de encima
    l.lineaH(0, 0, T, '2').lineaH(0, 1, T, '2').rect(0, 2, T, 6, '2').lineaH(0, 8, T, '1').lineaH(0, 9, T, '1');
    for (let x = 2; x < T; x += 10) l.rect(x, 4, 2, 2, '1');
    return l;
}

function poste() {
    const l = new Lienzo(T, T).rect(0, 0, T, T, '0');
    l.rect(10, 0, 12, T, '2').rect(10, 0, 2, T, '3').rect(20, 0, 2, T, '1');
    for (let y = 4; y < T; y += 10) l.rect(15, y, 2, 3, '0');  // agujeros del poste
    return l;
}

function huecoEstanteria() {
    const l = new Lienzo(T, T).rect(0, 0, T, T, '0');
    return l.patron(0, 0, T, T, (x, y) => (ruido(x, y, 43) > 0.96 ? '1' : null));
}

function cajaPequenaFondo() {
    const l = huecoEstanteria();
    l.rect(4, 8, 24, 24, '2').lineaH(4, 8, 24, '3').lineaH(4, 9, 24, '3').rect(26, 10, 2, 22, '1');
    return l.rect(10, 16, 12, 6, '1').lineaH(12, 18, 7, '3');
}

// ---- Ventanales del pozo (capa "fondo"): huecos en el concreto por los que se ve el parallax.
// El tile es transparente salvo el marco del lado que toca el concreto y, si lo lleva, el parteluz
// vertical del centro. Marco de 8 px en tonos de fondo (más oscuro que la roca, que es '2'/'3'):
// junta '0' contra el concreto, perfil '1' con los bordes interiores en '2' y el alféizar con el canto
// superior en '2' (luz desde arriba), sin línea clara que se lea como repisa pisable.
const MARCO = 8;

function ventana({ sup = false, inf = false, izq = false, der = false, parteluz = false } = {}) {
    const l = new Lienzo(T, T);
    if (parteluz) l.rect(12, 0, 8, T, '1').rect(12, 0, 2, T, '2').rect(18, 0, 2, T, '2');
    if (izq) l.rect(0, 0, MARCO, T, '1').rect(MARCO - 2, 0, 2, T, '2');
    if (der) l.rect(T - MARCO, 0, MARCO, T, '1').rect(T - MARCO, 0, 2, T, '2');
    if (sup) l.rect(0, 0, T, MARCO, '1').rect(0, MARCO - 2, T, 2, '2');
    if (inf) {
        l.rect(0, T - MARCO, T, MARCO, '1').rect(0, T - MARCO, T, 2, '2');
        for (let x = 4; x < T; x += 12) l.rect(x, T - 4, 2, 2, '0');       // tornillería del alféizar
    }
    // Juntas contra el concreto al final, para que el alféizar no las tape en las esquinas
    if (izq) l.rect(0, 0, 2, T, '0');
    if (der) l.rect(T - 2, 0, 2, T, '0');
    if (sup) l.rect(0, 0, T, 2, '0');
    if (inf) l.rect(0, T - 2, T, 2, '0');
    return l;
}

export default {
    nombre: 'tiles-pasillo',
    tipo: 'tileset',
    hd: true,
    ancho: T,
    alto: T,
    frames: () => [
        piso(), muro(), viga(), panelLuz(), rejilla(), tuberia(), panelOxido(), cables(),
        concreto(), concretoPlaca(), agujeroCables(), lampara(), lampara(),
        ...[[0, 0], [1, 0], [0, 1], [1, 1]].map(([c, f]) => trozo(cajaGrande(), c, f)),
        plataformaColgante(true), plataformaColgante(false), cableSuspension(),
        ...[[0, 0], [1, 0], [0, 1], [1, 1]].map(([c, f]) => trozo(cajaFondo(), c, f)),
        balda(), poste(), huecoEstanteria(), cajaPequenaFondo(),
        cables(false),
        ventana({ sup: true }), ventana({ inf: true }), ventana({ izq: true }), ventana({ der: true }),
        ventana({ sup: true, izq: true }), ventana({ sup: true, der: true }),
        ventana({ inf: true, izq: true }), ventana({ inf: true, der: true }),
        ventana({ parteluz: true }), ventana({ sup: true, parteluz: true }), ventana({ inf: true, parteluz: true }),
        muro(1), muro(2), muro(3), piso(true)
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
        18: { soloArriba: true },
        40: { solido: true },
        41: { solido: true },
        42: { solido: true },
        43: { solido: true }
    }
};
