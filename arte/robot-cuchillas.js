// Enemigo: robot humanoide blanco desaturado que camina a cuatro patas más dos brazos-cuchilla
// (6 extremidades apoyadas en el suelo). Mira a la derecha. Frames de 32x24:
//   0-3 caminar (marcha en trípode: 3 extremidades avanzan mientras las otras 3 apoyan)
//   4-6 morir (destello, rotura, chispas)
//   7-9 atacar (preparar: se yergue con las dos cuchillas en alto · tajo: estocada doble con estela · recuperar)
// Cuerpo: blanco/gris azulado ('6'-'9') con contorno '0', ojo rojo ('j'), cuchillas en '9' con lomo '6'.

import { Lienzo, ruido } from '../tools/pixel/lienzo.js';

const ANCHO = 32;
const ALTO = 24;
const SUELO = 23;

// Extremidades: cadera (en el torso), pie en reposo, lado (cerca/lejos) y grupo de marcha (0/1).
// Patas traseras = piernas; patas medias = brazos humanos; delanteras = cuchillas.
const PATAS = [
    { cadera: [9, 12],  pie: 4,  cerca: false, grupo: 0 },
    { cadera: [10, 12], pie: 7,  cerca: true,  grupo: 1 },
    { cadera: [16, 12], pie: 14, cerca: false, grupo: 1 },
    { cadera: [17, 12], pie: 17, cerca: true,  grupo: 0 }
];
const BRAZOS = [
    { hombro: [20, 10], cerca: false, grupo: 0 },
    { hombro: [21, 11], cerca: true,  grupo: 1 }
];

// Desplazamiento del pie y elevación según la fase de marcha (0-3) y el grupo; null = apoyado y quieto
function zancada(fase, grupo) {
    if (fase === null) return [0, 0];
    const f = (fase + grupo * 2) % 4;
    return [[-2, 0], [0, 2], [2, 0], [0, 0]][f];   // [dx, elevación]
}

function pata(l, { cadera, pie, cerca, grupo }, fase) {
    const [dx, alto] = zancada(fase, grupo);
    const [hx, hy] = cadera;
    const fx = pie + dx, fy = SUELO - alto;
    const rodilla = [Math.round((hx + fx) / 2) - 2, hy + 5 - alto];   // rodilla hacia atrás y abajo, como al gatear
    const c = cerca ? '8' : '5';
    l.linea(hx, hy, rodilla[0], rodilla[1], c);
    l.linea(rodilla[0], rodilla[1], fx, fy, c);
    if (cerca) l.linea(hx + 1, hy, rodilla[0] + 1, rodilla[1], '7');  // muslo de 2 px en el lado cercano
    l.punto(rodilla[0], rodilla[1], cerca ? '9' : '6');               // articulación
    l.punto(fx, fy, '3');                                              // punta del pie
}

// Brazo-cuchilla: antebrazo corto y hoja ancha que se clava delante como un pie
function brazo(l, { hombro, cerca, grupo }, fase) {
    const [dx, alto] = zancada(fase, grupo);
    const [sx, sy] = hombro;
    cuchilla(l, hombro, [sx + 3, sy + 4 - alto], [30 + dx, SUELO - alto], cerca);
}

// Antebrazo del hombro al codo y hoja del codo a la punta (lomo, cuerpo y filo)
function cuchilla(l, [sx, sy], codo, punta, cerca) {
    l.linea(sx, sy, codo[0], codo[1], cerca ? '8' : '5');
    // Grosor perpendicular a la hoja: hacia abajo si es más horizontal, hacia un lado si es más vertical
    const horizontal = Math.abs(punta[0] - codo[0]) >= Math.abs(punta[1] - codo[1]);
    const [gx, gy] = horizontal ? [0, 1] : [-1, 0];
    l.linea(codo[0] + 2 * gx, codo[1] + 2 * gy, punta[0] + gx, punta[1] + gy, cerca ? '6' : '3');
    l.linea(codo[0] + gx, codo[1] + gy, punta[0], punta[1], cerca ? '8' : '5');
    l.linea(codo[0], codo[1], punta[0], punta[1], cerca ? '9' : '6');
    l.punto(codo[0], codo[1], '0');                                    // empuñadura en el codo
}

function cuerpo(l, fase) {
    const b = fase % 2;                                     // el torso sube y baja 1 px
    // Torso humano a gatas: cadera estrecha detrás, pecho ancho delante
    l.rect(7, 9 + b, 9, 5, '0');                            // contorno cadera/cintura
    l.rect(14, 7 + b, 9, 7, '0');                           // contorno pecho
    l.rect(8, 10 + b, 8, 3, '7');
    l.lineaH(8, 10 + b, 8, '8');
    l.rect(15, 8 + b, 7, 5, '8');
    l.lineaH(15, 8 + b, 7, '9');                            // luz desde arriba
    l.lineaH(15, 12 + b, 7, '6');
    l.lineaH(8, 12 + b, 7, '6');
    [9, 11, 13].forEach(x => l.punto(x, 11 + b, '6'));      // vértebras
    l.punto(17, 10 + b, '7').punto(19, 10 + b, '7');        // placas del pecho
    // Cuello y cabeza redondeada sin rostro, con ranura de ojo roja
    l.rect(22, 7 + b, 2, 3, '0').punto(22, 8 + b, '6');
    l.rect(23, 2 + b, 7, 7, '0');
    l.rect(24, 3 + b, 5, 5, '8');
    l.lineaH(24, 3 + b, 5, '9').lineaH(24, 7 + b, 5, '6');
    l.punto(23, 2 + b, '.').punto(29, 2 + b, '.').punto(23, 8 + b, '.').punto(29, 8 + b, '.');
    l.lineaH(26, 5 + b, 3, 'j').punto(28, 5 + b, 'i');
    return l;
}

