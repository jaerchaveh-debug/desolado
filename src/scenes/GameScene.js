import Phaser from 'phaser';
import sprites from '../assets/sprites.json';
import { JUGADOR, ARMAS, ENEMIGOS, JEFES, CURACION } from '../config/combate';
import { buscarCapitulo, claveNivel } from '../capitulos';
import { completarCapitulo, equipamiento } from '../sistema/progreso';
import { sonar, claveSonido, datosSonido, pistaMusica } from '../sistema/sonido';
import Enemigo, { EVENTO_ELIMINADO } from '../objetos/Enemigo';
import Proyectil from '../objetos/Proyectil';
import Puerta from '../objetos/Puerta';
import Jefe, { EVENTO_JEFE_DERROTADO } from '../objetos/Jefe';
import { crearParallax } from '../ambiente/parallax';

const VELOCIDAD = 120;
const SALTO = -330;
// Hacia dónde apunta el jugador, respecto al centro del sprite mirando a la derecha:
//   boca: boca del cañón de la pistola · mano: puño donde se coloca un arma de 'pose: mano' (la espada)
//   angulo: grados del arma en la mano (0 = al frente)
const APUNTAR = {
    frente:   { boca: { x: 7, y: -2 },  mano: { x: 4, y: -2 },  angulo: 0 },
    arriba:   { boca: { x: 6, y: -15 }, mano: { x: 5, y: -10 }, angulo: -90 },
    diagonal: { boca: { x: 7, y: -12 }, mano: { x: 4, y: -8 },  angulo: -45 },
    // Solo con el ratón y con pistola (las armas de mano no tienen pose hacia abajo)
    diagonalAbajo: { boca: { x: 7, y: 4 }, mano: { x: 4, y: -2 }, angulo: 45 },
    // Arma en reposo (solo armas de 'pose: mano'): cuelga hacia abajo e inclinada hacia atrás, como si pesara
    reposo:   { boca: { x: 7, y: -2 },  mano: { x: 1, y: 1 },   angulo: 118 }
};
// Bloque de frames del brazo según la pose del arma (ver arte/jugador.js). Con pistola, el bloque +1 es el retroceso.
const BLOQUES = {
    pistola: { frente: 0, arriba: 2, diagonal: 4, diagonalAbajo: 10, retroceso: true },
    mano:    { frente: 6, arriba: 7, diagonal: 8, diagonalAbajo: 6, reposo: 9, retroceso: false }
};
// Ángulos de la espada (relativos, en grados): giro del tajo y posición en alto durante la carga
const TAJO_DESDE = -70;
const TAJO_HASTA = 50;
const ANGULO_CARGA = -135;
const FRAME_ARMA_CARGANDO = 1;
// Balanceo (grados) del arma en reposo al caminar
const BALANCEO_REPOSO = 5;
const FRAMES_LUZ = { cian: 1, roja: 2 };
// px alrededor de la cámara que todavía cuentan como "dentro de la vista" al reubicar enemigos
const MARGEN_VISTA = 24;
const FRAMES_POR_BLOQUE = 7;
const FRAME_DESTELLO = 1;
// Animación de disparo: durante este tiempo se muestra la variante con el brazo en retroceso
const RETROCESO = 90;
const RETROCESO_ESPECIAL = 180;
// Tiempo durante el que el jugador atraviesa las rejillas al pulsar abajo
const ATRAVESAR = 250;
// Ángulo máximo (grados bajo la horizontal) al apuntar hacia abajo con el ratón
const ABAJO_MAXIMO = 60;
// Tiempo que se mantiene la pose del brazo de un ataque con ratón (para que se vea el retroceso)
const POSE_RATON = 200;
// Estela del dash: una silueta cian cada tantos ms
const ESTELA_DASH = 25;
// px que hay que adentrarse en la sala del jefe para que se cierre la compuerta
const ENTRADA_SALA = 64;
const VOLUMEN_MUSICA = 0.5;
// Ambiente del capítulo (ruido industrial en bucle bajo la música); se multiplica por su 'volumen' del manifiesto
const VOLUMEN_AMBIENTE = 0.8;
// ms desde la derrota del jefe hasta la pantalla de capítulo completado
const ESPERA_VICTORIA = 3000;
// Punto de control: px a la izquierda de la terminal donde reaparece el jugador, y cuánto se ve el aviso
const REAPARICION_CONTROL = 20;
const AVISO_CONTROL = 2200;
// ms tras abrirse la compuerta de una emboscada hasta su diálogo de salida (la compuerta tarda 900 en subir)
const ESPERA_DIALOGO_COMPUERTA = 1000;
// Emboscadas: px mínimos entre el jugador y un punto de aparición
const DISTANCIA_EMBOSCADA = 48;
const FRAME_VIDA_LLENA = 0;
const FRAME_VIDA_VACIA = 1;
const FRAME_ICONO_CARGADO = 0;
const FRAME_ICONO_VACIO = 1;

export default class GameScene extends Phaser.Scene {

    constructor() {
        super('GameScene');
    }

    // datos: { capitulo: id del capítulo, nivel: índice dentro de capitulo.niveles,
    //         control: punto de control alcanzado (nombre del objeto del mapa) o null = desde el inicio }
    // GameOverScene reinicia con estos mismos datos: al reintentar se reaparece en el último control
    init(datos) {
        this.datos = { capitulo: datos.capitulo, nivel: datos.nivel ?? 0, control: datos.control ?? null };
        this.capitulo = buscarCapitulo(this.datos.capitulo);
        this.aparicion = this.capitulo.aparicion;
        this.claveNivel = claveNivel(this.capitulo, this.capitulo.niveles[this.datos.nivel]);
    }

    create() {
        // scene.restart reutiliza esta misma instancia: el estado que no se crea más abajo se limpia aquí
        // para no arrastrar valores (ni objetos ya destruidos, como el HUD) de la partida anterior
        this.armaId = null;
        this.textoArma = null;
        this.alturaAire = null;
        this.dash = null;
        this.dashListo = 0;
        this.dashEnAire = false;
        this.poseRaton = null;
        this.salaCerrada = false;
        this.jefe = null;
        this.victoria = false;
        this.refuerzos = null;
        this.barraJefe = null;
        this.musica = null;

        const mapa = this.make.tilemap({ key: this.claveNivel });
        crearParallax(this);
        // El nombre del tileset en Tiled coincide con la clave de textura generada por `npm run arte`
        const tilesets = mapa.tilesets.map(t => mapa.addTilesetImage(t.name, t.name));
        // Capa "fondo" (opcional, sin colisión) detrás del plano de juego
        if (mapa.getLayer('fondo')) {
            this.fondo = mapa.createLayer('fondo', tilesets, 0, 0).setDepth(-10);
            this.crearLuces(mapa);
        }
        this.nivel = mapa.createLayer('plataformas', tilesets, 0, 0);
        this.aplicarPropiedades(mapa);

        this.physics.world.setBounds(0, 0, mapa.widthInPixels, mapa.heightInPixels);
        // Sin límite inferior: los fosos no tienen fondo
        this.physics.world.setBoundsCollision(true, true, true, false);

        // Punto "inicio" de la capa de objetos: donde apoyan los pies del jugador
        // Con un punto de control alcanzado se empieza junto a su terminal
        const inicio = mapa.findObject('objetos', o => o.name === 'inicio');
        this.puntoControl = mapa.findObject('objetos', o => o.name === 'control');
        this.inicio = this.datos.control && this.puntoControl
            ? { x: this.puntoControl.x - REAPARICION_CONTROL, y: this.puntoControl.y - 16 }
            : { x: inicio.x, y: inicio.y - 16 };

        this.player = this.physics.add.sprite(this.inicio.x, this.inicio.y, 'jugador');
        // Hitbox ajustada al cuerpo (el frame de 16x32 tiene margen transparente)
        this.player.body.setSize(8, 29).setOffset(4, 3);
        this.player.setCollideWorldBounds(true);
        this.player.play('jugador-quieto');
        this.player.setDepth(10);
        this.vida = JUGADOR.vida;
        this.invulnerableHasta = 0;
        this.controlBloqueadoHasta = 0;
        this.muerto = false;

        // Al pulsar abajo sobre una rejilla (solo colisiona por arriba), el jugador la atraviesa un instante
        this.physics.add.collider(this.player, this.nivel, null, (jugador, tile) =>
            !(this.time.now < this.atravesarHasta && tile.collideUp && !tile.collideDown));
        this.atravesarHasta = 0;
        this.retrocesoHasta = 0;
        this.apuntado = 'frente';

        // Cámara que sigue al jugador dentro de los límites del mapa
        const cam = this.cameras.main;
        cam.setBounds(0, 0, mapa.widthInPixels, mapa.heightInPixels);
        cam.startFollow(this.player, true, 0.1, 0.1);
        cam.setDeadzone(64, 48);

        this.crearCombate(mapa);
        this.crearHud();

        // A/D o ←/→ mueven · W/↑ apunta arriba · S/↓ baja de una rejilla · espacio salta · Shift: dash
        // E/L o clic izquierdo: ataque del arma equipada · Q/J o clic derecho: ataque especial · 1, 2, 3 cambian de arma
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,A,S,D');
        this.teclas = this.input.keyboard.addKeys('E,L,Q,J,ONE,TWO,THREE,SHIFT');

        // Ratón: el clic derecho no abre el menú del navegador; se recuerda hasta el siguiente update (como un JustDown)
        this.input.mouse.disableContextMenu();
        this.especialPorClic = false;
        this.input.on('pointerdown', puntero => {
            if (puntero.rightButtonDown()) this.especialPorClic = true;
        });
        this.crearMira();

        // El arma colocada en la mano se reposiciona después de que la física mueva al jugador
        this.events.on(Phaser.Scenes.Events.POST_UPDATE, this.colocarArma, this);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.events.off(Phaser.Scenes.Events.POST_UPDATE, this.colocarArma, this));

