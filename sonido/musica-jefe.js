// Música del jefe (alternativa generada a audio/capitulo-01/jefe.mp3). Bucle de 32 s a 120 BPM: 16 compases
// de 4/4. Industrial y minimalista: bombo saturado, golpes de chapa en 2 y 4, siseos de vapor en
// corcheas, bajo ostinato en semicorcheas en Re frigio (el Mi bemol da la tensión) y un dron que crece.
// Compases 1-8: bombo en 1 y 3. Compases 9-16: bombo en cada pulso y un agudo disonante encima.
import { nota, ruido, oscilador, metal, golpe, envolvente, mezclar, ganancia, pasoBajo, pasoAlto, pasoBanda, saturar, reverb, plegar, bucleCruzado, enBucle, normalizar, lfo, rampa } from '../tools/sonido/sintesis.js';

const BPM = 120;
const PULSO = 60 / BPM;
const COMPASES = 16;
const D = COMPASES * 4 * PULSO;
const RE = 38;
// Bajo por compás (semicorcheas, en semitonos sobre Re2): insistente con el Mi bemol (1) como tensión
const OSTINATO = [0, 0, 12, 0, 1, 0, 12, 0, 0, 0, 12, 0, 3, 1, 0, -2];

const bombo = golpe(saturar(mezclar([
    [oscilador(0.4, { frecuencia: rampa(130, 42, 0.07) }), 1],
    [pasoAlto(ruido(0.01, { semilla: 500 }), 2000), 0.3]
]), 3), { ataque: 0.001, tau: 0.12 });
const chapa = golpe(pasoAlto(mezclar([
    [metal(0.6, { frecuencia: 310, decaimiento: 0.3, brillo: 0.6, semilla: 501 }), 0.8],
    [pasoBanda(ruido(0.3, { semilla: 502 }), 1800, 0.8), 0.7]
]), 150), { ataque: 0.001, tau: 0.1 });
const siseo = semilla => golpe(pasoAlto(ruido(0.06, { semilla }), 6000), { ataque: 0.001, tau: 0.02 });
const bajo = (midi, semilla) => golpe(pasoBajo(saturar(mezclar([
    [oscilador(0.25, { forma: 'sierra', frecuencia: nota(midi) }), 1],
    [oscilador(0.25, { forma: 'cuadrada', frecuencia: nota(midi) * 1.005 }), 0.4]
]), 2), rampa(1400 + semilla % 3 * 200, 250, 0.12)), { ataque: 0.002, tau: 0.08 });

function percusion() {
    const pistas = [], sala = [];
    for (let c = 0; c < COMPASES; c++) {
        for (let p = 0; p < 4; p++) {
            const t = (c * 4 + p) * PULSO;
            if (c >= 8 || p % 2 === 0) pistas.push([bombo, 0.9, t]);
            if (p % 2 === 1) sala.push([chapa, c >= 8 ? 0.6 : 0.45, t]);
            pistas.push([siseo(510 + p), p % 2 ? 0.12 : 0.07, t + PULSO / 2]);
        }
    }
    const golpes = reverb(mezclar(sala, D), { tamano: 0.9, mezcla: 0.4, cola: 2 });
    return plegar(mezclar([[mezclar(pistas, D), 1], [golpes, 1]]), D);
}

function lineaBajo() {
    const pistas = [];
    for (let c = 0; c < COMPASES; c++) {
        OSTINATO.forEach((s, i) => pistas.push([bajo(RE + s, i), i % 4 === 0 ? 0.55 : 0.4, (c * 4 + i / 4) * PULSO]));
    }
    return plegar(mezclar(pistas, D + 1), D);
}

function dron() {
    const d = D + 2;
    const grave = pasoBajo(mezclar([
        [oscilador(d, { forma: 'sierra', frecuencia: nota(RE - 12) }), 1],
        [oscilador(d, { forma: 'sierra', frecuencia: nota(RE - 12) * 1.006 }), 1]
    ]), lfo(300, 150, 1 / 8));
    // Agudo disonante (Re5 y Mi bemol 5) que solo suena en la segunda mitad, con temblor
    const agudo = envolvente(ganancia(mezclar([
        [oscilador(d, { frecuencia: nota(RE + 36) }), 1],
        [oscilador(d, { frecuencia: nota(RE + 37) }), 0.7]
    ]), lfo(0.7, 0.3, 6)), [[0, 0], [D / 2 - 0.5, 0], [D / 2 + 2, 1], [D - 0.3, 1], [D, 0]]);
    return bucleCruzado(mezclar([[grave, 0.3], [agudo, 0.05]]), D, 2);
}

export default {
    nombre: 'musica-jefe',
    tipo: 'musica',
    bucle: true,
    volumen: 1,
    generar: () => normalizar(enBucle(mezclar([[percusion(), 1], [lineaBajo(), 0.7], [dron(), 1]]), s => pasoAlto(s, 25)), 0.9)
};
