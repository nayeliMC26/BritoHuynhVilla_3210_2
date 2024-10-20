import * as THREE from 'three';
import { ObjectManager } from './ObjectManager.js';
import { FirstPersonControls } from './controls/FirstPersonControls.js';

class Main {
    constructor() {
        // adding scene, camera, renderer, making necessary adjustments
        this.scene = new THREE.Scene();


        // Object with the required information for each camera
        this.views = [
            {
                camera: "",
                eye: new THREE.Vector3(0, 0, 200), // location
                lookAt: new THREE.Vector3(0, 0, -1),
                // The parameters of the view port (percetages of the screen)
                left: 0,
                bottom: 0,
                width: 1,
                height: 1,
                background: 0x272727
            },
            {
                camera: "",
                eye: new THREE.Vector3(0, 0, 200), // location
                lookAt: new THREE.Vector3(0, 0, 1),
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
            camera.lookAt(view.lookAt);
            camera.position.copy(view.eye);
            this.scene.add(camera);
            view.camera = camera;
        }

        // Setting up the renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setAnimationLoop(() => this.animate());
        // nice gray color to start with :)
        this.renderer.setClearColor(0x272727);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(this.renderer.domElement);

        //this.controls = new OrbitControls(this.views[0].camera, this.renderer.domElement);
        this.controls = new FirstPersonControls(this.views[0].camera, this.renderer.domElement)

        // creating a new objectManager object 
        this.ObjectManager = new ObjectManager(this.scene, this.views[0].camera);
        // handles window resizing 

        window.addEventListener('resize', () => this.onWindowResize(), false)

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
    }

    animate() {
        
        // Move the camera at a slow, forward steady velocity using delta time
        for (let i = 0; i < this.views.length; i++) {
            // Picking a camera to work with
            const view = this.views[i];
            const camera = view.camera;

            // Parameters of the view port
            const left = Math.floor(view.left * window.innerWidth);
            const bottom = Math.floor(view.bottom * window.innerHeight);
            const width = Math.floor(view.width * window.innerWidth);
            const height = Math.floor(view.height * window.innerHeight);

            // Setting the view port
            this.renderer.setScissor(left, bottom, width, height);
            this.renderer.setScissorTest(true);
            this.renderer.setClearColor(view.background);


            // Updating the camera and renderer
            const deltaTime = this.clock.getDelta();
            const speed = 20;
            // camera.position.z -= (deltaTime * speed);
            // camera.lookAt.z -= (deltaTime * speed);

            this.controls.update(deltaTime * speed);
            this.renderer.render(this.scene, camera);
        }


        // Moves all the objects in a random linear direction
        this.ObjectManager.drifting();

        this.ObjectManager.transformations();

        // Enable blending
        this.ObjectManager.blend();



    }

    // defines the function of windowResizing
    onWindowResize() {
        for (let i = 0; i < this.views.length; i++) { // Updating camera aspect for all cameras
            const view = this.views[i];
            const camera = view.camera;
            camera.aspect = Math.floor(view.width * window.innerWidth) / Math.floor(view.height * window.innerHeight);
            camera.updateProjectionMatrix();
        }
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

var game = new Main();


