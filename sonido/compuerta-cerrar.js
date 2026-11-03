// La compuerta de la sala del jefe cae y se cierra de golpe: chirrido corto al soltarse, impacto
// enorme y el eco que recorre el pasillo vacío. Suena al empezar la caída (250 ms hasta el impacto).
import { ruido, oscilador, metal, golpe, envolvente, mezclar, pasoBajo, pasoBanda, saturar, eco, reverb, fundido, normalizar, rampa } from '../tools/sonido/sintesis.js';

const CAIDA = 0.25;

export default {
    nombre: 'compuerta-cerrar',
    volumen: 0.85,
    generar: () => {
        const chirrido = envolvente(pasoBanda(saturar(oscilador(CAIDA, { forma: 'sierra', frecuencia: rampa(700, 400, CAIDA) }), 2), 1500, 2),
            [[0, 0], [0.02, 0.5], [CAIDA, 0.2]]);
        const impacto = golpe(oscilador(1.5, { frecuencia: rampa(75, 26, 0.5) }), { ataque: 0.001, tau: 0.4 });
        const masa = golpe(pasoBajo(ruido(1, { color: 'marron', semilla: 280 }), 500), { ataque: 0.001, tau: 0.2 });
        const plancha = golpe(metal(2, { frecuencia: 90, decaimiento: 1.4, brillo: 0.4, semilla: 281 }), { tau: 0.7 });
        const seco = saturar(mezclar([[chirrido, 0.6], [impacto, 1, CAIDA], [masa, 0.8, CAIDA], [plancha, 0.45, CAIDA]]), 2.2);
        const pasillo = eco(seco, { retardo: 0.42, realimentacion: 0.45, mezcla: 0.4, cola: 1.6, corte: 900 });
        return fundido(normalizar(reverb(pasillo, { tamano: 0.9, mezcla: 0.3, cola: 1.4 })), 0.005, 1.2);
    }
};
