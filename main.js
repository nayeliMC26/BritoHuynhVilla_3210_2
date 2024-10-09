import * as THREE from 'three';
import vertexS from './shaders/vertexShader';
import fragmentS from './shaders/fragmentShader';

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 3000);
scene.add(camera)


var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
renderer.setClearColor(0x272727);
document.body.appendChild(renderer.domElement);

camera.position.z = 1000

var customUniforms = {
    delta: {value : 1}
}

const geometry = new THREE.SphereGeometry(15, 32, 16);
const material = new THREE.ShaderMaterial({
    uniforms: customUniforms,
    vertexShader: vertexS,
    fragmentShader: fragmentS
});
const sphere = new THREE.Mesh(geometry, material);

scene.add(sphere);

function animate() {
    sphere.material.uniforms.delta.value += 0.01;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
animate();