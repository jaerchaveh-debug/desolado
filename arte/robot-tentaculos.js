// Enemigo: robot flotante de casco esférico, ojo rojo y tentáculos negros que ondulan.
// Mira a la derecha. Frames de 48x48:
//   0-3 flotar (los tentáculos ondulan)   4-6 morir (destello, rotura, chispas)

import { Lienzo, ruido } from '../tools/pixel/lienzo.js';

const T = 48;
const CX = 24, CY = 16, RADIO = 14;   // centro y radio del casco

function casco(l, i = 0) {
    l.patron(CX - RADIO, CY - RADIO, RADIO * 2 + 1, RADIO * 2 + 1, (x, y) => {
        const dx = x - RADIO, dy = y - RADIO;
        const d = Math.hypot(dx, dy);
        if (d > RADIO + 0.3) return null;
        if (d > RADIO - 1) return '0';                       // contorno
        const luz = -dy - dx * 0.35;                         // luz desde arriba a la izquierda
        return luz > 9 ? '8' : luz > 6 ? '7' : luz > 2 ? '6' : luz > -2 ? '5' : luz > -7 ? '4' : '3';
    });
    const dentro = (x, y) => Math.hypot(x - CX, y - CY) < RADIO - 1;
    // Sombra del lado derecho con trazos
    l.trazos((x, y) => dentro(x, y) && x + y > 52, '2', { separacion: 3, inclinacion: 1, rotura: 0.25, semilla: 7 });
    // Juntas de las placas: una horizontal curva y una vertical
    for (let x = CX - RADIO; x <= CX + RADIO; x++) {
        const y = CY + 5 + Math.round(((x - CX) / RADIO) ** 2 * -2);
        if (dentro(x, y)) l.punto(x, y, '1').punto(x, y + 1, '5');
    }
    l.oscurecer((x, y) => x === 19 && y >= 4 && y <= 20 && dentro(x, y), 2);
    l.aclarar((x, y) => x === 20 && y >= 4 && y <= 20 && dentro(x, y));
    [14, 24, 32].forEach(x => l.punto(x, 23, '7'));           // remaches de la junta
    // Rejilla de ventilación
    for (let x = 14; x <= 24; x += 3) l.rect(x, 25, 2, 2, '1').punto(x, 27, '5');
    // Chorreón de óxido bajo la junta
    l.lineaV(31, 23, 4, 'b').punto(31, 27, 'a').lineaV(33, 23, 2, 'a').punto(30, 23, 'c');
    // Ojo rojo mirando al frente (derecha): lente con anillo; late en los frames 1 y 2
    l.circulo(31, 13, 5, '0').anillo(31, 13, 4, '3');
    const late = i === 1 || i === 2;
    l.circulo(31, 13, 3, 'i').circulo(32, 13, 2, late ? 'j' : 'i').rect(32, 12, 2, 2, 'j');
    if (late) l.punto(33, 12, '9').punto(34, 13, 'j');
    l.rect(15, 6, 3, 2, '9').punto(14, 8, '9').punto(19, 5, '8');   // brillo especular
    return l;
}

// Tentáculos negros: 4 curvas que salen de la base del casco, con fase por frame
function tentaculos(l, fase) {
    const raices = [14, 20, 28, 34];
    raices.forEach((x0, k) => {
        for (let y = 28; y < T; y++) {
            const t = (y - 28) / 2;
            const amp = 0.8 + t * 0.44;
            const x = x0 + Math.round(Math.sin(t / 2.2 + fase + k * 1.7) * amp) + (k < 2 ? -Math.floor(t / 2) : Math.floor(t / 2));
            const ancho = y < 34 ? 3 : y < 42 ? 2 : 1;
            // Negro metálico en vez de '0' puro, para que se distingan sobre el fondo negro
            const articulacion = (y - 28) % 6 < 2;
            l.lineaH(x - 1, y, ancho + 1, '0');
            l.lineaH(x, y, ancho - 1 || 1, articulacion ? '5' : '3');
            if (articulacion && ancho > 1) l.punto(x, y, '5');
            if (y === T - 1) l.punto(x, y, '6');
        }
    });
    // Anillo de anclaje
    l.rect(12, 28, 26, 2, '1').lineaH(14, 28, 22, '3').rect(14, 30, 22, 2, '0');
    return l;
}

function flotar(i) {
    return casco(tentaculos(new Lienzo(T, T), i * Math.PI / 2), i);
}

function destello() {
    const l = flotar(0);
    // el casco se sobreexpone en blanco/cian
    return l.patron(0, 0, T, 30, (x, y) => (l.px[y][x] !== '.' && l.px[y][x] !== '0' ? (ruido(x >> 1, y >> 1, 3) > 0.5 ? '9' : 'h') : null));
}

function rotura() {
    const l = new Lienzo(T, T);
    const base = flotar(1);
    // fragmentos del casco desplazados hacia fuera
    for (let y = 0; y < T; y++) {
        for (let x = 0; x < T; x++) {
            const c = base.px[y][x];
            if (c === '.' || ruido(x >> 3, y >> 3, 5) > 0.6) continue;
            l.punto(x + Math.sign(x - CX) * 4, y + Math.sign(y - CY) * 4, c);
        }
    }
    return l.rect(22, 14, 6, 4, 'j').rect(23, 14, 2, 2, '9');  // núcleo expuesto
}

function chispas() {
    const l = new Lienzo(T, T);
    for (let i = 0; i < 22; i++) {
        const x = Math.floor(ruido(i, 1, 9) * (T - 2)), y = Math.floor(ruido(i, 2, 9) * (T - 2));
        const c = ['j', 'h', '5', '3'][i % 4];
        l.punto(x, y, c).punto(x + 1, y, c);
        if (i % 3 === 0) l.punto(x, y + 1, c);
    }
    return l;
}

export default {
    nombre: 'robot-tentaculos',
    hd: true,
    ancho: T,
    alto: T,
    frames: () => [flotar(0), flotar(1), flotar(2), flotar(3), destello(), rotura(), chispas()],
    animaciones: {
        flotar: { frames: [0, 1, 2, 3], fps: 6, repetir: -1 },
        morir: { frames: [4, 5, 6], fps: 12, repetir: 0 }
    }
};
