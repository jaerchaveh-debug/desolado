// Fragmentos de metal que saltan al destruir la puerta (12x12). Frames: 0 placa · 1 esquirla · 2 tuerca oxidada
import { Lienzo } from '../tools/pixel/lienzo.js';

const T = 12;

function placa() {
    const l = new Lienzo(T, T).poligono([[1, 3], [9, 2], [10, 8], [3, 10]], '5');
    l.linea(1, 3, 9, 2, '7').linea(3, 10, 10, 8, '3').rect(5, 5, 2, 2, '2').punto(5, 5, '0');
    return l.contorno('0');
}

function esquirla() {
    const l = new Lienzo(T, T).poligono([[3, 2], [8, 4], [9, 9], [4, 7]], '4');
    return l.linea(3, 2, 8, 4, '6').linea(4, 7, 9, 9, '2').contorno('0');
}

function tuerca() {
    const l = new Lienzo(T, T).poligono([[4, 2], [8, 2], [10, 6], [8, 10], [4, 10], [2, 6]], 'c');
    l.linea(4, 2, 8, 2, 'd').linea(4, 10, 8, 10, 'b').circulo(6, 6, 1, '0');
    return l.contorno('0');
}

export default {
    nombre: 'chatarra',
    hd: true,
    ancho: T,
    alto: T,
    frames: () => [placa(), esquirla(), tuerca()]
};
