// Jugador: errante encapuchado con abrigo largo, visor cian, bufanda de óxido y pistola.
// Mira a la derecha (en el juego se usa flipX para la izquierda). Frames de 32x64 (resolución 960x540).
// Se compone por piezas: piernas lejana y cercana, cola de la bufanda, abrigo, cabeza y brazo con el arma.
// Los puntos de la boca del cañón y del puño de cada pose están en APUNTAR de GameScene (relativos al
// centro del frame, 16,32): si se mueven aquí, hay que actualizarlos allí.

import { Lienzo } from '../tools/pixel/lienzo.js';

const ANCHO = 32;
const ALTO = 64;
const HOMBRO = [13, 25];
const LARGO_PISTOLA = 8;

// Segmento de grosor variable (w0 y w1 son medios anchos)
function segmento(l, [x0, y0], [x1, y1], w0, w1, c) {
    const d = Math.hypot(x1 - x0, y1 - y0) || 1;
    const nx = -(y1 - y0) / d, ny = (x1 - x0) / d;
    return l.poligono([
        [x0 + nx * w0, y0 + ny * w0], [x1 + nx * w1, y1 + ny * w1],
        [x1 - nx * w1, y1 - ny * w1], [x0 - nx * w0, y0 - ny * w0]
    ], c);
}

// Pierna con bota de metal. lejos: la del fondo, un tono más oscura
function pierna(l, [cadera, rodilla, tobillo], lejos) {
    const c = lejos ? '2' : '3';
    segmento(l, cadera, rodilla, 2.5, 2, c);
    segmento(l, rodilla, tobillo, 2, 1.5, c);
    if (!lejos) l.linea(rodilla[0] - 1, rodilla[1] - 1, tobillo[0] - 1, tobillo[1], '4');
    const [x, y] = tobillo;
    l.poligono([[x - 3, y - 2], [x + 2, y - 2], [x + 5, y + 2], [x + 5, y + 3], [x - 3, y + 3]], lejos ? '3' : '4');
    return l.lineaH(x - 2, y - 1, 4, lejos ? '4' : '6').lineaH(x - 3, y + 3, 9, '2');
}

// Abrigo, cabeza y bufanda. dy: rebote del torso · cola: vuelo de la bufanda · faldon: vuelo del abrigo
function torso(l, { dy, cola, faldon }) {
    const y = v => v + dy;

    // Abrigo
    l.poligono([[10, y(20)], [20, y(20)], [22, y(33)], [23 - faldon / 2, y(42)], [23 - faldon, y(49)],
        [15 - faldon, y(51)], [7 - faldon * 1.5, y(49 - faldon / 2)], [8 - faldon / 2, y(35)]], '3');
    const enAbrigo = (px, py) => l.color(px, py) === '3';
    l.aclarar((px, py) => enAbrigo(px, py) && px < 14 && py < y(40));
    l.linea(12, y(36), 10 - faldon, y(49), '2').linea(17, y(36), 17 - faldon, y(50), '2').linea(13, y(37), 12 - faldon, y(47), '5');
    l.trazos((px, py) => enAbrigo(px, py) && px > 17 - faldon * (py - y(33)) / 16, '2', { separacion: 3, inclinacion: 1, rotura: 0.2, semilla: 3 });
    // Cinturón con hebilla, bolsa, solapa y remaches
    l.rect(9, y(33), 14, 3, '1').lineaH(9, y(33), 13, '5').rect(15, y(33), 3, 3, '6').punto(16, y(34), 'g');
    l.rect(19, y(36), 3, 4, 'b').lineaH(19, y(36), 3, 'c');
    l.linea(18, y(22), 19, y(32), '1');
    [24, 27, 30].forEach(v => l.punto(17, y(v), '6'));
    // Hombrera de placas
    l.poligono([[9, y(22)], [14, y(20)], [15, y(25)], [14, y(29)], [9, y(29)]], '5');
    l.linea(9, y(22), 14, y(20), '7').lineaH(9, y(26), 6, '3').punto(11, y(24), '8').punto(11, y(28), '7');

    // Capucha y hueco de la cara en sombra
    l.elipse(15, y(9), 6, 7, '4');
    l.poligono([[9, y(9)], [8, y(18)], [13, y(19)], [13, y(12)]], '4');
    l.aclarar((px, py) => l.color(px, py) === '4' && px + py - dy < 18);
    l.trazos((px, py) => l.color(px, py) === '4' && px < 11 && py > y(11), '3', { separacion: 2, inclinacion: -1, rotura: 0.2, semilla: 4 });
    l.poligono([[14, y(4)], [20, y(5)], [22, y(11)], [20, y(14)], [14, y(14)]], '1');
    l.linea(14, y(4), 14, y(14), '3').linea(14, y(2), 18, y(3), '7');
    // Mechones blancos bajo la capucha
    l.poligono([[15, y(5)], [20, y(6)], [19, y(7)], [18, y(9)], [17, y(7)], [16, y(8)]], '7');
    l.punto(16, y(5), '9').punto(18, y(6), '8').punto(20, y(6), 's');
    // Visor
    l.rect(15, y(9), 8, 3, '2').rect(16, y(9), 7, 2, 'g').lineaH(16, y(10), 7, 'f').lineaH(18, y(9), 4, 'h');
    l.rect(14, y(9), 2, 2, '5');

    // Bufanda subida hasta la nariz
    l.poligono([[11, y(16)], [15, y(13)], [22, y(13)], [22, y(16)], [20, y(20)], [12, y(21)]], 'c');
    l.linea(15, y(13), 22, y(13), 'd').linea(12, y(17), 21, y(16), 'b').linea(14, y(15), 20, y(15), 'd').linea(13, y(20), 19, y(19), 'b');
    return l;
}

