// Paleta oficial del juego. Fuente de verdad: todo asset usa solo estos colores.
// Cada color se identifica con un carácter, que es el que se usa en los
// sprites dibujados como texto. '.' es transparente.

export const PALETA = {
    // Grises azulados: estructura, metal, sombra (de negro a casi blanco)
    '0': '#07080b',
    '1': '#101319',
    '2': '#1a1f28',
    '3': '#262d39',
    '4': '#36404f',
    '5': '#4b5768',
    '6': '#667386',
    '7': '#8794a6',
    '8': '#b4bfcc',
    '9': '#e4eaf0',

    // Óxido: suciedad, metal viejo, tela
    'a': '#2a1a16',
    'b': '#4a2c22',
    'c': '#73432e',
    'd': '#a0643f',

    // Cian: luz artificial, pantallas, energía (acento principal, usar con moderación)
    'e': '#0f3a44',
    'f': '#1f6f7a',
    'g': '#47c2c9',
    'h': '#b8fbff',

    // Rojo: alerta, peligro, enemigos (acento secundario, muy escaso)
    'i': '#5a1418',
    'j': '#b3262a',

    // Piel
    'k': '#c9a48f',
    'l': '#8a6a5c'
};

export const TRANSPARENTE = '.';

// Rampas de sombreado, de oscuro a claro. oscurecer/aclarar y degradados
// recorren una rampa sin salirse de ella (en los extremos se quedan igual).
export const RAMPAS = [
    '0123456789',   // grises azulados
    'abcd',         // óxido
    'efgh',         // cian
    'ij',           // rojo
    'lk'            // piel
];

// Color a `pasos` de distancia dentro de su rampa (negativo = más oscuro)
export function tonoVecino(c, pasos) {
    const rampa = RAMPAS.find(r => r.includes(c));
    if (!rampa) return c;
    const i = Math.max(0, Math.min(rampa.length - 1, rampa.indexOf(c) + pasos));
    return rampa[i];
}

export function hexARgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// Mapa "r,g,b" -> carácter, para validar imágenes
export const RGB_A_CARACTER = new Map(
    Object.entries(PALETA).map(([car, hex]) => [hexARgb(hex).join(','), car])
);
