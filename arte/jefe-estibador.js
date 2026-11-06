// Jefe del capítulo 1: el Estibador. Humanoide negro de cuatro piernas, el doble de alto que el jugador,
// con garras metálicas de carga (para mover cajas) y visor de ranuras rojas. Mira a la derecha.
// Frames de 96x128, dibujados con las piezas de arte/ficha-estibador.js. Las tablas de poses están en
// unidades de media escala (centro 24, suelo 61): el dibujo las multiplica por 2.
//   0-3  caminar
//   4-5  garras en alto (preparar el zarpazo) · 6 zarpazo (frame de golpe) · 7 recuperar
//   8    cargar el ataque en área (agachado, garras al rojo) · 9 descarga
//   10   disparar bola de energía (garra al frente) · 11 rayo (ojos encendidos)
//   12   saltar · 13-15 morir
// Puntos de referencia (mirando a la derecha, relativos al centro del frame): ver JEFES en config/combate.js

import { Lienzo } from '../tools/pixel/lienzo.js';
import { miembro, garra, pie, torso, pistones, cabeza } from './ficha-estibador.js';

const ANCHO = 96;
const ALTO = 128;
const CX = 24;
const ANGULOS = { abajo: Math.PI / 2, frente: 0, arriba: -Math.PI / 2 };

const doble = ([x, y]) => [x * 2, y * 2];

// Extremidad con medios anchos de hombro a muñeca; oy: desplazamiento (media escala)
function extremidad(l, puntos, anchos, oy = 0) {
    return miembro(l, puntos.map(([x, y], i) => [...doble([x, y + oy]), anchos[i]]));
}

function brazoConGarra(l, { puntos, garra: orientacion }, datos = {}, oy = 0) {
    extremidad(l, puntos, [5, 4, 3], oy);
    const [x, y] = doble([puntos.at(-1)[0], puntos.at(-1)[1] + oy]);
    return garra(l, x, y, ANGULOS[orientacion], datos.abierta ? 3 : 0, datos);
}

// Pose completa, de atrás adelante: piernas traseras, brazo trasero, torso, piernas delanteras, brazo delantero
function pose({ oy = 0, piernas, brazoAtras, brazoFrente, garraAtras, garraFrente, ojos = 'tenue' }, i) {
    const l = new Lienzo(ANCHO, ALTO);
    const [pa, pf, ta, tf] = piernas;
    for (const t of [ta, tf]) {
        extremidad(l, t, [4, 3, 2]);
        const [x, y] = doble(t.at(-1));
        pie(l, x, y + 2, 6);
    }
    brazoConGarra(l, brazoAtras, garraAtras, oy);

    // Cable suelto de la cadera, que se balancea al caminar
    const vaiven = [-2, 0, 2, 0][i % 4];
    l.cable(34, 82 + oy * 2, 20 + vaiven, 104 + oy * 2, '3', 4).punto(20 + vaiven, 105 + oy * 2, 'b').punto(20 + vaiven, 106 + oy * 2, 'a');

    const nucleo = ojos === 'apagado' ? ['2', '1'] : i % 2 ? ['j', 'i'] : ['i', 'i'];
    const arriba = new Lienzo(ANCHO, ALTO);
    torso(arriba, nucleo);
    l.pegar(arriba, 0, oy * 2);

    for (const p of [pa, pf]) {
        extremidad(l, p, [5, 4, 3]);
        const [x, y] = doble(p.at(-1));
        pie(l, x, y + 2, 8);
    }
    brazoConGarra(l, brazoFrente, garraFrente, oy);

    const hombros = new Lienzo(ANCHO, ALTO);
    pistones(hombros);
    hombros.cable(44, 35, 27, 43, '4', 2).cable(61, 35, 72, 43, '3', 2).pegar(cabeza(ojos), 3, -11);
    l.pegar(hombros, 0, oy * 2);
    if (ojos === 'rojo') l.punto(62, 18 + oy * 2, 'j').punto(63, 18 + oy * 2, 'i').punto(64, 18 + oy * 2, 'i');   // destello del rayo
    return l.entintar('0', { lados: ['abajo', 'derecha'], irregular: 0 });
}

