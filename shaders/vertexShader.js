const vertex = /* glsl */ `
uniform float deltaX;
uniform float deltaY;
uniform float deltaZ;
uniform float directionX;
uniform float directionY;
uniform float directionZ;
uniform vec3 color;

// Variable that will be passed to the fragment shader
out vec3 fColor;

void main() {
    fColor = color;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x + deltaX, position.y + deltaY, position.z + deltaZ, 1.0); 
}
`;
export default vertex;