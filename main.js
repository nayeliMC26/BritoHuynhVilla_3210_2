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
        this.camera.translateZ(200);
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
        this.mirror.position.set(0, 0, -0.1);
        this.mirror.translateZ(200);
        this.mirror.visible = false;
        this.scene.add(this.mirror);

        // The bounds for scissor rasterization of the mirror
        this.mirrorBounds = [
            0.2 * window.innerWidth,
            0.75 * window.innerHeight,
            0.6 * window.innerWidth,
            0.2 * window.innerHeight
        ];


        // this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        //this.controls = new OrbitControls(this.views[0].camera, this.renderer.domElement);
        this.controls = new FirstPersonControls(this.views[0].camera, this.renderer.domElement)

        // creating a new objectManager object 
        this.ObjectManager = new ObjectManager(this.scene, this.camera);
        // handles window resizing 

        // Used to calculate delta time
        this.clock = new THREE.Clock();


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

        window.addEventListener('resize', () => this.onWindowResize(), false);
    }

    animate() {

        // this.controls.update();
        // The time between animate() calls
        const deltaTime = this.clock.getDelta();

        // Move the camera at a slow, forward steady velocity using delta time
        this.camera.position.z -= this.cameraSpeed * deltaTime

        // Variable that acts as the camera look at direction
        var direction = new THREE.Vector3;

        // Getting the camera look at direction
        this.camera.getWorldDirection(direction);
        direction.normalize();


        // Updating the mirror to adjust for the new camera posistion
        this.mirror.position.copy(this.camera.position);
        // Looking at the same direction the camera 
        this.mirror.lookAt(direction);
        // FLip around so that it refelcts behind the camera
        this.mirror.rotateY(Math.PI);
        // Moving it to the near plane of the camera
        this.mirror.translateZ(-0.1);
            // Updating the camera and renderer
            const deltaTime = this.clock.getDelta();
            const speed = 20;
            // camera.position.z -= (deltaTime * speed);
            // camera.lookAt.z -= (deltaTime * speed);

         this.controls.update(deltaTime * speed);



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