        this.crearMusica();

        // Pausa con V: pantalla "Conexión perdida" encima de la escena congelada
        this.input.keyboard.on('keydown-V', () => this.pausar());
        // Al volver de la pausa, olvida las teclas que quedaron "pulsadas" mientras estaba congelada
        const olvidarTeclas = () => this.input.keyboard.resetKeys();
        this.events.on(Phaser.Scenes.Events.RESUME, olvidarTeclas);
        // Los listeners de this.events sobreviven a scene.restart: se retiran al cerrar la escena
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.events.off(Phaser.Scenes.Events.RESUME, olvidarTeclas));
    }

    // Música del capítulo: empieza 'ambiente' y, debajo, el ambiente industrial en bucle del capítulo.
    // Las pistas se pausan con la escena y se destruyen al cerrarla
    crearMusica() {
        this.pistas = [];
        const pausar = () => this.pistas.forEach(p => p.isPlaying && p.pause());
        const reanudar = () => this.pistas.forEach(p => p.isPaused && p.resume());
        this.events.on(Phaser.Scenes.Events.PAUSE, pausar);
        this.events.on(Phaser.Scenes.Events.RESUME, reanudar);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.events.off(Phaser.Scenes.Events.PAUSE, pausar);
            this.events.off(Phaser.Scenes.Events.RESUME, reanudar);
            this.pistas.forEach(p => p.destroy());
            this.pistas = [];
        });
        this.reproducirMusica('ambiente');

        const ambiente = this.capitulo.ambiente;
        if (ambiente && this.cache.audio.exists(claveSonido(ambiente))) {
            const pista = this.sound.add(claveSonido(ambiente), { loop: true, volume: 0 });
            this.pistas.push(pista);
            pista.play();
            this.tweens.add({ targets: pista, volume: datosSonido(ambiente).volumen * VOLUMEN_AMBIENTE, duration: 2000 });
        }
    }

    // Cambia a otra pista del capítulo con un fundido cruzado. Con ?musica=generada en la URL usa la
    // alternativa generada (sonido/musica-<nombre>.js) si existe, para comparar con la original.
    reproducirMusica(nombre) {
        const datos = pistaMusica(this, this.capitulo, nombre);
        if (!datos) return;
        this.apagarMusica(800);
        const pista = this.sound.add(datos.clave, { loop: true, volume: 0 });
        this.pistas.push(pista);
        pista.play();
        this.tweens.add({ targets: pista, volume: VOLUMEN_MUSICA * datos.volumen, duration: 1200 });
        this.musica = pista;
    }

    apagarMusica(duracion) {
        const pista = this.musica;
        if (!pista) return;
        this.musica = null;
        this.tweens.add({
            targets: pista, volume: 0, duration: duracion,
            onComplete: () => {
                pista.destroy();
                Phaser.Utils.Array.Remove(this.pistas, pista);
            }
        });
    }

    // Mira pixel art en lugar del cursor del sistema mientras se juega (en pausa y al salir vuelve el cursor normal)
    crearMira() {
        this.mira = this.add.image(0, 0, 'mira').setScrollFactor(0).setDepth(200).setVisible(false);
        this.input.on('pointermove', puntero => this.mira.setPosition(Math.round(puntero.x), Math.round(puntero.y)).setVisible(true));
        this.input.on('gameout', () => this.mira.setVisible(false));
        const ocultarCursor = () => this.input.setDefaultCursor('none');
        const mostrarCursor = () => this.input.setDefaultCursor('default');
        ocultarCursor();
        this.events.on(Phaser.Scenes.Events.RESUME, ocultarCursor);
        this.events.on(Phaser.Scenes.Events.PAUSE, mostrarCursor);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            mostrarCursor();
            this.events.off(Phaser.Scenes.Events.RESUME, ocultarCursor);
            this.events.off(Phaser.Scenes.Events.PAUSE, mostrarCursor);
        });
    }

    // Dirección (vector unitario) del jugador hacia el cursor. Con pistola puede apuntar hacia abajo por los
    // lados (hasta ABAJO_MAXIMO grados); las armas de mano no tienen pose hacia abajo y un cursor por debajo
    // del hombro ataca en horizontal.
    direccionRaton() {
        const p = this.input.activePointer.positionToCamera(this.cameras.main);
        const dx = p.x - this.player.x;
        let dy = p.y - (this.player.y - 6);
        if (this.arma.pose !== 'pistola') dy = Math.min(0, dy);
        else dy = Math.min(dy, Math.abs(dx) * Math.tan(Phaser.Math.DegToRad(ABAJO_MAXIMO)));
        const largo = Math.hypot(dx, dy);
        if (largo < 1) return { x: this.player.flipX ? -1 : 1, y: 0 };
        return { x: dx / largo, y: dy / largo };
    }

    // Pose del brazo más cercana a una dirección: diagonal abajo, frente, diagonal o arriba
    poseCercana(direccion) {
        const grados = Phaser.Math.RadToDeg(Math.atan2(-direccion.y, Math.abs(direccion.x)));
        return grados < -22.5 ? 'diagonalAbajo' : grados < 22.5 ? 'frente' : grados < 67.5 ? 'diagonal' : 'arriba';
    }

    // Coloca una luz parpadeante sobre cada lámpara del fondo (tiles con la propiedad 'luz' en su tileset)
    crearLuces(mapa) {
        this.fondo.forEachTile(tile => {
            const ts = mapa.tilesets.find(t => t.containsTileIndex(tile.index));
            const color = ts && sprites[ts.name]?.propiedades?.[tile.index - ts.firstgid]?.luz;
            if (!color) return;
            const encendida = FRAMES_LUZ[color];
            const luz = this.add.image(tile.getCenterX(), tile.getCenterY(), 'luz-fondo', encendida).setDepth(-5);
            if (color === 'roja') {
                // Alarma: se enciende y apaga con un ritmo fijo
                this.time.addEvent({
                    delay: 600, loop: true, startAt: Phaser.Math.Between(0, 600),
                    callback: () => luz.setFrame(luz.frame.name === encendida ? 0 : encendida)
                });
            } else {
                // Fluorescente averiado: casi siempre encendida, con apagones breves a ratos
                this.time.addEvent({
                    delay: Phaser.Math.Between(700, 2200), loop: true,
                    callback: () => {
                        luz.setFrame(0);
                        this.time.delayedCall(Phaser.Math.Between(50, 180), () => luz.setFrame(encendida));
                    }
                });
            }
        });
    }

    pausar() {
        if (this.muerto) return;
        this.scene.launch('PauseScene', this.datos);
        this.scene.pause();
    }

    crearCombate(mapa) {
        // Espacios de armas de la pantalla de equipamiento (teclas 1, 2, 3; null = vacío);
        // la equipada es this.arma (con su 'ataque' y su 'especial')
        this.armas = equipamiento();
        // Momento en que cada ataque de cada arma vuelve a estar disponible (se conserva al cambiar de arma)
        this.enfriamientos = Object.fromEntries(this.armas.filter(Boolean).map(id => [id, { ataque: 0, especial: 0 }]));
        this.carga = null;            // ataque especial cargándose (espada)
        this.tajo = null;             // giro del arma durante un tajo
        this.armaEnMano = this.add.sprite(0, 0, 'espada').setDepth(11).setVisible(false);
        this.equiparArma(this.armas.find(Boolean));   // la del primer espacio ocupado
        this.especialAvisado = true;  // empieza cargado: sin destello inicial

        this.balas = this.physics.add.group({ classType: Proyectil, maxSize: 20, allowGravity: false });
        this.enemigos = this.physics.add.group({ allowGravity: false });

        // Las balas se detienen en los tiles sólidos (las rejillas solo colisionan por arriba, así que las atraviesan)
        this.physics.add.collider(this.balas, this.nivel, bala => {
            sonar(this, 'impacto-muro', { x: bala.x });
            bala.impactar();
        });
        // Solo los enemigos de suelo chocan con los tiles; los voladores los atraviesan
        this.physics.add.collider(this.enemigos, this.nivel, null, enemigo => enemigo.caminaPorSuelo);
        this.physics.add.overlap(this.player, this.enemigos, (jugador, enemigo) => {
            if (enemigo.vivo && enemigo.datos.danio > 0) this.danarJugador(enemigo.datos.danio, enemigo.x);
        });
        this.physics.add.overlap(this.balas, this.enemigos, (bala, enemigo) => {
            if (bala.active && enemigo.vivo) bala.golpear(enemigo);
        });

        // Puntos de aparición de la capa de objetos, agrupados por nombre ("enemigo", "enemigo-suelo"...)
        this.puntosAparicion = {};
        for (const o of mapa.getObjectLayer('objetos').objects) {
            (this.puntosAparicion[o.name] ??= []).push(o);
        }
        // Un temporizador de aparición por tipo, que se acelera al eliminar enemigos de ese tipo.
        // Al reaparecer en el punto de control (ante la sala del jefe) no hay apariciones normales
        this.intervalos = {};
        this.eliminados = {};
        for (const tipo of this.aparicion.tipos) {
            this.intervalos[tipo] = this.aparicion.intervaloInicial;
            this.eliminados[tipo] = 0;
            if (!this.datos.control) this.programarAparicion(tipo);
        }
        // Los enemigos que quedan muy lejos del jugador reaparecen dentro de su vista
        this.time.addEvent({ delay: this.aparicion.revisarReubicacion, loop: true, callback: () => this.reubicarLejanos() });
        this.events.on(EVENTO_ELIMINADO, tipo => this.contarEliminado(tipo));
        this.events.on(EVENTO_ELIMINADO, (tipo, enemigo) => this.soltarCelula(enemigo));

        // Células de energía que sueltan los enemigos: caen, se posan en el suelo y curan al recogerlas
        this.celulas = this.physics.add.group();
        this.physics.add.collider(this.celulas, this.nivel);
        this.physics.add.overlap(this.player, this.celulas, (jugador, celula) => this.recogerCelula(celula));
        // Los listeners de this.events sobreviven a scene.restart: hay que quitarlos al cerrar la escena
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.events.off(EVENTO_ELIMINADO));

        this.crearSalaJefe(mapa);
        this.crearControl();
        this.crearEmboscadas(mapa);

        // Oleada inicial: varios enemigos a la vez al poco de empezar (no al reaparecer en el control)
        const oleada = this.capitulo.oleadaInicial;
        if (oleada && !this.datos.control) {
            this.time.delayedCall(oleada.retardo, () => this.aparecerGrupo(oleada.enemigos));
        }
    }

    // Aparecen a la vez los enemigos de { tipo: cantidad } repartidos entre los puntos de su tipo:
    // dentro de la zona si se da (emboscadas) o, si no, los cercanos al jugador. Devuelve los creados.
    aparecerGrupo(enemigos, zona = null) {
        const creados = [];
        for (const [tipo, cantidad] of Object.entries(enemigos)) {
            for (const p of this.repartirPuntos(tipo, cantidad, zona)) creados.push(this.crearEnemigo(tipo, p));
        }
        return creados;
    }

    // n puntos de aparición del tipo, sin repetir mientras haya; si hay que repetir, con un pequeño
    // desplazamiento para que los enemigos no salgan unos encima de otros
    repartirPuntos(tipo, n, zona = null) {
        const distancia = p => Phaser.Math.Distance.Between(p.x, p.y, this.player.x, this.player.y);
        let puntos = (this.puntosAparicion[ENEMIGOS[tipo].puntos] ?? []).filter(p => zona
            ? zona.contains(p.x, p.y) && distancia(p) > DISTANCIA_EMBOSCADA
            : !this.salaJefe?.contains(p.x, p.y) && distancia(p) > this.aparicion.distanciaMin && distancia(p) < this.aparicion.distanciaMax);
        if (!puntos.length) puntos = [this.elegirPunto(tipo)].filter(Boolean);
        if (!puntos.length) return [];
        puntos = Phaser.Utils.Array.Shuffle([...puntos]);
        const vuela = ENEMIGOS[tipo].movimiento !== 'suelo';
        return Array.from({ length: n }, (_, i) => {
            const p = puntos[i % puntos.length];
            if (i < puntos.length) return p;
            return { x: p.x + Phaser.Math.Between(-12, 12), y: vuela ? p.y + Phaser.Math.Between(-12, 12) : p.y };
        });
    }

    // Encuentros fijos del capítulo (capitulo.emboscadas): zona del mapa y compuerta que la cierra
    crearEmboscadas(mapa) {
        this.emboscada = null;
        this.emboscadas = (this.capitulo.emboscadas ?? []).map(datos => {
            const zona = mapa.findObject('objetos', o => o.name === datos.zona);
            const puntoCompuerta = mapa.findObject('objetos', o => o.name === datos.compuerta);
            if (!zona) return null;
            const compuerta = puntoCompuerta ? new Puerta(this, puntoCompuerta.x, puntoCompuerta.y, true) : null;
            if (compuerta) {
                this.physics.add.collider(this.player, compuerta);
                this.physics.add.collider(compuerta, this.enemigos, null, (c, enemigo) => enemigo.caminaPorSuelo);
                // Las balas se quedan en el metal (no le hacen daño)
                this.physics.add.overlap(compuerta, this.balas, (c, bala) => {
                    if (c.body.enable && bala.active) bala.impactar();
                });
            }
            return { datos, zona: new Phaser.Geom.Rectangle(zona.x, zona.y, zona.width, zona.height), compuerta, hecha: false };
        }).filter(Boolean);
        const contar = (tipo, enemigo) => this.contarEmboscada(enemigo);
        this.events.on(EVENTO_ELIMINADO, contar);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.events.off(EVENTO_ELIMINADO, contar));
    }

    // Se dispara al tocar el suelo de la zona (no al pasar en el aire ni desde una plataforma intermedia)
    comprobarEmboscadas() {
        if (this.emboscada || !this.player.body.blocked.down) return;
        const e = this.emboscadas.find(e => !e.hecha && e.zona.contains(this.player.x, this.player.body.bottom)
            && this.player.body.bottom >= e.zona.bottom - 2);
        if (!e) return;
        // Primero el diálogo de llegada (si lo hay); la alarma salta al cerrarlo
        e.hecha = true;
        this.dialogo(e.datos.dialogos?.inicio, () => this.empezarEmboscada(e));
    }

    empezarEmboscada(e) {
        e.hecha = true;
        this.emboscada = e;
        e.restantes = Infinity;   // hasta que aparecen no puede terminar
        e.compuerta?.cerrar();
        for (const enemigo of this.enemigos.getChildren()) enemigo.retirar();
        sonar(this, 'alarma-emboscada');
        this.cameras.main.shake(250, 0.006);
        const aviso = this.add.bitmapText(this.scale.width / 2, 48, 'fuente', 'ALERTA: INTRUSO DETECTADO')
            .setOrigin(0.5).setScrollFactor(0).setDepth(100).setTint(0xb3262a);
        // Parpadea como una alarma y se apaga
        this.tweens.add({ targets: aviso, alpha: 0.2, duration: 180, yoyo: true, repeat: 5, onComplete: () => aviso.destroy() });
        this.time.delayedCall(e.datos.retardo, () => {
            if (this.muerto) return;
            e.restantes = 0;
            this.sumarAEmboscada(e, this.aparecerGrupo(e.datos.enemigos, e.zona));
            this.refuerzosEmboscada(e);
            this.comprobarFinEmboscada(e);
        });
    }

    sumarAEmboscada(e, creados) {
        creados.forEach(enemigo => { enemigo.emboscada = true; });
        e.restantes += creados.length;
    }

    // Refuerzos (datos.refuerzos): durante `duracion` ms, cada segundo llegan entre porSegundo[0]
    // y porSegundo[1] enemigos repartidos a lo largo de ese segundo, de un tipo al azar según
    // el peso de `tipos`. Sin límite de vivos. La emboscada no termina mientras duran.
    refuerzosEmboscada(e) {
        const r = e.datos.refuerzos;
        if (!r) return;
        e.refuerzando = true;
        const segundos = Math.ceil(r.duracion / 1000);
        const tipos = Object.entries(r.tipos).flatMap(([tipo, peso]) => Array(peso).fill(tipo));
        for (let s = 0; s < segundos; s++) {
            const n = Phaser.Math.Between(r.porSegundo[0], r.porSegundo[1]);
            for (let i = 0; i < n; i++) {
                this.time.delayedCall(s * 1000 + Math.round(i * 1000 / n), () => {
                    if (this.muerto || this.emboscada !== e) return;
                    this.sumarAEmboscada(e, this.aparecerGrupo({ [Phaser.Utils.Array.GetRandom(tipos)]: 1 }, e.zona));
                });
            }
        }
        // Al acabar los refuerzos, si ya no queda nadie, se abre la compuerta
        this.time.delayedCall(segundos * 1000, () => {
            e.refuerzando = false;
            if (this.emboscada === e) this.comprobarFinEmboscada(e);
        });
    }

    contarEmboscada(enemigo) {
        if (!this.emboscada || !enemigo?.emboscada) return;
        this.emboscada.restantes--;
        this.comprobarFinEmboscada(this.emboscada);
    }

    comprobarFinEmboscada(e) {
        if (e.restantes <= 0 && !e.refuerzando) this.terminarEmboscada();
    }

    // Todos eliminados: se abre la compuerta y vuelven las apariciones normales
    terminarEmboscada() {
        const e = this.emboscada;
        e.compuerta?.abrir();
        this.emboscada = null;
        // Diálogo de salida cuando la compuerta ha terminado de subir
        this.time.delayedCall(ESPERA_DIALOGO_COMPUERTA, () => this.dialogo(e.datos.dialogos?.fin));
    }

    // Diálogo con retratos (DialogoScene) encima del juego congelado. Sin líneas, o con el
    // jugador muerto, no se muestra; alTerminar se llama igualmente al cerrarlo.
    dialogo(lineas, alTerminar) {
        if (!lineas?.length || this.muerto) {
            alTerminar?.();
            return;
        }
        this.scene.launch('DialogoScene', { lineas, alTerminar });
        this.scene.pause();
    }

    // Terminal del punto de control (objeto "control"): al pasar por delante se activa y, desde entonces,
    // "Volver a intentarlo" reaparece junto a ella. Al reaparecer ya está encendida.
    crearControl() {
        this.terminal = null;
        if (!this.puntoControl) return;
        this.terminal = this.add.sprite(this.puntoControl.x, this.puntoControl.y, 'terminal-control', 0)
            .setOrigin(0.5, 1).setDepth(5);
        if (this.datos.control) this.terminal.play('terminal-control-activa');
    }

    activarControl() {
        this.datos.control = this.puntoControl.name;
        this.terminal.play('terminal-control-activa');
        sonar(this, 'control-activar', { x: this.terminal.x });
        const aviso = this.add.bitmapText(this.scale.width / 2, 48, 'fuente', 'SEÑAL REGISTRADA')
            .setOrigin(0.5).setScrollFactor(0).setDepth(100).setTint(0x47c2c9).setAlpha(0);
        this.tweens.add({ targets: aviso, alpha: 1, duration: 200, yoyo: true, hold: AVISO_CONTROL, onComplete: () => aviso.destroy() });
    }

    // Puerta blindada destructible, compuerta y sala del jefe (objetos "puerta", "compuerta" y "sala-jefe")
    crearSalaJefe(mapa) {
        const objeto = nombre => mapa.findObject('objetos', o => o.name === nombre);
        const datosPuerta = objeto('puerta');
        this.puerta = null;
        // Al reaparecer en el punto de control (que está detrás) la puerta ya está rota
        if (datosPuerta && !this.datos.control) {
            const puerta = new Puerta(this, datosPuerta.x, datosPuerta.y);
            // Sprite contra grupo: Phaser pasa siempre primero el sprite a los callbacks, así que la puerta va delante
            puerta.registrar(
                this.physics.add.collider(this.player, puerta),
                this.physics.add.collider(puerta, this.enemigos, null, (p, enemigo) => enemigo.caminaPorSuelo),
                // Las balas (también la onda de la espada) se quedan en el metal
                this.physics.add.overlap(puerta, this.balas, (p, bala) => {
                    if (!bala.active) return;
                    bala.golpear(puerta);
                    bala.impactar();
                })
            );
            this.puerta = puerta;
        }

        const datosCompuerta = objeto('compuerta');
        this.compuerta = null;
        if (datosCompuerta) {
            this.compuerta = new Puerta(this, datosCompuerta.x, datosCompuerta.y, true);
            this.physics.add.collider(this.player, this.compuerta);
        }

        const sala = objeto('sala-jefe');
        this.salaJefe = sala ? new Phaser.Geom.Rectangle(sala.x, sala.y, sala.width, sala.height) : null;
        this.puntoJefe = objeto('jefe');

        // Bolas de energía del jefe: dañan al jugador (salvo durante el dash) y se detienen en los tiles
        this.balasJefe = this.physics.add.group({ classType: Proyectil, maxSize: 20, allowGravity: false });
        this.physics.add.collider(this.balasJefe, this.nivel, bala => {
            sonar(this, 'bola-impacto', { x: bala.x });
            bala.impactar();
        });
        this.physics.add.overlap(this.player, this.balasJefe, (jugador, bala) => {
            if (!bala.active || this.dash) return;
            sonar(this, 'bola-impacto', { x: bala.x });
            this.danarJugador(bala.danio, bala.x);
            bala.impactar();
        });
        this.events.on(EVENTO_JEFE_DERROTADO, this.jefeDerrotado, this);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.events.off(EVENTO_JEFE_DERROTADO, this.jefeDerrotado, this));
    }

    // Llamado por el jefe: bola de energía desde (x, y) en la dirección
    dispararBolaJefe(x, y, direccion, ataque) {
        const bala = this.balasJefe.get();
        if (bala) bala.disparar(x, y, direccion, ataque);
    }

    get enSalaJefe() {
        return !!this.salaJefe && this.salaJefe.contains(this.player.x, this.player.y);
    }

    // Al adentrarse en la sala: cae la compuerta, se retiran los enemigos normales, dejan de aparecer
    // y la cámara queda dentro de la sala. Aquí aparecerá el jefe (pendiente de diseñar).
    cerrarSala() {
        this.salaCerrada = true;
        this.compuerta?.cerrar();
        for (const enemigo of this.enemigos.getChildren()) enemigo.retirar();
        const { x, y, width, height } = this.salaJefe;
        this.cameras.main.setBounds(x, y, width, height);
        if (this.capitulo.jefe && this.puntoJefe) {
            this.apagarMusica(this.capitulo.jefe.retardo);
            this.time.delayedCall(this.capitulo.jefe.retardo, () => this.iniciarJefe());
        }
    }

    // El jefe cae del techo de la sala; empiezan su música, su barra de vida y los refuerzos
    iniciarJefe() {
        if (this.muerto) return;
        const datos = this.capitulo.jefe;
        this.jefe = new Jefe(this, this.puntoJefe.x, this.salaJefe.y + 64, datos.tipo, this.player);
        // Solo choca con tiles sólidos: atraviesa las plataformas colgantes, pero sube a las cajas
        this.physics.add.collider(this.jefe, this.nivel, null, (jefe, tile) => tile.collideDown);
        this.physics.add.overlap(this.jefe, this.balas, (jefe, bala) => {
            if (bala.active && jefe.vivo) bala.golpear(jefe);
        });
        this.reproducirMusica('jefe');
        this.mostrarHudJefe();

        // Refuerzos cada intervalo fijo, alternando los tipos
        let turno = 0;
        this.refuerzos = this.time.addEvent({
            delay: datos.refuerzos.intervalo,
            loop: true,
            callback: () => {
                const tipos = datos.refuerzos.tipos;
                this.aparecerEnemigo(tipos[turno++ % tipos.length], true);
            }
        });
    }

    mostrarHudJefe() {
        const { width: w } = this.scale;
        const ancho = 160, x = Math.round((w - ancho) / 2), y = 8;
        const hud = o => o.setOrigin(0).setScrollFactor(0).setDepth(100).setAlpha(0);
        this.barraJefeFondo = hud(this.add.image(x, y, 'barra-jefe', 1));
        this.barraJefe = hud(this.add.image(x, y, 'barra-jefe', 0));
        this.nombreJefe = hud(this.add.bitmapText(w / 2, y + 9, 'fuente', JEFES[this.capitulo.jefe.tipo].nombre))
            .setOrigin(0.5, 0).setTint(0x8794a6);
        this.tweens.add({ targets: [this.barraJefeFondo, this.barraJefe, this.nombreJefe], alpha: 1, duration: 600 });
        this.actualizarHudJefe();
    }

    // Llamado por el jefe al recibir daño
    actualizarHudJefe() {
        if (!this.barraJefe || !this.jefe) return;
        const ancho = Math.round(this.barraJefe.width * this.jefe.vida / this.jefe.datos.vida);
        this.barraJefe.setCrop(0, 0, ancho, this.barraJefe.height);
    }

    // Victoria del capítulo: se retiran los refuerzos, se apaga la música y, tras una pausa,
    // se guarda el progreso y se muestra la pantalla de capítulo completado
    jefeDerrotado() {
        this.victoria = true;
        this.refuerzos?.remove();
        for (const enemigo of this.enemigos.getChildren()) enemigo.retirar();
        this.balasJefe.getChildren().forEach(b => b.active && b.impactar());
        this.apagarMusica(2500);
        this.tweens.add({ targets: [this.barraJefeFondo, this.barraJefe, this.nombreJefe], alpha: 0, delay: 800, duration: 600 });
        this.time.delayedCall(ESPERA_VICTORIA, () => {
            if (this.capitulo.victoria === 'jefe') completarCapitulo(this.capitulo.id);
            this.input.setDefaultCursor('default');
            this.scene.launch('CapituloCompletadoScene', this.datos);
            this.scene.pause();
        });
    }

    // Enemigos (y la puerta) que pueden recibir daño de un ataque en área
    objetivosDanables() {
        const objetivos = this.enemigos.getChildren().filter(e => e.vivo && !e.reubicando);
        if (this.puerta?.vivo) objetivos.push(this.puerta);
        if (this.jefe?.vivo) objetivos.push(this.jefe);
        return objetivos;
    }

    // Con CURACION.probabilidad, el enemigo eliminado suelta una célula que salta y cae
    soltarCelula(enemigo) {
        if (Math.random() >= CURACION.probabilidad) return;
        const { x, y } = enemigo.body.center;
        const celula = this.celulas.create(x, y, 'celula-vida').setDepth(9).play('celula-vida-brillar');
        celula.body.setSize(6, 7).setBounce(0.3).setDrag(240, 0);
        celula.setVelocity(Phaser.Math.Between(-50, 50), -160);
        // Aviso parpadeando y desaparición (con el reloj de la escena: se detienen en la pausa)
        this.time.delayedCall(CURACION.aviso, () => {
            if (celula.active) this.tweens.add({ targets: celula, alpha: 0.2, duration: 120, yoyo: true, repeat: -1 });
        });
        this.time.delayedCall(CURACION.duracion, () => celula.active && celula.destroy());
    }

    // Solo se recoge si falta vida: con la vida al máximo se queda donde está
    recogerCelula(celula) {
        if (!celula.active || this.muerto || this.vida >= JUGADOR.vida) return;
        this.vida = Math.min(JUGADOR.vida, this.vida + CURACION.vida);
        this.actualizarHud();
        const celda = this.celdasVida[this.vida - 1];
        this.tweens.add({ targets: celda, alpha: 0.3, duration: 70, yoyo: true, repeat: 2 });
        this.tweens.killTweensOf(celula);
        celula.destroy();
        sonar(this, 'celula-recoger');
    }

    crearHud() {
        // Una celda por punto de vida máximo, fija a la cámara
        this.celdasVida = Array.from({ length: JUGADOR.vida }, (_, i) =>
            this.add.image(6 + i * 9, 6, 'hud-vida', FRAME_VIDA_LLENA)
                .setOrigin(0).setScrollFactor(0).setDepth(100)
        );

        // Carga del ataque especial (abajo a la derecha): icono apagado y, encima, el cargado
        // recortado desde abajo según el progreso de recarga
        const { width: w, height: h } = this.scale;
        const x = w - 6 - 16, y = h - 6 - 16;
        const hud = o => o.setOrigin(0).setScrollFactor(0).setDepth(100);
        const icono = this.arma.especial.icono;
        this.iconoEspecialFondo = hud(this.add.image(x, y, icono, FRAME_ICONO_VACIO));
        this.iconoEspecial = hud(this.add.image(x, y, icono, FRAME_ICONO_CARGADO));
        this.textoEspecial = hud(this.add.bitmapText(x - 8, y + 5, 'fuente', 'Q')).setTint(0x47c2c9);
        // Arma equipada: "1 PISTOLA", "2 ESPADA"... encima del icono
        this.textoArma = hud(this.add.bitmapText(w - 6, y - 11, 'fuente', '')).setOrigin(1, 0).setTint(0x667386);
        this.actualizarHudArma();
    }

    actualizarHudArma() {
        if (!this.textoArma) return;
        const icono = this.arma.especial.icono;
        this.iconoEspecialFondo.setTexture(icono, FRAME_ICONO_VACIO);
        this.iconoEspecial.setTexture(icono, FRAME_ICONO_CARGADO);
        this.textoArma.setText(`${this.armas.indexOf(this.armaId) + 1} ${this.arma.nombre}`);
        this.tweens.add({ targets: this.textoArma, alpha: { from: 0.2, to: 1 }, duration: 200 });
    }

    // Enfriamientos del arma equipada
    get listoEn() {
        return this.enfriamientos[this.armaId];
    }

    equiparArma(id) {
        if (!id || !this.armas.includes(id) || id === this.armaId || this.carga) return;   // espacio vacío: nada
        if (this.armaId) sonar(this, 'cambiar-arma');   // no al equipar la inicial
        this.armaId = id;
        this.arma = ARMAS[id];
        this.tajo = null;
        if (this.arma.sprite) this.armaEnMano.setTexture(this.arma.sprite, 0);
        this.armaEnMano.setVisible(!!this.arma.sprite);
        this.especialAvisado = true;
        this.actualizarHudArma();
    }

    // Coloca el arma de 'pose: mano' en el puño del jugador, rotada según hacia dónde apunta,
    // girando durante un tajo o en alto durante la carga
    colocarArma() {
        if (!this.armaEnMano.visible || !this.player.active) return;
        const lado = this.player.flipX ? -1 : 1;
        const pose = APUNTAR[this.poseVisible()];
        let relativo = pose.angulo;
        if (this.poseVisible() === 'reposo' && this.player.body.velocity.x !== 0 && this.player.body.blocked.down) {
            relativo += Math.sin(this.time.now / 90) * BALANCEO_REPOSO;
        }
        if (this.carga) relativo = ANGULO_CARGA;
        else if (this.tajo) {
            const p = Phaser.Math.Clamp((this.time.now - this.tajo.inicio) / this.tajo.duracion, 0, 1);
            relativo = (this.tajo.angulo ?? pose.angulo) + Phaser.Math.Linear(TAJO_DESDE, TAJO_HASTA, p);
            if (p >= 1) this.tajo = null;
        }
        // Mirando a la izquierda el ángulo se refleja; flipY mantiene el filo claro arriba
        const grados = lado > 0 ? relativo : 180 - relativo;
        this.armaEnMano
            .setPosition(this.player.x + pose.mano.x * lado, this.player.y + pose.mano.y)
            .setAngle(grados)
            .setFlipY(lado < 0)
            .setOrigin(2 / this.armaEnMano.width, 0.5);   // agarre en la empuñadura (columna 2, fila central)
    }

    // Pose del brazo que se dibuja: en alto durante la carga; con un arma en la mano, apuntando solo
    // mientras ataca y colgando en reposo el resto del tiempo
    poseVisible() {
        if (this.carga) return 'arriba';
        if (this.arma.pose === 'mano' && !this.tajo) return 'reposo';
        return this.apuntado;
    }

    actualizarHudEspecial(time) {
        const total = this.arma.especial.enfriamiento;
        const progreso = Phaser.Math.Clamp(1 - (this.listoEn.especial - time) / total, 0, 1);
        const alto = Math.round(16 * progreso);
        this.iconoEspecial.setCrop(0, 16 - alto, 16, alto);
        this.textoEspecial.setTint(progreso >= 1 ? 0x47c2c9 : 0x4b5768);

        // Destello breve al completar la carga
        if (progreso >= 1 && !this.especialAvisado) {
            this.especialAvisado = true;
            this.tweens.add({ targets: this.iconoEspecial, alpha: 0.3, duration: 60, yoyo: true, repeat: 1 });
        }
    }

    actualizarHud() {
        this.celdasVida.forEach((celda, i) => celda.setFrame(i < this.vida ? FRAME_VIDA_LLENA : FRAME_VIDA_VACIA));
    }

    // caida: daño por caída alta; ignora la invulnerabilidad y no tiene retroceso
    danarJugador(cantidad, origenX, caida = false) {
        if (this.muerto || this.victoria) return;
        if (!caida && (this.dash || this.time.now < this.invulnerableHasta)) return;

        this.vida = Math.max(0, this.vida - cantidad);
        this.actualizarHud();
        this.cameras.main.shake(120, 0.01);

        if (this.vida === 0) {
            this.morirJugador();
            return;
        }
        sonar(this, caida ? 'jugador-caida' : 'jugador-golpe');

        // Empujón alejándose del atacante
        if (!caida) {
            const dir = this.player.x < origenX ? -1 : 1;
            this.player.setVelocity(JUGADOR.retroceso.x * dir, JUGADOR.retroceso.y);
            this.controlBloqueadoHasta = this.time.now + 200;
        }

        // Invulnerabilidad: el sprite parpadea mientras dura
        this.invulnerableHasta = this.time.now + JUGADOR.invulnerabilidad;
        this.tweens.add({
            targets: this.player,
            alpha: 0.2,
            duration: 80,
            yoyo: true,
            repeat: Math.floor(JUGADOR.invulnerabilidad / 160) - 1,
            onComplete: () => this.player.setAlpha(1)
        });
    }

    morirJugador() {
        if (this.muerto) return;
        this.muerto = true;
        sonar(this, 'jugador-morir');
        this.cancelarCarga();
        this.terminarDash();
        this.vida = 0;
        this.actualizarHud();
        this.player.setTint(0xb3262a);
        this.player.anims.stop();
        this.time.removeAllEvents();   // deja de generar enemigos
        this.apagarMusica(600);
        this.cameras.main.stopFollow();

        // Breve pausa para ver la muerte; luego la pantalla de reintento encima de la escena congelada
        this.time.delayedCall(700, () => {
            this.scene.launch('GameOverScene', this.datos);
            this.scene.pause();
        });
    }

    // Cada aparición programa la siguiente con el intervalo vigente de su tipo
    programarAparicion(tipo) {
        this.time.delayedCall(this.intervalos[tipo], () => {
            this.aparecerEnemigo(tipo);
            this.programarAparicion(tipo);
        });
    }

    contarEliminado(tipo) {
        this.eliminados[tipo]++;
        if (this.eliminados[tipo] % this.aparicion.cadaMuertes === 0) {
            this.intervalos[tipo] = Math.max(this.aparicion.intervaloMinimo, this.intervalos[tipo] - this.aparicion.reduccion);
        }
    }

    // Punto de aparición para un tipo de enemigo: ni encima del jugador ni tan lejos que tarde una eternidad
    // en llegar. Con soloVisibles, solo puntos dentro de la vista de la cámara (o null si no hay ninguno).
    elegirPunto(tipo, soloVisibles = false) {
        // Los puntos de dentro de la sala del jefe solo se usan con la sala cerrada (y los de fuera, nunca entonces)
        const puntos = (this.puntosAparicion[ENEMIGOS[tipo].puntos] ?? [])
            .filter(p => !this.salaJefe || this.salaJefe.contains(p.x, p.y) === this.salaCerrada);
        const distancia = p => Phaser.Math.Distance.Between(p.x, p.y, this.player.x, this.player.y);
        // Vista de la cámara con un margen: puntos en el mismo borde de la pantalla también cuentan como visibles
        const vista = Phaser.Geom.Rectangle.Inflate(Phaser.Geom.Rectangle.Clone(this.cameras.main.worldView), MARGEN_VISTA, MARGEN_VISTA);
        const validos = puntos.filter(p => distancia(p) > this.aparicion.distanciaMin);

        if (soloVisibles) {
            const visibles = validos.filter(p => vista.contains(p.x, p.y));
            return visibles.length ? Phaser.Utils.Array.GetRandom(visibles) : null;
        }
        const cercanos = validos.filter(p => distancia(p) < this.aparicion.distanciaMax);
        if (cercanos.length) return Phaser.Utils.Array.GetRandom(cercanos);
        return validos.sort((a, b) => distancia(a) - distancia(b))[0] ?? puntos[0] ?? null;
    }

    // Enemigos vivos demasiado lejos del jugador: reaparecen en un punto visible de su tipo
    reubicarLejanos() {
        // En una emboscada no: podría llevar a un enemigo al otro lado de la compuerta
        if (this.muerto || this.salaCerrada || this.emboscada) return;
        for (const enemigo of this.enemigos.getChildren()) {
            if (!enemigo.vivo || enemigo.reubicando) continue;
            const d = Phaser.Math.Distance.Between(enemigo.x, enemigo.y, this.player.x, this.player.y);
            if (d <= this.aparicion.distanciaReubicar) continue;
            const p = this.elegirPunto(enemigo.tipo, true);
            if (p) enemigo.reubicar(p.x, p.y);
        }
    }

    // refuerzo: aparición del combate contra el jefe (en la sala, con su propio máximo)
    aparecerEnemigo(tipo, refuerzo = false) {
        // Con la sala cerrada solo aparecen los refuerzos del jefe; durante una emboscada, ninguno más
        if (this.salaCerrada !== refuerzo || this.victoria || this.emboscada) return;
        const maximo = refuerzo ? this.capitulo.jefe.refuerzos.maximo : this.aparicion.maximo;
        const vivos = this.enemigos.getChildren().filter(e => e.vivo).length;
        if (vivos >= maximo) return;

        const p = this.elegirPunto(tipo);
        if (p) this.crearEnemigo(tipo, p);
    }

    // Enemigo nuevo en el punto p (con un fundido de entrada)
    crearEnemigo(tipo, p) {
        const enemigo = new Enemigo(this, p.x, p.y, tipo, this.player);
        this.enemigos.add(enemigo);
        enemigo.configurarCuerpo();
        // Los de suelo aparecen con los pies sobre el punto (el borde inferior de su frame)
        if (enemigo.caminaPorSuelo) enemigo.y = p.y - enemigo.height / 2;
        enemigo.setAlpha(0);
        this.tweens.add({ targets: enemigo, alpha: 1, duration: 400 });
        return enemigo;
    }

    // Origen y dirección (vector unitario) del ataque según hacia dónde apunta y mira el jugador.
    // Con pistola sale de la boca del cañón; con un arma en la mano, del puño.
    // libre (opcional): dirección exacta (p. ej. hacia el cursor); el punto de salida es el de la pose más cercana
    origenDisparo(soloFrente = false, libre = null) {
        const lado = this.player.flipX ? -1 : 1;
        const apuntado = soloFrente ? 'frente' : libre ? this.poseCercana(libre) : this.apuntado;
        const pose = APUNTAR[apuntado];
        const punto = this.arma.pose === 'pistola' ? pose.boca : pose.mano;
        const direccion = soloFrente ? { x: lado, y: 0 }
            : libre ? libre
            : apuntado === 'frente' ? { x: lado, y: 0 }
            : apuntado === 'arriba' ? { x: 0, y: -1 }
            : { x: lado * Math.SQRT1_2, y: -Math.SQRT1_2 };
        return { x: this.player.x + punto.x * lado, y: this.player.y + punto.y, direccion };
    }

    // clave: 'ataque' o 'especial' del arma equipada · direccion (opcional): dirección libre, p. ej. hacia el cursor
    usarAtaque(clave, time, direccionLibre = null) {
        if (time < this.listoEn[clave] || this.carga) return;
        const ataque = this.arma[clave];

        if (ataque.tipo === 'carga') {
            // Sin tiempo de carga, el proyectil sale en el acto
            if (ataque.carga > 0) this.empezarCarga(ataque, time);
            else this.lanzarCargado(ataque, time);
            return;
        }

        const { x, y, direccion } = this.origenDisparo(ataque.soloFrente, direccionLibre);
        const hecho = ataque.tipo === 'proyectil' ? this.lanzarProyectil(ataque, x, y, direccion)
            : ataque.tipo === 'tajo' ? this.tajar(ataque, x, y, direccion, time)
            : this.estallido(ataque, x, y, direccion);
        if (!hecho) return;

        this.listoEn[clave] = time + ataque.enfriamiento;
        if (this.arma.pose === 'pistola') this.retrocesoHasta = time + (clave === 'especial' ? RETROCESO_ESPECIAL : RETROCESO);
        if (clave === 'especial') this.especialAvisado = false;
    }

    lanzarProyectil(ataque, x, y, direccion) {
        const bala = this.balas.get();
        if (!bala) return false;   // pool agotado
        bala.disparar(x, y, direccion, ataque);
        if (ataque.sprite) return true;   // los proyectiles con sprite propio no llevan fogonazo de pistola
        sonar(this, 'pistola-disparo');

        const destello = this.add.image(x + 3 * direccion.x, y + 3 * direccion.y, 'proyectil', FRAME_DESTELLO)
            .setRotation(Math.atan2(direccion.y, direccion.x)).setDepth(11);
        this.time.delayedCall(50, () => destello.destroy());
        return true;
    }

    // Distancia libre desde (x, y) en la dirección hasta el primer tile que bloquee de lado o por abajo
    // (las rejillas solo colisionan por arriba y no frenan)
    alcanceLibre(x, y, direccion, maximo) {
        for (let d = 0; d <= maximo; d += 4) {
            const tile = this.nivel.getTileAtWorldXY(x + d * direccion.x, y + d * direccion.y);
            if (tile && (tile.collideLeft || tile.collideRight || tile.collideDown)) return d;
        }
        return maximo;
    }

    // Daña a todos los enemigos dentro de una franja de 'ancho' px y 'alcance' px desde (x, y) en la dirección.
    // Un enemigo cuenta si su centro, proyectado sobre la dirección, cae dentro (con un margen de su tamaño).
    danarFranja(x, y, direccion, alcance, ancho, danio) {
        for (const enemigo of this.objetivosDanables()) {
            const b = enemigo.body;
            const rx = b.center.x - x, ry = b.center.y - y;
            const alo = rx * direccion.x + ry * direccion.y;
            const lateral = Math.abs(rx * direccion.y - ry * direccion.x);
            const margen = (b.halfWidth + b.halfHeight) / 2;
            if (alo > -margen && alo < alcance + margen && lateral < ancho / 2 + margen) {
                enemigo.recibirDanio(danio);
            }
        }
    }

    // Sprite de efecto con el borde izquierdo en (x, y), rotado hacia la dirección y recortado al alcance real
    efectoDireccional(clave, x, y, direccion, alcance, alcanceMaximo) {
        const fx = this.add.sprite(x, y, clave).setOrigin(0, 0.5)
            .setRotation(Math.atan2(direccion.y, direccion.x)).setDepth(11);
        if (alcance < alcanceMaximo) fx.setCrop(0, 0, alcance, fx.height);
        fx.play(`${clave}-disparo`);
        fx.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => fx.destroy());
        return fx;
    }

    // Pistola Q: impacto instantáneo en una franja desde el cañón que atraviesa a todos los enemigos
    estallido(ataque, x, y, direccion) {
        const alcance = this.alcanceLibre(x, y, direccion, ataque.alcance);
        this.danarFranja(x, y, direccion, alcance, ataque.ancho, ataque.danio);
        this.efectoDireccional(ataque.efecto, x, y, direccion, alcance, ataque.alcance);
        sonar(this, 'pistola-estallido');
        this.cameras.main.shake(80, 0.006);
        return true;
    }

    // Espada E: tajo cuerpo a cuerpo instantáneo que daña a todos los enemigos de la franja
    tajar(ataque, x, y, direccion, time) {
        const alcance = this.alcanceLibre(x, y, direccion, ataque.alcance);
        this.danarFranja(x, y, direccion, alcance, ataque.ancho, ataque.danio);
        const fx = this.efectoDireccional(ataque.efecto, x, y, direccion, alcance, ataque.alcance);
        sonar(this, 'espada-tajo');
        // Mirando a la izquierda la estela se refleja para que barra de arriba abajo, igual que el arma
        if (direccion.x < 0) fx.setFlipY(true);
        // Ángulo del tajo respecto a la horizontal hacia donde mira (negativo = hacia arriba)
        const angulo = Phaser.Math.RadToDeg(Math.atan2(direccion.y, Math.abs(direccion.x)));
        this.tajo = { inicio: time, duracion: ataque.duracion, angulo };
        return true;
    }

    // Espada Q: el jugador queda inmóvil cargando y al terminar lanza el proyectil al frente
    empezarCarga(ataque, time) {
        this.carga = {
            ataque,
            fin: time + ataque.carga,
            aura: this.add.sprite(this.player.x, this.player.y, ataque.aura).setDepth(12).play(`${ataque.aura}-cargar`)
        };
        this.armaEnMano.setFrame(FRAME_ARMA_CARGANDO);
        this.player.setVelocityX(0);
        // Destello en el arma y el aura que se acelera al final de la carga
        this.carga.parpadeo = this.tweens.add({ targets: this.carga.aura, alpha: 0.4, duration: 120, yoyo: true, repeat: -1 });
    }

    // Llamado cada update mientras hay carga: inmóvil y, al cumplirse el tiempo, lanzamiento
    actualizarCarga(time) {
        const carga = this.carga;
        this.player.setVelocityX(0);
        carga.aura.setPosition(this.player.x, this.player.y);
        if (time < carga.fin) return;

        this.cancelarCarga();
        this.lanzarCargado(carga.ataque, time);
    }

    // Lanza el proyectil de un ataque de carga (siempre al frente) y empieza su enfriamiento
    lanzarCargado(ataque, time) {
        const { x, y, direccion } = this.origenDisparo(true);
        this.lanzarProyectil(ataque.proyectil, x + 6 * direccion.x, y, direccion);
        sonar(this, 'espada-onda');
        this.listoEn.especial = time + ataque.enfriamiento;
        this.especialAvisado = false;
        this.tajo = { inicio: time, duracion: 150 };   // el arma baja de golpe al lanzar
        this.cameras.main.shake(100, 0.008);
    }

    // Dash: impulso horizontal sin gravedad hacia donde se pulsa (o hacia donde mira), invulnerable
    empezarDash(time, direccion, enAire) {
        const { distancia, duracion } = JUGADOR.dash;
        // fin: límite de seguridad (el doble de la duración) por si con pocos FPS no llega a recorrer la distancia
        this.dash = { direccion, desde: this.player.x, fin: time + duracion * 2, estela: 0 };
        if (enAire) this.dashEnAire = true;
        sonar(this, 'jugador-dash');
        this.player.flipX = direccion < 0;
        this.player.body.setAllowGravity(false);
        this.player.setVelocity(direccion * distancia / duracion * 1000, 0);
    }

    // Termina al recorrer la distancia, al chocar con un muro o al agotar su tiempo
    actualizarDash(time) {
        const dash = this.dash;
        const body = this.player.body;
        const recorrido = Math.abs(this.player.x - dash.desde);
        const choca = dash.direccion < 0 ? body.blocked.left : body.blocked.right;
        if (recorrido >= JUGADOR.dash.distancia || choca || time >= dash.fin) {
            // Sin pasarse de la distancia aunque el último frame haya avanzado de más
            if (recorrido > JUGADOR.dash.distancia && !choca) {
                body.reset(dash.desde + dash.direccion * JUGADOR.dash.distancia, this.player.y);
            }
            this.terminarDash();
            this.dashListo = time + JUGADOR.dash.enfriamiento;
            return;
        }
        this.player.setVelocityY(0);
        if (time >= dash.estela) {
            dash.estela = time + ESTELA_DASH;
            const sombra = this.add.image(this.player.x, this.player.y, 'jugador', this.player.frame.name)
                .setFlipX(this.player.flipX).setDepth(9).setAlpha(0.5)
                .setTint(0x47c2c9).setTintMode(Phaser.TintModes.FILL);
            this.tweens.add({ targets: sombra, alpha: 0, duration: 180, onComplete: () => sombra.destroy() });
        }
    }

    terminarDash() {
        if (!this.dash) return;
        this.dash = null;
        this.player.body.setAllowGravity(true);
        this.player.setVelocityX(0);
    }

    cancelarCarga() {
        if (!this.carga) return;
        this.carga.parpadeo.remove();
        this.carga.aura.destroy();
        this.carga = null;
        this.armaEnMano.setFrame(0);
    }

    // Colisiones según las propiedades definidas en arte/<tileset>.js (ver src/assets/sprites.json)
    aplicarPropiedades(mapa) {
        this.nivel.forEachTile(tile => {
            const ts = mapa.tilesets.find(t => t.containsTileIndex(tile.index));
            if (!ts) return;
            const props = sprites[ts.name]?.propiedades?.[tile.index - ts.firstgid];
            if (props?.solido) tile.setCollision(true);
            else if (props?.soloArriba) tile.setCollision(false, false, true, false);
        });
    }

    update() {
        // Reloj de la escena: se detiene durante la pausa (el 'time' del bucle del juego no)
        const time = this.time.now;
        if (this.muerto) return;

        // Caer al foso es muerte instantánea
        if (this.player.y > this.physics.world.bounds.height + this.player.height) {
            this.morirJugador();
            return;
        }

        // Caída alta: se mide desde el punto más alto alcanzado en el aire y, al aterrizar, si supera
        // JUGADOR.caida.altura quita JUGADOR.caida.danio. En la sala del jefe no cuenta (sus plataformas
        // están muy por encima del suelo).
        const enAire = !this.player.body.blocked.down;
        if (enAire) this.alturaAire = Math.min(this.alturaAire ?? this.player.y, this.player.y);
        const caida = this.alturaAire === null ? 0 : this.player.y - this.alturaAire;
        if (!enAire) this.alturaAire = null;
        if (!enAire && caida > JUGADOR.caida.altura && !this.enSalaJefe) {
            this.danarJugador(JUGADOR.caida.danio, this.player.x, true);
            if (this.muerto) return;
        }

        const { left, right, up, down, space } = this.cursors;
        const { W, A, S, D } = this.wasd;
        const izquierda = left.isDown || A.isDown;
        const derecha = right.isDown || D.isDown;
        const enSuelo = this.player.body.blocked.down;

        // Cargando el especial: inmóvil, sin saltar, atacar ni cambiar de arma (aunque reciba golpes)
        if (this.carga) {
            this.actualizarCarga(time);
            this.actualizarHudEspecial(time);
            this.actualizarAnimacion(time, enSuelo);
            return;
        }

        if (enSuelo) this.dashEnAire = false;
        if (!this.salaCerrada && this.salaJefe && this.player.x > this.salaJefe.x + ENTRADA_SALA && this.enSalaJefe) {
            this.cerrarSala();
        }
        this.comprobarEmboscadas();
        // Punto de control: se activa al llegar a la terminal (a su altura, no desde otro piso)
        if (this.terminal && !this.datos.control && this.player.x >= this.terminal.x - 8
            && Math.abs(this.player.body.bottom - this.terminal.y) < 16) {
            this.activarControl();
        }

        // Durante el dash no se controla nada más
        if (this.dash) {
            this.actualizarDash(time);
            this.actualizarHudEspecial(time);
            this.actualizarAnimacion(time, enSuelo);
            return;
        }

        // Tras un golpe, el retroceso manda unos instantes
        if (time < this.controlBloqueadoHasta) return;

        // Shift: dash hacia donde se pulsa o hacia donde mira (en el aire, solo uno por salto)
        const { SHIFT } = this.teclas;
        if (Phaser.Input.Keyboard.JustDown(SHIFT) && time >= this.dashListo && !(enAire && this.dashEnAire)) {
            this.empezarDash(time, izquierda ? -1 : derecha ? 1 : (this.player.flipX ? -1 : 1), enAire);
            this.actualizarAnimacion(time, enSuelo);
            return;
        }

        if (izquierda) {
            this.player.setVelocityX(-VELOCIDAD);
            this.player.flipX = true;
        } else if (derecha) {
            this.player.setVelocityX(VELOCIDAD);
            this.player.flipX = false;
        } else {
            this.player.setVelocityX(0);
        }

        // W/↑ apunta hacia arriba; si además camina, apunta en diagonal hacia donde mira
        const arriba = up.isDown || W.isDown;
        this.apuntado = !arriba ? 'frente' : (izquierda || derecha) ? 'diagonal' : 'arriba';
        // Tras un ataque con el ratón, el brazo se queda un instante en la pose de ese ataque
        if (!arriba && this.poseRaton && time < this.poseRaton.hasta) this.apuntado = this.poseRaton.pose;

        const JustDown = Phaser.Input.Keyboard.JustDown;
        if (JustDown(space) && enSuelo) {
            this.player.setVelocityY(SALTO);
            sonar(this, 'jugador-salto');
        }

        // Abajo (↓/S) sobre una rejilla: dejarse caer a través de ella
        if ((JustDown(down) || JustDown(S)) && enSuelo) {
            const bajo = this.nivel.getTileAtWorldXY(this.player.x, this.player.body.bottom + 1);
            if (bajo?.collideUp && !bajo.collideDown) this.atravesarHasta = time + ATRAVESAR;
        }

        const { E, L, Q, J, ONE, TWO, THREE } = this.teclas;
        [ONE, TWO, THREE].forEach((tecla, i) => { if (JustDown(tecla)) this.equiparArma(this.armas[i]); });
        // Con el ratón, el ataque sale hacia el cursor: el jugador se gira hacia ese lado y el brazo toma
        // la pose más cercana. Con el teclado se apunta con W/A/D.
        const puntero = this.input.activePointer;
        const clicIzquierdo = puntero.isDown && puntero.leftButtonDown();
        let haciaCursor = null;
        if (clicIzquierdo || this.especialPorClic) {
            haciaCursor = this.direccionRaton();
            if (haciaCursor.x !== 0) this.player.flipX = haciaCursor.x < 0;
            this.apuntado = this.poseCercana(haciaCursor);
            this.poseRaton = { pose: this.apuntado, hasta: time + POSE_RATON };
        }
        if (E.isDown || L.isDown) this.usarAtaque('ataque', time);
        else if (clicIzquierdo) this.usarAtaque('ataque', time, haciaCursor);
        if (JustDown(Q) || JustDown(J)) this.usarAtaque('especial', time);
        else if (this.especialPorClic) this.usarAtaque('especial', time, haciaCursor);
        this.especialPorClic = false;
        this.actualizarHudEspecial(time);
        this.actualizarAnimacion(time, enSuelo);
    }

    actualizarAnimacion(time, enSuelo) {
        const animacion = !enSuelo ? 'jugador-saltar'
            : this.player.body.velocity.x !== 0 ? 'jugador-correr'
            : 'jugador-quieto';
        this.player.play(animacion, true);

        // Pose del brazo según el arma y hacia dónde apunta (con pistola, +1 = retroceso tras disparar),
        // superpuesta al frame actual de cualquier animación
        const bloques = BLOQUES[this.arma.pose];
        const retroceso = bloques.retroceso && time < this.retrocesoHasta ? 1 : 0;
        const frame = Number(this.player.anims.currentFrame.textureFrame);
        this.player.setFrame(frame + (bloques[this.poseVisible()] + retroceso) * FRAMES_POR_BLOQUE);
    }
}
