// Codificador y decodificador WAV mínimo: PCM de 16 bits, mono. Sin dependencias.

export function codificarWAV(muestras, frecuencia) {
    const datos = muestras.length * 2;
    const b = Buffer.alloc(44 + datos);
    b.write('RIFF', 0);
    b.writeUInt32LE(36 + datos, 4);
    b.write('WAVE', 8);
    b.write('fmt ', 12);
    b.writeUInt32LE(16, 16);          // tamaño del bloque fmt
    b.writeUInt16LE(1, 20);           // PCM
    b.writeUInt16LE(1, 22);           // mono
    b.writeUInt32LE(frecuencia, 24);
    b.writeUInt32LE(frecuencia * 2, 28);
    b.writeUInt16LE(2, 32);
    b.writeUInt16LE(16, 34);
    b.write('data', 36);
    b.writeUInt32LE(datos, 40);
    for (let i = 0; i < muestras.length; i++) {
        const v = Math.max(-1, Math.min(1, muestras[i]));
        b.writeInt16LE(Math.round(v * 32767), 44 + i * 2);
    }
    return b;
}

// Solo lee lo que escribe codificarWAV (PCM 16 bits mono)
export function decodificarWAV(b) {
    if (b.toString('ascii', 0, 4) !== 'RIFF' || b.toString('ascii', 8, 12) !== 'WAVE') throw new Error('no es un WAV');
    let p = 12, frecuencia = 0, canales = 0, bits = 0;
    while (p < b.length) {
        const id = b.toString('ascii', p, p + 4), tam = b.readUInt32LE(p + 4);
        if (id === 'fmt ') {
            canales = b.readUInt16LE(p + 10);
            frecuencia = b.readUInt32LE(p + 12);
            bits = b.readUInt16LE(p + 22);
        } else if (id === 'data') {
            if (canales !== 1 || bits !== 16) throw new Error(`formato ${canales} canal(es), ${bits} bits: se esperaba mono de 16 bits`);
            const n = tam / 2, muestras = new Float32Array(n);
            for (let i = 0; i < n; i++) muestras[i] = b.readInt16LE(p + 8 + i * 2) / 32767;
            return { frecuencia, muestras };
        }
        p += 8 + tam + (tam % 2);
    }
    throw new Error('WAV sin bloque data');
}
