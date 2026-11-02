import PantallaSuperpuesta, { COLORES } from './PantallaSuperpuesta';
import CAPITULOS, { buscarCapitulo } from '../capitulos';

// Capítulo completado. Se lanza encima de GameScene (en pausa) al cumplirse la victoria del capítulo;
// el progreso ya está guardado (completarCapitulo). Solo permite volver al menú.
export default class CapituloCompletadoScene extends PantallaSuperpuesta {

    constructor() {
        super('CapituloCompletadoScene');
        this.duracionVelo = 1200;
        this.retardoContenido = 900;
        this.espera = 1500;
    }

    construir() {
        const capitulo = buscarCapitulo(this.datosJuego.capitulo);
        const siguiente = CAPITULOS[CAPITULOS.indexOf(capitulo) + 1];
        this.texto(100, `CAPITULO ${capitulo.numero}`, COLORES.GRIS);
        this.texto(118, 'COMPLETADO', COLORES.CIAN, 2);
        this.texto(140, capitulo.titulo, COLORES.GRIS_OSCURO);
        if (siguiente) {
            const texto = siguiente.disponible ? `CAPITULO ${siguiente.numero} DESBLOQUEADO` : `CAPITULO ${siguiente.numero}: PROXIMAMENTE`;
            this.texto(156, texto, COLORES.GRIS_OSCURO);
        }
        this.menu(174, [{ texto: 'MENU PRINCIPAL', accion: () => this.irAlMenu() }]);
        this.texto(204, 'ENTER/E ACEPTAR', COLORES.GRIS_OSCURO);
    }
}
