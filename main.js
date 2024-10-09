import * as THREE from 'three';
import { ObjectManager } from './ObjectManager.js';

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 3000);
scene.add(camera)


var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
renderer.setClearColor(0x272727);
document.body.appendChild(renderer.domElement);

camera.position.z = 400


function animate() {
    renderer.render(scene, camera);
    requestAnimationFrame(animate);

}
