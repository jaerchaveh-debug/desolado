// Onda de la espada (Q): la hoja libera energía. Zumbido grave saturado, barrido ascendente de ruido
// y un timbre cian agudo que cae, con cola amplia.
import { ruido, oscilador, golpe, envolvente, mezclar, pasoBajo, pasoBanda, saturar, reverb, fundido, normalizar, rampa } from '../tools/sonido/sintesis.js';

export default {
    nombre: 'espada-onda',
    volumen: 0.6,
    generar: () => {
        const zumbido = golpe(saturar(oscilador(0.9, { forma: 'sierra', frecuencia: rampa(90, 38, 0.6) }), 3), { ataque: 0.005, tau: 0.25 });
        const barrido = envolvente(pasoBanda(ruido(0.9, { semilla: 40 }), rampa(400, 6000, 0.35), 2), [[0, 0], [0.03, 1], [0.4, 0.2], [0.9, 0]]);
        const timbre = golpe(oscilador(0.9, { frecuencia: rampa(1800, 300, 0.5) }), { ataque: 0.002, tau: 0.18 });
        const seco = mezclar([[pasoBajo(zumbido, 1200), 0.8], [barrido, 0.6], [timbre, 0.3]]);
        return fundido(normalizar(reverb(seco, { tamano: 0.75, mezcla: 0.3, cola: 1 })), 0.002, 0.4);
    }
};
