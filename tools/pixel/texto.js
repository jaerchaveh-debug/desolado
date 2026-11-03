// Vuelca un sprite como texto con los caracteres de la paleta, para revisar
// píxel a píxel (posiciones exactas, colores) sin depender de la vista previa.
//
//   npm run arte:texto jugador        -> todos los frames
//   npm run arte:texto jugador 3      -> solo el frame 3
//   npm run arte:texto jugador 3 5    -> frames 3 a 5, uno al lado del otro

import path from 'node:path';
import { pathToFileURL } from 'node:url';

const RAIZ = path.resolve(import.meta.dirname, '../..');
const [nombre, desde, hasta] = process.argv.slice(2);

if (!nombre) {
    console.error('Uso: npm run arte:texto <nombre> [frame] [hasta]');
    process.exit(1);
}

const def = (await import(pathToFileURL(path.join(RAIZ, 'arte', `${nombre}.js`)).href)).default;
const frames = def.frames();
const a = desde === undefined ? 0 : Number(desde);
const b = hasta !== undefined ? Number(hasta) : desde !== undefined ? a : frames.length - 1;
const elegidos = frames.slice(a, b + 1);

// Regla de columnas (unidades) para localizar coordenadas
const regla = Array.from({ length: def.ancho }, (_, x) => x % 10).join('');
console.log(`${nombre}: frames ${a}-${b} de ${def.ancho}x${def.alto}`);
console.log('    ' + elegidos.map(() => regla).join('  '));
for (let y = 0; y < def.alto; y++) {
    console.log(String(y).padStart(3) + ' ' + elegidos.map(f => f.px[y].join('')).join('  '));
}
