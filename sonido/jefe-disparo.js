// Bola de energía del estibador: descarga que cae de tono con un vibrato inestable.
import { ruido, oscilador, golpe, mezclar, pasoBanda, saturar, reverb, fundido, normalizar } from '../tools/sonido/sintesis.js';

export default {
    nombre: 'jefe-disparo',
    variantes: 2,
    volumen: 0.4,
    generar: v => {
        const tono = t => (950 - v * 120) * Math.exp(-t * 7) + 160 + 40 * Math.sin(2 * Math.PI * 35 * t);
        const zap = golpe(saturar(oscilador(0.5, { forma: 'triangulo', frecuencia: tono }), 2.5), { ataque: 0.002, tau: 0.12 });
        const siseo = golpe(pasoBanda(ruido(0.3, { semilla: 220 + v }), 3000, 1), { ataque: 0.001, tau: 0.04 });
        return fundido(normalizar(reverb(mezclar([[zap, 0.8], [siseo, 0.4]]), { tamano: 0.7, mezcla: 0.25, cola: 0.5 })), 0.001, 0.2);
    }
};
