// Muerte del rastreador: el casco revienta con un chispazo eléctrico, crepitar y una pieza metálica.
import { azar, ruido, oscilador, metal, golpe, mezclar, silencio, pasoAlto, pasoBajo, saturar, reverb, fundido, normalizar, rampa } from '../tools/sonido/sintesis.js';

// Chasquidos eléctricos sueltos en los primeros 'seg' segundos
function crepitar(seg, semilla) {
    const r = azar(semilla);
    const chispa = s => golpe(pasoAlto(ruido(0.02, { semilla: s }), 3000), { ataque: 0.0002, tau: 0.003 });
    return mezclar(Array.from({ length: 9 }, (_, i) => [chispa(semilla + i), 0.3 + r() * 0.7, r() * seg]), seg + 0.05);
}

export default {
    nombre: 'rastreador-morir',
    variantes: 2,
    volumen: 0.5,
    generar: v => {
        const pop = golpe(pasoBajo(ruido(0.3, { semilla: 130 + v }), 2500), { ataque: 0.0005, tau: 0.04 });
        const zap = golpe(saturar(oscilador(0.4, { forma: 'cuadrada', frecuencia: rampa(1100 - v * 150, 90, 0.25) }), 2), { ataque: 0.001, tau: 0.1 });
        const pieza = golpe(metal(0.5, { frecuencia: 900 + v * 200, decaimiento: 0.2, brillo: 0.6, semilla: 131 + v }), { tau: 0.08 });
        const seco = mezclar([[pop, 1], [pasoBajo(zap, 3000), 0.35], [crepitar(0.35, 132 + v * 20), 0.5], [pieza, 0.4, 0.06], [silencio(0.5), 0]]);
        return fundido(normalizar(reverb(seco, { tamano: 0.6, mezcla: 0.22, cola: 0.6 })), 0.0005, 0.2);
    }
};
