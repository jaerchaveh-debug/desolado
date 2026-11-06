import MenuBase from './MenuBase';
import { COLORES } from '../ui/colores';
import { ARMAS, ESPACIOS_ARMAS } from '../config/combate';
import { armasObtenidas, equipamiento, guardarEquipamiento } from '../sistema/progreso';
import { sonar } from '../sistema/sonido';

// Pantalla de equipamiento (desde el menú de inicio).
// Izquierda: los 3 espacios de armas (teclas 1, 2, 3 en la partida) y, debajo, la figura
// del errante. Derecha: el inventario con las armas obtenidas y la descripción de la
// que está bajo el cursor.
//   - Clic en un arma del inventario: va al espacio vacío más a la izquierda; si no hay
//     ninguno, no pasa nada. Un arma equipada sigue en el inventario, apagada y con el
//     número de su espacio, y no se puede equipar dos veces.
//   - Clic en un espacio ocupado: lo vacía.
//   - Sin ningún arma equipada no se puede salir (aviso en rojo).
// Teclado: flechas/WASD para moverse entre casillas (por posición en pantalla),
// ENTER/E/ESPACIO para equipar o quitar, ESC para volver. Cada cambio se guarda al momento.

const CASILLA = 72;                 // espacios de armas (icono de 64 + 4 px de margen)
const ESPACIOS = { cx: 192, y: 136, separacion: 88 };
const FIGURA = { x: 192, y: 192 };   // figura-jugador (160x256), centro superior
const PANEL = { x: 392, y: 88, ancho: 544, alto: 376 };
const CELDA = 80;                   // celdas del inventario
const REJILLA = { columnas: 5, filas: 2, x: 432, y: 132, separacion: 96 };
const ESPERA = 150;                 // ms sin aceptar teclas al entrar

export default class EquipamientoScene extends MenuBase {

    constructor() {
        super('EquipamientoScene');
    }

