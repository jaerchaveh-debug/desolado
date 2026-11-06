---
name: nivel-tiled
description: Crear, editar o ampliar niveles del juego como mapas de Tiled en JSON (capas, tileset incrustado, punto de inicio, colisiones por propiedades) y cargarlos en Phaser 4. Usar al diseñar un nivel nuevo, modificar uno existente o añadir objetos a un mapa.
---

# Niveles con Tiled

Los niveles son mapas de Tiled en formato JSON, en `public/assets/niveles/<capitulo>/<nivel>.json`. Se pueden editar a mano (o con un script de Node) o abrirlos con el editor [Tiled](https://www.mapeditor.org/): ambos caminos producen el mismo archivo.

Antes de diseñar, carga `guia-arte` (composición, escala, verticalidad). Si hacen falta tiles nuevos, usa `sprite-pixel`.

## Piezas del sistema

- **Tileset**: se dibuja en `arte/<tileset>.js` (`tipo: 'tileset'`). `npm run arte` genera:
  - `public/assets/sprites/<tileset>.png`, la textura;
  - `public/assets/sprites/<tileset>.tsj`, el tileset para el editor Tiled;
  - las `propiedades` de cada tile en `src/assets/sprites.json`.
- **Colisiones**: se definen **solo** en `propiedades` del archivo de arte (`solido`, `soloArriba`). `GameScene.aplicarPropiedades` las aplica a cualquier nivel. No dupliques colisiones en el mapa.
- **Lista de niveles**: el array `niveles` de cada capítulo (`src/capitulos/capitulo-NN/capitulo.js`). `PreloadScene` carga los de todos los capítulos disponibles con la clave `capitulo-NN/<nivel>` y `GameScene` recibe `{ capitulo, nivel }` (índice).

## Formato obligatorio del mapa

```jsonc
{
  "type": "map", "orientation": "orthogonal", "renderorder": "right-down", "infinite": false,
  "width": 30, "height": 17, "tilewidth": 32, "tileheight": 32,
  "tilesets": [ { "firstgid": 1, "name": "tiles-pasillo", "image": "../../sprites/tiles-pasillo.png", ... } ],
  "layers": [
    { "name": "plataformas", "type": "tilelayer", "width": 30, "height": 17, "data": [ /* width*height gids */ ] },
    { "name": "objetos", "type": "objectgroup", "objects": [
        { "id": 1, "name": "inicio", "point": true, "x": 48, "y": 224 }
    ] }
  ]
}
```

- **Tileset incrustado**: el parser de Phaser 4 **no admite tilesets externos** (`"source": "x.tsj"`). En el editor Tiled hay que usar *Embed Tileset* antes de guardar. A mano, copia el contenido del `.tsj`, quita `"type"` y añade `firstgid` e `image` relativa al mapa.
- `name` del tileset = nombre del archivo de arte = clave de la textura. `GameScene` hace `addTilesetImage(t.name, t.name)`.
- **gid = índice del tile + firstgid**; `0` es vacío. Con `firstgid: 1`, el tile 0 (piso) es el gid 1. Los índices están documentados en la cabecera de `arte/<tileset>.js`.
- `data` tiene exactamente `width * height` enteros, fila a fila de arriba abajo.
- Capas con nombre fijo: `plataformas` (colisionable), `objetos` (puntos de interés) y, opcional, `fondo` (decorativa sin colisión, detrás; debe ir **primera** en `layers`). Futura: `frente` (delante del jugador).
- Lámparas del fondo: tiles con la propiedad `luz` (`cian`/`roja`) en el tileset; GameScene les pone encima un sprite `luz-fondo` que parpadea.
- Caída mortal: caer más de 176 px (11 tiles) desde el punto más alto mata. Las bajadas "seguras" deben tener tramos de 4 filas como máximo (con el salto, ~124 px); un pozo en zigzag con plataformas cada 4 filas hace que fallar un salto sea mortal.
- Objeto `inicio` obligatorio: punto (`point: true`) donde **apoyan los pies** del jugador.
- Objetos `enemigo` (voladores) y `enemigo-suelo` (caminantes): puntos de aparición repartidos por todo el mapa (cada ~320 px), porque solo se usan los cercanos al jugador. Los `enemigo` van en zonas abiertas; los `enemigo-suelo` exactamente sobre la superficie del suelo (y = fila del tile × 16), con al menos un tile de suelo a cada lado.
- Cierra los extremos del mapa con muros y recuerda que los fosos sin fondo matan al instante.
- Al añadir capas u objetos, actualiza `nextlayerid` / `nextobjectid` para que Tiled no duplique ids.

## Diseño (pantalla de 960x540 = 30x17 tiles visibles; la cámara sigue al jugador)

- Salto del jugador: ~60 px (3–4 tiles) de altura y ~5 tiles de distancia. Separaciones verticales de 3 tiles; huecos de 2–4 tiles.
- Verticalidad y escala: niveles más altos que anchos cuando se pueda, con la estructura saliendo del encuadre (cuando haya cámara que siga al jugador).
- Superficies pisables con borde superior iluminado (piso, rejilla); los muros y rellenos son la masa oscura.
- Luz cian (tile de panel) como guía hacia el camino o la salida, no repartida al azar.
- Variar entre 2–4 tiles de relleno (muro, panel oxidado, panel con luz) para que no se note la rejilla.

## Procedimiento

1. Si el nivel es nuevo, añade su nombre al array `niveles` del capítulo y guarda el mapa en `public/assets/niveles/capitulo-NN/`.
2. Crea o edita el JSON. Para mapas grandes, genera `data` con un script de Node (en el scratchpad) a partir de una matriz legible, en vez de escribir cientos de números a mano.
3. Valida: `data.length === width * height`, gids dentro del rango del tileset, existe el `inicio`, el tileset está incrustado.
4. `npm run build`, y comprueba con una captura (skill `run`) que el jugador aparece sobre el suelo y que los saltos son alcanzables.
