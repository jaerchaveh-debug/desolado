// Golpe sobre un enemigo de metal (bala, tajo o estallido que no lo mata): clang seco y saturado.
import { ruido, oscilador, metal, golpe, mezclar, pasoAlto, saturar, reverb, fundido, normalizar, rampa } from '../tools/sonido/sintesis.js';

export default {
    nombre: 'impacto-metal',
    variantes: 3,
    volumen: 0.42,
    generar: v => {
        const clang = golpe(metal(0.5, { frecuencia: 620 + v * 130, decaimiento: 0.25, brillo: 0.55, semilla: 60 + v }), { ataque: 0.001, tau: 0.09 });
        const tic = golpe(pasoAlto(ruido(0.05, { semilla: 61 + v }), 1500), { ataque: 0.0005, tau: 0.01 });
        const sordo = golpe(oscilador(0.15, { frecuencia: rampa(180, 80, 0.05) }), { tau: 0.03 });
        const seco = saturar(mezclar([[clang, 0.7], [tic, 0.6], [sordo, 0.6]]), 2);
        return fundido(normalizar(reverb(seco, { tamano: 0.5, mezcla: 0.18, cola: 0.3 })), 0.0005, 0.1);
    }
};
