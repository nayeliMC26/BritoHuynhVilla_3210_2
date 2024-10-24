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

        // Getting a parrallel axis
        var axis = shape.position.clone();
        axis.x += THREE.MathUtils.randInt(7, 10) * Math.sign(Math.random() - 0.5);
        axis.y += THREE.MathUtils.randInt(7, 10) * Math.sign(Math.random() - 0.5);
        axis.z += THREE.MathUtils.randInt(7, 10) * Math.sign(Math.random() - 0.5);

        var object = {
            mesh: shape,
            // Which movement to apply
            isLinear: this.getRandomBoolean(),
            isOrbit: this.getRandomBoolean(),
            isRotation: this.getRandomBoolean(),
            isScale: this.getRandomBoolean(),
            // Common change in axis (used to change values at a constant rate for all movement)
            deltaX: (Math.random() - 0.5) * 5,
            deltaY: (Math.random() - 0.5) * 5,
            deltaZ: (Math.random() - 0.5) * 5,
            // Starting point of the scale on sin pattern (PI or 2Pi)
            deltaSX: Math.PI * Math.ceil(Math.random() * 2),
            deltaSY: Math.PI * Math.ceil(Math.random() * 2),
            deltaSZ: Math.PI * Math.ceil(Math.random() * 2),
            // Rotation direction + or -
            rotationX: Math.sign(Math.random() - 0.5),
            rotationY: Math.sign(Math.random() - 0.5),
            rotationZ: Math.sign(Math.random() - 0.5),
            // Axis that it will orbit around
            parallelAxis: axis,
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

    // Calls the functions to move the object if they apply
    animate(deltaTime) {
        this.objects.forEach((object) => {
            if (object.isLinear) {
                this.linear(object, deltaTime);
            }
            if (object.isOrbit) {
                this.orbit(object, deltaTime);
            }
            if (object.isRotation) {
                this.rotation(object, deltaTime);
            }
            if (object.isScale) {
                this.scale(object, deltaTime);
            }
        });
    }

    // Moves the object in a linear dirrection
    linear(object, deltaTime) {
        object.mesh.translateX(object.deltaX * deltaTime);
        object.mesh.translateY(object.deltaY * deltaTime);
        object.mesh.translateZ(object.deltaZ * deltaTime);
    }

    // Rotates the object in place
    rotation(object, deltaTime) {
        object.mesh.rotateX((object.rotationX * object.deltaX) * deltaTime);
        object.mesh.rotateY((object.rotationY * object.deltaY) * deltaTime);
        object.mesh.rotateZ((object.rotationZ * object.deltaZ) * deltaTime);
    }

    // Rotates the object on an axis
    orbit(object, deltaTime) {
        this.rotateAboutWorldAxis(object.mesh, object.parallelAxis, object.deltaX * deltaTime / 2);
    }

    // Changes the size of the object on the x, y, and z axis on a sin pattern
    scale(object, deltaTime) {
        // Make a copy of the object's original position
        var position = object.mesh.position.clone();
        // Moving object to origing for easier scaling
        object.mesh.position.copy(0, 0, 0);

        // Reverting object to the original size
        object.mesh.scale.set(1, 1, 1);

        // Getting new scale value
        object.deltaSX += object.deltaX * deltaTime;
        object.deltaSY += object.deltaY * deltaTime;
        object.deltaSZ += object.deltaZ * deltaTime;
        var scaleX = 1 + (Math.sin(object.deltaSX) / 2);
        var scaleY = 1 + (Math.sin(object.deltaSY) / 2);
        var scaleZ = 1 + (Math.sin(object.deltaSZ) / 2);

        // Applying new scale
        object.mesh.scale.set(scaleX, scaleY, scaleZ);

        // Moving object back to it's original position
        object.mesh.position.copy(position);
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

    // Course Example 6
    rotateAboutWorldAxis(object, axis, angle) {
        var rotationMatrix = new THREE.Matrix4();
        rotationMatrix.makeRotationAxis(axis.normalize(), angle);
        var currentPos = new THREE.Vector4(object.position.x, object.position.y, object.position.z, 1);
        var newPos = currentPos.applyMatrix4(rotationMatrix);
        object.position.x = newPos.x;
        object.position.y = newPos.y;
        object.position.z = newPos.z;
    }

    // Returns random True or False
    getRandomBoolean() {
        // return true (greater than or equal to 0.5) or false (less than 0.5)
        return Math.random() >= 0.5;
    }
}

