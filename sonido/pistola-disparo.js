// Disparo de la pistola: chasquido seco de ruido, golpe grave del retroceso y un timbre metálico
// corto del arma, con la reverberación del pasillo. 3 variantes para que no se repita.
import { ruido, oscilador, metal, golpe, pasoAlto, pasoBajo, mezclar, reverb, fundido, normalizar, saturar, rampa } from '../tools/sonido/sintesis.js';

export default {
    nombre: 'pistola-disparo',
    variantes: 3,
    volumen: 0.5,
    generar: v => {
        const chasquido = golpe(pasoAlto(ruido(0.15, { semilla: 10 + v }), 1200), { ataque: 0.001, tau: 0.025 });
        const cuerpo = golpe(oscilador(0.2, { frecuencia: rampa(160 - v * 10, 45, 0.08) }), { ataque: 0.001, tau: 0.05 });
        const timbre = golpe(metal(0.3, { frecuencia: 1700 + v * 140, decaimiento: 0.1, brillo: 0.6, semilla: v }), { tau: 0.06 });
        const seco = saturar(mezclar([[chasquido, 0.7], [cuerpo, 0.9], [timbre, 0.25]]), 2);
        return fundido(normalizar(reverb(pasoBajo(seco, 7000), { tamano: 0.55, mezcla: 0.22, cola: 0.5 })), 0.001, 0.1);
    }
};
