# Desolado

Juego de plataformas de desplazamiento lateral en pixel art, ambientado en una megaestructura futura, inmensa y abandonada. La atmósfera está inspirada en el manga *BLAME!*; los personajes, enemigos e historia son originales.

**Jugar en el navegador:** https://jaerchaveh-debug.github.io/desolado/

## Controles

| Acción | Teclas |
|---|---|
| Moverse | A D / ← → |
| Saltar | Espacio |
| Dash (invulnerable) | Shift |
| Apuntar | W A D / ratón |
| Bajar de una rejilla | S / ↓ |
| Ataque | E / L / clic izquierdo |
| Ataque especial | Q / J / clic derecho |
| Cambiar de arma | 1 pistola · 2 espada |
| Pausa | V |

## Contenido

- **Capítulo 1 — Pasillo de servicio:** un pasillo industrial, un pozo de bajada entre plataformas, una puerta blindada y el almacén donde espera el jefe, el Estibador.
- Dos armas con ataque normal y especial: pistola (disparo y estallido) y espada (tajo y onda cargada).
- Enemigos que se vuelven más frecuentes a medida que caen, y progreso guardado en el navegador.

## Desarrollo

Requiere [Node.js](https://nodejs.org) 20 o superior.

```bash
npm install
npm run dev            # servidor de desarrollo en http://localhost:5173
npm run build          # build de producción en dist/
npm run preview        # servir el build
npm run arte           # regenerar los PNG del pixel art desde arte/*.js
npm run arte:revisar   # validar el arte contra la paleta y la guía
```

Hecho con [Phaser 4](https://phaser.io) y [Vite](https://vite.dev), en JavaScript sin dependencias adicionales. Todo el pixel art está dibujado con código en `arte/` (ver `tools/pixel/`). Los niveles son mapas de Tiled en `public/assets/niveles/`.

La documentación técnica del proyecto (estructura, sistemas y convenciones) está en [CLAUDE.md](CLAUDE.md).

## Publicación

Cada push a `main` publica el juego en GitHub Pages con el workflow `.github/workflows/pages.yml`.
