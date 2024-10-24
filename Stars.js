// Code adapted from https://github.com/mrdoob/three.js/blob/master/examples/webgl_buffergeometry_custom_attributes_particles.html

import * as THREE from 'three';
import StarsVertexShader from './shaders/StarsVertexShader';
import StarsFragmentShader from './shaders/StarsFragmentShader';


/**
 * Handles Stars in the background
 */
export class Stars {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        // Original position of the camera
        this.cameraPosition = camera.position.clone();
        // Holds the object
        this.stars = "";
        // Holds  the position of every star
        this.positions = [];
        // Holds the colors of every star
        this.colors = [];
        // Available colors to chooce from
        this.starColors = [
            0xdeebff,
            0xffe07a,
            0xffeed1,
            0xd6fffc,
            0xffe3f1
        ];
        // Holds the sizes of every star
        this.sizes = [];
        // How many starts there are
        this.starsAmount = 100000;
        // Sprites from https://github.com/mrdoob/three.js/tree/master/examples/textures/sprites
        // Textures to be applied to the stars
        this.textures = [
            'assets/textures/sprites/spark1.png',
            'assets/textures/sprites/snowflake1.png',
            'assets/textures/sprites/snowflake4.png',
            'assets/textures/sprites/snowflake5.png'
        ];
        // Creates the stars
        this.createStars();
    }

    createStars() {

        // Star shader material
        const material = new THREE.ShaderMaterial({
            uniforms: this.randomUniforms(),
            vertexShader: StarsVertexShader,
            fragmentShader: StarsFragmentShader,
            blending: THREE.AdditiveBlending,
            depthTest: true,
            transparent: true,
            vertexColors: true
        });

        // Getting a random position and color for the stars
        for (let i = 0; i < this.starsAmount; i++) {
            this.positions.push((Math.random() * 2 - 1) * 2000);
            this.positions.push((Math.random() * 2 - 1) * 2000);
            this.positions.push((Math.random() * 2 - 1) * 2000);

            const color = new THREE.Color(this.starColors[Math.floor(Math.random() * this.starColors.length)])

            this.colors.push(color.r, color.g, color.b);

            this.sizes.push(20);
        }

        // Star geometry
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(this.positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(this.colors, 3));
        geometry.setAttribute('size', new THREE.Float32BufferAttribute(this.sizes, 1).setUsage(THREE.DynamicDrawUsage));

        // Points that acts as the stars
        this.stars = new THREE.Points(geometry, material);

        // Add the star to the scene
        this.scene.add(this.stars);
    }

    // Returns a uniform with one of the textures randomly chosen 
    randomUniforms() {
        var uniform = {
            pointTexture: { value: new THREE.TextureLoader().load(this.textures[Math.floor(Math.random() * this.textures.length)]) }
        };
        return uniform;
    }

    // Moves the stars around and changes size
    update() {
        // Acts as delta time
        const time = Date.now() * 0.005;
        
        // Rotating all the starts along the z axis relative to time
        this.stars.rotation.z = 0.01 * time;

        // Changing the size of the stars on a sin pattern
        const sizes = this.stars.geometry.attributes.size.array;
        for (let i = 0; i < this.starsAmount; i++) {
            sizes[i] = 10 * (1 + Math.sin(0.1 * i + time));
        }
        this.stars.geometry.attributes.size.needsUpdate = true;

        // Current position of the camera
        const newCameraPosition = this.camera.position.clone();
        // The distacement between the original position and current position of the camera
        const displacement = new THREE.Vector3().subVectors(newCameraPosition, this.cameraPosition);
        // A translation matrix with the values of the displacement
        const matrix = new THREE.Matrix4().makeTranslation(displacement);
        // Applying the displacemnet of the camera to the stars
        this.stars.applyMatrix4(matrix);
        // Updating the original position of the camera to the current position
        this.cameraPosition.copy(newCameraPosition);
    }
}
