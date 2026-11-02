import PantallaSuperpuesta, { COLORES } from './PantallaSuperpuesta';

// Pausa (tecla V). Se lanza encima de GameScene (en pausa): reconectar (reanudar) o salir al menú.
// V también reanuda directamente.
export default class PauseScene extends PantallaSuperpuesta {

    constructor() {
        super('PauseScene');
        this.duracionVelo = 200;
        this.retardoContenido = 100;
        this.espera = 150;
    }

    construir() {
        const titulo = this.texto(104, 'CONEXION PERDIDA', COLORES.CIAN, 2);
        this.texto(130, 'ENLACE CON EL SISTEMA INTERRUMPIDO', COLORES.GRIS);
        const menu = this.menu(154, [
            { texto: 'RECONECTAR', accion: () => this.reconectar() },
            { texto: 'SALIR AL MENU', accion: () => this.irAlMenu() }
        ]);
        this.texto(204, 'V RECONECTAR   W/S ELEGIR   ENTER/E ACEPTAR', COLORES.GRIS_OSCURO);

        this.time.delayedCall(this.espera, () => {
            this.input.keyboard.on('keydown-V', () => {
                if (menu.bloqueado) return;
                menu.bloqueado = true;
                this.reconectar();
            });
        });

        // Interferencia: el título se apaga a ratos, como una señal inestable
        this.time.addEvent({
            delay: 1400,
            loop: true,
            callback: () => {
                if (titulo.alpha < 1) return;   // aún apareciendo
                this.tweens.add({ targets: titulo, alpha: 0.3, duration: 40, yoyo: true, repeat: 1 });
            }
        });
    }

    reconectar() {
        this.scene.resume('GameScene');
        this.scene.stop();
    }
}
