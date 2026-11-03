// El jugador recibe daño: interferencia digital en el traje (cuadrada que cae, triturada) y un golpe sordo.
import { ruido, oscilador, golpe, mezclar, pasoBajo, triturar, reverb, fundido, normalizar, rampa } from '../tools/sonido/sintesis.js';

export default {
    nombre: 'jugador-golpe',
    variantes: 2,
    volumen: 0.5,
    generar: v => {
        const fallo = golpe(triturar(oscilador(0.35, { forma: 'cuadrada', frecuencia: rampa(440 - v * 60, 90, 0.2) }), 4, 3), { ataque: 0.001, tau: 0.09 });
        const sordo = golpe(pasoBajo(ruido(0.2, { semilla: 100 + v }), 600), { ataque: 0.001, tau: 0.04 });
        const seco = mezclar([[pasoBajo(fallo, 3500), 0.5], [sordo, 1]]);
        return fundido(normalizar(reverb(seco, { tamano: 0.45, mezcla: 0.15, cola: 0.3 })), 0.001, 0.1);
    }
};
