// Ficha del jefe del capítulo 1 (skill `ilustracion`), 96x128, cuerpo entero.
//
// El Estibador: la máquina que movía la carga del almacén y que sigue allí sin nada
// que mover. Se lee primero como silueta negra, alta y de piernas largas, con la
// cabeza adelantada; lo único brillante son las garras de metal, las ranuras del visor
// y el núcleo del pecho. Una garra abierta en alto, a punto de caer; la otra cuelga
// goteando aceite rojo. Detrás, una mancha de tinta con cables (borde transparente).
//
// Frames: 0 ficha.

import { Lienzo, ruido } from '../tools/pixel/lienzo.js';

const ANCHO = 96;
const ALTO = 128;

// Segmento de grosor variable (w0 y w1 son medios anchos)
export function segmento(l, [x0, y0], [x1, y1], w0, w1, c) {
    const d = Math.hypot(x1 - x0, y1 - y0) || 1;
    const nx = -(y1 - y0) / d, ny = (x1 - x0) / d;
    return l.poligono([
        [x0 + nx * w0, y0 + ny * w0], [x1 + nx * w1, y1 + ny * w1],
        [x1 - nx * w1, y1 - ny * w1], [x0 - nx * w0, y0 - ny * w0]
    ], c);
}

// Extremidad articulada: tinta, relleno y luz de borde por arriba. puntos: [x, y, medio ancho]
export function miembro(l, puntos) {
    const tramos = puntos.slice(1).map((p, i) => [puntos[i], p]);
    tramos.forEach(([a, b]) => segmento(l, a, b, a[2] + 1, b[2] + 1, '0'));
    tramos.forEach(([a, b]) => segmento(l, a, b, a[2], b[2], '1'));
    tramos.forEach(([a, b]) => l.linea(a[0] - 1, a[1] - a[2], b[0] - 1, b[1] - b[2], '3'));
    // Articulaciones: rótula con brillo arriba y media luna de sombra abajo
    puntos.slice(1, -1).forEach(([x, y, w]) => {
        l.circulo(x, y, w + 1, '0').circulo(x, y, w, '2');
        l.forma(x - w, y + 1, w * 2 + 1, w, (i, j) => l.color(i, j) === '2', '1');
        l.punto(x - 1, y - w + 1, '5').punto(x, y - w + 1, '4');
    });
    return l;
}

// Garra de carga: cubo y dos dedos curvos. (x, y) es el enganche; angulo, hacia dónde apunta.
export function garra(l, x, y, angulo, abierta, { brillo = false } = {}) {
    const [relleno, filo] = brillo ? ['i', 'j'] : ['5', '8'];
    const cos = Math.cos(angulo), sin = Math.sin(angulo);
    const aLienzo = (u, v) => [x + u * cos - v * sin, y + u * sin + v * cos];
    const dedo = lado => [[3, 3, 3], [8, 6 + abierta, 2.5], [15, 7 + abierta, 2], [21, 4 + abierta, 1], [25, abierta * 2, 0]]
        .map(([u, v, w]) => [...aLienzo(u, v * lado), w]);
    for (const lado of [1, -1]) {
        const puntos = dedo(lado);
        const tramos = puntos.slice(1).map((p, i) => [puntos[i], p]);
        tramos.forEach(([a, b]) => segmento(l, a, b, a[2] + 1, b[2] + 1, '0'));
        tramos.forEach(([a, b]) => segmento(l, a, b, a[2], b[2], relleno));
        tramos.forEach(([a, b]) => l.linea(a[0] - 1, a[1] - 1, b[0] - 1, b[1] - 1, filo));
        l.punto(...puntos.at(-1).slice(0, 2).map(Math.round), '9');
    }
    // Cubo de la garra
    const [cx, cy] = aLienzo(2, 0).map(Math.round);
    l.circulo(cx, cy, 6, '0').circulo(cx, cy, 5, '3').circulo(cx - 1, cy - 1, 3, '5');
    return l.circulo(cx, cy, 1, '0').punto(cx - 2, cy - 3, '8');
}

export function pie(l, x, y, w) {
    l.poligono([[x - w, y + 4], [x - w + 2, y], [x + w - 2, y], [x + w, y + 4]], '0');
    return l.rect(x - w + 2, y + 1, w * 2 - 4, 2, '2').lineaH(x - w + 3, y + 1, w * 2 - 6, '4');
}

