import Phaser from 'phaser';
import { COLORES } from './colores';

// Lista vertical de opciones con la fuente pixel art, centrada en x.
//   ↑/↓ o W/S: moverse · ENTER/E/ESPACIO: aceptar · ESC: volver (si hay alVolver) · ratón: pasar y clic
// opciones: [{ texto, accion, habilitada = true }]. Las deshabilitadas se ven apagadas y se saltan.
export default class MenuOpciones {

    constructor(scene, { x, y, separacion = 16, opciones, espera = 0, alVolver = null }) {
        this.scene = scene;
        this.opciones = opciones.map(o => ({ habilitada: true, ...o }));
        this.indice = this.opciones.findIndex(o => o.habilitada);
        this.bloqueado = true;

        this.textos = this.opciones.map((o, i) => {
            const t = scene.add.bitmapText(x, y + i * separacion, 'fuente', o.texto).setOrigin(0.5);
            if (o.habilitada) {
                t.setInteractive({ useHandCursor: true })
                    .on('pointerover', () => this.seleccionar(i))
                    .on('pointerdown', () => { this.seleccionar(i); this.aceptar(); });
            }
            return t;
        });

        this.cursor = scene.add.bitmapText(0, 0, 'fuente', '>').setOrigin(0.5).setTint(COLORES.CIAN);
        // Parpadeo: la mayor parte del tiempo visible (hold en alpha 1), apagado brevemente
        scene.tweens.add({ targets: this.cursor, alpha: { from: 0, to: 1 }, duration: 150, yoyo: true, repeat: -1, hold: 600 });
        this.refrescar();

        // Espera antes de aceptar teclas, para que una tecla mantenida no confirme al instante
        scene.time.delayedCall(espera, () => {
            this.bloqueado = false;
            const teclado = scene.input.keyboard;
            ['UP', 'W'].forEach(k => teclado.on(`keydown-${k}`, () => this.mover(-1)));
            ['DOWN', 'S'].forEach(k => teclado.on(`keydown-${k}`, () => this.mover(1)));
            ['ENTER', 'E', 'SPACE'].forEach(k => teclado.on(`keydown-${k}`, () => this.aceptar()));
            if (alVolver) teclado.on('keydown-ESC', () => { if (!this.bloqueado) alVolver(); });
        });
    }

    // Objetos visibles, para animar su aparición desde la escena
    get objetos() {
        return [...this.textos, this.cursor];
    }

    mover(paso) {
        if (this.bloqueado) return;
        const n = this.opciones.length;
        for (let i = 1; i <= n; i++) {
            const j = Phaser.Math.Wrap(this.indice + paso * i, 0, n);
            if (this.opciones[j].habilitada) {
                this.seleccionar(j);
                return;
            }
        }
    }

    seleccionar(i) {
        this.indice = i;
        this.refrescar();
    }

    refrescar() {
        this.textos.forEach((t, i) => {
            const o = this.opciones[i];
            t.setTint(!o.habilitada ? COLORES.APAGADO : i === this.indice ? COLORES.CIAN : COLORES.GRIS);
        });
        const t = this.textos[this.indice];
        if (t) this.cursor.setPosition(Math.round(t.x - t.width / 2 - 8), t.y);
    }

    aceptar() {
        const o = this.opciones[this.indice];
        if (this.bloqueado || !o?.habilitada) return;
        this.bloqueado = true;   // una sola confirmación; la escena decide qué pasa después
        o.accion();
    }

    // Vuelve a aceptar entradas (p. ej. si la acción no cambió de escena)
    desbloquear() {
        this.bloqueado = false;
    }
}
