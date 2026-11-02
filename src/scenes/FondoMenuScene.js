import Phaser from 'phaser';
import CAPITULOS, { claveNivel } from '../capitulos';
import { COLORES } from '../ui/colores';

// Fondo animado de los menús: el primer nivel del juego oscurecido, con la cámara recorriéndolo
// lentamente. Corre por debajo de MenuScene / CapitulosScene / ControlesScene y se detiene al empezar a jugar.
export default class FondoMenuScene extends Phaser.Scene {

    constructor() {
        super('FondoMenuScene');
    }

    create() {
        const capitulo = CAPITULOS[0];
        const mapa = this.make.tilemap({ key: claveNivel(capitulo, capitulo.niveles[0]) });
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
    }
}
