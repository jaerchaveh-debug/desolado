// Una bola de energía del jefe choca (contra el jugador o el nivel): chisporroteo y estallido apagado.
import { azar, ruido, oscilador, golpe, mezclar, pasoAlto, pasoBajo, reverb, fundido, normalizar, rampa } from '../tools/sonido/sintesis.js';

export default {
    nombre: 'bola-impacto',
    volumen: 0.35,
    generar: () => {
        const r = azar(230);
        const chispa = s => golpe(pasoAlto(ruido(0.02, { semilla: s }), 3000), { ataque: 0.0002, tau: 0.004 });
        const crepitar = mezclar(Array.from({ length: 7 }, (_, i) => [chispa(231 + i), 0.3 + r() * 0.7, r() * 0.18]), 0.25);
        const pop = golpe(pasoBajo(ruido(0.2, { semilla: 239 }), 1500), { ataque: 0.0005, tau: 0.03 });
        const caida = golpe(oscilador(0.3, { frecuencia: rampa(500, 120, 0.15) }), { tau: 0.06 });
        return fundido(normalizar(reverb(mezclar([[pop, 1], [crepitar, 0.5], [caida, 0.3]]), { tamano: 0.6, mezcla: 0.2, cola: 0.4 })), 0.0005, 0.15);
    }
};
