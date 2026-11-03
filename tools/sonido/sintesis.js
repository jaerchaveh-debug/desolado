// Sintetizador mínimo para crear los sonidos del juego con código (sonido/*.js → WAV).
// Una señal es un Float32Array de muestras entre -1 y 1 a FM muestras por segundo, mono.
// Todo es determinista: el azar sale de una semilla, así que cada sonido se regenera idéntico.
// Las funciones no modifican la señal que reciben: devuelven una nueva.

export const FM = 22050;

// Longitud en muestras (al menos 1) y posición en muestras de un instante
const muestras = seg => Math.max(1, Math.round(seg * FM));
const indice = seg => Math.round(seg * FM);
const valor = (v, t) => (typeof v === 'function' ? v(t) : v);

// ---- Azar y utilidades -------------------------------------------------------------

// Generador pseudoaleatorio (mulberry32): azar(semilla)() devuelve [0, 1)
export function azar(semilla = 1) {
    let a = semilla >>> 0;
    return () => {
        a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// Frecuencia (Hz) de una nota MIDI: 69 = La 440, 36 = Do grave
export const nota = midi => 440 * 2 ** ((midi - 69) / 12);

// Curva exponencial de 'desde' a 'hasta' en 'dur' segundos (para barridos de tono o de filtro)
export const rampa = (desde, hasta, dur) => t => desde * (hasta / desde) ** Math.min(1, t / dur);

// Oscilación lenta: base ± amplitud a 'hz' ciclos por segundo
export const lfo = (base, amplitud, hz, fase = 0) => t => base + amplitud * Math.sin(2 * Math.PI * hz * t + fase);

export const duracion = s => s.length / FM;

// ---- Fuentes -----------------------------------------------------------------------

export const silencio = seg => new Float32Array(muestras(seg));

// Ruido 'blanco' (siseo, chispas), 'rosa' (aire, vapor) o 'marron' (retumbo, maquinaria lejana)
export function ruido(seg, { color = 'blanco', semilla = 1 } = {}) {
    const r = azar(semilla), s = silencio(seg);
    let b0 = 0, b1 = 0, b2 = 0, marron = 0;
    for (let i = 0; i < s.length; i++) {
        const w = r() * 2 - 1;
        if (color === 'rosa') {
            b0 = 0.99765 * b0 + w * 0.0990460;
            b1 = 0.96300 * b1 + w * 0.2965164;
            b2 = 0.57000 * b2 + w * 1.0526913;
            s[i] = (b0 + b1 + b2 + w * 0.1848) * 0.2;
        } else if (color === 'marron') {
            marron = (marron + w * 0.02) * 0.998;
            s[i] = marron * 3.5;
        } else s[i] = w;
    }
    return s;
}

// Oscilador 'seno', 'sierra', 'cuadrada' o 'triangulo'. frecuencia: Hz o función del tiempo (s) → Hz
export function oscilador(seg, { forma = 'seno', frecuencia = 220, fase = 0, ancho = 0.5 } = {}) {
    const s = silencio(seg);
    let f = fase;
    for (let i = 0; i < s.length; i++) {
        const p = f - Math.floor(f);
        s[i] = forma === 'seno' ? Math.sin(2 * Math.PI * p)
            : forma === 'sierra' ? 2 * p - 1
            : forma === 'cuadrada' ? (p < ancho ? 1 : -1)
            : 1 - 4 * Math.abs(p - 0.5);
        f += valor(frecuencia, i / FM) / FM;
    }
    return s;
}

// Golpe metálico por síntesis modal: suma de modos de una placa (relaciones inarmónicas) que se
// apagan a ritmos distintos. frecuencia: modo fundamental · decaimiento: segundos del modo grave ·
// brillo (0-1): peso de los modos agudos · semilla: pequeña desafinación de cada modo.
const MODOS_PLACA = [1, 1.594, 2.136, 2.296, 2.653, 2.918, 3.156, 3.501, 3.6, 4.06, 4.15, 4.6];
export function metal(seg, { frecuencia = 300, decaimiento = 0.8, brillo = 0.5, modos = 8, semilla = 1 } = {}) {
    const r = azar(semilla), s = silencio(seg);
    for (let k = 0; k < Math.min(modos, MODOS_PLACA.length); k++) {
        const f = frecuencia * MODOS_PLACA[k] * (1 + (r() - 0.5) * 0.02);
        if (f >= FM / 2) continue;
        const amp = brillo ** (k * 0.5) / (1 + k * 0.3);
        const tau = decaimiento / (1 + k * 0.45);
        const fase = r() * Math.PI * 2;
        for (let i = 0; i < s.length; i++) {
            const t = i / FM;
            s[i] += amp * Math.exp(-t / tau) * Math.sin(2 * Math.PI * f * t + fase);
        }
    }
    return normalizar(s, 0.9);
}

// ---- Forma en el tiempo ----------------------------------------------------------------

// Multiplica por una envolvente de puntos [[segundos, nivel], ...] con interpolación lineal.
// Antes del primer punto vale su nivel; después del último, el del último.
export function envolvente(s, puntos) {
    const o = new Float32Array(s.length);
    let k = 0;
    for (let i = 0; i < s.length; i++) {
        const t = i / FM;
        while (k < puntos.length - 1 && t > puntos[k + 1][0]) k++;
        const [t0, v0] = puntos[k], [t1, v1] = puntos[Math.min(k + 1, puntos.length - 1)];
        const g = t <= t0 ? v0 : t1 === t0 ? v1 : v0 + (v1 - v0) * Math.min(1, (t - t0) / (t1 - t0));
        o[i] = s[i] * g;
    }
    return o;
}

// Ataque lineal de 'ataque' s y caída exponencial con constante 'tau' s (golpes, disparos)
export function golpe(s, { ataque = 0.002, tau = 0.1 } = {}) {
    const o = new Float32Array(s.length);
    for (let i = 0; i < s.length; i++) {
        const t = i / FM;
        o[i] = s[i] * (t < ataque ? t / ataque : Math.exp(-(t - ataque) / tau));
    }
    return o;
}

export function ganancia(s, g) {
    return s.map((v, i) => v * valor(g, i / FM));
}

// Escala para que el pico valga 'pico'
export function normalizar(s, pico = 0.9) {
    let m = 0;
    for (const v of s) m = Math.max(m, Math.abs(v));
    return m > 0 ? s.map(v => (v / m) * pico) : s.slice();
}

// Fundidos lineales de entrada y salida (s), para evitar chasquidos
export function fundido(s, entrada = 0.005, salida = 0.01) {
    const ne = muestras(entrada), ns = muestras(salida);
    return s.map((v, i) => v * Math.min(1, i / ne, (s.length - 1 - i) / ns));
}

export function recortar(s, desde, hasta = duracion(s)) {
    return s.slice(indice(desde), indice(hasta));
}

export function unir(...señales) {
    const o = silencio(señales.reduce((a, s) => a + s.length, 0) / FM);
    let p = 0;
    for (const s of señales) { o.set(s, p); p += s.length; }
    return o;
}

// Suma pistas [señal, ganancia = 1, inicio en s = 0]. Dura lo que la más larga (o 'seg' si se indica).
export function mezclar(pistas, seg = null) {
    const fin = seg ?? Math.max(...pistas.map(([s, , inicio = 0]) => inicio + duracion(s)));
    const o = silencio(fin);
    for (const [s, g = 1, inicio = 0] of pistas) {
        const p = indice(inicio);
        for (let i = 0; i < s.length && p + i < o.length; i++) if (p + i >= 0) o[p + i] += s[i] * g;
    }
    return o;
}

// Para bucles: suma lo que sobra después de 'seg' al principio (colas de eco y reverberación
// incluidas), de modo que el final empalma con el inicio sin corte.
export function plegar(s, seg) {
    const n = muestras(seg), o = new Float32Array(n);
    for (let i = 0; i < s.length; i++) o[i % n] += s[i];
    return o;
}

// Para bucles de capas continuas (drones, ruido de fondo): la señal debe durar al menos seg + solape.
// El tramo que sobra tras 'seg' se funde (potencia constante) con el inicio, de modo que el final
// enlaza con el principio. Para capas de eventos sueltos con colas, mejor plegar().
export function bucleCruzado(s, seg, solape = 1) {
    const n = muestras(seg), m = muestras(solape);
    if (s.length < n + m) throw new Error(`bucleCruzado: la señal dura ${duracion(s).toFixed(2)} s, hacen falta ${seg + solape} s`);
    const o = s.slice(0, n);
    for (let i = 0; i < m; i++) {
        const a = i / m;
        o[i] = s[i] * Math.sin(a * Math.PI / 2) + s[n + i] * Math.cos(a * Math.PI / 2);
    }
    return o;
}

// Aplica un proceso con memoria (filtros, eco) a un bucle ya cerrado sin romper el empalme: lo
// procesa repetido dos veces y se queda con la segunda vuelta, cuyo inicio ya "viene" del final.
export function enBucle(s, proceso) {
    return proceso(unir(s, s)).slice(s.length, 2 * s.length);
}

// Tono variable: lee la señal a velocidad 'factor' (número o función del tiempo). <1 más grave y largo
export function velocidad(s, factor) {
    const o = [];
    for (let p = 0, i = 0; p < s.length - 1; i++) {
        const k = Math.floor(p), f = p - k;
        o.push(s[k] * (1 - f) + s[k + 1] * f);
        p += valor(factor, i / FM);
    }
    return Float32Array.from(o);
}

// ---- Filtros y color --------------------------------------------------------------------

// Biquad (RBJ). tipo: 'bajo', 'alto', 'banda'. corte: Hz o función del tiempo. q: resonancia.
export function filtro(s, tipo, corte, q = 0.707) {
    const o = new Float32Array(s.length);
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0, b0, b1, b2, a1, a2;
    const coeficientes = f => {
        const w = 2 * Math.PI * Math.min(Math.max(f, 10), FM * 0.45) / FM;
        const c = Math.cos(w), al = Math.sin(w) / (2 * q);
        const a0 = 1 + al;
        if (tipo === 'bajo') { b0 = (1 - c) / 2; b1 = 1 - c; b2 = (1 - c) / 2; }
        else if (tipo === 'alto') { b0 = (1 + c) / 2; b1 = -(1 + c); b2 = (1 + c) / 2; }
        else { b0 = al; b1 = 0; b2 = -al; }
        b0 /= a0; b1 /= a0; b2 /= a0; a1 = -2 * c / a0; a2 = (1 - al) / a0;
    };
    const variable = typeof corte === 'function';
    coeficientes(valor(corte, 0));
    for (let i = 0; i < s.length; i++) {
        if (variable && i % 16 === 0) coeficientes(corte(i / FM));
        const y = b0 * s[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
        x2 = x1; x1 = s[i]; y2 = y1; y1 = y;
        o[i] = y;
    }
    return o;
}
export const pasoBajo = (s, corte, q) => filtro(s, 'bajo', corte, q);
export const pasoAlto = (s, corte, q) => filtro(s, 'alto', corte, q);
export const pasoBanda = (s, corte, q) => filtro(s, 'banda', corte, q);

// Saturación suave (tanh): más 'empuje' = más distorsión y armónicos
export function saturar(s, empuje = 3) {
    const k = Math.tanh(empuje);
    return s.map(v => Math.tanh(v * empuje) / k);
}

// Degradación digital: reduce bits y repite cada muestra 'paso' veces (sonido de máquina vieja)
export function triturar(s, bits = 6, paso = 2) {
    const niveles = 2 ** (bits - 1);
    const o = new Float32Array(s.length);
    for (let i = 0; i < s.length; i++) {
        const v = s[i - (i % paso)];
        o[i] = Math.round(v * niveles) / niveles;
    }
    return o;
}

// Resonador de peine: hace "sonar" la señal a una frecuencia, como un tubo o una cavidad metálica
export function resonador(s, frecuencia, realimentacion = 0.9, cola = 0.5) {
    const d = Math.max(1, Math.round(FM / frecuencia));
    const o = new Float32Array(s.length + muestras(cola));
    for (let i = 0; i < o.length; i++) o[i] = (s[i] ?? 0) + (i >= d ? o[i - d] * realimentacion : 0);
    return o;
}

// ---- Espacio ------------------------------------------------------------------------

// Eco: repeticiones cada 'retardo' s, cada vez más bajas y más oscuras (corte del filtro del lazo).
// La señal se alarga 'cola' s para que quepan.
export function eco(s, { retardo = 0.3, realimentacion = 0.45, mezcla = 0.4, cola = 2, corte = 2500 } = {}) {
    const d = muestras(retardo), n = s.length + muestras(cola);
    const linea = new Float32Array(n), o = new Float32Array(n);
    const k = Math.exp(-2 * Math.PI * corte / FM);
    let lp = 0;
    for (let i = 0; i < n; i++) {
        const x = s[i] ?? 0;
        const retardada = i >= d ? linea[i - d] : 0;
        lp = (1 - k) * retardada + k * lp;
        linea[i] = x + lp * realimentacion;
        o[i] = x + lp * mezcla;
    }
    return o;
}

// Reverberación (Freeverb simplificado: 8 peines + 4 pasatodo). tamano 0-1: de sala a nave inmensa.
// amortiguacion 0-1: cuánto se apagan los agudos en la cola. La señal se alarga 'cola' s.
const PEINES = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617];
const PASATODO = [556, 441, 341, 225];
export function reverb(s, { tamano = 0.8, amortiguacion = 0.4, mezcla = 0.35, cola = 3 } = {}) {
    const escala = FM / 44100;
    const n = s.length + muestras(cola);
    const humedo = new Float32Array(n);
    const fb = 0.7 + tamano * 0.28;
    for (const largo of PEINES) {
        const d = Math.round(largo * escala * (0.6 + tamano * 0.8));
        const buf = new Float32Array(d);
        let p = 0, lp = 0;
        for (let i = 0; i < n; i++) {
            const y = buf[p];
            lp = y * (1 - amortiguacion) + lp * amortiguacion;
            buf[p] = (s[i] ?? 0) * 0.015 + lp * fb;
            humedo[i] += y;
            p = (p + 1) % d;
        }
    }
    for (const largo of PASATODO) {
        const d = Math.round(largo * escala);
        const buf = new Float32Array(d);
        let p = 0;
        for (let i = 0; i < n; i++) {
            const b = buf[p], x = humedo[i];
            humedo[i] = -x + b;
            buf[p] = x + b * 0.5;
            p = (p + 1) % d;
        }
    }
    const o = new Float32Array(n);
    for (let i = 0; i < n; i++) o[i] = (s[i] ?? 0) * (1 - mezcla) + humedo[i] * mezcla * 3;
    return o;
}
