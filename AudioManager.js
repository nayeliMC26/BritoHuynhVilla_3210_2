import * as THREE from 'three';

/** Creates an audio object */
export class AudioManager {
    /**
     * Creates an AudioListener and adds it to the camera
     * @param {THREE.PerspectiveCamera} camera 
     */
    constructor(camera) {
        // 
        const listener = new THREE.AudioListener();
        camera.add(listener);

        // Create a global audio source
        this.sound = new THREE.Audio(listener);
    }

    /**
     * Load and play an audio
     * @param {String} audioFile path to the audio file
     */
    playAudio(audioFile) {
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load(audioFile, function (buffer) {
            this.sound.setBuffer(buffer);
            this.sound.setLoop(true);
            this.sound.setVolume(0.5);
            this.sound.play();
        });
    }
}