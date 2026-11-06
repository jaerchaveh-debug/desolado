// Genera los PNG del juego a partir de las definiciones en arte/*.js
//
//   npm run arte            -> genera todo
//   npm run arte jugador    -> genera solo arte/jugador.js
//
// Salidas:
//   public/assets/sprites/<nombre>.png   hoja de sprites horizontal a tamaño nativo
//   src/assets/sprites.json              manifiesto que lee PreloadScene
//   arte/preview/<nombre>.png            vista ampliada x4 sobre fondo neutro (solo para revisar)
//   public/assets/sprites/<nombre>.tsj   (solo tilesets) tileset de Tiled para editar niveles
//
// El juego va a 960x540. Las definiciones con `hd: true` se dibujan ya a ese tamaño; las demás son
// arte antiguo pensado para 480x270 y se amplían x2 con Scale2x (quedan como `ampliado` en el
// manifiesto: es la lista de lo que falta por redibujar).

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { codificarPNG } from './png.js';
import { Lienzo } from './lienzo.js';

const RAIZ = path.resolve(import.meta.dirname, '../..');
const DIR_ARTE = path.join(RAIZ, 'arte');
const DIR_SALIDA = path.join(RAIZ, 'public/assets/sprites');
const DIR_PREVIEW = path.join(DIR_ARTE, 'preview');
const MANIFIESTO = path.join(RAIZ, 'src/assets/sprites.json');

const ESCALA_PREVIEW = 4;
const FONDO_PREVIEW = [58, 58, 64];
const SEPARACION_PREVIEW = 2; // píxeles nativos entre frames en la vista previa

function hoja(frames, ancho, alto, separacion = 0) {
    const l = new Lienzo(frames.length * (ancho + separacion) - separacion, alto);
    frames.forEach((f, i) => l.pegar(f, i * (ancho + separacion), 0));
    return l;
}

function preview(lienzo) {
    const { ancho, alto, rgba } = lienzo.aRGBA(ESCALA_PREVIEW);
    for (let i = 0; i < ancho * alto; i++) {
        if (rgba[i * 4 + 3] === 0) rgba.set([...FONDO_PREVIEW, 255], i * 4);
    }
    return codificarPNG(ancho, alto, rgba);
}

// Tileset en formato Tiled (JSON) para abrirlo desde el editor Tiled.
// Phaser no admite tilesets externos: al guardar el mapa, Tiled debe incrustarlo.
function tilesetTiled(def, ancho, alto, n) {
    const tipoValor = v => typeof v === 'boolean' ? 'bool' : typeof v === 'number' ? 'float' : 'string';
    return {
        type: 'tileset',
        name: def.nombre,
        image: `${def.nombre}.png`,
        imagewidth: ancho * n,
        imageheight: alto,
        tilewidth: ancho,
        tileheight: alto,
        tilecount: n,
        columns: n,
        margin: 0,
        spacing: 0,
        tiles: Object.entries(def.propiedades ?? {}).map(([id, props]) => ({
            id: Number(id),
            properties: Object.entries(props).map(([name, value]) => ({ name, type: tipoValor(value), value }))
        }))
    };
}

async function generar(archivo) {
    const def = (await import(pathToFileURL(archivo).href)).default;
    const { nombre } = def;
    const originales = def.frames();

    originales.forEach((f, i) => {
        if (!(f instanceof Lienzo) || f.ancho !== def.ancho || f.alto !== def.alto) {
            throw new Error(`${nombre}: el frame ${i} no es un Lienzo de ${def.ancho}x${def.alto}`);
        }
    });

    const frames = def.hd ? originales : originales.map(f => f.ampliado());
    const ancho = frames[0].ancho, alto = frames[0].alto;

    const h = hoja(frames, ancho, alto);
    const { rgba } = h.aRGBA();
    fs.writeFileSync(path.join(DIR_SALIDA, `${nombre}.png`), codificarPNG(h.ancho, h.alto, rgba));
    fs.writeFileSync(path.join(DIR_PREVIEW, `${nombre}.png`), preview(hoja(frames, ancho, alto, SEPARACION_PREVIEW)));

    if (def.tipo === 'tileset') {
        fs.writeFileSync(path.join(DIR_SALIDA, `${nombre}.tsj`), JSON.stringify(tilesetTiled(def, ancho, alto, frames.length), null, 2) + '\n');
    }

    console.log(`✓ ${nombre}: ${frames.length} frame(s) de ${ancho}x${alto}`);

    return {
        archivo: `assets/sprites/${nombre}.png`,
        ancho,
        alto,
        frames: frames.length,
        tipo: def.tipo ?? 'sprite',
        ampliado: !def.hd,
        animaciones: def.animaciones ?? {},
        propiedades: def.propiedades ?? {},
        caracteres: def.caracteres   // solo fuentes (se omite en el JSON si no existe)
    };
}

const filtro = process.argv[2];
fs.mkdirSync(DIR_SALIDA, { recursive: true });
fs.mkdirSync(DIR_PREVIEW, { recursive: true });
fs.mkdirSync(path.dirname(MANIFIESTO), { recursive: true });

const manifiesto = fs.existsSync(MANIFIESTO) ? JSON.parse(fs.readFileSync(MANIFIESTO, 'utf8')) : {};
const archivos = fs.readdirSync(DIR_ARTE)
    .filter(f => f.endsWith('.js'))
    .filter(f => !filtro || f === `${filtro}.js`);

if (archivos.length === 0) {
    console.error(filtro ? `No existe arte/${filtro}.js` : 'No hay definiciones en arte/');
    process.exit(1);
}

let errores = 0;
for (const f of archivos) {
    try {
        const nombre = path.basename(f, '.js');
        manifiesto[nombre] = await generar(path.join(DIR_ARTE, f));
    } catch (e) {
        errores++;
        console.error(`✗ ${f}: ${e.message}`);
    }
}

// Quitar del manifiesto lo que ya no tiene definición
for (const nombre of Object.keys(manifiesto)) {
    if (!fs.existsSync(path.join(DIR_ARTE, `${nombre}.js`))) delete manifiesto[nombre];
}

fs.writeFileSync(MANIFIESTO, JSON.stringify(manifiesto, null, 2) + '\n');
process.exit(errores ? 1 : 0);
