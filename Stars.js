import * as THREE from 'three';
import StarsVertexShader from './shaders/StarsVertexShader';
import StarsFragmentShader from './shaders/StarsFragmentShader';


/**
 * Handles Starts in the background
 */
export class Stars {
    constructor(scene) {
        this.scene = scene;
        this.stars = "";
        this.positions = [];
        this.colors = [];
        this.starColors = [
            0xdeebff,
            0xffe07a,
            0xffeed1,
            0xd6fffc,
            0xffe3f1
        ];
        this.sizes = [];
        this.starsAmount = 100000;

        this.textures = [
            'assets/textures/sprites/spark1.png',
            'assets/textures/sprites/snowflake1.png',
            'assets/textures/sprites/snowflake4.png',
            'assets/textures/sprites/snowflake5.png'
        ];
        // call our createObjectPool function to create an objectPool 
        this.createStars();
    }

    // https://discourse.threejs.org/t/space-background/49885
    // source for this code which will be used temporarily 
    createStars() {
        // -- space background ------------------------------------------------------
        // Create a shader material for each star
        const starMaterial = new THREE.ShaderMaterial(
            {
                uniforms: this.randomUniforms(),
                vertexShader: StarsVertexShader,
                fragmentShader: StarsFragmentShader,

                blending: THREE.AdditiveBlending,
                depthTest: false,
                transparent: true,
                vertexColors: true
            }
        );

        for (let i = 0; i < this.starsAmount; i++) {

            this.positions.push((Math.random() * 2 - 1) * 2000);
            this.positions.push((Math.random() * 2 - 1) * 2000);
            this.positions.push((Math.random() * 2 - 1) * 2000);

            const color = new THREE.Color(this.starColors[Math.floor(Math.random() * this.starColors.length)])
            // const color = new THREE.Color(0xffffff * Math.random())

            this.colors.push(color.r, color.g, color.b);

            this.sizes.push(20);

        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(this.positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(this.colors, 3));
        geometry.setAttribute('size', new THREE.Float32BufferAttribute(this.sizes, 1).setUsage(THREE.DynamicDrawUsage));

        this.stars = new THREE.Points(geometry, starMaterial);

        // Add the star to the scene
        this.scene.add(this.stars);
    }

    /** 
     * Generates random uniform values.
     * @returns a random uniform value
     */
    randomUniformsOg() {
        var uniform = {
            // The difference in coordinates
            deltaX: { value: 0 },
            deltaY: { value: 0 },
            deltaZ: { value: 0 },
            // The direction and speed that the shape will move on the axis
            directionX: { value: (Math.random() - 0.5) / 10 },
            directionY: { value: (Math.random() - 0.5) / 10 },
            directionZ: { value: (Math.random() - 0.5) / 10 },
            // The color of the shape
            // color: { value: new THREE.Color(this.starColors[Math.floor(Math.random() * this.starColors.length)]) }
            color: { value: new THREE.Color(0xffffff * Math.random()) },
            glowColor: { value: new THREE.Color(0xffff00) }, // Glow color
            viewVector: { value: new THREE.Vector3() },      // Camera's view vector
            intensity: { value: 1.0 },                       // Glow intensity
            falloff: { value: 1.0 }
        };
        return uniform;
    }

    randomUniforms() {
        var uniform = {
            pointTexture: { value: new THREE.TextureLoader().load(this.textures[Math.floor(Math.random() * this.textures.length)]) }
        };
        return uniform;
    }

    update() {
        const time = Date.now() * 0.005;

        this.stars.rotation.z = 0.01 * time;

        const sizes = this.stars.geometry.attributes.size.array;

        for (let i = 0; i < this.starsAmount; i++) {

            sizes[i] = 10 * (1 + Math.sin(0.1 * i + time));

        }

        this.stars.geometry.attributes.size.needsUpdate = true;

    }
}
