// Puerta blindada destructible del pasillo inferior (32x128, ocupa el pasillo de 4 tiles de alto).
// Frames: 0 intacta · 1 abollada · 2 agrietada (un boquete) · 3 destrozada (luz apagada)
//         4 compuerta de la sala del jefe: persiana pesada que cae tras el jugador (indestructible)
// GameScene elige el frame de daño según la vida que le queda (ver PUERTA en config/combate.js).

import { Lienzo, ruido } from '../tools/pixel/lienzo.js';

const ANCHO = 32;
const ALTO = 128;

function intacta() {
    const l = new Lienzo(ANCHO, ALTO).rect(0, 0, ANCHO, ALTO, '4');
    l.rect(2, 2, 2, ALTO - 4, '5').rect(28, 2, 2, ALTO - 4, '3');            // jambas
    l.rect(14, 8, 2, ALTO - 16, '2').rect(16, 8, 2, ALTO - 16, '5').lineaV(15, 8, ALTO - 16, '1');   // junta central
    l.rect(2, 2, 28, 6, '5').lineaH(2, 2, 28, '8').lineaH(2, 3, 28, '7').lineaH(2, 7, 28, '3');      // dintel iluminado
    // Sombra del lado derecho con trazos
    l.trazos((x, y) => l.color(x, y) === '4' && x > 18 && y > 8 && y < 100, '3', { separacion: 3, inclinacion: 1, rotura: 0.25, semilla: 5 });
    // costillas horizontales de refuerzo, con remaches
    for (let y = 28; y < 100; y += 24) {
        l.rect(4, y, 24, 2, '6').lineaH(4, y, 24, '7').rect(4, y + 2, 24, 2, '2');
        for (const x of [6, 24]) l.rect(x, y + 8, 3, 3, '5').punto(x, y + 8, '8').punto(x + 2, y + 10, '2');
    }
    // franjas de peligro en óxido
    l.patron(4, 102, 24, 16, (x, y) => ((x + y) % 12 < 6 ? 'c' : '1'));
    l.patron(4, 102, 24, 16, (x, y) => (ruido(x, y, 52) > 0.9 ? 'b' : null));
    l.rect(4, 100, 24, 2, '6').rect(4, 118, 24, 2, '2');
    // luz de bloqueo roja
    l.rect(11, 13, 10, 10, '0').marco(11, 13, 10, 10, '2').rect(13, 15, 6, 6, 'i').rect(14, 16, 4, 4, 'j').rect(14, 16, 2, 2, '9');
    l.patron(4, 8, 24, 92, (x, y) => (ruido(x, y, 51) > 0.975 ? '3' : null));
    return chaflan(l.marco(0, 0, ANCHO, ALTO, '0').marco(1, 1, ANCHO - 2, ALTO - 2, '1'));
}

// Esquinas superiores achaflanadas (2 px transparentes)
function chaflan(l) {
    for (const x of [0, 1, ANCHO - 2, ANCHO - 1]) l.px[0][x] = '.';
    l.px[1][0] = '.';
    l.px[1][ANCHO - 1] = '.';
    return l;
}

// Abolladura: hundimiento oscuro con el borde superior iluminado
function abolladura(l, x, y, w, h) {
    l.rect(x, y, w, h, '2').rect(x + 2, y + 2, w - 4, h - 4, '1');
    l.trazos({ x, y, w, h }, '0', { separacion: 2, inclinacion: 1, rotura: 0.4, semilla: x });
    return l.lineaH(x, y + h, w, '7').lineaH(x + 1, y + h + 1, w - 2, '5');
}

// Boquete: agujero negro con el metal al rojo en el borde y chapa doblada
function boquete(l, cx, cy, radio, semilla) {
    l.patron(cx - radio - 3, cy - radio - 3, 2 * radio + 7, 2 * radio + 7, (x, y) => {
        const dx = x - radio - 3, dy = y - radio - 3;
        const d = Math.hypot(dx, dy) + ruido(x, y, semilla) * 2.2;
        return d < radio ? '0' : d < radio + 1.5 ? 'd' : d < radio + 2.2 ? 'c' : d < radio + 3.4 ? '6' : null;
    });
    return l;
}

function grieta(l, puntos, c = '0') {
    for (let i = 1; i < puntos.length; i++) {
        l.linea(...puntos[i - 1], ...puntos[i], c);
        l.linea(puntos[i - 1][0] + 1, puntos[i - 1][1], puntos[i][0] + 1, puntos[i][1], '2');
    }
    return l;
}

function abollada() {
    const l = intacta();
    abolladura(l, 6, 48, 8, 6);
    abolladura(l, 18, 76, 8, 8);
    return grieta(l, [[20, 60], [22, 66], [20, 72]], '1');
}

function agrietada() {
    const l = abollada();
    abolladura(l, 8, 84, 6, 6);
    grieta(l, [[10, 34], [12, 42], [8, 50], [12, 58]]);
    return boquete(l, 18, 64, 4, 52);
}

function destrozada() {
    const l = agrietada();
    boquete(l, 10, 44, 6, 53);
    boquete(l, 20, 88, 6, 54);
    grieta(l, [[16, 8], [18, 18], [14, 26]]);
    grieta(l, [[6, 96], [10, 106], [8, 116]], '1');
    return l.rect(13, 15, 6, 6, '1').rect(14, 16, 4, 4, 'i');   // luz apagada
}

// Compuerta: persiana de láminas horizontales con canto inferior de peligro
function compuerta() {
    const l = new Lienzo(ANCHO, ALTO).rect(0, 0, ANCHO, ALTO, '3');
    for (let y = 2; y < 108; y += 8) {
        l.lineaH(2, y, 28, '7').lineaH(2, y + 1, 28, '6').rect(2, y + 2, 28, 2, '4').rect(2, y + 4, 28, 2, '3').lineaH(2, y + 6, 28, '2').lineaH(2, y + 7, 28, '1');
        l.punto(4, y + 3, '6').punto(27, y + 3, '6');
    }
    l.patron(2, 110, 28, 12, (x, y) => ((x + y) % 12 < 6 ? 'd' : '0'));
    l.rect(2, 108, 28, 2, '7').rect(2, 122, 28, 2, '2');
    l.rect(11, 53, 10, 8, '0').marco(11, 53, 10, 8, '2').rect(13, 55, 6, 4, 'i').rect(14, 56, 4, 2, 'j');
    return chaflan(l.marco(0, 0, ANCHO, ALTO, '0').marco(1, 1, ANCHO - 2, ALTO - 2, '1'));
}

export default {
    nombre: 'puerta-metal',
    hd: true,
    ancho: ANCHO,
    alto: ALTO,
    frames: () => [intacta(), abollada(), agrietada(), destrozada(), compuerta()]
};
