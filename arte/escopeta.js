// Estallido de la pistola (tecla Q): impacto instantáneo en cono que nace en la boca del cañón.
// Orientado a la derecha; el borde izquierdo es la boca del cañón. Frames de (alcance)x64:
//   0 estallido (núcleo blanco y perdigones de energía)   1 disipándose   2 restos
// GameScene recorta el ancho con setCrop si un muro corta el alcance.

import { Lienzo, ruido } from '../tools/pixel/lienzo.js';
import { ARMAS } from '../src/config/combate.js';

// El largo del dibujo es el alcance del ataque: tras cambiarlo, npm run arte escopeta
const ANCHO = ARMAS.pistola.especial.alcance;
const ALTO = 64;
const CY = 32;
const PERDIGONES = 23;

// Semiapertura del cono a una distancia x de la boca
const apertura = x => 5 + (x / ANCHO) * 26;

// Recorre la trayectoria de cada perdigón y pinta tramos (trazos discontinuos, de 2 px de grueso)
function perdigones(l, { desde, hasta, largo, hueco, colores, semilla }) {
    for (let i = 0; i < PERDIGONES; i++) {
        const t = i / (PERDIGONES - 1) * 2 - 1;                 // -1 (arriba) … 1 (abajo)
        const desfase = Math.floor(ruido(i, 1, semilla) * (largo + hueco));
        for (let x = desde; x < hasta; x++) {
            if ((x + desfase) % (largo + hueco) >= largo) continue;
            const y = Math.round(CY + t * apertura(x));
            // Cambio de color y final distintos en cada perdigón, para que no formen bandas verticales
            if (x > hasta - ruido(i, 3, semilla) * 40) continue;
            const avance = x / hasta + (ruido(i, 2, semilla) - 0.5) * 0.3;
            const c = colores[Math.max(0, Math.min(colores.length - 1, Math.floor(avance * colores.length)))];
            l.punto(x, y, c);
            if (i % 2) l.punto(x, y + 1, 'f');
        }
    }
    return l;
}

function estallido() {
    const l = new Lienzo(ANCHO, ALTO);
    perdigones(l, { desde: 8, hasta: ANCHO, largo: 18, hueco: 8, colores: ['9', 'h', 'h', 'g'], semilla: 1 });
    // Núcleo del fogonazo en la boca del cañón
    l.patron(0, CY - 11, 26, 23, (x, y) => {
        const d = Math.abs(y - 11) + x * 0.6;
        return d < 5 ? '9' : d < 9 ? 'h' : d < 12 && ruido(x, y, 2) > 0.3 ? 'g' : null;
    });
    return l;
}

function disipando() {
    const l = new Lienzo(ANCHO, ALTO);
    perdigones(l, { desde: 8, hasta: ANCHO, largo: 8, hueco: 14, colores: ['h', 'g', 'g', 'f'], semilla: 11 });
    return l.rect(0, CY - 2, 8, 5, 'g').rect(0, CY - 1, 3, 3, 'h');
}

function restos() {
    const l = new Lienzo(ANCHO, ALTO);
    for (let i = 0; i < 40; i++) {
        const x = 60 + Math.floor(ruido(i, 4, 5) * (ANCHO - 62));
        const y = Math.round(CY + (ruido(i, 5, 5) * 2 - 1) * apertura(x));
        l.rect(x, y, 2, 1, i % 3 ? 'f' : 'g');
    }
    return l;
}

export default {
    nombre: 'escopeta',
    hd: true,
    ancho: ANCHO,
    alto: ALTO,
    frames: () => [estallido(), disipando(), restos()],
    animaciones: {
        // 3 frames a 16 fps: ~190 ms
        disparo: { frames: [0, 1, 2], fps: 16, repetir: 0 }
    }
};
