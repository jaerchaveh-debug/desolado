// Zarpazo del estibador (en el frame de golpe): barrido de aire grave y el choque de la garra de carga.
import { ruido, oscilador, metal, golpe, envolvente, mezclar, pasoBanda, saturar, reverb, fundido, normalizar, rampa } from '../tools/sonido/sintesis.js';

export default {
    nombre: 'jefe-zarpazo',
    volumen: 0.65,
    generar: () => {
        const aire = envolvente(pasoBanda(ruido(0.35, { semilla: 180 }), rampa(1800, 300, 0.25), 1.3), [[0, 0.4], [0.03, 1], [0.3, 0]]);
        const garra = golpe(metal(0.9, { frecuencia: 240, decaimiento: 0.5, brillo: 0.5, semilla: 181 }), { ataque: 0.001, tau: 0.18 });
        const peso = golpe(oscilador(0.4, { frecuencia: rampa(120, 45, 0.12) }), { ataque: 0.002, tau: 0.08 });
        const seco = saturar(mezclar([[aire, 0.7], [garra, 0.7, 0.02], [peso, 0.8, 0.02]]), 2);
        return fundido(normalizar(reverb(seco, { tamano: 0.85, mezcla: 0.28, cola: 1 })), 0.002, 0.4);
    }
};
