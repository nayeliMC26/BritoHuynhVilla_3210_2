import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ObjectManager } from './ObjectManager.js';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';

class Main {
    constructor() {
        // adding scene, camera, renderer, making necessary adjustments
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 3000);

        this.xLookAt = 0;
        this.yLookAt = -250;
        this.zLookAt = 0;
        this.camera.lookAt(new THREE.Vector3(this.xLookAt, this.yLookAt, this.zLookAt));

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setAnimationLoop(() => this.animate());
        // nice gray color to start with :)
        this.renderer.setClearColor(0x272727);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(this.renderer.domElement);
        // setting the initial position of the camera, subject to change
        this.camera.position.z = 200;
        // creating a new objectManager object 
        this.ObjectManager = new ObjectManager(this.scene, this.camera);
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        // handles window resizing 
        window.addEventListener('resize', () => this.onWindowResize(), false)



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

        //this.mouseX = 0;
        //this.mouseY = 0;
        //this.movementSpeed = 1;

        //document.addEventListener('mousemove', this.onDocumentMouseMove.bind(this));

        this.firstPersonControls = new FirstPersonControls(this.camera, this.renderer.domElement)
        this.firstPersonControls.movementSpeed = 25;
        this.firstPersonControls.lookSpeed = 0.01;

    }

    /*onDocumentMouseMove(event) {

        this.mouseX = (event.clientX - window.innerWidth / 2);
        this.mouseY = (event.clientY - window.innerHeight / 2);

    }*/

    // https://threejs.org/examples/webgl_multiple_views.html
    // reference code 
    /*updateCamera(camera, scene, mouseX, mouseY) {
        camera.position.x += mouseX * 0.05;
        camera.position.x = Math.max(Math.min(camera.position.x, 700), - 700);
        //camera.lookAt(scene.position);

        camera.position.y += mouseY * 0.05;
        camera.position.y = Math.max(Math.min(camera.position.y, 700), - 700);
        //camera.lookAt(scene.position);


    }*/


    animate() {
        //this.camera.position.set(this.xLookAt, this.yLookAt += 0.1, this.zLookAt);
        //this.camera.lookAt(this.xLookAt, this.yLookAt += 0.1, this.zLookAt);
        this.firstPersonControls.update(0.1)
        //this.updateCamera(this.camera, this.scene, this.mouseX, this.mouseY)
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

