import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ObjectManager } from './ObjectManager.js';

class Main {
    constructor() {
        // adding scene, camera, renderer, making necessary adjustments
        this.scene = new THREE.Scene();
        // Create the camera facing forward
        this.camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 3000);
        this.xLookAt = 0;
        this.yLookAt = -200;
        this.zLookAt = 0;
        this.camera.lookAt(new THREE.Vector3(this.xLookAt, this.yLookAt, this.zLookAt));
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setAnimationLoop(() => this.animate());
        // nice gray color to start with :)
        this.renderer.setClearColor(0x272727);
        document.body.appendChild(this.renderer.domElement);
        // setting the initial position of the camera, subject to change
        this.camera.position.z = 200;
        // creating a new objectManager object 
        this.ObjectManager = new ObjectManager(this.scene, this.camera);
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        // handles window resizing 
        window.addEventListener('resize', () => this.onWindowResize(), false)
      
        var customUniforms = {
      deltaX: {value : 0},
      deltaY: {value : 0},
      deltaZ: {value : 0}
  }

  const geometry = new THREE.SphereGeometry(15, 32, 16);
  const material = new THREE.ShaderMaterial({
      uniforms: customUniforms,
      vertexShader: vertexS,
      fragmentShader: fragmentS
  });
  const sphere = new THREE.Mesh(geometry, material);
    }

    animate() {
        // Move the camera at a slow, forward steady velocity (for now)
        this.camera.position.set(this.xLookAt, this.yLookAt += 0.1, this.zLookAt);
        //this.camera.lookAt(new THREE.Vector3(this.xLookAt, this.yLookAt, this.zLookAt -= 0.1));
        this.camera.lookAt(0, this.yLookAt += 0.1, 0);
        this.renderer.render(this.scene, this.camera);
        this.controls.update();
    drifting(sphere.material.uniforms)
      
    }
    // defines the function of windowResizing
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
  
    function drifting(uniforms){
      uniforms.deltaX.value += 0.01
      uniforms.deltaY.value +=  uniforms.deltaY.value - Math.sin( uniforms.deltaX.value+1);
      if (uniforms.deltaX.value < 1){
          console.log("X: ", uniforms.deltaX.value)
          console.log("Y: ", Math.sin(uniforms.deltaX.value))
          console.log("")
      }
}

}

var game = new Main();


