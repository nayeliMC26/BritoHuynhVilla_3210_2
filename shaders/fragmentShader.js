const fragment = /* glsl*/ `
// Variable passed from vertex shader
in vec3 fColor;

void main() {
    gl_FragColor = vec4(fColor, 1.0);
} 
`;
export default fragment