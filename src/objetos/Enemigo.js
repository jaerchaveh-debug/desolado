import Phaser from 'phaser';
import { ENEMIGOS } from '../config/combate';
import { sonar } from '../sistema/sonido';

const CAIDA_MAXIMA = 96;   // px que un enemigo de suelo se deja caer (3 tiles); más es un foso
const ALTURA_ATAQUE = 40;  // px de diferencia vertical máxima con el objetivo para atacarle

// Evento de escena que se emite al eliminar un enemigo, con su tipo y el propio enemigo como argumentos
export const EVENTO_ELIMINADO = 'enemigo-eliminado';

// Enemigo genérico definido por un tipo de ENEMIGOS (src/config/combate.js).
//   movimiento 'volar': flota hacia el objetivo ignorando la gravedad y los tiles.
//   movimiento 'suelo': camina hacia el objetivo con gravedad; se detiene ante muros y bordes.
//   ataque (opcional): al tener al objetivo delante, se detiene y ejecuta '<sprite>-atacar';
//     en el frame de golpe, si el objetivo sigue al alcance, le hace daño.
export default class Enemigo extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y, tipo, objetivo) {
        const datos = ENEMIGOS[tipo];
        super(scene, x, y, datos.sprite);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.tipo = tipo;
        this.datos = datos;
        this.vida = datos.vida;
        this.objetivo = objetivo;
        this.vivo = true;
        this.fase = Math.random() * Math.PI * 2;   // desfase del balanceo vertical
        this.atacando = false;
        this.proximoAtaque = 0;
        this.reubicando = false;

        if (datos.ataque) {
            this.on(Phaser.Animations.Events.ANIMATION_UPDATE, (anim, frame) => {
                if (anim.key === `${datos.sprite}-atacar` && Number(frame.textureFrame) === datos.ataque.frameGolpe) {
                    this.golpear();
                }
            });
            this.on(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + `${datos.sprite}-atacar`, () => this.terminarAtaque());
        }

