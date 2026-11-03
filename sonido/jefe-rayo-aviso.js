// Aviso del rayo de los ojos: pitido que sube de tono y parpadea, durante JEFES.estibador.rayo.aviso ms
// (lo que dura la marca fina). Es la señal para esquivar.
import { oscilador, mezclar, ganancia, envolvente, fundido, normalizar, rampa } from '../tools/sonido/sintesis.js';
import { JEFES } from '../src/config/combate.js';

const D = JEFES.estibador.rayo.aviso / 1000;

export default {
    nombre: 'jefe-rayo-aviso',
    volumen: 0.32,
    generar: () => {
        const tono = mezclar([
            [oscilador(D, { frecuencia: rampa(500, 1800, D) }), 1],
            [oscilador(D, { forma: 'cuadrada', frecuencia: rampa(1000, 3600, D) }), 0.12]
        ]);
        // parpadeo al ritmo de la marca (90 ms encendida, 90 ms apagada)
        const parpadeo = ganancia(tono, t => (Math.floor(t / 0.09) % 2 ? 0.35 : 1));
        return fundido(normalizar(envolvente(parpadeo, [[0, 0.5], [D, 1]])), 0.003, 0.01);
    }
};
