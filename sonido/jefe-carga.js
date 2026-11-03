// El estibador carga el ataque en área: zumbido que sube de tono y de intensidad, con un temblor
// cada vez más rápido, durante exactamente JEFES.estibador.cargado.carga ms (corta en seco: sigue la descarga).
import { ruido, oscilador, envolvente, mezclar, pasoBajo, pasoBanda, saturar, ganancia, fundido, normalizar, rampa } from '../tools/sonido/sintesis.js';
import { JEFES } from '../src/config/combate.js';

const D = JEFES.estibador.cargado.carga / 1000;

export default {
    nombre: 'jefe-carga',
    volumen: 0.6,
    generar: () => {
        const zumbido = saturar(mezclar([
            [oscilador(D, { forma: 'sierra', frecuencia: rampa(45, 120, D) }), 1],
            [oscilador(D, { forma: 'sierra', frecuencia: rampa(45.7, 122, D) }), 0.8]
        ]), 3);
        const silbido = pasoBanda(ruido(D, { semilla: 200 }), rampa(300, 4000, D), 3);
        // temblor que se acelera de 6 a 22 Hz
        let fase = 0;
        const temblor = t => {
            fase += 2 * Math.PI * (6 + 16 * t / D) / 22050;
            return 0.65 + 0.35 * Math.sin(fase);
        };
        const seco = ganancia(mezclar([[pasoBajo(zumbido, rampa(400, 3000, D)), 1], [silbido, 0.4]]), temblor);
        return fundido(normalizar(envolvente(seco, [[0, 0.15], [D, 1]])), 0.02, 0.01);
    }
};
