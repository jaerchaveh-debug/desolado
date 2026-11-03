// Visor en vivo del arte: regenera al guardar y muestra hojas y animaciones.
//
//   npm run arte:ver            -> todos los sprites en http://localhost:4321
//   npm run arte:ver jugador    -> solo arte/jugador.js
//
// Vigila arte/*.js, tools/pixel/ y src/config/ (hay arte que lee la configuración
// de combate). Al cambiar un archivo de arte/ regenera ese; si cambia otro, todos.
// La página se recarga sola y muestra los errores de generación.

import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { spawn } from 'node:child_process';

const RAIZ = path.resolve(import.meta.dirname, '../..');
const DIR_ARTE = path.join(RAIZ, 'arte');
const DIR_SPRITES = path.join(RAIZ, 'public/assets/sprites');
const MANIFIESTO = path.join(RAIZ, 'src/assets/sprites.json');
const VIGILADOS = [DIR_ARTE, path.join(RAIZ, 'tools/pixel'), path.join(RAIZ, 'src/config')];
const PUERTO = Number(process.env.PUERTO ?? 4321);
const filtro = process.argv[2];

let version = 0;
let errores = '';
let generando = null;
let pendiente = null;   // null: nada; un nombre; o true: todo

// Ejecuta generar.js en un proceso aparte: los import de ESM se quedan en caché
function generar(nombre) {
    if (generando) {
        pendiente = pendiente === null ? (nombre ?? true) : (pendiente === nombre ? nombre : true);
        return;
    }
    const args = [path.join(RAIZ, 'tools/pixel/generar.js')];
    if (nombre) args.push(nombre);
    let salida = '';
    generando = spawn(process.execPath, args, { cwd: RAIZ });
    generando.stdout.on('data', d => { salida += d; process.stdout.write(d); });
    generando.stderr.on('data', d => { salida += d; process.stderr.write(d); });
    generando.on('close', codigo => {
        errores = codigo ? salida.split('\n').filter(l => l.startsWith('✗')).join('\n') || salida : '';
        version++;
        generando = null;
        if (pendiente !== null) {
            const n = pendiente === true ? filtro : pendiente;
            pendiente = null;
            generar(n);
        }
    });
}

let temporizador = null;
function alCambiar(dir, archivo) {
    if (!archivo || !archivo.endsWith('.js')) return;
    const nombre = dir === DIR_ARTE ? path.basename(archivo, '.js') : undefined;
    if (filtro && nombre && nombre !== filtro) return;
    clearTimeout(temporizador);
    temporizador = setTimeout(() => generar(nombre ?? filtro), 120);
}
VIGILADOS.forEach(dir => fs.watch(dir, (_, archivo) => alCambiar(dir, archivo)));

