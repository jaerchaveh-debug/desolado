// La puerta blindada revienta: estallido, la plancha se parte y caen pedazos de chatarra.
import { azar, ruido, oscilador, metal, golpe, mezclar, pasoBajo, saturar, reverb, fundido, normalizar, rampa } from '../tools/sonido/sintesis.js';

export default {
    nombre: 'puerta-rota',
    volumen: 0.8,
    generar: () => {
        const r = azar(270);
        const estallido = golpe(pasoBajo(ruido(0.8, { semilla: 271 }), rampa(7000, 300, 0.35)), { ataque: 0.001, tau: 0.15 });
        const boom = golpe(oscilador(0.8, { frecuencia: rampa(95, 30, 0.3) }), { ataque: 0.001, tau: 0.22 });
        const plancha = golpe(metal(1.5, { frecuencia: 120, decaimiento: 0.9, brillo: 0.5, semilla: 272 }), { tau: 0.35 });
        // pedazos que rebotan: cada vez más agudos, más flojos y más seguidos
        const pedazos = Array.from({ length: 8 }, (_, i) => [
            golpe(metal(0.4, { frecuencia: 500 + r() * 900, decaimiento: 0.18, brillo: 0.6, semilla: 273 + i }), { tau: 0.06 }),
            0.5 - i * 0.04, 0.35 + i * 0.09 + r() * 0.05
        ]);
        const seco = saturar(mezclar([[estallido, 0.9], [boom, 1], [plancha, 0.5], ...pedazos]), 2);
        return fundido(normalizar(reverb(seco, { tamano: 0.85, mezcla: 0.3, cola: 1.5 })), 0.001, 0.6);
    }
};
