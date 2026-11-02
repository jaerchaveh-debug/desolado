// Disparo de escopeta (tecla Q): estallido instantáneo en cono que nace en la boca del cañón.
// Orientado a la derecha; el borde izquierdo es la boca del cañón. Frames de 96x32:
//   0 estallido (núcleo blanco y perdigones de energía)   1 disipándose   2 restos
// GameScene recorta el ancho con setCrop si un muro corta el alcance.

import { Lienzo, ruido } from '../tools/pixel/lienzo.js';

const ANCHO = 96;
const ALTO = 32;
const CY = 16;
const PERDIGONES = 15;

// Semiapertura del cono a una distancia x de la boca
const apertura = x => 2.5 + (x / ANCHO) * 13;

// Recorre la trayectoria de cada perdigón y pinta tramos (trazos discontinuos)
function perdigones(l, { desde, hasta, largo, hueco, colores, semilla }) {
    for (let i = 0; i < PERDIGONES; i++) {
        const t = i / (PERDIGONES - 1) * 2 - 1;                 // -1 (arriba) … 1 (abajo)
        const desfase = Math.floor(ruido(i, 1, semilla) * (largo + hueco));
        for (let x = desde; x < hasta; x++) {
            if ((x + desfase) % (largo + hueco) >= largo) continue;
            const y = Math.round(CY + t * apertura(x));
            const c = colores[Math.min(colores.length - 1, Math.floor(x / hasta * colores.length))];
            l.punto(x, y, c);
        }
    }
    return l;
}

function estallido() {
    const l = new Lienzo(ANCHO, ALTO);
    perdigones(l, { desde: 4, hasta: ANCHO, largo: 9, hueco: 4, colores: ['9', 'h', 'h', 'g'], semilla: 1 });
    // Núcleo del fogonazo en la boca del cañón
    l.patron(0, CY - 5, 12, 11, (x, y) => {
        const d = Math.abs(y - 5) + x * 0.6;
        return d < 2.5 ? '9' : d < 4.5 ? 'h' : d < 6 && ruido(x, y, 2) > 0.3 ? 'g' : null;
    });
    return l;
}

function disipando() {
    const l = new Lienzo(ANCHO, ALTO);
    perdigones(l, { desde: 20, hasta: ANCHO, largo: 4, hueco: 7, colores: ['h', 'g', 'g', 'f'], semilla: 3 });
    l.rect(0, CY - 1, 4, 3, 'g').punto(0, CY, 'h');
    return l;
}

function restos() {
    const l = new Lienzo(ANCHO, ALTO);
    for (let i = 0; i < 22; i++) {
        const x = 30 + Math.floor(ruido(i, 4, 5) * (ANCHO - 30));
        const y = Math.round(CY + (ruido(i, 5, 5) * 2 - 1) * apertura(x));
        l.punto(x, y, i % 3 ? 'f' : 'g');
    }
    return l;
}

export default {
    nombre: 'escopeta',
    ancho: ANCHO,
    alto: ALTO,
    frames: () => [estallido(), disipando(), restos()],
    animaciones: {
        disparo: { frames: [0, 1, 2], fps: 24, repetir: 0 }
    }
};
