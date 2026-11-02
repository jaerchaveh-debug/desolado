import MenuBase from './MenuBase';
import { COLORES } from '../ui/colores';

const CONTROLES = [
    ['MOVERSE', 'A D / IZQUIERDA DERECHA'],
    ['SALTAR', 'ESPACIO'],
    ['DASH', 'SHIFT'],
    ['APUNTAR', 'W A D / RATON'],
    ['BAJAR DE UNA REJILLA', 'S / ABAJO'],
    ['ATAQUE', 'E / L / CLIC'],
    ['ATAQUE ESPECIAL', 'Q / J / CLIC DERECHO'],
    ['CAMBIAR ARMA', '1 PISTOLA   2 ESPADA'],
    ['PAUSA', 'V']
];

// Pantalla de controles: acción a la izquierda (gris) y teclas a la derecha (cian).
export default class ControlesScene extends MenuBase {

    constructor() {
        super('ControlesScene');
    }

    construir() {
        this.titulo('CONTROLES');

        CONTROLES.forEach(([accion, teclas], i) => {
            const y = 72 + i * 13;
            this.texto(this.cx - 8, y, accion, COLORES.GRIS).setOrigin(1, 0.5);
            this.texto(this.cx + 8, y, teclas, COLORES.CIAN).setOrigin(0, 0.5);
        });

        this.menu({
            y: 196,
            opciones: [{ texto: 'VOLVER', accion: () => this.irA('MenuScene') }],
            alVolver: () => this.irA('MenuScene')
        });
        this.pie('ENTER/E O ESC VOLVER');
    }
}
