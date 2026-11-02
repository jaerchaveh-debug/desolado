import Phaser from 'phaser';

const FRAME_BALA = 0;
const FRAME_IMPACTO = 2;

// Proyectil reutilizable (se gestiona desde un grupo de físicas con pool).
// Viaja en cualquier dirección: el sprite (dibujado hacia la derecha) se rota hacia la dirección del disparo.
// Por defecto es la bala de la pistola; un ataque puede indicar otro sprite (p. ej. la onda de la espada).
export default class Proyectil extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y) {
        super(scene, x, y, 'proyectil', FRAME_BALA);
    }

    // direccion: vector unitario { x, y } · ataque: datos del ataque (ver ARMAS en config/combate.js)
    disparar(x, y, direccion, ataque) {
        this.danio = ataque.danio;
        this.origen = { x, y };
        this.alcance = ataque.alcance;
        // Si atraviesa, daña a cada enemigo una sola vez y sigue su camino
        this.atraviesa = !!ataque.atraviesa;
        this.golpeados = new Set();

        this.setTexture(ataque.sprite ?? 'proyectil', FRAME_BALA);
        if (ataque.animacion) this.play(ataque.animacion);
        else this.anims.stop();

        this.enableBody(true, x, y, true, true);
        this.body.setAllowGravity(false);
        // La caja de colisión no rota: se ajusta a la dirección (horizontal, vertical o diagonal)
        let ancho, alto;
        if (ataque.cuerpo) {
            const vertical = direccion.x === 0;
            ancho = vertical ? ataque.cuerpo.alto : ataque.cuerpo.ancho;
            alto = vertical ? ataque.cuerpo.ancho : ataque.cuerpo.alto;
        } else {
            ancho = direccion.y === 0 ? 6 : direccion.x === 0 ? 2 : 4;
            alto = direccion.y === 0 ? 2 : direccion.x === 0 ? 6 : 4;
        }
        this.body.setSize(ancho, alto).setOffset((this.width - ancho) / 2, (this.height - alto) / 2);
        this.setDepth(10);
        this.setRotation(Math.atan2(direccion.y, direccion.x));
        this.setVelocity(ataque.velocidad * direccion.x, ataque.velocidad * direccion.y);
    }

    // Aplica el impacto contra un enemigo. Devuelve false si ya lo había golpeado.
    golpear(enemigo) {
        if (this.golpeados.has(enemigo)) return false;
        this.golpeados.add(enemigo);
        enemigo.recibirDanio(this.danio);
        if (!this.atraviesa) this.impactar();
        return true;
    }

    // Muestra el impacto y devuelve el proyectil al pool
    impactar() {
        if (!this.active) return;
        const fx = this.scene.add.image(this.x, this.y, 'proyectil', FRAME_IMPACTO).setDepth(11);
        this.scene.time.delayedCall(80, () => fx.destroy());
        this.desactivar();
    }

    desactivar() {
        this.anims.stop();
        this.disableBody(true, true);
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        if (this.active && Phaser.Math.Distance.Between(this.x, this.y, this.origen.x, this.origen.y) > this.alcance) {
            this.desactivar();
        }
    }
}
