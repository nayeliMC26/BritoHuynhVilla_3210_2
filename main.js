import * as THREE from 'three';
import { ObjectManager } from './ObjectManager.js';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { FirstPersonControls } from './controls/FirstPersonControls.js';


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
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(this.renderer.domElement);


        // Setting up the camera 
        this.camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 3000);
        this.scene.add(this.camera);
        this.cameraSpeed = 20;

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
        this.helper = new THREE.CameraHelper(this.directionalLight.shadow.camera);
        //this.scene.add(this.helper);

        this.directionalLight.shadow.camera.left = -200;
        this.directionalLight.shadow.camera.right = 200;
        this.directionalLight.shadow.camera.top = 200;
        this.directionalLight.shadow.camera.bottom = -200;
        this.directionalLight.shadow.camera.near = 1;
        this.directionalLight.shadow.camera.far = 500;

        // handles window resizing 
        window.addEventListener('resize', () => this.onWindowResize(), false);
        window.addEventListener('keydown', (event) => this.keyDown(event), false);
        window.addEventListener('keyup', (event) => this.keyUp(event), false);
    }

    animate() {
        // this.controls.update();
        // The time between animate() calls
        const deltaTime = this.clock.getDelta();


        // Move the camera at a slow, forward steady velocity using delta time
        this.controls.update(deltaTime * this.cameraSpeed);

        // Moves all the objects in a random linear direction
        this.ObjectManager.drifting();

        // Scales all the objects x, y, and z on a sin pattern
        this.ObjectManager.transformations();

        // Enable blending
        this.ObjectManager.blend();

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
    }
    /**
     * Bounce/send an object off by distance 
     * @param {THREE.Vector3} cameraDirection 
     * @param {THREE.Object3D} object 
     * @param {Number} distance 
     */
    bounceObject(cameraDirection, object, distance) {
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
}
var game = new Main();