// Línea de tinta horizontal rota: huecos de 3 px, puntas en `2` y más gruesa en el lado de sombra
function tinta(l, x0, x1, y, huecos) {
    const hueco = x => huecos.some(h => x >= h && x < h + 3);
    for (let x = x0; x <= x1; x++) {
        if (hueco(x)) continue;
        l.punto(x, y, hueco(x - 1) || hueco(x + 1) || x === x0 ? '2' : '0');
        if (x > 56 && x < x1) l.punto(x, y + 1, '0');
    }
    return l;
}

// Cabeza cuadrada: visor con ranuras y rejilla en la mandíbula
// ojos: 'rojo' (encendidos) | 'tenue' (normal en el sprite) | 'apagado'
export function cabeza(ojos = 'rojo') {
    const l = new Lienzo(ANCHO, ALTO);
    l.poligono([[39, 18], [57, 18], [61, 22], [61, 38], [56, 45], [40, 45], [35, 38], [35, 22]], '0');
    l.poligono([[40, 19], [56, 19], [60, 23], [60, 37], [55, 44], [41, 44], [36, 37], [36, 23]], '1');
    l.poligono([[40, 19], [56, 19], [59, 23], [37, 23]], '3');
    l.lineaH(40, 19, 16, '6').linea(36, 24, 36, 34, '3');
    // Visor y ranuras encendidas
    l.rect(37, 27, 23, 7, '0');
    const [borde, centro, brillo] = { rojo: ['i', 'j', '9'], tenue: ['i', 'j', 'j'], apagado: ['2', '3', '3'] }[ojos];
    l.lineaH(40, 29, 7, borde).lineaH(41, 29, 5, centro).lineaH(50, 29, 7, borde).lineaH(51, 29, 5, centro);
    l.lineaH(41, 30, 4, borde).lineaH(51, 30, 4, borde);
    l.lineaH(42, 29, 2, brillo).lineaH(52, 29, 2, brillo);
    // Rejilla de la mandíbula
    for (let x = 41; x <= 55; x += 3) l.lineaV(x, 37, 6, '3');
    l.lineaH(39, 36, 19, '0');
    l.trazos((x, y) => l.color(x, y) === '1' && x > 52 && y < 44, '0', { separacion: 2, inclinacion: 1, rotura: 0.2, semilla: 12 });
    return l;
}

// Cuello, torso de placas y núcleo. nucleo: [centro, borde]
export function torso(l, nucleo = ['j', 'i']) {
    // Cuello
    l.rect(45, 32, 14, 9, '0').rect(46, 32, 12, 8, '1');
    [48, 51, 54].forEach(x => l.lineaV(x, 34, 6, '2'));

    // Torso: hombros enormes que se estrechan a la cintura
    const torso = [[18, 46], [30, 38], [66, 38], [78, 46], [72, 58], [60, 76], [58, 84], [38, 84], [36, 76], [24, 58]];
    l.poligono(torso, '0');
    l.poligono(torso.map(([x, y]) => [x + Math.sign(48 - x), y + (y < 58 ? 1 : -1)]), '1');
    // Placa alta iluminada desde arriba
    l.poligono([[22, 47], [31, 40], [65, 40], [74, 47], [69, 53], [27, 53]], '2');
    l.linea(22, 46, 31, 40, '6').lineaH(31, 40, 34, '5').linea(65, 40, 74, 46, '3');
    l.linea(26, 59, 37, 77, '3');
    // Placas del vientre y pelvis, con la tinta rota
    tinta(l, 27, 68, 54, [36, 61]);
    tinta(l, 33, 63, 66, [40, 54]);
    tinta(l, 38, 59, 73, [46]);
    l.rect(38, 78, 20, 3, '2').lineaH(38, 78, 20, '3');
    [30, 37, 59, 66].forEach(x => l.punto(x, 50, '5').punto(x, 49, '3'));
    [37, 44, 52, 59].forEach(x => l.punto(x, 68, '3'));
    // Sombra con trazos, siguiendo la caída del torso hacia la cintura
    l.trazos((x, y) => '12'.includes(l.color(x, y)) && x > 85 - y * 0.47 && y > 41 && y < 82, '0',
        { separacion: 3, inclinacion: 1, rotura: 0.2, semilla: 11 });

    // Núcleo del pecho: lo único caliente del cuerpo
    l.circulo(48, 59, 6, '0').anillo(48, 59, 5, '3');
    l.circulo(48, 59, 3, nucleo[1]).circulo(48, 59, 2, nucleo[0]);
    if (nucleo[0] === 'j') l.punto(47, 58, '9').linea(54, 60, 59, 63, 'i').punto(60, 64, '2');
    return l;
}