// Cola de la bufanda, por detrás del abrigo
function colaBufanda(l, { dy, cola }) {
    const y = v => v + dy;
    l.poligono([[11, y(17)], [7 - cola, y(19)], [3 - cola, y(25 - cola)], [5 - cola, y(27 - cola)], [9, y(23)], [12, y(20)]], 'c');
    return l.linea(10, y(19), 5 - cola, y(25 - cola), 'b').linea(9, y(18), 6 - cola, y(21), 'd');
}

// Brazo con tinta propia para separarlo del abrigo; angulo (grados): pistola en la mano, null = puño vacío
function brazo(l, { codo, mano, angulo = null }, dy, [rx, ry] = [0, 0]) {
    const mover = ([x, y]) => [x + rx, y + ry + dy];
    const a = mover(HOMBRO), b = mover(codo), c = mover(mano);
    segmento(l, a, b, 3.5, 3, '0');
    segmento(l, b, c, 3, 2.5, '0');
    segmento(l, a, b, 2.5, 2, '4');
    segmento(l, b, c, 2, 1.5, '4');
    l.linea(a[0], a[1] - 2, b[0], b[1] - 2, '6').linea(b[0], b[1] - 2, c[0], c[1] - 1, '5');
    if (angulo !== null) {
        const rad = angulo * Math.PI / 180;
        const dir = [Math.cos(rad), Math.sin(rad)];
        const boca = [c[0] + dir[0] * LARGO_PISTOLA, c[1] + dir[1] * LARGO_PISTOLA - 1];
        // Empuñadura, perpendicular al cañón, y cañón con su filo de luz
        const inicio = [c[0], c[1] - 1];
        segmento(l, inicio, [c[0] - dir[1] * -3, c[1] + dir[0] * 3], 1.5, 1.5, '0');
        segmento(l, inicio, boca, 2, 2, '0');
        segmento(l, inicio, boca, 1, 1, '5');
        l.linea(inicio[0], inicio[1] - 1, boca[0], boca[1] - 1, '8');
        l.punto(Math.round(boca[0]), Math.round(boca[1]), 'g');
    }
    // Guante
    return l.circulo(Math.round(c[0]), Math.round(c[1]), 2, '0').circulo(Math.round(c[0]), Math.round(c[1]), 1, '3').punto(Math.round(c[0]) - 1, Math.round(c[1]) - 1, '6');
}

