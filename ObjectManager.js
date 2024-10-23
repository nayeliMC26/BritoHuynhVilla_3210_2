import * as THREE from 'three';
import vertexS from './shaders/vertexShader';
import fragmentS from './shaders/fragmentShader';

export class ObjectManager {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.objects = [];
        this.scaleFactors = [];
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
            randomObject.boundingBox = new THREE.Box3().setFromObject(randomObject.mesh);
            // add objects to the objectPool
            this.objects.push(randomObject);
            this.scaleFactors.push([1, 1, 1]);
            this.scene.add(randomObject.mesh);
        }
        //callthe random position function our list of objects
        this.randomPosition(this.objects)

    }
    // function to create random objects (takes random geometry as an input to create random objects)
    createRandomObject() {
        // for the geometry use the randomGeometries function
        var geometry = this.randomGeometries();
        var material = new THREE.MeshPhongMaterial({ color: 0xffffff * Math.random() });
        var shape = new THREE.Mesh(geometry, material);
        shape.castShadow = true; //default is false
        shape.receiveShadow = true; //default
        // wether to start bu increasing sacle or decreasing
        switch (Math.floor(Math.random() * 2)) {
            case 0:
                var scaleStart = 0; // Increasing
                break;
            case 1:
                var scaleStart = Math.PI; // Decreasing
                break;
        }
        var axis = shape.position.clone();
        axis.x += THREE.MathUtils.randInt(7, 10) * Math.sign(Math.random() - 0.5);
        axis.y += THREE.MathUtils.randInt(7, 10) * Math.sign(Math.random() - 0.5);
        axis.z += THREE.MathUtils.randInt(7, 10) * Math.sign(Math.random() - 0.5);

        var object = {
            mesh: shape,
            deltaX: (Math.random() - 0.5) * 5,
            deltaY: (Math.random() - 0.5) * 5,
            deltaZ: (Math.random() - 0.5) * 5,
            scaleOrigin: scaleStart,
            deltaSX: scaleStart,
            deltaSY: scaleStart,
            deltaSZ: scaleStart,
            // Rotation direction + or -
            rotationX: Math.sign(Math.random() - 0.5),
            rotationY: Math.sign(Math.random() - 0.5),
            rotationZ: Math.sign(Math.random() - 0.5),
            parallelAxis: axis,

        }
        return object
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
                var newPosition = new THREE.Vector3(THREE.MathUtils.randFloatSpread(200), THREE.MathUtils.randFloatSpread(200), THREE.MathUtils.randFloatSpread(200));
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

    animate(deltaTime){
        this.objects.forEach((object) => {
            this.linear(object, deltaTime);
        });
    }

    // Moves the shape in a linear direction
    linearDrifting(deltaTime) {
        // For all the objects in the object pool
        this.objects.forEach(function (object) {
            object.mesh.translateX(object.deltaX * deltaTime);
            object.mesh.translateY(object.deltaY * deltaTime);
            object.mesh.translateZ(object.deltaZ * deltaTime);
        });
    }

    linear(object, deltaTime) {
        object.mesh.translateX(object.deltaX * deltaTime);
        object.mesh.translateY(object.deltaY * deltaTime);
        object.mesh.translateZ(object.deltaZ * deltaTime);
    }

    rotation(object, deltaTime) {
        object.mesh.rotateX((object.rotationX * object.deltaX) * deltaTime);
        object.mesh.rotateY((object.rotationY * object.deltaY) * deltaTime);
        object.mesh.rotateZ((object.rotationZ * object.deltaZ) * deltaTime);
    }

    orbit(object, deltaTime) {
        this.rotateAboutWorldAxis(object.mesh, object.parallelAxis, object.deltaX * deltaTime / 2);
    }

    transformations(deltaTime) {
        this.objects.forEach(function (object) {
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
        });
    }

    rotate(deltaTime) {
        this.objects.forEach((object) => {
            object.mesh.rotateX((object.rotationX * object.deltaX) * deltaTime);
            object.mesh.rotateY((object.rotationY * object.deltaY) * deltaTime);
            object.mesh.rotateZ((object.rotationZ * object.deltaZ) * deltaTime);

            this.rotateAboutWorldAxis(object.mesh, object.parallelAxis, object.deltaX * deltaTime / 2);
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
}

