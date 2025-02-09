import * as THREE from 'three';
import { ObjectManager } from './ObjectManager.js';
import { Stars } from './Stars.js';
import { FirstPersonControls } from './controls/FirstPersonControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import Stats from 'three/examples/jsm/libs/stats.module';

class Main {
    /**
     * Creates the scene, camera, renderer, and dashboard.
     */
    constructor() {
        // adding scene, camera, renderer, making necessary adjustments
        this.scene = new THREE.Scene();
        this.gameStarted = false;

        // Setting up the renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setAnimationLoop(() => this.animate());
        this.renderer.setClearColor(0x272727);
        // Scissor rasterization
        this.renderer.setScissorTest(true);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.BasicShadowMap;
        document.getElementById('canvas').appendChild(this.renderer.domElement);

        // Added a start button that allows the GUI canvas to be disabled once the game starts
        this.startButton = document.getElementById('startButton');
        // Pause menu for when the user presses escape
        this.pauseMenu = document.getElementById('pauseMenu');
        // Button to allow them to return to the game
        this.resumeButton = document.getElementById('resumeButton');
        this.startButton.addEventListener('click', () => {
            this.guiCanvas = document.querySelector('#guiCanvas');
            this.guiContainer = document.querySelector('.gui-container');
            this.gameStarted = true;
            /** Sound by drmseq on Pixabay: https://pixabay.com/music/video-games-space-station-247790/ */
            this.playSound('assets/sounds/space-station-247790.mp3');

            if (this.guiCanvas && this.guiContainer) {
                this.guiCanvas.style.display = 'none';
                this.guiContainer.style.display = 'none';
            }

        });
        
        window.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.togglePause();
            }
        });

        this.resumeButton.addEventListener('click', () => {
            this.togglePause();
        });

        // Object with the required information for each camera
        this.views = [
            {
                // Front camera (main camera)
                camera: "",
                inverted: false,
                // The parameters of the view port (percentages of the screen)
                left: 0,
                bottom: 0,
                width: 1,
                height: 1,
                background: 0x272727
            },
            {
                // Rear-view camera
                camera: "",
                inverted: true,
                // The parameters of the view port (percentages of the screen)
                left: 0.2,
                bottom: 0.75,
                width: (window.innerWidth - (window.innerWidth * 0.4)) / window.innerWidth,
                height: (window.innerHeight - (window.innerHeight * 0.8)) / window.innerHeight,
                background: 0x373737
            }
        ];

        // Creating the cameras
        for (let i = 0; i < this.views.length; i++) {
            const view = this.views[i];
            const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 3000);
            view.camera = camera;
            this.scene.add(camera);
        }
        this.cameraSpeed = 20;

        // Flipping rear camera around
        this.views[1].camera.rotateY(Math.PI);
        this.views[1].camera.projectionMatrix.elements[0] *= -1;
        // Adding rear camera to front camera so they move together
        this.views[0].camera.add(this.views[1].camera);
        // Moving the camera to a desired initial position
        this.views[0].camera.translateZ(200);

        // Manages movement of the mouse
        this.controls = new FirstPersonControls(this.views[0].camera, this.renderer.domElement);

        // Creating a new objectManager object 
        this.ObjectManager = new ObjectManager(this.scene, this.views[0].camera);

        //
        this.StarsBackground = new Stars(this.scene, this.views[0].camera);

        // Enable blending
        this.ObjectManager.blend();

        // Used to calculate delta time
        this.clock = new THREE.Clock();

        // Create a ray caster to detect collisions with objects
        this.raycaster = new THREE.Raycaster();

        this.ambientLight = new THREE.AmbientLight(0xffffff, 1);
        this.scene.add(this.ambientLight);

        this.directionalLight = new THREE.DirectionalLight(0xffffff, 2);
        this.directionalLight.position.set(50, -200, 0);
        this.directionalLight.castShadow = true;
        this.scene.add(this.directionalLight);

        // FPS reporter
        this.stats = Stats();
        this.stats.showPanel(0);
        document.body.appendChild(this.stats.dom);
        
        /*"Cockpit Model Vr" (https://skfb.ly/6QTwx) by chiefpad 
         * is licensed under Creative Commons Attribution 
         * (http://creativecommons.org/licenses/by/4.0/). 
         * 
         * "Fancy Victorian Square Picture Frame" (https://skfb.ly/6ZIHt) by Jamie McFarlane is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
        */
        this.loader = new GLTFLoader();
        // load in the model from the assets folder
        this.loader.load(
            'assets/models/source/cockpit_model_vr.gltf',
            (gltf) => {
                this.model = gltf.scene;
                this.scene.add(this.model);
                // position the model such that we are looking through the window of the ship
                this.model.position.set(0, -1, -1.7);
                // model is loaded in facing the wrong way so we rotate it
                this.model.rotation.y = Math.PI;
                this.views[0].camera.add(this.model);
            }
        )

        // Handles window resize
        window.addEventListener('resize', () => this.onWindowResize(), false);

        this.paused = false;
    }

    /**
     * Move the camera, check for collision.
     */
    animate() {
        // Flag to return if the game is not in the started state
        if (!this.gameStarted || this.paused) {
            this.stats.end();
            return;
        }

        // Fps reporter
        this.stats.begin();

        // Time difference between animate calls
        const deltaTime = this.clock.getDelta();

        // Move the camera at a slow, forward steady velocity using delta time
        this.controls.update(this.cameraSpeed * deltaTime);

        // Create a point from the main camera looking straight
        this.pointer = new THREE.Vector3(0, 0, 1);

        // Cast a ray from the main camera to check for intersection with the objects
        this.raycaster.setFromCamera(this.pointer, this.views[0].camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);

        // Variable that acts as the camera look at direction
        var direction = new THREE.Vector3;

        // Check each object for collision with the plane (the camera)
        for (let i = 0; i < intersects.length; i++) {
            // Check if the object is close enough to the ray to consider it colliding, excluding the rear-view camera and 
            // that it's not colliding with a star
            if (intersects[i].distance > 1 && intersects[i].distance < 10 && !intersects[i].object.isPoints) {
                // Getting the camera look at direction
                this.views[0].camera.getWorldDirection(direction);
                direction.normalize();
                // Send the object away from the camera
                this.bounceObject(direction, intersects[i].object, 200);
                break;
            }
        }

        // Moving the objects
        this.ObjectManager.animate(deltaTime);

        // Keeps the background in constant movement
        this.StarsBackground.update();

        // Makes it feel like an "infinity" amount of objects
        this.ObjectManager.loopObjects(this.ObjectManager.objects);

        // Updating camera and renderer
        for (let i = 0; i < this.views.length; i++) {
            // Picking a camera to work with
            const view = this.views[i];
            const camera = view.camera;

            // Parameters of the view port
            const left = Math.floor(view.left * window.innerWidth);
            const bottom = Math.floor(view.bottom * window.innerHeight);
            const width = Math.floor(view.width * window.innerWidth);
            const height = Math.floor(view.height * window.innerHeight);

            // Updating the renderer the view port
            this.renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
            this.renderer.setScissor(left, bottom, width, height);
            this.renderer.setClearColor(view.background);
            this.renderer.render(this.scene, camera);
        }

        // Fps reporter
        this.stats.end();
    }

    /**
     * Bounce/send an object off by distance 
     * @param {THREE.Vector3} cameraDirection the lookAt direction
     * @param {THREE.Object3D} object the object to be moved
     * @param {Number} distance the time given for the object to move
     */
    bounceObject(cameraDirection, object, distance) {
        // Play a bounce sound
        this.playSound('assets/sounds/boing.mp3');
        // Timeout code adapted from https://www.sitepoint.com/delay-sleep-pause-wait/
        for (let i = 0; i < distance; i++) {
            setTimeout(() => { object.translateOnAxis(cameraDirection, 5); }, i * 10); // Move the object each 10 ms
        }
    }

    /**
     * Defines the function of windowResizing
     */
    onWindowResize() {
        this.views.forEach(function (view) {
            const camera = view.camera;
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            if (view.inverted) {
                camera.projectionMatrix.elements[0] *= -1;
            }
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    /**
     * Play an audio file
     * @param {String} audioFile the name of the audio file
     */
    playSound(audioFile) {
        const listener = new THREE.AudioListener();
        this.views[0].camera.add(listener);
        // Create a global audio source
        const sound = new THREE.Audio(listener);
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load(audioFile, function (buffer) {
            sound.setBuffer(buffer);
            sound.setLoop(false);
            sound.setVolume(0.3);
            sound.play();
            sound.stop(57);

        });
    }

    /**
     * Function to toggle pausing for users
     */
    togglePause() {
        this.paused = !this.paused;
        if (this.paused) {
            this.pauseMenu.style.display = 'flex';  // Show pause menu
        } else {
            this.pauseMenu.style.display = 'none';  // Hide pause menu
        }
    }
}

var game = new Main();