import Phaser from 'phaser';
import sprites from '../assets/sprites.json';
import CAPITULOS, { claveNivel, claveMusica } from '../capitulos';
import { cargarSonidos } from '../sistema/sonido';

// Carga todas las hojas generadas con `npm run arte` (ver src/assets/sprites.json),
// crea sus animaciones con la clave "<sprite>-<animacion>" y carga los niveles de Tiled, la música
// y los sonidos generados con `npm run sonido` (ver src/assets/sonidos.json).
export default class PreloadScene extends Phaser.Scene {

    constructor() {
        super('PreloadScene');
    }

    preload() {
        for (const [clave, s] of Object.entries(sprites)) {
            this.load.spritesheet(clave, s.archivo, { frameWidth: s.ancho, frameHeight: s.alto });
        }
        // Mapas de todos los capítulos disponibles: public/assets/niveles/<capitulo>/<nivel>.json
        for (const capitulo of CAPITULOS.filter(c => c.disponible)) {
            for (const nivel of capitulo.niveles) {
                const clave = claveNivel(capitulo, nivel);
                this.load.tilemapTiledJSON(clave, `assets/niveles/${clave}.json`);
            }
            // Música del capítulo: public/assets/<ruta>
            for (const [nombre, ruta] of Object.entries(capitulo.musica ?? {})) {
                this.load.audio(claveMusica(capitulo, nombre), `assets/${ruta}`);
            }
        }
        cargarSonidos(this);
    }

    create() {
        for (const [clave, s] of Object.entries(sprites)) {
            // Fuentes pixel art: la hoja de glifos se registra como fuente bitmap para this.add.bitmapText
            if (s.tipo === 'fuente') {
                this.cache.bitmapFont.add(clave, Phaser.GameObjects.RetroFont.Parse(this, {
                    image: clave,
                    width: s.ancho,
                    height: s.alto,
                    chars: s.caracteres,
                    charsPerRow: s.frames
                }));
            }
            for (const [nombre, a] of Object.entries(s.animaciones)) {
                this.anims.create({
                    key: `${clave}-${nombre}`,
                    frames: this.anims.generateFrameNumbers(clave, { frames: a.frames }),
                    frameRate: a.fps,
                    repeat: a.repetir
                });
            }
        }

        this.scene.start('MenuScene');
    }
}
