---
name: ilustracion
description: Dirección artística de las ilustraciones del juego (dark anime fantasy en pixel art "entintado", tecno-gótico) - retratos de diálogo, iconos, portadas de capítulo y fichas de enemigos y jefes, dibujados con código en arte/*.js. Cargar antes de diseñar, dibujar o revisar cualquier retrato, icono, portada o ficha, junto con guia-arte y sprite-pixel.
---

# Ilustraciones: dark anime fantasy entintado

Los sprites del juego siguen la [guía de arte](../guia-arte/SKILL.md). Las **ilustraciones** (todo lo que muestra a un personaje "de cerca" o un objeto como imagen) tienen su propia dirección: ilustración de anime de fantasía oscura, con aspecto de dibujo a mano, traducida a pixel art de mayor tamaño. Siguen siendo `arte/*.js` → PNG con `npm run arte`, con la misma paleta, alfa 0/255 y escala 1:1 en el juego.

Personajes, criaturas, vestuario e historia son **originales**. De *BLAME!* se toma la ambientación; de la fantasía oscura gótica, solo rasgos de estilo (tinta irregular, sombreado con trazos, contraste pastel/horror). No reproducir personajes, diseños ni escenas de ninguna obra, ni contenido sexual explícito.

## Pilares

1. **Tinta a mano**: contorno negro (`0`) de grosor variable, más grueso en el lado de sombra y donde una forma se monta sobre otra; líneas internas rotas, que terminan en punta (el último píxel en `1`/`2`), nunca un contorno uniforme de 1 px por todo el borde.
2. **Sombreado con trazos**: las sombras se marcan con trazos paralelos (`trazos()`), no solo con bandas. Lo que da el aire de dibujo a mano son los trazos y las líneas cortadas.
3. **Delicado contra horror**: los personajes llevan tonos pastel apagados (rosa ceniza, lavanda, piel pálida); el mundo y las amenazas, negros profundos, grises apagados y **rojo intenso** (`j`) en sangre, ojos y heridas mecánicas.
4. **Expresión**: ojos grandes con brillo, cejas y boca que cuentan la emoción; el pelo en **mechones** separados por líneas de tinta, no como una masa.
5. **Tecno-gótico**: siluetas de cuento y góticas (capas, capuchas, vestidos largos, cuellos altos, lazos, velos) **hechas de materiales de la megaestructura**: placas de metal, malla, cables trenzados como cordones, tela sintética gastada, tubos como encaje, remaches como botonadura. Nada de oro, joyas ni tejidos ricos: todo es reutilizado, roto o recompuesto.

## Paleta

La de [tools/pixel/paleta.js](../../../tools/pixel/paleta.js). Las rampas pastel son **solo para ilustraciones** (y como mucho para el detalle de un sprite de personaje); nunca en tiles, fondos ni estructura.

| Uso | Caracteres |
|---|---|
| Tinta | `0` (contorno y líneas), `1`/`2` (puntas, líneas suaves, trazos sobre oscuros) |
| Piel pálida | `u` (luz), `k` (base), `l` (sombra); mejillas con 1-2 píxeles `p`/`o` |
| Rosa ceniza | `m n o p`: pelo, tela, labios |
| Lavanda | `q r s t`: pelo, tela, iris, reflejos fríos |
| Metal y tela gastada | `2`–`7` grises azulados, óxido `a`–`d` en desgaste |
| Luz | cian `g`/`h`: brillo de los ojos, visores, energía (un solo foco) |
| Horror | `j`/`i` (sangre, ojos de máquina, heridas), sobre `0`/`1` |

- Cada personaje usa **una** rampa pastel dominante y, como mucho, una segunda de acento.
- El fondo de la ilustración es oscuro (`0`–`2`) o transparente: lo pastel debe ser lo más claro y lo primero que se ve.
- El rojo aparece en poca cantidad; ocupa como mucho un 5 % de la imagen.

## Tamaños por uso

| Uso | Tamaño | Notas |
|---|---|---|
| Icono de HUD | 32x32 | como `hud-escopeta`; tinta de 1 px, sin trazos (no se leen) |
| Icono de objeto o arma | 48x48 o 64x64 | tinta variable y algún trazo; silueta legible sobre `1` |
| Retrato de diálogo | 128x128 (busto) | un frame por **expresión** (`neutro`, `dolor`, `ira`...); fondo transparente |
| Ficha de enemigo o jefe | 96x128 (tamaño del jefe en el juego) o más | cuerpo entero o tres cuartos, con amenaza en rojo |
| Portada de capítulo | hasta 480x512 | borde **transparente e irregular** (manchas de tinta, desgarros) para componerse sobre un fondo oscuro; nunca rectangular a sangre |

Nada supera la pantalla (960x540), y todo se muestra 1:1, sin `setScale`.

## Técnica de dibujo con código

Orden recomendado (las herramientas están en la skill `sprite-pixel`):

1. **Silueta y masas** con texto (`Lienzo.desdeTexto`) o formas (`poligono`, `elipse`): cara, pelo, ropa en sus tonos base.
2. **Luz**, desde arriba y algo de lado (de la izquierda si el personaje mira a la derecha): `aclarar` en la zona iluminada, `oscurecer` en la de sombra. 2-3 tonos por material.
3. **Trazos en la sombra**: `trazos(zona, color, { separacion: 2-3, inclinacion: 1, rotura: 0.15 })`, con el tono 1-2 pasos más oscuro que la base. Una sola dirección por objeto; cambiarla en otro material separa las superficies.
4. **Líneas internas a mano**: mechones del pelo, pliegues, separación pelo-cara, costuras. Líneas de `0` que se cortan y terminan en `1`/`2`; los mechones convergen hacia la coronilla, y cada uno es una curva con punta.
5. **Tinta exterior**: `entintar('0', { lados: ['abajo', 'derecha'], irregular: 0.2 })` sobre la figura completa (los lados opuestos a la luz). En iconos de 16 px, `contorno('0')` normal.
6. **Toques finales**, encima de la tinta: brillo de los ojos (`9`/`h`), rojo del horror, un solo foco de luz.

### Rostros a escala de píxel (retrato 128x128)

- Cabeza ~56-64 px de alto; ojos de 8-12 px de alto y 8-10 de ancho, a media altura de la cabeza. Iris en la rampa del personaje, pupila `0` y **brillo** de 2-4 px `9` (o `h` si es luz artificial) arriba, del lado de la luz.
- Pestañas superiores: línea de `0` de 2 px de grosor que sobresale 1 px hacia fuera; ceja de 1 px, separada del ojo.
- Nariz: 1-2 píxeles de sombra (`l`); boca: 2-4 px de `l` o `m`, sin contorno cerrado.
- Mandíbula afilada y barbilla estrecha; cuello fino. La expresión cambia sobre todo con las cejas, los párpados y la boca: los frames de expresión parten de `base.copia()` y solo redibujan eso.

### Horror

- Cuerpos que se mezclan con la máquina: cables que entran en la piel, placas cosidas, ojos sustituidos por lentes rojas.
- Sangre y aceite: chorreones verticales de `i`/`j` sobre `0`, con trazos irregulares; sin gore detallado.
- Criaturas: se leen primero como silueta negra (`0`/`1`), y solo después como detalle. Los ojos o núcleos `j` son lo único brillante.

## Procedimiento

1. Carga `guia-arte` y `sprite-pixel`.
2. Define el personaje en un comentario de cabecera de `arte/<nombre>.js`: quién es, su rampa pastel, la silueta tecno-gótica y los frames (expresiones).
3. Dibuja siguiendo el orden de la técnica; genera con `npm run arte <nombre>`.
4. **Mira la vista previa** `arte/preview/<nombre>.png` con Read. Comprueba:
   - la cara y la expresión se leen a tamaño real (imagina la vista sin ampliar);
   - la tinta varía de grosor y no es un marco uniforme;
   - los trazos se ven como sombreado, no como ruido;
   - el pastel destaca sobre el oscuro y el rojo es escaso.
5. `npm run arte:revisar` y el agente `revisor-arte`, indicando que es una **ilustración** (se juzga con esta skill: los trazos y los pasteles son correctos aquí).
6. En Phaser se usa como imagen normal (`this.add.image(x, y, 'retrato-x', frame)`), con coordenadas enteras y depth por encima del HUD si va en un diálogo.

## Nombres

- Retratos: `retrato-<personaje>`, frames por expresión documentados en la cabecera.
- Fichas: `ficha-<enemigo>` (p. ej. `ficha-estibador`).
- Portadas: `portada-capitulo-NN`.
- Iconos: `hud-<cosa>` (32x32) o `icono-<cosa>` (48-64 px).
