import Phaser from 'phaser';
import MenuOpciones from '../ui/MenuOpciones';
import { COLORES } from '../ui/colores';

export { COLORES };

// Base de las pantallas que se muestran encima de GameScene en pausa (muerte, pausa...).
// Velo oscuro, marco de terminal, textos con la fuente pixel art y un menú de opciones.
// Las subclases implementan construir() (textos con this.texto y this.menu(...)).
export default class PantallaSuperpuesta extends Phaser.Scene {

    init(datos) {
        // Capítulo y nivel en curso, para reiniciar o volver al menú
        this.datosJuego = datos;
    }

    create() {
        const { width: w, height: h } = this.scale;
        this.cx = Math.round(w / 2);
        this.contenido = [];

        const velo = this.add.rectangle(0, 0, w, h, COLORES.NEGRO).setOrigin(0).setAlpha(0);
        this.tweens.add({ targets: velo, alpha: 0.9, duration: this.duracionVelo ?? 500 });

        // Marco de terminal: dos líneas cian tenues
        this.contenido.push(
            this.add.rectangle(this.cx, 176, 440, 2, COLORES.CIAN_OSCURO),
            this.add.rectangle(this.cx, 380, 440, 2, COLORES.CIAN_OSCURO)
        );

        this.construir();

        this.contenido.forEach(o => o.setAlpha(0));
        this.tweens.add({ targets: this.contenido, alpha: 1, duration: 300, delay: this.retardoContenido ?? 300 });
    }

    texto(y, cadena, color, escala = 1) {
        // Escala entera para mantener la rejilla de píxeles
        const t = this.add.bitmapText(this.cx, y, 'fuente', cadena).setOrigin(0.5).setScale(escala).setTint(color);
        this.contenido.push(t);
        return t;
    }

    menu(y, opciones) {
        const menu = new MenuOpciones(this, { x: this.cx, y, separacion: 28, opciones, espera: this.espera ?? 600 });
        this.contenido.push(...menu.objetos);
        return menu;
    }

    // Cierra el juego y vuelve al menú principal
    irAlMenu() {
        this.cameras.main.fadeOut(250, 7, 8, 11);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.stop('GameScene');
            this.scene.start('MenuScene');
        });
    }
}
