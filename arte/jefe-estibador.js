// Jefe del capítulo 1: el Estibador. Humanoide negro de cuatro piernas, doble tamaño que el jugador, con garras
// metálicas de carga (para mover cajas) y ojos metálicos. Mira a la derecha. Frames de 48x64.
// Cuerpo casi negro con luz de borde ('3'/'4') para que se lea sobre el fondo oscuro del almacén.
//   0-3  caminar
//   4-5  garras en alto (preparar el zarpazo) · 6 zarpazo (frame de golpe) · 7 recuperar
//   8    cargar el ataque en área (agachado, garras al rojo) · 9 descarga
//   10   disparar bola de energía (garra al frente) · 11 rayo (ojos encendidos)
//   12   saltar · 13-15 morir
// Puntos de referencia (mirando a la derecha, relativos al centro del frame): ver JEFES en config/combate.js

import { Lienzo, ruido } from '../tools/pixel/lienzo.js';

const ANCHO = 48;
const ALTO = 64;
const CX = 24;

// Garra de carga apuntando hacia abajo (11x11); el enganche con el brazo es la fila 0, columna 5
const CABEZA_GARRA = [
    '...00000...',
    '..0577750..',
    '.067888760.',
    '.067777760.',
    '0670...0760'
];
const GARRA = [
    ...CABEZA_GARRA,
    '070.....070',
    '070.....070',
    '070.....070',
    '080.....080',
    '.080...080.',
    '..0.....0..'
];
const GARRA_ABIERTA = [
    ...CABEZA_GARRA,
    '670.....076',
    '70.......07',
    '70.......07',
    '80.......08',
    '0.........0',
    '...........'
];
const TG = 11;

// Gira un lienzo 90° en sentido horario
function rotar(l) {
    const r = new Lienzo(l.alto, l.ancho);
    for (let y = 0; y < l.alto; y++) for (let x = 0; x < l.ancho; x++) r.px[x][l.alto - 1 - y] = l.px[y][x];
    return r;
}

// Garra según orientación: 'abajo', 'frente' (derecha), 'arriba'. brillo: puntas al rojo (carga)
function garra(orientacion, { abierta = false, brillo = false } = {}) {
    let g = Lienzo.desdeTexto(abierta ? GARRA_ABIERTA : GARRA, TG, TG, 'jefe.garra');
    if (brillo) g.px = g.px.map(f => f.map(c => (c === '8' ? 'j' : c === '7' ? 'i' : c)));
    if (orientacion === 'frente') g = rotar(rotar(rotar(g)));
    if (orientacion === 'arriba') g = rotar(rotar(g));
    return g;
}

// Línea gruesa de w px
function grueso(l, x0, y0, x1, y1, w, c) {
    const o = Math.floor((w - 1) / 2);
    for (let dx = -o; dx < w - o; dx++) for (let dy = -o; dy < w - o; dy++) l.linea(x0 + dx, y0 + dy, x1 + dx, y1 + dy, c);
    return l;
}

// Extremidad articulada: contorno negro, relleno oscuro y una línea de luz por arriba
function miembro(l, puntos, w, color = '2') {
    for (let i = 1; i < puntos.length; i++) grueso(l, ...puntos[i - 1], ...puntos[i], w + 2, '0');
    for (let i = 1; i < puntos.length; i++) grueso(l, ...puntos[i - 1], ...puntos[i], w, color);
    for (let i = 1; i < puntos.length; i++) {
        const [x0, y0] = puntos[i - 1], [x1, y1] = puntos[i];
        l.linea(x0, y0 - 1, x1, y1 - 1, '3');
    }
    for (const [x, y] of puntos.slice(1, -1)) l.rect(x - 1, y - 1, 3, 3, '3').punto(x, y - 1, '5');   // articulaciones
    return l;
}

// Pega una garra con su enganche en (x, y)
function ponerGarra(l, g, x, y, orientacion) {
    if (orientacion === 'abajo') return l.pegar(g, x - 5, y);
    if (orientacion === 'arriba') return l.pegar(g, x - 5, y - TG + 1);
    return l.pegar(g, x, y - 5);   // frente
}

