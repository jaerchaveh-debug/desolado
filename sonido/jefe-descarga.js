// Descarga del ataque en área: onda de choque. Estampido grave, ráfaga que se oscurece y crepitar eléctrico.
import { azar, ruido, oscilador, golpe, mezclar, pasoAlto, pasoBajo, saturar, reverb, fundido, normalizar, rampa } from '../tools/sonido/sintesis.js';

function crepitar(seg, semilla) {
    const r = azar(semilla);
    const chispa = s => golpe(pasoAlto(ruido(0.02, { semilla: s }), 2500), { ataque: 0.0002, tau: 0.004 });
    return mezclar(Array.from({ length: 16 }, (_, i) => [chispa(semilla + i), 0.2 + r() * 0.8, r() * seg]), seg + 0.05);
}

export default {
    nombre: 'jefe-descarga',
    volumen: 0.85,
    generar: () => {
        const estampido = golpe(oscilador(1.5, { frecuencia: rampa(90, 25, 0.5) }), { ataque: 0.001, tau: 0.35 });
        const rafaga = golpe(pasoBajo(ruido(1.5, { semilla: 210 }), rampa(8000, 200, 0.6)), { ataque: 0.001, tau: 0.3 });
        const seco = saturar(mezclar([[estampido, 1], [rafaga, 0.8], [crepitar(0.6, 211), 0.35]]), 2.5);
        return fundido(normalizar(reverb(seco, { tamano: 0.95, mezcla: 0.35, cola: 2 })), 0.001, 0.8);
    }
};
