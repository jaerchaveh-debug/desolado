import Phaser from 'phaser';
import MenuOpciones from '../ui/MenuOpciones';
import { COLORES } from '../ui/colores';
import { registrarInicio } from '../sistema/progreso';

// Base de las escenas de menú (inicio, capítulos, controles): se dibujan sobre FondoMenuScene.
export default class MenuBase extends Phaser.Scene {

    create() {
        const { width: w, height: h } = this.scale;
        this.cx = Math.round(w / 2);
        this.alto = h;
        if (!this.scene.isActive('FondoMenuScene')) this.scene.launch('FondoMenuScene');
        this.scene.bringToTop();

        this.construir();
    }

    texto(x, y, cadena, color, escala = 1) {
        return this.add.bitmapText(x, y, 'fuente', cadena).setOrigin(0.5).setScale(escala).setTint(color);
    }

    titulo(cadena, y = 88) {
        this.texto(this.cx, y, cadena, COLORES.BLANCO, 2);
        this.add.rectangle(this.cx, y + 32, 320, 2, COLORES.CIAN_OSCURO);
    }

    menu(config) {
        return new MenuOpciones(this, { x: this.cx, separacion: 32, espera: 150, ...config });
    }

    pie(cadena) {
        this.texto(this.cx, this.alto - 32, cadena, COLORES.GRIS_OSCURO);
    }

    irA(escena) {
        this.scene.start(escena);
    }

    // Empieza un capítulo desde su primer nivel
    jugar(capitulo) {
        registrarInicio(capitulo.id);
        this.cameras.main.fadeOut(400, 7, 8, 11);
        const fondo = this.scene.get('FondoMenuScene');
        fondo.cameras.main.fadeOut(400, 7, 8, 11);
        fondo.apagarMusica(400);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.stop('FondoMenuScene');
            this.scene.start('GameScene', { capitulo: capitulo.id, nivel: 0 });
        });
    }
}
