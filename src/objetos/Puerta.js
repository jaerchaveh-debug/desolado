import Phaser from 'phaser';
import { PUERTA } from '../config/combate';
import { sonar } from '../sistema/sonido';

const FRAMES_DANIO = 4;      // frames 0-3 de 'puerta-metal': de intacta a destrozada
const FRAME_COMPUERTA = 4;
const PIEZAS_CHATARRA = 10;

// Puerta blindada destructible (sprite 'puerta-metal' con cuerpo estático). Bloquea al jugador y a los
// enemigos de suelo hasta que recibe PUERTA.vida de daño. Admite el mismo daño que un enemigo
// (recibirDanio, vivo, reubicando), así que las balas y los ataques en área la golpean igual.
// Con indestructible = true es la compuerta de la sala del jefe: empieza abierta (escondida en el
// techo) y cae con cerrar().
export default class Puerta extends Phaser.Physics.Arcade.Sprite {

    // (x, y): centro inferior de la puerta (donde apoya en el suelo)
    constructor(scene, x, y, indestructible = false) {
        super(scene, x, y, 'puerta-metal', indestructible ? FRAME_COMPUERTA : 0);
        scene.add.existing(this);
        scene.physics.add.existing(this, true);
        this.setOrigin(0.5, 1).setDepth(9);
        this.body.updateFromGameObject();

        this.indestructible = indestructible;
        this.vida = PUERTA.vida;
        this.vivo = !indestructible;
        this.reubicando = false;
        this.colisiones = [];

        if (indestructible) {
            // Abierta: oculta dentro del techo y sin colisión
            this.cerradaY = y;
            this.y = y - this.height;
            this.setVisible(false);
            this.body.enable = false;
        }
    }

    // Colliders/overlaps que la usan: se retiran al destruirla
    registrar(...colisiones) {
        this.colisiones.push(...colisiones);
        return this;
    }

    recibirDanio(cantidad) {
        if (!this.vivo) return;
        this.vida = Math.max(0, this.vida - cantidad);
        if (this.vida === 0) {
            this.romper();
            return;
        }
        sonar(this.scene, 'puerta-golpe', { x: this.x });
        // Más abollada cuanto menos vida le queda
        this.setFrame(Math.min(FRAMES_DANIO - 1, Math.floor((1 - this.vida / PUERTA.vida) * FRAMES_DANIO)));
        this.setTint(PUERTA.colorGolpe).setTintMode(Phaser.TintModes.FILL);
        this.scene.time.delayedCall(60, () => this.active && this.clearTint());
        this.scene.cameras.main.shake(60, 0.003);
    }

    // Revienta en pedazos de chatarra que saltan y caen
    romper() {
        this.vivo = false;
        sonar(this.scene, 'puerta-rota', { x: this.x });
        const { x, y } = this.getCenter();
        for (let i = 0; i < PIEZAS_CHATARRA; i++) {
            const pieza = this.scene.add.image(x + Phaser.Math.Between(-4, 4), y + Phaser.Math.Between(-24, 24), 'chatarra', i % 3)
                .setDepth(12);
            this.scene.tweens.add({
                targets: pieza,
                x: pieza.x + Phaser.Math.Between(-60, 60),
                y: this.y + Phaser.Math.Between(-4, 0),
                angle: Phaser.Math.Between(-360, 360),
                duration: Phaser.Math.Between(350, 600),
                ease: 'Quad.easeIn'
            });
            this.scene.tweens.add({ targets: pieza, alpha: 0, delay: 1200, duration: 400, onComplete: () => pieza.destroy() });
        }
        this.scene.cameras.main.shake(200, 0.012);
        this.colisiones.forEach(c => this.scene.physics.world.removeCollider(c));
        this.destroy();
    }

    // Compuerta: cae desde el techo y empieza a bloquear
    cerrar() {
        this.setVisible(true);
        sonar(this.scene, 'compuerta-cerrar');   // el sonido incluye la caída hasta el impacto
        this.scene.tweens.add({
            targets: this,
            y: this.cerradaY,
            duration: 250,
            ease: 'Quad.easeIn',
            onComplete: () => {
                this.body.enable = true;
                this.body.updateFromGameObject();
                this.scene.cameras.main.shake(180, 0.01);
            }
        });
    }
}
