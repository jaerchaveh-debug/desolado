// Terminal del punto de control (16x32, apoyada en el suelo). Se activa al pasar el jugador por delante.
// Frames: 0 inactiva (pantalla negra, piloto de óxido) · 1-2 activa (pantalla cian con barrido, piloto cian)
// Animación 'activa' (frames 1-2) en bucle; GameScene muestra el frame 0 hasta activarla.

import { Lienzo } from '../tools/pixel/lienzo.js';

const ANCHO = 16;
const ALTO = 32;

// Carcasa: cabezal inclinado con la pantalla, columna con cables y peana atornillada al suelo
function carcasa() {
    const l = new Lienzo(ANCHO, ALTO);
    // Cabezal: tapa inclinada en dos tramos de 6 px
    l.rect(2, 3, 12, 11, '4');
    l.lineaH(2, 3, 6, '6').lineaH(8, 2, 6, '6').lineaH(8, 3, 6, '5');  // canto superior iluminado
    l.lineaH(2, 4, 6, '5');
    l.lineaH(2, 13, 12, '2').lineaV(13, 3, 10, '3');
    // Columna
    l.rect(6, 14, 4, 13, '3').lineaV(6, 14, 13, '4').lineaV(9, 14, 13, '2');
    l.rect(5, 14, 6, 1, '2');                                         // cuello bajo el cabezal
    l.lineaV(11, 15, 11, '2').punto(11, 20, 'b').punto(11, 24, 'b');  // cable con abrazaderas de óxido
    // Peana
    l.rect(3, 27, 10, 5, '3').lineaH(3, 27, 10, '5').lineaH(3, 31, 10, '2');
    l.punto(4, 29, '6').punto(11, 29, '6');                           // pernos
    return l.contorno('0');
}

// Pantalla (hueco del cabezal) y piloto en la columna
function terminal(pantalla, piloto, barrido) {
    const l = carcasa();
    l.rect(4, 6, 8, 6, '0');
    if (pantalla) {
        l.rect(4, 6, 8, 6, 'e');
        l.lineaH(5, 7, 5, 'f').lineaH(5, 9, 6, 'f').lineaH(5, 10, 3, 'f');   // líneas de texto ilegibles
        l.lineaH(4, barrido, 8, 'g');                                        // barrido de refresco
        l.punto(10, 7, 'h');
    }
    l.rect(7, 18, 2, 2, piloto);
    return l;
}

export default {
    nombre: 'terminal-control',
    ancho: ANCHO,
    alto: ALTO,
    frames: () => [
        terminal(false, 'd', 0),   // piloto de óxido: sin señal (el rojo queda para el peligro)
        terminal(true, 'g', 8),
        terminal(true, 'f', 10)
    ],
    animaciones: {
        activa: { frames: [1, 2], fps: 3, repetir: -1 }
    }
};
