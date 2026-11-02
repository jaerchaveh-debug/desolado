---
name: ambientacion
description: Recetas de atmósfera para Phaser 4 - fondos parallax de megaestructura, niebla, partículas de polvo y chispas, luces puntuales, filtros de cámara (viñeta, glow, ruido) y cámara que sigue al jugador. Usar al dar ambiente a un nivel o escena, o al añadir efectos visuales.
---

# Ambientación

Objetivo: que cada pantalla transmita **escala, abandono y oscuridad** (ver `guia-arte`). Los efectos sirven al tono: sutiles, lentos y escasos. Nunca deben tapar la lectura del jugador ni de las plataformas.

Los gráficos de fondo (capas parallax, partículas) son arte: se dibujan con `sprite-pixel` en `arte/` y se cargan desde el manifiesto como cualquier sprite.

**Phaser 4 ≠ Phaser 3.** `preFX`/`postFX` y el pipeline de luces de Phaser 3 **no existen**. Si una API no aparece aquí, compruébala con el agente `investigador-phaser4` antes de usarla.

## Profundidad (depth)

Orden fijo para todas las escenas:

| depth | Contenido |
|---|---|
| -40 … -10 | capas parallax (lejana → cercana) |
| -5 | niebla de fondo |
| 0 | capa `plataformas` |
| 10 | jugador, enemigos, objetos |
| 20 | partículas de primer plano |
| 30 | capa `frente` (siluetas en tono `0`) |
| 100 | UI (con `setScrollFactor(0)`) |

## Cámara

```js
const cam = this.cameras.main;
cam.setBounds(0, 0, mapa.widthInPixels, mapa.heightInPixels);
cam.startFollow(this.player, true, 0.1, 0.1);   // roundPixels activo por pixelArt: sin temblores
cam.setDeadzone(64, 48);                         // margen sin scroll alrededor del jugador
```

## Parallax

Capas de ancho repetible (múltiplo de 16; los bordes izquierdo y derecho deben casar), dibujadas en `arte/fondo-*.js`:

```js
// Capa fija a la cámara cuyo patrón se desplaza más lento que el mundo
const capa = this.add.tileSprite(0, 0, 480, 270, 'fondo-lejano')
    .setOrigin(0).setScrollFactor(0).setDepth(-40);
// en update():
capa.tilePositionX = this.cameras.main.scrollX * 0.2;   // 0.2 lejana · 0.5 media · 0.8 cercana
capa.tilePositionY = this.cameras.main.scrollY * 0.2;
```

Para estructuras sueltas que no se repiten, usa `this.add.image(...).setScrollFactor(f)` con `f < 1`. Valores por capa según la guía: lejana en tonos `4`–`6` y plana; media en `2`–`4`; frente en `0`.

## Niebla

Bandas horizontales semitransparentes **en tiempo de ejecución** (el PNG sigue sin alfa parcial; el alfa lo pone Phaser):

```js
this.add.tileSprite(0, 200, 480, 70, 'niebla')
    .setOrigin(0).setScrollFactor(0).setAlpha(0.35).setDepth(-5);
// update(): niebla.tilePositionX += 0.05;   // deriva muy lenta
```

## Partículas

```js
// Polvo en suspensión: 1 px, lento, poco
this.add.particles(0, 0, 'particula', {
    frame: 0,
    x: { min: 0, max: 480 }, y: { min: 0, max: 270 },
    lifespan: 6000, speedX: { min: -4, max: 4 }, speedY: { min: 2, max: 8 },
    alpha: { start: 0.6, end: 0 }, frequency: 120, quantity: 1
}).setScrollFactor(0.9).setDepth(20);

// Chispas de un cable roto: ráfaga ocasional
const chispas = this.add.particles(x, y, 'particula', {
    frame: 1, lifespan: 400, speed: { min: 30, max: 80 }, angle: { min: 60, max: 120 },
    gravityY: 400, emitting: false
}).setDepth(20);
this.time.addEvent({ delay: 2500, loop: true, callback: () => chispas.explode(6) });
```

Las texturas de partícula son hojas pequeñas (p. ej. `arte/particula.js` con frames de 2x2: polvo `7`, chispa `h`).

## Luces

- **Resplandor barato** (recomendado): `this.add.pointlight(x, y, color, radius, intensity, attenuation)`. Es un objeto que se dibuja en aditivo; no requiere normal maps. Ejemplo junto a un panel cian: `this.add.pointlight(x, y, 0x47c2c9, 40, 0.15, 0.08).setDepth(5)`. Parpadeo con un tween sobre `intensity`.
- **Iluminación por píxel** (más costosa): `this.lights.enable().setAmbientColor(0x303848)`, `this.lights.addLight(x, y, radius, color, intensity)` y `objeto.setLighting(true)` en lo que deba recibir luz. Úsala solo si el nivel lo necesita (zonas a oscuras con linterna).
- Colores de luz siempre de la paleta: cian `0x47c2c9` / `0xb8fbff`, rojo de alarma `0xb3262a`.

## Filtros de cámara

`cam.filters.internal` (se aplica dentro de la cámara) y `cam.filters.external` (encima). Firmas comprobadas en Phaser 4.2:

```js
cam.filters.internal.addVignette(0.5, 0.5, 0.9, 0.35);   // (x, y, radius, strength, color, blendMode)
```

- `addGlow(color, outerStrength, innerStrength, scale, knockout, quality, distance)`: también por objeto, con `objeto.enableFilters()` y luego `objeto.filters.internal.addGlow(0x47c2c9, 2)`. Es bueno para el visor del jugador o para pantallas.
- Otros disponibles: `addBlur`, `addBokeh`, `addColorMatrix`, `addDisplacement`, `addGradientMap`, `addPixelate`, `addQuantize`, `addShadow`, `addThreshold`, `addTiltShift`, `addBarrel`, `addWipe` (transiciones).
- Filtros que suavizan (blur, bokeh, tilt-shift) contradicen el pixel art: solo en capas de fondo lejanas o en transiciones, nunca sobre el plano de juego.

## Procedimiento

1. Define qué debe sentir la zona (opresión, peligro, calma) y elige **2–3 recursos** como máximo, no todos.
2. Dibuja el arte necesario con `sprite-pixel` y revísalo con `revisor-arte`.
3. Implementa en la escena respetando la tabla de depth. Agrupa la ambientación en un método `crearAmbiente()` de la escena (o en `src/ambiente/` si se reutiliza entre niveles).
4. Comprueba con una captura que el jugador y las plataformas se siguen leyendo y que el rendimiento no cae (pocas partículas, filtros solo en la cámara).
