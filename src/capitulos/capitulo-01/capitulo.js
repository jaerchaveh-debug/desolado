// Capítulo 1: el pasillo industrial donde empieza todo.
// Cada capítulo vive en su carpeta src/capitulos/capitulo-NN/ y sus mapas en
// public/assets/niveles/capitulo-NN/<nivel>.json (mapas de Tiled con el tileset incrustado).

export default {
    id: 'capitulo-01',
    numero: 1,
    titulo: 'PASILLO DE SERVICIO',
    disponible: true,

    // Niveles en orden (nombres de archivo sin .json dentro de public/assets/niveles/capitulo-01/)
    niveles: ['pasillo-01'],

    // Aparición de enemigos en este capítulo. Cada tipo tiene su propio temporizador, independiente de los demás.
    aparicion: {
        tipos: ['rastreador', 'cuchillero'],
        intervaloInicial: 3500, // ms entre apariciones de cada tipo al empezar el nivel
        cadaMuertes: 5,         // cada N enemigos eliminados de un tipo...
        reduccion: 500,         // ...su intervalo se acorta estos ms...
        intervaloMinimo: 1500,  // ...hasta este mínimo
        maximo: 12,             // enemigos vivos a la vez (todos los tipos), para no saturar la pantalla
        distanciaMin: 120,      // px: no aparecer encima del jugador
        distanciaMax: 360,      // px: aparecer cerca para que llegue pronto (el mapa es más ancho que la pantalla)
        // Un enemigo vivo a más de esta distancia del jugador desaparece y reaparece en un punto
        // dentro de la vista del jugador, sin esperar al intervalo de aparición (no cuenta como aparición nueva)
        distanciaReubicar: 480,
        revisarReubicacion: 500 // ms entre comprobaciones
    },

    // Oleada inicial: 'retardo' ms después de empezar aparecen a la vez estos enemigos (tipo: cantidad),
    // en los puntos de su tipo cercanos al jugador. No se repite al reaparecer en el punto de control.
    oleadaInicial: {
        retardo: 1000,
        enemigos: { rastreador: 3, cuchillero: 2 }
    },

    // Encuentros fijos: al tocar el suelo de la zona (rectángulo 'zona' del mapa) cae la compuerta
    // ('compuerta', objeto del mapa) y suena la alarma; los enemigos normales vivos se retiran y dejan de
    // aparecer. 'retardo' ms después aparecen todos los 'enemigos' en los puntos de su tipo dentro de la
    // zona. Al eliminarlos a todos se abre la compuerta y vuelven las apariciones normales.
    emboscadas: [
        {
            zona: 'emboscada',
            compuerta: 'compuerta-emboscada',
            retardo: 800,
            enemigos: { rastreador: 8, cuchillero: 4 },
            // Refuerzos desde que aparece el grupo: 'duracion' ms, entre porSegundo[0] y [1]
            // enemigos por segundo, de un tipo al azar según su peso (2 rastreadores por cada cuchillero)
            refuerzos: { duracion: 7000, porSegundo: [2, 3], tipos: { rastreador: 2, cuchillero: 1 } },
            // Diálogos (DialogoScene): 'inicio' al tocar el fondo, antes de la alarma;
            // 'fin' cuando la compuerta termina de subir
            dialogos: {
                inicio: [{ quien: 'errante', expresion: 'sorpresa', texto: '!!! ....!', sobresalto: true }],
                fin: [{ quien: 'errante', expresion: 'neutro', texto: 'La puerta esta abierta.' }]
            }
        }
    ],

    // Música (rutas dentro de public/assets/): 'ambiente' suena desde el inicio y 'jefe' durante el combate final
    musica: {
        ambiente: 'audio/capitulo-01/ambiente.ogg',
        jefe: 'audio/capitulo-01/jefe.mp3'
    },
    // Alternativas generadas para comparar: abrir el juego con ?musica=generada usa sonido/musica-ambiente.js
    // y sonido/musica-jefe.js en lugar de las pistas de arriba.

    // Ambiente industrial en bucle bajo la música (nombre de sonido/*.js, tipo 'ambiente')
    ambiente: 'ambiente-pasillo',

    // Jefe de la sala final (objeto "jefe" del mapa; tipo de JEFES en src/config/combate.js).
    // Aparece 'retardo' ms después de cerrarse la compuerta. Durante el combate aparecen refuerzos cada
    // 'intervalo' ms fijos, alternando los tipos, con un máximo de vivos a la vez.
    jefe: {
        tipo: 'estibador',
        retardo: 1500,
        refuerzos: { tipos: ['rastreador', 'cuchillero'], intervalo: 2000, maximo: 10 }
    },

    // Condición para completar el capítulo: 'jefe' = derrotar al jefe. Al cumplirse, GameScene llama a
    // completarCapitulo(id) de src/sistema/progreso.js y muestra CapituloCompletadoScene.
    victoria: 'jefe'
};
