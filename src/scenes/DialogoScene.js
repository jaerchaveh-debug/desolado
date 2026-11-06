import Phaser from 'phaser';
import { COLORES } from '../ui/colores';
import { PERSONAJES } from '../config/personajes';

// Caja de diálogo abajo de la pantalla, con el retrato de quien habla, su nombre y el
// texto letra a letra. Se lanza encima de GameScene en pausa con GameScene.dialogo():
//   { lineas: [{ quien, expresion, texto, sobresalto }], alTerminar }
// `quien` es una clave de PERSONAJES y `expresion` una de sus expresiones. Con
// `sobresalto` el retrato da un respingo al aparecer.
// E / ENTER / ESPACIO / clic: completa el texto y, si ya está entero, pasa a la
// siguiente línea; tras la última, cierra, reanuda GameScene y llama a alTerminar.

const CAJA = { x: 16, y: 388, ancho: 928, alto: 136 };
const RETRATO = { x: 28, y: 392 };          // 128x128, esquina superior izquierda
const TEXTO_X = 176;
const ANCHO_LETRA = 12;                     // celda de la fuente
const MAX_LETRAS = Math.floor((CAJA.x + CAJA.ancho - 20 - TEXTO_X) / ANCHO_LETRA);
const ESPERA = 350;                         // ms sin aceptar teclas, por si venían pulsadas del juego

// ms que se espera tras escribir cada carácter: los puntos y exclamaciones pesan más
const PAUSA_LETRA = { '.': 140, '!': 110, '?': 110, ',': 90 };
const PAUSA_NORMAL = 30;

// Corta el texto en líneas que caben en la caja sin partir palabras
function ajustar(texto) {
    const lineas = [];
    let actual = '';
    for (const palabra of texto.split(' ')) {
        const prueba = actual ? `${actual} ${palabra}` : palabra;
        if (prueba.length > MAX_LETRAS && actual) {
            lineas.push(actual);
            actual = palabra;
        } else {
            actual = prueba;
        }
    }
    lineas.push(actual);
    return lineas.join('\n');
}

export default class DialogoScene extends Phaser.Scene {

    constructor() {
        super('DialogoScene');
    }

    init(datos) {
        this.lineas = datos.lineas;
        this.alTerminar = datos.alTerminar;
    }

    create() {
        this.indice = -1;
        this.cerrando = false;
        this.escribiendo = null;

        const fondo = this.add.rectangle(CAJA.x, CAJA.y, CAJA.ancho, CAJA.alto, COLORES.NEGRO).setOrigin(0).setAlpha(0.92);
        const bordes = [
            this.add.rectangle(CAJA.x, CAJA.y, CAJA.ancho, 2, COLORES.CIAN_OSCURO).setOrigin(0),
            this.add.rectangle(CAJA.x, CAJA.y + CAJA.alto - 2, CAJA.ancho, 2, COLORES.CIAN_OSCURO).setOrigin(0)
        ];
        this.marcoRetrato = this.add.rectangle(RETRATO.x - 2, RETRATO.y - 2, 132, 132, COLORES.GRIS_PROFUNDO).setOrigin(0);
        this.retrato = this.add.image(RETRATO.x, RETRATO.y, '__MISSING').setOrigin(0);
        this.nombre = this.add.bitmapText(TEXTO_X, CAJA.y + 16, 'fuente', '').setTint(COLORES.CIAN);
        this.texto = this.add.bitmapText(TEXTO_X, CAJA.y + 44, 'fuente', '').setTint(COLORES.BLANCO);
        this.texto.setLineSpacing(6);
        // Aviso de que se puede seguir: parpadea cuando el texto está completo
        this.indicador = this.add.bitmapText(CAJA.x + CAJA.ancho - 24, CAJA.y + CAJA.alto - 24, 'fuente', '>')
            .setTint(COLORES.CIAN).setVisible(false);
        this.tweens.add({ targets: this.indicador, alpha: 0.2, duration: 300, yoyo: true, repeat: -1 });

        // Entrada: la caja aparece con un fundido corto
        this.objetos = [fondo, ...bordes, this.marcoRetrato, this.retrato, this.nombre, this.texto];
        this.objetos.forEach(o => { o.baseAlpha = o.alpha; o.setAlpha(0); });
        this.tweens.add({ targets: this.objetos, alpha: { getEnd: o => o.baseAlpha }, duration: 150 });

        this.listoEn = this.time.now + ESPERA;
        const avanzar = evento => {
            if (evento?.repeat) return;   // tecla mantenida
            this.avanzar();
        };
        ['E', 'ENTER', 'SPACE'].forEach(tecla => this.input.keyboard.on(`keydown-${tecla}`, avanzar));
        this.input.on('pointerdown', puntero => puntero.leftButtonDown() && this.avanzar());

        this.siguiente();
    }

    // Muestra la línea siguiente o, si no quedan, cierra el diálogo
    siguiente() {
        this.indice++;
        if (this.indice >= this.lineas.length) {
            this.cerrar();
            return;
        }
        const linea = this.lineas[this.indice];
        const personaje = PERSONAJES[linea.quien];
        this.nombre.setText(personaje?.nombre ?? '');
        const conRetrato = Boolean(personaje?.retrato);
        this.retrato.setVisible(conRetrato);
        this.marcoRetrato.setVisible(conRetrato);
        if (conRetrato) {
            this.retrato.setTexture(personaje.retrato, personaje.expresiones[linea.expresion ?? 'neutro'] ?? 0);
            if (linea.sobresalto) {
                this.retrato.y = RETRATO.y;
                this.tweens.add({ targets: this.retrato, y: RETRATO.y - 6, duration: 60, yoyo: true, repeat: 1 });
            }
        }
        this.escribir(ajustar(linea.texto));
    }

    // Escribe el texto letra a letra, con pausas más largas en la puntuación
    escribir(completo) {
        this.completo = completo;
        this.letras = 0;
        this.indicador.setVisible(false);
        this.texto.setText('');
        const paso = () => {
            this.letras++;
            this.texto.setText(completo.slice(0, this.letras));
            if (this.letras >= completo.length) {
                this.terminarEscritura();
                return;
            }
            this.escribiendo = this.time.delayedCall(PAUSA_LETRA[completo[this.letras - 1]] ?? PAUSA_NORMAL, paso);
        };
        this.escribiendo = this.time.delayedCall(PAUSA_NORMAL, paso);
    }

    terminarEscritura() {
        this.escribiendo?.remove();
        this.escribiendo = null;
        this.texto.setText(this.completo);
        this.indicador.setVisible(true);
    }

    avanzar() {
        if (this.cerrando || this.time.now < this.listoEn) return;
        if (this.escribiendo) this.terminarEscritura();
        else this.siguiente();
    }

    cerrar() {
        this.cerrando = true;
        this.indicador.setVisible(false);
        this.tweens.add({
            targets: this.objetos,
            alpha: 0,
            duration: 120,
            onComplete: () => {
                this.scene.resume('GameScene');
                this.scene.stop();
                this.alTerminar?.();
            }
        });
    }
}