// Torso y cabeza (oy: desplazamiento vertical, ojos: 'metal' | 'rojo' | 'apagado', i: índice del frame)
function cuerpo(l, oy, ojos, i) {
    // cable suelto que cuelga de la cadera trasera y se balancea al caminar (detrás del torso)
    const vaiven = [-1, 0, 1, 0][i % 4];
    l.cable(CX - 8, 38 + oy, CX - 9 + vaiven, 44 + oy, '3', 2).punto(CX - 9 + vaiven, 45 + oy, 'b');
    // torso: hombros anchos que se estrechan hacia la cintura
    for (let y = 18; y <= 42; y++) {
        const m = y < 23 ? 13 : y < 37 ? Math.round(13 - (y - 23) * 5 / 14) : 9;
        const x0 = CX - m, x1 = CX + m - 1;
        l.lineaH(x0, y + oy, x1 - x0 + 1, '1');
        l.punto(x0, y + oy, '0').punto(x1, y + oy, '0');
        l.punto(x1 - 1, y + oy, '3');                                       // borde delantero iluminado
    }
    l.lineaH(CX - 13, 17 + oy, 26, '0').lineaH(CX - 12, 18 + oy, 24, '4').lineaH(CX - 12, 19 + oy, 24, '3');
    // volumen: la parte alta del pecho recibe la luz de arriba, con la costura tramada
    l.degradado(CX - 11, 20 + oy, 22, 8, '21', { costura: 0.4, zona: (x, y) => l.color(x, y) === '1' });
    // placas del pecho, columna y cintura
    l.lineaH(CX - 10, 26 + oy, 20, '0').lineaH(CX - 10, 27 + oy, 20, '2');
    l.lineaH(CX - 8, 32 + oy, 16, '0').lineaH(CX - 8, 33 + oy, 16, '2');
    l.lineaV(CX, 20 + oy, 16, '2');
    l.rect(CX - 9, 37 + oy, 18, 2, '2').lineaH(CX - 9, 37 + oy, 18, '3');
    l.patron(CX - 11, 20 + oy, 22, 16, (x, y) => (ruido(x, y, 61) > 0.95 ? '2' : null));
    l.patron(CX - 11, 20 + oy, 22, 16, (x, y) => (ruido(x, y, 62) > 0.985 ? '3' : null));      // arañazos
    [-8, -4, 4, 8].forEach(dx => l.punto(CX + dx, 27 + oy, '4').punto(CX + dx, 33 + oy, '3'));   // remaches de las placas
    // núcleo de energía bajo la placa del pecho: late en rojo (apagado al morir)
    const latido = ojos === 'apagado' ? ['2', '1'] : i % 2 ? ['j', 'i'] : ['i', 'i'];
    l.rect(CX + 2, 29 + oy, 5, 3, '0').lineaH(CX + 3, 30 + oy, 3, latido[1]).punto(CX + 4, 30 + oy, latido[0]);
    // tubos del cuello a los hombros
    l.cable(CX - 3, 16 + oy, CX - 10, 18 + oy, '3', 1).cable(CX + 2, 16 + oy, CX + 9, 18 + oy, '3', 1);
    // pistones de los hombros
    l.rect(CX - 14, 19 + oy, 4, 6, '2').marco(CX - 14, 19 + oy, 4, 6, '0').punto(CX - 13, 20 + oy, '5');
    l.rect(CX + 10, 19 + oy, 4, 6, '2').marco(CX + 10, 19 + oy, 4, 6, '0').punto(CX + 12, 20 + oy, '5');
    l.lineaV(CX - 12, 21 + oy, 3, '4').lineaV(CX + 11, 21 + oy, 3, '4');                      // vástagos de los pistones
    l.punto(CX - 13, 25 + oy, 'b').punto(CX - 13, 26 + oy, 'a');                              // óxido que chorrea
    // cuello y cabeza
    l.rect(CX - 3, 14 + oy, 6, 4, '1').lineaV(CX - 3, 14 + oy, 4, '0').lineaV(CX + 2, 14 + oy, 4, '0');
    l.rect(CX - 6, 3 + oy, 12, 12, '1').marco(CX - 6, 3 + oy, 12, 12, '0');
    l.punto(CX - 6, 3 + oy, '.').punto(CX + 5, 3 + oy, '.');
    l.lineaH(CX - 5, 4 + oy, 10, '4').lineaH(CX - 5, 5 + oy, 10, '3');
    l.lineaV(CX + 4, 5 + oy, 9, '3');
    // visor y ojos metálicos (dos ranuras al frente)
    l.rect(CX - 2, 8 + oy, 8, 3, '0');
    const [o1, o2] = ojos === 'rojo' ? ['9', 'j'] : ojos === 'apagado' ? ['3', '2'] : ['9', '7'];
    l.lineaH(CX, 9 + oy, 2, o1).lineaH(CX + 3, 9 + oy, 2, o1);
    l.punto(CX, 10 + oy, o2).punto(CX + 3, 10 + oy, o2);
    if (ojos === 'rojo') l.punto(CX + 6, 9 + oy, 'j').punto(CX + 7, 9 + oy, 'i');   // destello del rayo
    // rejilla de la mandíbula
    for (let x = CX - 1; x < CX + 5; x += 2) l.lineaV(x, 12 + oy, 2, '2');
    for (let y = 7; y < 13; y += 2) l.lineaH(CX - 4, y + oy, 3, '2');                         // rejilla lateral del casco
    return l;
}

