// Lienzo de pixel art: una rejilla de caracteres de la paleta.
// Permite dibujar con texto (filas de caracteres) o con primitivas.

import { PALETA, TRANSPARENTE, hexARgb, tonoVecino } from './paleta.js';

// Matriz de Bayer 4x4 para tramados ordenados (umbral 0-15)
const BAYER = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5]
];

// Umbral de tramado en (x, y), entre 0 y 1 (exclusivo). Usa coordenadas absolutas
// del lienzo para que zonas contiguas tramadas por separado casen sin costura.
export function umbralBayer(x, y) {
    return (BAYER[((y % 4) + 4) % 4][((x % 4) + 4) % 4] + 0.5) / 16;
}

// Zona: función (x, y) => bool, rectángulo { x, y, w, h } o nada (todo el lienzo)
function aPrueba(zona) {
    if (!zona) return () => true;
    if (typeof zona === 'function') return zona;
    return (x, y) => x >= zona.x && y >= zona.y && x < zona.x + zona.w && y < zona.y + zona.h;
}

// Prueba de punto dentro de polígono (regla par-impar) para puntos [[x, y], ...]
function dentroPoligono(puntos, x, y) {
    let dentro = false;
    for (let i = 0, j = puntos.length - 1; i < puntos.length; j = i++) {
        const [xi, yi] = puntos[i], [xj, yj] = puntos[j];
        if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) dentro = !dentro;
    }
    return dentro;
}

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

    color(x, y) {
        return x >= 0 && y >= 0 && x < this.ancho && y < this.alto ? this.px[y][x] : TRANSPARENTE;
    }

    // Formas ------------------------------------------------------------------

    // Pinta los píxeles del rectángulo (x, y, w, h) que cumplen `dentro(x, y)`.
    // Con borde: true, solo los que tienen algún vecino (4 direcciones) fuera.
    forma(x, y, w, h, dentro, c, { borde = false } = {}) {
        for (let j = y; j < y + h; j++) {
            for (let i = x; i < x + w; i++) {
                if (!dentro(i, j)) continue;
                if (borde && dentro(i - 1, j) && dentro(i + 1, j) && dentro(i, j - 1) && dentro(i, j + 1)) continue;
                this.px_(i, j, c);
            }
        }
        return this;
    }

    // Elipse rellena con centro (cx, cy) y radios rx, ry. Admite centros en .5
    // para formas de diámetro par. Opciones: { borde: true } solo el contorno.
    elipse(cx, cy, rx, ry, c, opciones) {
        const dentro = (x, y) => ((x - cx) / (rx + 0.5)) ** 2 + ((y - cy) / (ry + 0.5)) ** 2 <= 1;
        return this.forma(Math.floor(cx - rx), Math.floor(cy - ry), Math.ceil(2 * rx) + 2, Math.ceil(2 * ry) + 2, dentro, c, opciones);
    }

    circulo(cx, cy, r, c, opciones) { return this.elipse(cx, cy, r, r, c, opciones); }

    // Circunferencia de 1 px de grosor
    anillo(cx, cy, r, c) { return this.circulo(cx, cy, r, c, { borde: true }); }

    // Polígono relleno con vértices [[x, y], ...]; con { borde: true }, solo sus lados
    poligono(puntos, c, { borde = false } = {}) {
        const xs = puntos.map(p => p[0]), ys = puntos.map(p => p[1]);
        const x0 = Math.floor(Math.min(...xs)), y0 = Math.floor(Math.min(...ys));
        if (!borde) {
            this.forma(x0, y0, Math.ceil(Math.max(...xs)) - x0 + 1, Math.ceil(Math.max(...ys)) - y0 + 1,
                (x, y) => dentroPoligono(puntos, x, y), c);
        }
        puntos.forEach((p, i) => {
            const q = puntos[(i + 1) % puntos.length];
            this.linea(p[0], p[1], q[0], q[1], c);
        });
        return this;
    }

    // Relleno por inundación (4 direcciones) de la región del color que hay en (x, y)
    rellenar(x, y, c) {
        const original = this.color(x, y);
        if (original === c || x < 0 || y < 0 || x >= this.ancho || y >= this.alto) return this;
        const pila = [[x, y]];
        while (pila.length) {
            const [i, j] = pila.pop();
            if (this.color(i, j) !== original || i < 0 || j < 0 || i >= this.ancho || j >= this.alto) continue;
            this.px_(i, j, c);
            pila.push([i + 1, j], [i - 1, j], [i, j + 1], [i, j - 1]);
        }
        return this;
    }

    // Cable colgante de (x0, y0) a (x1, y1) que se comba `caida` px en el centro (parábola)
    cable(x0, y0, x1, y1, c, caida = 0) {
        const pasos = Math.max(Math.abs(x1 - x0), 1);
        let anterior = [x0, y0];
        for (let i = 1; i <= pasos; i++) {
            const t = i / pasos;
            const punto = [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t + caida * 4 * t * (1 - t)];
            this.linea(anterior[0], anterior[1], punto[0], punto[1], c);
            anterior = punto;
        }
        return this;
    }

    // Textura y tono -----------------------------------------------------------

    // Tramado ordenado (Bayer 4x4): pinta c en la proporción `densidad` (0-1) del área
    tramado(x, y, w, h, c, densidad = 0.5) {
        return this.patron(x, y, w, h, (i, j) => (umbralBayer(x + i, y + j) < densidad ? c : null));
    }

    // Degradado por bandas: `colores` de oscuro a claro (p. ej. '2345' o ['2', '3', '4']),
    // con las costuras entre bandas tramadas. Opciones:
    //   vertical (true: de arriba abajo; false: de izquierda a derecha)
    //   invertir (empieza por el último color)
    //   costura (ancho del tramado entre bandas, en fracción de banda; 0 = bandas limpias)
    //   zona (solo pinta donde la zona se cumple)
    degradado(x, y, w, h, colores, { vertical = true, invertir = false, costura = 0.5, zona } = {}) {
        const lista = [...colores];
        if (invertir) lista.reverse();
        const n = lista.length;
        const largo = vertical ? h : w;
        const prueba = aPrueba(zona);
        return this.patron(x, y, w, h, (i, j) => {
            if (!prueba(x + i, y + j)) return null;
            const t = ((vertical ? j : i) + 0.5) / largo;
            const pos = t * n + (umbralBayer(x + i, y + j) - 0.5) * costura;
            return lista[Math.max(0, Math.min(n - 1, Math.floor(pos)))];
        });
    }

    // Mueve `pasos` tonos dentro de su rampa (paleta.js: RAMPAS) cada píxel no
    // transparente de la zona. Negativo = más oscuro.
    tono(pasos, zona) {
        const prueba = aPrueba(zona);
        this.px.forEach((fila, y) => fila.forEach((c, x) => {
            if (c !== TRANSPARENTE && prueba(x, y)) fila[x] = tonoVecino(c, pasos);
        }));
        return this;
    }

    oscurecer(zona, pasos = 1) { return this.tono(-pasos, zona); }
    aclarar(zona, pasos = 1) { return this.tono(pasos, zona); }

    // Contorno exterior de color c alrededor de todo lo no transparente.
    // Con { diagonales: true } también toca las esquinas (contorno más grueso).
    contorno(c, { diagonales = false } = {}) {
        const opaco = (x, y) => this.color(x, y) !== TRANSPARENTE;
        const vecinos = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        if (diagonales) vecinos.push([1, 1], [1, -1], [-1, 1], [-1, -1]);
        const marcar = [];
        for (let y = 0; y < this.alto; y++) {
            for (let x = 0; x < this.ancho; x++) {
                if (!opaco(x, y) && vecinos.some(([dx, dy]) => opaco(x + dx, y + dy))) marcar.push([x, y]);
            }
        }
        marcar.forEach(([x, y]) => this.px_(x, y, c));
        return this;
    }

    // Copias y variantes ---------------------------------------------------------

    copia() {
        const l = new Lienzo(this.ancho, this.alto);
        l.px = this.px.map(fila => [...fila]);
        return l;
    }

    // Copia con colores sustituidos: recolor({ g: 'j', f: 'i' }) para variantes
    recolor(mapa) {
        const l = this.copia();
        l.px.forEach((fila, y) => fila.forEach((c, x) => {
            if (c in mapa) l.px_(x, y, mapa[c]);
        }));
        return l;
    }

    // Refleja la mitad izquierda sobre la derecha (dibujar solo media figura simétrica)
    simetrico() {
        const mitad = Math.floor(this.ancho / 2);
        this.px.forEach(fila => {
            for (let x = 0; x < mitad; x++) fila[this.ancho - 1 - x] = fila[x];
        });
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
