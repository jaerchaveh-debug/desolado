// Vista de un sonido como imagen: forma de onda arriba y espectrograma debajo (frecuencia en
// escala logarítmica de 40 Hz a 11 kHz, de abajo arriba; energía en la paleta del juego).
// Es la forma de "ver" un sonido para revisarlo sin oírlo.

import { FM } from './sintesis.js';
import { PALETA, hexARgb } from '../pixel/paleta.js';

const ALTO_ONDA = 40;
const ALTO_ESPECTRO = 96;
const PX_POR_SEGUNDO = 200;
const ANCHO_MAX = 900;
const N = 512;
const F_MIN = 40, F_MAX = FM / 2;
// Rampa de energía: de silencio a máxima
const RAMPA = ['0', '1', 'e', 'f', 'g', 'h', '9'].map(c => hexARgb(PALETA[c]));
const FONDO = hexARgb(PALETA['1']), ONDA = hexARgb(PALETA['7']), EJE = hexARgb(PALETA['3']);
const SEPARACION = 4;

// FFT radix-2 en el sitio (re, im de longitud N)
function fft(re, im) {
    const n = re.length;
    for (let i = 1, j = 0; i < n; i++) {
        let bit = n >> 1;
        for (; j & bit; bit >>= 1) j ^= bit;
        j ^= bit;
        if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
    }
    for (let largo = 2; largo <= n; largo <<= 1) {
        const ang = -2 * Math.PI / largo;
        for (let i = 0; i < n; i += largo) {
            for (let k = 0; k < largo / 2; k++) {
                const wr = Math.cos(ang * k), wi = Math.sin(ang * k);
                const a = i + k, b = a + largo / 2;
                const tr = re[b] * wr - im[b] * wi, ti = re[b] * wi + im[b] * wr;
                re[b] = re[a] - tr; im[b] = im[a] - ti;
                re[a] += tr; im[a] += ti;
            }
        }
    }
}

function columnas(s) {
    return Math.max(16, Math.min(ANCHO_MAX, Math.round(s.length / FM * PX_POR_SEGUNDO)));
}

function pintar(rgba, ancho, x, y, color) {
    rgba.set([...color, 255], (y * ancho + x) * 4);
}

// Una o varias señales (variantes) apiladas en vertical
export function espectrograma(señales) {
    const ancho = Math.max(...señales.map(columnas));
    const altoUna = ALTO_ONDA + ALTO_ESPECTRO;
    const alto = señales.length * (altoUna + SEPARACION) - SEPARACION;
    const rgba = new Uint8Array(ancho * alto * 4);
    for (let i = 0; i < ancho * alto; i++) rgba.set([...FONDO, 255], i * 4);

    señales.forEach((s, v) => {
        const y0 = v * (altoUna + SEPARACION);
        const cols = columnas(s);
        const porColumna = s.length / cols;
        // Onda: pico positivo y negativo de cada columna
        for (let x = 0; x < ancho; x++) pintar(rgba, ancho, x, y0 + ALTO_ONDA / 2, EJE);
        for (let x = 0; x < cols; x++) {
            let min = 0, max = 0;
            for (let i = Math.floor(x * porColumna); i < Math.floor((x + 1) * porColumna); i++) {
                min = Math.min(min, s[i]); max = Math.max(max, s[i]);
            }
            const ya = Math.round((1 - max) * (ALTO_ONDA - 1) / 2), yb = Math.round((1 - min) * (ALTO_ONDA - 1) / 2);
            for (let y = ya; y <= yb; y++) pintar(rgba, ancho, x, y0 + y, ONDA);
        }
        // Espectrograma
        const re = new Float32Array(N), im = new Float32Array(N);
        for (let x = 0; x < cols; x++) {
            const centro = Math.floor((x + 0.5) * porColumna);
            for (let i = 0; i < N; i++) {
                const ventana = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (N - 1));
                re[i] = (s[centro - N / 2 + i] ?? 0) * ventana;
                im[i] = 0;
            }
            fft(re, im);
            for (let y = 0; y < ALTO_ESPECTRO; y++) {
                const f = F_MIN * (F_MAX / F_MIN) ** (1 - y / (ALTO_ESPECTRO - 1));
                const k = Math.min(N / 2 - 1, Math.round(f / FM * N));
                const db = 20 * Math.log10(Math.hypot(re[k], im[k]) / (N / 4) + 1e-9);   // ~0 dB a escala completa
                const nivel = Math.max(0, Math.min(1, (db + 60) / 60));
                pintar(rgba, ancho, x, y0 + ALTO_ONDA + y, RAMPA[Math.min(RAMPA.length - 1, Math.floor(nivel * RAMPA.length))]);
            }
        }
    });
    return { ancho, alto, rgba };
}