// Pose completa: piernas, brazos y garras alrededor del cuerpo
function pose({ oy = 0, piernas, brazoAtras, brazoFrente, garraAtras, garraFrente, ojos = 'metal' }, i) {
    const l = new Lienzo(ANCHO, ALTO);
    const [pa, pf, ta, tf] = piernas;
    // par trasero: más fino que el delantero y abierto hacia fuera (asoma bajo las garras), detrás de todo
    for (const t of [ta, tf]) {
        miembro(l, t, 3);
        const [x, y] = t.at(-1);
        l.rect(x - 3, y + 1, 6, 3, '0').rect(x - 2, y + 1, 4, 2, '2');
    }
    miembro(l, brazoAtras.puntos.map(([x, y]) => [x, y + oy]), 3);
    ponerGarra(l, garra(brazoAtras.garra, garraAtras), ...brazoAtras.puntos.at(-1).map((v, i) => v + (i ? oy : 0)), brazoAtras.garra);
    miembro(l, pa, 4);
    const [xa, ya] = pa.at(-1), [xf, yf] = pf.at(-1);
    l.rect(xa - 3, ya + 1, 7, 3, '0').rect(xa - 2, ya + 1, 5, 2, '2');   // pie trasero
    cuerpo(l, oy, ojos, i);
    miembro(l, pf, 4);
    l.rect(xf - 3, yf + 1, 8, 3, '0').rect(xf - 2, yf + 1, 6, 2, '3').lineaH(xf - 2, yf + 1, 6, '4');
    miembro(l, brazoFrente.puntos.map(([x, y]) => [x, y + oy]), 3);
    ponerGarra(l, garra(brazoFrente.garra, garraFrente), ...brazoFrente.puntos.at(-1).map((v, i) => v + (i ? oy : 0)), brazoFrente.garra);
    return l;
}

// Cuatro piernas: cadera → rodilla → pie (el pie apoya en la fila 61). Las dos primeras son el par
// delantero; las dos últimas, el trasero: más abierto, con las rodillas altas y hacia fuera, y por
// defecto a contratiempo (pasoTrasero = -paso) para que al caminar se alternen.
const piernas = (paso, oy = 0, pasoTrasero = -paso) => [
    [[CX - 4, 41 + oy], [CX - 6 - paso, 51 + Math.round(oy / 2)], [CX - 6 - paso * 2, 60]],
    [[CX + 4, 41 + oy], [CX + 6 + paso, 51 + Math.round(oy / 2)], [CX + 5 + paso * 2, 60]],
    [[CX - 7, 39 + oy], [CX - 18 - pasoTrasero, 50 + Math.round(oy / 2)], [CX - 20 - Math.round(pasoTrasero / 2), 60]],
    [[CX + 6, 39 + oy], [CX + 17 + pasoTrasero, 50 + Math.round(oy / 2)], [CX + 19 + Math.round(pasoTrasero / 2), 60]]
];
const colgando = (vaiven = 0) => ({
    brazoAtras: { puntos: [[CX - 12, 21], [CX - 16 - vaiven, 31], [CX - 15 - vaiven, 41]], garra: 'abajo' },
    brazoFrente: { puntos: [[CX + 11, 21], [CX + 15 + vaiven, 31], [CX + 14 + vaiven, 41]], garra: 'abajo' }
});

