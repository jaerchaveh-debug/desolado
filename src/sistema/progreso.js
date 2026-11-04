// Progreso del jugador guardado en el navegador (localStorage).
// Si el almacenamiento no está disponible (modo privado, bloqueado), el juego funciona igual
// pero el progreso solo dura la sesión.

import CAPITULOS from '../capitulos';
import { ARMAS, ARMAS_INICIALES, ESPACIOS_ARMAS } from '../config/combate';

const CLAVE = 'desolado:progreso';

// Espacios de armas 1, 2, 3 (id del arma o null): por defecto, las iniciales en orden
const EQUIPAMIENTO_INICIAL = () => Array.from({ length: ESPACIOS_ARMAS }, (_, i) => ARMAS_INICIALES[i] ?? null);

const INICIAL = () => ({
    desbloqueados: [CAPITULOS[0].id],
    ultimo: CAPITULOS[0].id,
    equipamiento: EQUIPAMIENTO_INICIAL()
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

// Armas que el jugador puede equipar (de momento, todas las iniciales)
export function armasObtenidas() {
    return [...ARMAS_INICIALES];
}

// Espacios de armas guardados. Si no hay (progreso antiguo) o no son válidos o están todos
// vacíos, los de por defecto: la partida siempre empieza con al menos un arma.
export function equipamiento() {
    const e = leer().equipamiento;
    const valido = Array.isArray(e) && e.length === ESPACIOS_ARMAS
        && e.every(id => id === null || (ARMAS[id] && armasObtenidas().includes(id))) && e.some(Boolean);
    return valido ? [...e] : EQUIPAMIENTO_INICIAL();
}

export function guardarEquipamiento(espacios) {
    leer().equipamiento = [...espacios];
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
