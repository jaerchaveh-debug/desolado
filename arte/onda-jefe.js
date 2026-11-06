// Ataque cargado del jefe: onda en anillo alrededor de él (cuadrado centrado en el jefe).
// Frames: 0 aviso (círculo discontinuo con el radio del ataque) · 1 descarga · 2 disipándose
// El radio sale de JEFES.estibador.cargado.radio: el borde del aviso es exactamente el área de daño.
import { Lienzo, ruido } from '../tools/pixel/lienzo.js';
import { JEFES } from '../src/config/combate.js';

const RADIO = JEFES.estibador.cargado.radio;
const T = 2 * RADIO + 32;
const C = (T - 1) / 2;

const anillo = (desde, hasta, color) => (x, y) => {
    const d = Math.hypot(x - C, y - C);
    return d >= desde && d < hasta ? color(x, y, d) : null;
};

function aviso() {
    const l = new Lienzo(T, T);
    return l.patron(0, 0, T, T, anillo(RADIO - 3, RADIO + 1, (x, y, d) => {
        const a = Math.atan2(y - C, x - C);
        if (!(Math.floor((a + Math.PI) / (Math.PI / 32)) % 2)) return null;
        return d < RADIO - 2 ? 'i' : 'j';
    }));
}

function descarga() {
    const l = new Lienzo(T, T);
    l.patron(0, 0, T, T, anillo(RADIO - 20, RADIO + 2, (x, y, d) => {
        const n = ruido(x >> 1, y >> 1, 81);
        if (d > RADIO - 5) return '9';
        if (d > RADIO - 12) return n > 0.3 ? 'j' : '9';
        return n > 0.55 ? 'i' : null;
    }));
    return l;
}

function disipando() {
    const l = new Lienzo(T, T);
    return l.patron(0, 0, T, T, anillo(RADIO - 4, RADIO + 6, (x, y) => { const n = ruido(x >> 1, y >> 1, 82); return n > 0.85 ? 'j' : n > 0.6 ? 'i' : null; }));
}

export default {
    nombre: 'onda-jefe',
    hd: true,
    ancho: T,
    alto: T,
    frames: () => [aviso(), descarga(), disipando()],
    animaciones: { descargar: { frames: [1, 2], fps: 8, repetir: 0 } }
};
