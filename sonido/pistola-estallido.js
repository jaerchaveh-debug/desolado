// Estallido de la pistola (Q): descarga pesada que retumba por el pasillo. Ruido que se oscurece,
// golpe grave, crepitar digital y un eco largo de la megaestructura.
import { ruido, oscilador, metal, golpe, mezclar, pasoBajo, pasoAlto, saturar, triturar, eco, reverb, fundido, normalizar, rampa } from '../tools/sonido/sintesis.js';

export default {
    nombre: 'pistola-estallido',
    volumen: 0.7,
    generar: () => {
        const rafaga = golpe(pasoBajo(ruido(1.2, { semilla: 21 }), rampa(9000, 250, 0.5)), { ataque: 0.001, tau: 0.22 });
        const boom = golpe(oscilador(1.2, { frecuencia: rampa(110, 28, 0.4) }), { ataque: 0.002, tau: 0.3 });
        const crepitar = golpe(triturar(pasoAlto(ruido(0.5, { semilla: 22 }), 2000), 4, 6), { tau: 0.08 });
        const timbre = golpe(metal(0.8, { frecuencia: 420, decaimiento: 0.35, brillo: 0.5, semilla: 23 }), { tau: 0.2 });
        const seco = saturar(mezclar([[rafaga, 0.8], [boom, 1], [crepitar, 0.35], [timbre, 0.3]]), 2.5);
        const espacio = eco(seco, { retardo: 0.21, realimentacion: 0.4, mezcla: 0.35, cola: 1.2, corte: 1500 });
        return fundido(normalizar(reverb(espacio, { tamano: 0.85, mezcla: 0.3, cola: 1.5 })), 0.001, 0.6);
    }
};
