// Ambiente del pasillo (bucle de 40 s bajo la música): la megaestructura nunca está en silencio.
// Zumbido eléctrico de 50 Hz y retumbo grave de maquinaria, una prensa lejana que golpea con un ritmo
// lento e irregular, chapas que crujen a lo lejos con eco, y escapes de vapor ocasionales.
import { azar, ruido, oscilador, metal, golpe, envolvente, mezclar, ganancia, pasoBajo, pasoAlto, pasoBanda, eco, reverb, plegar, bucleCruzado, enBucle, normalizar, lfo } from '../tools/sonido/sintesis.js';

const D = 40;
const SOLAPE = 2;

// Capas continuas: zumbido de la red eléctrica y retumbo de la maquinaria
function fondo() {
    const d = D + SOLAPE;
    const zumbido = mezclar([
        [oscilador(d, { frecuencia: 50 }), 0.5],
        [oscilador(d, { frecuencia: 100 }), 0.3],
        [oscilador(d, { frecuencia: 150.4 }), 0.12]
    ]);
    const retumbo = pasoBajo(ruido(d, { color: 'marron', semilla: 300 }), 160);
    const aire = pasoBanda(ruido(d, { color: 'rosa', semilla: 301 }), lfo(700, 300, 1 / 20), 0.6);
    // Ritmos lentos que completan ciclos enteros en los 40 s
    return bucleCruzado(mezclar([[ganancia(zumbido, lfo(0.6, 0.25, 1 / 10)), 0.35], [retumbo, 1], [aire, 0.12]]), D, SOLAPE);
}

// Capas de eventos: prensa lejana, crujidos metálicos y vapor (sus colas se pliegan al inicio)
function eventos() {
    const r = azar(310);
    const pistas = [];
    // Prensa: dos golpes graves cada ~3,3 s, a veces se salta uno
    for (let t = 0.5; t < D; t += 3.3 + r() * 0.4) {
        if (r() < 0.2) continue;
        const prensa = golpe(pasoBajo(mezclar([
            [oscilador(0.8, { frecuencia: 55 }), 1],
            [metal(0.8, { frecuencia: 140, decaimiento: 0.4, brillo: 0.3, semilla: Math.floor(t) }), 0.4]
        ]), 350), { ataque: 0.004, tau: 0.18 });
        pistas.push([prensa, 0.5, t], [prensa, 0.3, t + 0.42]);
    }
    // Crujidos y golpes de chapa lejanos
    for (let i = 0; i < 9; i++) {
        const chapa = golpe(metal(1.2, { frecuencia: 160 + r() * 500, decaimiento: 0.8, brillo: 0.4, semilla: 320 + i }), { ataque: 0.01, tau: 0.4 });
        pistas.push([pasoBajo(chapa, 1400), 0.18 + r() * 0.15, r() * D]);
    }
    // Escapes de vapor
    for (let i = 0; i < 3; i++) {
        const vapor = envolvente(pasoAlto(ruido(3, { color: 'rosa', semilla: 330 + i }), 1800), [[0, 0], [0.4, 1], [2, 0.6], [3, 0]]);
        pistas.push([vapor, 0.07, 5 + i * 12 + r() * 6]);
    }
    const seco = mezclar(pistas, D);
    const lejos = reverb(eco(seco, { retardo: 0.55, realimentacion: 0.5, mezcla: 0.45, cola: 3, corte: 900 }), { tamano: 0.97, amortiguacion: 0.6, mezcla: 0.5, cola: 4 });
    return plegar(lejos, D);
}

export default {
    nombre: 'ambiente-pasillo',
    tipo: 'ambiente',
    bucle: true,
    volumen: 0.45,
    generar: () => normalizar(enBucle(mezclar([[fondo(), 0.6], [eventos(), 1]]), s => pasoAlto(s, 25)), 0.8)
};