        this.setDepth(10);
        this.play(`${datos.sprite}-${datos.animacion}`);
    }

    // Llamar después de añadirlo a un grupo de físicas: el grupo sobrescribe los valores del cuerpo
    configurarCuerpo() {
        const { ancho, alto, x: ox, y: oy } = this.datos.hitbox;
        this.body.setSize(ancho, alto).setOffset(ox, oy);
        this.body.setAllowGravity(this.datos.movimiento === 'suelo');
        return this;
    }

    // Mira hacia un lado y refleja la hitbox con él (Phaser no invierte el offset del cuerpo con flipX)
    mirar(izquierda) {
        if (izquierda === this.flipX) return;
        this.flipX = izquierda;
        const { ancho, x, y } = this.datos.hitbox;
        this.body.setOffset(izquierda ? this.width - x - ancho : x, y);
    }

    // Desaparece con un fundido, se traslada a (x, y) y reaparece. Mientras tanto no se mueve ni recibe golpes.
    // 'y' es el punto de aparición: para los de suelo, donde apoyan los pies.
    reubicar(x, y) {
        if (!this.vivo || this.reubicando) return;
        this.reubicando = true;
        this.atacando = false;
        this.body.enable = false;
        this.scene.tweens.add({
            targets: this, alpha: 0, duration: 200,
            onComplete: () => {
                if (!this.vivo || !this.active) return;
                const destinoY = this.caminaPorSuelo ? y - this.height / 2 : y;
                this.body.enable = true;
                this.body.reset(x, destinoY);
                this.play(`${this.datos.sprite}-${this.datos.animacion}`);
                this.scene.tweens.add({
                    targets: this, alpha: 1, duration: 400,
                    onComplete: () => { this.reubicando = false; }
                });
            }
        });
    }

    get caminaPorSuelo() {
        return this.datos.movimiento === 'suelo';
    }

    recibirDanio(cantidad) {
        if (!this.vivo) return;
        this.vida -= cantidad;
        if (this.vida <= 0) this.morir();
        else {
            this.efectoSonoro('golpe');
            // Destello al recibir daño sin morir (Phaser 4: setTintFill ya no existe)
            this.setTint(this.datos.colorGolpe).setTintMode(Phaser.TintModes.FILL);
            this.scene.time.delayedCall(80, () => this.clearTint());
        }
    }

    // Objetivo delante (en la dirección en que mira), dentro de 'distancia' px y a una altura parecida
    objetivoAlAlcance(distancia) {
        const dx = (this.objetivo.x - this.x) * (this.flipX ? -1 : 1);
        return dx > -8 && dx < distancia && Math.abs(this.objetivo.y - this.y) < ALTURA_ATAQUE;
    }

    // Sonido de 'datos.sonidos' (golpe, ataque, morir), situado en su posición
    efectoSonoro(momento) {
        const nombre = this.datos.sonidos?.[momento];
        if (nombre) sonar(this.scene, nombre, { x: this.x });
    }

    atacar() {
        this.atacando = true;
        this.efectoSonoro('ataque');
        this.setVelocityX(0);
        this.anims.resume();
        this.play(`${this.datos.sprite}-atacar`);
    }

    golpear() {
        // Margen extra: las cuchillas llegan algo más lejos que la distancia a la que decide atacar
        if (this.vivo && this.objetivoAlAlcance(this.datos.ataque.alcance + 20)) {
            this.scene.danarJugador(this.datos.ataque.danio, this.x);
        }
    }

    terminarAtaque() {
        if (!this.vivo) return;
        this.atacando = false;
        this.proximoAtaque = this.scene.time.now + this.datos.ataque.enfriamiento;
        this.play(`${this.datos.sprite}-${this.datos.animacion}`);
    }

    // Desaparece sin morir (no cuenta como eliminado): p. ej. al cerrarse la sala del jefe
    retirar() {
        if (!this.vivo) return;
        this.vivo = false;
        this.atacando = false;
        this.body.enable = false;
        this.scene.tweens.add({ targets: this, alpha: 0, duration: 300, onComplete: () => this.destroy() });
    }

    morir() {
        this.vivo = false;
        this.atacando = false;
        this.efectoSonoro('morir');
        this.scene.events.emit(EVENTO_ELIMINADO, this.tipo, this);
        this.body.enable = false;
        this.anims.resume();
        this.play(`${this.datos.sprite}-morir`);
        this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => this.destroy());
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        if (!this.vivo) return;
        if (this.reubicando) {
            if (this.body.enable) this.setVelocity(0, 0);
            return;
        }
        if (this.caminaPorSuelo) this.caminar();
        else this.volar(time);
    }

    volar(time) {
        const dx = this.objetivo.x - this.x;
        const dy = this.objetivo.y - this.y;
        const d = Math.hypot(dx, dy) || 1;
        const v = this.datos.velocidad;
        const balanceo = Math.sin(time / 300 + this.fase) * 24;
        this.setVelocity((dx / d) * v, (dy / d) * v + balanceo);
        this.mirar(dx < 0);
    }

    haySueloBajo(x, y) {
        for (let d = 0; d <= CAIDA_MAXIMA; d += 32) {
            if (this.scene.nivel.getTileAtWorldXY(x, y + d)?.collideUp) return true;
        }
        return false;
    }

    caminar() {
        const body = this.body;
        if (this.atacando) {
            this.setVelocityX(0);
            return;
        }

        const dx = this.objetivo.x - this.x;
        const dir = Math.abs(dx) < 8 ? 0 : Math.sign(dx);
        if (dir !== 0) this.mirar(dir < 0);

        const ataque = this.datos.ataque;
        if (ataque && body.blocked.down && this.scene.time.now >= this.proximoAtaque
            && this.objetivoAlAlcance(ataque.alcance)) {
            this.atacar();
            return;
        }

        let avanza = dir !== 0 && body.blocked.down;
        if (avanza) {
            // No avanzar contra un muro ni hacia un foso; sí bajar desniveles de hasta CAIDA_MAXIMA
            const muro = dir < 0 ? body.blocked.left : body.blocked.right;
            const xDelante = dir < 0 ? body.left - 4 : body.right + 4;
            avanza = !muro && this.haySueloBajo(xDelante, body.bottom + 4);
        }

        this.setVelocityX(avanza ? dir * this.datos.velocidad : 0);

        // La animación de caminar solo corre mientras avanza
        if (avanza) this.anims.resume();
        else this.anims.pause();
    }
}