// Movimiento del cuerpo por frame de animación (piernas: [lejana, cercana] como cadera, rodilla, tobillo)
const ZANCADA = [[[13, 48], [8, 53], [3, 59]], [[18, 48], [24, 52], [24, 60]]];
const PASO = [[[15, 47], [12, 53], [8, 56]], [[17, 47], [18, 53], [17, 60]]];
const CUERPOS = [
    { dy: 0, cola: 0, faldon: 0, piernas: [[[13, 48], [13, 54], [12, 60]], [[18, 48], [19, 54], [18, 60]]] },
    { dy: 1, cola: 0, faldon: 0, piernas: [[[13, 48], [13, 54], [12, 60]], [[18, 48], [19, 54], [18, 60]]] },
    { dy: 1, cola: 3, faldon: 3, piernas: ZANCADA },
    { dy: 0, cola: 2, faldon: 1, piernas: PASO },
    { dy: 1, cola: 3, faldon: 3, piernas: [ZANCADA[1], ZANCADA[0]] },
    { dy: 0, cola: 2, faldon: 1, piernas: [PASO[1], PASO[0]] },
    // Saltar: piernas recogidas y el abrigo abierto hacia atrás
    { dy: 0, cola: 4, faldon: 3, piernas: [[[14, 47], [9, 50], [8, 56]], [[18, 47], [24, 49], [21, 56]]] }
];

// Poses del brazo en orden de bloque de frames (ver la cabecera de frames más abajo)
const FRENTE = { codo: [18, 30], mano: [23, 27] };
const ARRIBA = { codo: [20, 23], mano: [23, 15] };
const DIAGONAL = { codo: [19, 27], mano: [24, 20] };
const ABAJO = { codo: [18, 30], mano: [23, 33] };
const POSES = [
    [{ ...FRENTE, angulo: 0 }],
    [{ ...FRENTE, angulo: 0 }, [-2, -1]],
    [{ ...ARRIBA, angulo: -90 }],
    [{ ...ARRIBA, angulo: -90 }, [0, 2]],
    [{ ...DIAGONAL, angulo: -45 }],
    [{ ...DIAGONAL, angulo: -45 }, [-2, 2]],
    [FRENTE],
    [{ codo: [21, 23], mano: [24, 12] }],
    [{ codo: [19, 27], mano: [24, 19] }],
    [{ codo: [12, 31], mano: [15, 37] }],
    [{ ...ABAJO, angulo: 45 }],
    [{ ...ABAJO, angulo: 45 }, [-2, -2]]
];

function frame(cuerpo, [pose, retroceso]) {
    const l = new Lienzo(ANCHO, ALTO);
    pierna(l, cuerpo.piernas[0], true);
    colaBufanda(l, cuerpo);
    pierna(l, cuerpo.piernas[1], false);
    torso(l, cuerpo);
    brazo(l, pose, cuerpo.dy, retroceso);
    return l.entintar('0', { lados: ['abajo', 'derecha'], irregular: 0 });
}

export default {
    nombre: 'jugador',
    hd: true,
    ancho: ANCHO,
    alto: ALTO,
    // 12 bloques de 7 frames (quieto ×2, correr ×4, saltar), uno por pose del brazo:
    //   pistola: 0 frente · 1 frente con retroceso · 2 arriba · 3 arriba con retroceso · 4 diagonal · 5 diagonal con retroceso
    //   mano vacía (espada): 6 frente · 7 arriba · 8 diagonal · 9 reposo (brazo caído)
    //   pistola (solo con el ratón): 10 diagonal abajo · 11 diagonal abajo con retroceso
    // Las animaciones usan el bloque 0; GameScene suma 7 × bloque según hacia dónde apunta y si acaba de disparar.
    frames: () => POSES.flatMap(pose => CUERPOS.map(cuerpo => frame(cuerpo, pose))),
    animaciones: {
        quieto: { frames: [0, 1], fps: 2, repetir: -1 },
        correr: { frames: [2, 3, 4, 5], fps: 10, repetir: -1 },
        saltar: { frames: [6], fps: 1, repetir: 0 }
    }
};