function caminar(fase) {
    const l = new Lienzo(ANCHO, ALTO);
    // Primero lo lejano, luego el cuerpo, luego lo cercano
    PATAS.filter(p => !p.cerca).forEach(p => pata(l, p, fase));
    BRAZOS.filter(b => !b.cerca).forEach(b => brazo(l, b, fase));
    cuerpo(l, fase);
    PATAS.filter(p => p.cerca).forEach(p => pata(l, p, fase));
    BRAZOS.filter(b => b.cerca).forEach(b => brazo(l, b, fase));
    return l;
}

// Ataque con las dos cuchillas. ox/oy desplazan el cuerpo (erguirse, lanzarse);
// las patas siguen apoyadas y cada cuchilla tiene su pose (codo relativo al hombro, punta absoluta).
const POSES_ATAQUE = {
    preparar: {
        ox: -1, oy: -2,
        lejos: { codo: [1, -5], punta: [17, 0] },
        cerca: { codo: [2, -4], punta: [19, 1] }
    },
    tajo: {
        ox: 1, oy: 0,
        lejos: { codo: [2, 1], punta: [31, 12] },
        cerca: { codo: [2, 3], punta: [31, 17] },
        estela: true
    }
};

function atacar(nombre) {
    const pose = POSES_ATAQUE[nombre];
    const l = new Lienzo(ANCHO, ALTO);
    const desplazar = ([x, y]) => [x + pose.ox, y + pose.oy];
    const patas = PATAS.map(p => ({ ...p, cadera: desplazar(p.cadera) }));
    const hombros = BRAZOS.map(b => desplazar(b.hombro));
    const brazoPose = (i, p) => {
        const [sx, sy] = hombros[i];
        cuchilla(l, hombros[i], [sx + p.codo[0], sy + p.codo[1]], p.punta, BRAZOS[i].cerca);
    };

    patas.filter(p => !p.cerca).forEach(p => pata(l, p, null));
    brazoPose(0, pose.lejos);
    l.pegar(cuerpo(new Lienzo(ANCHO, ALTO), 0), pose.ox, pose.oy);
    patas.filter(p => p.cerca).forEach(p => pata(l, p, null));
    brazoPose(1, pose.cerca);

    if (pose.estela) {
        // Estela del tajo: arco cian delante, de arriba abajo
        for (let a = -80; a <= 30; a += 6) {
            const rad = a * Math.PI / 180;
            const x = Math.round(21 + Math.cos(rad) * 10), y = Math.round(13 + Math.sin(rad) * 10);
            l.punto(x, y, 'h');
            if (a > -60) l.punto(x - 1, y, 'g');
        }
    }
    return l;
}

function destello() {
    const l = caminar(0);
    return l.patron(0, 0, ANCHO, ALTO, (x, y) => {
        const c = l.px[y][x];
        return c !== '.' && c !== '0' && c !== 'j' ? 'h' : null;
    });
}

function rotura() {
    const base = caminar(2);
    const l = new Lienzo(ANCHO, ALTO);
    for (let y = 0; y < ALTO; y++) {
        for (let x = 0; x < ANCHO; x++) {
            const c = base.px[y][x];
            if (c === '.' || ruido(x >> 2, y >> 2, 11) > 0.65) continue;
            l.punto(x + Math.sign(x - 16) * 2, y + (y < 12 ? -1 : 1), c);
        }
    }
    return l.rect(15, 9, 3, 2, 'j').punto(16, 9, '9');
}

function chispas() {
    const l = new Lienzo(ANCHO, ALTO);
    for (let i = 0; i < 16; i++) {
        const x = Math.floor(ruido(i, 3, 13) * ANCHO), y = Math.floor(8 + ruido(i, 4, 13) * 16);
        l.punto(x, y, ['j', '9', '7', 'h'][i % 4]);
    }
    return l;
}

export default {
    nombre: 'robot-cuchillas',
    ancho: ANCHO,
    alto: ALTO,
    frames: () => [
        caminar(0), caminar(1), caminar(2), caminar(3),
        destello(), rotura(), chispas(),
        atacar('preparar'), atacar('tajo'), caminar(3)
    ],
    animaciones: {
        caminar: { frames: [0, 1, 2, 3], fps: 8, repetir: -1 },
        morir: { frames: [4, 5, 6], fps: 12, repetir: 0 },
        // Preparación más larga (2 ticks) para que el jugador pueda reaccionar; el golpe es el frame 8
        atacar: { frames: [7, 7, 8, 8, 9], fps: 8, repetir: 0 }
    }
};
