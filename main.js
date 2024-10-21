import * as THREE from 'three';
import { ObjectManager } from './ObjectManager.js';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { FirstPersonControls } from './controls/FirstPersonControls.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


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

        // Object with the required information for each camera
        this.views = [
            {
                camera: "",
                inverted: false,
                // The parameters of the view port (percetages of the screen)
                left: 0,
                bottom: 0,
                width: 1,
                height: 1,
                background: 0x272727
            },
            {
                camera: "",
                inverted: true,
                // The parameters of the view port (percetages of the screen)
                left: 0.2,
                bottom: 0.75,
                width: (window.innerWidth - (window.innerWidth * 0.4)) / window.innerWidth,
                height: (window.innerHeight - (window.innerHeight * 0.8)) / window.innerHeight,
                background: 0x808080
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
        // Moving the camera to a desired intial position
        this.views[0].camera.translateZ(200)

        // this.controls = new OrbitControls(this.views[0].camera, this.renderer.domElement);
        this.controls = new FirstPersonControls(this.views[0].camera, this.renderer.domElement)

        // creating a new objectManager object 
        this.ObjectManager = new ObjectManager(this.scene, this.camera);

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

        // handles window resizing 
        window.addEventListener('resize', () => this.onWindowResize(), false);
    }

    animate() {
        // this.controls.update();
        // The time between animate() calls
        const deltaTime = this.clock.getDelta();

        // Move the camera at a slow, forward steady velocity using delta time
        this.controls.update(deltaTime * this.cameraSpeed);


        // Moves all the objects in a random linear direction
        this.ObjectManager.drifting(deltaTime);

        // Scales all the objects x, y, and z on a sin pattern
        this.ObjectManager.transformations(deltaTime);

        // Enable blending
        this.ObjectManager.blend();

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


    }

    // defines the function of windowResizing
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
}
var game = new Main();
