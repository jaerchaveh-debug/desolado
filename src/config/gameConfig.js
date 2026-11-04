import Phaser from 'phaser';

//import BootScene from '../scenes/BootScene';
import PreloadScene from '../scenes/PreloadScene';
import FondoMenuScene from '../scenes/FondoMenuScene';
import MenuScene from '../scenes/MenuScene';
import CapitulosScene from '../scenes/CapitulosScene';
import ControlesScene from '../scenes/ControlesScene';
import EquipamientoScene from '../scenes/EquipamientoScene';
import GameScene from '../scenes/GameScene';
import GameOverScene from '../scenes/GameOverScene';
import PauseScene from '../scenes/PauseScene';
import CapituloCompletadoScene from '../scenes/CapituloCompletadoScene';
import DialogoScene from '../scenes/DialogoScene';

export default {

    type: Phaser.AUTO,
    parent: 'game',

    // Resolución base del pixel art: escala x4 exacta a 1080p
    width: 480,
    height: 270,

    // Filtrado nearest y posiciones enteras (también activa roundPixels)
    pixelArt: true,

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },

    backgroundColor: '#07080b',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 900
            },
            debug: false
        }
    },
    fps: {
        target: 60,
        forceSetTimeOut: true
    },
    scene: [
        //BootScene,
        PreloadScene,
        FondoMenuScene,
        MenuScene,
        CapitulosScene,
        ControlesScene,
        EquipamientoScene,
        GameScene,
        GameOverScene,
        PauseScene,
        CapituloCompletadoScene,
        DialogoScene
    ]
}
