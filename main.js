import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ObjectManager } from './ObjectManager.js';

class Main {
    constructor() {

        // adding scene, camera, renderer, making necessary adjustments
        this.scene = new THREE.Scene();

        this.views = [{
            camera: "",
            eye: new THREE.Vector3(0, 0, 200),
            lookAt: new THREE.Vector3(0, 0, 0),
            left: 0.1,
            bottom: 0.1,
            width: 1,
            height: 1
        }];
        for (let i = 0; i < this.views.length; i++) {
            const view = this.views[i];
            const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 3000);
            camera.lookAt(view.lookAt);
            camera.position.set(view.eye);
            this.scene.add(camera);
            view.camera = camera;
        }

        // Create the camera facing forward
        this.camera = this.views[0].camera;
        // this.rearCamera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 3000);
        this.xLookAt = 0;
        this.yLookAt = -200;
        this.zLookAt = 0;
        console.log(this.views[0].lookAt)
        console.log(this.views[0].eye)
        this.camera.lookAt(this.views[0].lookAt);
        this.camera.position.copy(this.views[0].eye);
        // this.rearCamera.lookAt(new THREE.Vector3(this.xLookAt * -1, this.yLookAt * -1, this.zLookAt * -1));

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setAnimationLoop(() => this.animate());
        // nice gray color to start with :)
        this.renderer.setClearColor(0x272727);
        document.body.appendChild(this.renderer.domElement);
        // setting the initial position of the camera, subject to change
        this.camera.position.z = 200;
        // this.rearCamera.position.z = 200;


        // creating a new objectManager object 
        this.ObjectManager = new ObjectManager(this.scene, this.camera);
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        // handles window resizing 
        window.addEventListener('resize', () => this.onWindowResize(), false)

        const axesHelper = new THREE.AxesHelper(5);
        this.scene.add(axesHelper);
        this.animate()
    }


    animate() {
        // this.scene.render();
        // Move the camera at a slow, forward steady velocity (for now)
        // this.camera.position.set(this.xLookAt, this.yLookAt += 0.1, this.zLookAt);
        //this.camera.lookAt(new THREE.Vector3(this.xLookAt, this.yLookAt, this.zLookAt -= 0.1));
        // this.camera.lookAt(0, this.yLookAt += 0.1, 0);
        // this.renderer.render(this.scene, this.camera);
        this.controls.update();
        // moves all the objects in a linear direction
        this.ObjectManager.drifting()

        for (let i = 0; i < this.views.length; i++) {
            const view = this.views[i];
            const camera = view.camera;

            const left = Math.floor(this.views[i].left * window.innerWidth);
            const bottom = Math.floor(this.views[i].bottom * window.innerHeight);
            const width = Math.floor(this.views[i].width * window.innerWidth);
            const height = Math.floor(this.views[i].height * window.innerHeight);

            this.renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
            this.renderer.setScissor(left, bottom, width, height);
            this.renderer.setScissorTest(true);

            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            this.renderer.render(this.scene, camera);

        }
        this.renderer.render(this.scene, this.camera);


    }

    // defines the function of windowResizing
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

var game = new Main();


