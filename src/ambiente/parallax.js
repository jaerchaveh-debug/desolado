import Phaser from 'phaser';

// Fondo parallax de la megaestructura, común a GameScene y al fondo de los menús.
// Cada capa es un TileSprite del tamaño de la pantalla, fijo a la cámara, cuyo patrón se desplaza
// una fracción ('factor') del scroll de la cámara: cuanto menor, más lejos parece.
// Solo se ve donde el nivel no tiene tiles (pasillo superior, ventanales del pozo).
export const CAPAS_PARALLAX = [
    { clave: 'fondo-lejano', factor: 0.15, depth: -40 },
    { clave: 'fondo-medio', factor: 0.4, depth: -30 }
];

export function crearParallax(scene) {
    const { width, height } = scene.scale;
    const cam = scene.cameras.main;
    const capas = CAPAS_PARALLAX.map(c => ({
        ...c,
        sprite: scene.add.tileSprite(0, 0, width, height, c.clave).setOrigin(0).setScrollFactor(0).setDepth(c.depth)
    }));
    // Antes de dibujar (después del update y de la física), con posiciones enteras para no emborronar el pixel art
    const desplazar = () => {
        for (const { sprite, factor } of capas) {
            sprite.tilePositionX = Math.round(cam.scrollX * factor);
            sprite.tilePositionY = Math.round(cam.scrollY * factor);
        }
    };
    scene.events.on(Phaser.Scenes.Events.PRE_RENDER, desplazar);
    // Los listeners de scene.events sobreviven a scene.restart: se retiran al cerrar la escena
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => scene.events.off(Phaser.Scenes.Events.PRE_RENDER, desplazar));
    desplazar();
    return capas;
}
