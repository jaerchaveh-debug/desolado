// Salto: impulso breve y apagado de la bota contra el metal (suena muy a menudo: discreto).
import { ruido, golpe, envolvente, mezclar, pasoBajo, pasoBanda, fundido, normalizar } from '../tools/sonido/sintesis.js';

export default {
    nombre: 'jugador-salto',
    volumen: 0.18,
    generar: () => {
        const pisada = golpe(pasoBajo(ruido(0.12, { semilla: 90 }), 900), { ataque: 0.001, tau: 0.025 });
        const tela = envolvente(pasoBanda(ruido(0.12, { semilla: 91 }), 2500, 0.8), [[0, 0], [0.02, 0.5], [0.12, 0]]);
        return fundido(normalizar(mezclar([[pisada, 1], [tela, 0.4]])), 0.001, 0.03);
    }
};
