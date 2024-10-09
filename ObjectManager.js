import * as THREE from 'three';

export class ObjectManager {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.objects = [];
        this.objectsMax = 30;

        this.createObjectPool();

    }

    createObjectPool() {
        // for loop based on the limit of objects
        for (var i = 0; i < this.objectsMax; i++) {
            var randomObject = this.createRandomObject();
            this.objects.push(randomObject)
            this.scene.add(randomObject)
        }

    }
    // function to create random objects (takes random geometry as an input to create random objects)
    createRandomObject() {
        // for the geometry use the randomGeometries function
        var geometry = this.randomGeometries();
        // generate a random color for the material
        var material = new THREE.MeshBasicMaterial({ color: new THREE.Color(Math.random(), Math.random(), Math.random())});
        // create a new mesh using the random shape and color
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
            new THREE.SphereGeometry(3, 32, 32), // just some random params for the sake of showing how it works for now
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.OctahedronGeometry(4, 0),
            new THREE.IcosahedronGeometry(4, 0)
        ]
        /** for the length of the array of geometry types, pick a random number from there and return the number at that index 
         * this may have to be tweaked later but for now its fine 
        */
        return geometries[Math.floor(Math.random() * geometries.length)]
    }

}