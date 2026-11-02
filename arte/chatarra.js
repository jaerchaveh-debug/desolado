// Fragmentos de metal que saltan al destruir la puerta (6x6). Frames: 0 placa · 1 esquirla · 2 tuerca al rojo
import { Lienzo } from '../tools/pixel/lienzo.js';

const T = 6;
const PIEZAS = [
    ['......', '.0000.', '056650', '044430', '.0000.', '......'],
    ['......', '..00..', '.0640.', '.0430.', '..00..', '......'],
    ['......', '..00..', '.0dc0.', '.0cb0.', '..00..', '......']
];

export default {
    nombre: 'chatarra',
    ancho: T,
    alto: T,
    frames: () => PIEZAS.map((p, i) => Lienzo.desdeTexto(p, T, T, `chatarra.${i}`))
};
