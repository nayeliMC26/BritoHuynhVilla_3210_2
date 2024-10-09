import * as THREE from 'three';

export class ObjectManager{
    constructor(scene, camera){
        this.scene = scene;
        this.camera = camera;
        this.objects = []
        this.objectsMax = 200

    }

    // function to create random objects (takes random geometry as an input to create random objects)
    createObjects(){

    }

    // function which is just a list of geometries and randomly returns a geometry 
    /**
     * @returns Random geometry
     */
    randomGeometries(){
        var geometries = [
           new THREE.SphereGeometry(5,32,32), // just some random params for the sake of showing how it works for now
           new THREE.BoxGeometry(1,1,1),
           new THREE.OctahedronGeometry(3,0),
           new THREE.IcosahedronGeometry(3,0)
        ]
        /** for the length of the array of geometry types, pick a random number from there and return the number at that index 
         * this may have to be tweaked later but for now its fine 
        */
        return geometries[Math.floor(Math.random() * geometries.length)]
    }

}