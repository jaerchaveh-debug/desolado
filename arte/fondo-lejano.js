// Capa lejana del fondo parallax: la megaestructura a kilómetros de distancia. Un frame de 1024x512
// (más ancho que la pantalla, para que no se vea el patrón repetido en una misma vista) que se repite
// sin costura en horizontal y en vertical (GameScene la dibuja como TileSprite).
// Torres colosales tramadas en '1' sobre el negro (planas, perdidas en la oscuridad), puentes que las
// unen, ventanucos en '2' y una sola baliza roja. Mucho más oscura que la roca del plano de juego para
// que nunca se confunda con pared. Sin base: detrás está el color de fondo del juego, el '0' de la paleta.

import { Lienzo, ruido, umbralBayer } from '../tools/pixel/lienzo.js';

const ANCHO = 1024;
const ALTO = 512;

// Punto con vuelta: lo que sale por un borde entra por el opuesto (la capa se repite)
const envolver = (l, x, y, c) => l.punto(((x % ANCHO) + ANCHO) % ANCHO, ((y % ALTO) + ALTO) % ALTO, c);
const rectEnvuelto = (l, x, y, w, h, c) => {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) envolver(l, i, j, c);
};

// Torres verticales (cruzan el frame entero de arriba abajo): x, ancho, densidad del tramado,
// paso de las cornisas (divide a ALTO, para que casen al repetirse) y semilla
const TORRES = [
    { x: 12, w: 68, densidad: 0.75, paso: 128, semilla: 1 },
    { x: 116, w: 28, densidad: 0.5, paso: 256, semilla: 2 },
    { x: 184, w: 92, densidad: 0.85, paso: 128, semilla: 3 },
    { x: 320, w: 40, densidad: 0.6, paso: 256, semilla: 4 },
    { x: 408, w: 76, densidad: 0.75, paso: 128, semilla: 5 },
    { x: 552, w: 48, densidad: 0.55, paso: 256, semilla: 6 },
    { x: 644, w: 116, densidad: 0.8, paso: 64, semilla: 7 },
    { x: 820, w: 32, densidad: 0.5, paso: 128, semilla: 8 },
    { x: 892, w: 80, densidad: 0.7, paso: 256, semilla: 9 }
];

// Puentes y vigas que unen torres: x, y, largo, grosor
const PUENTES = [
    { x: 72, y: 92, w: 124, h: 6 },
    { x: 268, y: 236, w: 148, h: 8 },
    { x: 472, y: 380, w: 88, h: 4 },
    { x: 136, y: 428, w: 56, h: 4 },
    { x: 592, y: 140, w: 60, h: 4 },
    { x: 752, y: 300, w: 148, h: 6 },
    { x: 964, y: 60, w: 80, h: 4 }
];

function torre(l, { x, w, densidad, paso, semilla }) {
    // Cuerpo: tramado ordenado de '1' sobre el negro del fondo (plano, como visto a través de la bruma)
    for (let j = 0; j < ALTO; j++) {
        for (let i = 0; i < w; i++) {
            if (umbralBayer(x + i, j) < densidad) envolver(l, x + i, j, '1');
        }
    }
    // Arista izquierda sólida: recorta la silueta de la torre contra el tramado
    for (let j = 0; j < ALTO; j++) rectEnvuelto(l, x, j, 2, 1, '1');
    // Cornisas cada 'paso' px: franja sólida con canto superior en '2'
    for (let j = (semilla * 37) % paso; j < ALTO; j += paso) {
        rectEnvuelto(l, x - 2, j, w + 4, 4, '1');
        rectEnvuelto(l, x - 2, j, w + 4, 2, '2');
        for (let i = 4; i < w - 2; i += 8) rectEnvuelto(l, x + i, j + 4, 2, 3, '1');   // ménsulas bajo la cornisa
    }
    // Ventanucos en rejilla, casi todos apagados
    for (let j = 6; j < ALTO; j += 8) {
        for (let i = 6; i < w - 4; i += 7) {
            const n = ruido(x + i, j, semilla + 20);
            if (n > 0.998) rectEnvuelto(l, x + i, j, 2, 3, 'f');
            else if (n > 0.9) rectEnvuelto(l, x + i, j, 2, 3, '2');
        }
    }
}

export default {
    nombre: 'fondo-lejano',
    hd: true,
    ancho: ANCHO,
    alto: ALTO,
    frames: () => {
        const l = new Lienzo(ANCHO, ALTO);
        TORRES.forEach(t => torre(l, t));
        for (const p of PUENTES) {
            rectEnvuelto(l, p.x, p.y, p.w, p.h, '1');
            rectEnvuelto(l, p.x, p.y, p.w, 2, '2');
        }
        // Una sola baliza roja de aviso en lo alto de una torre, y algún foco cian aislado
        rectEnvuelto(l, 228, 168, 4, 4, 'i');
        rectEnvuelto(l, 229, 169, 2, 2, 'j');
        rectEnvuelto(l, 436, 60, 4, 2, 'e');
        rectEnvuelto(l, 44, 300, 2, 4, 'e');
        rectEnvuelto(l, 700, 400, 4, 2, 'e');
        return [l];
    }
};
