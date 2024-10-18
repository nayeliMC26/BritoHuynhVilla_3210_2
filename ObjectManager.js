import * as THREE from 'three';
import vertexS from './shaders/vertexShader';
import fragmentS from './shaders/fragmentShader';

export class ObjectManager {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.objects = [];
        // number of objects that will get generated 
        this.objectsMax = 200;
        // call our createObjectPool function to create an objectPool 
        this.createObjectPool();
    }
    // function which just creates our object pool which we will be reusing
    createObjectPool() {
        // for loop based on the limit of objects
        for (var i = 0; i < this.objectsMax; i++) {
            // create random meshes using random geometry and random material 
            var randomObject = this.createRandomObject();
            // create a bounding box to handle collisions
            randomObject.boundingBox = new THREE.Box3().setFromObject(randomObject);
            // add objects to the objectPool
            this.objects.push(randomObject)
            this.scene.add(randomObject)
        }
        //callthe random position function our list of objects
        this.randomPosition(this.objects)

    }
    // function to create random objects (takes random geometry as an input to create random objects)
    createRandomObject() {
        // for the geometry use the randomGeometries function
        var geometry = this.randomGeometries();
        // generate a material with random uniform values
        var customUniforms = this.randomUniforms();
        var material = new THREE.ShaderMaterial({
            uniforms: customUniforms,
            vertexShader: vertexS,
            fragmentShader: fragmentS
        });
        // create a new mesh using the random shape and material
        var mesh = new THREE.Mesh(geometry, material);
        // return the mesh 
        return mesh;
    }

    // function which is just a list of geometries and randomly returns a geometry 
    /**
     * @returns Random geometry
     */
    randomGeometries() {
        var geometries = [
            new THREE.SphereGeometry(THREE.MathUtils.randInt(2, 7), 32, 32),
            new THREE.OctahedronGeometry(THREE.MathUtils.randInt(2, 7), 0),
            new THREE.IcosahedronGeometry(THREE.MathUtils.randInt(2, 7), 0)
        ]
        /** for the length of the array of geometry types, pick a random number from there and return the number at that index 
         * this may have to be tweaked later but for now its fine 
        */
        return geometries[Math.floor(Math.random() * geometries.length)]
    }
    // https://discourse.threejs.org/t/space-background/49885
    // source for this code which will be used temporarily 
    renderStars() {
        // -- space background ------------------------------------------------------
        for (var i = 0; i < 10000; i++) {  // Adjust the number of stars if needed
            let x = THREE.MathUtils.randFloatSpread(2000); // random position for x-axis
            let y = THREE.MathUtils.randFloatSpread(2000); // random position for y-axis
            let z = THREE.MathUtils.randFloatSpread(2000); // random position for z-axis

            var starGeometry = new THREE.OctahedronGeometry(0.5, 0);

            // Create a material for each star (basic color, can be customized)
            var starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

            // Create a mesh by combining the geometry and material
            var star = new THREE.Mesh(starGeometry, starMaterial);

            // Set the position of the star randomly in 3D space
            star.position.set(x, y, z);

            // Add the star to the scene
            this.scene.add(star);
        }
    }


    // function to "spawn" the objects with a random location without intersecting 
    randomPosition(objects) {
        // for every object in the array of random objects made 
        for (var i = 0; i < objects.length; i++) {
            var object = objects[i];
            // start with the object not being relocated, so at 0,0,0
            var objectRelocated = false;
            while (!objectRelocated) {
                // create a new random position for them to move to 
                var newPosition = new THREE.Vector3(THREE.MathUtils.randFloatSpread(600), THREE.MathUtils.randFloatSpread(600), THREE.MathUtils.randFloatSpread(600));
                // move each object to its new position
                object.position.copy(newPosition);
                // create a boundingBox for each object 
                object.boundingBox.setFromObject(object);

                var collision = false;
                for (var j = 0; j < objects.length; j++) {
                    if (i !== j) {
                        // so long as two objects are not the same check if they are intersecting
                        if (object.boundingBox.intersectsBox(objects[j].boundingBox)) {
                            // if they intersect then they are colliding
                            collision = true;
                            break;
                        }
                    }
                }
                // if they are colliding they should not relocate until they are NOT colliding
                if (!collision) {
                    objectRelocated = true;
                }
            }
        }
    }

    // generates random uniform values
    randomUniforms() {
        var uniform = {
            // The differnece in coordinates
            deltaX: { value: 0 },
            deltaY: { value: 0 },
            deltaZ: { value: 0 },
            // The direction and speed that the shape will move on the axis
            directionX: { value: (Math.random() - 0.5) / 5 },
            directionY: { value: (Math.random() - 0.5) / 5 },
            directionZ: { value: (Math.random() - 0.5) / 5 },
            // The color of the shape
            color: { value: new THREE.Color(Math.random(), Math.random(), Math.random()) }
        };
        return uniform;
    }

    // Moves the shape in a linear direction
    drifting() {
        // For all the objects in the object pool
        this.objects.forEach(function (object) {
            object.material.uniforms.deltaX.value += object.material.uniforms.directionX.value;
            object.material.uniforms.deltaY.value += object.material.uniforms.directionY.value;
            object.material.uniforms.deltaZ.value += object.material.uniforms.directionZ.value;
        });
    }

    /** Add blending for the objects */
    blend() {
        this.objects.forEach(function (object) {
            object.material.blending = THREE.CustomBlending;
            object.material.blendEquation = THREE.AddEquation; //default 
            object.material.blendSrc = THREE.SrcColorFactor;
            object.material.blendDst = THREE.OneMinusSrcColorFactor;
        });
    }
}