const PAGINA = `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><title>Arte - visor</title>
<style>
  body { background: #1e1f24; color: #b4bfcc; font: 13px monospace; margin: 16px; }
  h2 { font-size: 14px; color: #e4eaf0; margin: 24px 0 6px; }
  .info { color: #667386; }
  #errores { color: #ff6b6b; white-space: pre-wrap; }
  canvas { image-rendering: pixelated; margin: 4px 12px 4px 0; vertical-align: top; }
  label { margin-left: 12px; }
  .anim { display: inline-block; text-align: center; }
</style></head><body>
<div>Escala <select id="escala"><option>2</option><option>3</option><option selected>4</option><option>6</option><option>8</option></select>
<label>Fondo <select id="fondo"><option value="#3a3a40">neutro</option><option value="#07080b">juego (0)</option><option value="#262d39">muro (3)</option></select></label>
<span class="info" id="estado"></span></div>
<div id="errores"></div><div id="sprites"></div>
<script>
const filtro = ${JSON.stringify(filtro ?? null)};
let version = -1, temporizadores = [];
const $ = id => document.getElementById(id);
$('escala').onchange = $('fondo').onchange = () => { version = -1; };

function lienzo(w, h, escala) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  c.style.width = w * escala + 'px'; c.style.height = h * escala + 'px';
  c.style.background = $('fondo').value;
  return c;
}

async function pintar(v) {
  temporizadores.forEach(clearInterval); temporizadores = [];
  const manifiesto = await (await fetch('/manifiesto?' + v)).json();
  const escala = Number($('escala').value);
  const raiz = $('sprites'); raiz.innerHTML = '';
  for (const [nombre, d] of Object.entries(manifiesto)) {
    if (filtro && nombre !== filtro) continue;
    const img = new Image(); img.src = '/sprites/' + nombre + '.png?' + v;
    await img.decode().catch(() => {});
    const sec = document.createElement('div');
    sec.innerHTML = '<h2>' + nombre + ' <span class="info">' + d.ancho + 'x' + d.alto + ' · ' + d.frames + ' frame(s) · ' + d.tipo + '</span></h2>';
    // Cada frame numerado con su índice
    for (let i = 0; i < d.frames; i++) {
      const caja = document.createElement('div'); caja.className = 'anim';
      const c = lienzo(d.ancho, d.alto, escala);
      c.getContext('2d').drawImage(img, i * d.ancho, 0, d.ancho, d.alto, 0, 0, d.ancho, d.alto);
      caja.appendChild(c);
      caja.appendChild(Object.assign(document.createElement('div'), { className: 'info', textContent: i }));
      sec.appendChild(caja);
    }
    sec.appendChild(Object.assign(document.createElement('div'), { className: 'info', textContent: 'animaciones:' }));
    // Animaciones en bucle a su fps (las de una sola pasada se quedan 1 s en el último frame)
    for (const [anim, a] of Object.entries(d.animaciones ?? {})) {
      const caja = document.createElement('div'); caja.className = 'anim';
      const c = lienzo(d.ancho, d.alto, escala), cx = c.getContext('2d');
      const fps = a.fps || 8;
      let paso = 0;
      const dibujar = () => {
        const f = a.frames[Math.min(paso, a.frames.length - 1)];
        cx.clearRect(0, 0, d.ancho, d.alto);
        cx.drawImage(img, f * d.ancho, 0, d.ancho, d.alto, 0, 0, d.ancho, d.alto);
        paso++;
        if (paso >= a.frames.length + (a.repetir === 0 ? fps : 0)) paso = 0;
      };
      dibujar();
      temporizadores.push(setInterval(dibujar, 1000 / fps));
      caja.appendChild(c);
      caja.appendChild(Object.assign(document.createElement('div'), { className: 'info', textContent: anim + ' ' + fps + 'fps' }));
      sec.appendChild(caja);
    }
    raiz.appendChild(sec);
  }
}

async function comprobar() {
  try {
    const e = await (await fetch('/estado')).json();
    $('estado').textContent = '  generación ' + e.version;
    $('errores').textContent = e.errores;
    if (e.version !== version) { version = e.version; await pintar(e.version); }
  } catch { $('estado').textContent = '  (visor detenido)'; }
  setTimeout(comprobar, 400);
}
comprobar();
</script></body></html>`;

http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const enviar = (tipo, cuerpo) => { res.writeHead(200, { 'Content-Type': tipo, 'Cache-Control': 'no-store' }); res.end(cuerpo); };
    if (url.pathname === '/') return enviar('text/html; charset=utf-8', PAGINA);
    if (url.pathname === '/estado') return enviar('application/json', JSON.stringify({ version, errores }));
    if (url.pathname === '/manifiesto') return enviar('application/json', fs.readFileSync(MANIFIESTO));
    const png = url.pathname.match(/^\/sprites\/([\w-]+\.png)$/);
    if (png && fs.existsSync(path.join(DIR_SPRITES, png[1]))) return enviar('image/png', fs.readFileSync(path.join(DIR_SPRITES, png[1])));
    res.writeHead(404).end();
}).listen(PUERTO, () => {
    console.log(`Visor de arte en http://localhost:${PUERTO}${filtro ? ` (solo ${filtro})` : ''}`);
    generar(filtro);
});