    construir() {
        this.espacios = equipamiento();
        this.obtenidas = armasObtenidas();
        this.titulo('EQUIPAMIENTO', 40);

        // Casillas navegables: { x, y, ancho, alto, tipo: 'espacio' | 'arma' | 'volver', indice | id }
        this.casillas = [];

        // Espacios de armas
        this.vistaEspacios = Array.from({ length: ESPACIOS_ARMAS }, (_, i) => {
            const x = ESPACIOS.cx + (i - 1) * ESPACIOS.separacion;
            this.texto(x, ESPACIOS.y - CASILLA / 2 - 14, String(i + 1), COLORES.GRIS);
            const marco = this.add.rectangle(x, ESPACIOS.y, CASILLA, CASILLA, COLORES.NEGRO, 0.85)
                .setStrokeStyle(2, COLORES.GRIS_OSCURO);
            const icono = this.add.image(x, ESPACIOS.y, '__MISSING').setVisible(false);
            this.agregarCasilla(marco, { tipo: 'espacio', indice: i });
            return { marco, icono };
        });

        this.add.sprite(FIGURA.x, FIGURA.y, 'figura-jugador').setOrigin(0.5, 0).play('figura-jugador-quieto');

        // Inventario
        this.add.rectangle(PANEL.x, PANEL.y, PANEL.ancho, PANEL.alto, COLORES.NEGRO, 0.85).setOrigin(0)
            .setStrokeStyle(2, COLORES.CIAN_OSCURO);
        this.add.bitmapText(PANEL.x + 20, PANEL.y + 16, 'fuente', 'INVENTARIO').setTint(COLORES.CIAN);
        this.vistaArmas = {};
        for (let i = 0; i < REJILLA.columnas * REJILLA.filas; i++) {
            const x = REJILLA.x + CELDA / 2 + (i % REJILLA.columnas) * REJILLA.separacion;
            const y = REJILLA.y + CELDA / 2 + Math.floor(i / REJILLA.columnas) * REJILLA.separacion;
            const id = this.obtenidas[i];
            const marco = this.add.rectangle(x, y, CELDA, CELDA, COLORES.GRIS_PROFUNDO, id ? 0.6 : 0.25)
                .setStrokeStyle(2, id ? COLORES.GRIS_OSCURO : COLORES.APAGADO);
            if (!id) continue;
            const icono = this.add.image(x, y, ARMAS[id].icono);
            // Número del espacio donde está equipada
            const numero = this.add.bitmapText(x + CELDA / 2 - 14, y + CELDA / 2 - 18, 'fuente', '').setTint(COLORES.CIAN);
            this.agregarCasilla(marco, { tipo: 'arma', id });
            this.vistaArmas[id] = { marco, icono, numero };
        }

        // Descripción de la casilla bajo el cursor
        const yInfo = REJILLA.y + REJILLA.filas * REJILLA.separacion + 8;
        this.add.rectangle(PANEL.x + 20, yInfo, PANEL.ancho - 40, 2, COLORES.CIAN_OSCURO).setOrigin(0);
        this.infoNombre = this.add.bitmapText(PANEL.x + 20, yInfo + 20, 'fuente', '').setTint(COLORES.BLANCO);
        this.infoLineas = [0, 1].map(i => this.add.bitmapText(PANEL.x + 20, yInfo + 52 + i * 24, 'fuente', ''));
        this.indice = 0;

        // Volver y avisos
        const volver = this.texto(FIGURA.x, 480, 'VOLVER', COLORES.GRIS);
        this.agregarCasilla(volver, { tipo: 'volver' });
        this.aviso = this.texto(PANEL.x + PANEL.ancho / 2, 480, 'EQUIPA AL MENOS UN ARMA', COLORES.ROJO).setVisible(false);
        this.pie('CLIC / ENTER EQUIPAR O QUITAR   FLECHAS MOVERSE   ESC VOLVER');

        // Cursor de teclado: marco cian que rodea la casilla activa
        this.foco = this.add.rectangle(0, 0, 0, 0).setStrokeStyle(2, COLORES.CIAN).setFillStyle();
        this.tweens.add({ targets: this.foco, alpha: 0.4, duration: 300, yoyo: true, repeat: -1 });
        this.enfocar(this.casillas.findIndex(c => c.tipo === 'arma'));

        this.time.delayedCall(ESPERA, () => {
            const teclado = this.input.keyboard;
            const mover = (dx, dy) => () => this.mover(dx, dy);
            ['UP', 'W'].forEach(k => teclado.on(`keydown-${k}`, mover(0, -1)));
            ['DOWN', 'S'].forEach(k => teclado.on(`keydown-${k}`, mover(0, 1)));
            ['LEFT', 'A'].forEach(k => teclado.on(`keydown-${k}`, mover(-1, 0)));
            ['RIGHT', 'D'].forEach(k => teclado.on(`keydown-${k}`, mover(1, 0)));
            ['ENTER', 'E', 'SPACE'].forEach(k => teclado.on(`keydown-${k}`, () => this.activar(this.casillas[this.indice])));
            teclado.on('keydown-ESC', () => this.salir());
        });

        this.refrescar();
    }

    // Registra una casilla navegable y la hace interactiva para el ratón
    agregarCasilla(objeto, datos) {
        const i = this.casillas.length;
        this.casillas.push({ ...datos, objeto });
        objeto.setInteractive({ useHandCursor: true })
            .on('pointerover', () => this.enfocar(i))
            .on('pointerdown', puntero => {
                if (!puntero.leftButtonDown()) return;
                this.enfocar(i);
                this.activar(this.casillas[i]);
            });
    }

    enfocar(i) {
        if (i < 0) i = 0;
        this.indice = i;
        const { objeto } = this.casillas[i];
        const b = objeto.getBounds();
        this.foco.setPosition(Math.round(b.centerX), Math.round(b.centerY)).setSize(b.width + 8, b.height + 8);
        this.foco.setOrigin(0.5);
        this.refrescarInfo();
    }

