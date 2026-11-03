// Bala contra la pared: chispazo y rebote metálico agudo, corto.
import { ruido, metal, golpe, mezclar, pasoAlto, reverb, fundido, normalizar } from '../tools/sonido/sintesis.js';

export default {
    nombre: 'impacto-muro',
    variantes: 3,
    volumen: 0.28,
    generar: v => {
        const tic = golpe(pasoAlto(ruido(0.05, { semilla: 50 + v }), 3000), { ataque: 0.0005, tau: 0.008 });
        const ping = golpe(metal(0.4, { frecuencia: 2400 + v * 400, decaimiento: 0.12, brillo: 0.7, semilla: 51 + v }), { tau: 0.05 });
        const seco = mezclar([[tic, 0.8], [ping, 0.5]]);
        return fundido(normalizar(reverb(seco, { tamano: 0.5, mezcla: 0.2, cola: 0.3 })), 0.0005, 0.1);
    }
};