// Cuatro piernas: cadera → rodilla → pie (el pie apoya en la fila 61). Las dos primeras son el par
// delantero; las dos últimas, el trasero: más abierto, con las rodillas altas y hacia fuera, y por
// defecto a contratiempo (pasoTrasero = -paso) para que al caminar se alternen.
const piernas = (paso, oy = 0, pasoTrasero = -paso) => [
    [[CX - 4, 41 + oy], [CX - 6 - paso, 51 + Math.round(oy / 2)], [CX - 6 - paso * 2, 60]],
    [[CX + 4, 41 + oy], [CX + 6 + paso, 51 + Math.round(oy / 2)], [CX + 5 + paso * 2, 60]],
    [[CX - 7, 39 + oy], [CX - 18 - pasoTrasero, 50 + Math.round(oy / 2)], [Math.max(5, CX - 18 - Math.round(pasoTrasero / 2)), 60]],
    [[CX + 6, 39 + oy], [CX + 17 + pasoTrasero, 50 + Math.round(oy / 2)], [Math.min(42, CX + 17 + Math.round(pasoTrasero / 2)), 60]]
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
        brazoAtras: { puntos: [[CX - 12, 21], [CX - 18, 19], [CX - 15, 15]], garra: 'arriba' },
        brazoFrente: { puntos: [[CX + 11, 21], [CX + 18, 19], [CX + 15, 15]], garra: 'arriba' },
        garraAtras: { abierta: true }, garraFrente: { abierta: true }
    },
    {
        oy: -1, piernas: piernas(1),
        brazoAtras: { puntos: [[CX - 12, 21], [CX - 17, 19], [CX - 14, 16]], garra: 'arriba' },
        brazoFrente: { puntos: [[CX + 11, 21], [CX + 19, 19], [CX + 16, 16]], garra: 'arriba' },
        garraAtras: { abierta: true }, garraFrente: { abierta: true }
    },
    {
        oy: 2, piernas: piernas(3, 2),
        brazoAtras: { puntos: [[CX - 12, 22], [CX - 2, 30], [CX + 8, 36]], garra: 'frente' },
        brazoFrente: { puntos: [[CX + 11, 22], [CX + 11, 27], [CX + 10, 28]], garra: 'frente' }
    },
    {
        oy: 1, piernas: piernas(2, 1),
        brazoAtras: { puntos: [[CX - 12, 21], [CX - 14, 31], [CX - 10, 40]], garra: 'abajo' },
        brazoFrente: { puntos: [[CX + 11, 21], [CX + 17, 30], [CX + 18, 38]], garra: 'abajo' }
    },
    // cargar (agachado, garras abiertas al rojo) · descarga
    {
        oy: 3, piernas: piernas(4, 3, 3),
        brazoAtras: { puntos: [[CX - 12, 21], [CX - 17, 30], [CX - 16, 38]], garra: 'abajo' },
        brazoFrente: { puntos: [[CX + 11, 21], [CX + 16, 30], [CX + 15, 38]], garra: 'abajo' },
        garraAtras: { abierta: true, brillo: true }, garraFrente: { abierta: true, brillo: true }
    },
    {
        oy: -1, piernas: piernas(5, 0, 3),
        brazoAtras: { puntos: [[CX - 12, 21], [CX - 18, 19], [CX - 16, 15]], garra: 'arriba' },
        brazoFrente: { puntos: [[CX + 11, 21], [CX + 17, 19], [CX + 15, 15]], garra: 'arriba' },
        garraAtras: { abierta: true, brillo: true }, garraFrente: { abierta: true, brillo: true }
    },
    // disparar: garra delantera al frente, abierta y al rojo (de ahí sale la bola)
    {
        piernas: piernas(2),
        brazoAtras: colgando().brazoAtras,
        brazoFrente: { puntos: [[CX + 11, 21], [CX + 11, 23], [CX + 10, 23]], garra: 'frente' },
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
        brazoAtras: { puntos: [[CX - 12, 19], [CX - 17, 24], [CX - 17, 31]], garra: 'abajo' },
        brazoFrente: { puntos: [[CX + 11, 19], [CX + 16, 24], [CX + 16, 31]], garra: 'abajo' }
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
        brazoAtras: { puntos: [[CX - 12, 21], [CX - 18, 28], [CX - 17, 34]], garra: 'abajo' },
        brazoFrente: { puntos: [[CX + 11, 21], [CX + 17, 28], [CX + 16, 34]], garra: 'abajo' }
    }
];

export default {
    nombre: 'jefe-estibador',
    hd: true,
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