const POSES = [
    // caminar
    { piernas: piernas(3), ...colgando(-1) },
    { oy: 1, piernas: piernas(0, 1), ...colgando(0) },
    { piernas: piernas(-3), ...colgando(1) },
    { oy: 1, piernas: piernas(0, 1), ...colgando(0) },
    // garras en alto (2) · zarpazo · recuperar
    {
        piernas: piernas(1),
        brazoAtras: { puntos: [[CX - 12, 21], [CX - 16, 14], [CX - 11, 9]], garra: 'arriba' },
        brazoFrente: { puntos: [[CX + 11, 21], [CX + 16, 14], [CX + 12, 9]], garra: 'arriba' },
        garraAtras: { abierta: true }, garraFrente: { abierta: true }
    },
    {
        oy: -1, piernas: piernas(1),
        brazoAtras: { puntos: [[CX - 12, 21], [CX - 15, 13], [CX - 10, 9]], garra: 'arriba' },
        brazoFrente: { puntos: [[CX + 11, 21], [CX + 17, 13], [CX + 13, 9]], garra: 'arriba' },
        garraAtras: { abierta: true }, garraFrente: { abierta: true }
    },
    {
        oy: 2, piernas: piernas(3, 2),
        brazoAtras: { puntos: [[CX - 12, 22], [CX - 2, 30], [CX + 12, 36]], garra: 'frente' },
        brazoFrente: { puntos: [[CX + 11, 22], [CX + 15, 28], [CX + 15, 30]], garra: 'frente' }
    },
    {
        oy: 1, piernas: piernas(2, 1),
        brazoAtras: { puntos: [[CX - 12, 21], [CX - 14, 31], [CX - 10, 40]], garra: 'abajo' },
        brazoFrente: { puntos: [[CX + 11, 21], [CX + 17, 30], [CX + 18, 38]], garra: 'abajo' }
    },
    // cargar (agachado, garras abiertas al rojo) · descarga
    {
        oy: 3, piernas: piernas(4, 3, 3),
        brazoAtras: { puntos: [[CX - 12, 21], [CX - 18, 30], [CX - 19, 38]], garra: 'abajo' },
        brazoFrente: { puntos: [[CX + 11, 21], [CX + 17, 30], [CX + 18, 38]], garra: 'abajo' },
        garraAtras: { abierta: true, brillo: true }, garraFrente: { abierta: true, brillo: true }
    },
    {
        oy: -1, piernas: piernas(5, 0, 3),
        brazoAtras: { puntos: [[CX - 12, 21], [CX - 18, 16], [CX - 19, 10]], garra: 'arriba' },
        brazoFrente: { puntos: [[CX + 11, 21], [CX + 17, 16], [CX + 18, 10]], garra: 'arriba' },
        garraAtras: { abierta: true, brillo: true }, garraFrente: { abierta: true, brillo: true }
    },
    // disparar: garra delantera al frente, abierta y al rojo (de ahí sale la bola)
    {
        piernas: piernas(2),
        brazoAtras: colgando().brazoAtras,
        brazoFrente: { puntos: [[CX + 11, 21], [CX + 15, 23], [CX + 15, 23]], garra: 'frente' },
        garraFrente: { abierta: true, brillo: true }
    },
    // rayo: ojos encendidos
    { piernas: piernas(1), ...colgando(0), ojos: 'rojo' },
    // saltar: piernas recogidas, brazos abiertos
    {
        oy: -2,
        piernas: [
            [[CX - 4, 39], [CX - 10, 45], [CX - 6, 52]], [[CX + 4, 39], [CX + 10, 44], [CX + 7, 51]],
            [[CX - 7, 37], [CX - 16, 41], [CX - 14, 49]], [[CX + 6, 37], [CX + 15, 41], [CX + 13, 49]]
        ],
        brazoAtras: { puntos: [[CX - 12, 19], [CX - 18, 24], [CX - 20, 31]], garra: 'abajo' },
        brazoFrente: { puntos: [[CX + 11, 19], [CX + 17, 24], [CX + 19, 31]], garra: 'abajo' }
    },
    // morir: rodillas, se encorva, se desploma (ojos apagados)
    { oy: 4, piernas: piernas(5, 4, 2), ...colgando(1), ojos: 'apagado' },
    {
        oy: 9, piernas: piernas(7, 9, 4), ojos: 'apagado',
        brazoAtras: { puntos: [[CX - 12, 21], [CX - 16, 30], [CX - 17, 38]], garra: 'abajo' },
        brazoFrente: { puntos: [[CX + 11, 21], [CX + 16, 30], [CX + 17, 38]], garra: 'abajo' }
    },
    {
        oy: 14, piernas: piernas(9, 14, 5), ojos: 'apagado',
        brazoAtras: { puntos: [[CX - 12, 21], [CX - 20, 28], [CX - 22, 34]], garra: 'abajo' },
        brazoFrente: { puntos: [[CX + 11, 21], [CX + 19, 28], [CX + 21, 34]], garra: 'abajo' }
    }
];

export default {
    nombre: 'jefe-estibador',
    ancho: ANCHO,
    alto: ALTO,
    frames: () => POSES.map(pose),
    animaciones: {
        caminar: { frames: [0, 1, 2, 3], fps: 5, repetir: -1 },
        // el golpe se comprueba en el frame 6 (frameGolpe de JEFES.estibador)
        zarpazo: { frames: [4, 5, 4, 5, 6, 6, 7], fps: 9, repetir: 0 },
        cargar: { frames: [8], fps: 1, repetir: 0 },
        descarga: { frames: [9], fps: 1, repetir: 0 },
        disparar: { frames: [10], fps: 1, repetir: 0 },
        rayo: { frames: [11], fps: 1, repetir: 0 },
        saltar: { frames: [12], fps: 1, repetir: 0 },
        morir: { frames: [13, 14, 15], fps: 4, repetir: 0 }
    }
};
