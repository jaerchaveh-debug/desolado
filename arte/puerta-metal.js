// Puerta blindada destructible del pasillo inferior (16x64, ocupa el pasillo de 4 tiles de alto).
// Frames: 0 intacta · 1 abollada · 2 agrietada (un boquete) · 3 destrozada (luz apagada)
//         4 compuerta de la sala del jefe: persiana pesada que cae tras el jugador (indestructible)
// GameScene elige el frame de daño según la vida que le queda (ver PUERTA en config/combate.js).

import { Lienzo, ruido } from '../tools/pixel/lienzo.js';

const ANCHO = 16;
const ALTO = 64;

function intacta() {
    const l = new Lienzo(ANCHO, ALTO).rect(0, 0, ANCHO, ALTO, '4');
    l.lineaV(1, 1, ALTO - 2, '5').lineaV(14, 1, ALTO - 2, '3');              // jambas
    l.lineaV(7, 4, ALTO - 8, '2').lineaV(8, 4, ALTO - 8, '5');               // junta central
    l.rect(1, 1, 14, 3, '5').lineaH(1, 1, 14, '7');                          // dintel iluminado
    // costillas horizontales de refuerzo
    for (let y = 14; y < 50; y += 12) l.lineaH(2, y, 12, '6').lineaH(2, y + 1, 12, '2');
    // franjas de peligro en óxido
    l.patron(2, 51, 12, 8, (x, y) => ((x + y) % 6 < 3 ? 'c' : '1'));
    l.lineaH(2, 50, 12, '6').lineaH(2, 59, 12, '2');
    // luz de bloqueo roja
    l.rect(6, 7, 4, 4, '0').rect(7, 8, 2, 2, 'j').punto(7, 8, '9');
    // remaches
    for (let y = 18; y < 48; y += 12) l.punto(3, y, '7').punto(12, y, '7');
    l.patron(2, 4, 12, 46, (x, y) => (ruido(x, y, 51) > 0.96 ? '3' : null));
    return chaflan(l.marco(0, 0, ANCHO, ALTO, '0'));
}

// Esquinas superiores achaflanadas (1 px transparente)
function chaflan(l) {
    l.px[0][0] = '.';
    l.px[0][ANCHO - 1] = '.';
    return l;
}

// Abolladura: hundimiento oscuro con el borde superior iluminado
function abolladura(l, x, y, w, h) {
    l.rect(x, y, w, h, '2').rect(x + 1, y + 1, w - 2, h - 2, '1');
    l.lineaH(x, y + h, w, '6');
    return l;
}

// Boquete: agujero negro con el metal al rojo en el borde y chapa doblada
function boquete(l, cx, cy, radio, semilla) {
    l.patron(cx - radio - 1, cy - radio - 1, 2 * radio + 3, 2 * radio + 3, (x, y) => {
        const dx = x - radio - 1, dy = y - radio - 1;
        const d = Math.hypot(dx, dy) + ruido(x, y, semilla) * 1.2;
        return d < radio ? '0' : d < radio + 1 ? 'd' : d < radio + 1.8 ? '6' : null;
    });
    return l;
}

function grieta(l, puntos, c = '0') {
    for (let i = 1; i < puntos.length; i++) l.linea(...puntos[i - 1], ...puntos[i], c);
    return l;
}

function abollada() {
    const l = intacta();
    abolladura(l, 3, 24, 4, 3);
    abolladura(l, 9, 38, 4, 4);
    return grieta(l, [[10, 30], [11, 33], [10, 36]], '1');
}

function agrietada() {
    const l = abollada();
    abolladura(l, 4, 42, 3, 3);
    grieta(l, [[5, 17], [6, 21], [4, 25], [6, 29]]);
    boquete(l, 9, 32, 2, 52);
    return l;
}

function destrozada() {
    const l = agrietada();
    boquete(l, 5, 22, 3, 53);
    boquete(l, 10, 44, 3, 54);
    grieta(l, [[8, 4], [9, 9], [7, 13]]);
    grieta(l, [[3, 48], [5, 53], [4, 58]], '1');
    l.rect(7, 8, 2, 2, 'i');                                                  // luz apagada
    return l;
}

// Compuerta: persiana de láminas horizontales con canto inferior de peligro
function compuerta() {
    const l = new Lienzo(ANCHO, ALTO).rect(0, 0, ANCHO, ALTO, '3');
    for (let y = 1; y < 54; y += 4) {
        l.lineaH(1, y, 14, '6').lineaH(1, y + 1, 14, '4').lineaH(1, y + 2, 14, '3').lineaH(1, y + 3, 14, '1');
    }
    l.patron(1, 55, 14, 6, (x, y) => ((x + y) % 6 < 3 ? 'd' : '0'));
    l.lineaH(1, 54, 14, '7').lineaH(1, 61, 14, '2');
    l.rect(6, 27, 4, 3, '0').rect(7, 28, 2, 1, 'j');
    return chaflan(l.marco(0, 0, ANCHO, ALTO, '0'));
}

export default {
    nombre: 'puerta-metal',
    ancho: ANCHO,
    alto: ALTO,
    frames: () => [intacta(), abollada(), agrietada(), destrozada(), compuerta()]
};
