// Datos de combate. El daño y la vida usan las mismas unidades:
// un disparo elimina al enemigo cuando su daño acumulado alcanza su vida.
// Para enemigos más resistentes basta con subir `vida` (p. ej. vida 3 = tres disparos de pistola).

export const JUGADOR = {
    vida: 12,
    invulnerabilidad: 1000, // ms sin recibir daño tras un golpe (el sprite parpadea)
    retroceso: { x: 160, y: -180 },  // empujón al recibir daño, alejándolo del atacante
    // Dash (Shift): impulso horizontal sin gravedad, invulnerable mientras dura. Uno por salto en el aire.
    dash: {
        distancia: 96,      // px: igual que el alcance del especial de la pistola
        duracion: 150,      // ms que tarda en recorrerla
        enfriamiento: 800   // ms desde que termina hasta poder repetirlo
    }
};

// Puerta blindada destructible (objeto "puerta" del mapa). Recibe daño de todos los ataques.
export const PUERTA = {
    vida: 10,
    colorGolpe: 0xe4eaf0
};

// Cada arma tiene dos ataques: 'ataque' (E / L) y 'especial' (Q / J).
// Salen en la dirección en que apunta el jugador (al frente, arriba o en diagonal), salvo soloFrente.
//
// pose: cómo la sostiene el jugador · 'pistola' (brazo con pistola dibujado en sus frames)
//       o 'mano' (mano vacía; el arma es un sprite aparte colocado en la mano: ver 'sprite')
//
// Tipos de ataque:
//   'proyectil': algo que viaja (danio, velocidad px/s, alcance px). Opcional: sprite y animacion,
//                cuerpo { ancho, alto } de la caja de colisión, atraviesa (daña a cada enemigo una vez sin detenerse)
//   'estallido': impacto instantáneo en una franja desde el cañón que atraviesa a todos los enemigos
//                (danio, alcance px, ancho px de la franja, efecto = sprite del fogonazo)
//   'tajo':      golpe cuerpo a cuerpo instantáneo en una franja desde la mano, a todos los enemigos dentro
//                (danio, alcance, ancho, efecto = sprite de la estela, duracion = ms del giro del arma)
//   'carga':     el jugador queda inmóvil 'carga' ms y luego lanza 'proyectil' (siempre al frente)
// enfriamiento: ms hasta poder repetir ese ataque (en 'carga', cuenta desde el lanzamiento)
// icono (solo especial): sprite del HUD de carga
export const ARMAS = {
    pistola: {
        nombre: 'PISTOLA',
        pose: 'pistola',
        ataque: {
            tipo: 'proyectil',
            danio: 1,
            velocidad: 300,
            alcance: 480,
            enfriamiento: 250
        },
        especial: {
            tipo: 'estallido',
            danio: 4,           // elimina de un golpe a rastreadores y cuchilleros
            alcance: 96,        // se acorta si hay un muro
            ancho: 32,          // más que la bala del ataque normal
            enfriamiento: 6000,
            efecto: 'escopeta',
            icono: 'hud-escopeta'
        }
    },
    espada: {
        nombre: 'ESPADA',
        pose: 'mano',
        sprite: 'espada',
        ataque: {
            tipo: 'tajo',
            danio: 2,
            alcance: 80,        // algo menos que el especial de la pistola
            ancho: 32,
            enfriamiento: 400,
            duracion: 150,
            efecto: 'tajo-espada'
        },
        especial: {
            tipo: 'carga',
            carga: 600,         // ms inmóvil cargando
            enfriamiento: 10000,
            soloFrente: true,
            aura: 'carga-espada',
            icono: 'hud-espada',
            proyectil: {
                danio: 8,
                velocidad: 280,
                alcance: 192,   // el doble que el especial de la pistola
                atraviesa: true,
                sprite: 'onda-espada',
                animacion: 'onda-espada-viajar',
                cuerpo: { ancho: 10, alto: 28 }
            }
        }
    }
};

// Armas con las que empieza el jugador, en el orden de las teclas 1, 2...; la primera es la equipada
export const ARMAS_INICIALES = ['pistola', 'espada'];

