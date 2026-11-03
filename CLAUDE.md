# CLAUDE.md

Guía para trabajar en este repositorio. Escribe la documentación y los comentarios del código en **español**.

## Visión del juego

- **Título:** *Desolado* (constante `TITULO_JUEGO` en `src/scenes/MenuScene.js`). Se juega por capítulos.

- **Género:** plataformas de desplazamiento lateral (side-scroller) con gravedad y salto.
- **Estética:** pixel art, ambientado en un futuro lejano. La inspiración es el manga *BLAME!* (Tsutomu Nihei): megaestructuras inmensas, verticalidad extrema, pasillos industriales infinitos, escala opresiva, soledad, paleta fría y desaturada con mucho negro y acentos de luz puntuales.
- La inspiración es solo de ambientación y tono. Personajes, nombres, historia y diseños deben ser **originales**: no reproducir personajes, logos ni escenas concretas del manga.

## Tecnologías

| Tecnología | Versión | Uso |
|---|---|---|
| [Phaser](https://phaser.io) | 4.2.0 | Motor de juego 2D (escenas, sprites, físicas Arcade, input, cámara) |
| [Vite](https://vite.dev) | 8.1.0 | Servidor de desarrollo con recarga y empaquetado de producción |
| JavaScript (ES Modules) | — | Lenguaje; `"type": "module"`, sin TypeScript ni framework de UI |
| Node.js / npm | — | Gestión de dependencias |

No hay tests, linter ni formateador configurados. El proyecto vive dentro de `C:\xampp\htdocs`, pero **no usa PHP ni Apache**: se ejecuta con Vite.

> Phaser 4 tiene diferencias de API respecto a Phaser 3 (p. ej. `preFX`/`postFX` → `filters`; `setTintFill(c)` → `setTint(c).setTintMode(Phaser.TintModes.FILL)`; el parser de Tiled no admite tilesets externos). Antes de usar una API de la que no estés seguro, verifícala en `node_modules/phaser` (o con el agente `investigador-phaser4`) en lugar de asumir la API de Phaser 3.

## Comandos

```bash
npm install            # instalar dependencias
npm run dev            # servidor de desarrollo (http://localhost:5173)
npm run build          # build de producción en dist/
npm run preview        # servir el build de dist/
npm run arte [nombre]  # generar los PNG desde arte/*.js (todos o uno)
npm run arte:revisar   # validar los PNG contra la guía de arte
npm run arte:ver [nombre]   # visor en vivo del arte (http://localhost:4321), regenera al guardar
npm run arte:texto nombre [frame]  # volcar frames como caracteres de la paleta
npm run sonido [nombre]     # generar los WAV desde sonido/*.js (todos o uno)
npm run sonido:revisar      # validar los WAV (saturación, empalme de bucles, niveles...)
```

- Repositorio: https://github.com/jaerchaveh-debug/desolado (rama `main`). Cada push a `main` publica el juego en GitHub Pages (https://jaerchaveh-debug.github.io/desolado/) con `.github/workflows/pages.yml`. `vite.config.js` usa `base: './'` para que el build funcione en la subcarpeta `/desolado/`: cargar siempre los recursos con rutas relativas (`assets/...`), nunca con `/assets/...`.

## Estructura

```
index.html                   # punto de entrada; Phaser monta el canvas en #game
vite.config.js               # base relativa ('./') para GitHub Pages
.github/workflows/pages.yml  # build y publicación en GitHub Pages
arte/                        # FUENTE del pixel art: cada .js define un sprite o tileset en código
  preview/                   # vistas ampliadas x8 (generadas, ignoradas por git)
sonido/                      # FUENTE del audio: cada .js sintetiza un efecto, ambiente o música
  preview/                   # forma de onda y espectrograma de cada sonido (generados, ignorados por git)
tools/pixel/                 # paleta y rampas, Lienzo (formas, degradados, tramado, contorno, recolor), PNG, generador, revisor, visor y volcado en texto (Node, sin dependencias)
tools/sonido/                # sintetizador, codificador WAV, generador, espectrograma y revisor (Node, sin dependencias)
src/
  main.js                    # crea Phaser.Game con la configuración
  config/gameConfig.js       # resolución, escalado, físicas y lista de escenas
  config/combate.js          # jugador (vida, invulnerabilidad), armas y tipos de enemigo
  capitulos/index.js         # lista ordenada de capítulos (+ buscarCapitulo, claveNivel)
  capitulos/capitulo-NN/capitulo.js # título, niveles, aparición de enemigos y condición de victoria del capítulo
  sistema/progreso.js        # progreso guardado en localStorage (desbloqueos, último capítulo)
  sistema/sonido.js          # sonar(): efectos con variantes, panorámica y atenuación; música generada (?musica=generada)
  ui/MenuOpciones.js         # lista de opciones navegable (teclado y ratón) con cursor
  ui/colores.js              # colores de la paleta para la interfaz
  objetos/Enemigo.js         # enemigo genérico por tipo (volar / suelo): persigue, recibe daño, muere
  objetos/Proyectil.js       # bala reutilizable (pool)
  objetos/Puerta.js          # puerta blindada destructible y compuerta de la sala del jefe
  objetos/Jefe.js            # jefe genérico por tipo (JEFES): máquina de estados de sus ataques
  ambiente/parallax.js       # fondo parallax de la megaestructura (crearParallax), común a GameScene y FondoMenuScene
  assets/sprites.json        # manifiesto generado por `npm run arte` (no editar)
  assets/sonidos.json        # manifiesto generado por `npm run sonido` (no editar)
  scenes/PreloadScene.js     # carga todo el manifiesto y crea las animaciones
  scenes/GameScene.js        # escena jugable: nivel de Tiled, cámara, combate, vida y HUD
  scenes/FondoMenuScene.js   # fondo de los menús: primer nivel oscurecido con paneo lento
  scenes/MenuBase.js         # base de MenuScene / CapitulosScene / ControlesScene
  scenes/MenuScene.js        # menú de inicio: Continuar, Capítulos, Controles
  scenes/CapitulosScene.js   # selector de capítulos
  scenes/ControlesScene.js   # tabla de controles
  scenes/PantallaSuperpuesta.js # base de las pantallas sobre el juego congelado (velo, marco, textos, opción con cursor)
  scenes/GameOverScene.js    # pantalla "Volver a intentarlo" (se lanza encima de GameScene en pausa)
  scenes/PauseScene.js       # pausa "Conexión perdida" / "Reconectar" (tecla V)
  scenes/CapituloCompletadoScene.js # "Capítulo N completado" tras la victoria del capítulo
public/assets/sprites/       # PNG y tilesets .tsj generados (no editar a mano)
public/assets/niveles/capitulo-NN/ # mapas de Tiled en JSON de cada capítulo (tileset incrustado)
public/assets/sonidos/       # WAV generados (no editar a mano)
public/assets/audio/capitulo-NN/ # música de cada capítulo (ambiente.ogg, jefe.mp3), declarada en `musica` del capítulo
public/assets/{fonts,spritesheets,tilemaps}/ # reservadas para el futuro
.claude/skills/guia-arte     # guía de estilo visual (paleta, tamaños, luz, composición)
.claude/skills/sprite-pixel  # procedimiento para crear assets con código
.claude/skills/nivel-tiled   # formato y diseño de niveles de Tiled
.claude/skills/ambientacion  # parallax, niebla, partículas, luces, filtros y cámara en Phaser 4
.claude/skills/sonido        # identidad sonora, síntesis de efectos y música, mezcla e integración
.claude/agents/revisor-arte  # agente que revisa assets contra la guía
.claude/agents/investigador-phaser4  # agente que verifica APIs de Phaser 4 en node_modules
```

- Flujo de escenas: `PreloadScene` → `MenuScene` ⇄ `CapitulosScene` / `ControlesScene` (todas sobre `FondoMenuScene`, que se detiene al jugar) → `GameScene` ⇄ `GameOverScene` / `PauseScene` (y `CapituloCompletadoScene` al ganar) → de vuelta a `MenuScene`.
  - `GameScene` recibe `{ capitulo: id, nivel: índice }` y pasa esos mismos datos a `GameOverScene` / `PauseScene` (se lanzan encima de `GameScene` en pausa y extienden `PantallaSuperpuesta`: implementan `construir()` con `this.texto(...)` y `this.menu(...)`).
  - Todo menú usa `MenuOpciones`: ↑/↓ o W/S para moverse, ENTER/E/ESPACIO para aceptar, ESC para volver, ratón para pasar y hacer clic; las opciones con `habilitada: false` se ven apagadas y se saltan.
- Capítulos: `src/capitulos/index.js` define el orden. Cada capítulo (`capitulo-NN/capitulo.js`) declara `id`, `numero`, `titulo`, `disponible`, `niveles` (archivos en `public/assets/niveles/capitulo-NN/`), `aparicion` (temporizadores de enemigos), `musica` (rutas dentro de `public/assets/` por nombre de pista: `ambiente`, `jefe`), `jefe` (`tipo` de `JEFES`, `retardo` y `refuerzos`) y `victoria` (`'jefe'`: derrotar al jefe; `null` = sin final). La clave de un mapa en Phaser es `capitulo-NN/<nivel>` (`claveNivel`). `PreloadScene` carga los mapas de todos los capítulos disponibles. `capitulo-02` es solo un marcador (`disponible: false`, "PROXIMAMENTE").
  - Para añadir un capítulo: copiar `capitulo-01/capitulo.js` a `capitulo-NN/`, crear sus mapas en `public/assets/niveles/capitulo-NN/` e importarlo en `src/capitulos/index.js` (sustituyendo el marcador).
- Progreso (`src/sistema/progreso.js`, clave `desolado:progreso` de localStorage, con respaldo en memoria si no hay almacenamiento): al inicio solo está desbloqueado el capítulo 1. `completarCapitulo(id)` desbloquea el siguiente; `GameScene.jefeDerrotado` lo llama cuando la victoria del capítulo es `'jefe'`. "Continuar" empieza el último capítulo jugado (`registrarInicio`).
- Música: `PreloadScene` carga las pistas de `musica` de cada capítulo disponible con la clave `claveMusica(capitulo, nombre)` (`capitulo-NN/musica-<nombre>`). `GameScene.crearMusica` empieza `ambiente` (en bucle, volumen `VOLUMEN_MUSICA` 0,5); `reproducirMusica(nombre)` cambia de pista con fundido cruzado y `apagarMusica(ms)` la apaga con fundido. Las pistas (`this.pistas`) se pausan con la escena (pausa, muerte) y se destruyen en `SHUTDOWN`. Al morir, la música se apaga; al cerrarse la sala del jefe se apaga el ambiente y entra `jefe` con el jefe; al vencerlo se apaga.
  - Menús: `FondoMenuScene` reproduce en bucle la pista `ambiente` del capítulo de "Continuar" (`capituloParaContinuar`) a `VOLUMEN_MUSICA_MENU` (0,4); `MenuBase.jugar` la apaga con fundido y se destruye al detener la escena. Hasta la primera tecla o clic el navegador no deja sonar audio: Phaser la arranca entonces. La elección de pista (original o generada) la hace `pistaMusica()` de `sistema/sonido.js`, común al menú y a `GameScene`.
  - Ambiente: `ambiente` del capítulo (sonido de tipo `ambiente`, p. ej. `ambiente-pasillo`) suena en bucle bajo la música (`VOLUMEN_AMBIENTE`), en `this.pistas`.
  - Alternativas generadas: con `?musica=generada` en la URL, `reproducirMusica(nombre)` usa `musica-<nombre>` de sonido/ en lugar de la pista del capítulo.
- Efectos de sonido: **todo el audio se sintetiza con código** en `sonido/*.js` (`npm run sonido`); antes de crear o tocar uno, carga la skill `sonido`. En el juego, `sonar(scene, nombre, { x })` de `src/sistema/sonido.js`; los de enemigos y jefe se declaran en `sonidos` de su tipo en `config/combate.js` y suenan con `efectoSonoro(momento)`.
  - Probar en Edge sin interfaz: con `--virtual-time-budget` el navegador **no termina de decodificar el audio** y `PreloadScene` no acaba; para las pruebas de lógica, crear el juego con `audio: { noAudio: true }`, y la música probarla en tiempo real (Edge con `--remote-debugging-port` y un script de Node por CDP).
- Carpetas reservadas para el futuro en `public/assets/`: `fonts`, `spritesheets`, `tilemaps` (y `audio`, ya en uso). No borrarlas; llevan un `.gitkeep` para que git las conserve vacías. Previstas: `BootScene` y `MenuScene` (comentadas en `gameConfig.js`). Cada escena es una clase que extiende `Phaser.Scene` en su propio archivo de `src/scenes/`, con la clave igual al nombre de la clase.
- Las texturas se llaman como el archivo de `arte/` (`jugador`, `tiles-pasillo`) y las animaciones `<sprite>-<animacion>` (`jugador-correr`).

## Pixel art

- **Todo el arte se dibuja con código** en `arte/*.js` y se genera con `npm run arte`. Antes de crear o tocar arte, carga las skills `guia-arte` y `sprite-pixel`; después, usa el agente `revisor-arte`.
- **Resolución base: 480x270** (16:9), escala entera x4 a 1080p. `pixelArt: true` (filtrado nearest, sin antialias; en Phaser 4 también activa `roundPixels`). Escalado `FIT` + `CENTER_BOTH`.
- Tiles de 16x16; jugador en frames de 16x32. 1 píxel del arte = 1 píxel del juego: nunca `setDisplaySize`/`setScale` sobre sprites.
- Solo colores de `tools/pixel/paleta.js`; alfa 0 o 255.
- Texto: fuente pixel art `arte/fuente.js` (glifos 5x7 en celdas de 6x8, mayúsculas, dígitos, Ñ y `.,:!?-/>`), registrada como fuente bitmap en `PreloadScene`. Usar `this.add.bitmapText(x, y, 'fuente', 'TEXTO').setTint(color)`; títulos a escala entera (x2). No usar `this.add.text` (se ve borroso a 480x270). Para un carácter nuevo, añadirlo a `GLIFOS`.
- Niveles: mapas de Tiled en `public/assets/niveles/capitulo-NN/`, registrados en el array `niveles` de su capítulo (skill `nivel-tiled`). Las colisiones se definen en `propiedades` del archivo de arte del tileset, no en el mapa.
- Efectos y atmósfera: skill `ambientacion`. Ante cualquier API de Phaser dudosa, consulta al agente `investigador-phaser4`.

## Físicas

- Arcade Physics, gravedad 900. Valores ajustados a 480x270 (velocidad 120, salto -330 ≈ 60 px).
- Movimiento de plataformas: solo `velocityX` con las flechas; salto (↑ o espacio) solo si `body.blocked.down`. No reiniciar la velocidad vertical cada frame.
- La rejilla (tile 4, `soloArriba`) solo colisiona por arriba. El mundo no tiene límite inferior: **caer a un foso sin fondo es muerte instantánea**.
- **Caída alta** (`JUGADOR.caida`): al aterrizar tras caer más de `altura` (176 px, 11 tiles) desde el punto más alto en el aire, el jugador pierde `danio` (5) de vida, sin retroceso y aunque esté en invulnerabilidad (`danarJugador(cantidad, x, caida = true)`); si no le queda vida, muere. Un salto normal entre plataformas separadas 4 filas cae ~124 px; diseñar caídas seguras por debajo de ese límite. **Dentro de la sala del jefe** (rectángulo `sala-jefe`, `enSalaJefe`) la caída alta no hace daño: sus plataformas están muy por encima del suelo.
- **Fondo parallax** (`src/ambiente/parallax.js`, `CAPAS_PARALLAX`): `fondo-lejano` (torres colosales tramadas, factor 0,15, depth -40) y `fondo-medio` (pilares de celosía, viga y cables, factor 0,4, depth -30), repetibles en X e Y. Cada capa es un `TileSprite` del tamaño de la pantalla fijo a la cámara cuyo `tilePosition` (entero) sigue `scroll × factor` en `PRE_RENDER`. Solo se ve donde no hay tiles (pasillo superior, ventanales del pozo). Tonos `0`-`2` (la capa lejana sin base: detrás está el color de fondo `0`), siempre más oscuro que la roca.
- Cámara: sigue al jugador (`startFollow` con deadzone 64x48) dentro de los límites del mapa. `pasillo-01` mide 140x85 tiles: el pasillo superior (filas 0-16, cols 0-99), un pozo de bajada de 4 pantallas (cols 100-117, filas 3-81) con 16 plataformas en zigzag cada 4 filas (izquierda cols 101-105 / derecha cols 110-114, una de cada tres de rejilla) un pasillo inferior (filas 78-81, suelo en la 82) que sigue a la derecha hasta la puerta blindada (col 152) y la compuerta (col 159), y la **sala del jefe** (almacén). `pasillo-01` mide ahora 222x85 tiles. Bajo el pasillo superior todo es roca, salvo los fosos, que siguen abiertos hasta el fondo del mapa.
- Sala del jefe (almacén): interior cols 160-219, filas 58-81 (2 pantallas de ancho × 1,5 de alto), techo en las filas 55-57 y muros en las cols 158-159 / 220-221. Cajas metálicas grandes 2x2 sólidas (tiles 13-16) en el suelo y apiladas, y plataformas colgantes de 5 tiles (`soloArriba`, tiles 17-18) escalonadas cada 3 filas (lo que alcanza un salto: ~60 px), cada una colgada con cables (tile 19, decoración) desde las abrazaderas de sus extremos hasta el techo o la plataforma de encima. Fondo: estanterías (balda 24, poste 25, hueco 26) llenas de cajas (2x2: 20-23; pequeña: 27) y lámparas bajo el techo. Generado con el script `almacen.cjs` (scratchpad de la sesión); para retocarlo a mano, editar el JSON.
- Capa `fondo` (opcional, sin colisión, depth -10): concreto metálico oscuro (tiles 8-12 de `tiles-pasillo`) detrás del pozo y del pasillo inferior, con 4 **ventanales** en el pozo (cols 102-115, filas 6-13, 22-29, 40-47 y 58-65: marcos y parteluces, tiles 29-39, y el hueco sin tile) por los que se ve el parallax, y estanterías con cajas (tiles 20-27) en el almacén. Los tiles con la propiedad `luz` (`cian`/`roja`) reciben en `crearLuces` un sprite `luz-fondo` que parpadea: las rojas con ritmo fijo de alarma, las cian con apagones breves al azar. El fondo debe ser bastante más oscuro que la roca sólida para no confundirse con pared.

## Combate

- Controles: A/D o ←/→ para moverse; **espacio** para saltar; **Shift** dash; **W/↑ para mirar arriba** (con A/D a la vez, en diagonal); S/↓ sobre una rejilla para dejarse caer a través de ella; **E / L / clic izquierdo** ataque (mantener repite según el enfriamiento) y **Q / J / clic derecho** ataque especial del arma equipada (el clic derecho se guarda en `especialPorClic` hasta el siguiente update; el menú contextual del navegador está desactivado con `input.mouse.disableContextMenu()`); **1** pistola y **2** espada; **V** para pausar/reanudar.
- Apuntar con el ratón: los ataques lanzados **con clic** salen hacia el cursor (`direccionRaton()`): ángulo libre de la horizontal hacia arriba y, **solo con pistola**, también hacia abajo por los lados hasta `ABAJO_MAXIMO` (60°) bajo la horizontal (pose `diagonalAbajo`; no hay forma de apuntar hacia abajo con el teclado). Con armas de mano un cursor por debajo del hombro ataca en horizontal. El jugador se gira hacia el lado del cursor y el brazo toma la pose más cercana (`poseCercana`: < -22,5° diagonal abajo, <22,5° frente, <67,5° diagonal, si no arriba), que se mantiene `POSE_RATON` ms tras el clic (`poseRaton`) para que se vea el retroceso; la bala, el estallido y el tajo usan el ángulo exacto (`usarAtaque(clave, time, direccionLibre)`). El especial de la espada (`soloFrente`) sale en horizontal hacia el lado del cursor. Los ataques **con teclado** (E/L/Q/J) siguen apuntando con W/A/D. Durante la partida el cursor del sistema se oculta y se dibuja la mira `mira` (9x9); vuelve el cursor normal en pausa y al salir de la escena.
- Apuntar: `GameScene.apuntado` vale `frente`, `arriba` (W sin moverse) o `diagonal` (W + caminar). Los ataques salen en esa dirección (salvo los `soloFrente`) desde la boca del cañón o el puño de la pose (`APUNTAR` en `GameScene`: `boca`, `mano` y `angulo`, relativos al centro del sprite mirando a la derecha).
- Poses del brazo: `arte/jugador.js` genera 12 bloques de 7 frames (quieto ×2, correr ×4, saltar). Pistola: 0 frente, 1 frente con retroceso, 2 arriba, 3 arriba con retroceso, 4 diagonal, 5 diagonal con retroceso, 10 diagonal abajo, 11 diagonal abajo con retroceso (la diagonal reflejada respecto al hombro). Mano vacía (armas de `pose: 'mano'`): 6 frente, 7 arriba, 8 diagonal, 9 reposo (brazo caído). Las animaciones solo usan el bloque 0; cada update, `actualizarAnimacion` muestra `frame + 7 × bloque`, con el bloque de `BLOQUES[arma.pose][pose]` (+1 de retroceso con pistola). Si se añaden frames o poses, mantener esa correspondencia (y `boca`/`mano` de `APUNTAR`).
- Armas de `pose: 'mano'` (la espada): el sprite del arma (`arma.sprite`) es un objeto aparte (`armaEnMano`) que `colocarArma()` sitúa en el puño y rota según `APUNTAR[...].angulo` en el evento `POST_UPDATE` (después de que la física mueva al jugador). Mirando a la izquierda el ángulo se refleja (`180 - ángulo`) y se usa `flipY`. En reposo cuelga hacia abajo e inclinada hacia atrás (pose `reposo`: brazo caído, bloque 9, 118°), casi rozando el suelo, con un balanceo de `BALANCEO_REPOSO` grados al caminar; solo apunta (frente/arriba/diagonal) mientras dura un tajo. Durante el tajo gira de `TAJO_DESDE` a `TAJO_HASTA`; durante la carga se sostiene en alto (`ANGULO_CARGA`, pose de brazo `arriba`).
- Todo dato de combate está en `src/config/combate.js`. El daño y la vida usan las mismas unidades: pistola `danio: 1` y rastreador `vida: 1` (un disparo, 100 %). Los enemigos más fuertes se crean como tipos nuevos en `ENEMIGOS` con más `vida`, no cambiando la lógica.
- Enemigos (`ENEMIGOS`):
  - `rastreador` (`robot-tentaculos`): vuela hacia el jugador atravesando tiles. Vida 1.
  - `cuchillero` (`robot-cuchillas`): robot humanoide blanco a seis patas con brazos-cuchilla. Camina por el suelo hacia el jugador con gravedad, choca con los tiles, baja desniveles de hasta 3 tiles y se detiene ante fosos y muros. Vida 2. El contacto no hace daño: al tener al jugador delante a ≤ `ataque.alcance` px se detiene y lanza un tajo doble (`robot-cuchillas-atacar`: preparar ×2, tajo ×2, recuperar); en el frame `ataque.frameGolpe` comprueba si el jugador sigue al alcance y le quita `ataque.danio`. Luego espera `ataque.enfriamiento` ms.
  - Cada tipo define `movimiento` (`volar`/`suelo`), `puntos` (nombre de sus puntos de aparición en el mapa), `animacion`, `vida`, `danio` (contacto; 0 = inofensivo al tocar), `ataque` opcional (cuerpo a cuerpo), `velocidad`, `colorGolpe` y `hitbox`. La hitbox debe llegar a la altura de la pistola (pecho del jugador).
- Aparición (`aparicion` del capítulo): cada tipo de `aparicion.tipos` tiene su propio temporizador (`programarAparicion`, una cadena de `delayedCall`), que empieza en `intervaloInicial` (3,5 s). Cada `cadaMuertes` (5) eliminados de un tipo, su intervalo baja `reduccion` (0,5 s) hasta `intervaloMinimo` (1,5 s); el de los demás tipos no cambia. El recuento llega por el evento de escena `EVENTO_ELIMINADO` (`'enemigo-eliminado'`, con el tipo), que emite `Enemigo.morir()`; el listener se retira en `SHUTDOWN` porque `this.events` sobrevive a `scene.restart`. Cada aparición usa un punto del grupo del tipo (`enemigo` o `enemigo-suelo`) a entre `distanciaMin` y `distanciaMax` px del jugador, con un máximo global de `aparicion.maximo` (12) vivos.
- Reubicación: cada `aparicion.revisarReubicacion` ms (500), todo enemigo vivo a más de `aparicion.distanciaReubicar` px (480) del jugador desaparece con un fundido y reaparece en un punto de su grupo **dentro de la vista** de la cámara (con un margen de `MARGEN_VISTA` px), sin esperar a los temporizadores y sin contar como aparición nueva (`Enemigo.reubicar`). Mientras se reubica no se mueve, no colisiona y no recibe daño. Si no hay ningún punto visible, se queda donde está hasta la siguiente comprobación. `elegirPunto(tipo, soloVisibles)` elige el punto tanto para apariciones como para reubicaciones.
- Uso en código: `new Enemigo(scene, x, y, tipo, objetivo)`, `this.enemigos.add(e)` y **después** `e.configurarCuerpo()` (el grupo sobrescribe los valores del cuerpo al añadirlo). Solo los enemigos de suelo colisionan con el nivel (`processCallback` del collider).
- Las balas se detienen en tiles sólidos y atraviesan las rejillas (`soloArriba`). La boca del cañón de cada pose está en `APUNTAR` de `GameScene`, ligada al dibujo del brazo en `arte/jugador.js`.
- Dash (Shift, `JUGADOR.dash`): impulso horizontal de `distancia` px (96) en `duracion` ms (150), hacia donde se pulsa o, sin dirección, hacia donde mira. Sin gravedad ni control mientras dura, **invulnerable** (`danarJugador` lo ignora) y con una estela de siluetas cian. Termina al recorrer la distancia (se corrige si el último frame se pasa), al chocar con un muro o una puerta, o por seguridad al doble de la duración. `enfriamiento` 800 ms desde que termina; en el aire solo uno por salto (`dashEnAire`, se repone al tocar suelo). No se puede durante la carga de la espada ni en el retroceso de un golpe.
- Puerta blindada (objeto `puerta` del mapa, clase `Puerta`, sprite `puerta-metal` 16x64): cuerpo estático que bloquea al jugador y a los enemigos de suelo. Tiene `PUERTA.vida` (10) y recibe daño de **todos** los ataques: las balas y la onda de la espada se quedan en ella (overlap), y el estallido y el tajo la incluyen en `objetivosDanables()` (que usa `danarFranja`). Su frame (0-3) muestra el daño; al llegar a 0 revienta en `chatarra` y retira sus colisiones (`registrar`). Ojo: en un collider/overlap entre un sprite suelto y un grupo, Phaser pasa **primero el sprite** a los callbacks, por eso se registran como `(puerta, grupo)`.
- Sala del jefe (rectángulo `sala-jefe`): al adentrarse `ENTRADA_SALA` px, `cerrarSala()` deja caer la compuerta (objeto `compuerta`: `Puerta` indestructible, frame 4, escondida en el techo hasta `cerrar()`), retira los enemigos normales vivos (`Enemigo.retirar()`, sin contar como eliminados), corta las apariciones normales y las reubicaciones (`salaCerrada`), limita la cámara a la sala y apaga la música de ambiente. Tras `jefe.retardo` ms (1,5 s), `iniciarJefe()` hace caer al jefe del techo en el objeto `jefe` del mapa, pone su música, su barra de vida (`barra-jefe` arriba en el centro, recortada según la vida, con el nombre debajo) y los **refuerzos**: un enemigo cada `refuerzos.intervalo` ms fijos (2 s), alternando `refuerzos.tipos`, con un máximo de `refuerzos.maximo` (10) vivos, en los puntos `enemigo` / `enemigo-suelo` **de dentro de la sala** (`elegirPunto` usa los de dentro solo con la sala cerrada, y los de fuera solo con ella abierta).
- Jefe `estibador` (`JEFES.estibador`, clase `Jefe`, sprite `jefe-estibador` 48x64, el doble que el jugador): humanoide negro de cuatro piernas con ojos y garras metálicas, `vida` 50. Solo choca con tiles sólidos (sube a las cajas, atraviesa las plataformas colgantes). Recibe daño como un enemigo (está en `objetivosDanables()` y tiene overlap con las balas). Estados (`estado`):
  - `entrada`: cae del techo, invulnerable; al aterrizar ruge (ojos encendidos) y empieza.
  - `acechar`: mira al jugador. **Cerca** (`cerca`: 72 px en horizontal, 44 en vertical): se para y lanza un zarpazo si está listo. **Lejos**: camina hacia él (salta los obstáculos con `salto` si hay hueco a `ALTURA_SALTABLE` px; un muro no) y dispara `bola-energia` desde la garra (`disparo`: daño 1, 200 px/s, cada 700 ms) al grupo `balasJefe` (`dispararBolaJefe`), que el dash esquiva. Tras `disparo.duracion` ms (4 s) lejos, pasa a `rayos`.
  - `zarpazo`: como el cuchillero (alza las garras y golpea delante; `frameGolpe` 6, un solo impacto aunque el frame salga dos veces), daño 1, `enfriamiento` 600 ms. Cada `cargado.cadaZarpazos` (3) zarpazos, `cargando`.
  - `cargando`: quieto con el aviso `onda-jefe` (anillo discontinuo parpadeando) `carga` ms (1,5 s); luego descarga en un radio de `cargado.radio` (88 px, el borde del aviso; `arte/onda-jefe.js` toma el radio de la configuración: tras cambiarlo, `npm run arte onda-jefe`): daño 2 y empujón, para alejar al jugador.
  - `rayos`: quieto con los ojos encendidos; `rayo.cantidad` (3) rayos desde los ojos, cada uno en dos fases: **marca** fina parpadeante hacia donde está el jugador (`aviso` 700 ms) y **rayo** que daña (2) sobre esa misma línea durante `duracion` ms (`TileSprite` rotado de `rayo-jefe`, cortado en el primer tile sólido con `alcanceLibre`). Pensado para esquivar con el dash y volver a acercarse.
  - `muerto`: animación `morir` y evento `EVENTO_JEFE_DERROTADO` → `jefeDerrotado()`: el jugador ya no recibe daño (`victoria`), se retiran los refuerzos y las bolas, se apaga la música y, a los `ESPERA_VICTORIA` ms (3 s), `completarCapitulo` y `CapituloCompletadoScene` encima de la escena en pausa.
  - Las secuencias con retardo usan `despues(ms, fn)` (se cortan si el jefe muere) y los anillos/rayos se registran con `efecto()` para destruirlos al morir.
- **Punto de control** (objeto `control` del mapa, entre la puerta blindada y la compuerta; sprite `terminal-control` 16x32: frame 0 inactiva, animación `activa`): al llegar a su altura (`x >= terminal - 8`), `activarControl()` pone `this.datos.control = "control"`, enciende la pantalla, suena `control-activar` y muestra "SEÑAL REGISTRADA". Como `GameOverScene` reinicia con `this.datos`, "VOLVER A INTENTARLO" reaparece a `REAPARICION_CONTROL` px a su izquierda, con vida completa, la puerta ya rota (no se crea), la terminal encendida y **sin apariciones normales**. No se guarda en el progreso: desde el menú el capítulo empieza de cero.
- Células de energía (`CURACION`, sprite `celula-vida` 8x8): al morir, cada enemigo (también los refuerzos del jefe) tiene `probabilidad` (20 %) de soltar una. `EVENTO_ELIMINADO` lleva el enemigo como segundo argumento y `soltarCelula` la crea en el grupo `celulas` (con gravedad, choca con los tiles): salta, cae y se posa. Al tocarla, `recogerCelula` recupera `vida` (1), **salvo con la vida al máximo**, que se queda donde está. Parpadea a los `aviso` ms (8 s) y desaparece a los `duracion` ms (10 s).
- Jugador: `JUGADOR.vida` = 12. Cada enemigo hace `danio` por contacto (rastreador: 1). Tras un golpe hay retroceso, 200 ms sin control y `JUGADOR.invulnerabilidad` ms (1000) de invulnerabilidad con parpadeo. Con vida 0 (o al caer): tinte rojo, 700 ms de pausa y `GameOverScene` encima de `GameScene` pausada, con "VOLVER A INTENTARLO" (reinicia el nivel con los mismos datos) y "MENU PRINCIPAL". La pantalla ignora el teclado los primeros 600 ms para que un disparo mantenido no confirme al instante.
- HUD: una celda de `hud-vida` por punto de vida máximo, arriba a la izquierda (`setScrollFactor(0)`, depth 100); se refresca con `actualizarHud()`.
- Armas (`ARMAS` en `config/combate.js`): cada arma tiene `nombre`, `pose`, `ataque` (E/L) y `especial` (Q/J), cada uno con su `tipo`, `danio` y `enfriamiento` (ms). `ARMAS_INICIALES` (`['pistola', 'espada']`) lista las que lleva el jugador en el orden de las teclas 1, 2. `equiparArma(id)` cambia `this.arma` (no durante una carga); los enfriamientos se guardan por arma (`this.enfriamientos[id]`, accesibles como `this.listoEn` del arma equipada) y se conservan al cambiar. `usarAtaque('ataque' | 'especial', time)` despacha por tipo:
  - `proyectil` (pistola E): bala del pool `Proyectil`, rotada hacia la dirección; su caja de colisión se ajusta (horizontal, vertical o diagonal). Desaparece a `alcance` px de su origen.
  - `estallido` (pistola Q, la antigua "escopeta"): impacto instantáneo en una franja de `alcance` (192) × `ancho` (32) px desde el cañón en la dirección de apuntado, que daña a **todos** los enemigos dentro (`danio` 4, `enfriamiento` 6 s). Se corta en el primer tile que bloquea de lado o por abajo (las rejillas no lo frenan). Efecto: sprite `efecto` (`escopeta`, `alcance`x32: `arte/escopeta.js` toma el largo de la configuración; tras cambiar el alcance, `npm run arte escopeta`) con origen en la boca, rotado hacia la dirección y recortado con `setCrop` al alcance real.
  - `tajo` (espada E): golpe cuerpo a cuerpo instantáneo en una franja de 80 × 32 px desde el puño, en la dirección de apuntado, que daña a todos los enemigos dentro (`danio` 2, `enfriamiento` 400 ms). Efecto `tajo-espada` (media luna 80x32; con `flipY` mirando a la izquierda) y giro del arma durante `duracion` ms.
  - `carga` (espada Q): con `carga` 0 (el valor actual) el proyectil sale en el acto (`lanzarCargado`); con `carga` > 0, `empezarCarga` deja al jugador inmóvil `carga` ms con el aura `carga-espada` y la espada en alto; sin moverse, saltar, atacar ni cambiar de arma, y **sigue cargando aunque reciba daño**. Al terminar, `actualizarCarga` llama a `lanzarCargado`, que lanza `proyectil` **solo al frente** (onda `onda-espada`, `danio` 8, `alcance` 192, `atraviesa`: daña a cada enemigo una vez sin detenerse, `cuerpo` 10x28) y empieza el `enfriamiento` (10 s). Morir cancela la carga.
  - Funciones comunes: `alcanceLibre` (corte en muros), `danarFranja` (daño en área) y `efectoDireccional` (sprite rotado y recortado).
- **Reinicios de escena**: `scene.restart` / `scene.start` sobre una escena ya usada reutilizan **la misma instancia**; las propiedades `this.x` de la partida anterior siguen ahí. Todo estado debe inicializarse en `create()` (o en métodos que llame `create()`), nunca solo en `update()` o en métodos llamados más tarde. Si una propiedad guarda un objeto de Phaser (HUD, sprites), al reiniciar apunta a un objeto ya destruido y usarlo rompe `create()` a medias: la escena queda inactiva y el jugador congelado. Por eso `GameScene.create()` limpia al principio `armaId`, `textoArma` y `alturaAire`.
- `GameScene.update()` usa `this.time.now` (reloj de la escena, que se detiene en la pausa) y no el `time` del bucle del juego, para que la pausa no consuma cargas ni enfriamientos.
- HUD del arma: encima del icono, "1 PISTOLA" / "2 ESPADA" (`actualizarHudArma`, con un breve fundido al cambiar).
- HUD del especial: abajo a la derecha, el `icono` del especial del arma equipada (`hud-escopeta` / `hud-espada`) apagado y encima el cargado recortado desde abajo según el progreso; la "Q" se ve cian cuando está lista y gris mientras recarga; un destello breve avisa al completar la carga.
- Pausa (V): `PauseScene` con "CONEXION PERDIDA" y las opciones "RECONECTAR" (también con V) y "SALIR AL MENU". Al reanudar, `GameScene` llama a `input.keyboard.resetKeys()` para que no queden teclas "pegadas".

## Estado actual / pendientes conocidos

- Las celdas vacías del HUD tienen poco contraste sobre los muros; mejorará con un marco o fondo para el HUD.
- El parallax solo tiene dos capas; falta niebla o partículas de polvo (skill `ambientacion`).
