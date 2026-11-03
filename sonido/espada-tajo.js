// Tajo de la espada (E): silbido de aire que sube y baja con un leve canto metálico de la hoja.
import { ruido, metal, golpe, envolvente, mezclar, pasoBanda, reverb, fundido, normalizar } from '../tools/sonido/sintesis.js';

const D = 0.22;

export default {
    nombre: 'espada-tajo',
    variantes: 3,
    volumen: 0.45,
    generar: v => {
        const aire = envolvente(
            pasoBanda(ruido(D + 0.1, { semilla: 30 + v }), t => 700 + 3800 * Math.sin(Math.PI * Math.min(1, t / D)), 1.6),
            [[0, 0], [0.04, 1], [D, 0.15], [D + 0.1, 0]]
        );
        const canto = golpe(metal(0.5, { frecuencia: 2300 + v * 210, decaimiento: 0.25, brillo: 0.8, semilla: 31 + v }), { ataque: 0.03, tau: 0.12 });
        const seco = mezclar([[aire, 1], [canto, 0.18, 0.02]]);
        return fundido(normalizar(reverb(seco, { tamano: 0.5, mezcla: 0.2, cola: 0.4 })), 0.002, 0.15);
    }
};
