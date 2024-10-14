import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ObjectManager } from './ObjectManager.js';

class Main {
    constructor() {
        // adding scene, camera, renderer, making necessary adjustments
        this.scene = new THREE.Scene();
        // Create the camera facing forward
        this.views = [
            {
                camera: "",
                eye: [0, 0, 200],
                lookAt: [0, -200, 0],
                left: 0,
                bottom: 0,
                width: window.innerWidth,
                height: window.innerHeight
            },
            {
                camera: "",
                eye: [0, 0, 200],
                lookAt: [0, 200, 0],
                left: window.innerWidth * 0.2,
                bottom: window.innerHeight * 0.75,
                width: window.innerWidth - (window.innerWidth * 0.4),
                height: window.innerHeight - (window.innerHeight * 0.8)
            }
        ];
        this.camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 3000);
        this.rearCamera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 3000);
        this.xLookAt = 0;
        this.yLookAt = -200;
        this.zLookAt = 0;
        this.camera.lookAt(new THREE.Vector3(this.xLookAt, this.yLookAt, this.zLookAt));
        this.rearCamera.lookAt(new THREE.Vector3(this.xLookAt * -1, this.yLookAt * -1, this.zLookAt * -1));

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setAnimationLoop(() => this.animate());
        // nice gray color to start with :)
        this.renderer.setClearColor(0x272727);
        document.body.appendChild(this.renderer.domElement);
        // setting the initial position of the camera, subject to change
        this.camera.position.z = 200;
        this.rearCamera.position.z = 200;

        this.renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
        this.renderer.setScissor(window.innerWidth * 0.2, window.innerHeight * 0.75, (window.innerWidth - (window.innerWidth * 0.4)), window.innerHeight - (window.innerHeight * 0.8));
        this.renderer.setScissorTest(true);
        // creating a new objectManager object 
        this.ObjectManager = new ObjectManager(this.scene, this.camera);
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        // handles window resizing 
        window.addEventListener('resize', () => this.onWindowResize(), false)


    }

    animate() {
        // Move the camera at a slow, forward steady velocity (for now)
        this.camera.position.set(this.xLookAt, this.yLookAt += 0.1, this.zLookAt);
        //this.camera.lookAt(new THREE.Vector3(this.xLookAt, this.yLookAt, this.zLookAt -= 0.1));
        this.camera.lookAt(0, this.yLookAt += 0.1, 0);
        this.renderer.render(this.scene, this.camera);
        this.controls.update();
        // moves all the objects in a linear direction
        this.ObjectManager.drifting()

    }

    // defines the function of windowResizing
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    makeCamera(){
        for (let i = 0; i < this.views.length; i++){
            const view = this.views[i];
            const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 3000);
            camera.position = new THREE.Vector3(view.eye);
        }
    }
}

var game = new Main();


