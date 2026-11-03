// Música de exploración (alternativa generada a audio/capitulo-01/ambiente.ogg). Bucle de 64 s en Re menor.
// Oscura y minimalista: un dron grave de sierras que respira con el filtro, un latido sordo cada 4 s
// como una máquina lejana, tonos fríos y aislados que se pierden en una reverberación inmensa,
// y un viento metálico de fondo.
import { azar, nota, ruido, oscilador, envolvente, golpe, mezclar, ganancia, pasoBajo, pasoAlto, pasoBanda, resonador, eco, reverb, plegar, bucleCruzado, enBucle, normalizar, lfo, rampa } from '../tools/sonido/sintesis.js';

const D = 64;
const SOLAPE = 4;
const RE = 38;   // Re2 (MIDI)

function dron() {
    const d = D + SOLAPE;
    const sierras = mezclar([
        [oscilador(d, { forma: 'sierra', frecuencia: nota(RE) }), 1],
        [oscilador(d, { forma: 'sierra', frecuencia: nota(RE) * 1.004 }), 0.9],
        [oscilador(d, { forma: 'sierra', frecuencia: nota(RE - 12) }), 0.6],
        // La quinta entra y sale lentamente (un ciclo cada 32 s)
        [ganancia(oscilador(d, { forma: 'sierra', frecuencia: nota(RE + 7) * 0.998 }), lfo(0.25, 0.25, 1 / 32)), 1]
    ]);
    const respiracion = pasoBajo(sierras, lfo(380, 220, 1 / 16), 1.4);
    const viento = resonador(pasoBanda(ruido(d, { color: 'rosa', semilla: 400 }), lfo(900, 500, 1 / 64), 0.8), nota(RE + 24), 0.6, 0);
    return bucleCruzado(mezclar([[respiracion, 0.35], [viento.slice(0, respiracion.length), 0.06]]), D, SOLAPE);
}

function eventos() {
    const r = azar(410);
    const pistas = [];
    // Latido de máquina cada 4 s
    for (let t = 0; t < D; t += 4) {
        pistas.push([golpe(oscilador(1, { frecuencia: rampa(52, 34, 0.3) }), { ataque: 0.01, tau: 0.25 }), 0.5, t]);
    }
    // Tonos fríos: notas de Re menor en el registro agudo, con ataque y caída lentos
    const escala = [62, 65, 69, 72, 74, 77];
    for (let t = 3; t < D - 2; t += 6 + r() * 5) {
        const midi = escala[Math.floor(r() * escala.length)];
        const tono = envolvente(mezclar([
            [oscilador(5, { frecuencia: nota(midi) }), 1],
            [oscilador(5, { forma: 'triangulo', frecuencia: nota(midi) * 2.003 }), 0.15]
        ]), [[0, 0], [1.5, 1], [5, 0]]);
        pistas.push([tono, 0.12, t]);
    }
    const seco = mezclar(pistas, D);
    const espacio = reverb(eco(seco, { retardo: 0.75, realimentacion: 0.5, mezcla: 0.4, cola: 4, corte: 1800 }), { tamano: 0.98, amortiguacion: 0.5, mezcla: 0.55, cola: 6 });
    return plegar(espacio, D);
}

export default {
    nombre: 'musica-ambiente',
    tipo: 'musica',
    bucle: true,
    volumen: 1,
    generar: () => normalizar(enBucle(mezclar([[dron(), 1], [eventos(), 1]]), s => pasoAlto(s, 25)), 0.85)
};