    // Navegación por posición: la casilla más cercana en la dirección pulsada
    mover(dx, dy) {
        const actual = this.casillas[this.indice].objeto.getBounds();
        let mejor = -1, mejorPeso = Infinity;
        this.casillas.forEach((c, i) => {
            if (i === this.indice) return;
            const b = c.objeto.getBounds();
            const vx = b.centerX - actual.centerX, vy = b.centerY - actual.centerY;
            const avance = vx * dx + vy * dy;
            if (avance <= 0) return;
            // Penaliza el desvío lateral para preferir lo que está en línea
            const peso = avance + 2 * Math.abs(vx * dy + vy * dx);
            if (peso < mejorPeso) { mejorPeso = peso; mejor = i; }
        });
        if (mejor >= 0) this.enfocar(mejor);
    }

    activar(casilla) {
        if (!casilla) return;
        if (casilla.tipo === 'volver') {
            this.salir();
        } else if (casilla.tipo === 'espacio') {
            if (!this.espacios[casilla.indice]) return;
            this.espacios[casilla.indice] = null;
            this.cambiado();
        } else if (casilla.tipo === 'arma') {
            const libre = this.espacios.indexOf(null);
            if (this.espacios.includes(casilla.id) || libre < 0) return;   // ya equipada o sin espacio: nada
            this.espacios[libre] = casilla.id;
            this.aviso.setVisible(false);
            this.cambiado();
        }
    }

    cambiado() {
        guardarEquipamiento(this.espacios);
        sonar(this, 'cambiar-arma');
        this.refrescar();
    }

    salir() {
        if (!this.espacios.some(Boolean)) {
            // Sin armas no se sale: el aviso parpadea
            this.aviso.setVisible(true).setAlpha(1);
            this.tweens.killTweensOf(this.aviso);
            this.tweens.add({ targets: this.aviso, alpha: 0.3, duration: 120, yoyo: true, repeat: 2 });
            return;
        }
        this.irA('MenuScene');
    }

    refrescar() {
        this.vistaEspacios.forEach(({ marco, icono }, i) => {
            const id = this.espacios[i];
            icono.setVisible(Boolean(id));
            if (id) icono.setTexture(ARMAS[id].icono);
            marco.setStrokeStyle(2, id ? COLORES.CIAN_OSCURO : COLORES.GRIS_OSCURO);
        });
        for (const [id, { icono, numero }] of Object.entries(this.vistaArmas)) {
            const espacio = this.espacios.indexOf(id);
            icono.setAlpha(espacio >= 0 ? 0.3 : 1);
            numero.setText(espacio >= 0 ? String(espacio + 1) : '');
        }
        this.refrescarInfo();
    }

    // Nombre y ataques del arma de la casilla activa (o qué hace la casilla)
    refrescarInfo() {
        const c = this.casillas[this.indice];
        if (!c || !this.infoNombre) return;
        const id = c.tipo === 'arma' ? c.id : c.tipo === 'espacio' ? this.espacios[c.indice] : null;
        let nombre = '', lineas = ['', ''];
        if (id) {
            const arma = ARMAS[id];
            const espacio = this.espacios.indexOf(id);
            nombre = espacio >= 0 ? `${arma.nombre}  -  ESPACIO ${espacio + 1}` : arma.nombre;
            lineas = [`E  ${arma.descripcion.ataque}`, `Q  ${arma.descripcion.especial}`];
        } else if (c.tipo === 'espacio') {
            nombre = `ESPACIO ${c.indice + 1} VACÍO`;
            lineas = ['ELIGE UN ARMA DEL INVENTARIO', ''];
        }
        this.infoNombre.setText(nombre);
        this.infoLineas.forEach((t, i) => t.setText(lineas[i]).setTint(id ? COLORES.CIAN : COLORES.GRIS));
    }
}
