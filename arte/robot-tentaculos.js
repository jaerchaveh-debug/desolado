// Enemigo: robot flotante de casco esférico, ojo rojo y tentáculos negros que ondulan.
// Mira a la derecha. Frames de 24x24:
//   0-3 flotar (los tentáculos ondulan)   4-6 morir (destello, rotura, chispas)

import { Lienzo, ruido } from '../tools/pixel/lienzo.js';

const T = 24;
const CX = 12, CY = 8, RADIO = 7;   // centro y radio del casco

function casco(l, i = 0) {
    l.patron(CX - RADIO, CY - RADIO, RADIO * 2 + 1, RADIO * 2 + 1, (x, y) => {
        const dx = x - RADIO, dy = y - RADIO;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d > RADIO + 0.3) return null;
        if (d > RADIO - 0.7) return '0';                    // contorno
        if (dy === 2) return '2';                            // junta horizontal del casco
        const luz = -dy - dx * 0.3;                          // luz desde arriba a la izquierda
        return luz > 4 ? '7' : luz > 1.5 ? '6' : luz > -1.5 ? '5' : luz > -4 ? '4' : '3';
    });
    const dentro = (x, y) => Math.hypot(x - CX, y - CY) < RADIO - 0.7;
    l.oscurecer((x, y) => x === 10 && y >= 3 && y <= 9 && dentro(x, y));   // junta vertical de placas
    [13, 16].forEach(x => l.punto(x, 10, '4'));      // remaches de la junta horizontal
    l.oscurecer((x, y) => y >= 11 && y <= 12 && x >= 8 && x <= 12 && x % 2 === 0, 2);   // rejilla de ventilación
    l.punto(15, 11, 'b').punto(15, 12, 'a').punto(16, 11, 'a');   // chorreón de óxido bajo la junta
    // Ojo rojo mirando al frente (derecha); late en los frames 1 y 2 (se enciende la cuenca entera)
    l.rect(14, 6, 4, 3, '0');
    l.rect(15, 7, 2, 1, 'j');
    l.punto(14, 7, 'i');
    if (i === 1 || i === 2) l.lineaH(14, 7, 3, 'j');
    l.punto(9, 3, '8').punto(8, 4, '8');                    // brillo especular
    return l;
}

// Tentáculos negros: 4 curvas que salen de la base del casco, con fase por frame
function tentaculos(l, fase) {
    const raices = [7, 10, 14, 17];
    raices.forEach((x0, k) => {
        let anterior = null;
        for (let y = 14; y < T; y++) {
            const t = y - 14;
            const amp = 0.4 + t * 0.22;
            const x = x0 + Math.round(Math.sin(t / 2.2 + fase + k * 1.7) * amp) + (k < 2 ? -Math.floor(t / 4) : Math.floor(t / 4));
            // Negro metálico ('1') en vez de '0' puro, para que se distingan sobre el fondo negro
            // segmentos alternos, articulación clara cada 4 px y punta metálica
            l.punto(x, y, y === T - 1 ? '4' : t % 4 === 3 ? '3' : t % 2 === 0 ? '2' : '1');
            if (t < 5) l.punto(x - 1, y, '3');               // más gruesos y con borde de luz cerca de la base
            // rellena saltos horizontales para que la curva sea continua
            if (anterior !== null && Math.abs(x - anterior) > 1) l.punto((x + anterior) >> 1, y, '1');
            anterior = x;
        }
    });
    l.lineaH(6, 14, 13, '1');                                // anillo de anclaje
    l.lineaH(7, 15, 11, '0');
    return l;
}

function flotar(i) {
    return casco(tentaculos(new Lienzo(T, T), i * Math.PI / 2), i);
}

function destello() {
    const l = flotar(0);
    // el casco se sobreexpone en blanco/cian
    return l.patron(0, 0, T, 15, (x, y) => l.px[y][x] !== '.' && l.px[y][x] !== '0' ? (ruido(x, y, 3) > 0.5 ? '9' : 'h') : null);
}

function rotura() {
    const l = new Lienzo(T, T);
    const base = flotar(1);
    // fragmentos del casco desplazados hacia fuera
    for (let y = 0; y < T; y++) {
        for (let x = 0; x < T; x++) {
            const c = base.px[y][x];
            if (c === '.' || ruido(x >> 2, y >> 2, 5) > 0.6) continue;
            const dx = Math.sign(x - CX) * 2, dy = Math.sign(y - CY) * 2;
            l.punto(x + dx, y + dy, c);
        }
    }
    l.rect(11, 7, 3, 2, 'j').punto(12, 7, '9');               // núcleo expuesto
    return l;
}

function chispas() {
    const l = new Lienzo(T, T);
    for (let i = 0; i < 14; i++) {
        const x = Math.floor(ruido(i, 1, 9) * T), y = Math.floor(ruido(i, 2, 9) * T);
        l.punto(x, y, ['j', 'h', '5', '0'][i % 4]);
    }
    return l;
}

export default {
    nombre: 'robot-tentaculos',
    ancho: T,
    alto: T,
    frames: () => [flotar(0), flotar(1), flotar(2), flotar(3), destello(), rotura(), chispas()],
    animaciones: {
        flotar: { frames: [0, 1, 2, 3], fps: 6, repetir: -1 },
        morir: { frames: [4, 5, 6], fps: 12, repetir: 0 }
    }
};
