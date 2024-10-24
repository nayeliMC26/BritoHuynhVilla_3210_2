// Code from https://github.com/mrdoob/three.js/blob/master/examples/webgl_buffergeometry_custom_attributes_particles.html

const vertex = /* glsl */ `
// Size of the vertex
attribute float size;

// Variable to pass color to fragment shader
varying vec3 vColor;

void main() {
    // Passing color of the vertex to the fragment shader
    vColor = color;

    // Changing position from local space to camera space
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

    // Setting size of point base on the distance from the camera
    gl_PointSize = size * ( 300.0 / -mvPosition.z );

    // Changing position from camera space to clip space
    gl_Position = projectionMatrix * mvPosition;
}
`;
export default vertex;