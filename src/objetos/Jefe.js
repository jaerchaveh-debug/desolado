import Phaser from 'phaser';
import { JEFES } from '../config/combate';
import { sonar } from '../sistema/sonido';

// Evento de escena que se emite al derrotar al jefe
export const EVENTO_JEFE_DERROTADO = 'jefe-derrotado';

const FRAME_QUIETO = 1;
const FRAME_DISPARO = 10;
const FRAME_RAYO = 11;
const FRAME_SALTO = 12;
const MUESTRA_DISPARO = 200;   // ms que se ve la pose de disparo tras cada bola
const ALTURA_SALTABLE = 72;    // px por encima de los pies que deben estar libres para saltar un obstáculo
const PROFUNDIDAD_EFECTOS = 12;

// Jefe definido en JEFES (src/config/combate.js). Máquina de estados:
//   'entrada'  cae del techo; invulnerable hasta aterrizar y rugir
//   'acechar'  mira al jugador. Cerca: zarpazo si está listo. Lejos: camina hacia él (saltando cajas)
//              y dispara bolas; tras disparo.duracion ms lejos, pasa a 'rayos'
//   'zarpazo'  alza las garras y golpea delante (como el cuchillero); cada N zarpazos, 'cargando'
//   'cargando' quieto con el aviso del anillo; al terminar, descarga en área alrededor de él
//   'rayos'    quieto; cada rayo marca la posición del jugador y, tras el aviso, dispara el rayo que daña
//   'muerto'
// Recibe daño como un enemigo (recibirDanio, vivo, reubicando) y la escena lo incluye en sus ataques.
export default class Jefe extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y, tipo, objetivo) {
        const datos = JEFES[tipo];
        super(scene, x, y, datos.sprite, FRAME_SALTO);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        const { ancho, alto, x: ox, y: oy } = datos.hitbox;
        this.body.setSize(ancho, alto).setOffset(ox, oy);
        this.setDepth(10);

        this.datos = datos;
        this.objetivo = objetivo;
        this.vida = datos.vida;
        this.vivo = true;
        this.reubicando = false;
        this.estado = 'entrada';
        this.zarpazos = 0;
        this.proximoZarpazo = 0;
        this.tiempoLejos = 0;
        this.proximaBola = 0;
        this.disparoHasta = 0;
        this.efectos = [];      // anillos y rayos activos (se destruyen al morir)

