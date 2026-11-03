// Cambio de arma: clic-clac mecánico de dos piezas encajando.
import { ruido, metal, golpe, mezclar, pasoAlto, reverb, fundido, normalizar } from '../tools/sonido/sintesis.js';

const clic = (semilla, frecuencia) => mezclar([
    [golpe(pasoAlto(ruido(0.03, { semilla }), 2500), { ataque: 0.0003, tau: 0.004 }), 1],
    [golpe(metal(0.1, { frecuencia, decaimiento: 0.05, brillo: 0.6, semilla }), { tau: 0.02 }), 0.4]
]);

export default {
    nombre: 'cambiar-arma',
    volumen: 0.35,
    generar: () => {
        const seco = mezclar([[clic(70, 2600), 0.8], [clic(71, 1900), 1, 0.07]]);
        return fundido(normalizar(reverb(seco, { tamano: 0.4, mezcla: 0.15, cola: 0.2 })), 0.0003, 0.05);
    }
};
