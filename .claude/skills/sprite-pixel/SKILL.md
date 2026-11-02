---
name: sprite-pixel
description: Procedimiento para crear o modificar sprites, tilesets y animaciones dibujados con código (arte/*.js → PNG) y usarlos en Phaser. Usar cuando haya que crear, editar o animar cualquier asset gráfico del juego.
---

# Crear pixel art con código

Todo el arte se define en `arte/<nombre>.js` y se convierte en PNG con `npm run arte`. Nunca editar a mano los PNG de `public/assets/sprites/` ni `src/assets/sprites.json`: se regeneran.

**Antes de dibujar, carga la skill `guia-arte`** (paleta, tamaños, luz).

## Herramientas (`tools/pixel/`)

- `paleta.js`: la paleta. Un carácter por color; `.` = transparente.
- `lienzo.js`: clase `Lienzo` y `ruido(x, y, semilla)`.
  - `Lienzo.desdeTexto(filas, ancho, alto, nombre)`: valida el tamaño de cada fila y los colores.
  - Primitivas encadenables: `punto`, `rect`, `lineaH`, `lineaV`, `marco`, `patron(x, y, w, h, fn)`, `pegar(otro, dx, dy)`, `desplazado(dy)`, `espejo()`.
- `generar.js`: genera la hoja PNG, la vista previa x8 en `arte/preview/` y el manifiesto `src/assets/sprites.json`.
- `revisar.js`: valida los PNG contra la guía.

## Formato de una definición

```js
import { Lienzo, ruido } from '../tools/pixel/lienzo.js';

export default {
    nombre: 'mi-sprite',       // = nombre del archivo; es la clave de textura en Phaser
    tipo: 'sprite',            // o 'tileset' (frames de 16x16)
    ancho: 16, alto: 32,       // tamaño de cada frame
    frames: () => [ /* Lienzo, Lienzo, ... */ ],
    animaciones: {             // opcional; en Phaser queda como '<nombre>-<animacion>'
        quieto: { frames: [0, 1], fps: 2, repetir: -1 }
    }
};
```

Dos formas de dibujar, combinables:
- **Texto** (personajes, objetos con forma concreta): filas de caracteres. Para animaciones, separar en partes comunes y variables (ver `arte/jugador.js`: torso común + piernas por frame) y componer con `pegar`.
- **Primitivas** (tiles, estructuras, patrones): `rect`/`linea`/`patron` + `ruido` para el desgaste (ver `arte/tiles-pasillo.js`).

## Procedimiento

1. Diseña la silueta primero (forma dominante + punto de luz), luego las rampas de sombreado.
2. Escribe o edita `arte/<nombre>.js`.
3. `npm run arte <nombre>`: si un tamaño o un color es incorrecto, el error dice el frame, la fila y la posición.
4. **Mira la vista previa** `arte/preview/<nombre>.png` con Read. Evalúa la lectura de la silueta, el contraste sobre fondo oscuro y la animación frame a frame. Itera hasta que se lea bien; no des por bueno un sprite sin haberlo visto.
5. `npm run arte:revisar`: debe pasar sin problemas.
6. Úsalo en Phaser. `PreloadScene` carga automáticamente todo lo del manifiesto como spritesheet y crea las animaciones:
   - sprite: `this.physics.add.sprite(x, y, 'mi-sprite')` + `.play('mi-sprite-quieto')`;
   - tileset: `mapa.addTilesetImage('mi-tileset')` con los índices documentados en la cabecera del archivo `arte/`.
   - Ajusta la hitbox con `body.setSize(...).setOffset(...)` al cuerpo visible, no al frame.
7. Si el cambio es visible en juego, compruébalo con una captura (skill `run` o `npm run build` + `vite preview`).

## Convenciones

- Personajes y objetos miran a la **derecha**; en el juego, `flipX = true` para la izquierda.
- Documenta en un comentario de cabecera qué es el asset y los índices de frames/tiles.
- Al ampliar un tileset, añade los tiles **al final** para no romper los índices de los niveles existentes.
- Nombres de archivo en minúsculas con guiones: `tiles-pasillo`, `enemigo-rastreador`.