        this.on(Phaser.Animations.Events.ANIMATION_UPDATE, (anim, frame) => {
            if (anim.key === this.anim('zarpazo') && Number(frame.textureFrame) === datos.zarpazo.frameGolpe) this.golpearZarpazo();
        });
        this.on(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + this.anim('zarpazo'), () => this.terminarZarpazo());
    }

    anim(nombre) {
        return `${this.datos.sprite}-${nombre}`;
    }

    get ahora() {
        return this.scene.time.now;
    }

    // Distancias al jugador (dx con signo, desde el centro del jefe)
    get dx() { return this.objetivo.x - this.x; }
    get dy() { return this.objetivo.y - this.y; }

    get jugadorCerca() {
        const { cerca } = this.datos;
        return Math.abs(this.dx) < cerca.x && Math.abs(this.objetivo.body.bottom - this.body.bottom) < cerca.y;
    }

    mirarAlJugador() {
        if (Math.abs(this.dx) > 2) this.flipX = this.dx < 0;
    }

    // Punto relativo (mirando a la derecha) en coordenadas del mundo
    punto({ x, y }) {
        return { x: this.x + (this.flipX ? -x : x), y: this.y + y };
    }

    recibirDanio(cantidad) {
        if (!this.vivo || this.estado === 'entrada') return;
        this.vida = Math.max(0, this.vida - cantidad);
        this.scene.actualizarHudJefe?.();
        if (this.vida === 0) {
            this.morir();
            return;
        }
        this.efectoSonoro('golpe');
        this.setTint(this.datos.colorGolpe).setTintMode(Phaser.TintModes.FILL);
        this.scene.time.delayedCall(60, () => this.active && this.clearTint());
    }

    morir() {
        this.vivo = false;
        this.estado = 'muerto';
        this.efectoSonoro('morir');
        this.clearTint();
        this.setVelocityX(0);
        this.limpiarEfectos();
        this.play(this.anim('morir'));
        this.scene.cameras.main.shake(400, 0.012);
        this.scene.events.emit(EVENTO_JEFE_DERROTADO);
    }

    // Sonido de 'datos.sonidos' para un momento de su máquina de estados, situado en su posición
    efectoSonoro(momento) {
        const nombre = this.datos.sonidos?.[momento];
        if (nombre) sonar(this.scene, nombre, { x: this.x, variacion: 0.02 });
    }

    limpiarEfectos() {
        this.efectos.forEach(e => {
            this.scene.tweens.killTweensOf(e);
            e.destroy();
        });
        this.efectos = [];
    }

    efecto(objeto) {
        this.efectos.push(objeto);
        objeto.once(Phaser.GameObjects.Events.DESTROY, () => Phaser.Utils.Array.Remove(this.efectos, objeto));
        return objeto;
    }

    // Ejecuta fn tras ms si el jefe sigue vivo (las secuencias se cortan al morir)
    despues(ms, fn) {
        this.scene.time.delayedCall(ms, () => this.vivo && fn());
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        if (!this.vivo) return;
        const enSuelo = this.body.blocked.down;

        if (this.estado === 'entrada') {
            if (enSuelo) this.aterrizar();
            return;
        }
        if (this.estado === 'acechar') this.acechar(delta, enSuelo);
        else if (enSuelo) this.setVelocityX(0);
    }

    aterrizar() {
        this.estado = 'rugido';
        this.setFrame(FRAME_QUIETO);
        this.efectoSonoro('aterrizar');
        this.scene.cameras.main.shake(300, 0.015);
        // Ojos encendidos y rugido un instante antes de empezar
        this.despues(400, () => {
            this.setFrame(FRAME_RAYO);
            this.efectoSonoro('rugido');
        });
        this.despues(1100, () => this.volverAAcechar());
    }

    volverAAcechar() {
        this.estado = 'acechar';
        this.play(this.anim('caminar'));
    }

    acechar(delta, enSuelo) {
        this.mirarAlJugador();
        const dir = Math.sign(this.dx);
        if (!enSuelo) {
            // En el aire sigue avanzando (el choque con la caja le quitó la velocidad) y puede disparar
            this.setVelocityX(dir * this.datos.velocidad);
            this.setFrame(FRAME_SALTO);
            this.tiempoLejos += delta;
            if (this.ahora >= this.proximaBola) this.dispararBola();
            return;
        }

        if (this.jugadorCerca) {
            this.tiempoLejos = 0;
            this.setVelocityX(0);
            this.anims.pause();
            if (this.ahora >= this.proximoZarpazo) this.empezarZarpazo();
            return;
        }

        // Lejos: avanza hacia el jugador disparando; tras un rato, rayos
        this.tiempoLejos += delta;
        if (this.tiempoLejos >= this.datos.disparo.duracion) {
            this.tiempoLejos = 0;
            this.empezarRayos();
            return;
        }
        this.setVelocityX(dir * this.datos.velocidad);
        if (this.anims.currentAnim?.key !== this.anim('caminar')) this.play(this.anim('caminar'));
        else if (this.anims.isPaused && this.ahora >= this.disparoHasta) this.anims.resume();
        if ((dir < 0 ? this.body.blocked.left : this.body.blocked.right) && this.puedeSaltar(dir)) {
            this.setVelocityY(this.datos.salto);
            this.setFrame(FRAME_SALTO);
        }
        if (this.ahora >= this.proximaBola) this.dispararBola();
    }

    // Hay un obstáculo delante (una caja) pero libre a la altura del salto (no es un muro)
    puedeSaltar(dir) {
        const x = dir < 0 ? this.body.left - 4 : this.body.right + 4;
        const tile = this.scene.nivel.getTileAtWorldXY(x, this.body.bottom - ALTURA_SALTABLE);
        return !tile?.collides;
    }

    dispararBola() {
        const { disparo, garra } = this.datos;
        this.proximaBola = this.ahora + disparo.cadencia;
        const origen = this.punto(garra);
        const objetivo = this.objetivo.body.center;
        const d = Math.hypot(objetivo.x - origen.x, objetivo.y - origen.y) || 1;
        this.efectoSonoro('disparo');
        this.scene.dispararBolaJefe(origen.x, origen.y, { x: (objetivo.x - origen.x) / d, y: (objetivo.y - origen.y) / d }, disparo);
        // Pose de disparo un instante; acechar() reanuda el paso al terminar
        this.anims.pause();
        this.setFrame(FRAME_DISPARO);
        this.disparoHasta = this.ahora + MUESTRA_DISPARO;
    }

    // ---- Zarpazo

    empezarZarpazo() {
        this.estado = 'zarpazo';
        this.zarpazoGolpeado = false;   // el frame de golpe sale dos veces en la animación: un solo impacto
        this.setVelocityX(0);
        this.anims.resume();
        this.play(this.anim('zarpazo'));
    }

    golpearZarpazo() {
        if (!this.vivo || this.zarpazoGolpeado) return;
        this.zarpazoGolpeado = true;
        this.efectoSonoro('zarpazo');
        const delante = this.dx * (this.flipX ? -1 : 1);
        const { alcance, danio } = this.datos.zarpazo;
        if (delante > -8 && delante < alcance + 10 && Math.abs(this.objetivo.body.bottom - this.body.bottom) < this.datos.cerca.y) {
            this.scene.danarJugador(danio, this.x);
        }
        this.scene.cameras.main.shake(80, 0.006);
    }

    terminarZarpazo() {
        if (!this.vivo) return;
        this.proximoZarpazo = this.ahora + this.datos.zarpazo.enfriamiento;
        this.zarpazos++;
        if (this.zarpazos >= this.datos.cargado.cadaZarpazos) {
            this.zarpazos = 0;
            this.empezarCargado();
        } else {
            this.volverAAcechar();
        }
    }

    // ---- Ataque cargado en área

    empezarCargado() {
        const { carga, radio, danio } = this.datos.cargado;
        this.estado = 'cargando';
        this.play(this.anim('cargar'));
        this.efectoSonoro('carga');
        const aviso = this.efecto(this.scene.add.image(this.x, this.body.center.y, 'onda-jefe', 0).setDepth(PROFUNDIDAD_EFECTOS));
        // El aviso parpadea cada vez más rápido
        this.scene.tweens.add({ targets: aviso, alpha: 0.2, duration: 160, yoyo: true, repeat: -1 });
        this.despues(carga, () => {
            aviso.destroy();
            this.play(this.anim('descarga'));
            this.efectoSonoro('descarga');
            const onda = this.efecto(this.scene.add.sprite(this.x, this.body.center.y, 'onda-jefe', 1).setDepth(PROFUNDIDAD_EFECTOS));
            onda.play('onda-jefe-descargar');
            onda.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => onda.destroy());
            this.scene.cameras.main.shake(200, 0.014);
            const c = this.objetivo.body.center;
            if (Phaser.Math.Distance.Between(c.x, c.y, this.x, this.body.center.y) <= radio) {
                this.scene.danarJugador(danio, this.x);
            }
            this.despues(500, () => this.volverAAcechar());
        });
    }

    // ---- Rayos de los ojos

    empezarRayos() {
        this.estado = 'rayos';
        this.setVelocityX(0);
        this.anims.stop();
        this.setFrame(FRAME_RAYO);
        this.rayo(0);
    }

    rayo(n) {
        const { cantidad, aviso, duracion, pausa, danio, ancho, alcance } = this.datos.rayo;
        if (n >= cantidad) {
            this.despues(pausa, () => this.volverAAcechar());
            return;
        }
        this.mirarAlJugador();
        const origen = this.punto(this.datos.ojos);
        const destino = this.objetivo.body.center;
        const d = Math.hypot(destino.x - origen.x, destino.y - origen.y) || 1;
        const dir = { x: (destino.x - origen.x) / d, y: (destino.y - origen.y) / d };
        const largo = Math.max(8, this.scene.alcanceLibre(origen.x, origen.y, dir, alcance));

        // Fase 1: marca fina hacia donde está el jugador ahora
        this.efectoSonoro('rayoAviso');
        const haz = this.efecto(this.scene.add.tileSprite(origen.x, origen.y, largo, 8, 'rayo-jefe', 0)
            .setOrigin(0, 0.5).setRotation(Math.atan2(dir.y, dir.x)).setDepth(PROFUNDIDAD_EFECTOS));
        this.scene.tweens.add({ targets: haz, alpha: 0.4, duration: 90, yoyo: true, repeat: -1 });

        // Fase 2: el rayo que hace daño sobre esa misma línea
        this.despues(aviso, () => {
            this.scene.tweens.killTweensOf(haz);
            haz.setAlpha(1).setFrame(1);
            this.efectoSonoro('rayo');
            this.scene.cameras.main.shake(90, 0.006);
            if (this.distanciaALinea(this.objetivo.body.center, origen, dir, largo) < ancho / 2 + 5) {
                this.scene.danarJugador(danio, this.x);
            }
            this.despues(duracion, () => {
                haz.setFrame(2);
                this.despues(100, () => haz.destroy());
                this.despues(pausa, () => this.rayo(n + 1));
            });
        });
    }

    // Distancia de un punto al segmento que sale de 'origen' en 'dir' con 'largo' px
    distanciaALinea(p, origen, dir, largo) {
        const rx = p.x - origen.x, ry = p.y - origen.y;
        const t = Phaser.Math.Clamp(rx * dir.x + ry * dir.y, 0, largo);
        return Math.hypot(rx - dir.x * t, ry - dir.y * t);
    }
}
