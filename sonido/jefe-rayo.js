// Rayo de los ojos: zumbido eléctrico denso y saturado durante JEFES.estibador.rayo.duracion ms,
// con un golpe al encenderse y la cola en la nave.
import { ruido, oscilador, golpe, envolvente, mezclar, pasoBanda, pasoBajo, saturar, reverb, fundido, normalizar, rampa } from '../tools/sonido/sintesis.js';
import { JEFES } from '../src/config/combate.js';

const D = JEFES.estibador.rayo.duracion / 1000;

export default {
    nombre: 'jefe-rayo',
    volumen: 0.55,
    generar: () => {
        const zumbido = saturar(mezclar([
            [oscilador(D + 0.05, { forma: 'sierra', frecuencia: 110 }), 1],
            [oscilador(D + 0.05, { forma: 'sierra', frecuencia: 221.5 }), 0.7],
            [pasoBanda(ruido(D + 0.05, { semilla: 240 }), 2500, 0.7), 0.6]
        ]), 4);
        const cuerpo = envolvente(pasoBajo(zumbido, 4000), [[0, 1], [D, 0.8], [D + 0.05, 0]]);
        const encendido = golpe(oscilador(0.2, { frecuencia: rampa(300, 60, 0.08) }), { ataque: 0.001, tau: 0.04 });
        return fundido(normalizar(reverb(mezclar([[cuerpo, 0.8], [encendido, 0.6]]), { tamano: 0.8, mezcla: 0.25, cola: 0.7 })), 0.001, 0.25);
    }
};
