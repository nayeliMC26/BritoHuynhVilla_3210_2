import * as THREE from 'three';
import { ObjectManager } from './ObjectManager.js';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { FirstPersonControls } from './controls/FirstPersonControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import Stats from 'three/examples/jsm/libs/stats.module'



class Main {
    constructor() {
        // adding scene, camera, renderer, making necessary adjustments
        this.scene = new THREE.Scene();

        // Setting up the renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setAnimationLoop(() => this.animate());
        // nice gray color to start with :)
        this.renderer.setClearColor(0x272727);
        this.renderer.setScissorTest(true);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.BasicShadowMap;
        document.body.appendChild(this.renderer.domElement);


        // Setting up the camera 
        this.camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 3000);
        this.scene.add(this.camera);
        this.cameraSpeed = 50;

        // Setting up the rear view mirror
        var mirrorGeometry = new THREE.PlaneGeometry(1, 1);
        // Gives the geometry a reflective texture
        this.mirror = new Reflector(mirrorGeometry, {
            clipBias: 0.003,
            textureWidth: window.innerWidth * window.devicePixelRatio,
            textureHeight: window.innerHeight * window.devicePixelRatio,
            color: 0xffffff

        });
        // Moving the mirror to the near plane of the camera
        this.mirror.translateZ(-0.1);
        this.mirror.visible = false;
        this.scene.add(this.mirror);
        // Adding mirror to camera so they move together
        this.camera.add(this.mirror);
        this.camera.translateZ(200);

        // The bounds for scissor rasterization of the mirror
        this.mirrorBounds = [
            0.2 * window.innerWidth,
            0.75 * window.innerHeight,
            0.6 * window.innerWidth,
            0.2 * window.innerHeight
        ];

        //this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls = new FirstPersonControls(this.camera, this.renderer.domElement)

        // creating a new objectManager object 
        this.ObjectManager = new ObjectManager(this.scene, this.camera);

        // Used to calculate delta time
        this.clock = new THREE.Clock();

        // Create a raycaster to detect collisions with objects
        this.raycaster = new THREE.Raycaster();

        this.ObjectManager.renderStars();
        this.ambientLight = new THREE.AmbientLight(0xffffff, 1);
        this.scene.add(this.ambientLight);

        this.directionalLight = new THREE.DirectionalLight(0xffffff, 2);
        this.directionalLight.position.set(50, -200, 0);
        this.directionalLight.castShadow = true;
        this.scene.add(this.directionalLight);

        this.stats = Stats()
        this.stats.showPanel(0)
        document.body.appendChild(this.stats.dom)

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
                this.model.position.set(0, -1, -0.78);
                // model is loaded in facing the wrong way so we rotate it
                this.model.rotation.y = Math.PI;
                this.camera.add(this.model);

            }
        )
    }

    animate() {
        this.stats.begin();
        // updating renderer
        this.renderer.setScissor(0, 0, window.innerWidth, window.innerHeight);
        this.renderer.render(this.scene, this.camera);
        // Rendering the rear view mirror
        this.mirror.visible = true;
        this.renderer.setScissor(...this.mirrorBounds);
        this.renderer.render(this.scene, this.camera);
        this.mirror.visible = false;
        // Create a point from the main camera looking straight

        this.pointer = new THREE.Vector3(0, 0, 1);

        // Cast a ray from the main camera to check for intersection with the objects
        this.raycaster.setFromCamera(this.pointer, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);

        // Updating the camera and renderer
        const deltaTime = this.clock.getDelta();

        // Variable that acts as the camera look at direction
        var direction = new THREE.Vector3;

        // Check each object for collision with the plane (the camera)
        for (let i = 0; i < intersects.length; i++) {

            // Check if the object is close enough to the ray to consider it colliding, excluding the rear-view camera
            if (intersects[i].distance > 1 && intersects[i].distance < 2) {

                // Getting the camera look at direction
                this.camera.getWorldDirection(direction);
                direction.normalize();
                // Send the object away from the camera
                this.bounceObject(direction, intersects[i].object, 200);
                break;
            }

        }

        // Move the camera at a slow, forward steady velocity using delta time
        this.controls.update(deltaTime * this.cameraSpeed);

        // Moves all the objects in a random linear direction
        this.ObjectManager.drifting();

        // Scales all the objects x, y, and z on a sin pattern
        this.ObjectManager.transformations();

        // Enable blending
        this.ObjectManager.blend();

        this.ObjectManager.loopObjects(this.ObjectManager.objects)
        this.stats.end();

    }


    /**
     * Bounce/send an object off by distance 
     * @param {THREE.Vector3} cameraDirection 
     * @param {THREE.Object3D} object 
     * @param {Number} distance 
     */
    bounceObject(cameraDirection, object, distance) {
        // Play a "boing" sound
        this.playSound('assets/sounds/boing.mp3');
        // Timeout code adapted from https://www.sitepoint.com/delay-sleep-pause-wait/
        for (let i = 0; i < distance; i++) {
            setTimeout(() => { object.translateOnAxis(cameraDirection, 5); }, i * 10); // Move the object each 10 ms
        }
    }
    // defines the function of windowResizing
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.mirrorBounds = [
            0.2 * window.innerWidth,
            0.75 * window.innerHeight,
            0.6 * window.innerWidth,
            0.2 * window.innerHeight
        ];
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    /**
     * Play an audio file
     * @param {String} audioFile the name of the audio file
     */
    playSound(audioFile) {
        const listener = new THREE.AudioListener();
        this.camera.add(listener);
        // Create a global audio source
        const sound = new THREE.Audio(listener);
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load(audioFile, function (buffer) {
            sound.setBuffer(buffer);
            sound.setLoop(false);
            sound.setVolume(0.5);
            sound.play();
            sound.stop(2); // Stop after 2 seconds

        });
    }
}


var game = new Main();
