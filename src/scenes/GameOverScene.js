import Phaser from 'phaser';
import PantallaSuperpuesta, { COLORES } from './PantallaSuperpuesta';

// Pantalla de muerte. Se lanza encima de GameScene (en pausa): reintentar o volver al menú.
export default class GameOverScene extends PantallaSuperpuesta {

    constructor() {
        super('GameOverScene');
    }

    construir() {
        this.texto(104, 'HAS MUERTO', COLORES.ROJO, 2);
        this.texto(130, 'SEÑAL VITAL PERDIDA', COLORES.GRIS);
        this.menu(154, [
            { texto: 'VOLVER A INTENTARLO', accion: () => this.reintentar() },
            { texto: 'MENU PRINCIPAL', accion: () => this.irAlMenu() }
        ]);
        this.texto(204, 'W/S ELEGIR   ENTER/E ACEPTAR', COLORES.GRIS_OSCURO);
    }

    reintentar() {
        this.cameras.main.fadeOut(250, 7, 8, 11);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            // Reinicia GameScene (está en pausa) con el mismo capítulo, nivel y punto de control
            // (si se alcanzó, se reaparece junto a su terminal), y cierra esta pantalla
            this.scene.start('GameScene', this.datosJuego);
        });
    }
}
