// Recoger una célula de energía: arpegio cian ascendente, frío y limpio, con reverberación.
import { oscilador, golpe, mezclar, reverb, fundido, normalizar, nota } from '../tools/sonido/sintesis.js';

const tono = (midi, inicio) => [golpe(oscilador(0.6, { frecuencia: nota(midi) }), { ataque: 0.003, tau: 0.15 }), 0.5, inicio];

export default {
    nombre: 'celula-recoger',
    volumen: 0.4,
    generar: () => fundido(normalizar(reverb(mezclar([tono(79, 0), tono(86, 0.05), tono(91, 0.1)]), { tamano: 0.7, mezcla: 0.35, cola: 0.8 })), 0.002, 0.3)
};
