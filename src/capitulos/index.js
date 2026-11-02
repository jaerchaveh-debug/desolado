// Lista ordenada de capítulos. Para añadir uno:
//   1. crea src/capitulos/capitulo-NN/capitulo.js (copia el del capítulo 1 como plantilla),
//   2. pon sus mapas en public/assets/niveles/capitulo-NN/,
//   3. impórtalo aquí en su posición.
// Un capítulo con `disponible: false` aparece en el selector como "PROXIMAMENTE" y no se puede jugar.

import capitulo01 from './capitulo-01/capitulo';

const CAPITULOS = [
    capitulo01,
    // Marcador del siguiente capítulo: sustituir por su import cuando exista
    { id: 'capitulo-02', numero: 2, titulo: '???', disponible: false, niveles: [] }
];

export default CAPITULOS;

export function buscarCapitulo(id) {
    return CAPITULOS.find(c => c.id === id);
}

// Clave de caché de Phaser y ruta del mapa de un nivel
export function claveNivel(capitulo, nivel) {
    return `${capitulo.id}/${nivel}`;
}

// Clave de caché de Phaser de una pista de música del capítulo ('ambiente', 'jefe'...)
export function claveMusica(capitulo, nombre) {
    return `${capitulo.id}/musica-${nombre}`;
}
