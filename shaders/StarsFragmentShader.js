// Code from https://github.com/mrdoob/three.js/blob/master/examples/webgl_buffergeometry_custom_attributes_particles.html

const fragment = /* glsl*/ `
// Variable to hold texture
uniform sampler2D pointTexture;

// Variable that recives color
varying vec3 vColor;

void main() {
    // Setting color to vertex color 
    gl_FragColor = vec4( vColor, 0.5 );

    // Applying texture to the point
    gl_FragColor = gl_FragColor * texture2D( pointTexture, gl_PointCoord );
} 
`;
export default fragment;