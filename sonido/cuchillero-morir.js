// Muerte del cuchillero: los servos se paran bajando de tono, chispazo y tres piezas metálicas que caen.
import { ruido, oscilador, metal, golpe, envolvente, mezclar, pasoAlto, pasoBajo, saturar, reverb, fundido, normalizar, rampa } from '../tools/sonido/sintesis.js';

export default {
    nombre: 'cuchillero-morir',
    volumen: 0.55,
    generar: () => {
        const servo = envolvente(pasoBajo(saturar(oscilador(0.5, { forma: 'sierra', frecuencia: rampa(320, 45, 0.45) }), 2.5), 1500),
            [[0, 0.8], [0.4, 0.5], [0.5, 0]]);
        const chispa = golpe(pasoAlto(ruido(0.1, { semilla: 150 }), 2500), { ataque: 0.0005, tau: 0.02 });
        const pieza = (frecuencia, semilla) => golpe(metal(0.5, { frecuencia, decaimiento: 0.25, brillo: 0.5, semilla }), { tau: 0.1 });
        const seco = mezclar([
            [chispa, 0.7], [servo, 0.45],
            [pieza(700, 151), 0.6, 0.12], [pieza(980, 152), 0.45, 0.26], [pieza(560, 153), 0.5, 0.33]
        ]);
        return fundido(normalizar(reverb(seco, { tamano: 0.6, mezcla: 0.22, cola: 0.6 })), 0.0005, 0.25);
    }
};
