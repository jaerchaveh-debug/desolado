// Genera los WAV del juego a partir de las definiciones en sonido/*.js
//
//   npm run sonido               -> genera todo
//   npm run sonido jefe-rugido   -> solo sonido/jefe-rugido.js
//
// Salidas:
//   public/assets/sonidos/<nombre>.wav (o <nombre>-<n>.wav con variantes)
//   src/assets/sonidos.json               manifiesto que leen PreloadScene y sistema/sonido.js
//   sonido/preview/<nombre>.png           onda y espectrograma (solo para revisar; ignorado por git)

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { codificarWAV } from './wav.js';
import { FM } from './sintesis.js';
import { espectrograma } from './espectro.js';
import { codificarPNG } from '../pixel/png.js';

const RAIZ = path.resolve(import.meta.dirname, '../..');
const DIR_FUENTE = path.join(RAIZ, 'sonido');
const DIR_SALIDA = path.join(RAIZ, 'public/assets/sonidos');
const DIR_PREVIEW = path.join(DIR_FUENTE, 'preview');
const MANIFIESTO = path.join(RAIZ, 'src/assets/sonidos.json');
const TIPOS = ['efecto', 'ambiente', 'musica'];

async function generar(archivo) {
    const def = (await import(pathToFileURL(archivo).href)).default;
    const { nombre, tipo = 'efecto', variantes = 1, bucle = false, volumen = 1 } = def;
    if (nombre !== path.basename(archivo, '.js')) throw new Error(`el nombre '${nombre}' no coincide con el archivo`);
    if (!TIPOS.includes(tipo)) throw new Error(`tipo '${tipo}' desconocido (${TIPOS.join(', ')})`);

    const archivos = [], señales = [];
    for (let v = 0; v < variantes; v++) {
        const s = def.generar(v);
        if (!(s instanceof Float32Array) || s.length === 0) throw new Error(`la variante ${v} no es una señal (Float32Array)`);
        if (s.some(Number.isNaN)) throw new Error(`la variante ${v} contiene NaN`);
        const fichero = variantes > 1 ? `${nombre}-${v}.wav` : `${nombre}.wav`;
        fs.writeFileSync(path.join(DIR_SALIDA, fichero), codificarWAV(s, FM));
        archivos.push(`assets/sonidos/${fichero}`);
        señales.push(s);
    }

    const { ancho, alto, rgba } = espectrograma(señales);
    fs.writeFileSync(path.join(DIR_PREVIEW, `${nombre}.png`), codificarPNG(ancho, alto, rgba));

    const dur = Math.max(...señales.map(s => s.length)) / FM;
    console.log(`✓ ${nombre}: ${tipo}, ${variantes} variante(s), ${dur.toFixed(2)} s${bucle ? ', bucle' : ''}`);
    return { tipo, archivos, bucle, volumen, duracion: Number(dur.toFixed(3)) };
}

const filtro = process.argv[2];
fs.mkdirSync(DIR_SALIDA, { recursive: true });
fs.mkdirSync(DIR_PREVIEW, { recursive: true });

const manifiesto = fs.existsSync(MANIFIESTO) ? JSON.parse(fs.readFileSync(MANIFIESTO, 'utf8')) : {};
const archivos = fs.readdirSync(DIR_FUENTE)
    .filter(f => f.endsWith('.js'))
    .filter(f => !filtro || f === `${filtro}.js`);

if (archivos.length === 0) {
    console.error(filtro ? `No existe sonido/${filtro}.js` : 'No hay definiciones en sonido/');
    process.exit(1);
}

let errores = 0;
for (const f of archivos) {
    const nombre = path.basename(f, '.js');
    try {
        // Borra los WAV anteriores del sonido (pueden haber cambiado las variantes)
        for (const viejo of fs.readdirSync(DIR_SALIDA).filter(w => w === `${nombre}.wav` || new RegExp(`^${nombre}-\\d+\\.wav$`).test(w))) {
            fs.unlinkSync(path.join(DIR_SALIDA, viejo));
        }
        manifiesto[nombre] = await generar(path.join(DIR_FUENTE, f));
    } catch (e) {
        errores++;
        console.error(`✗ ${f}: ${e.message}`);
    }
}

// Quitar del manifiesto lo que ya no tiene definición
for (const nombre of Object.keys(manifiesto)) {
    if (!fs.existsSync(path.join(DIR_FUENTE, `${nombre}.js`))) delete manifiesto[nombre];
}

fs.writeFileSync(MANIFIESTO, JSON.stringify(manifiesto, null, 2) + '\n');
process.exit(errores ? 1 : 0);
