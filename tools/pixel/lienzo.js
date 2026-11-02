// Lienzo de pixel art: una rejilla de caracteres de la paleta.
// Permite dibujar con texto (filas de caracteres) o con primitivas.

import { PALETA, TRANSPARENTE, hexARgb } from './paleta.js';

export class Lienzo {

    constructor(ancho, alto) {
        this.ancho = ancho;
        this.alto = alto;
        this.px = Array.from({ length: alto }, () => Array(ancho).fill(TRANSPARENTE));
    }

    static desdeTexto(filas, ancho, alto, nombre = '') {
        if (filas.length !== alto) {
            throw new Error(`${nombre}: ${filas.length} filas, se esperaban ${alto}`);
        }
        const l = new Lienzo(ancho, alto);
        filas.forEach((fila, y) => {
            if (fila.length !== ancho) {
                throw new Error(`${nombre}: la fila ${y} mide ${fila.length}, se esperaba ${ancho}: "${fila}"`);
            }
            [...fila].forEach((c, x) => l.px_(x, y, c, nombre));
        });
        return l;
    }

    px_(x, y, c, nombre = '') {
        if (c !== TRANSPARENTE && !(c in PALETA)) {
            throw new Error(`${nombre}: color '${c}' fuera de la paleta en (${x}, ${y})`);
        }
        if (x >= 0 && y >= 0 && x < this.ancho && y < this.alto) this.px[y][x] = c;
    }

    // Primitivas (todas reciben un carácter de la paleta)
    punto(x, y, c) { this.px_(x, y, c); return this; }

    rect(x, y, w, h, c) {
        for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.px_(i, j, c);
        return this;
    }

    // Línea entre dos puntos (Bresenham), sin antialias
    linea(x0, y0, x1, y1, c) {
        x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
        const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
        const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
        let err = dx + dy;
        for (;;) {
            this.px_(x0, y0, c);
            if (x0 === x1 && y0 === y1) break;
            const e2 = 2 * err;
            if (e2 >= dy) { err += dy; x0 += sx; }
            if (e2 <= dx) { err += dx; y0 += sy; }
        }
        return this;
    }

    lineaH(x, y, w, c) { return this.rect(x, y, w, 1, c); }
    lineaV(x, y, h, c) { return this.rect(x, y, 1, h, c); }

    // Contorno de rectángulo
    marco(x, y, w, h, c) {
        this.lineaH(x, y, w, c).lineaH(x, y + h - 1, w, c);
        return this.lineaV(x, y, h, c).lineaV(x + w - 1, y, h, c);
    }

    // Patrón determinista: llama a fn(x, y) en cada píxel del área y pinta lo que devuelva
    patron(x, y, w, h, fn) {
        for (let j = y; j < y + h; j++) {
            for (let i = x; i < x + w; i++) {
                const c = fn(i - x, j - y);
                if (c) this.px_(i, j, c);
            }
        }
        return this;
    }

    // Pega otro lienzo (los transparentes no sobrescriben)
    pegar(otro, dx, dy) {
        otro.px.forEach((fila, y) => fila.forEach((c, x) => {
            if (c !== TRANSPARENTE) this.px_(dx + x, dy + y, c);
        }));
        return this;
    }

    // Copia desplazada verticalmente (para "respiración" o rebote al correr)
    desplazado(dy) {
        const l = new Lienzo(this.ancho, this.alto);
        return l.pegar(this, 0, dy);
    }

    espejo() {
        const l = new Lienzo(this.ancho, this.alto);
        l.px = this.px.map(fila => [...fila].reverse());
        return l;
    }

    aRGBA(escala = 1) {
        const w = this.ancho * escala, h = this.alto * escala;
        const rgba = new Uint8Array(w * h * 4);
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const c = this.px[Math.floor(y / escala)][Math.floor(x / escala)];
                if (c === TRANSPARENTE) continue;
                const [r, g, b] = hexARgb(PALETA[c]);
                rgba.set([r, g, b, 255], (y * w + x) * 4);
            }
        }
        return { ancho: w, alto: h, rgba };
    }
}

// Hash determinista para "ruido" reproducible (suciedad, remaches, variación)
export function ruido(x, y, semilla = 0) {
    let h = (x * 374761393 + y * 668265263 + semilla * 2246822519) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
