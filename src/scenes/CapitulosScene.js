import MenuBase from './MenuBase';
import CAPITULOS from '../capitulos';
import { estaDesbloqueado } from '../sistema/progreso';

// Selector de capítulos. Los no publicados salen como "PROXIMAMENTE" y los no desbloqueados como "BLOQUEADO".
export default class CapitulosScene extends MenuBase {

    constructor() {
        super('CapitulosScene');
    }

    construir() {
        this.titulo('CAPITULOS');

        const opciones = CAPITULOS.map(c => {
            const jugable = c.disponible && estaDesbloqueado(c.id);
            const estado = !c.disponible ? 'PROXIMAMENTE' : !jugable ? 'BLOQUEADO' : c.titulo;
            return {
                texto: `CAPITULO ${String(c.numero).padStart(2, '0')}  ${estado}`,
                habilitada: jugable,
                accion: () => this.jugar(c)
            };
        });
        opciones.push({ texto: 'VOLVER', accion: () => this.irA('MenuScene') });

        this.menu({ y: 192, opciones, alVolver: () => this.irA('MenuScene') });
        this.pie('W/S ELEGIR   ENTER/E JUGAR   ESC VOLVER');
    }
}
