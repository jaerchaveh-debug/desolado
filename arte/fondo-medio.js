// Capa media del fondo parallax: estructuras más cercanas que la megaestructura lejana, delante de ella.
// Un frame de 1280x512 (más ancho que la pantalla), transparente salvo las estructuras, que se repite
// sin costura en horizontal y en vertical (TileSprite encima de 'fondo-lejano').
// Tres pilares de celosía que cruzan el frame de arriba abajo, vigas maestras entre ellos, tendidos de
// cables combados y unas pocas luces cian. Tonos '0'-'2' con el canto superior en '2'.

import { Lienzo, ruido } from '../tools/pixel/lienzo.js';

const ANCHO = 1280;
const ALTO = 512;

// Pilar de celosía: largueros, travesaños cada 'paso' px (divide a ALTO, así que casa al repetirse)
// y diagonales en X entre ellos, de 2 px de grueso.
function pilar(l, x, w, paso, semilla) {
    l.rect(x, 0, w, ALTO, '0');
    l.rect(x, 0, 6, ALTO, '1').rect(x + w - 6, 0, 6, ALTO, '1');      // largueros
    l.rect(x, 0, 2, ALTO, '2').lineaV(x + 5, 0, ALTO, '0').lineaV(x + w - 6, 0, ALTO, '0');   // aristas
    for (let y = 0; y < ALTO; y += paso) {
        l.rect(x, y, w, 4, '1').lineaH(x, y, w, '2').lineaH(x, y + 3, w, '0');   // travesaño
        for (let i = 0; i < paso - 4; i++) {
            const t = i / (paso - 5);
            const xa = Math.round(x + 6 + t * (w - 14));
            l.rect(xa, y + 4 + i, 2, 1, '1').rect(x + w - 2 - (xa - x), y + 4 + i, 2, 1, '1');
        }
        // Cartelas de los nudos, con su tornillo
        for (const nx of [x + 6, x + w - 11]) l.rect(nx, y + 4, 5, 4, '1').punto(nx + 2, y + 5, '2');
    }
    // Pilotos de servicio: casi todos apagados
    for (let y = paso / 2; y < ALTO; y += paso) {
        const n = ruido(x, y, semilla);
        if (n > 0.75) l.rect(x + 2, y, 2, 4, n > 0.9 ? 'g' : 'f');
    }
}

// Viga maestra horizontal de x0 a x1, con nervios y cartelas en los extremos
function viga(l, x0, x1, y) {
    const w = x1 - x0;
    l.rect(x0, y, w, 20, '0');
    l.lineaH(x0, y, w, '2').lineaH(x0, y + 1, w, '2').rect(x0, y + 2, w, 2, '1').rect(x0, y + 18, w, 2, '1');
    for (let x = x0 + 8; x < x1 - 4; x += 24) {
        l.rect(x, y + 4, 2, 14, '1');
        l.punto(x + 8, y + 7, '1').punto(x + 16, y + 7, '1').punto(x + 8, y + 15, '1').punto(x + 16, y + 15, '1');
    }
    l.poligono([[x0, y + 20], [x0 + 36, y + 20], [x0, y + 52]], '0');
    l.poligono([[x1 - 36, y + 20], [x1, y + 20], [x1, y + 52]], '0');
    l.linea(x0, y + 52, x0 + 36, y + 20, '1').linea(x0, y + 53, x0 + 36, y + 21, '1');
    l.linea(x1, y + 52, x1 - 36, y + 20, '1').linea(x1, y + 53, x1 - 36, y + 21, '1');
}

// Cable de 2 px de grueso
const cableDoble = (l, x0, y0, x1, y1, c, caida) => l.cable(x0, y0, x1, y1, c, caida).cable(x0, y0 + 1, x1, y1 + 1, c, caida);

export default {
    nombre: 'fondo-medio',
    hd: true,
    ancho: ANCHO,
    alto: ALTO,
    frames: () => {
        const l = new Lienzo(ANCHO, ALTO);

        // Cables que cruzan el borde derecho: se dibujan en un lienzo más ancho y se pegan dos veces
        // (desplazados un ANCHO) para que el mismo cable continúe al otro lado al repetirse
        const cruce = new Lienzo(ANCHO + 160, ALTO);
        cableDoble(cruce, 934, 80, ANCHO + 80, 104, '1', 36);
        cableDoble(cruce, 934, 240, ANCHO + 80, 224, '0', 48);
        l.pegar(cruce, 0, 0).pegar(cruce, -ANCHO, 0);

        pilar(l, 80, 72, 64, 1);
        pilar(l, 428, 74, 128, 2);
        pilar(l, 860, 74, 128, 3);

        viga(l, 152, 428, 300);
        viga(l, 502, 860, 128);

        // Tendidos de cables combados entre pilares
        cableDoble(l, 152, 328, 428, 344, '1', 52);
        cableDoble(l, 152, 336, 428, 332, '0', 68);
        cableDoble(l, 502, 156, 860, 168, '1', 60);

        // Luces de las vigas
        l.rect(284, 312, 8, 2, 'f').rect(286, 312, 2, 2, 'g');
        l.rect(676, 140, 6, 2, 'f');
        return [l];
    }
};
