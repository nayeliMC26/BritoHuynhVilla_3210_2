import * as THREE from 'three';

/**
 * Handles all of the objects in space.
 */
export class ObjectManager {
    /**
     * Creates a scene and a camera.
     * @param {THREE.Scene} scene 
     * @param {THREE.Camera} camera 
     */
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.objects = [];
        this.scaleFactors = [];
        // number of objects that will get generated 
        this.objectsMax = 300;
        // call our createObjectPool function to create an objectPool 
        this.createObjectPool();
    }
    /**
     * A function that creates an object pool.
     */
    createObjectPool() {
        // for loop based on the limit of objects
        for (var i = 0; i < this.objectsMax; i++) {
            // create random meshes using random geometry and random material 
            var randomObject = this.createRandomObject();
            // create a bounding box to handle collisions
            randomObject.boundingBox = new THREE.Box3().setFromObject(randomObject.mesh);
            // add objects to the objectPool
            this.objects.push(randomObject);
            this.scaleFactors.push([1, 1, 1]);
            this.scene.add(randomObject.mesh);
        }
        //call the random position function our list of objects
        this.randomPosition(this.objects);

    }
    //  
    /**
     * A function to create random objects (takes random geometry as an input to create random objects)
     * @returns a random object
     */
    createRandomObject() {
        // for the geometry use the randomGeometries function
        var geometry = this.randomGeometries();
        var material = new THREE.MeshPhongMaterial({ color: 0xffffff * Math.random() });

        var shape = new THREE.Mesh(geometry, material);
        shape.castShadow = true; //default is false
        shape.receiveShadow = true; //default
        switch (Math.floor(Math.random() * 2)) {
            case 0:
                var scaleStart = 2 * Math.PI;
                break;
            case 1:
                var scaleStart = Math.PI;
                break;
        }
        var object = {
            mesh: shape,
            deltaX: (Math.random() - 0.5) * 5,
            deltaY: (Math.random() - 0.5) * 5,
            deltaZ: (Math.random() - 0.5) * 5,
            scaleOrigin: scaleStart,
            deltaSX: scaleStart,
            deltaSY: scaleStart,
            deltaSZ: scaleStart
        }
        return object;
    }

    /**
     * A function that returns a random geometry shape
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

            // Uniforms to pass to the fragment shader.
            var starUniforms = {
                fColor: { type: "v3", value: new THREE.Vector3(1.0, 1.0, 1.0) },
                delta: { value: 0 }
            }; // fColor: white color

            // Create a shader material for each star
            this.starMaterial = new THREE.ShaderMaterial(
                {
                    uniforms: starUniforms,
                    fragmentShader: document.getElementById('fragmentShader').textContent
                }
            );
            //var starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

            // Create a mesh by combining the geometry and material
            var star = new THREE.Mesh(starGeometry, this.starMaterial);

            // Set the position of the star randomly in 3D space
            star.position.set(x, y, z);

            // Add the star to the scene
            this.scene.add(star);
        }
    }

    /**
     * A function to "spawn" the objects with a random location without intersecting 
     * @param {Array} objects the list of objects that have been added
     */
    randomPosition(objects) {
        // for every object in the array of random objects made 
        for (var i = 0; i < objects.length; i++) {
            var object = objects[i];
            // start with the object not being relocated, so at 0,0,0
            var objectRelocated = false;
            while (!objectRelocated) {
                // create a new random position for them to move to 
                var newPosition = new THREE.Vector3(THREE.MathUtils.randFloatSpread(250), THREE.MathUtils.randFloatSpread(250), THREE.MathUtils.randFloatSpread(600));
                // move each object to its new position
                object.mesh.position.copy(newPosition);
                // create a boundingBox for each object 
                object.boundingBox.setFromObject(object.mesh);

                var collision = false;
                for (var j = 0; j < objects.length; j++) {
                    if (i !== j) {
                        // so long as two objects are not the same check if they are intersecting
                        if (object.boundingBox.intersectsBox(objects[j].boundingBox)) {
                            //     // if they intersect then they are colliding
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

    /**
     * 
     * @param {*} objects 
     */
    loopObjects(objects) {

        // for all objects in our objectPool
        for (var i = 0; i < objects.length; i++) {
            var object = objects[i];

            // if the object is within a certain distance from the camera send it back or forward by some amt
            if (Math.random() < 0.1) { // 20% chance to be  relocated
                // if the position of the object is within 200 units behind the camera
                if (object.mesh.position.z > this.camera.position.z + 200) {
                    // move the objects back by a number between 500 and 1000
                    object.mesh.position.z += (this.camera.position.z - THREE.MathUtils.randInt(500, 1000));


                }
            }
        }
    }

    /**
     * Generates random uniform values.
     * @returns a random uniform value
     */
    randomUniforms() {
        var uniform = {
            // The difference in coordinates
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
    
    /**
     * Moves the shape in a linear direction
     * @param {*} deltaTime 
     */
    drifting(deltaTime) {
        // For all the objects in the object pool
        this.objects.forEach(function (object) {
            object.mesh.translateX(object.deltaX * deltaTime);
            object.mesh.translateY(object.deltaY * deltaTime);
            object.mesh.translateZ(object.deltaZ * deltaTime);
        });

    }


    transformations(deltaTime) {
        this.objects.forEach(function (object) {
            // The scale factor that was applied to the object 
            var scaleFactor = object.mesh.scale;
            // Make a copy of the object's original position
            var position = new THREE.Vector3().copy(object.mesh.position)
            // Moving object to origing for easier scaling
            object.mesh.position.copy(new THREE.Vector3(0, 0, 0));

            // Making scaler matrix
            var matrix = new THREE.Matrix4();
            // Reverting object to the original size
            matrix.makeScale(1 / scaleFactor.x, 1 / scaleFactor.y, 1 / scaleFactor.z);
            object.mesh.applyMatrix4(matrix);

            // Getting new scale value
            object.deltaSX += object.deltaX * deltaTime;
            object.deltaSY += object.deltaY * deltaTime;
            object.deltaSX += object.deltaX * deltaTime;
            var scaleX = 1 + (Math.sin(object.deltaSX) / 2);
            var scaleY = 1 + (Math.sin(object.deltaSY) / 2);
            var scaleZ = 1 + (Math.sin(object.deltaSZ) / 2);

            // Applying new scale
            matrix.makeScale(scaleX, scaleY, scaleZ);
            object.mesh.applyMatrix4(matrix);

            // Moving object back to it's original position
            object.mesh.position.copy(position);
        });
    }


    /** Add blending for the objects */
    blend() {
        this.objects.forEach(function (object) {
            object.mesh.material.blending = THREE.CustomBlending;
            object.mesh.material.blendEquation = THREE.AddEquation; //default 
            object.mesh.material.blendSrc = THREE.SrcColorFactor;
            object.mesh.material.blendDst = THREE.OneMinusSrcColorFactor;
        });
    }
}

