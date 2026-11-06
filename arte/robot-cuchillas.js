// Enemigo: robot humanoide blanco desaturado que camina a cuatro patas más dos brazos-cuchilla
// (6 extremidades apoyadas en el suelo). Mira a la derecha. Frames de 64x48:
//   0-3 caminar (marcha en trípode: 3 extremidades avanzan mientras las otras 3 apoyan)
//   4-6 morir (destello, rotura, chispas)
//   7-9 atacar (preparar: se yergue con las dos cuchillas en alto · tajo: estocada doble con estela · recuperar)
// Cuerpo: blanco/gris azulado ('6'-'9') con contorno '0', ojo rojo ('j'), cuchillas en '9' con lomo '6'.

import { Lienzo, ruido } from '../tools/pixel/lienzo.js';
import { segmento } from './ficha-estibador.js';

const ANCHO = 64;
const ALTO = 48;
const SUELO = 46;

// Extremidades: cadera (en el torso), pie en reposo, lado (cerca/lejos) y grupo de marcha (0/1).
// Patas traseras = piernas; patas medias = brazos humanos; delanteras = cuchillas.
const PATAS = [
    { cadera: [18, 24], pie: 8,  cerca: false, grupo: 0 },
    { cadera: [20, 24], pie: 14, cerca: true,  grupo: 1 },
    { cadera: [32, 24], pie: 28, cerca: false, grupo: 1 },
    { cadera: [34, 24], pie: 34, cerca: true,  grupo: 0 }
];
const BRAZOS = [
    { hombro: [40, 20], cerca: false, grupo: 0 },
    { hombro: [42, 22], cerca: true,  grupo: 1 }
];

// Desplazamiento del pie y elevación según la fase de marcha (0-3) y el grupo; null = apoyado y quieto
function zancada(fase, grupo) {
    if (fase === null) return [0, 0];
    const f = (fase + grupo * 2) % 4;
    return [[-4, 0], [0, 4], [4, 0], [0, 0]][f];   // [dx, elevación]
}

function pata(l, { cadera, pie, cerca, grupo }, fase) {
    const [dx, alto] = zancada(fase, grupo);
    const [hx, hy] = cadera;
    const fx = pie + dx, fy = SUELO - alto;
    const rodilla = [Math.round((hx + fx) / 2) - 4, hy + 10 - alto];   // rodilla hacia atrás y abajo, como al gatear
    const [c, luz, ancho] = cerca ? ['7', '9', 2.5] : ['4', '6', 1.5];
    segmento(l, [hx, hy], rodilla, ancho + 1, ancho, '0');
    segmento(l, rodilla, [fx, fy], ancho, 1, '0');
    segmento(l, [hx, hy], rodilla, ancho, ancho - 0.5, c);
    segmento(l, rodilla, [fx, fy], ancho - 0.5, 0.5, c);
    l.linea(hx - 1, hy - 1, rodilla[0] - 1, rodilla[1] - 1, luz);
    // Rótula y punta del pie
    l.circulo(rodilla[0], rodilla[1], 2, '0').rect(rodilla[0] - 1, rodilla[1] - 1, 2, 2, cerca ? '9' : '6');
    l.rect(fx - 1, fy, 3, 2, '3').punto(fx, fy, '5');
}

// Brazo-cuchilla: antebrazo corto y hoja ancha que se clava delante como un pie
function brazo(l, { hombro, cerca, grupo }, fase) {
    const [dx, alto] = zancada(fase, grupo);
    const [sx, sy] = hombro;
    cuchilla(l, hombro, [sx + 6, sy + 8 - alto], [60 + dx, SUELO - alto], cerca);
}

// Antebrazo del hombro al codo y hoja del codo a la punta (lomo, cuerpo y filo)
function cuchilla(l, hombro, codo, punta, cerca) {
    const ancho = cerca ? 2 : 1.5;
    segmento(l, hombro, codo, ancho + 1, ancho + 1, '0');
    segmento(l, hombro, codo, ancho, ancho, cerca ? '7' : '4');
    // Hoja: ancha junto al codo y afilada en la punta
    const d = Math.hypot(punta[0] - codo[0], punta[1] - codo[1]) || 1;
    const u = [(punta[0] - codo[0]) / d, (punta[1] - codo[1]) / d];
    const medio = [codo[0] + u[0] * d * 0.35, codo[1] + u[1] * d * 0.35];
    segmento(l, codo, medio, 2.5, 4, '0');
    segmento(l, medio, punta, 4, 0.5, '0');
    segmento(l, codo, medio, 1.5, 3, cerca ? '6' : '3');
    segmento(l, medio, punta, 3, 0, cerca ? '6' : '3');
    // Filo claro por el lado de arriba
    l.linea(codo[0] - u[1] * -0, codo[1] - 1, punta[0], punta[1], cerca ? '9' : '6');
    l.linea(medio[0] + u[1] * 2, medio[1] - u[0] * 2, punta[0], punta[1], cerca ? '8' : '5');
    l.circulo(codo[0], codo[1], 2, '0').rect(codo[0], codo[1], 2, 1, '5');   // empuñadura en el codo
}

