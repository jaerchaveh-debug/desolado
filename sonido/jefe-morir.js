// Muerte del estibador: el motor se ahoga bajando de tono, estallido interno, piezas que caen
// y el cuerpo desplomándose. Larga cola de nave inmensa que se apaga.
import { azar, ruido, oscilador, metal, golpe, envolvente, mezclar, pasoBajo, saturar, reverb, fundido, normalizar, rampa } from '../tools/sonido/sintesis.js';

export default {
    nombre: 'jefe-morir',
    volumen: 0.9,
    generar: () => {
        const r = azar(250);
        const motor = envolvente(pasoBajo(saturar(mezclar([
            [oscilador(2.2, { forma: 'sierra', frecuencia: rampa(70, 18, 2) }), 1],
            [oscilador(2.2, { forma: 'sierra', frecuencia: rampa(72, 19, 2) }), 0.8]
        ]), 3), rampa(1500, 150, 2)), [[0, 1], [1.8, 0.4], [2.2, 0]]);
        const estallido = golpe(pasoBajo(ruido(1, { semilla: 251 }), rampa(6000, 300, 0.4)), { ataque: 0.001, tau: 0.2 });
        const piezas = Array.from({ length: 6 }, (_, i) => [
            golpe(metal(0.7, { frecuencia: 300 + r() * 700, decaimiento: 0.3, brillo: 0.5, semilla: 252 + i }), { tau: 0.12 }),
            0.25 + r() * 0.3, 0.3 + r() * 1.2
        ]);
        const desplome = golpe(oscilador(1, { frecuencia: rampa(65, 25, 0.4) }), { ataque: 0.002, tau: 0.3 });
        const seco = mezclar([[motor, 0.6], [estallido, 0.9], ...piezas, [desplome, 1, 1.6]]);
        return fundido(normalizar(reverb(seco, { tamano: 0.97, amortiguacion: 0.5, mezcla: 0.35, cola: 3 })), 0.001, 1.5);
    }
};
