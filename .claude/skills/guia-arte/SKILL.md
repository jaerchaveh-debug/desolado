---
name: guia-arte
description: Guía de estilo visual del juego (pixel art futurista inspirado en BLAME!) - paleta, tamaños, luz, composición y personajes. Cargar antes de diseñar, dibujar o revisar cualquier sprite, tile, fondo, efecto o nivel.
---

# Guía de arte

Pixel art de una megaestructura futura, infinita y abandonada. Tono: escala opresiva, soledad, silencio industrial. La inspiración es *BLAME!* (Tsutomu Nihei) solo en ambientación: todo personaje, criatura, símbolo e historia es **original**. Nunca reproducir personajes (Killy, Cibo…), logos ni viñetas del manga.

## Pilares visuales

1. **Escala**: el jugador es diminuto frente a la arquitectura. Estructuras que salen del encuadre, vigas gigantes, pozos sin fondo visible. Preferir composiciones verticales.
2. **Oscuridad**: el 70-80 % de la pantalla son los tonos `0`–`3`. El negro es un material, no un vacío.
3. **Luz escasa y puntual**: cian (`e`–`h`) para luz artificial y pantallas; rojo (`i`–`j`) solo para peligro. Un acento de luz por zona, no decoración por todas partes.
4. **Materia industrial**: metal, hormigón, cables, tuberías, celosías, rejillas, óxido (`a`–`d`) en juntas y chorreones.
5. **Profundidad por valor**: lo lejano es más claro y plano (niebla), lo cercano más oscuro y contrastado.

## Paleta

Fuente de verdad: [tools/pixel/paleta.js](../../../tools/pixel/paleta.js). **Prohibido** usar colores fuera de ella; si hace falta uno nuevo, se añade allí con justificación y se avisa al usuario.

| Caracteres | Grupo | Uso |
|---|---|---|
| `0`–`9` | grises azulados (negro → casi blanco) | estructura, metal, sombras, contornos (`0`) |
| `a`–`d` | óxido | suciedad, metal viejo, tela, detalles cálidos |
| `e`–`h` | cian | luz, energía, visores, pantallas |
| `i`–`j` | rojo | alerta, enemigos, daño (muy escaso) |
| `k`–`l` | piel | rostros/manos visibles (poco frecuente) |
| `.` | transparente | |

## Tamaños y rejilla

- Resolución del juego: **480x270**. 1 píxel del arte = 1 píxel del juego. Nunca ampliar ni reducir sprites en el código.
- Tiles: **16x16**. Los niveles se construyen en esta rejilla.
- Jugador: frame de **16x32** (cuerpo ~10x30). Humanoides comunes al mismo tamaño; enemigos grandes en múltiplos de 16.
- Proyectiles/partículas: 1–4 px.
- Hojas de sprites: frames en horizontal, todos del mismo tamaño.

## Reglas de dibujo

- Alfa solo 0 o 255: sin antialias ni bordes semitransparentes.
- Luz principal desde **arriba**: bordes superiores 1–2 tonos más claros, inferiores más oscuros.
- Contorno `0` en personajes y objetos interactivos para que se lean sobre fondos oscuros; los tiles de fondo van **sin** contorno.
- Sombreado por bandas (2–4 tonos de una rampa). Nada de degradados de píxel a píxel ni "pillow shading" (sombrear desde el contorno hacia dentro).
- Evitar píxeles huérfanos y escaleras irregulares en diagonales (patrones 1-1, 2-2, 1-2 constantes).
- Detalle con ruido determinista (`ruido()` de `lienzo.js`), nunca `Math.random()`: el arte debe ser reproducible.
- Animación: 2 frames para respirar (2 fps), 4–6 para correr (8–12 fps). Rebote vertical de 1 px.

## Personajes

- Siluetas legibles a 16x32: una forma dominante (abrigo, capucha, casco) y **un** punto de luz que guía la mirada (visor, ojo, núcleo).
- Rostros ocultos o mínimos (visores, máscaras, sombra de capucha).
- Jugador: errante encapuchado, abrigo largo gris azulado, bufanda de óxido, visor cian ([arte/jugador.js](../../../arte/jugador.js)). Mira a la derecha.
- Enemigos: siluetas orgánico-mecánicas, extremidades largas, acentos rojos.

## Composición de niveles y fondos

- Fondo parallax en 3–4 capas: megaestructura lejana (tonos `4`–`6`, plana) → estructuras medias (`2`–`4`) → plano de juego (`1`–`5` con acentos) → primer plano opcional en `0` muy oscuro.
- El plano jugable debe distinguirse del fondo: superficies pisables con borde superior iluminado (`6`/`5`).
- Repetir tiles en patrones de 2–4 variantes para que no se note la rejilla.
