// Terminal del punto de control (32x64, apoyada en el suelo). Se activa al pasar el jugador por delante.
// Frames: 0 inactiva (pantalla negra, piloto de óxido) · 1-2 activa (pantalla cian con barrido, piloto cian)
// Animación 'activa' (frames 1-2) en bucle; GameScene muestra el frame 0 hasta activarla.

import { Lienzo } from '../tools/pixel/lienzo.js';

const ANCHO = 32;
const ALTO = 64;

// Carcasa: cabezal inclinado con la pantalla, columna con cables y peana atornillada al suelo
function carcasa() {
    const l = new Lienzo(ANCHO, ALTO);
    // Cabezal: tapa inclinada
    l.poligono([[4, 8], [16, 5], [28, 4], [28, 28], [4, 28]], '4');
    l.linea(4, 7, 16, 4, '7').linea(16, 4, 28, 3, '7').linea(4, 8, 16, 5, '6').linea(16, 5, 28, 4, '6');   // canto superior iluminado
    l.rect(4, 26, 24, 2, '2').rect(26, 6, 2, 20, '3');
    l.trazos((x, y) => l.color(x, y) === '4' && x > 20 && y > 22, '3', { separacion: 2, inclinacion: 1, rotura: 0.2, semilla: 3 });
    // Columna con refuerzos
    l.rect(12, 28, 8, 26, '3').rect(12, 28, 2, 26, '5').rect(18, 28, 2, 26, '2');
    l.rect(10, 28, 12, 2, '2').lineaH(10, 28, 12, '4');
    for (let y = 34; y < 52; y += 6) l.lineaH(14, y, 4, '2');
    // Cable con abrazaderas de óxido
    l.cable(22, 30, 24, 53, '2', 1).rect(21, 40, 3, 2, 'b').rect(22, 48, 3, 2, 'b').punto(21, 40, 'c').punto(22, 48, 'c');
    // Peana atornillada
    l.poligono([[6, 54], [26, 54], [28, 63], [4, 63]], '3');
    l.lineaH(6, 54, 20, '6').lineaH(6, 55, 20, '5').lineaH(4, 62, 24, '2');
    for (const x of [8, 22]) l.rect(x, 58, 3, 3, '5').punto(x, 58, '8').punto(x + 2, 60, '1');
    return l.contorno('0');
}

// Pantalla (hueco del cabezal) y piloto en la columna
function terminal(pantalla, piloto, barrido) {
    const l = carcasa();
    l.rect(7, 11, 18, 13, '0').marco(6, 10, 20, 15, '2');
    if (pantalla) {
        l.rect(8, 12, 16, 11, 'e');
        // Líneas de texto ilegibles
        l.lineaH(10, 14, 9, 'f').lineaH(10, 16, 11, 'f').lineaH(10, 18, 6, 'f').lineaH(10, 20, 8, 'f');
        l.rect(8, barrido, 16, 2, 'g').lineaH(8, barrido, 16, 'h');   // barrido de refresco
        l.rect(21, 14, 2, 2, 'h');
    }
    l.rect(14, 36, 4, 4, '0').rect(15, 37, 2, 2, piloto);
    return l;
}

export default {
    nombre: 'terminal-control',
    hd: true,
    ancho: ANCHO,
    alto: ALTO,
    frames: () => [
        terminal(false, 'd', 0),   // piloto de óxido: sin señal (el rojo queda para el peligro)
        terminal(true, 'g', 15),
        terminal(true, 'f', 19)
    ],
    animaciones: {
        activa: { frames: [1, 2], fps: 3, repetir: -1 }
    }
};
