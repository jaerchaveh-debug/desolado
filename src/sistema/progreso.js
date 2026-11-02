// Progreso del jugador guardado en el navegador (localStorage).
// Si el almacenamiento no está disponible (modo privado, bloqueado), el juego funciona igual
// pero el progreso solo dura la sesión.

import CAPITULOS from '../capitulos';

const CLAVE = 'desolado:progreso';

const INICIAL = () => ({
    desbloqueados: [CAPITULOS[0].id],
    ultimo: CAPITULOS[0].id
});

let enMemoria = null;

function leer() {
    if (enMemoria) return enMemoria;
    try {
        const guardado = JSON.parse(localStorage.getItem(CLAVE));
        enMemoria = guardado?.desbloqueados?.length ? guardado : INICIAL();
    } catch {
        enMemoria = INICIAL();
    }
    return enMemoria;
}

function guardar() {
    try {
        localStorage.setItem(CLAVE, JSON.stringify(enMemoria));
    } catch {
        // sin almacenamiento: el progreso se mantiene solo en memoria
    }
}

export function estaDesbloqueado(id) {
    return leer().desbloqueados.includes(id);
}

// Capítulo con el que empieza "Continuar": el último jugado, si sigue disponible
export function capituloParaContinuar() {
    const { ultimo } = leer();
    const c = CAPITULOS.find(c => c.id === ultimo && c.disponible && estaDesbloqueado(c.id));
    return c ?? CAPITULOS[0];
}

export function registrarInicio(id) {
    leer().ultimo = id;
    guardar();
}

// Marca un capítulo como completado y desbloquea el siguiente
export function completarCapitulo(id) {
    const progreso = leer();
    const i = CAPITULOS.findIndex(c => c.id === id);
    const siguiente = CAPITULOS[i + 1];
    if (siguiente && !progreso.desbloqueados.includes(siguiente.id)) {
        progreso.desbloqueados.push(siguiente.id);
        if (siguiente.disponible) progreso.ultimo = siguiente.id;
    }
    guardar();
}
