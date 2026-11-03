// Una compuerta se abre al vencer la emboscada: desbloqueo seco, servo hidráulico que sube de tono
// mientras la persiana se eleva (dura lo mismo que la subida de Puerta.abrir, 900 ms), siseo de aire
// y un golpe sordo al encajarse en el techo.
import { ruido, oscilador, metal, golpe, envolvente, mezclar, pasoBajo, pasoBanda, saturar, reverb, fundido, normalizar, rampa } from '../tools/sonido/sintesis.js';

const SUBIDA = 0.9;

export default {
    nombre: 'compuerta-abrir',
    volumen: 0.7,
    generar: () => {
        const cerrojo = golpe(metal(0.4, { frecuencia: 260, decaimiento: 0.25, brillo: 0.5, semilla: 330 }), { ataque: 0.001, tau: 0.08 });
        const servo = envolvente(pasoBanda(saturar(mezclar([
            [oscilador(SUBIDA, { forma: 'sierra', frecuencia: rampa(70, 140, SUBIDA) }), 0.6],
            [oscilador(SUBIDA, { forma: 'sierra', frecuencia: rampa(71.5, 143, SUBIDA) }), 0.6]
        ]), 2), 600, 1), [[0, 0], [0.08, 0.8], [SUBIDA - 0.1, 0.6], [SUBIDA, 0]]);
        const aire = envolvente(pasoBanda(ruido(SUBIDA, { semilla: 331 }), 3000, 0.8), [[0, 0], [0.1, 0.4], [SUBIDA, 0]]);
        const tope = golpe(pasoBajo(oscilador(0.5, { frecuencia: rampa(90, 40, 0.3) }), 400), { ataque: 0.001, tau: 0.15 });
        const seco = mezclar([[cerrojo, 0.8], [servo, 0.55, 0.05], [aire, 0.3, 0.05], [tope, 0.8, SUBIDA]]);
        return fundido(normalizar(reverb(seco, { tamano: 0.8, mezcla: 0.3, cola: 1 })), 0.001, 0.5);
    }
};
