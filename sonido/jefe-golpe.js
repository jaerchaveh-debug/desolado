// El estibador recibe daño: golpe metálico hueco y grave (suena a menudo: corto).
import { ruido, oscilador, metal, golpe, mezclar, pasoAlto, saturar, reverb, fundido, normalizar, rampa } from '../tools/sonido/sintesis.js';

export default {
    nombre: 'jefe-golpe',
    variantes: 3,
    volumen: 0.38,
    generar: v => {
        const casco = golpe(metal(0.6, { frecuencia: 210 + v * 35, decaimiento: 0.35, brillo: 0.45, semilla: 190 + v }), { ataque: 0.001, tau: 0.12 });
        const sordo = golpe(oscilador(0.2, { frecuencia: rampa(110, 50, 0.06) }), { tau: 0.05 });
        const tic = golpe(pasoAlto(ruido(0.04, { semilla: 193 + v }), 1800), { ataque: 0.0005, tau: 0.008 });
        const seco = saturar(mezclar([[casco, 0.8], [sordo, 0.8], [tic, 0.4]]), 1.8);
        return fundido(normalizar(reverb(seco, { tamano: 0.7, mezcla: 0.2, cola: 0.5 })), 0.0005, 0.15);
    }
};
