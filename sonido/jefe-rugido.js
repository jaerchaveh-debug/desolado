// Rugido del estibador (se le encienden los ojos tras aterrizar): motor grave de sierras desafinadas,
// saturado y filtrado como una garganta mecánica que se abre y se cierra, con temblor y nave enorme.
import { ruido, oscilador, envolvente, mezclar, pasoBajo, pasoBanda, saturar, ganancia, reverb, fundido, normalizar, lfo } from '../tools/sonido/sintesis.js';

const D = 1.6;

export default {
    nombre: 'jefe-rugido',
    volumen: 0.8,
    generar: () => {
        const voz = mezclar([
            [oscilador(D, { forma: 'sierra', frecuencia: lfo(55, 3, 0.7) }), 1],
            [oscilador(D, { forma: 'sierra', frecuencia: lfo(57.5, 2, 0.9) }), 0.8],
            [oscilador(D, { forma: 'cuadrada', frecuencia: lfo(82, 4, 0.5) }), 0.4],
            [pasoBajo(ruido(D, { color: 'rosa', semilla: 170 }), 1200), 0.5]
        ]);
        // garganta: un formante que se abre y vuelve a cerrarse
        const garganta = pasoBanda(saturar(voz, 4), t => 250 + 900 * Math.sin(Math.PI * Math.min(1, t / D)), 1.2);
        const temblor = ganancia(garganta, lfo(0.8, 0.2, 11));
        const forma = envolvente(temblor, [[0, 0], [0.15, 1], [1.1, 0.8], [D, 0]]);
        return fundido(normalizar(reverb(forma, { tamano: 0.95, amortiguacion: 0.45, mezcla: 0.35, cola: 2 })), 0.01, 0.8);
    }
};
