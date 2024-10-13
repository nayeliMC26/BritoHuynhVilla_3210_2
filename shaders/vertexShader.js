const vertex = /* glsl */ `
uniform float directionX;
uniform float directionY;
uniform float directionZ;
uniform float deltaX;
uniform float deltaY;
uniform float deltaZ;
out vec3 color;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x + directionX, position.y + directionY, position.z + directionZ, 1.0); 
}
`;
export default vertex;