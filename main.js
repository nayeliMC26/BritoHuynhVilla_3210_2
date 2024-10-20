import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ObjectManager } from './ObjectManager.js';
import { Reflector } from 'three/addons/objects/Reflector.js';

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

        // Group to act as the body of the cameras

        this.camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 3000);
        // this.camera.translateZ(-5);
        this.camera.position.set(0, 0, 1)
        this.scene.add(this.camera);

        var mirrorGeometry = new THREE.PlaneGeometry(1, 1);
        // var mat = new THREE.MeshBasicMaterial({ color: 0xff0000 })
        // this.mirror = new THREE.Mesh(mirrorGeometry, mat);
        this.mirror = new Reflector(mirrorGeometry, {
            clipBias: 0.003,
            textureWidth: window.innerWidth * window.devicePixelRatio,
            textureHeight: window.innerHeight * window.devicePixelRatio,
            color: 0xb5b5b5

        });
        this.mirror.position.set(0, 0, -0.1);
        // this.mirror.translateZ(50);
        this.mirror.visible = false;
        this.scene.add(this.mirror);

        this.mirrorBB = new THREE.Box3();
        this.mirrorBB.setFromObject(this.mirror);
        this.helper = new THREE.Box3Helper(this.mirrorBB, 0xffff00);
        this.scene.add(this.helper);

        this.mirrorBounds = [
            0.2 * window.innerWidth,
            0.75 * window.innerHeight,
            0.6 * window.innerWidth,
            0.2 * window.innerHeight
        ];

        this.cameraBody = new THREE.Group();
        // this.cameraBody.rotateY(-Math.PI / 2)
        this.cameraBody.add(this.camera, this.mirror);
        this.scene.add(this.cameraBody);
        // this.cameraBody.position.z += 50;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.cameraDirection = new THREE.Ray();


        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        // creating a new objectManager object 
        this.ObjectManager = new ObjectManager(this.scene, this.camera);
        // handles window resizing 

        window.addEventListener('resize', () => this.onWindowResize(), false)

        this.axis = new THREE.AxesHelper();
        this.scene.add(this.axis);
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

        window.addEventListener('mousemove', (event) => { this.onMouseMove(event) });
    }

    animate() {
        this.controls.update();
        const speed = 20;
        const deltaTime = this.clock.getDelta() * speed;
        // Move the camera at a slow, forward steady velocity using delta time
        this.mirror.position.copy(this.camera.position);
        // Create a Vector3 to store the direction
        let direction = this.camera.position.clone();

        // Get the camera's look direction
        this.camera.getWorldDirection(direction);
        direction.normalize();

        this.mirror.lookAt(direction);
        this.mirror.rotateY(Math.PI);
        this.mirror.translateZ(-0.1);



        // console.log('Camera Look Direction:', direction);
        // this.mirror.translateOnAxis(direction, 5)

        // this.mirror.setRotationFromEuler(this.camera.rotation);



        // Moves all the objects in a random linear direction
        // this.ObjectManager.drifting();

        // this.ObjectManager.transformations();

        // // Enable blending
        // this.ObjectManager.blend();

        this.renderer.setScissor(0, 0, window.innerWidth, window.innerHeight);
        this.renderer.render(this.scene, this.camera);
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

    onMouseMove(event) {
        // console.log(this.mouse)
        // Convert mouse position to normalized device coordinates (-1 to +1)
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Update raycaster to calculate ray from camera through mouse position
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Get the direction of the ray
        this.cameraDirection = this.raycaster.ray.direction.clone();
    }
}

var game = new Main();


