// Alarma de la emboscada del fondo del pozo: la megaestructura detecta al intruso. Sirena de dos tonos
// (Re y Do, a medio tono de la disonancia) en cuadrada saturada, áspera y metálica, que rebota por el
// pozo con eco largo. Tres ciclos (~1,8 s) y la cola; acompaña al texto rojo que parpadea.
import { oscilador, ruido, golpe, envolvente, mezclar, pasoBanda, pasoAlto, saturar, eco, reverb, fundido, normalizar, nota } from '../tools/sonido/sintesis.js';

const CICLO = 0.6;
const CICLOS = 3;
const DURACION = CICLO * CICLOS;

export default {
    nombre: 'alarma-emboscada',
    volumen: 0.75,
    generar: () => {
        const tonos = t => (t % CICLO < CICLO / 2 ? nota(74) : nota(72));
        const sirena = envolvente(pasoBanda(saturar(oscilador(DURACION, { forma: 'cuadrada', frecuencia: tonos }), 2), 1400, 1.2),
            [[0, 0], [0.01, 1], [DURACION - 0.1, 0.8], [DURACION, 0]]);
        // Chasquido del relé al saltar la alarma
        const rele = golpe(pasoAlto(ruido(0.05, { semilla: 320 }), 2000), { ataque: 0.0005, tau: 0.01 });
        const seco = mezclar([[sirena, 0.8], [rele, 0.7]]);
        const pozo = eco(seco, { retardo: 0.33, realimentacion: 0.4, mezcla: 0.35, cola: 1.2, corte: 1200 });
        return fundido(normalizar(reverb(pozo, { tamano: 0.85, mezcla: 0.3, cola: 1 })), 0.0005, 0.6);
    }
};
