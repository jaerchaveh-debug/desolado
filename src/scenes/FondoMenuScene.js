import Phaser from 'phaser';
import CAPITULOS, { claveNivel } from '../capitulos';
import { capituloParaContinuar } from '../sistema/progreso';
import { pistaMusica } from '../sistema/sonido';
import { COLORES } from '../ui/colores';
import { crearParallax } from '../ambiente/parallax';

const VOLUMEN_MUSICA_MENU = 0.4;

// Fondo animado de los menús: el primer nivel del juego oscurecido, con la cámara recorriéndolo
// lentamente, con la música de exploración del capítulo actual (el que empieza "Continuar").
// Corre por debajo de MenuScene / CapitulosScene / ControlesScene y se detiene al empezar a jugar.
export default class FondoMenuScene extends Phaser.Scene {

    constructor() {
        super('FondoMenuScene');
    }

    create() {
        const capitulo = CAPITULOS[0];
        const mapa = this.make.tilemap({ key: claveNivel(capitulo, capitulo.niveles[0]) });
        crearParallax(this);
        const tilesets = mapa.tilesets.map(t => mapa.addTilesetImage(t.name, t.name));
        if (mapa.getLayer('fondo')) mapa.createLayer('fondo', tilesets, 0, 0);
        mapa.createLayer('plataformas', tilesets, 0, 0);

        const { width: w, height: h } = this.scale;
        const cam = this.cameras.main;
        cam.setBounds(0, 0, mapa.widthInPixels, mapa.heightInPixels);
        this.tweens.add({
            targets: cam,
            scrollX: mapa.widthInPixels - w,
            duration: 60000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // Velo oscuro fijo a la cámara para que el texto del menú destaque
        this.add.rectangle(0, 0, w, h, COLORES.NEGRO).setOrigin(0).setScrollFactor(0).setAlpha(0.78);
        cam.fadeIn(600, 7, 8, 11);
        this.crearMusica();
    }

    // Pista 'ambiente' del capítulo actual en bucle. Si el navegador aún no deja reproducir audio
    // (sin interacción del usuario), Phaser la arranca con la primera tecla o clic.
    crearMusica() {
        this.musica = null;
        const capitulo = capituloParaContinuar();
        const datos = pistaMusica(this, capitulo, 'ambiente');
        if (!datos) return;
        this.musica = this.sound.add(datos.clave, { loop: true, volume: 0 });
        this.musica.play();
        this.tweens.add({ targets: this.musica, volume: VOLUMEN_MUSICA_MENU * datos.volumen, duration: 1500 });
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.musica?.destroy();
            this.musica = null;
        });
    }

    // Fundido de salida de la música (al empezar a jugar, antes de detener la escena)
    apagarMusica(duracion) {
        if (this.musica) this.tweens.add({ targets: this.musica, volume: 0, duration: duracion });
    }
}