// movimiento: 'volar' (ignora gravedad y tiles) o 'suelo' (gravedad, choca con tiles, no salta al vacío)
// puntos: nombre de los puntos de aparición del mapa (capa "objetos") que usa este tipo
// animacion: animación de movimiento del sprite ('<sprite>-<animacion>')
// danio: daño al jugador por contacto (0 = el contacto no hace daño)
// ataque (opcional): ataque cuerpo a cuerpo con la animación '<sprite>-atacar'
//   alcance: px por delante a los que empieza el ataque · danio: daño si el golpe acierta
//   frameGolpe: frame de la hoja en el que se comprueba el impacto · enfriamiento: ms entre ataques
export const ENEMIGOS = {
    // Robot flotante con tentáculos: persigue al jugador atravesando la estructura
    rastreador: {
        sprite: 'robot-tentaculos',
        animacion: 'flotar',
        movimiento: 'volar',
        puntos: 'enemigo',
        vida: 1,            // la pistola (daño 1) le quita el 100 %
        danio: 1,           // daño al jugador por contacto
        velocidad: 35,
        colorGolpe: 0xe4eaf0,
        hitbox: { ancho: 14, alto: 16, x: 5, y: 1 }
    },
    // Robot humanoide blanco a seis patas con brazos-cuchilla: patrulla el suelo hacia el jugador
    cuchillero: {
        sprite: 'robot-cuchillas',
        animacion: 'caminar',
        movimiento: 'suelo',
        puntos: 'enemigo-suelo',
        vida: 2,            // dos disparos de pistola
        danio: 0,           // solo hace daño con el tajo de sus cuchillas
        ataque: { alcance: 26, danio: 1, frameGolpe: 8, enfriamiento: 900 },
        velocidad: 45,
        colorGolpe: 0xb3262a,   // es blanco: el destello de golpe va en rojo para que se note
        // Cubre torso y cabeza para que la pistola (a la altura del pecho del jugador) le alcance
        hitbox: { ancho: 22, alto: 21, x: 7, y: 3 }
    }
};

// La aparición de enemigos se configura por capítulo: ver `aparicion` en src/capitulos/capitulo-NN/capitulo.js

// Jefes. Los puntos (ojos, garra) son relativos al centro del sprite mirando a la derecha.
export const JEFES = {
    // Estibador (capítulo 1): humanoide negro con garras de carga. Camina hacia el jugador y salta a las cajas.
    //   cerca: zarpazo como los cuchilleros; cada 'cargado.cadaZarpazos' zarpazos, ataque cargado en área
    //   lejos: bolas de energía desde la garra; tras 'disparo.duracion' ms disparando, ráfaga de rayos de los ojos
    estibador: {
        nombre: 'ESTIBADOR',
        sprite: 'jefe-estibador',
        vida: 100,
        velocidad: 40,
        salto: -400,            // sube pilas de dos cajas (64 px)
        colorGolpe: 0xe4eaf0,
        hitbox: { ancho: 24, alto: 58, x: 12, y: 5 },
        ojos: { x: 3, y: -23 },
        garra: { x: 22, y: -9 },
        // Distancia (px) a la que el jugador está "cerca": horizontal y vertical
        cerca: { x: 72, y: 44 },
        zarpazo: { alcance: 64, danio: 1, frameGolpe: 6, enfriamiento: 600 },
        cargado: { cadaZarpazos: 3, carga: 1500, radio: 88, danio: 2 },   // radio: también el tamaño de arte/onda-jefe.js
        disparo: {
            cadencia: 700,      // ms entre bolas
            duracion: 4000,     // ms disparando antes de los rayos
            danio: 1,
            velocidad: 200,     // algo más lenta que la bala de la pistola (300)
            alcance: 480,
            sprite: 'bola-energia',
            animacion: 'bola-energia-viajar',
            cuerpo: { ancho: 6, alto: 6 }
        },
        // Cada rayo: 'aviso' ms de marca fina hacia donde estaba el jugador y luego 'duracion' ms de rayo que daña
        rayo: { cantidad: 3, aviso: 700, duracion: 250, pausa: 300, danio: 2, ancho: 8, alcance: 640 }
    }
};
