import { defineConfig } from 'vite';

// base relativa: el build funciona igual en la raíz de un dominio que en una subcarpeta
// (GitHub Pages sirve el juego en /desolado/). Los recursos se cargan con rutas relativas (assets/...).
export default defineConfig({
    base: './'
});