// Pistones de los hombros, por encima de los brazos
export function pistones(l) {
    for (const x of [19, 69]) {
        l.rect(x, 43, 8, 11, '0').rect(x + 1, 44, 6, 9, '2').lineaH(x + 1, 44, 6, '5');
        l.lineaV(x + 3, 46, 6, '4');
    }
    l.lineaV(21, 54, 4, 'b').punto(21, 58, 'a').lineaV(74, 54, 3, 'b').punto(74, 57, 'a');
    return l;
}

// Figura sin fondo; se entinta sola para que la mancha no reciba contorno
function figura() {
    const l = new Lienzo(ANCHO, ALTO);

    // Par trasero de piernas, abiertas, con las rodillas altas y los pies más atrás
    miembro(l, [[36, 80, 4], [12, 87, 3], [10, 116, 2]]);
    miembro(l, [[60, 80, 4], [85, 86, 3], [85, 116, 2]]);
    pie(l, 10, 116, 6);
    pie(l, 85, 116, 6);

    // Cable suelto de la cadera
    l.cable(34, 82, 20, 106, '3', 4);
    l.punto(20, 107, 'b').punto(20, 108, 'b').punto(20, 109, 'a');

    // Brazo en alto (al fondo) y su garra abierta
    miembro(l, [[27, 50, 5], [8, 54, 4], [15, 36, 3]]);
    garra(l, 16, 33, -1.35, 3);

    torso(l);

    // Par delantero de piernas
    miembro(l, [[41, 82, 5], [30, 100, 4], [32, 120, 3]]);
    miembro(l, [[55, 82, 5], [63, 100, 4], [62, 120, 3]]);
    pie(l, 32, 120, 8);
    pie(l, 62, 120, 8);

    // Brazo que cuelga y su garra cerrada
    miembro(l, [[70, 51, 5], [84, 60, 4], [76, 76, 3]]);
    garra(l, 76, 78, 1.75, 0);

    pistones(l);

    // Cabeza adelantada y tubos a los hombros
    l.cable(44, 35, 27, 43, '4', 2).cable(61, 35, 72, 43, '3', 2);
    l.pegar(cabeza(), 3, -11);

    l.entintar('0', { lados: ['abajo', 'derecha'], irregular: 0.25, semilla: 13 });

    // Aceite rojo de la garra y la mandíbula (encima de la tinta)
    l.lineaV(72, 105, 4, 'i').punto(72, 109, 'j').punto(72, 112, 'j').punto(72, 113, 'j');
    l.lineaV(57, 35, 3, 'i').punto(57, 38, 'j');
    return l;
}

// Mancha de tinta detrás de la figura: borde roto por píxel, salpicaduras y cables colgando
function mancha() {
    const l = new Lienzo(ANCHO, ALTO);
    const borde = (x, y) => ((x - 48) / 45) ** 2 + ((y - 62) / 60) ** 2
        + (ruido(x >> 2, y >> 2, 21) - 0.5) * 0.2 + (ruido(x, y, 22) - 0.5) * 0.16;
    const dentro = (x, y) => x > 1 && y > 1 && x < ANCHO - 2 && y < ALTO - 2;
    l.forma(0, 0, ANCHO, ALTO, (x, y) => dentro(x, y) && borde(x, y) < 0.92, '1');
    l.forma(0, 0, ANCHO, ALTO, (x, y) => dentro(x, y) && borde(x, y) < 0.62, '2');
    l.trazos((x, y) => l.color(x, y) === '2' && borde(x, y) > 0.3, '1', { separacion: 3, inclinacion: -1, rotura: 0.25, semilla: 23 });
    // Salpicaduras sueltas alrededor
    l.forma(0, 0, ANCHO, ALTO, (x, y) => dentro(x, y) && borde(x, y) < 1.3 && ruido(x, y, 24) > 0.93, '1');
    // Cables que caen del techo del almacén, solo sobre la mancha
    const cables = new Lienzo(ANCHO, ALTO);
    cables.cable(33, 4, 36, 36, '0', 1).cable(72, 6, 69, 38, '0', 1).cable(81, 12, 85, 52, '0', 2);
    cables.px.forEach((fila, y) => fila.forEach((c, x) => {
        if (c !== '.' && l.color(x, y) !== '.') l.punto(x, y, c);
    }));
    return l;
}

export default {
    nombre: 'ficha-estibador',
    hd: true,
    tipo: 'sprite',
    ancho: ANCHO, alto: ALTO,
    frames: () => [mancha().pegar(figura(), 0, 0)]
};
