import MenuBase from './MenuBase';
import { COLORES } from '../ui/colores';
import { capituloParaContinuar } from '../sistema/progreso';

export const TITULO_JUEGO = 'DESOLADO';

// Menú de inicio: Continuar, Equipamiento, Capítulos y Controles.
export default class MenuScene extends MenuBase {

    constructor() {
        super('MenuScene');
    }

    construir() {
        const titulo = this.texto(this.cx, 72, TITULO_JUEGO, COLORES.BLANCO, 3);
        this.add.rectangle(this.cx, 96, 180, 1, COLORES.CIAN_OSCURO);
        this.texto(this.cx, 106, 'NO SABEMOS DONDE ESTAMOS', COLORES.GRIS);

        const continuar = capituloParaContinuar();
        this.menu({
            y: 144,
            opciones: [
                { texto: 'CONTINUAR', accion: () => this.jugar(continuar) },
                { texto: 'EQUIPAMIENTO', accion: () => this.irA('EquipamientoScene') },
                { texto: 'CAPITULOS', accion: () => this.irA('CapitulosScene') },
                { texto: 'CONTROLES', accion: () => this.irA('ControlesScene') }
            ]
        });
        this.texto(this.cx, 214, `CAPITULO ${continuar.numero} - ${continuar.titulo}`, COLORES.GRIS_OSCURO);
        this.pie('W/S ELEGIR   ENTER/E ACEPTAR');

        // Interferencia ocasional en el título
        this.time.addEvent({
            delay: 2600,
            loop: true,
            callback: () => this.tweens.add({ targets: titulo, alpha: 0.4, duration: 40, yoyo: true, repeat: 1 })
        });
    }
}
