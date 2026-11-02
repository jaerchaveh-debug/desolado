// Revisa los PNG del juego contra la guía de arte.
//
//   npm run arte:revisar                 -> revisa public/assets/**/*.png
//   npm run arte:revisar ruta/a/img.png  -> revisa un archivo concreto
//
// Comprueba: colores fuera de la paleta, alfa parcial (suavizado),
// dimensiones que no encajan con el manifiesto o con la rejilla de 16 px,
// y sprites ampliados (bloques de píxeles repetidos).

import fs from 'node:fs';
import path from 'node:path';
import { decodificarPNG } from './png.js';
import { RGB_A_CARACTER } from './paleta.js';

const RAIZ = path.resolve(import.meta.dirname, '../..');
const MANIFIESTO = path.join(RAIZ, 'src/assets/sprites.json');
const REJILLA = 16;

function buscarPNG(dir) {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
        const p = path.join(dir, e.name);
        return e.isDirectory() ? buscarPNG(p) : e.name.endsWith('.png') ? [p] : [];
    });
}

// Si todos los bloques de n x n son de un solo color, la imagen está ampliada x n
function factorAmpliacion(ancho, alto, rgba) {
    const igual = (a, b) =>
        rgba[a] === rgba[b] && rgba[a + 1] === rgba[b + 1] && rgba[a + 2] === rgba[b + 2] && rgba[a + 3] === rgba[b + 3];
    for (let n = 8; n >= 2; n--) {
        if (ancho % n || alto % n) continue;
        let ok = true;
        for (let y = 0; y < alto && ok; y++) {
            for (let x = 0; x < ancho && ok; x++) {
                const base = ((y - y % n) * ancho + (x - x % n)) * 4;
                if (!igual((y * ancho + x) * 4, base)) ok = false;
            }
        }
        if (ok) return n;
    }
    return 1;
}

function revisar(archivo, manifiesto) {
    const rel = path.relative(RAIZ, archivo).replaceAll('\\', '/');
    const problemas = [];
    let img;
    try {
        img = decodificarPNG(fs.readFileSync(archivo));
    } catch (e) {
        return { rel, problemas: [`no se puede leer: ${e.message}`] };
    }
    const { ancho, alto, rgba } = img;

    const fuera = new Map();
    let alfaParcial = 0, opacos = 0;
    for (let i = 0; i < ancho * alto; i++) {
        const a = rgba[i * 4 + 3];
        if (a === 0) continue;
        if (a !== 255) { alfaParcial++; continue; }
        opacos++;
        const clave = `${rgba[i * 4]},${rgba[i * 4 + 1]},${rgba[i * 4 + 2]}`;
        if (!RGB_A_CARACTER.has(clave)) fuera.set(clave, (fuera.get(clave) ?? 0) + 1);
    }

    if (alfaParcial) problemas.push(`${alfaParcial} píxel(es) con alfa parcial (bordes suavizados): el alfa debe ser 0 o 255`);
    if (fuera.size) {
        const top = [...fuera].sort((a, b) => b[1] - a[1]).slice(0, 5)
            .map(([rgb, n]) => `rgb(${rgb}) x${n}`).join(', ');
        problemas.push(`${fuera.size} color(es) fuera de la paleta: ${top}${fuera.size > 5 ? ', …' : ''}`);
    }
    if (opacos === ancho * alto) problemas.push('sin transparencia: el fondo debe ser transparente (salvo tiles de relleno)');

    const n = factorAmpliacion(ancho, alto, rgba);
    if (n > 1) problemas.push(`parece ampliado x${n}: exportar a tamaño nativo`);

    const entrada = Object.values(manifiesto).find(m => rel.endsWith(m.archivo));
    if (entrada) {
        if (alto !== entrada.alto || ancho !== entrada.ancho * entrada.frames) {
            problemas.push(`mide ${ancho}x${alto}, el manifiesto espera ${entrada.ancho * entrada.frames}x${entrada.alto}`);
        }
        if (entrada.tipo === 'tileset' && (entrada.ancho !== REJILLA || entrada.alto !== REJILLA)) {
            problemas.push(`tiles de ${entrada.ancho}x${entrada.alto}, la rejilla es ${REJILLA}x${REJILLA}`);
        }
    } else {
        problemas.push('no está en el manifiesto (no se generó con npm run arte)');
    }

    return { rel, ancho, alto, problemas };
}

const manifiesto = fs.existsSync(MANIFIESTO) ? JSON.parse(fs.readFileSync(MANIFIESTO, 'utf8')) : {};
const archivos = process.argv[2] ? [path.resolve(process.argv[2])] : buscarPNG(path.join(RAIZ, 'public/assets'));

let conProblemas = 0;
for (const a of archivos) {
    const r = revisar(a, manifiesto);
    if (r.problemas.length) {
        conProblemas++;
        console.log(`✗ ${r.rel}${r.ancho ? ` (${r.ancho}x${r.alto})` : ''}`);
        r.problemas.forEach(p => console.log(`    - ${p}`));
    } else {
        console.log(`✓ ${r.rel} (${r.ancho}x${r.alto})`);
    }
}
console.log(`\n${archivos.length} archivo(s), ${conProblemas} con problemas`);
process.exit(conProblemas ? 1 : 0);
