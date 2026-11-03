// Capa media del fondo parallax: estructuras más cercanas que la megaestructura lejana, delante de ella.
// Un frame de 640x256 (más ancho que la pantalla), transparente salvo las estructuras, que se repite
// sin costura en horizontal y en vertical (TileSprite encima de 'fondo-lejano').
// Tres pilares de celosía que cruzan el frame de arriba abajo, vigas maestras entre ellos, tendidos de
// cables combados y unas pocas luces cian. Tonos '0'-'2' con el canto superior en '2'.

import { Lienzo, ruido } from '../tools/pixel/lienzo.js';

const ANCHO = 640;
const ALTO = 256;

// Pilar de celosía: largueros, travesaños cada 'paso' px (divide a ALTO, así que casa al repetirse)
// y diagonales en X entre ellos. Con (w - 7) = (paso - 3) la diagonal sale 1:1; con la mitad, 1:2.
function pilar(l, x, w, paso, semilla) {
    l.rect(x, 0, w, ALTO, '0');
    l.rect(x, 0, 3, ALTO, '1').rect(x + w - 3, 0, 3, ALTO, '1');     // largueros
    l.lineaV(x, 0, ALTO, '2');                                         // arista que recoge la luz
    for (let y = 0; y < ALTO; y += paso) {
        l.rect(x, y, w, 2, '1').lineaH(x, y, w, '2');                  // travesaño
        for (let i = 0; i < paso - 2; i++) {
            const t = i / (paso - 3);
            const xa = Math.round(x + 3 + t * (w - 7));
            l.punto(xa, y + 2 + i, '1').punto(x + w - 1 - (xa - x), y + 2 + i, '1');
        }
    }
    // Pilotos de servicio: casi todos apagados
    for (let y = paso / 2; y < ALTO; y += paso) {
        const n = ruido(x, y, semilla);
        if (n > 0.75) l.rect(x + 1, y, 1, 2, n > 0.9 ? 'g' : 'f');
    }
}

// Viga maestra horizontal de x0 a x1, con nervios y cartelas en los extremos
function viga(l, x0, x1, y) {
    const w = x1 - x0;
    l.rect(x0, y, w, 10, '0');
    l.lineaH(x0, y, w, '2').lineaH(x0, y + 1, w, '1').lineaH(x0, y + 9, w, '1');
    for (let x = x0 + 4; x < x1 - 2; x += 12) l.lineaV(x, y + 2, 7, '1');
    l.poligono([[x0, y + 10], [x0 + 18, y + 10], [x0, y + 26]], '0');
    l.poligono([[x1 - 18, y + 10], [x1, y + 10], [x1, y + 26]], '0');
    l.linea(x0, y + 26, x0 + 18, y + 10, '1').linea(x1, y + 26, x1 - 18, y + 10, '1');
}

export default {
    nombre: 'fondo-medio',
    ancho: ANCHO,
    alto: ALTO,
    frames: () => {
        const l = new Lienzo(ANCHO, ALTO);

        // Cables que cruzan el borde derecho: se dibujan en un lienzo más ancho y se pegan dos veces
        // (desplazados un ANCHO) para que el mismo cable continúe al otro lado al repetirse
        const cruce = new Lienzo(ANCHO + 80, ALTO);
        cruce.cable(467, 40, ANCHO + 40, 52, '1', 18);
        cruce.cable(467, 120, ANCHO + 40, 112, '0', 24);
        l.pegar(cruce, 0, 0).pegar(cruce, -ANCHO, 0);

        pilar(l, 40, 36, 32, 1);
        pilar(l, 214, 37, 64, 2);
        pilar(l, 430, 37, 64, 3);

        viga(l, 76, 214, 150);
        viga(l, 251, 430, 64);

        // Tendidos de cables combados entre pilares
        l.cable(76, 164, 214, 172, '1', 26);
        l.cable(76, 168, 214, 166, '0', 34);
        l.cable(251, 78, 430, 84, '1', 30);

        // Luces de las vigas
        l.rect(142, 156, 4, 1, 'f').punto(143, 156, 'g');
        l.rect(338, 70, 3, 1, 'f');
        return [l];
    }
};
