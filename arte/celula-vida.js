// Célula de energía que suelta un enemigo al morir: recupera vida al recogerla (16x16).
// Frames: 0 brillo alto · 1 brillo bajo (animación 'brillar'). Cian = energía, como el HUD de vida.
import { Lienzo } from '../tools/pixel/lienzo.js';

const T = 16;

function celula() {
    const l = new Lienzo(T, T);
    // Cápsula hexagonal con casquillos de metal
    l.poligono([[7, 0], [8, 0], [13, 4], [13, 12], [8, 15], [7, 15], [2, 12], [2, 4]], '0');
    l.poligono([[7, 2], [8, 2], [12, 5], [12, 11], [8, 13], [7, 13], [3, 11], [3, 5]], 'g');
    l.degradado(3, 2, 10, 12, 'hhgfe', { costura: 0.4, zona: (x, y) => l.color(x, y) === 'g' });
    l.rect(5, 4, 2, 6, '9').punto(7, 3, '9').punto(5, 10, 'h');
    l.lineaV(11, 6, 5, 'e');
    return l.rect(6, 0, 4, 2, '6').lineaH(6, 0, 4, '8').rect(6, 14, 4, 2, '5');
}

export default {
    nombre: 'celula-vida',
    hd: true,
    ancho: T,
    alto: T,
    // Pulso: todo un tono más apagado
    frames: () => [celula(), celula().recolor({ h: 'g', g: 'f', f: 'e', 9: '8' })],
    animaciones: { brillar: { frames: [0, 1], fps: 4, repetir: -1 } }
};