function cuerpo(l, fase) {
    const b = (fase % 2) * 2;                               // el torso sube y baja
    // Torso humano a gatas: cadera estrecha detrás, pecho ancho delante
    l.poligono([[14, 20 + b], [30, 18 + b], [30, 28 + b], [14, 27 + b]], '0');
    l.poligono([[28, 15 + b], [45, 14 + b], [47, 20 + b], [45, 28 + b], [28, 28 + b]], '0');
    l.poligono([[16, 21 + b], [31, 19 + b], [31, 26 + b], [16, 25 + b]], '7');
    l.linea(16, 21 + b, 31, 19 + b, '9').linea(16, 25 + b, 31, 26 + b, '5');
    l.poligono([[30, 16 + b], [44, 15 + b], [45, 20 + b], [44, 26 + b], [30, 26 + b]], '8');
    l.lineaH(30, 16 + b, 14, '9').lineaH(31, 17 + b, 12, '9');   // luz desde arriba
    l.rect(30, 24 + b, 14, 2, '6').lineaH(30, 26 + b, 14, '5');
    [18, 22, 26].forEach(x => l.rect(x, 22 + b, 2, 2, '5').punto(x, 22 + b, '9'));   // vértebras
    // Placas del pecho, juntas y remaches
    l.lineaV(30, 17 + b, 9, '4').lineaV(36, 18 + b, 6, '6').linea(30, 21 + b, 44, 20 + b, '6');
    [33, 40].forEach(x => l.punto(x, 19 + b, '5').punto(x, 23 + b, '5'));
    l.trazos((x, y) => l.color(x, y) === '8' && x > 38 && y > 20 + b, '6', { separacion: 2, inclinacion: 1, rotura: 0.2, semilla: 2 });
    l.patron(16, 20 + b, 28, 6, (x, y) => (ruido(x, y, 61) > 0.97 ? '5' : null));        // arañazos
    l.lineaV(30, 26 + b, 3, 'b').punto(30, 29 + b, 'a').punto(31, 26 + b, 'a');          // óxido bajo la junta
    // Tubo hidráulico sobre la espalda, del cuello a la cadera; luz de estado roja en la espalda
    l.cable(18, 18 + b, 44, 12 + b, '0', -3).cable(18, 19 + b, 44, 13 + b, '0', -3).cable(18, 17 + b, 44, 11 + b, '4', -3);
    l.rect(23, 20 + b, 3, 2, fase === 1 || fase === 3 ? 'j' : 'i');
    // Cuello y cabeza redondeada sin rostro, con ranura de ojo roja
    l.rect(44, 14 + b, 5, 7, '0').rect(45, 15 + b, 3, 5, '6').lineaH(45, 17 + b, 3, '3');
    l.elipse(52.5, 11 + b, 7, 7, '0').elipse(52.5, 11 + b, 6, 6, '8');
    l.aclarar((x, y) => l.color(x, y) === '8' && y < 9 + b && x < 56);
    l.oscurecer((x, y) => l.color(x, y) === '8' && y > 13 + b, 2);
    l.linea(50, 5 + b, 50, 17 + b, '6').punto(47, 8 + b, '5');   // junta de la placa lateral
    // Ranura del ojo: un punto brillante la recorre al caminar (barrido)
    l.rect(51, 9 + b, 8, 4, '0').lineaH(52, 10 + b, 6, 'i').lineaH(52, 11 + b, 6, 'i');
    const ojo = 52 + [4, 2, 0, 2][fase % 4];
    return l.rect(ojo, 10 + b, 3, 2, 'j').punto(ojo + 1, 10 + b, '9');
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
        ox: -2, oy: -4,
        lejos: { codo: [2, -10], punta: [34, 0] },
        cerca: { codo: [4, -8], punta: [38, 2] }
    },
    tajo: {
        ox: 2, oy: 0,
        lejos: { codo: [4, 2], punta: [62, 24] },
        cerca: { codo: [4, 6], punta: [62, 34] },
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
        for (let a = -80; a <= 30; a += 3) {
            const rad = a * Math.PI / 180;
            const x = Math.round(42 + Math.cos(rad) * 20), y = Math.round(26 + Math.sin(rad) * 20);
            l.rect(x, y, 2, 1, 'h');
            if (a > -60) l.rect(x - 2, y, 2, 1, 'g');
            if (a > -40) l.punto(x - 3, y, 'f');
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
            if (c === '.' || ruido(x >> 3, y >> 3, 11) > 0.65) continue;
            l.punto(x + Math.sign(x - 32) * 4, y + (y < 24 ? -2 : 2), c);
        }
    }
    return l.rect(30, 18, 6, 4, 'j').rect(32, 18, 2, 2, '9');
}

function chispas() {
    const l = new Lienzo(ANCHO, ALTO);
    for (let i = 0; i < 24; i++) {
        const x = Math.floor(ruido(i, 3, 13) * (ANCHO - 2)), y = Math.floor(16 + ruido(i, 4, 13) * 30);
        const c = ['j', '9', '7', 'h'][i % 4];
        l.punto(x, y, c).punto(x + 1, y, c);
        if (i % 3 === 0) l.punto(x, y + 1, c);
    }
    return l;
}

export default {
    nombre: 'robot-cuchillas',
    hd: true,
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
