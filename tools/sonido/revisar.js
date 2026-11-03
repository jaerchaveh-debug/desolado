// Revisa los WAV generados contra la guía de sonido (skill sonido).
//
//   npm run sonido:revisar
//
// Comprueba por sonido del manifiesto: que existan sus archivos, saturación (pico al tope),
// desplazamiento de continua, silencio al empezar (latencia en efectos), chasquido al final,
// empalme de los bucles, duración según el tipo y volumen medio (RMS) para equilibrar la mezcla.

import fs from 'node:fs';
import path from 'node:path';
import { decodificarWAV } from './wav.js';

const RAIZ = path.resolve(import.meta.dirname, '../..');
const MANIFIESTO = path.join(RAIZ, 'src/assets/sonidos.json');
const DURACION_MAX = { efecto: 6, ambiente: 120, musica: 300 };

const db = v => (v > 0 ? 20 * Math.log10(v) : -Infinity);

function analizar(nombre, datos, archivo) {
    const problemas = [];
    const { frecuencia, muestras: s } = decodificarWAV(fs.readFileSync(path.join(RAIZ, 'public', archivo)));
    const dur = s.length / frecuencia;
    let pico = 0, suma = 0, media = 0;
    for (const v of s) { pico = Math.max(pico, Math.abs(v)); suma += v * v; media += v; }
    const rms = Math.sqrt(suma / s.length);
    media /= s.length;

    if (pico >= 0.999) problemas.push(`saturado (pico ${pico.toFixed(3)})`);
    if (pico < 0.1) problemas.push(`muy bajo (pico ${db(pico).toFixed(1)} dB): normaliza y ajusta 'volumen'`);
    if (Math.abs(media) > 0.02) problemas.push(`desplazamiento de continua ${media.toFixed(3)}: aplica pasoAlto(s, 20)`);
    if (dur > DURACION_MAX[datos.tipo]) problemas.push(`dura ${dur.toFixed(1)} s (máx. ${DURACION_MAX[datos.tipo]} s para ${datos.tipo})`);

    if (datos.tipo === 'efecto') {
        // El primer sonido audible debe llegar enseguida o el efecto se sentirá retrasado
        const umbral = pico * 0.1;
        const inicio = s.findIndex(v => Math.abs(v) > umbral) / frecuencia;
        if (inicio > 0.03) problemas.push(`empieza tras ${(inicio * 1000).toFixed(0)} ms de silencio`);
    }
    if (datos.bucle) {
        const salto = Math.abs(s[s.length - 1] - s[0]);
        if (salto > 0.05) problemas.push(`el bucle no empalma (salto ${salto.toFixed(3)} entre el final y el inicio): usa plegar()`);
    } else {
        const fin = Math.abs(s[s.length - 1]);
        if (fin > 0.01) problemas.push(`termina en ${fin.toFixed(3)}, no en silencio (chasquido): usa fundido()`);
    }
    return { dur, pico, rms, problemas };
}

if (!fs.existsSync(MANIFIESTO)) {
    console.error('No hay manifiesto: ejecuta npm run sonido');
    process.exit(1);
}
const manifiesto = JSON.parse(fs.readFileSync(MANIFIESTO, 'utf8'));
let conProblemas = 0, total = 0;
for (const [nombre, datos] of Object.entries(manifiesto)) {
    for (const archivo of datos.archivos) {
        total++;
        if (!fs.existsSync(path.join(RAIZ, 'public', archivo))) {
            conProblemas++;
            console.log(`✗ ${archivo}: no existe`);
            continue;
        }
        const r = analizar(nombre, datos, archivo);
        const resumen = `${r.dur.toFixed(2)} s · pico ${db(r.pico).toFixed(1)} dB · RMS ${db(r.rms).toFixed(1)} dB · volumen ${datos.volumen}`;
        if (r.problemas.length) {
            conProblemas++;
            console.log(`✗ ${archivo} (${resumen})`);
            r.problemas.forEach(p => console.log(`    - ${p}`));
        } else console.log(`✓ ${archivo} (${resumen})`);
    }
}
console.log(`\n${total} archivo(s), ${conProblemas} con problemas`);
process.exit(conProblemas ? 1 : 0);
