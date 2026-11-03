---
name: sprite-pixel
description: Procedimiento para crear o modificar sprites, tilesets y animaciones dibujados con código (arte/*.js → PNG) y usarlos en Phaser. Usar cuando haya que crear, editar o animar cualquier asset gráfico del juego.
---

# Crear pixel art con código

Todo el arte se define en `arte/<nombre>.js` y se convierte en PNG con `npm run arte`. Nunca editar a mano los PNG de `public/assets/sprites/` ni `src/assets/sprites.json`: se regeneran.

**Antes de dibujar, carga la skill `guia-arte`** (paleta, tamaños, luz).

## Herramientas (`tools/pixel/`)

- `paleta.js`: la paleta. Un carácter por color; `.` = transparente. `RAMPAS` (de oscuro a claro: grises `0123456789`, óxido `abcd`, cian `efgh`, rojo `ij`, piel `lk`) y `tonoVecino(c, pasos)`.
- `lienzo.js`: clase `Lienzo`, `ruido(x, y, semilla)` y `umbralBayer(x, y)`. Todas las primitivas reciben caracteres de la paleta (un color fuera de ella es un error) y son encadenables:
  - Básicas: `Lienzo.desdeTexto(filas, ancho, alto, nombre)` (valida tamaños y colores), `punto`, `rect`, `linea`, `lineaH`, `lineaV`, `marco`, `patron(x, y, w, h, fn)`, `color(x, y)`.
  - Formas: `circulo(cx, cy, r, c)`, `anillo(cx, cy, r, c)` (contorno de 1 px), `elipse(cx, cy, rx, ry, c)`, `poligono([[x, y], ...], c)`, todas con `{ borde: true }` para dibujar solo el contorno; centros en `.5` dan diámetros pares. `forma(x, y, w, h, dentro, c, { borde })` para cualquier figura definida por una función. `rellenar(x, y, c)`: relleno por inundación de la región de un color.
  - `cable(x0, y0, x1, y1, c, caida)`: cable que se comba `caida` px en el centro (cables, mangueras, tendidos).
  - Textura y tono: `tramado(x, y, w, h, c, densidad)` (Bayer 4x4; usa coordenadas absolutas, así que zonas contiguas casan); `degradado(x, y, w, h, '2345', { vertical, invertir, costura, zona })`: bandas de colores con las costuras tramadas (`costura: 0` = bandas limpias); `oscurecer(zona, pasos)` / `aclarar(zona, pasos)` / `tono(pasos, zona)`: mueven cada píxel por su rampa, sin salirse de ella. Una **zona** es una función `(x, y) => bool`, un rectángulo `{ x, y, w, h }` o nada (todo el lienzo).
  - `contorno(c, { diagonales })`: contorno exterior alrededor de todo lo opaco (normalmente `'0'`). Aplicarlo al final, sobre la figura completa.
  - Copias y variantes: `copia()`, `recolor({ g: 'j', f: 'i' })` (copia con colores sustituidos: variantes de enemigos), `simetrico()` (refleja la mitad izquierda sobre la derecha: dibujar solo media figura), `pegar(otro, dx, dy)`, `desplazado(dy)`, `espejo()`.
- `generar.js`: genera la hoja PNG, la vista previa x8 en `arte/preview/` y el manifiesto `src/assets/sprites.json`.
- `revisar.js`: valida los PNG contra la guía.
- `ver.js` (`npm run arte:ver [nombre]`): visor en vivo en http://localhost:4321 (`PUERTO` para cambiarlo). Regenera al guardar `arte/`, `tools/pixel/` o `src/config/`, muestra cada frame numerado y las animaciones a su fps sobre fondo neutro, negro o de muro, y los errores de generación. Pensado para el usuario mientras dibuja; no sustituye a mirar la vista previa con Read.
- `texto.js` (`npm run arte:texto nombre [frame] [hasta]`): vuelca los frames como caracteres de la paleta con regla de coordenadas, para comprobar posiciones exactas (boca del cañón, puño, hitbox) sin adivinar en la imagen.

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
- **Primitivas** (tiles, estructuras, patrones, efectos): `rect`/`linea`/formas/`patron` + `ruido` para el desgaste (ver `arte/tiles-pasillo.js`); `degradado` y `tramado` para luz y niebla; `anillo`/`circulo` para ondas y auras.

Recetas útiles:
- Sombreado por bandas (lo que pide la guía): pintar la forma con el tono medio y luego `oscurecer` la zona en sombra y `aclarar` la que recibe luz, en vez de elegir cada color a mano.
- Variantes: `base.recolor({ ... })` para un enemigo más fuerte o un estado (dañado, energizado) sin redibujar.
- Frames de animación: partir de `base.copia()` y dibujar encima solo lo que cambia.
- Figuras simétricas (robots de frente, puertas, núcleos): dibujar la mitad izquierda y `simetrico()`.
- Fondos de concreto o metal: `degradado` muy oscuro con `costura` baja + `ruido` para manchas; el tramado se ve como textura, no como suavizado, si se queda en 2-3 tonos de una rampa.

## Procedimiento

1. Diseña la silueta primero (forma dominante + punto de luz), luego las rampas de sombreado.
2. Escribe o edita `arte/<nombre>.js`.
3. `npm run arte <nombre>`: si un tamaño o un color es incorrecto, el error dice el frame, la fila y la posición.
4. **Mira la vista previa** `arte/preview/<nombre>.png` con Read. Evalúa la lectura de la silueta, el contraste sobre fondo oscuro y la animación frame a frame. Itera hasta que se lea bien; no des por bueno un sprite sin haberlo visto. Para coordenadas exactas, `npm run arte:texto <nombre> <frame>`.
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
