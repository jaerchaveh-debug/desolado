// Icono de carga del ataque especial de la espada (esquina inferior derecha). 16x16:
//   0 cargado (onda cian)   1 descargado (apagado)
// GameScene superpone el frame 0 recortado desde abajo según el progreso de recarga.

import { Lienzo } from '../tools/pixel/lienzo.js';

const T = 16;

const CARGADO = [
    '................',
    '......00........',
    '.....0h90.......',
    '.....0gh90......',
    '......0gh0......',
    '......0gh90.....',
    '.......0gh0.....',
    '.......0gh90....',
    '.......0gh90....',
    '.......0gh0.....',
    '......0gh90.....',
    '......0gh0......',
    '.....0gh90......',
    '.....0h90.......',
    '......00........',
    '................'
];

const DESCARGADO = CARGADO.map(f => f.replaceAll('9', '4').replaceAll('h', '3').replaceAll('g', '2'));

export default {
    nombre: 'hud-espada',
    ancho: T,
    alto: T,
    frames: () => [CARGADO, DESCARGADO].map((f, i) => Lienzo.desdeTexto(f, T, T, `hud-espada.${i}`))
};
