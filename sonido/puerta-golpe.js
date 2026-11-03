// Golpe contra la puerta blindada: plancha gruesa que resuena grave y sorda.
import { ruido, metal, golpe, mezclar, pasoBajo, pasoAlto, saturar, reverb, fundido, normalizar } from '../tools/sonido/sintesis.js';

export default {
    nombre: 'puerta-golpe',
    variantes: 2,
    volumen: 0.5,
    generar: v => {
        const plancha = golpe(metal(1.2, { frecuencia: 135 + v * 20, decaimiento: 0.7, brillo: 0.4, semilla: 260 + v }), { ataque: 0.001, tau: 0.3 });
        const sordo = golpe(pasoBajo(ruido(0.3, { color: 'marron', semilla: 262 + v }), 500), { ataque: 0.001, tau: 0.05 });
        const seco = pasoAlto(saturar(mezclar([[plancha, 0.7], [sordo, 0.9]]), 1.8), 25);
        return fundido(normalizar(reverb(seco, { tamano: 0.75, mezcla: 0.25, cola: 0.8 })), 0.001, 0.3);
    }
};
