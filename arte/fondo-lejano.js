// Capa lejana del fondo parallax: la megaestructura a kilómetros de distancia. Un frame de 512x256
// (más ancho que la pantalla, para que no se vea el patrón repetido en una misma vista) que se repite
// sin costura en horizontal y en vertical (GameScene la dibuja como TileSprite).
// Torres colosales tramadas en '1' sobre el negro (planas, perdidas en la oscuridad), puentes que las
// unen, ventanucos en '2' y una sola baliza roja. Mucho más oscura que la roca del plano de juego para
// que nunca se confunda con pared. Sin base: detrás está el color de fondo del juego, el '0' de la paleta.

import { Lienzo, ruido, umbralBayer } from '../tools/pixel/lienzo.js';

const ANCHO = 512;
const ALTO = 256;

// Punto con vuelta: lo que sale por un borde entra por el opuesto (la capa se repite)
const envolver = (l, x, y, c) => l.punto(((x % ANCHO) + ANCHO) % ANCHO, ((y % ALTO) + ALTO) % ALTO, c);
const rectEnvuelto = (l, x, y, w, h, c) => {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) envolver(l, i, j, c);
};

// Torres verticales (cruzan el frame entero de arriba abajo): x, ancho, densidad del tramado,
// paso de las cornisas (divide a ALTO, para que casen al repetirse) y semilla
const TORRES = [
    { x: 6, w: 34, densidad: 0.75, paso: 64, semilla: 1 },
    { x: 58, w: 14, densidad: 0.5, paso: 128, semilla: 2 },
    { x: 92, w: 46, densidad: 0.85, paso: 64, semilla: 3 },
    { x: 160, w: 20, densidad: 0.6, paso: 128, semilla: 4 },
    { x: 204, w: 38, densidad: 0.75, paso: 64, semilla: 5 },
    { x: 276, w: 24, densidad: 0.55, paso: 128, semilla: 6 },
    { x: 322, w: 58, densidad: 0.8, paso: 32, semilla: 7 },
    { x: 410, w: 16, densidad: 0.5, paso: 64, semilla: 8 },
    { x: 446, w: 40, densidad: 0.7, paso: 128, semilla: 9 }
];

// Puentes y vigas que unen torres: x, y, largo, grosor
const PUENTES = [
    { x: 36, y: 46, w: 62, h: 3 },
    { x: 134, y: 118, w: 74, h: 4 },
    { x: 236, y: 190, w: 44, h: 2 },
    { x: 68, y: 214, w: 28, h: 2 },
    { x: 296, y: 70, w: 30, h: 2 },
    { x: 376, y: 150, w: 74, h: 3 },
    { x: 482, y: 30, w: 40, h: 2 }
];

function torre(l, { x, w, densidad, paso, semilla }) {
    // Cuerpo: tramado ordenado de '1' sobre el negro del fondo (plano, como visto a través de la bruma)
    for (let j = 0; j < ALTO; j++) {
        for (let i = 0; i < w; i++) {
            if (umbralBayer(x + i, j) < densidad) envolver(l, x + i, j, '1');
        }
    }
    // Arista izquierda sólida: recorta la silueta de la torre contra el tramado
    for (let j = 0; j < ALTO; j++) envolver(l, x, j, '1');
    // Cornisas cada 'paso' px: franja sólida con canto superior en '2'
    for (let j = (semilla * 37) % paso; j < ALTO; j += paso) {
        rectEnvuelto(l, x - 1, j, w + 2, 2, '1');
        rectEnvuelto(l, x - 1, j, w + 2, 1, '2');
    }
    // Ventanucos en rejilla, casi todos apagados
    for (let j = 3; j < ALTO; j += 6) {
        for (let i = 3; i < w - 2; i += 5) {
            const n = ruido(x + i, j, semilla + 20);
            if (n > 0.995) envolver(l, x + i, j, 'f');
            else if (n > 0.9) envolver(l, x + i, j, '2');
        }
    }
}

export default {
    nombre: 'fondo-lejano',
    ancho: ANCHO,
    alto: ALTO,
    frames: () => {
        const l = new Lienzo(ANCHO, ALTO);
        TORRES.forEach(t => torre(l, t));
        for (const p of PUENTES) {
            rectEnvuelto(l, p.x, p.y, p.w, p.h, '1');
            rectEnvuelto(l, p.x, p.y, p.w, 1, '2');
        }
        // Una sola baliza roja de aviso en lo alto de una torre, y algún foco cian aislado
        rectEnvuelto(l, 114, 84, 2, 2, 'i');
        envolver(l, 114, 84, 'j');
        rectEnvuelto(l, 218, 30, 2, 1, 'e');
        rectEnvuelto(l, 22, 150, 1, 2, 'e');
        rectEnvuelto(l, 350, 200, 2, 1, 'e');
        return [l];
    }
};
