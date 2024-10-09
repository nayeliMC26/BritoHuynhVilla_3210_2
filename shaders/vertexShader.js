const vertex = /* glsl */ `
uniform float delta;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x + delta, position.y, position.z, 1.0); 
}
`;
export default vertex;