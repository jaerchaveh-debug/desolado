// Activación del punto de control: la terminal ante la sala del jefe despierta y registra la señal del
// jugador. Chasquido de relé, zumbido eléctrico que sube al encenderse la pantalla y dos tonos fríos
// (Re, La) perdidos en la reverberación del pasillo. Suena una sola vez por partida.
import { ruido, oscilador, metal, golpe, envolvente, mezclar, pasoAlto, pasoBanda, saturar, reverb, fundido, normalizar, nota, rampa } from '../tools/sonido/sintesis.js';

const tono = (midi, seg) => envolvente(oscilador(seg, { frecuencia: nota(midi) }), [[0, 0], [0.01, 1], [seg, 0]]);

export default {
    nombre: 'control-activar',
    volumen: 0.55,
    generar: () => {
        const rele = golpe(pasoAlto(ruido(0.04, { semilla: 300 }), 2500), { ataque: 0.0005, tau: 0.006 });
        const clac = golpe(metal(0.3, { frecuencia: 1800, decaimiento: 0.08, brillo: 0.6, semilla: 301 }), { tau: 0.03 });
        const zumbido = envolvente(pasoBanda(saturar(oscilador(0.45, { forma: 'sierra', frecuencia: rampa(60, 120, 0.3) }), 2), 900, 1.5),
            [[0, 0], [0.05, 0.6], [0.3, 0.4], [0.45, 0]]);
        const seco = mezclar([[rele, 0.9], [clac, 0.4], [zumbido, 0.35, 0.02], [tono(74, 0.6), 0.45, 0.18], [tono(81, 0.9), 0.4, 0.32]]);
        return fundido(normalizar(reverb(seco, { tamano: 0.8, mezcla: 0.35, cola: 1.2 })), 0.0005, 0.4);
    }
};
