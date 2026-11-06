// Bola de energía que el jefe lanza desde la garra (16x16). Roja (peligro) para no confundirse con las
// balas cian del jugador. Frames: 0-1 pulso (animación 'viajar')
import { Lienzo, ruido } from '../tools/pixel/lienzo.js';

const T = 16;
const C = 7.5;

function bola(radio, semilla) {
    const l = new Lienzo(T, T).patron(0, 0, T, T, (x, y) => {
        const d = Math.hypot(x - C, y - C) + (ruido(x, y, semilla) - 0.5) * 1.4;
        return d < radio - 4 ? '9' : d < radio - 2 ? 'j' : d < radio ? 'i' : null;
    });
    return l.rect(5, 5, 2, 2, '9');
}

export default {
    nombre: 'bola-energia',
    hd: true,
    ancho: T,
    alto: T,
    frames: () => [bola(6.8, 1), bola(6, 2)],
    animaciones: { viajar: { frames: [0, 1], fps: 10, repetir: -1 } }
};
