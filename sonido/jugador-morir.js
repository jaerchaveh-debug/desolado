// Muerte del jugador: el traje se apaga. Señal digital que se degrada y cae hasta el silencio, con eco.
import { ruido, oscilador, golpe, envolvente, mezclar, recortar, unir, pasoBajo, triturar, eco, fundido, normalizar, rampa } from '../tools/sonido/sintesis.js';

const D = 1.3;

export default {
    nombre: 'jugador-morir',
    volumen: 0.6,
    generar: () => {
        const caida = envolvente(oscilador(D, { forma: 'sierra', frecuencia: rampa(520, 35, D) }), [[0, 1], [D * 0.7, 0.6], [D, 0]]);
        // Se degrada por tramos: cada uno con menos bits
        const tramo = (a, b, bits, paso) => triturar(recortar(caida, a, b), bits, paso);
        const degradada = pasoBajo(unir(tramo(0, 0.4, 7, 2), tramo(0.4, 0.85, 5, 3), tramo(0.85, D, 3, 4)), 3000);
        const golpeSeco = golpe(pasoBajo(ruido(0.3, { semilla: 120 }), 700), { ataque: 0.001, tau: 0.05 });
        const seco = mezclar([[degradada, 0.6], [golpeSeco, 1]]);
        return fundido(normalizar(eco(seco, { retardo: 0.33, realimentacion: 0.45, mezcla: 0.4, cola: 1.5, corte: 1200 })), 0.001, 0.4);
    }
};
