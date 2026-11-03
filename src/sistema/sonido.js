import Phaser from 'phaser';
import sonidos from '../assets/sonidos.json';
import { claveMusica } from '../capitulos';

// Efectos de sonido generados con `npm run sonido` (ver src/assets/sonidos.json y la skill sonido).
// Cada sonido puede tener varias variantes: sonar() elige una al azar y varía un poco la velocidad
// para que los efectos repetidos (disparos, impactos) no suenen idénticos.

export const VOLUMEN_EFECTOS = 0.8;
// ms mínimos entre dos reproducciones del mismo sonido (p. ej. un estallido que golpea a 8 enemigos)
const ESPERA_MINIMA = 45;
// ± fracción de velocidad aleatoria (0,05 = ±5 %: algo más grave o más agudo)
const VARIACION = 0.05;
// Panorámica máxima según la posición horizontal en pantalla (-1 izquierda, 1 derecha)
const PANORAMICA = 0.6;

export const claveSonido = (nombre, variante = 0) => `sonido/${nombre}-${variante}`;

export const datosSonido = nombre => sonidos[nombre];

// Música alternativa generada: se activa abriendo el juego con ?musica=generada en la URL
export function musicaGenerada() {
    return new URLSearchParams(window.location.search).get('musica') === 'generada';
}

// Pista de música 'nombre' ('ambiente', 'jefe') de un capítulo: la del capítulo o, con ?musica=generada,
// su alternativa generada musica-<nombre>. Devuelve { clave, volumen } o null si no hay pista cargada.
export function pistaMusica(scene, capitulo, nombre) {
    const generada = musicaGenerada() && sonidos[`musica-${nombre}`];
    const clave = generada ? claveSonido(`musica-${nombre}`) : claveMusica(capitulo, nombre);
    if ((!generada && !capitulo.musica?.[nombre]) || !scene.cache.audio.exists(clave)) return null;
    return { clave, volumen: generada ? generada.volumen : 1 };
}

// Llamar desde PreloadScene.preload
export function cargarSonidos(scene) {
    for (const [nombre, datos] of Object.entries(sonidos)) {
        datos.archivos.forEach((archivo, v) => scene.load.audio(claveSonido(nombre, v), archivo));
    }
}

const ultimaVez = new Map();

// Reproduce un efecto. opciones: volumen (multiplica el del manifiesto), x (posición en el mundo:
// panorámica y atenuación si queda fuera de la pantalla), variacion (de velocidad).
export function sonar(scene, nombre, { volumen = 1, x = null, variacion = VARIACION } = {}) {
    const datos = sonidos[nombre];
    if (!datos) return;
    const ahora = scene.game.loop.time;
    if (ahora - (ultimaVez.get(nombre) ?? -Infinity) < ESPERA_MINIMA) return;
    const clave = claveSonido(nombre, Phaser.Math.Between(0, datos.archivos.length - 1));
    if (!scene.cache.audio.exists(clave)) return;
    ultimaVez.set(nombre, ahora);

    let pan = 0, distancia = 1;
    if (x !== null) {
        const camara = scene.cameras.main;
        const relativa = (x - camara.midPoint.x) / (camara.width / 2);   // -1..1 dentro de la pantalla
        pan = Phaser.Math.Clamp(relativa * PANORAMICA, -PANORAMICA, PANORAMICA);
        distancia = Phaser.Math.Clamp(1 - (Math.abs(relativa) - 1) * 0.5, 0.3, 1);
    }
    scene.sound.play(clave, {
        volume: datos.volumen * VOLUMEN_EFECTOS * volumen * distancia,
        rate: 1 + (Math.random() * 2 - 1) * variacion,
        pan
    });
}
