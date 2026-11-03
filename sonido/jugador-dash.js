// Dash: ráfaga de aire veloz con un impulso grave al arrancar.
import { ruido, oscilador, golpe, envolvente, mezclar, pasoBanda, fundido, normalizar, rampa } from '../tools/sonido/sintesis.js';

export default {
    nombre: 'jugador-dash',
    volumen: 0.4,
    generar: () => {
        const aire = envolvente(pasoBanda(ruido(0.3, { semilla: 80 }), rampa(900, 4500, 0.15), 1.2), [[0, 0], [0.015, 1], [0.15, 0.4], [0.3, 0]]);
        const impulso = golpe(oscilador(0.15, { frecuencia: rampa(140, 60, 0.08) }), { ataque: 0.002, tau: 0.04 });
        const zumbido = golpe(oscilador(0.3, { frecuencia: rampa(600, 1400, 0.15) }), { ataque: 0.01, tau: 0.08 });
        return fundido(normalizar(mezclar([[aire, 1], [impulso, 0.6], [zumbido, 0.08]])), 0.001, 0.05);
    }
};
