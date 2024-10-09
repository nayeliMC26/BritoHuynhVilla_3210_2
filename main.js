import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
// Create the camera facing forward
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 500);
// Have a few variables to control the camera
var xLookAt = 0;
var yLookAt = 0;
var zLookAt = 0;

camera.position.z = 50;
camera.lookAt(new THREE.Vector3(xLookAt, yLookAt, zLookAt));
scene.add(camera);

// const controls = new OrbitControls(camera, renderer.domElement);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
renderer.setClearColor(0x272727);
document.body.appendChild(renderer.domElement);


function animate() {
    renderer.render(scene, camera);
    requestAnimationFrame(animate);

}
