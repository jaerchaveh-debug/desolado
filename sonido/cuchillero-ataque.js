// Ataque del cuchillero: servos que se tensan mientras alza las cuchillas (frames 7,7 a 8 fps = 250 ms)
// y el tajo doble: dos silbidos con canto metálico afilado al bajar (frames 8,8).
import { ruido, oscilador, metal, golpe, envolvente, mezclar, pasoBanda, pasoBajo, saturar, reverb, fundido, normalizar, rampa } from '../tools/sonido/sintesis.js';

const PREPARAR = 0.25;

const tajo = (semilla, frecuencia) => mezclar([
    [envolvente(pasoBanda(ruido(0.15, { semilla }), rampa(5000, 1200, 0.12), 1.5), [[0, 0], [0.01, 1], [0.12, 0]]), 0.8],
    [golpe(metal(0.4, { frecuencia, decaimiento: 0.2, brillo: 0.85, semilla }), { ataque: 0.002, tau: 0.07 }), 0.35]
]);

export default {
    nombre: 'cuchillero-ataque',
    volumen: 0.5,
    generar: () => {
        const servo = envolvente(pasoBajo(saturar(oscilador(PREPARAR, { forma: 'sierra', frecuencia: rampa(160, 340, PREPARAR) }), 2), 1800),
            [[0, 0], [0.03, 0.6], [PREPARAR - 0.02, 0.8], [PREPARAR, 0]]);
        const seco = mezclar([[servo, 0.4], [tajo(140, 3100), 1, PREPARAR], [tajo(141, 3500), 0.9, PREPARAR + 0.07]]);
        return fundido(normalizar(reverb(seco, { tamano: 0.5, mezcla: 0.2, cola: 0.4 })), 0.003, 0.15);
    }
};
