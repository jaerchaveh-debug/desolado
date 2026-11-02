// Codificador/decodificador PNG mínimo, sin dependencias (solo zlib de Node).
// Soporta lo necesario para el proyecto: 8 bits por canal, sin entrelazado,
// tipos de color RGB (2), RGBA (6), escala de grises (0, 4) e indexado (3).

import zlib from 'node:zlib';

const FIRMA = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

const TABLA_CRC = new Uint32Array(256).map((_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
});

function crc32(buf) {
    let c = 0xffffffff;
    for (const b of buf) c = TABLA_CRC[(c ^ b) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
}

function chunk(tipo, datos) {
    const largo = Buffer.alloc(4);
    largo.writeUInt32BE(datos.length);
    const cuerpo = Buffer.concat([Buffer.from(tipo, 'ascii'), datos]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(cuerpo));
    return Buffer.concat([largo, cuerpo, crc]);
}

// rgba: Uint8Array de ancho * alto * 4
export function codificarPNG(ancho, alto, rgba) {
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(ancho, 0);
    ihdr.writeUInt32BE(alto, 4);
    ihdr[8] = 8;  // bits por canal
    ihdr[9] = 6;  // RGBA

    const fila = ancho * 4;
    const crudo = Buffer.alloc((fila + 1) * alto);
    for (let y = 0; y < alto; y++) {
        crudo[y * (fila + 1)] = 0; // filtro "None"
        Buffer.from(rgba.buffer, rgba.byteOffset + y * fila, fila).copy(crudo, y * (fila + 1) + 1);
    }

    return Buffer.concat([
        FIRMA,
        chunk('IHDR', ihdr),
        chunk('IDAT', zlib.deflateSync(crudo, { level: 9 })),
        chunk('IEND', Buffer.alloc(0))
    ]);
}

function paeth(a, b, c) {
    const p = a + b - c;
    const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
    return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}

// Devuelve { ancho, alto, rgba } siempre en RGBA de 8 bits
export function decodificarPNG(buf) {
    if (!buf.subarray(0, 8).equals(FIRMA)) throw new Error('No es un PNG');

    let pos = 8, ancho, alto, profundidad, tipoColor, entrelazado;
    let paleta = null, transparencia = null;
    const idat = [];

    while (pos < buf.length) {
        const largo = buf.readUInt32BE(pos);
        const tipo = buf.toString('ascii', pos + 4, pos + 8);
        const datos = buf.subarray(pos + 8, pos + 8 + largo);
        pos += 12 + largo;

        if (tipo === 'IHDR') {
            ancho = datos.readUInt32BE(0);
            alto = datos.readUInt32BE(4);
            profundidad = datos[8];
            tipoColor = datos[9];
            entrelazado = datos[12];
        } else if (tipo === 'PLTE') paleta = datos;
        else if (tipo === 'tRNS') transparencia = datos;
        else if (tipo === 'IDAT') idat.push(datos);
        else if (tipo === 'IEND') break;
    }

    if (profundidad !== 8 || entrelazado !== 0) {
        throw new Error(`PNG no soportado (profundidad ${profundidad}, entrelazado ${entrelazado})`);
    }

    const canales = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[tipoColor];
    const fila = ancho * canales;
    const crudo = zlib.inflateSync(Buffer.concat(idat));
    const px = Buffer.alloc(fila * alto);

    for (let y = 0; y < alto; y++) {
        const filtro = crudo[y * (fila + 1)];
        const src = crudo.subarray(y * (fila + 1) + 1, (y + 1) * (fila + 1));
        const dst = px.subarray(y * fila, (y + 1) * fila);
        const prev = y > 0 ? px.subarray((y - 1) * fila, y * fila) : null;
        for (let i = 0; i < fila; i++) {
            const a = i >= canales ? dst[i - canales] : 0;
            const b = prev ? prev[i] : 0;
            const c = prev && i >= canales ? prev[i - canales] : 0;
            const v = src[i];
            dst[i] = filtro === 0 ? v
                : filtro === 1 ? v + a
                : filtro === 2 ? v + b
                : filtro === 3 ? v + ((a + b) >> 1)
                : v + paeth(a, b, c);
        }
    }

    const rgba = new Uint8Array(ancho * alto * 4);
    for (let i = 0; i < ancho * alto; i++) {
        const o = i * 4, s = i * canales;
        if (tipoColor === 6) px.copy(rgba, o, s, s + 4);
        else if (tipoColor === 2) { px.copy(rgba, o, s, s + 3); rgba[o + 3] = 255; }
        else if (tipoColor === 0) { rgba.fill(px[s], o, o + 3); rgba[o + 3] = 255; }
        else if (tipoColor === 4) { rgba.fill(px[s], o, o + 3); rgba[o + 3] = px[s + 1]; }
        else if (tipoColor === 3) {
            const k = px[s];
            paleta.copy(rgba, o, k * 3, k * 3 + 3);
            rgba[o + 3] = transparencia && k < transparencia.length ? transparencia[k] : 255;
        }
    }

    return { ancho, alto, rgba };
}
