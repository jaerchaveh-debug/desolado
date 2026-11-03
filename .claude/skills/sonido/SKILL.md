---
name: sonido
description: Guía y procedimiento para crear la música y los efectos de sonido del juego con código (sonido/*.js → WAV) en el tono de la megaestructura - ambiente industrial con maquinaria y ecos, impactos metálicos, armas y disparos, ataques y muertes de enemigos, música oscura y minimalista. Usar al crear, modificar o conectar cualquier sonido o pista de música.
---

# Sonido y música

Todo el audio se sintetiza con código en `sonido/<nombre>.js` y se genera con `npm run sonido`, igual que el arte. Nunca editar a mano los WAV de `public/assets/sonidos/` ni `src/assets/sonidos.json`: se regeneran.

## Identidad sonora

La megaestructura es inmensa, vieja, vacía y sigue funcionando sola. El sonido tiene que transmitir **escala, soledad y máquina**. Igual que en el arte, la inspiración (*BLAME!*) es solo de tono: no imitar bandas sonoras ni sonidos reconocibles de ninguna obra.

1. **Espacio enorme**: casi todo lleva reverberación o eco. Lo lejano suena oscuro (filtrado) y con mucha cola; lo cercano, seco y brillante. Un golpe en la sala del jefe retumba más que uno en el pasillo.
2. **Materia industrial**: metal (chapas, vigas, garras), electricidad (zumbidos, chispas), aire y vapor (ruido filtrado), peso (graves que caen de tono). Nada orgánico ni cálido; el jugador es el único elemento "vivo" y suena discreto.
3. **Frío y minimalismo**: la música es dron, pulso y notas sueltas, no melodía. Escalas menores y modos oscuros (Re menor, Re frigio con su Mi bemol). Sin acordes mayores ni ritmos alegres.
4. **Silencio relativo**: el fondo nunca está en silencio total (zumbido, maquinaria), pero es bajo. Los efectos importantes destacan por contraste, no por volumen.
5. **Legibilidad en combate**: cada acción del jugador y cada amenaza tiene un sonido inconfundible. Los avisos (carga del jefe, aviso del rayo) duran exactamente lo que la amenaza y suben de tono o de intensidad para avisar del momento de esquivar.

## Paleta sonora (cómo se construye cada material)

| Material | Receta (`tools/sonido/sintesis.js`) |
|---|---|
| Chapa, garra, pieza que cae | `metal({ frecuencia, decaimiento, brillo })`: modos inarmónicos de placa. Grave y largo = plancha gruesa (90-200 Hz); agudo y corto = pieza pequeña o rebote de bala (1-3 kHz) |
| Peso, impacto, retroceso | `oscilador` seno con `rampa` de tono que cae (p. ej. 120 → 40 Hz) + `golpe` |
| Chasquido, disparo | `ruido` blanco + `pasoAlto` + `golpe` muy corto (tau 5-30 ms) |
| Aire, tajo, dash | `ruido` + `pasoBanda` con corte que barre (función del tiempo) + `envolvente` |
| Electricidad, energía | `cuadrada` o `sierra` + `saturar`/`triturar`; crepitar = muchos chasquidos al azar |
| Motor, servo, rugido | `sierra` desafinadas + `saturar` + `pasoBanda` que se abre y se cierra |
| Interferencia digital (traje, muerte) | `triturar` (menos bits = más roto) |
| Distancia y nave | `eco` (repeticiones oscuras: `corte` bajo) y `reverb` (`tamano` alto, `cola` larga) |
| Retumbo de maquinaria | `ruido` marrón + `pasoBajo` (< 200 Hz) |

## Reglas técnicas

- Mono, 22 050 Hz, 16 bits (`FM`). Determinista: el azar sale de `semilla`/`azar()`, nunca `Math.random()`.
- **Efectos**: el primer sonido llega en < 30 ms (si no, se siente retrasado); terminan en silencio con `fundido`; `normalizar` a 0,9 y el nivel relativo se ajusta con `volumen`. Máximo 6 s.
- **Variantes**: los efectos que se repiten mucho (disparos, impactos, tajos, golpes) llevan 2-3 `variantes` con otra semilla y un tono algo distinto. Además, `sonar()` varía la velocidad ±5 % al reproducir.
- **Duraciones ligadas al juego**: si un sonido acompaña a una animación o a un ataque, importa su duración de `src/config/combate.js` (como `jefe-carga.js` con `JEFES.estibador.cargado.carga`). Tras cambiar el valor, `npm run sonido <nombre>`.
- **Bucles** (`bucle: true`, ambiente y música):
  - Capas continuas (drones, ruido de fondo): generarlas `SOLAPE` s más largas y cerrarlas con `bucleCruzado(s, D, SOLAPE)`.
  - Capas de eventos sueltos con colas de eco/reverberación: `plegar(s, D)` lleva las colas al principio.
  - Procesos con memoria sobre el bucle ya cerrado (filtro final): `enBucle(s, x => pasoAlto(x, 25))`.
  - Los osciladores lentos (`lfo`) deben completar ciclos enteros en la duración (p. ej. 1/16 Hz en 64 s).
  - Música rítmica: duración exacta en compases (`COMPASES * 4 * 60 / BPM`).
- Sin desplazamiento de continua: si hay ruido marrón o saturación asimétrica, `pasoAlto(s, 20-25)`.

## Niveles de mezcla (`volumen` del manifiesto)

| Tipo | `volumen` | Ejemplos |
|---|---|---|
| Muy frecuentes y discretos | 0,15-0,3 | salto, rebote de bala en el muro |
| Golpes frecuentes | 0,35-0,5 | impactos, tajos, disparos, golpes al jefe |
| Acciones fuertes del jugador | 0,6-0,7 | estallido, onda, caída alta |
| Eventos grandes | 0,8-0,9 | jefe: aterrizaje, rugido, descarga, muerte; compuerta; puerta rota |
| Ambiente en bucle | 0,45 | `ambiente-pasillo` (× `VOLUMEN_AMBIENTE` de `GameScene`) |
| Música | 1 | × `VOLUMEN_MUSICA` de `GameScene` |

En el juego el volumen final es `volumen × VOLUMEN_EFECTOS × atenuación por distancia` (`src/sistema/sonido.js`).

## Música

Bucles de 32-64 s, hechos de capas:
- **Dron**: sierras graves desafinadas (Re2 y Re1) por un `pasoBajo` que "respira" con un `lfo` lento; la quinta entra y sale.
- **Pulso**: un latido sordo cada pocos segundos (exploración) o percusión industrial (combate): bombo saturado, chapa en 2 y 4, siseos de vapor.
- **Tonos fríos**: notas agudas aisladas con ataque lento, perdidas en una reverberación inmensa.
- **Tensión**: semitonos (Re–Mi bemol), un agudo disonante que entra en la segunda mitad.

La pista `ambiente` del capítulo de "Continuar" suena también en los menús (`FondoMenuScene`). Las pistas del capítulo se declaran en `musica` del capítulo (archivos externos) y sus alternativas generadas se llaman `musica-<pista>` (`musica-ambiente`, `musica-jefe`). Con `?musica=generada` en la URL el juego usa las generadas, para comparar.

## Formato de una definición

```js
// Comentario de cabecera: qué es, cuándo suena y de qué capas está hecho.
import { ruido, metal, golpe, mezclar, pasoAlto, reverb, fundido, normalizar } from '../tools/sonido/sintesis.js';

export default {
    nombre: 'impacto-muro',   // = nombre del archivo; es la clave para sonar()
    tipo: 'efecto',           // 'efecto' | 'ambiente' | 'musica'
    variantes: 3,             // opcional (1 por defecto): generar(v) se llama con v = 0..n-1
    bucle: false,             // true en ambiente y música
    volumen: 0.28,            // nivel en la mezcla (ver tabla)
    generar: v => {
        const tic = golpe(pasoAlto(ruido(0.05, { semilla: 50 + v }), 3000), { ataque: 0.0005, tau: 0.008 });
        const ping = golpe(metal(0.4, { frecuencia: 2400 + v * 400, decaimiento: 0.12, brillo: 0.7, semilla: 51 + v }), { tau: 0.05 });
        return fundido(normalizar(reverb(mezclar([[tic, 0.8], [ping, 0.5]]), { tamano: 0.5, mezcla: 0.2, cola: 0.3 })), 0.0005, 0.1);
    }
};
```

## Herramientas (`tools/sonido/`)

- `sintesis.js`: fuentes (`ruido` blanco/rosa/marrón, `oscilador` seno/sierra/cuadrada/triángulo, `metal`), forma (`golpe`, `envolvente`, `ganancia`, `fundido`, `recortar`, `unir`, `mezclar([[señal, ganancia, inicio], ...])`, `velocidad`), color (`pasoBajo`/`pasoAlto`/`pasoBanda` con corte fijo o función del tiempo, `saturar`, `triturar`, `resonador`), espacio (`eco`, `reverb`), bucles (`plegar`, `bucleCruzado`, `enBucle`) y utilidades (`azar`, `nota(midi)`, `rampa`, `lfo`).
- `generar.js` (`npm run sonido [nombre]`): WAV, manifiesto y la vista `sonido/preview/<nombre>.png`.
- `espectro.js`: la vista: forma de onda arriba y espectrograma debajo (frecuencia logarítmica de 40 Hz a 11 kHz de abajo arriba; energía de negro a cian y blanco). Una fila por variante.
- `revisar.js` (`npm run sonido:revisar`): saturación, continua, silencio inicial, chasquido final, empalme de bucles, duración y nivel (pico y RMS) de cada archivo.

## Procedimiento

1. Define el sonido con palabras: qué es, qué material, cerca o lejos, cuánto dura y con qué frecuencia suena (¿necesita variantes?). Elige su `volumen` con la tabla.
2. Escribe `sonido/<nombre>.js` combinando capas de la paleta sonora.
3. `npm run sonido <nombre>`.
4. **Mira la vista** `sonido/preview/<nombre>.png` con Read: ataque inmediato, cola que se apaga, barridos de tono en la dirección prevista, ritmo de la música. No puedes oírlo: el espectrograma y `sonido:revisar` son tu forma de comprobarlo. Pide al usuario que lo escuche (el WAV está en `public/assets/sonidos/`) cuando importe el carácter del sonido.
5. `npm run sonido:revisar`: debe pasar sin problemas.
6. Conéctalo al juego (abajo) y compruébalo en marcha.

## En el juego

- `src/sistema/sonido.js`: `sonar(scene, nombre, { volumen, x, variacion })` elige variante, varía la velocidad, evita repetir el mismo sonido en menos de 45 ms y, con `x`, aplica panorámica y atenúa lo que queda fuera de la pantalla. `PreloadScene` carga todo el manifiesto con `cargarSonidos`.
- Enemigos y jefe: sus sonidos están en `sonidos` de su tipo en `src/config/combate.js` (`golpe`, `ataque`, `morir`; el jefe uno por momento de su máquina de estados) y suenan con `efectoSonoro(momento)`. Un enemigo nuevo solo necesita sus nombres ahí.
- Ambiente del capítulo: `ambiente` en `capitulo-NN/capitulo.js` (nombre de un sonido de tipo `ambiente`); `GameScene.crearMusica` lo pone en bucle bajo la música.
- Probar sin oír: Edge sin interfaz en tiempo real (no con `--virtual-time-budget`, que no termina de decodificar el audio), con `--autoplay-policy=no-user-gesture-required`, contando las llamadas a `AudioBufferSourceNode.prototype.start` y leyendo los errores de consola por CDP.

## Catálogo actual

| Sonido | Dónde suena |
|---|---|
| `pistola-disparo` (3) · `pistola-estallido` | `lanzarProyectil` (bala) · `estallido` |
| `espada-tajo` (3) · `espada-onda` | `tajar` · `lanzarCargado` |
| `impacto-muro` (3) · `impacto-metal` (3) | bala contra el nivel · enemigo golpeado sin morir |
| `cambiar-arma` · `jugador-dash` · `jugador-salto` | `equiparArma` · `empezarDash` · salto |
| `jugador-golpe` (2) · `jugador-caida` · `jugador-morir` | `danarJugador` · caída alta · `morirJugador` |
| `celula-recoger` | `recogerCelula` |
| `control-activar` | `activarControl` (punto de control) |
| `rastreador-morir` (2) · `cuchillero-ataque` · `cuchillero-morir` | `Enemigo` (`sonidos` del tipo) |
| `jefe-*` (aterrizar, rugido, zarpazo, golpe, carga, descarga, disparo, rayo-aviso, rayo, morir) · `bola-impacto` | `Jefe` (`JEFES.estibador.sonidos`) · bola contra el nivel o el jugador |
| `puerta-golpe` (2) · `puerta-rota` · `compuerta-cerrar` · `compuerta-abrir` | `Puerta` |
| `alarma-emboscada` | `empezarEmboscada` |
| `ambiente-pasillo` | ambiente del capítulo 1 |
| `musica-ambiente` · `musica-jefe` | alternativas generadas de la música del capítulo 1 (`?musica=generada`) |
