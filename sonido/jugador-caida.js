// Caída alta: aterrizaje pesado contra el suelo metálico, retumbo grave y vibración de la chapa.
import { ruido, oscilador, metal, golpe, mezclar, pasoBajo, pasoAlto, saturar, reverb, fundido, normalizar, rampa } from '../tools/sonido/sintesis.js';

export default {
    nombre: 'jugador-caida',
    volumen: 0.6,
    generar: () => {
        const golpeSeco = golpe(pasoBajo(ruido(0.6, { color: 'marron', semilla: 110 }), 400), { ataque: 0.001, tau: 0.08 });
        const grave = golpe(oscilador(0.6, { frecuencia: rampa(80, 32, 0.2) }), { ataque: 0.002, tau: 0.15 });
        const chapa = golpe(metal(0.8, { frecuencia: 170, decaimiento: 0.4, brillo: 0.35, semilla: 111 }), { tau: 0.25 });
        const seco = pasoAlto(saturar(mezclar([[golpeSeco, 0.9], [grave, 1], [chapa, 0.35]]), 2), 25);
        return fundido(normalizar(reverb(seco, { tamano: 0.7, mezcla: 0.25, cola: 0.8 })), 0.001, 0.3);
    }
};
