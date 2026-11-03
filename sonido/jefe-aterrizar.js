// El estibador cae del techo: impacto enorme contra el suelo del almacén, la chapa vibra y la nave retumba.
import { ruido, oscilador, metal, golpe, mezclar, pasoBajo, saturar, reverb, fundido, normalizar, rampa } from '../tools/sonido/sintesis.js';

export default {
    nombre: 'jefe-aterrizar',
    volumen: 0.85,
    generar: () => {
        const sub = golpe(oscilador(2, { frecuencia: rampa(70, 24, 0.6) }), { ataque: 0.002, tau: 0.45 });
        const masa = golpe(pasoBajo(ruido(1.5, { color: 'marron', semilla: 160 }), 500), { ataque: 0.001, tau: 0.25 });
        const chapa = golpe(metal(2.5, { frecuencia: 105, decaimiento: 1.6, brillo: 0.45, semilla: 161 }), { tau: 0.9 });
        const seco = saturar(mezclar([[sub, 1], [masa, 0.9], [chapa, 0.45]]), 2.2);
        return fundido(normalizar(reverb(seco, { tamano: 0.95, amortiguacion: 0.5, mezcla: 0.35, cola: 2.5 })), 0.001, 1);
    }
};
